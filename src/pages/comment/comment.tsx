import Taro, { Component, Config, showToast } from '@tarojs/taro'
import { View, Text, Textarea} from '@tarojs/components'
import './comment.scss'
import dialog from '../../utils/dialog'
import navigate from '../../utils/navigate'
import commentsModel from '../../models/commentsModel'


export default class Comment extends Component {
    config: Config = {
        navigationBarTitleText: '评论'
    }

    constructor() {
        super()
        this.state = {
            comment:'',// 评论框
        }
    }
    commentClick = (res) => {
        this.setState({comment:res.detail.value})
    }

    // 发布
    async release(){
        let contents:string = this.state.comment;
        let shareId:number = Number(this.$router.params.shareId);

        try {
            await commentsModel.createCommnent(shareId, 1, contents, 0, Array);
            navigate.back();
        } catch (e) {
            dialog.handleError(e)
        }
    }

    releaseno = () => {
        if(this.state.comment == ''){
            showToast({title: '请输入评论内容',icon: 'none'});
        }
    }

    render () {
        return (
            <View>
                <Textarea className={'w90 clear_text font_size34'} value={this.state.comment} onInput={this.commentClick} placeholderClass={'color_999'} placeholder={'输入评论'}></Textarea>


                <View className={'bg_white position_fix w100 btm_btn'}>
                    {
                        this.state.comment.length == 0 ? (
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
