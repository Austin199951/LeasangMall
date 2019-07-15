import Taro, { Component, Config, showToast} from '@tarojs/taro'
import { View, Text,Image} from '@tarojs/components'
import './goodsList.scss'
import navigate from '../../utils/navigate'
import goodsModel from '../../models/goodsModel'
import dialog from '../../utils/dialog'


export default class GoodsList extends Component {
  config: Config = {
    navigationBarTitleText: '商品列表'
  }
  constructor() {
    super()
      this.state = {
          pageIndex:1,// 页码
          goodsRow:0,// 商品总条数
          goodsList:[],
      }
  }

  componentDidShow () {
      let arrayList:Array = [];
      let pageIndex:number = this.state.pageIndex;
      this.getGoodsList(pageIndex, arrayList);// 获取商品列表
  }

    // 去购买
    async goShopping(res){
      let productId:number = res.currentTarget.dataset.productid;
      let productName:string = res.currentTarget.dataset.productname;
      let minPeice:string = res.currentTarget.dataset.minpeice;
      let desc:string = res.currentTarget.dataset.desc;
      let img:string = res.currentTarget.dataset.img;

      let product:Array = [];
      let obj:object = {};
      let productPriceId:number= 0;

      let checkList = [
          {productId,productName,minPeice,desc,quantity:1,img}
      ];

        try {
            let res = await goodsModel.goShopping(productId);
            for(let item of res.productPriceEntities){
                productPriceId = item.productPriceId;
            }
            obj = {
                productId,
                productPriceId,
                thatCount:1
            }
            product.push(obj);

            navigate.go(
                `../confirmOrder/confirmOrder?product=${JSON.stringify(product)}&checkList=${JSON.stringify(checkList)}`
            );
        } catch (e) {
            dialog.handleError(e)
        }
        res.stopPropagation();
    }

    // 查看商品详情
    goGoodsDetail = (res) => {
        let productId = res.currentTarget.dataset.productid;
        navigate.go(`../goodsDetails/goodsDetails?productId=${productId}&shoppingType=new`);
    }

  // 获取商品列表
  async getGoodsList(pageIndex, goodsList){

      try {
          let res = await goodsModel.getGoodsList(pageIndex);
          goodsList = goodsList.concat(res.data);

          res.data.map((item, index) => {
              item.coverImage = JSON.parse(item.coverImage);
              item.minPeice = parseFloat(item.minPeice).toFixed(2)
          })

          this.setState({ goodsRow:res.totalRow, goodsList});
      } catch (e) {
          dialog.handleError(e);
      }
  }


  // 滑动到底部加载数据
    onReachBottom() {
        let pageIndex:number = this.state.pageIndex;
        let goodsRow:number = Math.ceil(this.state.goodsRow / 10);
        let goodsList:Array = this.state.goodsList;

        if(pageIndex <　goodsRow){
            pageIndex ++;
            this.getGoodsList(pageIndex, goodsList);
        }
        this.setState({　pageIndex　});
    }

  render () {
    return (
      <View>
          {
              this.state.goodsList.map((item,index) => {
                  return  <View data-productid={item.productId} key={index} className={'flex_space_bet w90 border_btm goods_list'} onClick={this.goGoodsDetail}>
                              <View className={'commodity_map'}>
                                  <Image mode={'aspectFill'} className={'w100 h100'} src={item.coverImage[0]}></Image>
                              </View>
                              <View className={'goods_r'}>
                                  <Text className={'ellipsis2 color_333 font_size30'}>{item.productName}</Text>
                                  <View className={'flex_space_bet price'}>
                                      <View className={'flex_column font_size36 color_333'}>
                                          ￥{item.minPeice}
                                          {/*<Text className={'color_999 font_size26 original_price'}>￥{item.originalPrice}</Text>*/}
                                      </View>
                                      <View data-productname={item.productName} data-minpeice={item.minPeice} data-desc={item.description} onClick={this.goShopping} data-img={item.coverImage[0]} data-productid={item.productId} className={'submit_btn1 text_center go_shopping font_size30'}>去购买</View>

                                  </View>
                              </View>
                          </View>
              })
          }
      </View>
    )
  }
}
