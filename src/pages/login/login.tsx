import Taro, { Component, Config, setStorageSync } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import './login.scss'
import fetch from '../../utils/fetch'
import dialog from '../../utils/dialog'
import loginModel from '../../models/loginModel'
import navigate from '../../utils/navigate'


export default class Login extends Component {

    config: Config = {
        navigationBarTitleText: '登录'
    }

    wxCode: string;

    componentWillMount = () => {
        this.refreshWxCode()
    }

    refreshWxCode = () => {
        Taro.login({
            success: (res) => {
                this.wxCode = res.code
            }
        })
    }

    getUserInfo = (event) => {
        if (event.detail.errMsg.indexOf('deny') >= 0) {
            return
        }

        let userInfo = event.detail
        let iv = userInfo.iv
        let encryptedData = userInfo.encryptedData

        this.wxLogin({ iv, encryptedData, code: this.wxCode })
    }

    // 微信登录
    wxLogin = async (obj) => {
        try {
            let res = await loginModel.fetchWxLogin(obj);
            loginModel.setUser(res.user)
            fetch.setToken(res.token);
            let searchArr = [];

            setStorageSync('userId', res.user.userId);
            navigate.switchTab('../collarFossa/index');
            setStorageSync('search', searchArr);

        } catch (e) {
            dialog.handleError(e);
        }
        this.refreshWxCode();
    }

    render() {
        return (
            <View>
                <Button open-type={'getUserInfo'} className={'submit_btn1 w80 margin_top30'} onGetUserInfo={this.getUserInfo}>微信授权</Button>
            </View>
        )
    }
}
