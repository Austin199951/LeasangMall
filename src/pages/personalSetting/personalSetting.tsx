import Taro, {Component, Config, getStorageSync, setStorageSync} from '@tarojs/taro'
import {View, Input, Picker, Image} from '@tarojs/components'
import './personalSetting.scss'
import navigate from '../../utils/navigate'
import setUserModel from '../../models/setUserModel'
import pictureUploadModel from '../../models/pictureUploadModel'
import dialog from '../../utils/dialog'


export default class PersonalSetting extends Component {
    config: Config = {
        navigationBarTitleText: '个人设置'
    }

    constructor() {
        super()
        this.state = {
            selector: ['保密', '男', '女'],
            sexSelector: '保密',
            nick_name: '',// 昵称
            email: '',// 邮箱
            signature: '',//个性签名
            gender: 0, // 隐藏的性别
            portrait: '',// 头像
        }
    }

    componentDidShow() {
        this.getSelf();
    }

    // 设置性别
    sexChange = async (res) => {
        let sex:number = Number(res.detail.value);
        let portrait: string = this.state.portrait;
        this.setState({sexSelector: this.state.selector[sex], gender:sex});
        this.editFn(portrait, sex);
    }

    // 获取自己的信息
    getSelf = async () => {
        try {
            let res = await setUserModel.self();
            setStorageSync('ls_storage_user', res);
            this.setSex(res);
        } catch (e) {
            dialog.handleError(e);
        }
    }

    setSex(res){
        let sexSele = this.state.sexSelector;
        switch (res.gender) {
            case 0:
                sexSele = '保密'
                break;
            case 1:
                sexSele = '男'
                break;
            case 2:
                sexSele = '女'
                break;
        }
        this.setState({
            portrait:res.portrait, sexSelector: sexSele, nick_name: res.name,
            email: res.email, signature: res.signature, gender: res.gender
        });
    }

    //上传头像
    async upLoadPortrait() {
        try {
            await pictureUploadModel.pictureUpLoad(res => {
                let portrait = JSON.parse(res.data).data;
                let gender: number = this.state.gender;
                this.editFn(portrait, gender);
            })
        } catch (e) {
            dialog.handleError(e);
        }
    }

    // 图片上传
    async editFn(portrait?, gender) {
        let user: object = getStorageSync('ls_storage_user');
        let name: string = this.state.nick_name;
        let email: string = this.state.email;
        let signature: string = this.state.signature;
        let address: string = user.address;
        let phone: string = user.phone;

        try {
            let res = await setUserModel.save(address, email, gender, name, phone, portrait, signature);
            setStorageSync('ls_storage_user', res);
            this.getSelf();
        } catch (e) {
            dialog.handleError(e);
        }
    }

    settingList = (res) => {
        let setType: number = res.currentTarget.dataset.settype;
        switch (setType) {
            case 1:
                navigate.go(`../editNickname/editNickname`);
                break;
            case 2:
                navigate.go(`../signature/signature`);
                break;
            case 3:
                navigate.go(`../editEmail/editEmail`);
                break;
            case 4:
                navigate.go(`../addressMsg/addressMsg`);
                break;
        }
    }

    render() {
        return (
            <View className='font_size30'>
                <View className={'margin_top30'}>
                    <View className={'bg_white pub_list font_size30'}>
                        <View className={'w90 flex_space_bet'} onClick={this.upLoadPortrait}>
                            头像
                            <View className={'flex_end color_999 font_size30'}>
                                <View className={'portrait overflow'}>
                                    <Image mode={'aspectFill'} className={'w100 h100'}
                                           src={this.state.portrait}></Image>
                                </View>
                                <Image className={'arrow_r'} src={require('../../images/arrow_r.png')}></Image>
                            </View>
                        </View>
                    </View>
                    <View className={'bg_white pub_list font_size30'} onClick={this.settingList} data-settype={1}>
                        <View className={'w90 flex_space_bet'}>
                            昵称
                            <View className={'flex_end color_999 font_size30'}>
                                {this.state.nick_name}
                                <Image className={'arrow_r'} src={require('../../images/arrow_r.png')}></Image>
                            </View>
                        </View>
                    </View>
                    <View className={'bg_white pub_list font_size30'}>
                        <View className={'w90 flex_space_bet'}>
                            性别
                            <View className={'flex_end color_999 font_size30'}>
                                <Picker mode='selector' range={this.state.selector} onChange={this.sexChange}>
                                    {this.state.sexSelector}
                                    <Input className={'on_hide'} value={this.state.gender}/>
                                </Picker>
                                <Image className={'arrow_r'} src={require('../../images/arrow_r.png')}></Image>
                            </View>
                        </View>
                    </View>
                    <View className={'bg_white pub_list font_size30'} onClick={this.settingList} data-settype={2}>
                        <View className={'w90 flex_space_bet'}>
                            简介
                            <View className={'flex_end color_999 font_size30'}>
                                {this.state.signature == '' ? '这个人很懒，什么都没留下来' : this.state.signature}
                                <Image className={'arrow_r'} src={require('../../images/arrow_r.png')}></Image>
                            </View>
                        </View>
                    </View>
                </View>

                <View className={'margin_top30'}>
                    <View className={'bg_white pub_list font_size30'} onClick={this.settingList} data-settype={3}>
                        <View className={'w90 flex_space_bet'}>
                            邮箱
                            <View className={'flex_end color_999 font_size30'}>
                                {this.state.email}
                                <Image className={'arrow_r'} src={require('../../images/arrow_r.png')}></Image>
                            </View>
                        </View>
                    </View>
                    <View className={'bg_white pub_list font_size30'} onClick={this.settingList} data-settype={4}>
                        <View className={'w90 flex_space_bet'}>
                            收货地址
                            <View className={'flex_end color_999 font_size30'}>
                                收货地址
                                <Image className={'arrow_r'} src={require('../../images/arrow_r.png')}></Image>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}
