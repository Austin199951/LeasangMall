import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,Input,Image} from '@tarojs/components'
import './searchResult.scss'
import searchResultModel from'../../models/searchResultModel'
import dialog from '../../utils/dialog'


export default class SearchResult extends Component {
  config: Config = {
    navigationBarTitleText: '搜索结果'
  }
  constructor() {
    super()
      this.state = {
          resultList:[],// 搜索列表
          search:'',
      }
  }

  componentDidShow () {
      let search:string = this.$router.params.search;
      this.setState({ search });
      this.getSearchResult(search);// 获取搜索结果
  }

  // 获取搜索结果
  async getSearchResult(search){
      try {
          let res = await searchResultModel.getSearchResult(search);
          this.setState({ resultList:res.recipeEntities });
      } catch (e) {
          dialog.handleError(e)
      }
  }
  // 点击回车搜索
    searchBtn = () => {
      let search:string = this.state.search;
      this.getSearchResult(search);
    }

    searchCon = (res) => {
        this.setState({ search:res.detail.value });
    }
  render () {
    return (
      <View className='index'>
          {/*搜索框*/}
          <View className={'bg_white search_box position_fix w100'}>
              <View className={'w90 flex_space_bet'}>
                  <View className={'subsearch_box flex_start'}>
                      <Image mode={'aspectFill'} src={require('../../images/search_icon.png')} className={'search_icon'} />
                      <Input className={'w90 font_size30'} type="text" placeholder={'搜索食谱 / 材料 / 达人'} value={this.state.search} onInput={this.searchCon} onConfirm={this.searchBtn} />
                  </View>
                  <View className={'search_btn text_right font_size30'} onClick={this.searchBtn}>搜索</View>
              </View>
          </View>


          <View style={'margin-top:110rpx'} className={'position_re'}>
          {
              this.state.resultList.map((item,index)=>{
                  return <View data-recipeid={item.recipeId} key={index} className={'w90 flex_space_bet recipe_list'}>
                              <View className={'recipe_img'}>
                                  <Image mode={'aspectFill'} className={'w100 h100'} src={item.coverImage}></Image>
                              </View>
                              <View className={'recipe_text'}>
                                  <View className={'ellipsis1 recipe_name font_size36'}>{item.recipeTitle}</View>
                                  <Text className={'ellipsis1 font_size24'}>{item.recipeDescribe}</Text>
                                  <View className={'font_size24 color_999 author ellipsis1'}>{item.name}</View>
                                  {/*<View className={'font_size24'}>{item.recipe.readCount} 阅读</View>*/}
                              </View>
                          </View>
              })
          }
              {
                  this.state.resultList.length == 0 ? (<View className={'text_center color_999 no_time'}>暂无搜索结果</View>) :''
              }
          </View>
      </View>
    )
  }
}
