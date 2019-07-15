import Taro, {Component, Config, hideLoading, showLoading, stopPullDownRefresh} from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components'
import './collection.scss'
import enshrineModel from '../../models/enshrineModel'
import dialog from '../../utils/dialog'
import navigate from '../../utils/navigate'

export default class Collection extends Component {
    config: Config = {
        navigationBarTitleText: '收藏'
    }

    constructor() {
        super()
        this.state = {
            collectionList: [],// 收藏列表
        }
    }

    componentDidShow() {
        this.getCollectionList();// 获取收藏列表
    }

    // 获取收藏列表
    async getCollectionList() {
        try {
            let res = await enshrineModel.fetchEnshrine();
            this.setState({collectionList: res});
        } catch (e) {
            dialog.handleError(e);
        }
    }

    // 查看食谱详情
    goRecipes(res) {
        let recipeId: number = res.currentTarget.dataset.recipeid;
        let userId: number = res.currentTarget.dataset.userid;
        navigate.go(`../recipes/recipes?recipeId=${recipeId}&userId=${userId}`);
    }

    render() {
        return (
            <View>
                {
                    this.state.collectionList.length == 0 ?
                        (<View className={'text_center color_999 no_time'}>暂无收藏</View>) : ''
                }
                {
                    this.state.collectionList.map((item, index) => {
                        return <View data-recipeid={item.recipe.recipeId} onClick={this.goRecipes}
                                     data-userid={item.userId} key={index} className={'w93 flex_space_bet recipe_list'}>
                            <View className={'recipe_img'}>
                                <Image mode={'aspectFill'} className={'w100 h100'}
                                       src={item.recipe.coverImage}></Image>
                            </View>
                            <View className={'recipe_text'}>
                                <View className={'ellipsis1 recipe_name font_size36'}>{item.recipe.recipeTitle}</View>
                                <Text className={'ellipsis1 font_size24'}>{item.recipe.recipeDescribe}</Text>
                                <View className={'font_size24 color_999 author ellipsis1'}>{item.recipe.name}</View>
                                <View className={'font_size24'}>{item.recipe.readCount} 阅读</View>
                            </View>
                        </View>
                    })
                }
            </View>
        )
    }
}
