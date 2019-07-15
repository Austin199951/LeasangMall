import Taro, {Component, Config, showToast} from '@tarojs/taro'
import {View, Text, Input, Picker, Label, Textarea, Switch} from '@tarojs/components'
import './newAddress.scss'
import addressModel from '../../models/addressModel'
import dialog from '../../utils/dialog'


export default class NewAddress extends Component {
    config: Config = {
        navigationBarTitleText: '添加地址'
    }

    constructor() {
        super()
        this.state = {
            region: ['广东省', '佛山市', '顺德区'],
            username: '',// 收货人
            phone: '',//联系方式
            detailaddr: '',//详细地址
            is_default: false,
            addrId: ''
        }
    }

    switchChange = (e) => {
        this.setState({is_default: e.detail.value})
    }

    componentWillMount() {
        let params = this.$router.params;
        this.setState({ addrId: params.addr_id })
        if (params.addr_id != -1) {
            this.getAddrInfo();
        }
    }

    // 获取收货地址列表
    async getAddrInfo() {
        let addr_id = this.$router.params.addr_id;
        try {
            await addressModel.fetchGetAddrList(succ => {

                for (let item of succ) {
                    if (addr_id == item.deliveryAddressId) {
                        let reg = item.region.split(',');

                        this.setState({
                            username: item.name, phone: item.phone, is_default: item.initDefault,
                            region: reg, detailaddr: item.address
                        });
                    }
                }
            })
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 改变地区选择
    bindRegionChange = (res) => {
        this.setState({region: res.detail.value})
    }

    // 设置输入内容
    user_name = (res) => {
        this.setState({username: res.detail.value});
    }
    mobile = (res) => {
        this.setState({phone: res.detail.value});
    }
    detail_addr = (res) => {
        this.setState({detailaddr: res.detail.value});
    }

    // 删除收货地址
    async del_addr() {
        let deliveryAddressId: number = this.state.addrId;
        try {
            await addressModel.fetchDelAddr(deliveryAddressId);
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 提交 新建收货地址
    async confirm() {
       this.addressFn();
    }

    // 更改收货地址
    async addr_edit() {
        let deliveryAddressId: string = this.$router.params.addr_id;
        this.addressFn(deliveryAddressId);
    }

    async addressFn(deliveryAddressId?){
        let phone: string = this.state.phone;
        let name: string = this.state.username;
        let region: string = this.state.region.toString();
        let address: string = this.state.detailaddr;
        let initDefault: boolean = this.state.is_default;

        try {
            if (name == '') {
                showToast({title: '请输入收货人姓名', icon: 'none'})
            } else if (phone == '' || phone.length != 11) {
                showToast({title: '请输入11位联系电话', icon: 'none'})
            } else if (address == '') {
                showToast({title: '请输入详细地址', icon: 'none'})
            } else {
                if(deliveryAddressId){
                    await addressModel.fetchEditAddr(deliveryAddressId, name, address, region, phone, initDefault);
                } else {
                    await addressModel.fetchNewAddr(name, phone, address, region, initDefault);
                }
            }
        } catch (e) {
            dialog.handleError(e);
        }
    }

    render() {
        return (
            <View className='font_size30'>
                <View className={'bg_white'}>
                    <View className={'pub_list w90 flex_start'}>
                        <Label for={'username'} className={'flex_space_bet'}>姓<Text>名：</Text></Label>
                        <Input type="text" id={'username'} placeholder={'收货人'} onInput={this.user_name}
                               value={this.state.username} maxLength={10} placeholderClass={'color_999'}/>
                    </View>
                    <View className={'pub_list w90 flex_start'}>
                        <Label for={'phone'}>联系电话：</Label>
                        <Input type="text" onInput={this.mobile} value={this.state.phone} id={'phone'}
                               placeholder={'联系电话'} maxLength={11} placeholderClass={'color_999'}/>
                    </View>
                    <View className={'pub_list w90 flex_start'}>
                        <Label for={'region'}>所在地区：</Label>
                        <View className={'ellipsis1 h100'} style={'width:75%;margin-left:35rpx;'}>
                        <Picker mode="region" onChange={this.bindRegionChange} value={this.state.region}>
                            {this.state.region[0]},{this.state.region[1]},{this.state.region[2]}
                        </Picker>
                        </View>
                    </View>
                    <View className={'detailed_addr w90'}>
                        <Label for={'detailed_addr'}>详细地址：</Label>
                        <Textarea id={'detailed_addr'} onInput={this.detail_addr} value={this.state.detailaddr}
                                  placeholderClass={'color_999'} placeholder={'详细地址：如道路、门牌号、小区、楼栋号、单元室等'} maxlength={50}></Textarea>
                    </View>

                </View>
                <View className={'bg_white font_size28'}>
                    <View className={'pub_list w90 margin_top30 flex_space_bet'}>
                        设为默认地址 <Switch checked={this.state.is_default ? true : false}
                                       onChange={this.switchChange}></Switch>
                    </View>
                    {
                        this.state.addrId != -1 ? (
                            <View onClick={this.del_addr}
                                  className={'pub_list w90 color_red margin_top30'}>删除收货地址</View>
                        ) : ''
                    }
                </View>
                {
                    this.state.addrId == -1 ? (
                        <View className={'submit_btn w90 text_center submit position_fix quit_login'}
                              onClick={this.confirm}>提交</View>
                    ) : (
                        <View className={'submit_btn w90 text_center submit position_fix quit_login'}
                              onClick={this.addr_edit}>提交</View>
                    )
                }
            </View>
        )
    }
}
