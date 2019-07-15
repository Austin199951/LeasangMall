import {ComponentClass} from 'react'
import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text, Image,} from '@tarojs/components'
import './addressMsg.scss'
import navigate from '../../utils/navigate'
import addressModel from '../../models/addressModel'
import dialog from '../../utils/dialog'


type PageProps = {}
type PageState = {
    addreInfo: Array<any>,// 地址列表
    addressId: number,// 当前选中的地址id
    isDefault: boolean,// 是否默认
}

interface AddressMsg {
    state: PageState
}


class AddressMsg extends Component {
    config: Config = {
        navigationBarTitleText: '地址信息'
    }

    constructor() {
        super()
        this.state = {
            addreInfo: [],// 地址列表
            addressId: 0,// 当前选中的地址id
            isDefault: true,// 是否默认
        }
    }

    componentDidShow() {
        this.getAddressList();// 获取地址列表
    }

    // 获取地址列表
    async getAddressList() {
        let addressId: number = this.state.addressId;

        try {
            await addressModel.fetchGetAddrList((succ) => {
                for (let item of succ) {
                    item.telephone = item.phone.replace(item.phone.substr(3, 4), '****');
                    if (item.initDefault) {
                        addressId = item.deliveryAddressId
                    }
                }
                this.setState({addressId, addreInfo: succ});
            })
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 选择地址
    async choice(res) {
        let deliveryAddressId: number = res.currentTarget.dataset.addressid;
        let key: number = res.currentTarget.dataset.index;

        let addreInfo = this.state.addreInfo;
        let phone: string = '';
        let name: string = '';
        let region: string = '';
        let address: string = '';
        let initDefault: boolean = this.state.isDefault;

        addreInfo.map((item, index) => {
            phone = item.phone;
            name = item.name;
            region = item.region;
            address = item.address;

            if (key == index) {
                this.editAddr(deliveryAddressId, name, address, region, phone, initDefault);
            }
        });
    }

    async editAddr(deliveryAddressId: number, name: string, address: string, region: string, phone: string, initDefault: boolean) {
        try {
            await addressModel.fetchEditAddr(deliveryAddressId, name, address, region, phone, initDefault)
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 新建收货地址
    new_addr = () => {
        navigate.go(`../newAddress/newAddress?addr_id=-1`)
    }

    edit = (res) => {
        let addr_id: number = res.currentTarget.dataset.addr_id;
        navigate.go(`../newAddress/newAddress?addr_id=${addr_id}`);
    }

    render() {
        return (
            <View>
                <View className={'margin_btm140 bg_white'}>
                    {
                        this.state.addreInfo.map((item, index) => {
                            return <View key={index} className={'flex_space_bet w90 address_list'}>
                                <View data-addressid={item.deliveryAddressId} data-index={index} onClick={this.choice}
                                      className={'flex_start_center'} style={'width:82%;'}>
                                    <View className={'choice'}>
                                        {
                                            item.initDefault ? (
                                                <Image src={require('../../images/choice_cur.png')}></Image>
                                            ) : (
                                                <Image src={require('../../images/choice.png')}></Image>
                                            )
                                        }
                                    </View>
                                    <View className={'addre_info margin_left30'}>
                                        <View className={'font_size26 flex_start_center'}>
                                            {item.name} <View className={'margin_left25'}>{item.telephone}</View>
                                        </View>
                                        <View className={'font_size26 on_show'}>
                                            {item.region}<Text>{item.address}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View onClick={this.edit} data-name={item.name} data-region={item.region}
                                      data-address={item.address} data-phone={item.phone}
                                      data-addr_id={item.deliveryAddressId}
                                      className={'submit_btn1 edit text_center font_size30'}>编辑</View>
                            </View>
                        })
                    }
                </View>

                {
                    this.state.addreInfo.length == 0 ?
                        (<View className={'text_center color_999 no_time'}>暂无地址信息</View>) : ''
                }

                <View className={'bg_white position_fix w100 btm_btn'}>
                    <Text onClick={this.new_addr} className={'submit_btn w90 text_center on_show'}>
                        新增收货地址
                    </Text>
                </View>
            </View>
        )
    }
}

export default AddressMsg as ComponentClass<PageProps>
