import Taro, {
    Component,
    Config,
    getStorageSync,
    hideLoading,
    setNavigationBarTitle,
    showLoading,
    stopPullDownRefresh
} from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components'
import './myRecipes.scss'
import navigate from '../../utils/navigate'
import recipesModel from '../../models/recipesModel'
import dialog from '../../utils/dialog'


export default class MyRecipes extends Component {
    config: Config = {
        navigationBarTitleText: '',
        enablePullDownRefresh: true
    }

    constructor() {
        super()
        this.state = {
            recipeList: [],// 我的食谱列表
            pageNumber: 1,// 页码
            recipesNum: 0,// 食谱总条数
        }
    }

    componentDidShow() {

        let recipeArr: Array = [];
        let pageNumber: number = this.state.pageNumber;
        this.getRecipeList(pageNumber, recipeArr);// 获取食谱列表

        let userId = getStorageSync('userId');
        let userid: number = Number(this.$router.params.userId);
        if (userId == userid) {
            setNavigationBarTitle({title: '我的食谱'});
        } else {
            setNavigationBarTitle({title: 'Ta的食谱'});
        }
    }

    // 获取食谱列表
    async getRecipeList(pageIndex, recipeList) {
        let userId: number = Number(this.$router.params.userId);
        try {
            let res = await recipesModel.getRecipeList(userId, pageIndex);
            recipeList = recipeList.concat(res.data);

            this.setState({recipesNum: res.totalRowm, recipeList});
        } catch (e) {
            dialog.handleError(e);
        }
    }

    // 查看食谱详情
    goEditRecipe = (res) => {
        let recipeId: number = res.currentTarget.dataset.recipeid;
        let recipeNmae = this.$router.params.recipeType;
        let userId: number = Number(this.$router.params.userId);

        switch (recipeNmae) {
            case 'edit':
                navigate.go(`../createRecipes/createRecipes?recipeId=${recipeId}&recipeType=${'edit'}`);
                break;
            case 'see':
                navigate.go(`../recipes/recipes?recipeId=${recipeId}&userId=${userId}`);
                break;
        }
    }

    onReachBottom() {
        let pageNumber: number = this.state.pageNumber;
        let recipesNum: number = Math.ceil(this.state.recipesNum / 10);
        let recipeList: Array = this.state.recipeList;

        if (pageNumber < recipesNum) {
            pageNumber++;
            this.getRecipeList(pageNumber, recipeList);
        }
        this.setState({pageNumber});
    }

    render() {
        return (
            <View>
                {
                    this.state.recipeList.length == 0 ?
                        (<View className={'text_center color_999 no_time'}>暂无食谱</View>) : ''
                }
                {
                    this.state.recipeList.map((item, index) => {
                        return <View key={index} className={'w93 flex_space_bet recipe_list'} data-recipeid={item.recipeId} onClick={this.goEditRecipe}>
                            <View className={'recipe_img'}>
                                <Image mode={'aspectFill'} className={'w100 h100'} src={item.coverImage}></Image>
                            </View>
                            <View className={'recipe_text'}>
                                <View className={'ellipsis1 recipe_name font_size36'}>{item.recipeTitle}</View>
                                <Text className={'ellipsis1 font_size24'}>{item.recipeDescribe}</Text>
                                <View className={'font_size24 color_999 author ellipsis1'}>{item.name}</View>
                                <View className={'font_size24'}>{item.readCount}阅读</View>
                            </View>
                        </View>
                    })
                }
            </View>
        )
    }
}
