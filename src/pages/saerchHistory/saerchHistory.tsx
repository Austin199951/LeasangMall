import Taro, {Component, Config, setStorageSync, getStorageSync, previewImage, showToast} from '@tarojs/taro'
import './saerchHistory.scss'
import {View, Text, Image, Input} from "@tarojs/components";
import navigate from '../../utils/navigate'


export default class Test extends Component{
    config: Config = {
        navigationBarTitleText: '搜索'
    }
    constructor(){
        super();
        this.state = {
            searchArr:[],
            searchBox: '',
        }
    }
    componentWillMount(){
        this.getSaerchHist();
    }

    // 点击回车搜索
    searchBtn = (res) => {
        let search: string = this.state.searchBox;
        if (search == '') {
            showToast({title:'请输入搜索内容',icon:'none'});
        } else {
            this.saveSearchHist();
            this.pushSearchHist(search);
            navigate.go(`../searchResult/searchResult?search=${search}`);
        }
    }

    // 获取搜索历史
    getSaerchHist(){
        let searchArr = getStorageSync('search');
        this.setState({ searchArr });
    }

    //向数组头部塞入一个搜索内容
    pushSearchHist(keyword) {
        let searchArr = this.state.searchArr;
        if (keyword == '') { return }//先检测一下是否存在这个keyword

        this.delSearchHist();
        searchArr.unshift(keyword)
        this.setState({ searchArr });
        this.saveSearchHist();
    }

    // 删除搜索历史
    delSearchHist(){
        let searchArr = [];
        this.setState({searchArr});
        setStorageSync('search',searchArr);
    }


    // 保存搜索历史
    saveSearchHist() {
        let searchArr = this.state.searchArr;
        if(searchArr.length >= 10){return}
        setStorageSync('search',searchArr);
    }

    searchCon = (res) =>　{
        this.setState({searchBox:res.detail.value})
    }

    // 去搜索
    goSearch(res){
        let contents = res.currentTarget.dataset.contents;
        navigate.go(`../searchResult/searchResult?search=${contents}`);
    }

    render(){
        return(
            <View>
                {/*搜索框*/}
                <View className={'bg_white search_box position_fix w100'}>
                    <View className={'w90 flex_space_bet'}>
                        <View className={'subsearch_box flex_start'}>
                            <Image mode={'scaleToFill'} src={require('../../images/search_icon.png')} className={'search_icon'} />
                            <Input focus={true} className={'w90 font_size30'} type="text" placeholder={'搜索食谱 / 材料 / 达人'} value={this.state.searchBox} onInput={this.searchCon} onConfirm={this.searchBtn}/>
                        </View>
                        <View className={'search_btn text_right font_size30'} onClick={this.searchBtn}>搜索</View>
                    </View>
                </View>


                {/*搜索历史*/}
                <View className={'position_fix w100 saerch_history bg_white'}>
                    <View className={'w90'}>
                        <View className={'search_tit flex_space_bet font_size28'}>
                            最近搜索
                            <Image mode={'aspectFill'} onClick={this.delSearchHist} src={require('../../images/del_search.png')}></Image>
                        </View>
                        {
                            this.state.searchArr.map((item, index) => {
                                return <Text onClick={this.goSearch} data-contents={item} key={index} className={'font_size30'}>{item}</Text>
                            })
                        }
                    </View>
                </View>
            </View>
        )
    }
}
