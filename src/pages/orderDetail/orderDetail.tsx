import Taro, { Component, Config, getStorageSync, setStorageSync, showToast } from '@tarojs/taro'
import { View, Text,Input,Image} from '@tarojs/components'
import './orderDetail.scss'
import dialog from '../../utils/dialog'
import navigate from '../../utils/navigate'
import orderModel from "../../models/orderModel";
import addressModel from "../../models/addressModel";



export default class RefundReason extends Component {
    config: Config = {
        navigationBarTitleText: '订单详情'
    }
    constructor(){
        super();
        this.state = {
            orderDetail:{},// 订单详情
            img:'',
            name:'',
            count:0,
            consignee:'',
            phone:'',
            region:'',
            address:''
        }
    }
    componentDidShow(){
        this.setState({
            img:this.$router.params.img,
            name:this.$router.params.name,
            count:Number(this.$router.params.count),
        })
        this.getOrderDetail();// 获取订单详情
    }

    // 获取订单详情
    getOrderDetail = async () => {
        let orderId:number = Number(this.$router.params.orderId);
        let address:string = this.state.address;
        let region:string = this.state.region;
        let consignee:string = this.state.consignee;
        let phone:string = this.state.phone;

        try {
            let res = await orderModel.getOrderDetail(orderId);

            let str = res.thatAddress,
                urlArray = str.split('：');
            address = urlArray[urlArray.length-1];
            region = this.interceptFn(urlArray[urlArray.length-2]);
            phone = this.interceptFn(urlArray[urlArray.length-3]);
            consignee = this.interceptFn(urlArray[urlArray.length-4]);

            this.setState({ orderDetail:res, address, region, phone,consignee });
        } catch (e) {
            dialog.handleError(e);
        }
    }

    interceptFn(character){
        let str = character.substr(0, character.lastIndexOf('；'));
        return str;
    }

    // 申请退款
    applyRefund = (res) => {
        let orderId:number = Number(this.$router.params.orderId);
        let addrPhone:string = res.currentTarget.dataset.addrphone;
        let addrName:string = res.currentTarget.dataset.addrname;
        navigate.go(`../refundReason/refundReason?orderId=${orderId}&addrPhone=${addrPhone}&addrName=${addrName}`);
    }

    render () {
        let orderDetail:object = this.state.orderDetail;
        return (
            <View>
                <View className={'order_head'}>
                    <View className={'w93 color_999'}>
                        <Text className={'font_size34'}>订单状态</Text>
                        <View className={'font_size28 flex_space_bet'}>
                            状态 <Text className={'color_333'}>{orderDetail.state == 2 ? '待收货':''}</Text>
                        </View>
                    </View>
                </View>

                <View className={'order_head'}>
                    <View className={'w93 color_999'}>
                        <Text className={'font_size34'}>订单信息</Text>
                        <View className={'font_size28'}>订单编号：{orderDetail.orderNo}</View>
                        <View className={'font_size28'}>下单时间：{orderDetail.createDate}</View>
                    </View>
                </View>

                <View className={'order_head'}>
                    <View className={'w93 flex_space_bet'}>
                        <Text className={'font_size28 color_red'}>合计：￥{orderDetail.orderTotal}</Text>
                        <View className={'text_center submit_btn1 gotopay font_size30'} data-addrphone={this.state.phone} data-addrname={this.state.consignee} onClick={this.applyRefund}>
                            {orderDetail.state == 2 ? '申请退款':''}
                        </View>
                    </View>
                </View>


                <View className={'order_head'}>
                    <View className={'w93'}>
                        <Text className={'font_size34 color_999'}>商品列表</Text>

                        <View className={'pay_goods flex_start margin_top30'}>
                            <View className={'commodity'}>
                                <Image mode={'aspectFill'} className={'w100 h100'} src={this.state.img}></Image>
                            </View>
                            <View className={'margin_left25 goods_name color_999 font_size28 w80'}>
                                <Text className={'ellipsis2 font_size30 color_333'}>
                                    {this.state.name}
                                </Text>
                                x{this.state.count}
                            </View>
                        </View>
                    </View>
                </View>

                <View className={'order_head'}>
                    <View className={'w93'}>
                        <View className={'font_size34 color_999'}>地址</View>

                        <View className={'font_size26 addr margin_top30'}>
                            <View>{this.state.consignee} <Text className={'margin_left25'}>{this.state.phone}</Text></View>
                            <Text className={'color_999'}>{this.state.region} {this.state.address}</Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}
