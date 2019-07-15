import Taro, {Component, Config, pageScrollTo, previewImage, showToast} from '@tarojs/taro'
import {View, Text, Input, Image, Swiper, SwiperItem} from '@tarojs/components'
import './goodsDetails.scss'
import navigate from '../../utils/navigate'
import dialog from '../../utils/dialog'
import goodsDetailModel from '../../models/goodsDetailModel'
import goodsModel from '../../models/goodsModel'


export default class GoodsDetails extends Component {
    config: Config = {
        navigationBarTitleText: '商品详情'
    }

    constructor() {
        super()
        this.state = {
            goods_num: 1,// 商品数量
            scroll_top: 0,
            remark: '',// 已选
            detail: {},// 商品详情
            productPriceEntities: [],
            open: false,// 展开
            spread: false,// 展开
            service: false,// 展开
            totalPrice: 0,// 总价
            productPriceId: 0,// 产品价格ID
            shoppingType: 'edit',// 加入购物车类型、修改、新添加
            navList: [{key: 'goods', title: '商品'}, {key: 'details', title: '详情'}],// 导航列表
            goodsCur: 0,// 当前选中
            originalPrice:0,// 商品原价
        }
    }

    componentDidShow() {
        this.getGoodsDetail();// 获取购物车详情
        this.setState({shoppingType: this.$router.params.shoppingType})
        //console.log(this.$router.params.shoppingType);
    }

    // 页面滚动
    onPageScroll(res) {
        let scroll_top = this.state.scroll_top;
        let goodsCur: number = this.state.goodsCur;

        if (res.scrollTop >= 500 && res.scrollTop <= 600) {
            scroll_top = res.scrollTop;
        }
        switch (res.scrollTop) {
            case 0:
                goodsCur = 0;
                break;
            case scroll_top:
                goodsCur = 1;
                break;
        }
        this.setState({goodsCur, scroll_top});
    }

    // 选择商品数量
    choice_num = (res) => {
        let status: number = res.currentTarget.dataset.goods_status;
        let goods_num: number = this.state.goods_num;
        let productPriceEntities = this.state.productPriceEntities;
        let totalPrice: number = this.state.totalPrice;

        productPriceEntities.map((item, index) => {
            if (item.checked) {
                switch (status) {
                    case 'plus':
                        goods_num++;
                        totalPrice = (parseFloat(item.currentPrice) * goods_num).toFixed(2);
                        break;
                    case 'reduce':
                        if (goods_num == 1) {
                            goods_num = 1
                        } else {
                            goods_num--;
                            totalPrice = (parseFloat(item.currentPrice) * goods_num).toFixed(2);
                        }
                        break;
                }
            }
        });

        this.setState({totalPrice, goods_num})
    }

    // 选择商品颜色
    choice_color = (res) => {
        let key: number = res.currentTarget.dataset.index;
        let remark: string = res.currentTarget.dataset.remark;
        let productPriceEntities = this.state.productPriceEntities;
        let totalPrice: number = this.state.totalPrice;
        let goods_num: number = this.state.goods_num;
        let productPriceId: number = this.state.productPriceId;
        let originalPrice:number = this.state.originalPrice;

        productPriceEntities.map((item, index) => {
            if (key == index) {
                item.checked = true;
                //console.log('单价：'+item.currentPrice);
                totalPrice = (parseFloat(item.currentPrice) * goods_num).toFixed(2);
                productPriceId = item.productPriceId;
                originalPrice = parseFloat(item.currentPrice).toFixed(2);
            } else {
                item.checked = false;
            }
        })

        this.setState({
            remark, originalPrice,
            productPriceId,
            totalPrice,
            productPriceEntities
        })
    }

    // 查看商品详情图
    previewImage = (res) => {
        let img:string = res.currentTarget.dataset.img;
        let detail: object = this.state.detail;
        let arr: Array = [];
        detail.productImageEntities.map((item, index) => {
            arr.push(item.url);
        });
        previewImage({
            current: img,
            urls: arr
        });
    }


    // 切换头部导航
    headerNav = (res) => {
        let navType: string = res.currentTarget.dataset.navtype;
        let goodsCur: number = res.currentTarget.dataset.index;

        switch (navType) {
            case 'goods':
                pageScrollTo({scrollTop: 0, duration: 300});
                break;
            case 'details':
                pageScrollTo({scrollTop: 580, duration: 300});
                break;
        }
        this.setState({goodsCur});
    }

    // 获取详情列表
    async getGoodsDetail() {
        let productId: number = Number(this.$router.params.productId);
        let remark: string = this.state.remark;
        let totalPrice: number = this.state.totalPrice;
        let goods_num: number = this.state.goods_num;
        let productPriceId: number = this.state.productPriceId;
        let originalPrice:number = this.state.originalPrice;

        try {
            let res = await goodsDetailModel.getGoodsDetail(productId);

            res.productPriceEntities.map((item, index) => {
                item.checked = false
                res.productPriceEntities[0].checked = true
                if (item.checked == true) {
                    remark = item.remark;
                    totalPrice = (parseFloat(item.currentPrice) * goods_num).toFixed(2);
                    productPriceId = item.productPriceId;
                    originalPrice = parseFloat(item.currentPrice).toFixed(2);
                }
            })
            this.setState({
                totalPrice,productPriceId, remark,
                originalPrice, productPriceEntities: res.productPriceEntities, detail: res
            })

        } catch (e) {
            dialog.handleError(e);
        }
    }


    // 添加到购物
    async AddToCart(res) {
        let quantity: number = this.state.goods_num;
        let productId: number = res.currentTarget.dataset.productid;
        let productPriceId: number = this.state.productPriceId;


        try {
            let res = await goodsDetailModel.AddToCart(quantity, productId, productPriceId);
            showToast({title: '添加成功，在购物车等亲~', icon: 'none'})
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 修改商品
    async updateCart() {
        let productCartId: number = this.$router.params.productCartId;
        let quantity: number = this.state.goods_num;

        try {
            await goodsDetailModel.updateCart(productCartId, quantity);
            showToast({title: '添加成功，在购物车等亲~', icon: 'none'})
        } catch (e) {
            dialog.handleError(e)
        }
    }

    // 展开收缩
    shrink = (res) => {
        let _this = this;
        let openType = res.currentTarget.dataset.opentype;
        let open: boolean = this.state.open;
        let spread: boolean = this.state.spread;
        let service:boolean = this.state.service;

        switch (openType) {
            case 'open':
                open = !_this.state.open;
                break;
            case 'spread':
                spread = !_this.state.spread;
                break;
            case 'service':
                service = !_this.state.service;
                break;
        }
        this.setState({open, spread, service})
    }

    // 马上购买
    async purchase(res) {
        let img: string = res.currentTarget.dataset.img;
        let productId: number = res.currentTarget.dataset.productid;
        let minPeice: number = res.currentTarget.dataset.minpeice;
        let productName: string = res.currentTarget.dataset.productname;
        let desc: string = res.currentTarget.dataset.desc;


        let product: Array = [];
        let obj: object = {};
        let productPriceId: number = 0;
        let checkList = [
            {productId, productName, minPeice, desc, quantity: this.state.goods_num, img}
        ];

        try {
            let res = await goodsModel.goShopping(productId);
            for (let item of res.productPriceEntities) {
                productPriceId = item.productPriceId;
            }
            obj = {
                productId,
                productPriceId,
                thatCount: this.state.goods_num
            }
            product.push(obj);

            navigate.go(
                `../confirmOrder/confirmOrder?product=${JSON.stringify(product)}&checkList=${JSON.stringify(checkList)}`
            );
        } catch (e) {
            dialog.handleError(e)
        }
    }

    render() {
        let detail = this.state.detail;
        return (
            <View>
                <View className={'flex_spacea_round collar_street_header position_fix w100 bg_white font_size28'}>
                    {
                        this.state.navList.map((item, index) => {
                            return <View key={index}
                                         className={this.state.goodsCur == index ? 'current' : '' + 'text_center'}
                                         onClick={this.headerNav} data-index={index}
                                         data-navtype={item.key}>{item.title}
                                <View></View>
                            </View>
                        })
                    }
                </View>

                {/*商品轮播*/}
                <View className={'banner position_re'}>
                    <Swiper
                        indicatorColor='#88a2b7'
                        indicatorActiveColor='#fff'
                        circular
                        indicatorDots
                        autoplay>
                        {
                            detail.coverImage.map((item, index) => {
                                return <SwiperItem key={index}>
                                            <Image className={'h100'} mode={'aspectFill'} src={item}></Image>
                                        </SwiperItem>
                            })
                        }
                    </Swiper>
                </View>


                {/*商品信息*/}
                <View className={'bg_white'}>
                    <View className={'w90 goods_tit font_size34 color_333'}>{detail.productName}</View>
                </View>

                <View className={'margin_top20 bg_white'}>
                    <View className={'w90'}>
                        <View className={'pub_list border_btm flex_space_bet'} onClick={this.shrink}
                              data-opentype={'spread'}>
                            <View className={'font_size30'}>
                                促销<Text className={'font_size26 color_999 margin_left30'}>可享受以下促销</Text>
                            </View>
                            <Image src={require('../../images/arrow_b.png')} className={'arrow_r rotate_arr' + ' ' + (this.state.spread ? 'rotate_arr_cur' : '')}></Image>
                        </View>
                        <View className={this.state.spread ? 'on_show' : 'on_hide'}>
                            <View className={'flex_start font_size30 promotion'}>
                                <Text className={'promotion_tag text_center font_size22'}>促销</Text>
                                <View className={'margin_left30'}>满69元减10、99元减20元，100名额，用完即止</View>
                            </View>
                        </View>
                    </View>
                </View>

                <View className={'margin_top20 bg_white'}>
                    <View className={'w90'}>
                        <View className={'pub_list border_btm flex_space_bet'} onClick={this.shrink}
                              data-opentype={'service'}>
                            <View className={'font_size30'}>
                                服务<Text className={'font_size26 color_999 margin_left30'}>可享受以下服务</Text>
                            </View>
                            <Image src={require('../../images/arrow_b.png')} className={'arrow_r rotate_arr' + ' ' + (this.state.service ? 'rotate_arr_cur' : '')}></Image>
                        </View>
                        <View className={this.state.service ? 'on_show' : 'on_hide'}>
                            <View className={'flex_start font_size30 promotion'}>
                                <Text className={'promotion_tag text_center font_size22'}>服务</Text>
                                <View className={'margin_left30'}>七天包退，30天包换</View>
                            </View>
                        </View>
                    </View>
                </View>

                <View className={'margin_top20 bg_white'}>
                    <View className={'w90'}>
                        <View className={'pub_list border_btm flex_space_bet'} onClick={this.shrink}
                              data-opentype={'open'}>
                            <View className={'font_size30'}>
                                已选<Text className={'margin_left30'}>{this.state.remark}，{this.state.goods_num}个</Text>
                            </View>
                            <Image src={require('../../images/arrow_b.png')} className={'arrow_r rotate_arr' + ' ' + (this.state.open ? 'rotate_arr_cur' : '')}></Image>
                        </View>
                        <View className={'goods_color_num' + ' ' + (this.state.open ? 'on_show' : 'on_hide')}>
                            <View className={'flex_start'+' '+(detail.productPriceEntities.length == 0 ? 'on_hide': '')}>
                                <Text className={'color_999 font_size26'} style={'margin-top:32rpx;'}>颜色</Text>
                                <View className={'colour font_size28'}>
                                    {
                                        this.state.productPriceEntities.map((item, index) => {
                                            return <Text key={index} className={(item.checked ? 'colour_cur' : '')}
                                                         onClick={this.choice_color} data-index={index}
                                                         data-remark={item.remark}>{item.remark}</Text>
                                        })
                                    }
                                </View>
                            </View>
                            <View className={'flex_start_center'+' '+(detail.productPriceEntities.length==0?'class_num': '')}>
                                <Text className={'color_999 font_size26'}>数量</Text>
                                <View className={'goods_num flex_center color_333'}>
                                    <Text
                                        className={'h100 text_center font_size34' + ' ' + (this.state.goods_num == 1 ? 'color_999 event_none' : '')}
                                        data-goods_status={'reduce'} onClick={this.choice_num}>-</Text>
                                    <Input className={'text_center h100'} value={this.state.goods_num}/>
                                    <Text className={'h100 text_center font_size34'} data-goods_status={'plus'}
                                          onClick={this.choice_num}>+</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/*商品详情*/}
                <View className={'bg_white margin_top20 margin_btm140'}>
                    <View className={'w90'} style={'padding-bottom:30rpx;'}>
                        <View className={'pub_list color_999 font_size30'}>商品详情</View>
                        <View>
                            {
                                detail.productImageEntities.map((item, index) => {
                                    return <Image mode={'aspectFill'} onClick={this.previewImage} data-img={item.url}
                                                  key={index} src={item.url} className={'w100'}></Image>
                                })
                            }
                        </View>
                    </View>
                </View>

                {/*为你推荐*/}
                <View className={'margin_top30 bg_white on_hide'}>
                    <View
                        className={'collar_product_tit color_999 font_size20 border_btm text_center flex_center flex_column'}>
                        <View className={'font_size34'}>为你推荐</View>RECOMMEND
                    </View>
                    <View className={'flex_space_bet w90 border_btm goods_list'}>
                        <View className={'commodity_map'}>
                            <Image mode={'aspectFill'} className={'w100 h100'} src={require('../../images/spectrum3.png')}></Image>
                        </View>
                        <View className={'goods_r'}>
                            <Text className={'ellipsis2 color_333 font_size30'}>小宇青年 烤箱家用小 烘焙多功能 全自动 迷你大容量复古电烤箱</Text>
                            <View className={'flex_space_bet price'}>
                                <View className={'flex_column font_size36 color_333'}>
                                    ￥331.00<Text className={'color_999 font_size26 original_price'}>￥469.00</Text>
                                </View>
                                <View className={'submit_btn1 text_center go_shopping font_size30'}>去购买</View>
                            </View>
                        </View>
                    </View>
                    <View className={'flex_space_bet w90 border_btm goods_list'}>
                        <View className={'commodity_map'}>
                            <Image mode={'aspectFill'} className={'w100 h100'} src={require('../../images/spectrum3.png')}></Image>
                        </View>
                        <View className={'goods_r'}>
                            <Text className={'ellipsis2 color_333 font_size30'}>小宇青年 烤箱家用小 烘焙多功能 全自动 迷你大容量复古电烤箱</Text>
                            <View className={'flex_space_bet price'}>
                                <View className={'flex_column font_size36 color_333'}>
                                    ￥331.00<Text className={'color_999 font_size26 original_price'}>￥469.00</Text>
                                </View>
                                <View className={'submit_btn1 text_center go_shopping font_size30'}>去购买</View>
                            </View>
                        </View>
                    </View>
                </View>


                {/*底部固定*/}
                <View className={'goods_footer position_fix w100 bg_white flex_space_bet font_size30'}>
                    {
                        this.state.shoppingType == 'edit' ? (
                            <View className={'color_333 w50 text_center h100'} data-quantity={detail.quantity}
                                  data-productid={detail.productId} onClick={this.updateCart}>加入购物车</View>
                        ) : (
                            <View className={'color_333 w50 text_center h100'} data-productid={detail.productId}
                                  onClick={this.AddToCart}>加入购物车</View>
                        )
                    }

                    <View className={'w50 text_center h100'} onClick={this.purchase} data-desc={detail.description}
                          data-productname={detail.productName} data-productid={detail.productId}
                          data-minPeice={this.state.originalPrice} data-img={detail.coverImage[0]}>
                        ￥{this.state.totalPrice} <Text className={'margin_left25'}>立即购买</Text>
                    </View>
                </View>
            </View>
        )
    }
}
