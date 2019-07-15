import Taro, { Component, Config, setNavigationBarTitle, showToast } from '@tarojs/taro'
import { View, Text, Image} from '@tarojs/components'
import './pendingPay.scss'
import payModel from '../../models/payModel'
import dialog from '../../utils/dialog'
import orderModel from '../../models/orderModel'
import goodsModel from '../../models/goodsModel'
import navigate from "../../utils/navigate";


export default class PendingPay extends Component {
    config: Config = {
        navigationBarTitleText: ''
    }
    constructor() {
        super()
        this.state = {
            status:'',
            pageIndex:1,// 页码
            orderNum:0,// 订单总条数
            orderList:[],// 订单列表
            product:{},// 产品
            orderStatus:'',// 订单状态
        }
    }

    componentDidShow () {
        let pageIndex:number = this.state.pageIndex;
        this.getOrderList(pageIndex);// 获取订单详情
    }

    // 获取订单列表
    async getOrderList(pageIndex){
        let state:number = Number(this.$router.params.state);
        let orderStatus:string = this.state.orderStatus;

        switch(state){
            case 1:
                orderStatus = '待支付';
                setNavigationBarTitle({title: '待付款'});
                break;
            case 2:
                orderStatus = '待收货';
                setNavigationBarTitle({title: '待收货'});
                break;
            case 4:
                orderStatus = '待评价';
                setNavigationBarTitle({title: '待评价'});
                break;
        }
        try {
            let res = await orderModel.getOrderList(state, pageIndex);

            for(let item of res.data) {
                item.productTotal = parseFloat(item.productTotal).toFixed(2);
                for(let i of item.orderDetailEntities) {
                    let productId: number = i.productId;
                    this.getProductFn(productId);
                }
            }

            this.setState({orderStatus, orderList:res.data, status:state, orderNum:res.totalRow});
        } catch (e) {
            dialog.handleError(e)
        }
    }

    async getProductFn(productId){
        try {
            let res = await goodsModel.goShopping(productId);
            res.coverImage = JSON.parse(res.coverImage);

            this.setState({product:res})
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 滑动加载数据
    onReachBottom(){
        let pageIndex:number = this.state.pageIndex;
        let orderNum:number = Math.ceil(this.state.orderNum / 10);

        if(pageIndex < orderNum){
            pageIndex++;
            this.getOrderList(pageIndex);
        }
        this.setState({pageIndex});
    }


    // 去支付
    async toPay(res){
        let orderId:number = res.currentTarget.dataset.orderid;
        try {
            await payModel.Payment(orderId);
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 去评论
    toComment = (res) => {
        let productId:number = res.currentTarget.dataset.productid;
        let img:string = res.currentTarget.dataset.img;
        navigate.go(`../evaluate/evaluate?productId=${productId}&img=${img}`);
    }


    // 确认收货
    async confirm(res) {
        let orderId = res.currentTarget.dataset.orderid;
        let pageSize:number = 10;

        try {
            await orderModel.receiving(orderId);
            showToast({title:'收货成功'});

            let e = await orderModel.getOrderList(2, pageSize);
            this.setState({orderList:e.data});
        } catch (e) {
            dialog.handleError(e)
        }
    }

    goDetail = (res) => {
        let status:number = this.state.status;
        let orderId:number = res.currentTarget.dataset.orderid;
        let count:number = res.currentTarget.dataset.count;
        let img:string = res.currentTarget.dataset.img;
        let name:string = res.currentTarget.dataset.name;

        if(status == 2){
            navigate.go(`../orderDetail/orderDetail?state=${status}&orderId=${orderId}&img=${img}&name=${name}&count=${count}`);
        }
    }

    render () {
        let product = this.state.product;
        return (
            <View className='pending_pay'>
                {
                    this.state.orderList.length == 0 ?
                        (<View className={'text_center color_999 no_time'}>还没有相关的订单</View>) :''
                }
                {
                    this.state.orderList.map((item,index) => {
                        return  <View key={index} className={'bg_white margin_top30'} data-count={item.productCount} data-name={product.productName} data-img={product.coverImage[0]} data-orderid={item.orderId} onClick={this.goDetail}>
                                    <View className={'pay_list'}>
                                        <View className={'w90 font_size28'}>
                                            <Text className={'color_999'}>订单号：</Text>{item.orderNO}
                                        </View>
                                    </View>
                                    <View className={'flex_space_bet w90 border_btm'}>
                                        <View className={'pay_info font_size28'}>
                                            <View>
                                                <Text className={'color_999'}>状态：</Text>
                                                <Text className={'color_red'}>{this.state.orderStatus}</Text>
                                            </View>
                                            <View><Text className={'color_999'}>合计：</Text>￥{item.productTotal}</View>
                                        </View>
                                        {
                                            this.state.status == 1 ? (<View data-orderid={item.orderId} onClick={this.toPay} className={'text_center submit_btn1 gotopay font_size30'}>去支付</View>) : this.state.status == 2 ? (
                                                <View data-orderid={item.orderId} onClick={this.confirm} className={'text_center submit_btn1 gotopay font_size30'}>确认收货</View>
                                            ):this.state.status == 4 ? (
                                                <View data-productid={product.productId} data-img={product.coverImage[0]} onClick={this.toComment} className={'text_center submit_btn1 gotopay font_size30'}>去评论</View>
                                            ):''
                                        }
                                    </View>


                                    <View className={'pay_goods flex_start w90'}>
                                        <View className={'commodity'}>
                                            <Image mode={'aspectFill'} className={'w100 h100'} src={product.coverImage[0]}></Image>
                                        </View>
                                        <View className={'margin_left25 w80 goods_name color_999 font_size28'}>
                                            <Text className={'ellipsis2 font_size30 color_333'}>
                                                {product.productName}
                                            </Text>
                                            x{item.productCount}
                                        </View>
                                    </View>
                                </View>
                    })
                }
            </View>
        )
    }
}
