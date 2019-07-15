import Taro, {Component, Config, showToast} from '@tarojs/taro'
import {View, Text, Input, Image} from '@tarojs/components'
import './shoppingCart.scss'
import navigate from '../../utils/navigate'
import dialog from '../../utils/dialog'
import shoppingCartModel from '../../models/shoppingCartModel'


export default class ShoppingCart extends Component {
    config: Config = {
        navigationBarTitleText: '购物车'
    }

    constructor() {
        super()
        this.state = {
            cartList: [],// 购物车列表
            cartCheckList: [],//当前选中的商品
            cart_head: '编辑商品',//购物车头部按钮
            cart_status: 'edit_goods',//购物车头部按钮状态
            total: 0,//合计
            product: [],
            checkedGoodsIdList: [],// 选中的id列表
        }
    }

    componentWillMount() {
        let total = this.state.total;
        total = parseFloat(total).toFixed(2)
        let cartList = this.state.cartList;
        cartList.map((item, index) => {
            item.unit_price = parseFloat(item.unit_price).toFixed(2)
        });
        this.setState({total, cartList});
    }

    componentDidShow() {
        this.getShoppingCartList();// 获取购物车列表
    }

    // 购物车头部按钮
    cartHeadBtn = () => {
        let cart_head = this.state.cart_head;
        let cart_status = this.state.cart_status;

        if (cart_head == '编辑商品') {
            cart_head = '完成'
            cart_status = 'finish'
        } else {
            cart_head = '编辑商品'
            cart_status = 'edit_goods'
        }
        this.setState({cart_head: cart_head, cart_status: cart_status});
    }

    // 单选择
    choice = (res) => {
        let index = res.currentTarget.dataset.index;
        let car_list = this.state.cartList[index];
        car_list.checked = !car_list.checked;
        let arr = [];
        let checkId = [];
        let total_price = 0;

        this.state.cartList.map((item, index) => {
            if (item.checked) {
                arr.push(item);
                checkId.push(item.productCartId);
                total_price += parseFloat(item.productPrice.currentPrice) * item.quantity;
            }
        })
        total_price = parseFloat(total_price).toFixed(2);
        this.setState({
            checkedGoodsIdList: checkId,
            total: total_price,
            cartList: this.state.cartList,
            cartCheckList: arr
        });
        res.stopPropagation();
    }


    // 全选
    checkall = () => {
        let arr = [];
        let total_price = 0;
        let checkId = [];

        this.state.cartList.map((item, index) => {
            item.checked = true
            if (item.checked == true) {
                arr.push(item);
                checkId.push(item.productCartId);
            } else {
                item.checked = true;
                arr.push(item);
                checkId.push(item.productCartId);
            }
            total_price += (parseFloat(item.productPrice.currentPrice) * item.quantity);
        })
        total_price = parseFloat(total_price).toFixed(2);

        this.setState({
            checkedGoodsIdList: checkId,
            cartList: this.state.cartList,
            total: total_price,
            cartCheckList: arr
        });
    }

    //全不选
    checkno = () => {
        this.state.cartList.map((item, index) => {
            item.checked = false
        })
        let total = 0;
        total = parseFloat(total).toFixed(2);
        this.setState({cartList: this.state.cartList, total, checkedGoodsIdList: [], cartCheckList: [],})
    }

    // 获取购物车
    async getShoppingCartList() {
        try {
            let res = await shoppingCartModel.getShoppingCartList();
            for (let item of res) {
                item.checked = false;
                item.product.coverImage = JSON.parse(item.product.coverImage);
                item.productPrice.currentPrice = parseFloat(item.productPrice.currentPrice).toFixed(2)
            }
            this.setState({cartList: res});
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 总价
    totaoPrice() {
        let total = 0;
        this.state.cartList.map((item, index) => {
            if (item.checked) {
                total += parseFloat(item.productPrice.currentPrice) * item.quantity;
            }
        })
        total = parseFloat(total).toFixed(2);
        this.setState({
            total: total
        })
    }

    // 加减
    addreduce = (res) => {
        let index: number = res.currentTarget.dataset.index;
        let typeName: string = res.currentTarget.dataset.typename;
        let cartList = this.state.cartList;

        switch (typeName) {
            case 'plus':
                cartList[index].quantity++;
                break;
            case 'reduce':
                cartList[index].quantity--;
                if (cartList[index].quantity == 1) {
                    cartList[index].quantity = 1;
                }
                break;
        }

        this.totaoPrice();
        this.setState({cartList});
        res.stopPropagation();
    }

    // 删除商品
    del_goods() {
        let checkedGoodsIdList = this.state.checkedGoodsIdList;

        checkedGoodsIdList.map((item, index) => {
            this.delGoodsFn(item);
            this.getShoppingCartList();
        })
    }

    async delGoodsFn(productCartId) {
        try {
            await shoppingCartModel.delGoods(productCartId);
        } catch (e) {
            dialog.handleError(e);
        }
    }


    // 去商品详情
    goGoodsDetail = (res) => {
        let productId: number = res.currentTarget.dataset.productid;
        let productCartId: number = res.currentTarget.dataset.productcartid;

        navigate.go(`../goodsDetails/goodsDetails?productId=${productId}&productCartId=${productCartId}&shoppingType=edit`)
    }

    // 去结算
    settlement = () => {
        let cartCheckList = this.state.cartCheckList;
        let product = [];
        let obj: object = {};
        let obj1: object = {};
        let checkList = []

        for (let item of cartCheckList) {
            if (item.checked) {
                obj1 = {
                    productId: item.productId,
                    productName: item.productName,
                    minPeice: item.productPrice.currentPrice,
                    desc: item.product.description,
                    quantity: item.quantity,
                    img: item.product.coverImage[0]
                }
                checkList.push(obj1);
            }
            obj = {
                productId: item.product.productId,
                productPriceId: item.productPriceId,
                thatCount: item.quantity
            }
            product.push(obj);
        }

        if (cartCheckList.length == 0) {
            showToast({title: '至少选择一个商品', icon: 'none'});
        } else {
            navigate.go(`../confirmOrder/confirmOrder?product=${JSON.stringify(product)}&checkList=${JSON.stringify(checkList)}`)
        }
        this.setState({
            cartCheckList: [],
            checkedGoodsIdList: [],
        });
    }


    render() {
        return (
            <View>
                <View className={'border_top edit_goods font_size30 color_999 text_center bg_white position_fix w100'}
                      onClick={this.cartHeadBtn}>
                    {this.state.cart_head}
                </View>

                <View className={'bg_white list_commodities margin_btm88'}>
                    {
                        this.state.cartList.map((item, index) => {
                            return <View key={index} data-productid={item.productId}
                                         data-productcartid={item.productCartId} className={'w90 flex_space_bet'}
                                         onClick={this.goGoodsDetail}>
                                <View onClick={this.choice} data-index={index} className={'choice'}>
                                    {item.checked ? (
                                        <Image src={require('../../images/choice_cur.png')}></Image>
                                    ) : (
                                        <Image src={require('../../images/choice.png')}></Image>
                                    )}
                                </View>

                                <View className={'flex_space_bet border_btm goods_list'}>
                                    <View className={'commodity_map'}>
                                        <Image mode={'aspectFill'} className={'w100 h100'} src={item.product.coverImage[0]}></Image>
                                    </View>
                                    <View className={'goods_r'}>
                                        <Text
                                            className={'ellipsis2 color_333 font_size30'}>{item.product.productName}</Text>
                                        <View className={'flex_space_bet price'}>
                                            <View className={'font_size36 color_333'}>
                                                <Text className={'font_size28'}>￥</Text>{item.productPrice.currentPrice}
                                            </View>
                                            <View className={'required_quantity flex_space_bet'}>
                                                <Text data-index={index}
                                                      className={'font_size36 text_center' + ' ' + (item.quantity == 1 ? 'event_none color_999' : '')}
                                                      onClick={this.addreduce} data-typename={'reduce'}>-</Text>
                                                <Input disabled={true} className={'text_center'} value={item.quantity}/>
                                                <Text data-index={index} data-typename={'plus'}
                                                      className={'font_size36 text_center'}
                                                      onClick={this.addreduce}>+</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        })
                    }
                </View>


                {/*底部全选结算*/}
                <View className={'position_fix w100 flex_space_bet bg_white settlement'}>

                    {
                        this.state.cartCheckList.length == this.state.cartList.length ? (
                            <View className={'flex_center all_election font_size28 h100 color_333'}
                                  onClick={this.checkno}>
                                <View className={'choice'}>
                                    <Image src={require('../../images/choice_cur.png')}></Image>
                                </View>全选
                            </View>
                        ) : (
                            <View className={'flex_center all_election font_size28 h100 color_333'}
                                  onClick={this.checkall}>
                                <View className={'choice'}>
                                    <Image src={require('../../images/choice.png')}></Image>
                                </View>全选
                            </View>
                        )
                    }

                    {
                        this.state.cart_status == 'edit_goods' ? (
                            <View className={'flex_space_bet h100'} style={'width:78%;'}>
                                <View className={'font_size34'}>
                                    合计：<Text className={'color_000'}>￥{this.state.total}</Text>
                                </View>
                                <View onClick={this.settlement}
                                      className={'submit_btn settlement_btn text_center h100'}>去结算({this.state.cartCheckList.length})</View>
                            </View>
                        ) : (
                            <View className={'submit_btn settlement_btn text_center h100'}
                                  onClick={this.del_goods}>删除</View>
                        )
                    }
                </View>
            </View>
        )
    }
}
