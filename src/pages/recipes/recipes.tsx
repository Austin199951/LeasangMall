import Taro, { Component, Config, getStorageSync, showToast, showLoading, hideLoading } from '@tarojs/taro'
import { View, Text,Input,Image} from '@tarojs/components'
import './recipes.scss'
import dialog from '../../utils/dialog'
import navigate from '../../utils/navigate'
import fansModel from '../../models/fansModel'
import recipesModel from '../../models/recipesModel'
import endorseModel from "../../models/endorseModel";
import commentsModel from "../../models/commentsModel";
import enshrineModel from "../../models/enshrineModel";

export default class Recipes extends Component {
    config: Config = {
        navigationBarTitleText: '食谱'
    }
    constructor() {
        super()
        this.state = {
            recipesList:{},// 食谱列表
            reply_show:false,
            reply_box:'',//回复框
            whom:'',
            discussType:'',// 评论类型
            userId:'',//被回复用户的ID
            commentId:'',//回复的评论主键ID
            delRecipes:false,
            pageNumber:1,
            commentList:[],// 评论列表
            fol:false,
        }
    }

    componentDidShow () {
        this.getFollow();
        this.getRecipeDetail();
        this.getCommentList(1);// 获取评论列表
    }

    onPageScroll(){
        this.setState({reply_show:false, discussType:''})
    }

    // 获取是否关注
    async getFollow(){
        let userId:number = Number(this.$router.params.userId);
        try {
            let res = await fansModel.isAttention(userId);
            this.setState({fol: res});
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 关注
    async follow() {
        let fol:boolean = this.state.fol;
        let userId:number = Number(this.$router.params.userId);
        try {
            if(fol == false){
                await fansModel.follow(userId);
                this.setState({fol:true});
            } else {
                await fansModel.cancelFollow(userId);
                this.setState({fol:false});
            }
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 创建 评论
    createComment = (res) => {
        let userId:number = res.currentTarget.dataset.userid;
        let commentId:number = res.currentTarget.dataset.commentid;
        this.setState({reply_show:true, commentId, userId, whom:'评论', discussType:'createComment'});
    }

    // 点赞
    async endorse(res){
        let recipeId:number = Number(this.$router.params.recipeId);
        let recipesList:object = this.state.recipesList;

        try {
            if(recipesList.isEndorse){
                endorseModel.cancelEndorse(recipeId, 2);
                recipesList.isEndorse = false;
                recipesList.endorseCount --;
            } else {
                await endorseModel.endorse(recipeId, 2);
                recipesList.isEndorse = true;
                recipesList.endorseCount ++;
            }
        } catch (e) {
            dialog.handleError(e)
        }
        this.setState({ recipesList });
    }

    // 获取食谱详情
    async getRecipeDetail(){
        showLoading({title:'loading...'});
        let recipeId:string = this.$router.params.recipeId;
        let userId = getStorageSync('userId');
        let delRecipes:boolean = this.state.delRecipes;

        try {
            let res = await recipesModel.getRecipeDetail(recipeId);
            let userid = res.userId;
            if(userId == userid){
                delRecipes = true;
            } else {
                delRecipes = false;
            }
            this.setState({recipesList:res, delRecipes });
            hideLoading();
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 获取评论列表
    getCommentList = async (pageNumber) => {
        let recipeId:number = Number(this.$router.params.recipeId);

        try {
            let res = await commentsModel.getCommentList(recipeId, 2, pageNumber);
            this.setState({ commentList: res });
        } catch (e) {
            dialog.handleError(e);
        }
    }


    // 去评论
    goDiscuss = () => {
        this.setState({reply_show:true, discussType:'discuss', whom:'评论'});
    }

    // 输入回复框
    reply = (res) => {
        this.setState({reply_box:res.detail.value});
    }

    // 发送评论消息
    sends = async (res) => {
        let recipeId:number = Number(this.$router.params.recipeId);
        let contents:string = this.state.reply_box;
        let discussType:string = this.state.discussType;
        let pageNumber:number = this.state.pageNumber;
        let userId:number = this.state.userId;
        let commentId:number = this.state.commentId;


        try {
            if(discussType == 'discuss'){
                await commentsModel.createCommnent(recipeId, 2,contents, 0, Array);
            } else if(discussType == 'createComment'){
                await commentsModel.createCommentReply(userId,commentId,contents);
            }
        } catch (e) {
            dialog.handleError(e)
        }
        this.setState({reply_show:false, reply_box:''});
        this.getCommentList(pageNumber);
    }

    // 收藏
    async enshrine(){
        let recipeId:string = this.$router.params.recipeId;
        let recipesList:object = this.state.recipesList;


        try {
            if(recipesList.isEnshrine){
                await enshrineModel.recipeCancelEnshrine(recipeId, 2);
                recipesList.isEnshrine = false;
            } else {
                await enshrineModel.recipeEnshrine(recipeId, 2);
                recipesList.isEnshrine = true;
            }

            this.setState({ recipesList });
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 回复评论
    replyComments = (res) => {
        let toName:string = res.currentTarget.dataset.toname;
        let userId:number = res.currentTarget.dataset.userid;
        let commentId:number = res.currentTarget.dataset.commentid;
        this.setState({commentId, userId, whom:'回复'+toName, discussType:'createComment', reply_show:true});
    }


    // 删除评论
    async del(res){
        let commentId:number = res.currentTarget.dataset.commentid;
        let pageNumber:number = this.state.pageNumber;

        try {
            await commentsModel.deleteCommnent(commentId);
            this.getCommentList(pageNumber);
        } catch (e) {
            dialog.handleError(e);
        }
    }

    // 删除食谱
    async delRecipes(){
        let recipeId:string = this.$router.params.recipeId;

        try {
            let res = await recipesModel.delRrecipe(recipeId);
            showToast({title:'删除成功', icon:'none'});
            navigate.back();
        } catch (e) {
            dialog.handleError(e);
        }
    }

    viewInfo = (res) => {
        let userId:number = Number(res.currentTarget.dataset.userid);
        let userid = getStorageSync('userId');

        if(userid == userId){
            navigate.switchTab(`../collarFossa/index`);
        } else {
            navigate.go(`../othersInfo/othersInfo?userId=${userId}`);
        }
    }

    render () {
        let recipesList = this.state.recipesList;
        return (
            <View>
                <View className={'bg_white'}>
                    <Image mode={'aspectFill'} className={'w100'} src={recipesList.coverImage}></Image>
                    <Text className={'recipes_name w93 on_show border_btm font_size40'}>{recipesList.recipeTitle}</Text>
                    <View className={'w93 margin_top30 flex_space_bet'}>
                        <View className={'color_333 flex_start_center'}>
                            <View className={'portrait overflow margin_right25'} onClick={this.viewInfo} data-userid={recipesList.userId}>
                                <Image className={'w100 h100'} mode={'aspectFill'} src={recipesList.portrait}></Image>
                            </View>
                            <Text className={'author'}>{recipesList.name}</Text>
                        </View>
                        <View className={'text_center'+' '+(this.state.fol ? 'follow_cur color_999':'follow')} onClick={this.follow}>
                            {this.state.fol?'已关注':'+关注'}
                        </View>
                    </View>
                    <View className={'w93 recipes_desc color_333 font_size34'}>
                        {recipesList.recipeDescribe}
                    </View>

                    {/*食材用料*/}
                    <View className={'w93'}>
                        <Text className={'material_tit'}>食材用料</Text>
                        <View className={'margin_top30'}>
                        {
                            recipesList.recipeMaterialsList.map((item,index)=>{
                                return <View key={index} className={'material font_size34'}>
                                            <View className={'pub_list border_btm flex_space_bet'}>
                                                <Text className={'ellipsis1'}>{item.materialsName}</Text>
                                                <Text className={'ellipsis1'}>{item.quantity}</Text>
                                            </View>
                                        </View>
                            })
                        }
                        </View>
                    </View>

                    {/*步骤*/}
                    {
                        recipesList.recipeStepList.map((item,index)=>{
                            return  <View key={index} className={'w93 border_btm step'}>
                                        <Text className={'font_size34 material_tit'}>步骤{index+1}</Text>
                                        <View className={'margin_top30'}>
                                            <Image mode={'aspectFill'} className={'w100'} src={item.imageUrl}></Image>
                                            <View className={'step_desc'}>{item.contents}</View>
                                        </View>
                                    </View>
                        })
                    }

                    {/*小贴士*/}
                    <View className={'w93 color_333'}>
                        <View className={'font_size34 material_tit tips'}>小贴士</View>
                        <View className={'notes font_size30'}>
                            {recipesList.tips}
                            {recipesList.tips == '' ? '暂无小贴士信息':''}
                        </View>

                        {this.state.delRecipes ? (
                            <View className={'color_red'} style={'padding:30rpx 0;'} onClick={this.delRecipes}>删除</View>
                        ): ''}
                    </View>
                </View>

                {/*评论*/}
                <View className={'margin_top20 bg_white margin_btm88'}>
                    <View className={'w93'}>
                        <View className={'font_size34 material_tit comment_tit'}>评论</View>
                        <View className={'flex_spacea_round bg_white num_readers font_size26'}>
                            <View className={'flex_center'} onClick={this.endorse}>
                                {
                                    recipesList.isEndorse ? (
                                        <Image mode={'aspectFill'} src={require('../../images/fabulous_cur.png')}></Image>
                                    ):(
                                        <Image mode={'aspectFill'} src={require('../../images/fabulous.png')}></Image>
                                    )
                                }
                                {recipesList.endorseCount}
                            </View>
                            <View className={'flex_center'} onClick={this.goDiscuss}>
                                <Image mode={'aspectFill'} src={require('../../images/discuss.png')}></Image>
                                {this.state.commentList.length}
                            </View>
                        </View>

                        {
                            this.state.commentList.length == 0 ? (
                                <View className={'font_size30'} style={'padding:40rpx 0;'}>
                                    暂无评论
                                </View>
                            ):''
                        }
                        {
                            this.state.commentList.map((item,index)=>{
                                return  <View key={index} className={'say_list margin_top30'}>
                                            <View className={'flex_start'}>
                                                <View className={'portrait overflow'} onClick={this.viewInfo} data-userid={item.userId}>
                                                    <Image mode={'aspectFill'} className={'w100 h100'} src={item.portrait}></Image>
                                                </View>
                                                <View className={'w80'}>
                                                    <View className={'author font_size22'}>
                                                        <Text className={'on_show font_size26'}>{item.name}</Text>
                                                        {item.createDate}
                                                    </View>
                                                    <Text onClick={this.createComment} data-userid={item.userId} data-commentid={item.commentId} className={'clear_text on_show font_size30'}>{item.contents}</Text>
                                                    <View className={'recovery_box font_size26'}>
                                                        {
                                                            item.commentReplyList.map((i,key)=>{
                                                                return <View data-userid={item.userId} data-commentid={item.commentId} data-toname={i.toName} onClick={this.replyComments} key={key}>{i.fromName}<Text className={'color_bule'}>回复</Text>{i.toName}：<Text className={'color_999'}>{i.contents}</Text></View>
                                                            })
                                                        }
                                                    </View>

                                                    {
                                                        item.is_del ? (
                                                            <View data-commentid={item.commentId} className={'margin_top30 font_size22 color_bule'} onClick={this.del}>删除</View>
                                                        ):''
                                                    }
                                                </View>
                                            </View>
                                        </View>
                            })
                        }
                    </View>
                </View>
                <View onClick={this.enshrine} className={'bg_white flex_center position_fix w100 w100 submit_btn'} style={'bottom:0rpx;'}>
                    <Image mode={'aspectFill'} className={'enshrine'} src={recipesList.isEnshrine ? require('../../images/enshrine_cur.png'):require('../../images/enshrine.png')}></Image>{recipesList.isEnshrine ? '已收藏': '收藏'}
                </View>

                {/*评论框*/}
                <View className={'w100 position_fix reply_box bg_white font_size28'+' '+ (this.state.reply_show ? 'on_show': 'on_hide')}>
                    <View className={'w93 flex_space_bet'}>
                        <Input focus={this.state.reply_show ? true : false} onInput={this.reply} placeholder={this.state.whom} value={this.state.reply_box}/>
                        <View className={'send text_center'+' '+(this.state.reply_box != '' ? 'send_cur':'send_event')} onClick={this.sends}>发送</View>
                    </View>
                </View>
            </View>
        )
    }
}
