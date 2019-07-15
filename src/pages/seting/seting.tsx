import Taro, { Component, Config } from '@tarojs/taro'
import { View, Image} from '@tarojs/components'
import './seting.scss'

export default class Seting extends Component {
    config: Config = {
        navigationBarTitleText: '设置'
    }
    constructor() {
        super()
        this.state = {}
    }

    render () {
        return (
            <View className='font_size30'>
                <View className={'margin_top30'}>
                    <View className={'bg_white pub_list font_size30'}>
                        <View className={'w90 flex_space_bet'}>
                            个人信息 <Image className={'arrow_r'} src={require('../../images/arrow_r.png')}></Image>
                        </View>
                    </View>
                    <View className={'bg_white pub_list font_size30'}>
                        <View className={'w90 flex_space_bet'}>
                            账户信息 <Image className={'arrow_r'} src={require('../../images/arrow_r.png')}></Image>
                        </View>
                    </View>
                    <View className={'bg_white pub_list font_size30'}>
                        <View className={'w90 flex_space_bet'}>
                            修改密码 <Image className={'arrow_r'} src={require('../../images/arrow_r.png')}></Image>
                        </View>
                    </View>
                    <View className={'bg_white pub_list font_size30'}>
                        <View className={'w90 flex_space_bet'}>
                            手机号码 <Image className={'arrow_r'} src={require('../../images/arrow_r.png')}></Image>
                        </View>
                    </View>
                </View>

                <View className={'margin_top30'}>
                    <View className={'bg_white pub_list font_size30'}>
                        <View className={'w90 flex_space_bet'}>
                            服务条例 <Image className={'arrow_r'} src={require('../../images/arrow_r.png')}></Image>
                        </View>
                    </View>
                    <View className={'bg_white pub_list font_size30'}>
                        <View className={'w90 flex_space_bet'}>
                            关于领上成品 <Image className={'arrow_r'} src={require('../../images/arrow_r.png')}></Image>
                        </View>
                    </View>
                </View>

                <View className={'text_center submit_btn w90 position_fix quit_login'}>退出登录</View>
            </View>
        )
    }
}
