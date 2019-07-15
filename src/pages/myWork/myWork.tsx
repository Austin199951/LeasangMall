import Taro, {Component, Config, getStorageSync, previewImage, setNavigationBarTitle} from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components'
import './myWork.scss'
import navigate from '../../utils/navigate'
import dialog from '../../utils/dialog'
import shareModel from '../../models/shareModel'
import Utils from '../../utils/util'
import endorseModel from "../../models/endorseModel";


export default class MyWork extends Component {
    config: Config = {
        navigationBarTitleText: '',
    }

    constructor() {
        super()
        this.state = {
            pageIndex: 1,
            workList: [],// 作品列表
            workNum: 0,
        }
    }

    componentDidShow() {
        let pageIndex:number = this.state.pageIndex;
        let workList:Array = [];
        this.getMyWork(pageIndex, workList);// 获取我的作品

        let userId = getStorageSync('userId');
        let userid: number = Number(this.$router.params.userId);
        if(userId == userid){
            setNavigationBarTitle({title:'我的作品'});
        } else {
            setNavigationBarTitle({title:'Ta的作品'});
        }
    }

    // 赞
    async endorse(res) {
        let shareId: number = res.currentTarget.dataset.shareid;
        let index: number = res.currentTarget.dataset.index;
        let workList:Array = this.state.workList;

        try {
            if(workList[index].isEndorse){
                await endorseModel.cancelEndorse(shareId, 1);
                workList[index].isEndorse = false;
                workList[index].endorseCount --;
            } else {
                await endorseModel.endorse(shareId, 1);
                workList[index].isEndorse = true;
                workList[index].endorseCount ++;
            }
        } catch (e) {
            dialog.handleError(e);
        }
        this.setState({ workList });
        this.readFn(shareId,index);
        res.stopPropagation();
    }

    // 获取我的作品
    async getMyWork(pageIndex, workList) {
        try {
            let userId: number = Number(this.$router.params.userId);
            let res = await shareModel.getMyWork(userId, pageIndex);

            workList = workList.concat(res.data);
            res.data.map((item, index) => {
                item.img = JSON.parse(item.img);

                let day = parseInt(item.intDiff / 60 / 24);
                let hour = parseInt(item.intDiff / 60 % 24);
                let min = parseInt(item.intDiff % 60);
                item.intDiff = Utils.computingTime(day, hour, min);
            });

            this.setState({workList, workNum: res.totalItemCount})
        } catch (e) {
            dialog.handleError(e)
        }
    }

    onReachBottom() {
        let page: number = this.state.page;
        let workNum: number = Math.ceil(this.state.workNum / 10);
        let workList:Array = this.state.workList;

        if (page < workNum) {
            page++;
            this.getMyWork(page, workList);
        }
        this.setState({ page });
    }

    // 去详情
    goWorkDetail = (res) => {
        let shareId: number = res.currentTarget.dataset.shareid;
        let userId: number = res.currentTarget.dataset.userid;
        navigate.go(`../workDetails/workDetails?shareId=${shareId}&userId=${userId}`);
    }

    // 去评论
    discuss(res) {
        let shareId:number = res.currentTarget.dataset.shareid;
        let index:number = res.currentTarget.dataset.index;
        navigate.go(`../comment/comment?shareId=${shareId}`);
        this.readFn(shareId, index);
        res.stopPropagation();
    }

    // 阅读说说
    async readFn(shareId, index){
        let workList:Array = this.state.workList;

        try {
            await shareModel.read(shareId);
            workList[index].readCount++;
            this.setState({ workList });
        } catch (e) {
            dialog.handleError(e);
        }
    }

    // 查看说说图片
    previewImg = (res) => {
        let img: string = res.currentTarget.dataset.img;
        let index: number = res.currentTarget.dataset.index;
        let shareId: number = res.currentTarget.dataset.shareid;
        let workList:Array = this.state.workList;
        let imgArr = [];

        workList.map((item, key) => {
            if (index == key) {
                imgArr = item.img
            }
        });
        previewImage({
            current: img,
            urls: imgArr
        });
        this.readFn(shareId, index);
        res.stopPropagation();
    }

    render() {
        return (
            <View>
                {
                    this.state.workList.length == 0 ?
                        (<View className={'text_center color_999 no_time'}>暂无作品</View>) : ''
                }
                {
                    this.state.workList.map((item, index) => {
                        return <View key={index} className={'say_list'} data-shareid={item.shareId}
                                     onClick={this.goWorkDetail} data-userid={item.userId}>
                            <View className={'w93 flex_start'}>
                                <View className={'portrait overflow'}>
                                    <Image mode={'aspectFill'} className={'w100 h100'} src={item.portrait}></Image>
                                </View>
                                <View className={'w80'}>
                                    <View className={'author font_size22'}>
                                        <Text className={'on_show font_size26'}>{item.name}</Text>
                                        {item.intDiff}
                                    </View>
                                    <Text className={'clear_text on_show font_size32'}>{item.contents}</Text>
                                    <View className={'illustrations flex_start_center w100'}>
                                        {item.img.map((i, key) => {
                                            return <View key={key} onClick={this.previewImg} data-img={i} data-index={index} data-shareid={item.shareId}>
                                                        <Image mode={'aspectFill'} className={'w100 h100'} src={i}></Image>
                                                    </View>
                                        })}
                                    </View>

                                    <View className={'flex_space_bet num_readers font_size22'}>
                                        {item.readCount}人阅读

                                        <View className={'flex_end text_right'}>
                                            <View className={'flex_center'} onClick={this.endorse} data-index={index} data-shareid={item.shareId}>
                                                {
                                                    item.isEndorse ? (
                                                        <Image mode={'aspectFill'}
                                                               src={require('../../images/fabulous_cur.png')}></Image>
                                                    ) : (
                                                        <Image mode={'aspectFill'} src={require('../../images/fabulous.png')}></Image>
                                                    )
                                                }
                                                {item.endorseCount}
                                            </View>

                                            <View onClick={this.discuss} data-index={index} data-shareid={item.shareId}
                                                  className={'flex_center'}>
                                                <Image mode={'aspectFill'} src={require('../../images/discuss.png')}></Image>
                                                {item.commentCount}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    })
                }
            </View>
        )
    }
}
