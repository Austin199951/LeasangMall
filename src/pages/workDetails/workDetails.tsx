import Taro, { Component, Config, setStorageSync, getStorageSync, previewImage, showLoading, hideLoading } from '@tarojs/taro'
import { View, Text,Input,Image} from '@tarojs/components'
import './workDetails.scss'
import dialog from '../../utils/dialog'
import shareModel from '../../models/shareModel'
import fansModel from '../../models/fansModel'
import Utils from '../../utils/util'
import navigate from "../../utils/navigate";
import commentsModel from '../../models/commentsModel'
import endorseModel from "../../models/endorseModel";


export default class WorkDetails extends Component {
    config: Config = {
        navigationBarTitleText: '作品详情'
    }
    constructor() {
        super()
        this.state = {
            fol:false,// 关注
            whom:'',//回复谁
            reply_box:'',//回复框
            reply_show:false,//回复展示隐藏
            detailList:{},// 详情列表
            discussType:'',// 评论类型
            userId:0,//
            commentId:'',//
            isDel:false,
            pageNumber:1,
            commentList:[],// 评论列表
            commentReplyList:[],// 回复评论列表
        }
    }
    onPageScroll(res){
        this.setState({reply_show:false})
    }

    componentDidShow () {
        this.setState({isDel: this.$router.params.isDel});
        this.getDetailList();// 获取详情列表
        this.getFollow();// 获取是否关注
        this.getCommentList(1);// 获取评论列表
    }

    // 获取详情列表
    async getDetailList() {
        showLoading({title:'loading...'});
        let shareId:number = Number(this.$router.params.shareId);

        try {
            let res = await shareModel.getDetailList(shareId);
            res.img = JSON.parse(res.img);

            // 计算作品发布时间
            let day=parseInt(res.intDiff/60/24);
            let hour=parseInt(res.intDiff/60%24);
            let min= parseInt(res.intDiff % 60);
            res.intDiff = Utils.computingTime(day,hour,min);

            this.setState({detailList: res});
            hideLoading();
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 获取评论列表
    getCommentList = async (pageNumber) => {
        let shareId:number = Number(this.$router.params.shareId);

        try {
            let res = await commentsModel.getCommentList(shareId, 1, pageNumber);
            this.setState({ commentList:res });
        } catch (e) {
            dialog.handleError(e);
        }
    }

    // 获取用户是否关注
    async getFollow(){
        let userId:number =Number(this.$router.params.userId);

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
        let userId:number =Number(this.$router.params.userId);
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

    // 点赞
    async endorse(res){
        let shareId:number = res.currentTarget.dataset.shareid;
        let detailList:object = this.state.detailList;

        try {
            if(detailList.isEndorse){
                await endorseModel.cancelEndorse(shareId, 1);
            } else {
                await endorseModel.endorse(shareId,1);
            }
        } catch (e) {
            dialog.handleError(e);
        }
        this.getDetailList();
    }

    // 发送
    async sends(res){
        let discussType:string = this.state.discussType;
        let contents:string = this.state.reply_box;
        let shareId:number = res.currentTarget.dataset.shareid;
        let pageNumber:number = this.state.pageNumber;
        let userId:number = this.state.userId;
        let commentId:number = this.state.commentId;

        try {
            if(discussType == 'discuss'){
                await commentsModel.createCommnent(shareId,1, contents, 0, Array);
            } else if(discussType == 'createComment') {
                await commentsModel.createCommentReply(userId,commentId,contents);
            }
        } catch (e) {
            dialog.handleError(e);
        }
        this.getCommentList(pageNumber);
        this.setState({ reply_show:false });
    }


    // 输入回复框
    reply = (res) => {
        this.setState({reply_box:res.detail.value})
    }

    // 选择回复
    recovery = (res) => {
        let toName = res.currentTarget.dataset.toname;
        let userId:number = res.currentTarget.dataset.userid;
        let commentId:number = res.currentTarget.dataset.commentid;

        this.setState({commentId, userId, reply_box:'', whom:'回复'+toName, discussType:'createComment', reply_show:true})
    }

    // 去评论
    goDiscuss = () => {
        this.setState({reply_show:true, whom:'评论', reply_box:'', discussType:'discuss'});
    }

    // 创建评论
    createComment = (res) => {
        let userId:number = res.currentTarget.dataset.userid;
        let commentId:number = res.currentTarget.dataset.commentid;

        this.setState({reply_show:true, whom:'评论', userId, commentId, reply_box:'', discussType:'createComment'});
    }

    // 删除评论
    async delComment(res){
        let commentId:number = res.currentTarget.dataset.commentid;
        let pageNumber:number = this.state.pageNumber;

        try {
            await commentsModel.deleteCommnent(commentId);
            this.getCommentList(pageNumber);
        } catch (e) {
           dialog.handleError(e)
        }
    }

    // 查看图片
    consultPictures = (res) => {
        let img = res.currentTarget.dataset.img;
        let detailList:object = this.state.detailList;
        let arr:Array = [];

        detailList.img.map((item, index) =>{
            arr.push(item);
        });
        previewImage({
            current:img,
            urls:arr
        })
    }

    // 删除说说
    async del() {
        let shareId: number = this.$router.params.shareId;
        try {
            await shareModel.delete(shareId);
            navigate.back();
        } catch (e) {
            dialog.handleError(e)
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
        let detailList = this.state.detailList;
        return (
            <View>
                <View className={'bg_white'} style={'padding-bottom:30rpx;'}>
                    <View className={'w93'}>
                        <View className={'say_list'}>
                            <View className={'flex_start'}>
                                <View className={'portrait overflow'} onClick={this.viewInfo} data-userid={detailList.userId}>
                                    <Image mode={'aspectFill'} className={'w100 h100'} src={detailList.portrait}></Image>
                                </View>
                                <View className={'w80 flex_space_bet'}>
                                    <View className={'author font_size22'}>
                                        <Text className={'on_show font_size26'}>{detailList.name}</Text>
                                        {detailList.intDiff}
                                    </View>
                                    {
                                        this.state.fol ? (
                                            <View onClick={this.follow} className={'follow_cur color_999 text_center'}>已关注</View>
                                        ):(
                                            <View onClick={this.follow} className={'follow text_center'}>+关注</View>
                                        )
                                    }
                                </View>
                            </View>
                        </View>
                        <View className={'color_333 clear_text'}>{detailList.contents}</View>
                        {
                            detailList.img.map((item,index)=>{
                                return <Image key={index} mode={'aspectFill'} data-img={item} onClick={this.consultPictures} className={'w100'} src={item}></Image>
                            })
                        }

                        {this.state.isDel == 'true' ? (
                            <View className={'margin_top30 color_red font_size28'} onClick={this.del}>删除</View>
                        ) : ''}
                    </View>
                </View>

                {/*评论*/}
                <View className={'bg_white margin_top20 margin_btm88'}>
                <View className={'w93'}>
                    <View className={'say_list'}>
                        <View className={'font_size26 comments_num color_999'}>{this.state.commentList.length} 条评论</View>
                        {
                            this.state.commentList.length == 0 ? (
                                <View className={'font_size24'}>
                                    暂无评论
                                </View>
                            ):''
                        }
                        {
                            this.state.commentList.map((item,index)=>{
                                return  <View key={index} className={'flex_start border_btm margin_top20'} style={'padding-bottom:30rpx;'}>
                                            <View className={'portrait overflow'} onClick={this.viewInfo} data-userid={item.userId}>
                                                <Image mode={'aspectFill'} className={'w100 h100'} src={item.portrait}></Image>
                                            </View>
                                            <View className={'w80'}>
                                                <View className={'author font_size22'}>
                                                    <Text className={'on_show font_size26'}>{item.name}</Text>
                                                    {item.createDate}
                                                </View>
                                                <Text data-userid={item.userId} data-commentid={item.commentId} onClick={this.createComment} className={'clear_text on_show font_size30'} style={'margin:0rpx;'}>{item.contents}</Text>
                                                <View className={'recovery_box font_size26'}>
                                                    {
                                                        item.commentReplyList.map((i,key)=>{
                                                            return <View data-userid={item.userId} data-commentid={item.commentId} data-toname={i.toName} onClick={this.recovery} key={key}>{i.fromName}<Text className={'color_bule'}>回复</Text>{i.toName}：<Text className={'color_999'}>{i.contents}</Text></View>
                                                        })
                                                    }
                                                </View>

                                                {
                                                    item.is_del ? (
                                                        <View data-commentid={item.commentId} className={'margin_top30 font_size22 color_bule'} onClick={this.delComment}>删除</View>
                                                    ):''
                                                }
                                            </View>
                                        </View>
                            })
                        }
                    </View>
                </View>
            </View>

                <View className={'flex_spacea_round bg_white position_fix w100 num_readers font_size22'}>
                    <View className={'flex_center'} onClick={this.endorse} data-shareid={detailList.shareId}>
                        {
                            detailList.isEndorse ? (
                                <Image mode={'aspectFill'} src={require('../../images/fabulous_cur.png')}></Image>
                            ):(
                                <Image mode={'aspectFill'} src={require('../../images/fabulous.png')}></Image>
                            )
                        }
                        {detailList.endorseCount}
                    </View>
                    <View className={'flex_center'} onClick={this.goDiscuss}>
                        <Image mode={'aspectFill'} src={require('../../images/discuss.png')}></Image>
                        {this.state.commentList.length}
                    </View>
                    {/*<View className={'flex_center'}>
                        <Image mode={'aspectFill'} src={require('../../images/share.png')}></Image>分享
                    </View>*/}
                </View>


                {/*评论框*/}
                <View className={'w100 position_fix reply_box bg_white font_size28'+' '+ (this.state.reply_show ? 'on_show': 'on_hide')}>
                    <View className={'w93 flex_space_bet'}>
                        <Input focus={this.state.reply_show?true:false} onInput={this.reply} placeholder={this.state.whom} value={this.state.reply_box}/>
                        <View data-shareid={detailList.shareId} className={'send text_center'+' '+(this.state.reply_box != '' ? 'send_cur':'send_event')} onClick={this.sends}>发送</View>
                    </View>
                </View>
            </View>
        )
    }
}
