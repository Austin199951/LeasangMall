import {ComponentClass} from 'react'
import Taro, {Component, Config, getStorageSync, showToast} from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components'
import './index.scss'
import navigate from '../../utils/navigate'
import followMode from '../../models/followModel'
import dialog from '../../utils/dialog'
import fansModel from '../../models/fansModel'
import enshrineModel from '../../models/enshrineModel'
import signInModel from '../../models/signInModel'

class Index extends Component {
    config: Config = {
        navigationBarTitleText: '领窝'
    }

    constructor() {
        super();
        this.state = {
            name: '',// 用户名称
            followNum: 0,// 多少人关注
            fansNum: 0,// 多少粉丝
            userId: 0,
            collectionNum: 0,// 多少收藏
        }
    }

    componentDidShow() {
        let user: object = getStorageSync('ls_storage_user');
        this.setState({
            portrait: user.portrait,
            name: user.name,
            userId: user.userId
        });
        this.followList();// 获取个人关注列表
        this.fansList();// 获取粉丝列表
        this.enshrineList();// 获取收藏列表
    }

    // 查看个人信息
    viewUserInfo = () => {
        navigate.go(`../personalSetting/personalSetting`);
    }

    // 获取关注列表
    async followList() {
        let user:object = getStorageSync('ls_storage_user');

        try {
            let res = await followMode.fetchGetFollowList(user.userId);
            this.setState({followNum: res.length})
        } catch (err) {
            dialog.handleError(err)
        }
    }

    // 获取粉丝列表
    async fansList() {
        try {
            let res = await fansModel.fetchGetFansList();
            this.setState({fansNum: res.length});
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 获取收藏列表
    async enshrineList() {
        try {
            let res = await enshrineModel.fetchEnshrine();
            this.setState({collectionNum: res.length});
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 去修改收货地址
    address = () => {
        navigate.go(`../addressMsg/addressMsg`);
    }

    // 查看订单
    myOrder = (res) => {
        let orderState = res.currentTarget.dataset.orderstate;
        navigate.go(`../pendingPay/pendingPay?state=${orderState}`)
    }


    // 用户列表点击
    userList = (res) => {
        let userType: number = res.currentTarget.dataset.usertype;
        let userId: number = getStorageSync('userId');

        switch (userType) {
            case 1:
                navigate.go(`../myRecipes/myRecipes?recipeType=${'edit'}&userId=${userId}`);
                break;
            case 2:
                navigate.go(`../myWork/myWork?userId=${userId}`);
                break;
        }
    }

    // 关注粉丝收藏
    userInfoList(res) {
        let userType: string = res.currentTarget.dataset.usertype;
        let userId: number = res.currentTarget.dataset.userid;

        switch (userType) {
            case '1':
                navigate.go(`../follow/follow?userId=${userId}`);
                break;
            case '2':
                navigate.go(`../fans/fans`);
                break;
            case '3':
                navigate.go(`../collection/collection`);
                break;
        }
    }

    // 签到
    async signIn() {
        try {
            let res = await signInModel.fetchSignIn(dialog.handleError(res));
            showToast({title: '签到成功', icon: 'none'});
        } catch (e) {
            dialog.handleError(e);
        }
    }

    render() {
        return (
            <View>
                <View className={'bg_white user_msg'}>
                    {/*领窝用户信息*/}
                    <View className={'user_info flex_center'} onClick={this.viewUserInfo}>
                        <View className={'w90 flex_space_bet'}>
                            <View className={'flex_start_center'}>
                                <View className={'portrait overflow'}>
                                    <Image mode={'aspectFill'} className={'w100 h100'} src={this.state.portrait}></Image>
                                </View>
                                <Text className={'font_size40 ellipsis1'}>{this.state.name}</Text>
                            </View>
                            <Image className={'arrow_right'} src={require('../../images/arrow_right.png')}></Image>
                        </View>
                    </View>

                    {/*关注粉丝收藏*/}
                    <View className={'w90 collect flex_space_bet text_center'}>
                        <View className={'flex_center flex_column font_size24'} data-userid={this.userId}
                              data-usertype={'1'} onClick={this.userInfoList}>
                            <View className={'font_size30'}>{this.state.followNum}</View>关注
                        </View>
                        <Text></Text>
                        <View className={'flex_center flex_column font_size24'} data-usertype={'2'}
                              onClick={this.userInfoList}>
                            <View className={'font_size30'}>{this.state.fansNum}</View>粉丝
                        </View>
                        <Text></Text>
                        <View className={'flex_center flex_column font_size24'} data-usertype={'3'}
                              onClick={this.userInfoList}>
                            <View className={'font_size30'}>{this.state.collectionNum}</View>收藏
                        </View>
                    </View>
                    {/*我的订单*/}
                    <View className={'w90 my_order'}>
                        <View className={'font_size30 order_tit'}>我的订单</View>
                        <View className={'flex_space_bet'}>
                            <View className={'flex_center flex_column font_size24'} onClick={this.myOrder}
                                  data-orderstate={1}>
                                <Image mode={'aspectFill'} src={require('../../images/payment.png')}></Image>待付款
                            </View>
                            <View className={'flex_center flex_column font_size24'} onClick={this.myOrder}
                                  data-orderstate={2}>
                                <Image mode={'aspectFill'} src={require('../../images/collect_goods.png')}></Image>待收货
                            </View>
                            <View className={'flex_center flex_column font_size24'} onClick={this.myOrder}
                                  data-orderstate={4}>
                                <Image mode={'aspectFill'} src={require('../../images/comment.png')}></Image>待评论
                            </View>
                            <View className={'flex_center flex_column font_size24'} onClick={this.address}>
                                <Image mode={'aspectFill'} src={require('../../images/receiving_address.png')}></Image>收货地址
                            </View>
                        </View>
                    </View>
                </View>

                <View className={'bg_white margin_top30 user_list font_size24'}>
                    <View className={'w90 flex_start_center'}>
                        <View className={'flex_center flex_column'} onClick={this.userList} data-usertype={1}>
                            <Image mode={'aspectFill'} src={require('../../images/my_diet.png')}></Image>
                            我的食谱
                        </View>
                        <View className={'flex_center flex_column'} onClick={this.userList} data-usertype={2}>
                            <Image mode={'aspectFill'} src={require('../../images/works.png')}></Image>
                            我的作品
                        </View>
                        {/*<View className={'flex_center flex_column'}>
                      <Image mode={'aspectFill'} src={require('../../images/activity.png')}></Image>
                      活动
                  </View>*/}
                        <View className={'flex_center flex_column'} onClick={this.signIn}>
                            <Image mode={'aspectFill'} src={require('../../images/sign_in.png')}></Image>
                            签到
                        </View>
                    </View>
                    <View className={'w90 flex_start_center on_hide'}>
                        <View className={'flex_center flex_column'}>
                            <Image mode={'aspectFill'} src={require('../../images/footprint.png')}></Image>
                            足迹
                        </View>
                        <View className={'flex_center flex_column'}>
                            <Image mode={'aspectFill'} src={require('../../images/integral.png')}></Image>
                            积分
                        </View>
                        <View className={'flex_center flex_column'}>
                            <Image mode={'aspectFill'} src={require('../../images/info_feedback.png')}></Image>
                            信息反馈
                        </View>
                        <View className={'flex_center flex_column'}>
                            <Image mode={'aspectFill'} src={require('../../images/help_central.png')}></Image>
                            帮助中心
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}

export default Index as ComponentClass<PageProps>