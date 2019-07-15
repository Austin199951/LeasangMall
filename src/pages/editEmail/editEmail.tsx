import Taro, { Component, Config, showToast, getStorageSync,setStorageSync } from '@tarojs/taro'
import { View, Input } from '@tarojs/components'
import './editEmail.scss'
import setUserModel from '../../models/setUserModel'
import dialog from '../../utils/dialog'
import navigate from '../../utils/navigate'


export default class EditEmail extends Component {
    config: Config = {
        navigationBarTitleText: '邮箱设置'
    }
    constructor() {
        super()
        this.state = {
            email_box:'',//邮箱
        }
    }

    componentWillMount () {
        let user:object = getStorageSync('ls_storage_user');
        this.setState({ email_box:user.email })
    }

    // 设置输入邮箱
    email = (res) => {
        this.setState({ email_box:res.detail.value });
    }

    // 保存
    async save(){
        let user:object = getStorageSync('ls_storage_user');
        let signature:string = user.signature;
        let address:string = user.address;
        let phone:string = user.phone;
        let portrait:string = user.portrait;
        let email = this.state.email_box;
        let gender:number = user.gender;
        let name = user.name;

        if(email == ''){
            showToast({title:'请输入邮箱', icon:'none'});
        } else {
            try {
                let res = await setUserModel.save(address, email,gender, name, phone, portrait, signature);
                setStorageSync('ls_storage_user',res);
                navigate.back()
            } catch (e) {
                dialog.handleError(e);
            }
        }
    }

    render () {
        return (
            <View>
                <View className={'w85'}>
                    <Input type={'email'} onInput={this.email} value={this.state.email_box} placeholder={'请输入邮箱'} className={'nickname_box text_center'} placeholderClass={'color_999'} maxLength={24}/>
                    <View className={'submit_btn text_center w100 save'} onClick={this.save}>保存</View>
                </View>
            </View>
        )
    }
}
