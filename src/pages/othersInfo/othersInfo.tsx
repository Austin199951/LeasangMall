import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Image} from '@tarojs/components'
import './othersInfo.scss'
import dialog from '../../utils/dialog'
import navigate from '../../utils/navigate'
import otherUserInfoModel from '../../models/otherUserInfoModel'
import followMode from "../../models/followModel";


export default class OthersInfo extends Component {
    config: Config = {
        navigationBarTitleText: '个人信息'
    }
    constructor() {
        super()
        this.state = {
            portrait:'',// 头像
            name:'',// 用户名称
            followNum:0,
        }
    }
    componentDidShow () {
        this.self();// 获取其他用户资料
        this.getFollow();
    }

    async getFollow(){
        let userId:number = Number(this.$router.params.userId);
        try {
            let res = await followMode.fetchGetFollowList(userId);
            this.setState({followNum:res.length});
        } catch (err) {
            dialog.handleError(err);
        }
    }

    // 获取其他用户资料
    async self(){
        let userId:number = Number(this.$router.params.userId);

        try {
            let res = await otherUserInfoModel.getOtherUserInfo(userId);
            this.setState({portrait:res.portrait, name:res.name});
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 用户列表点击
    userList(res){
        let userType:number = res.currentTarget.dataset.usertype;
        let userId:number = Number(this.$router.params.userId);

        switch (userType) {
            case 1:
                navigate.go(`../myRecipes/myRecipes?userId=${userId}`);
                break;
            case 2:
                navigate.go(`../myWork/myWork?userId=${userId}`);
                break;
        }
    }

    userInfoList(res){
        let userId:number = Number(this.$router.params.userId);
        navigate.go(`../follow/follow?userId=${userId}`);
    }

    render () {
        return (
            <View>
                <View className={'bg_white user_msg'}>
                    {/*领窝用户信息*/}
                    <View className={'user_info flex_center'}>
                        <View className={'w90 flex_space_bet'}>
                            <View className={'flex_start_center'}>
                                <View className={'portrait overflow'}>
                                    <Image mode={'aspectFill'} className={'w100 h100'} src={this.state.portrait}></Image>
                                </View>
                                <Text className={'font_size40 ellipsis1'}>{this.state.name}</Text>
                            </View>
                            {/*<Image mode={'aspectFill'} className={'arrow_right'} src={require('../../images/arrow_right.png')}></Image>*/}
                        </View>
                    </View>

                    {/*关注粉丝收藏*/}
                    <View className={'w90 collect flex_space_bet text_center'}>
                        <View className={'flex_center flex_column font_size24'} onClick={this.userInfoList}>
                            <View className={'font_size30'}>{this.state.followNum}</View>他的关注
                        </View>
                    </View>
                </View>

                <View className={'bg_white margin_top30 user_list font_size24'}>
                    <View className={'w90 flex_start_center'}>
                        <View className={'flex_center flex_column'} onClick={this.userList} data-usertype={1}>
                            <Image mode={'aspectFill'} src={require('../../images/my_diet.png')}></Image>
                            他的食谱
                        </View>
                        <View className={'flex_center flex_column'} onClick={this.userList} data-usertype={2}>
                            <Image mode={'aspectFill'} src={require('../../images/works.png')}></Image>
                            他的作品
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}
