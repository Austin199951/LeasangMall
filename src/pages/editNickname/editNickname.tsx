import Taro, { Component, Config, getStorageSync, setStorageSync, showToast } from '@tarojs/taro'
import { View, Text,Input } from '@tarojs/components'
import './editNickname.scss'
import setUserModel from '../../models/setUserModel'
import dialog from '../../utils/dialog'
import navigate from '../../utils/navigate'


export default class EditNickName extends Component {
    config: Config = {
        navigationBarTitleText: '昵称设置'
    }
    constructor() {
        super()
        this.state = {
            nick_name:'',//昵称
        }
    }

    componentWillMount () {
        let user:object = getStorageSync('ls_storage_user');
        this.setState({nick_name:user.name});
    }

    // 设置输入昵称
    nickname = (res) => {
        this.setState({nick_name:res.detail.value});
    }

    // 保存
    async save(){
        let user:object = getStorageSync('ls_storage_user');
        let signature:string = user.signature;
        let address:string = user.address;
        let phone:string = user.phone;
        let portrait:string = user.portrait;
        let email = user.email;
        let gender:number = user.gender;
        let name = this.state.nick_name;

        if(name == '' || name.length <= 3){
            showToast({title:'请输入4-16个字符的昵称，不与其他用户重复',icon:'none'})
        } else {
            try {
                let res = await setUserModel.save(address, email,gender, name, phone, portrait, signature);
                setStorageSync('ls_storage_user',res);
                navigate.back();
            } catch (e) {
                dialog.handleError(e)
            }
        }
    }

    render () {
        return (
            <View>
                <View className={'w85'}>
                    <Input onInput={this.nickname} value={this.state.nick_name} placeholder={'请输入昵称'} className={'nickname_box text_center'} placeholderClass={'color_999'} maxLength={6}/>
                    <View className={'submit_btn text_center w100 save'} onClick={this.save}>保存</View>
                    <Text className={'text_center on_show margin_top30 color_999 font_size26'}>昵称应为4-16个字符，不与其他用户重复</Text>
                </View>
            </View>
        )
    }
}
