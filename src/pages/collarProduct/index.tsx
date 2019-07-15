import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text, Image, Swiper, SwiperItem} from '@tarojs/components'
import './index.scss'
import navigate from '../../utils/navigate'

export default class Index extends Component {
    config: Config = {
        navigationBarTitleText: '领上成品'
    }

    constructor() {
        super()
        this.state = {
            autoplay: true,
            menuList: [ // 菜单列表
                {list_img: require('../../images/daily_tasks.png'), menu_tit: '每日任务'},
                {list_img: require('../../images/wonderful_activities.png'), menu_tit: '精彩活动'},
                {list_img: require('../../images/product_store.png'), menu_tit: '领品商城'},
                {list_img: require('../../images/recipe_classify.png'), menu_tit: '食谱分类 '},
            ],
        }
    }

    // 去购物车列表
    goShoppingList = () => {
        navigate.go(`../shoppingCart/shoppingCart`);
    }

    render() {
        return (
            <View>
                <View className={'banner position_re'}>
                    <Swiper
                        indicatorColor='#88a2b7' indicatorActiveColor='#fff' circular indicatorDots autoplay>
                        <SwiperItem>
                            <Image mode={'aspectFill'} src={require('../../images/banner.jpg')}></Image>
                        </SwiperItem>
                        <SwiperItem>
                            <Image mode={'aspectFill'} src={require('../../images/banner.jpg')}></Image>
                        </SwiperItem>
                        <SwiperItem>
                            <Image mode={'aspectFill'} src={require('../../images/banner.jpg')}></Image>
                        </SwiperItem>
                    </Swiper>
                </View>

                {/*小宇·精选*/}
                <View className={'bg_white selected position_re overflow'}>
                    <View
                        className={'collar_product_tit color_999 font_size20 border_btm text_center flex_center flex_column'}>
                        <View className={'font_size34'}>小宇·精选</View>SELECTED
                    </View>
                    <View className={'w90'}>
                        <View className={'flex_space_bet special_area font_size30'}>
                            小宇青年专区
                            <View className={'flex_center color_999 font_size28 font_normal'}>
                                去看看 <Image src={require('../../images/arrow_r.png')} className={'arrow_r'}></Image>
                            </View>
                        </View>
                        <Image mode={'aspectFill'} className={'w100 special_area_bann'}
                               src={require('../../images/special_area_bann.png')}></Image>
                    </View>
                    <View className={'margin_top30 border_top flex_space_bet_wrap recommend_index w90'}>
                            <Image mode={'aspectFill'} className={'w100 h100'} src={require('../../images/spectrum1.png')}></Image>
                        <View className={'flex_space_bet w100'}>
                            <Image mode={'aspectFill'} className={'w100 h100'} src={'../../images/spectrum1.png'}></Image>
                            <Image mode={'aspectFill'} className={'w100 h100'} src={'../../images/spectrum3.png'}></Image>
                        </View>
                    </View>
                </View>

                {/*为你推荐*/}
                <View className={'margin_top30 bg_white'}>
                    <View
                        className={'collar_product_tit color_999 font_size20 border_btm text_center flex_center flex_column'}>
                        <View className={'font_size34'}>为你推荐</View>RECOMMEND
                    </View>
                    <View className={'flex_space_bet w90 border_btm goods_list'}>
                        <View className={'commodity_map'}>
                            <Image mode={'aspectFill'} className={'w100 h100'}
                                   src={require('../../images/spectrum3.png')}></Image>
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
                            <Image mode={'aspectFill'} className={'w100 h100'}
                                   src={require('../../images/spectrum3.png')}></Image>
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

                {/*悬浮框*/}
                <View className={'suspension_box position_fix flex_center'} onClick={this.goShoppingList}>
                    <Image mode={'aspectFill'} src={require('../../images/shpping_cart.png')}></Image>
                </View>
            </View>
        )
    }
}
