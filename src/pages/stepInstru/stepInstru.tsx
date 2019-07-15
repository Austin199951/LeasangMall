import Taro, { Component, Config, showToast, setStorageSync, setNavigationBarTitle } from '@tarojs/taro'
import {View, Text, Textarea, Input, Label} from '@tarojs/components'
import './stepInstru.scss'
import navigate from '../../utils/navigate'


export default class Publish extends Component {
    config: Config = {
        navigationBarTitleText: ''
    }

    constructor() {
        super()
        this.state = {
            contents:'',// 美食框
            materName:'',// 食材名称
            materNum:'',// 食材数量
            editType:'',// 编辑类型
        }
    }
    componentDidShow () {
        this.setState({
            editType: this.$router.params.editType,
            contents: this.$router.params.contents,
            materName: this.$router.params.materName,
            materNum: this.$router.params.quantity,
        });

        switch (this.$router.params.editType) {
            case 'step':
                setNavigationBarTitle({title:'修改步骤说明'});
                break;
            case 'mater':
                setNavigationBarTitle({title:'修改食材'});
                break;
        }
    }
    contents = (res) => {
        this.setState({contents: res.detail.value});
    }
    inpName = (res) =>　{
        this.setState({materName: res.detail.value});
    }
    inpNum = (res) =>　{
        this.setState({materNum: res.detail.value});
    }


    // 发布
    async release(){
        let editType:string = this.state.editType;
        let contents:string = this.state.contents;
        let materName:string = this.state.materName;
        let materNum:string = this.state.materNum;
        let stepIndex:number = Number(this.$router.params.stepIndex);

        switch (editType) {
            case 'step':
                if(contents == ''){
                    showToast({title:'请输入修改步骤说明', icon:'none'});
                } else {
                    let stepObj = {key:stepIndex, contents }

                    setStorageSync('stepObj', stepObj);
                }
                break;
            case 'mater':
                if(materName == '' || materNum == ''){
                    showToast({title:'请完善食材', icon:'none'});
                } else {
                    let materObj = {key:stepIndex, materName, materNum}
                    setStorageSync('materObj', materObj);
                }
                break;
        }
        navigate.back();
    }

    // 删除食材
    delRecipe(){
        let isDelId:number = Number(this.$router.params.isDelId);
        setStorageSync('materObj', { delId:isDelId });
        navigate.back();
    }

    render () {
        return (
            <View>
                <View className={'bg_white'+' '+(this.state.editType == 'mater'? 'on_show':'on_hide')}>
                    <View className={'w90 pub_list flex_start'}>
                        <Label for={'username'} className={'flex_space_bet'}>食材名称</Label>
                        <Input type="text" id={'username'} placeholder={'请输入食材名称'} onInput={this.inpName} value={this.state.materName} placeholderClass={'color_999'}/>
                    </View>

                    <View className={'w90 pub_list flex_start'}>
                        <Label for={'username'} className={'flex_space_bet'}>食材用量</Label>
                        <Input type="text" id={'username'} placeholder={'请输入食材用量'} onInput={this.inpNum} value={this.state.materNum} placeholderClass={'color_999'}/>
                    </View>
                </View>

                <View onClick={this.delRecipe} className={'bg_white margin_top30'+' '+(this.state.editType == 'mater'? 'on_show':'on_hide')}>
                    <View className={'pub_list w90 color_red font_size28'}>删除食材</View>
                </View>

                <View className={'bg_white'+' '+(this.state.editType == 'step'? 'on_show':'on_hide')}>
                    <Textarea className={'w90 clear_text font_size34'} maxlength={510} value={this.state.contents} onInput={this.contents} placeholderClass={'color_999'} placeholder={'请输入修改步骤说明'}></Textarea>
                </View>

                <View className={'bg_white position_fix w100 btm_btn'}>
                    <Text onClick={this.release} className={'submit_btn w80 text_center on_show'}>确定</Text>
                </View>
            </View>
        )
    }
}