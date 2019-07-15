import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text, Input, Image} from '@tarojs/components'
import './recipeClassify.scss'
import dialog from '../../utils/dialog'
import recipesModel from '../../models/recipesModel'
import navigate from "../../utils/navigate";

export default class SearchResult extends Component {
    config: Config = {
        navigationBarTitleText: '食谱分类'
    }

    constructor() {
        super()
        this.state = {
            classfiyName:[],// 分类
            classfiyId:0,
            categoryList:[],//类别
            categoryTitle:'',//类别标题
            cateArr:[],
        }
    }

    componentDidShow() {
        let　_this = this;
        this.getClassifyRecommend(
            _this.getRecipeTypeList()//获取食谱分类列表
        );// 获取分类推荐
    }

    // 获取食谱分类列表
    async getRecipeTypeList(){
        let classfiyName:Array = [];
        let cateArr:Array = [];
        let classfiyId:number = this.state.classfiyId;

        try {
            let res = await recipesModel.recipeTypeList();
           res.map((item, index) => {
               if(item.superior == 0){
                   classfiyName.push(item);
               } else {
                   cateArr.push(item);
               }
           });

            classfiyName.unshift({
                name:'推荐',
                superior:0,
                recipeTypeId:1
            });

            this.setState({ classfiyName, cateArr, categoryTitle:classfiyName[classfiyId].name });
            this.findClassify(cateArr, classfiyName[classfiyId].recipeTypeId);
        } catch (e) {
            dialog.handleError(e);
        }
    }

    // 切换食谱分类
    toggleChoice = async (res) => {
        let classfiyId:number = res.currentTarget.dataset.index;
        let recipeTypeId:number = res.currentTarget.dataset.recipetypeid;
        let categoryTitle:string = res.currentTarget.dataset.name;

        if(recipeTypeId == 1){
            this.getClassifyRecommend('');// 获取分类推荐
        }

        this.setState({ classfiyId,categoryTitle });
        this.findClassify(this.state.cateArr, recipeTypeId );
    }

    // 获取分类推荐
    getClassifyRecommend = async (callback) => {
        try {
            let res = await recipesModel.classifyRecommend();
            this.setState({ categoryList: res, categoryTitle:'推荐' });
            callback();
        } catch (e) {
            dialog.handleError(e);
        }
    }


    // 查找分类
    findClassify = (cateArr, objId) =>　{
        let categoryList:Array = [];

        for(let j of cateArr){
            if(objId == j.superior){
                categoryList.push(j);
            }
        }
        this.setState({ categoryList });
    }

    searchClick = (res) => {
        navigate.go(`../saerchHistory/saerchHistory`);
    }

    goSearch = (res) => {
        let search:string = res.currentTarget.dataset.title;
        navigate.go(`../searchResult/searchResult?search=${search}`);
    }

    render() {
        return (
            <View className='index'>
                {/*搜索框*/}
                <View className={'bg_white search_box position_fix w100'}>
                    <View className={'w90 flex_space_bet'} onClick={this.searchClick}>
                        <View className={'subsearch_box flex_start'}>
                            <Image mode={'aspectFill'} src={require('../../images/search_icon.png')} className={'search_icon'}/>
                            <Input className={'w85 font_size30'} value={''} type="text" placeholder={'搜索食谱 / 材料 / 达人'}/>
                        </View>
                        <View className={'search_btn text_right font_size30'}>搜索</View>
                    </View>
                </View>

                <View className={'position_fix classfiy w100 flex_space_bet'}>
                    <View className={'classfiy_left font_size28 position_ab'}>
                        {
                            this.state.classfiyName.map((item, index) => {
                                return <View onClick={this.toggleChoice} data-name={item.name} data-recipeTypeId={item.recipeTypeId} data-index={index} key={index} className={'text_center'+' '+(this.state.classfiyId == index ? 'choice bg_white':'')}>{item.name}</View>
                            })
                        }
                    </View>
                    <View className={'classfiy_right bg_white position_ab'}>
                        {
                                <View className={'position_re h100'}>
                                    <View className={'recipe_tit font_size24 color_333'}>{this.state.categoryTitle}</View>
                                    <View className={'category w100 color_333 font_size24 position_ab'}>
                                        {this.state.categoryList.map((i, key) => {
                                            return <View key={key} onClick={this.goSearch} data-title={i.name}>
                                                        <Image mode={'aspectFill'} src={i.coverImage}></Image>
                                                        <Text>{i.name}</Text>
                                                    </View>
                                        })}
                                        {
                                            this.state.categoryList.length == 0 ?
                                                (<Text className={'text_center color_999 no_time on_show text_center'}>暂无对应的分类</Text>) : ''
                                        }
                                    </View>
                                </View>

                        }
                    </View>
                </View>
            </View>
        )
    }
}
