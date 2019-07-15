import Taro, {Component, Config, hideLoading, showLoading, showToast, stopPullDownRefresh} from '@tarojs/taro'
import { View, Text,Input, Image} from '@tarojs/components'
import './confirmOrder.scss'
import dialog from '../../utils/dialog'
import navigate from '../../utils/navigate'
import addressModel from '../../models/addressModel'
import orderModel from'../../models/orderModel'
import payModel from '../../models/payModel'


export default class ConfirmOrder extends Component {
  config: Config = {
    navigationBarTitleText: '确认订单',
      enablePullDownRefresh:true
  }
  constructor() {
    super()
      this.state = {
          freight:0, // 运费
          actualPay:0, //实付金额
          goodsAmount:0,//商品金额
          pageIndex:1,
          cartList:[],
          addressId:0,// 选中的地址id
          addrArr:[],// 当前地址列表
          product:[],
      }
  }

  componentWillMount () {
      //运费保留两位小数
      let freight = this.state.freight;
      freight = parseFloat(freight).toFixed(2);

      this.totaoPrice()
      this.setState({ freight,product: JSON.parse(this.$router.params.product) });
      this.getShoppingCartList();// 获取购物车列表
;  }

    componentDidShow () {
        this.getAddressList();// 获取地址列表
    }

    // 获取地址列表
    async getAddressList(){
        let addressId:number = this.state.addressId;
        let addrArr:Array = [];

        try {
            await addressModel.fetchGetAddrList(res => {
                for(let item of res){
                    item.phone = item.phone.replace(item.phone.substr(3,4),'****');
                    if(item.initDefault){
                        addrArr.push(item);
                        addressId = item.deliveryAddressId
                    }
                }
                this.setState({ addressId, addrArr })
            });
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 获取购物车
    getShoppingCartList(){
        let checkList = JSON.parse(this.$router.params.checkList);
        let goodsAmount:number = this.state.goodsAmount;
        let totalPrice:number = 0;

        for(let item of checkList){
            totalPrice += parseFloat(item.minPeice) * item.quantity;
            goodsAmount = (parseFloat(item.minPeice) * item.quantity).toFixed(2);
        }
        totalPrice = parseFloat(totalPrice).toFixed(2);
        this.setState({actualPay:totalPrice, goodsAmount, cartList:checkList});
    }

    // 计算总价
    totaoPrice = () => {
        let total =0;
        this.state.cartList.map((item,index)=>{
            total+=parseFloat(item.minPeice) * item.quantity;
        })
        total = parseFloat(total).toFixed(2);
        this.setState({actualPay:total});
    }

    // 创建订单
    async createOrder() {
        let product:Array = this.state.product;
        let addressId:number = this.state.addressId;// 收货地址ID
        let logisticsFee:string = this.state.freight;// 运费
        let remark:string = '';// 备注

        try {
            if(this.state.addrArr.length == 0){
                showToast({title:'请选择地址信息', icon:'none'});
            } else {
                let res = await orderModel.createOrder(remark,product,addressId,logisticsFee);
                let orderId:number = res.orderId;
                this.payFn(orderId);
            }
        } catch (e) {
            dialog.handleError(e);
        }
    }

    // 支付方法
    async payFn(orderId){
        try {
           await payModel.Payment(orderId, 'goods');
        } catch (e) {
            dialog.handleError(e);
        }
    }

    // 选择地址
    chooseAddre = () => {
      navigate.go(`../addressMsg/addressMsg`);
    }

    // 加减
    addReduce = (res) => {
      let typeName:string = res.currentTarget.dataset.typename;
      let index:number = res.currentTarget.dataset.index;
      let cartList:Array = this.state.cartList;
      let product:Array = this.state.product;

      switch (typeName) {
          case 'plus':
              cartList[index].quantity ++;
              product[index].thatCount++;
              break;
          case 'reduce':
              cartList[index].quantity --;
              if(cartList[index].quantity == 1){
                    cartList[index].quantity = 1
              }
              product[index].thatCount --;
              break;
      }

        this.totaoPrice(); // 计算总价方法
        this.setState({ cartList, product });
    }

    onPullDownRefresh(res) {
        showLoading({ title: 'loading...' });
        let _this = this;

        setTimeout(() => {
            _this.setState({ addrArr:[] });
            _this.getAddressList();

            stopPullDownRefresh();
            hideLoading();
        }, 1000);
    }

  render () {
      let addrArr = this.state.addrArr;
      let cartList = this.state.cartList;
    return (
      <View>
          {/*地址信息*/}

          <View className={'bg_white position_re'}>
              <View onClick={this.chooseAddre} className={'flex_space_bet w90 addre_info'}>
                    <View className={'font_size28 color_999'}>
                        {addrArr.map((item,index) => {
                            return <View key={index}>
                                        <View className={'font_size32 color_000'}>
                                            {item.name} <Text>{item.phone}</Text>
                                        </View>
                                        {item.region} <Text className={'margin_left15'}>{item.address}</Text>
                                    </View>
                        })}


                        {this.state.addrArr.length == 0 ? '请选择收货地址': ''}
                    </View>
                    <Image mode={'aspectFill'} className={'arrow_r'} src={require('../../images/arrow_r.png')}></Image>
                </View>
              <Image className={'w100 addr_line position_ab'} src={require('../../images/addr_line.png')}></Image>
          </View>

          <View className={'margin_top20 bg_white list_commodities'}>
              {
                  cartList.map((item,index)=>{
                      return <View key={index} className={'flex_space_bet goods_list w90'}>
                                  <View className={'commodity_map'}>
                                      <Image mode={'aspectFill'} className={'w100 h100'} src={item.img}></Image>
                                  </View>
                                  <View className={'goods_r'}>
                                      <Text className={'ellipsis2 color_333 font_size30'}>{item.productName}</Text>
                                      <View className={'font_size24 color_999'} style={'margin-top:10rpx;'}>{item.desc}</View>
                                      <View className={'flex_space_bet price'}>
                                          <View className={'font_size36 color_333'}>
                                              <Text className={'font_size28'}>￥</Text>
                                              {item.minPeice}
                                          </View>
                                          <View className={'required_quantity flex_space_bet'}>
                                              <Text data-index={index} className={'font_size36'+' '+(item.quantity == 1 ? 'event_none color_999':'')} data-typename={'reduce'} onClick={this.addReduce}>-</Text>
                                              <Input className={'text_center'} value={item.quantity} disabled={'true'}/>
                                              <Text data-index={index} data-typename={'plus'} className={'font_size36'} onClick={this.addReduce}>+</Text>
                                          </View>
                                      </View>
                                  </View>
                              </View>
                  })
              }
          </View>

          {/*商品信息*/}
          <View className={'bg_white margin_top20 goods_info margin_btm140'}>
              <View className={'w90 font_size30'}>
                  <View className={'flex_space_bet'}>商品金额<Text>￥{this.state.goodsAmount}</Text></View>
                  <View className={'flex_space_bet'}>运费<Text>￥{this.state.freight}</Text></View>
              </View>
              <View className={'border_top font_size34'}><Text className={'w90 flex_end'}>实付金额：￥{this.state.actualPay}</Text></View>
          </View>

          {/*微信支付*/}
          <View className={'position_fix w100 btm_btn'}>
              <View onClick={this.createOrder} className={'w90 wx_pay text_center position_fix font_size30'}>微信支付</View>
          </View>
      </View>
    )
  }
}
