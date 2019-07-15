import Taro, { Component, Config, getStorageSync, setNavigationBarTitle } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import './follow.scss'
import dialog from'../../utils/dialog'
import followModel from '../../models/followModel'
import fansModel from '../../models/fansModel'


export default class Follow extends Component {
    config: Config = {
        navigationBarTitleText: ''
    }
    constructor() {
        super()
        this.state = {
            followList:[], //关注列表
        }
    }

    componentDidShow () {
        this.getFollowList();// 获取个人关注列表
        let userId = getStorageSync('userId');
        let user_id:number = Number(this.$router.params.userId);

        if(userId == user_id){
            setNavigationBarTitle({title:'我的关注'});
        } else {
            setNavigationBarTitle({title:'Ta的关注'});
        }
    }

    // 获取关注列表
    async getFollowList(){
        let userId:number = this.$router.params.userId;
        try {
            let res = await followModel.fetchGetFollowList(userId);
            this.setState({ followList:res });
        } catch (e) {
            dialog.handleError(e)
        }
    }

    async follow(res){ // 切换关注
        let concern:boolean = res.currentTarget.dataset.concern;
        let userId:number = res.currentTarget.dataset.userid;

        try {
            if(concern){
                await fansModel.cancelFollow(userId);
            } else {
                await fansModel.cancelFollow(userId);
            }
            this.getFollowList();
        } catch (e) {
            dialog.handleError(e)
        }
    }

    render () {
        return (
            <View className='seting w90'>
                {
                    this.state.followList.map((item,index)=>{
                        return <View key={index} className={'flex_space_bet fans_list'}>
                                    <View className={'flex_start_center font_size26'}>
                                        <View className={'portrait overflow margin_right25'}>
                                            <Image mode={'aspectFill'} className={'w100 h100'} src={item.portrait}></Image>
                                        </View>
                                        {item.name}
                                    </View>
                                    {
                                        item.concern == true ? (
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
                    this.state.followList.length == 0 ?
                        (<View className={'text_center color_999 no_time'}>暂无关注</View>) :''
                }
            </View>
        )
    }
}
