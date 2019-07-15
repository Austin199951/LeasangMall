import Taro, { Component, Config, getStorageSync, setStorageSync, showToast } from '@tarojs/taro'
import { View, Text,Input,Image} from '@tarojs/components'
import './refundReason.scss'
import dialog from '../../utils/dialog'
import navigate from '../../utils/navigate'
import Utils from '../../utils/util'
import orderModel from "../../models/orderModel";



export default class RefundReason extends Component {
    config: Config = {
        navigationBarTitleText: '退款原因'
    }
    constructor() {
        super();
        this.state = {
            open:false,
            addrName:'',
            addrPhone:'',
            refundReason:'请选择退款原因',
            orderReasonId:0,//退款原因id
            reasonList:[],//原因列表
        }
    }
    componentDidShow(){
        this.getRefundReason();
        this.setState({ addrName: this.$router.params.addrName, addrPhone: this.$router.params.addrPhone });
    }

    // 选择退款原因
    selectRefund = (res) => {
        let _this = this;
        this.setState({open:!_this.state.open});
        res.stopPropagation();
    }

    // 获取退款原因
    getRefundReason = async () => {
        try {
            let res = await orderModel.refundReason();
            this.setState({reasonList: res});
        } catch (e) {
            dialog.handleError(e);
        }
    }

    // 确认退款
    async confirmRefund(){
        let orderId:number = Number(this.$router.params.orderId);
        let orderReasonId:number = this.state.orderReasonId;

        try {
            await orderModel.applyRefund(orderId, orderReasonId);
            navigate.back(2);
        } catch (e) {
            dialog.handleError(e);
        }
    }

    choiceReason = (res) => {
        let refundReason:string = res.currentTarget.dataset.reasonname;
        let orderReasonId:number = res.currentTarget.dataset.orderreasonid;
        let _this = this;

        this.setState({refundReason, open:!_this.state.open, orderReasonId});
    }


    render () {
        return (
            <View>
                {/*遮罩*/}
                <View onClick={this.selectRefund} className={'cover position_fix w100 h100'+' '+(this.state.open?'on_show':'on_hide')}></View>
                <View className={'bg_white position_fix w100 refund_reason color_333'+' '+ (this.state.open ? 'rea_cur' :'')}>
                    <View className={'pub_list'}>
                        <View className={'w93 font_size34 flex_space_bet'}>
                            请选择退款原因
                            <Image src={require('../../images/arrow_b.png')} onClick={this.selectRefund} className={'arrow_r'}></Image>
                        </View>
                    </View>

                    <View className={'w93 reason'}>
                        {this.state.reasonList.map((item, index) => {
                            return <View key={index} data-orderreasonid={item.orderReasonId} className={'font_size30'} data-reasonname={item.reason} onClick={this.choiceReason}>{item.reason}</View>
                        })}
                    </View>
                </View>

                <View className={'pub_list'} onClick={this.selectRefund}>
                    <View className={'w93 color_333 flex_space_bet'}>
                        <View>
                            <Text className={'color_999'}>退款原因：</Text>
                            <Text className={this.state.refundReason == '请选择退款原因' ? 'color_999' : 'color_333'}>{this.state.refundReason}</Text>
                        </View>

                        <Image src={require('../../images/arrow_b.png')} className={'arrow_r rotate_arr'+' '+(this.state.open ? 'rotate_arr_cur':'')}></Image>
                    </View>
                </View>
                <View className={'pub_list'}>
                    <View className={'w93 color_333 flex_start'}>
                        <Text className={'color_999'}>退款方式：</Text>按原路返回
                    </View>
                </View>
                <View className={'pub_list'}>
                    <View className={'w93 color_333 flex_start'}>
                        <Text className={'color_999'}>退款联系人：</Text>{this.state.addrName}
                    </View>
                </View>
                <View className={'pub_list'}>
                    <View className={'w93 color_333 flex_start'}>
                        <Text className={'color_999'}>联系电话：</Text>{this.state.addrPhone}
                    </View>
                </View>
                <View className={'pub_list'}></View>

                <View className={'submit_btn position_fix text_center quit_login w93 refund font_size30'} onClick={this.confirmRefund}>确认退款</View>
            </View>
        )
    }
}
