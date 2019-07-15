import Taro, { Component, Config, getStorageSync, setStorageSync, showToast } from '@tarojs/taro'
import { View, Textarea} from '@tarojs/components'
import './signature.scss'
import setUserModel from '../../models/setUserModel'
import dialog from '../../utils/dialog'
import navigate from '../../utils/navigate'


export default class Signature extends Component {
    config: Config = {
        navigationBarTitleText: '简介设置'
    }
    constructor() {
        super()
        this.state = {
            introdu:'',//简介
        }
    }
    componentDidShow () {
        let user:object = getStorageSync('ls_storage_user');
        this.setState({ introdu:user.signature })
    }

    // 设置输入简介
    intr = (res) => {
        this.setState({ introdu:res.detail.value });
    }

    // 保存
    async save() {
        let signature:string = this.state.introdu;
        let user:object = getStorageSync('ls_storage_user');
        let address:string = user.address;
        let phone:string = user.phone;
        let portrait:string = user.portrait;
        let email:string = user.email;
        let gender:number = user.gender;
        let name:string = user.name;

        if(signature == '' || signature.length >= 18){
            showToast({title:'请输入不超过18个字的简介', icon:'none'})
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
                <Textarea onInput={this.intr} value={this.state.introdu} className={'w100 intro bg_white margin_top30 w85 save'}  placeholderClass={'color_999'} placeholder={'请输入简介...'} maxlength={126}></Textarea>
                <View className={'submit_btn text_center w85 save'} onClick={this.save}>保存</View>
            </View>
        )
    }
}
