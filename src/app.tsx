import '@tarojs/async-await'
import Taro, { Component, Config } from '@tarojs/taro'
import Index from './pages/index'
import './app.scss'

import config from './config'
import fetch from './utils/fetch'

class App extends Component {
    config: Config = {
        pages: [
            'pages/index/index',
            'pages/collarFossa/index',
            'pages/recipeClassify/recipeClassify',
            'pages/collarStreet/index',
            'pages/shoppingCart/shoppingCart',
            'pages/stepInstru/stepInstru',
            'pages/myRecipes/myRecipes',
            'pages/goodsList/goodsList',
            'pages/orderDetail/orderDetail',
            'pages/refundReason/refundReason',
            'pages/saerchHistory/saerchHistory',
            'pages/evaluate/evaluate',
            'pages/recipes/recipes',
            'pages/workDetails/workDetails',
            'pages/createRecipes/createRecipes',
            'pages/pendingPay/pendingPay',
            'pages/othersInfo/othersInfo',
            'pages/addressMsg/addressMsg',
            'pages/personalSetting/personalSetting',
            'pages/collection/collection',
            'pages/comment/comment',
            'pages/publish/publish',
            'pages/editNickname/editNickname',
            'pages/editEmail/editEmail',
            'pages/signature/signature',
            'pages/login/login',
            'pages/fans/fans',
            'pages/follow/follow',
            'pages/searchResult/searchResult',
            'pages/newAddress/newAddress',
            'pages/collarProduct/index',
            'pages/confirmOrder/confirmOrder',
            'pages/myWork/myWork',
            'pages/goodsDetails/goodsDetails',
            "pages/seting/seting",
        ],
        window: {
            backgroundTextStyle: 'light',
            navigationBarBackgroundColor: '#fff',
            navigationBarTitleText: 'WeChat',
            navigationBarTextStyle: 'black'
        },
        tabBar: {
            selectedColor: "#343434",
            list: [
                {
                    pagePath: "pages/index/index",
                    text: "首页",
                    iconPath: "images/index.png",
                    selectedIconPath: "images/index_cur.png"
                },
                {
                    pagePath: 'pages/collarStreet/index',
                    text: '领街',
                    iconPath: 'images/collar_street.png',
                    selectedIconPath: 'images/collar_street_cur.png'
                },

                {
                    pagePath: 'pages/collarProduct/index',
                    text: '领品',
                    iconPath: 'images/mall.png',
                    selectedIconPath: 'images/mall_cur.png'
                },
                {
                    pagePath: 'pages/collarFossa/index',
                    text: '领窝',
                    iconPath: 'images/me.png',
                    selectedIconPath: 'images/me_cur.png'
                }
            ]
        }
    }
    /**
     * 在这里初始化一些功能
     */
    componentWillMount() {
        // 初始化请求的主域名
        fetch.setHost(config.HOST)
    }

    componentDidMount() { }

    componentDidShow() { }

    componentDidHide() { }

    componentCatchError() { }

    render() {
        return (
            <Index />
        )
    }
}

Taro.render(<App />, document.getElementById('app'))
