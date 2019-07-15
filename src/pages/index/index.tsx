import {ComponentClass} from 'react'
import Taro, {
    Component, Config, showToast, setStorageSync, getStorageSync, showLoading, stopPullDownRefresh, hideLoading
} from '@tarojs/taro'
import {View, Text, Input, Image, Swiper, SwiperItem} from '@tarojs/components'
import './index.scss'
import indexModel, {ProductRecommendData} from '../../models/indexModel'
import dialog from '../../utils/dialog'
import navigate from '../../utils/navigate'
import shoppingCartModel from "../../models/shoppingCartModel";


type PageProps = {}
type PageState = {
    autoplay?: boolean;
    tenSpectrumList?: Array<any>;
    searchBox?: string;
    productRecommendList?: ProductRecommendData;
    menuList?: Array<any>;
}

//TODO: 定义interface，便于后面的使用以及查错
interface Index {
    props: PageProps;
    state: PageState;
}

class Index extends Component {
    config: Config = {
        navigationBarTitleText: '首页'
    }

    constructor() {
        super()
        this.state = {
            menuList: [
                {list_img: require('../../images/daily_tasks.png'), menu_tit: '每日任务'},
                {list_img: require('../../images/wonderful_activities.png'), menu_tit: '精彩活动'},
                {list_img: require('../../images/product_store.png'), menu_tit: '领品商城'},
                {list_img: require('../../images/recipe_classify.png'), menu_tit: '食谱分类'},
            ],
            shoppingArr: [],
            bannerList: [],// 轮播图
        }
    }

    componentWillMount() {
        this.recipeRecommend(); // 获取领厨.食谱
        this.productRecommend();// 获取领品.推荐例子
        this.getBanner();// 获取轮播图片
        this.getCartList();// 获取购物车列表
    }

    // TODO: 接口调用需要改进，统一使用数据层model
    // TODO: 统一错误处理方式
    // 获取领品.推荐例子
    async productRecommend() {
        try {
            let data = await indexModel.fetchProductRecommend();
            this.setState({productRecommendList: data.slice(0, 3)});
        } catch (err) {
            dialog.handleError(err);
        }
    }

    // 获取购物车列表
    async getCartList() {
        let shoppingArr: Array = this.state.shoppingArr;
        try {
            let res = await shoppingCartModel.getShoppingCartList();
            res.map((item, index) => {
                shoppingArr.push({
                    productCartId: item.productCartId, productId: item.productId
                });
            });
            this.setState({shoppingArr})
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 获取领厨.食谱
    async recipeRecommend() {
        try {
            let res = await indexModel.fetchRecipeRecommend();
            this.setState({tenSpectrumList: res})
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 获取轮播图片
    getBanner = async () => {
        try {
            let res = await indexModel.getBanner();
            this.setState({bannerList: res});
        } catch (e) {
            dialog.handleError(e);
        }
    }


    // 查看更多
    seeMore = (res) => {
        let moreType = res.currentTarget.dataset.moretype;
        let userId: number = getStorageSync('userId');

        switch (moreType) {
            case 'recommend':
                navigate.switchTab('../collarProduct/index');
                break;
            case 'recipes':
                navigate.go(`../myRecipes/myRecipes?recipeType=${'see'}&userId=${userId}`);
                break;
        }
    }
    searchClick = () => {
        navigate.go(`../saerchHistory/saerchHistory`);
    }


    // 查看食谱详情
    goRecipeDetail = (res) => {
        let recipeId: number = res.currentTarget.dataset.recipeid;
        navigate.go(`../recipes/recipes?recipeId=${recipeId}`);
    }

    // 查看商品详情
    goGoodsDetail = (res) => {
        let productId: number = res.currentTarget.dataset.productid;
        this.toDetailFn(productId);
    }

    toDetailFn(productId) {
        let shoppingArr: Array = this.state.shoppingArr;
        let shoppingType: string = '';
        let productCartId: number = 0;

        let data = shoppingArr.find((res) => (res.productId == productId));
        if(data == undefined){
            shoppingType = 'new';
        } else {
            shoppingType = 'edit';
           productCartId = data.productCartId;
        }

        navigate.go(`../goodsDetails/goodsDetails?productId=${productId}&productCartId=${productCartId}&shoppingType=${shoppingType}`);
    }

    // 去详情
    goDetail = (res) => {
        let objId: number = res.currentTarget.dataset.objid;
        let type: number = res.currentTarget.dataset.type;

        switch (type) {
            case 2:
                navigate.go(`../recipes/recipes?recipeId=${objId}`);
                break;
            case 3:
                this.toDetailFn(objId);
                break;
        }
    }

    goMenu = (res) => {
        let index:number = res.currentTarget.dataset.index;
        switch (index) {
            case 0:
                break;
            case 1:
                break;
            case 2:
                break;
            case 3:
                navigate.go(`../recipeClassify/recipeClassify`);
                break;
        }
    }

    render() {
        let recommendList = this.state.productRecommendList;

        return (
            <View className='index'>
                {/*搜索框*/}
                <View className={'bg_white search_box position_fix w100'}>
                    <View className={'w90 flex_space_bet'} onClick={this.searchClick}>
                        <View className={'subsearch_box flex_start'}>
                            <Image mode={'aspectFill'} src={require('../../images/search_icon.png')} className={'search_icon'}/>
                            <Input className={'w85 font_size30'} value={''} type="text" placeholder={'搜索食谱 / 材料 / 达人'}/>
                        </View>
                        <View className={'search_btn text_right font_size30'}>搜索</View>
                    </View>
                </View>


                {/*轮播*/}
                <View className={'banner position_re'}>
                    <Swiper indicatorColor='#88a2b7' indicatorActiveColor='#fff' circular indicatorDots autoplay>
                        {
                            this.state.bannerList.map((item, index) => {
                                return <SwiperItem key={index} onClick={this.goDetail} data-objid={item.objId}
                                                   data-type={item.type}>
                                    <Image className={'h100'} mode={'aspectFill'} src={item.url}></Image>
                                </SwiperItem>
                            })
                        }
                    </Swiper>


                    {/*菜单列表*/}
                    <View className={'menu flex_space_bet_wrap bg_white position_re'}>
                        {
                            this.state.menuList.map((item, index) => {
                                return <View key={index} className={'flex_column flex_center'} data-index={index} onClick={this.goMenu}>
                                            <Image src={item.list_img} mode={'aspectFill'}></Image>
                                            <Text>{item.menu_tit}</Text>
                                        </View>
                            })
                        }
                    </View>
                </View>

                {/*领品推荐*/}
                <View className={'bg_white'}>
                    <View className={'position_re flex_column list_tit flex_center margin_top30'}>
                        <Text className={'on_show'}>领品.推荐</Text>
                        RECOMMEND
                        <View className={'flex_end position_ab more text_righ font_size28'} onClick={this.seeMore}
                              data-moretype={'recommend'}>
                            更多<Image mode={'aspectFill'} className={'arrow_r'}
                                     src={require('../../images/arrow_r.png')}></Image>
                        </View>
                    </View>

                    <View className={'flex_space_bet_wrap recommend_index w90'}>
                        <Image onClick={this.goGoodsDetail} data-productid={recommendList[0].productId}
                               mode={'aspectFill'} className={'w100 h100'} src={recommendList[0].coverImage[0]}></Image>
                        <View className={'flex_space_bet w100'}>
                            <Image onClick={this.goGoodsDetail} data-productid={recommendList[1].productId}
                                   mode={'aspectFill'} className={'w100 h100'}
                                   src={recommendList[1].coverImage[0]}></Image>
                            <Image onClick={this.goGoodsDetail} data-productid={recommendList[2].productId}
                                   mode={'aspectFill'} className={'w100 h100'}
                                   src={recommendList[2].coverImage[0]}></Image>
                        </View>
                    </View>
                </View>

                {/*领厨十谱*/}
                <View className={'bg_white margin_top30'}>
                    <View className={'position_re flex_column list_tit flex_center'}>
                        <Text className={'on_show'}>领厨.十谱</Text>
                        RECIPES
                        <View className={'position_ab font_size28 more text_right flex_end'} onClick={this.seeMore}
                              data-moretype={'recipes'}>
                            更多<Image mode={'aspectFill'} className={'arrow_r'}
                                     src={require('../../images/arrow_r.png')}></Image>
                        </View>
                    </View>
                    {
                        this.state.tenSpectrumList.map((item, index) => {
                            return <View key={index} className={'w90 ten_spectrum'} data-recipeid={item.recipeId}
                                         onClick={this.goRecipeDetail}>
                                <Image mode={'aspectFill'} src={item.coverImage}></Image>
                                <View className={'spectrum_tit ellipsis1'}>{item.recipeTitle}</View>
                                <View className={'flex_space_bet'}>
                                    <Text>作者：{item.name}</Text>
                                    {item.readCount} 阅读
                                </View>
                            </View>
                        })
                    }
                </View>
            </View>
        )
    }
}

export default Index as ComponentClass<PageProps>