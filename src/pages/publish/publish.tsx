import Taro, { Component, Config, showToast } from '@tarojs/taro'
import { View, Text,Image, Textarea} from '@tarojs/components'
import './publish.scss'
import pictureUploadModel from '../../models/pictureUploadModel'
import pubWorksModel from '../../models/pubWorksModel'
import dialog from '../../utils/dialog'
import navigate from '../../utils/navigate'


export default class Publish extends Component {
    config: Config = {
        navigationBarTitleText: '上传作品'
    }

    constructor() {
        super()
        this.state = {
            testDesc:'',// 美食框
            imgArr:[],// 图片数组
        }
    }

    test_desc = (res) => {
        this.setState({testDesc:res.detail.value});
    }

    // 图片上传
    async addPicture() {
        let _this = this;
        let imgArr = this.state.imgArr;


        if (imgArr.length >= 9) {
            showToast({title:'最多只能上传9张图片', icon:'none'});
        } else {
            try {
                await pictureUploadModel.pictureUpLoad(res => {
                    let img = JSON.parse(res.data).data;
                    imgArr.push(img);
                    _this.setState({imgArr})
                })
            } catch (e) {
                dialog.handleError(e)
            }
        }
    }


    // 删除图片
    delImg = (res) => {
        let index = res.currentTarget.dataset.index;
        let imgArr = this.state.imgArr;

        imgArr.splice(index,1);
        this.setState({
            imgArr:imgArr
        })
    }


    // 发布
    async release(){
        let contents:string = this.state.testDesc;
        let img:Array = this.state.imgArr;

        try {
            await pubWorksModel.releaseWork(contents, img)
            navigate.back();
        } catch (e) {
            dialog.handleError(e)
        }
    }

    releaseno = () => {
        if(this.state.imgArr.length == 0){
            showToast({title:'请选择美食图片', icon:'none'});
        }
    }


    render () {
        return (
            <View>
                <Textarea className={'w90 clear_text font_size34'} value={this.state.testDesc} onInput={this.test_desc} placeholderClass={'color_999'} placeholder={'记录美食的点滴...'}></Textarea>
                <View className={'w90 margin_top30 margin_btm140'}>
                    <View className={'flex_start_center add_img_box'}>
                        <Image mode={'aspectFill'} onClick={this.addPicture} className={'add_img'} src={require('../../images/add_img.png')}></Image>
                        {
                            this.state.imgArr.map((item,index)=>{
                              return   <View key={index} className={'add_img position_re'}>
                                          <Image mode={'aspectFill'} src={item} className={'w100 h100'}></Image>
                                          <Image mode={'aspectFill'} onClick={this.delImg} data-index={index} className={'error position_ab'} src={require('../../images/error.png')}></Image>
                                      </View>
                            })
                        }
                    </View>
                </View>


                <View className={'bg_white position_fix w100 btm_btn'}>
                    {
                        this.state.imgArr.length == 0 ? (
                            <Text onClick={this.releaseno} className={'release w80 position_fix quit_login text_center'}>发布</Text>
                        ):(
                            <Text onClick={this.release} className={'submit_btn w80 text_center on_show'}>发布</Text>
                        )
                    }
                </View>
            </View>
        )
    }
}