import Taro, { Component, Config, showToast } from '@tarojs/taro'
import { View, Text,Image,} from '@tarojs/components'
import './evaluate.scss'
import dialog from '../../utils/dialog'
import commentsModel from '../../models/commentsModel'
import pictureUploadModel from '../../models/pictureUploadModel'


export default class Evaluate extends Component {
    config: Config = {
        navigationBarTitleText: '评价晒单'
    }
    constructor() {
        super()
        this.state = {
            starUrl: require('../../images/stars.png'),//灰色星星
            starActiveUrl: require('../../images/stars_cur.png'), // 亮色星星
            star: 5, //灰色星星个数
            star_cur: 0,// 亮色星星个数
            imgArr:[],// 图片数组
            img:'',// 商品图片
        }
    }
    componentDidShow () {
        this.setState({img:this.$router.params.img});
    }
    // 点亮星星
    starTap = (res) => {
        let imgitem = res.currentTarget.dataset.imgitem;
        let star_id = res.currentTarget.dataset.id;
        let star_cur = this.state.star_cur;
        let star = this.state.star;

        if (imgitem == "starActive") {
            star_cur = Number(star_id);
            star = 5 - star_cur;
        } else {
            star_cur = Number(star_id) + star_cur;
            star = 5 - star_cur;
        }

        this.setState({ star, star_cur });
    }

    // 提交评论
    async confirm(){
        let productId:number = Number(this.$router.params.productId);
        let img:Array = this.state.imgArr;
        let score:number = this.state.star_cur;


        if(score == 0){
            showToast({title:'至少填写一项评论', icon:'none'});
        } else {
            try {
                await commentsModel.createCommnent(productId, 2,'', score,img);
                showToast({title:'评价成功',icon:'none'});
            } catch (e) {
                dialog.handleError(e)
            }
        }
    }

    // 图片添加
    addPictures(){
        let _this = this;
        let imgArr = this.state.imgArr;

        pictureUploadModel.pictureUpLoad(res => {
            imgArr.push(JSON.parse(res.data).data);
            _this.setState({imgArr});
        })
    }

    // 图片删除
    delImg = (res) => {
        let index = res.currentTarget.dataset.index;
        let imgArr = this.state.imgArr;

        imgArr.map((i,key) =>{
            if(index == key){
                imgArr.splice(i,1);
            }
        })
        this.setState({imgArr});
    }

    render () {
        return (
            <View className='evaluate'>
                <View className={'evaluate_header'}>
                    <View className={'w90 flex_start_center color_999 font_size30'}>
                        <View className={'evaluate_goods margin_right25'}>
                            <Image mode={'aspectFill'} className={'w100 h100'} src={this.state.img}></Image>
                        </View>
                        商品评分
                        <View className={'stars margin_left25'}>
                            {
                                this.state.star_cur.map((item,index) => {
                                    return <Image mode={'aspectFill'} data-imgitem={'starActive'} data-id={index+1} key={index} src={this.state.starActiveUrl} onClick={this.starTap}></Image>
                                })
                            }
                            {
                                 this.state.star.map((item,index)=>{
                                     return <Image mode={'aspectFill'} data-imgitem={'starNormal'} data-id={index+1} key={index} src={this.state.starUrl} onClick={this.starTap}></Image>
                                })
                            }
                        </View>
                    </View>
                </View>
                <Text className={'tips w90 on_show font_size28'}>评价可获得积分</Text>
                <View className={'w90'}>
                    <Text className={'on_show font_size28'}>添加图片</Text>
                    <View className={'flex_start_center add_img_box'}>
                        <Image mode={'aspectFill'} className={'add_img'} onClick={this.addPictures} src={require('../../images/add_img.png')}></Image>
                        {
                            this.state.imgArr.map((item,index) => {
                                return <View key={index} className={'add_img position_re'}>
                                        <Image mode={'aspectFill'} className={'w100 h100'} src={item}></Image>
                                        <Image mode={'aspectFill'} data-index={index} onClick={this.delImg} className={'error position_ab'} src={require('../../images/error.png')}></Image>
                                    </View>
                            })
                        }
                    </View>
                </View>

                <View className={'bg_white text_center submit_box'}>
                    <View className={'submit_btn w90'} onClick={this.confirm}>提交</View>
                    <Text className={'font_size28 on_show evaluate_tips'}>评价、晒单赢积分</Text>
                </View>
            </View>
        )
    }
}
