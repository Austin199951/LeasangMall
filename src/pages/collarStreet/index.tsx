import Taro, { Component, Config, getStorageSync, previewImage, showLoading, hideLoading, stopPullDownRefresh } from '@tarojs/taro'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import './index.scss'
import Utils from '../../utils/util'
import navigate from '../../utils/navigate'
import dialog from '../../utils/dialog'
import shareModel from '../../models/shareModel'
import recipesModel from '../../models/recipesModel'
import endorseModel from "../../models/endorseModel";


export default class Index extends Component {
    config: Config = {
        navigationBarTitleText: '领街',
        onReachBottomDistance:'100'
    }
    constructor() {
        super();
        //TODO: 对比一下
        this.state = {
            segments: [{key:'say', title: '说说'}, {key: 'recipe', title: '食谱'}, {key: 'okami', title: '大神'}],
            segmentCurrent: 0, //选中的列表
            recipeList: [], //食谱列表
            sayList: [], //说说列表
            okamiList:[],//大神列表
            recipeRow: 0,// 食谱总条数
            sayRow: 0,// 说说总条数
            okamiRow:0,//大神作品总条数
            page: 1,//页码
        }
    }
    componentDidShow() {
        let arrayList:Array = [];
        let page:number = this.state.page;
        this.getSayList(page, arrayList);// 获取说说列表
        this.getRecipeTypeList(page,arrayList);// 获取食谱分类列表
        this.getOkamiList(page, arrayList);
    }

    //头部导航切换
    clickSegment = (res) => {
        let segmentCurrent = res.currentTarget.dataset.num;
        this.setState({segmentCurrent, page:1})
    }

    // 赞
    async endorse(res) {
        let shareId: number = res.currentTarget.dataset.shareid;
        let index: number = res.currentTarget.dataset.index;
        let sayList:Array = this.state.sayList;
        try {
            if(sayList[index].isEndorse == false){
                await endorseModel.endorse(shareId,1);
                sayList[index].isEndorse = true;
                sayList[index].endorseCount++;
                this.setState({ sayList });
            } else {
                await endorseModel.cancelEndorse(shareId,1);
                sayList[index].isEndorse = false;
                sayList[index].endorseCount--;
                this.setState({ sayList });
            }
        } catch (e) {
            dialog.handleError(e)
        }

        this.readFn(shareId, index);
        res.stopPropagation();
    }

    // 去上传作品
    goUpload = () => {
        navigate.go('../publish/publish')
    }


    // 获取说说列表
    async getSayList(pageIndex, sayList) {
        try {
            let res = await shareModel.getSayList(pageIndex);
            sayList = sayList.concat(res.data);
            this.setState({ sayRow: res.totalItemCount, sayList });
        } catch (e) {
            dialog.handleError(e)
        }
    }


    // 查看说说图片
    previewImg = (res) => {
        let img: string = res.currentTarget.dataset.img;
        let index: number = res.currentTarget.dataset.index;
        let shareId: number = res.currentTarget.dataset.shareid;
        let say_list = this.state.sayList;
        let imgArr = [];

        say_list.map((item, key) => {
            if (index == key) {
                imgArr = item.img
            }
        });

        previewImage({
            current: img,
            urls: imgArr
        });

        console.log(imgArr);
        this.readFn(shareId, index);

        res.stopPropagation();
    }

    // 去详情
    goWorkDetail = (res) => {
        let shareId: number = res.currentTarget.dataset.shareid;
        let userId: number = res.currentTarget.dataset.userid;
        let index: number = res.currentTarget.dataset.index;
        let isDel:boolean = res.currentTarget.dataset.isdel;

        navigate.go(`../workDetails/workDetails?shareId=${shareId}&isDel=${isDel}&userId=${userId}`);
        this.readFn(shareId, index);
    }

    discuss = (res) => {
        let shareId: number = res.currentTarget.dataset.shareid;
        let index: number = res.currentTarget.dataset.index;
        navigate.go(`../comment/comment?shareId=${shareId}`);
        this.readFn(shareId, index);
        res.stopPropagation();
    }


    // 获取食谱分类列表
    async getRecipeTypeList(pageIndex, recipeList) {
        try {
            let res = await recipesModel.getRecipeTypeList(pageIndex);
            recipeList = recipeList.concat(res.data);
            this.setState({recipeRow: res.totalItemCount, recipeList });
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 查看食谱详情
    goRecipeDetail = (res) => {
        let recipeId:number = res.currentTarget.dataset.recipeid;
        let userId:number = res.currentTarget.dataset.userid;
        navigate.go(`../recipes/recipes?recipeId=${recipeId}&userId=${userId}`);
    }

    // 去创建食谱
    goCreateRecipe = () => {
        navigate.go(`../createRecipes/createRecipes?recipeType=${'new'}`);
    }


    // 查看个人信息
    viewInfo = (res) => {
        let userId = res.currentTarget.dataset.userid;
        let userid = getStorageSync('userId');
        if(userid == userId){
            navigate.switchTab(`../collarFossa/index`);
        } else {
            navigate.go(`../othersInfo/othersInfo?userId=${userId}`);
        }
        res.stopPropagation();
    }

    onReachBottom() {
        let page: number = this.state.page;
        let sayRow: number = Math.ceil(this.state.sayRow / 10);
        let segmentCurrent:number = this.state.segmentCurrent;
        let recipeRow: number = Math.ceil(this.state.recipeRow / 10);
        let okamiRow: number = Math.ceil(this.state.okamiRow / 10);
        let sayList:Array = this.state.sayList;
        let recipeList:Array = this.state.recipeList;
        let okamiList:Array = this.state.okamiList;

        if (page < sayRow) {
            page ++;
            this.getSayList(page, sayList);// 获取说说列表
        }
        if (page < recipeRow) {
            page++;
            this.getRecipeTypeList(page, recipeList);
        }
        if (page < okamiRow) {
            page++;
            this.getOkamiList(page, okamiList);// 获取说说列表
        }
        this.setState({ page,sayList });
    }

    // 阅读说说
    async readFn(shareId, index){
        let sayList:Array = this.state.sayList;

        try {
            let res = await shareModel.read(shareId);
            sayList[index].readCount++;
            this.setState({sayList});
        } catch (e) {
            dialog.handleError(e);
        }
    }


    // 获取大神列表
    async getOkamiList(pageIndex, okamiList){
        try {
            let res = await recipesModel.getOkamiList(pageIndex);
            okamiList = okamiList.concat(res.data);
            this.setState({okamiRow:res.totalItemCount, okamiList});
        } catch (e) {
            dialog.handleError(e);
        }
    }

    render() {
        let {
            segmentCurrent,
            sayList,
            recipeList,
            okamiList,
        } = this.state

        let listData = segmentCurrent === 0 ? sayList: ( segmentCurrent === 1 ? recipeList : okamiList);
        
        return (
            <View>
                <View className={'flex_spacea_round collar_street_header position_fix w100 bg_white font_size28'}>
                    {
                        this.state.segments.map((item, index)=>(
                            <View 
                                key={item.key} 
                                className={this.state.segmentCurrent === index? 'current' : '' + 'text_center'} 
                                onClick={this.clickSegment} 
                                data-num={index}>
                                {item.title}
                                <View></View>
                            </View>
                        ))
                    }        
                </View>

                {
                    listData.length === 0 ?
                        (<View className={'text_center color_999 no_time'}>{segmentCurrent === 0 ? '暂无说说': (segmentCurrent === 1 ? '暂无食谱' : '暂无大神作品')}</View>) :null
                }

                <View className={'position_re'} style={'top:70rpx;'}>
                    {/*说说*/}

                        {
                            listData.map((item, index) => {
                                return  segmentCurrent === 0 ?
                                (//说说
                                <View key={index} className={'say_list'} data-isdel={item.is_del} data-index={index} data-shareid={item.shareId} data-userid={item.userId} onClick={this.goWorkDetail}>
                                    <View className={'w93 flex_start'}>
                                        <View className={'portrait overflow'} onClick={this.viewInfo} data-userid={item.userId}>
                                            <Image mode={'aspectFill'} className={'w100 h100'} src={item.portrait}></Image>
                                        </View>
                                        <View className={'w80'}>
                                            <View className={'author font_size22'}>
                                                <Text className={'on_show font_size26'}>{item.name}</Text>
                                                {item.intDiff}
                                            </View>
                                            <Text className={'clear_text on_show'}>{item.contents}</Text>

                                            <View className={'illustrations flex_start_center w100'}>
                                                {
                                                    item.img.map((img, key) => {
                                                        return <View data-index={index} data-shareid={item.shareId} key={key} data-img={img} onClick={this.previewImg}>
                                                                    <Image mode={'aspectFill'} className={'w100 h100'} src={img}></Image>
                                                                </View>
                                                    })
                                                }
                                            </View>

                                            <View className={'flex_space_bet num_readers font_size22 read_num'}>
                                                {item.readCount}人阅读
                                                <View className={'flex_end text_right'}>
                                                    <View className={'flex_center'} data-index={index} data-shareId={item.shareId} onClick={this.endorse}>
                                                        {item.isEndorse ? (
                                                            <Image mode={'aspectFill'} src={require('../../images/fabulous_cur.png')}></Image>
                                                        ) : (
                                                                <Image mode={'aspectFill'} src={require('../../images/fabulous.png')}></Image>
                                                            )}
                                                        {item.endorseCount}
                                                    </View>
                                                    <View onClick={this.discuss} data-index={index} data-shareid={item.shareId} className={'flex_center'}>
                                                        <Image mode={'aspectFill'} src={require('../../images/discuss.png')}></Image>
                                                        {item.commentCount}
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                )
                                :
                                 segmentCurrent === 1 ? ( //食谱
                                     <View onClick={this.goRecipeDetail} data-userid={item.userId} data-recipeid={item.recipeId} key={index} className={'w93 flex_space_bet recipe_list'}>
                                        <View className={'recipe_img'}>
                                            <Image mode={'aspectFill'} className={'w100 h100'} src={item.coverImage}></Image>
                                        </View>
                                        <View className={'recipe_text'}>
                                            <View className={'ellipsis1 recipe_name font_size36'}>{item.recipeTitle}</View>
                                            <Text className={'ellipsis1 font_size24'}>{item.recipeDescribe}</Text>
                                            <View className={'font_size24 color_999 author ellipsis1'}>{item.name}</View>
                                            <View className={'font_size24'}>{item.readCount}人阅读</View>
                                        </View>
                                    </View>
                                ):
                                (
                                    //大神
                                    <View className={'say_list'}>
                                        <View className={'w93'}>
                                            <View className={'flex_start'}>
                                                <View className={'portrait overflow'}>
                                                    <Image mode={'aspectFill'} className={'w100 h100'} src={item.portrait}></Image>
                                                </View>
                                                <View className={'author font_size22 margin_left25'}>
                                                    <Text className={'on_show font_size26'}>{item.name}</Text>
                                                    {item.createDate}
                                                </View>
                                            </View>

                                            <View className={'scrollview overflow w100 margin_top30'}>
                                                <ScrollView scrollX scrollWithAnimation>
                                                    {item.recipeEntities.map((re, key) =>{
                                                       return  <View onClick={this.goRecipeDetail} data-recipeid={re.recipeId} key={key} data-userid={item.userId} className={'scroll_list'}>
                                                                   <Image mode={'aspectFill'} className={'w100 artwork'} src={re.coverImage}></Image>
                                                                   <View className={'work_title'}>
                                                                       <View className={'ellipsis1 w_t'}>{re.recipeTitle}</View>
                                                                       <View className={'num_readers font_size22'}>
                                                                           {re.readCount}人阅读
                                                                           <Text className={'fabulous_num'}>
                                                                               {re.endorseCount}点赞
                                                                           </Text>
                                                                       </View>
                                                                   </View>
                                                               </View>
                                                    })}
                                                </ScrollView>
                                            </View>
                                        </View>
                                    </View>
                                )
                            })
                        }

                    {/*悬浮框*/}
                    <View className={'position_fix float_box'}>
                        <View onClick={this.goCreateRecipe} className={'suspension_box flex_center'}>
                            <Image src={require('../../images/upload_recipe.png')}></Image>
                        </View>
                        <View onClick={this.goUpload} className={'suspension_box flex_center'}>
                            <Image src={require('../../images/upload_works.png')}></Image>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}
