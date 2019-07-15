import Taro, { Component, Config } from '@tarojs/taro'
import { View, Image} from '@tarojs/components'
import './fans.scss'
import fansModel from '../../models/fansModel'
import dialog from '../../utils/dialog'


export default class Fans extends Component {
    config: Config = {
        navigationBarTitleText: '粉丝'
    }
    constructor() {
        super()
        this.state = {
            fansList:[], //粉丝列表
        }
    }

    componentDidShow () {
        this.fansList();// 获取粉丝列表
    }
    // 获取粉丝列表
    async fansList(){
        try {
            let res = await fansModel.fetchGetFansList();
            this.setState({ fansList:res });
        } catch (e) {
            dialog.handleError(e);
        }
    }

    // 关注
    async follow(res){
        let userId:number = res.currentTarget.dataset.userid;
        let concern:boolean = res.currentTarget.dataset.concern;

        try {
            if(concern){
                await fansModel.cancelFollow(userId);
            } else {
                await fansModel.follow(userId);
            }
            this.fansList();
        } catch (e) {
            dialog.handleError(e);
        }
    }
    render () {
        return (
            <View className='seting w90'>
                {
                    this.state.fansList.map((item,index)=>{
                        return <View key={index} className={'flex_space_bet fans_list'}>
                                    <View className={'flex_start_center font_size26'}>
                                        <View className={'portrait overflow margin_right25'}>
                                            <Image mode={'aspectFill'} className={'w100 h100'} src={item.portrait}></Image>
                                        </View>
                                        {item.name}
                                    </View>
                                    {
                                        item.concern == false ? (
                                            <View data-userid={item.userId} data-concern={item.concern} onClick={this.follow} className={'text_center font_size28 follow'}>
                                                +关注
                                            </View>
                                        ): (
                                            <View data-userid={item.userId} data-concern={item.concern} onClick={this.follow} className={'text_center font_size28 follow_cur color_999'}>已关注
                                            </View>
                                        )
                                    }
                                </View>
                    })
                }

                {
                    this.state.fansList.length == 0 ?
                        (<View className={'text_center color_999 no_time'}>暂无粉丝</View>) :''
                }
            </View>
        )
    }
}
