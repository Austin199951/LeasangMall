import Taro, {Component, Config, setNavigationBarTitle, setStorageSync, showToast, getStorageSync} from '@tarojs/taro'
import { View,Input, Image, Textarea} from '@tarojs/components'
import './createRecipes.scss'
import pictureUploadModel from '../../models/pictureUploadModel'
import recipesModel from '../../models/recipesModel'
import dialog from '../../utils/dialog'
import navigate from '../../utils/navigate'


export default class CreateRecipes extends Component {
    config: Config = {
        navigationBarTitleText: ''
    }
    constructor() {
        super()
        this.state = {
            foodstory:'', // 美食背后的故事
            tips_box:'',// 小贴士
            contents:'',// 步骤说明
            materialList:[],// 用料列表
            materialsName:'',//食材名称
            quantity:'',// 食材用量
            recipeCoverImg:'',//封面图
            stepList:[],// 步骤列表
            imageUrl:'',// 步骤图片
            recipesName:'',// 食谱名称
            step:1,// 步骤
            recipeType:'',// 食谱类型
        }
    }

    componentWillMount () {
        this.getRecipeDetail();
    }

    componentDidShow () {
        this.getMaterListFn();
        this.getStepListFn();
    }

    getMaterListFn(){
        let materObj:object = getStorageSync('materObj');
        let materialList:Array = this.state.materialList;

        materialList.map((item, index) => {
            if(index == materObj.key){
                item.materialsName = materObj.materName;
                item.quantity = materObj.materNum
            } else if (item.recipeMaterialsId == materObj.delId){
               materialList.splice(index, 1);
            }
        })
        this.setState({ materialList });
    }

    getStepListFn(){
        let stepObj:object = getStorageSync('stepObj');
        let stepList:Array = this.state.stepList;

        stepList.map((item, index) => {
            if(index == stepObj.key){
                item.contents = stepObj.contents;
            }
        });
        this.setState({ stepList });
    }


    // 获取食谱详情
    getRecipeDetail = async () => {
        let recipeType:string = this.$router.params.recipeType;
        let recipeId:number = Number(this.$router.params.recipeId);
        let materialList:Array = this.state.materialList;
        let stepList:Array = this.state.stepList;

        switch (recipeType) {
            case 'edit':
                setNavigationBarTitle({title:'编辑食谱'});
                try {
                    let res = await recipesModel.getRecipeDetail(recipeId);

                    res.recipeMaterialsList.map((item, index) => {
                        materialList.push({
                            materialsName:item.materialsName,
                            quantity:item.quantity,
                            recipeMaterialsId:item.recipeMaterialsId
                        })
                    })

                    res.recipeStepList.map((item, index) => {
                        stepList.push({
                            imageUrl:item.imageUrl,
                            contents:item.contents,
                            recipeStepId:item.recipeStepId,
                            opacity: false,
                            number:-1
                        })
                    })

                    this.setState({
                        recipeCoverImg: res.coverImage, recipesName: res.recipeTitle,
                        foodstory: res.recipeDescribe, tips_box: res.tips, materialList, stepList, recipeType
                    });
                } catch (e) {
                    dialog.handleError(e)
                }
                break;
            case 'new':
                setNavigationBarTitle({title:'创建食谱'});
                break;
        }
    }

    // 设置输入
    food_story = (res) => {
        this.setState({foodstory:res.detail.value});
    }

    tips = (res) => {
        this.setState({tips_box:res.detail.value});
    }

    step_instr = (res) => {
        this.setState({contents:res.detail.value});
    }

    materialBox = (res) => {
        let mater = res.currentTarget.dataset.mater;
        let m = this.state.materialsName;
        let v = this.state.quantity;

        switch (mater) {
            case 'material':
                m = res.detail.value
                break;
            case 'volume':
                v = res.detail.value
                break;
        }

        this.setState({materialsName:m, quantity:v});
    }

    // 添加材料
    addIngredients(){
        let quantity = this.state.quantity;
        let materialsName = this.state.materialsName;
        let mater_list = this.state.materialList;

        if(quantity == '' || materialsName == ''){
            showToast({title:'请输入要添加的材料信息', icon:'none'});
        }

        let obj = {materialsName, quantity, recipeMaterialsId:0}
        setStorageSync('materObj', {});
        this.stepFn(materialsName,quantity,'请输入要添加的材料信息',mater_list,obj);
        this.setState({materialsName:'', quantity:''});
    }

    // 添加步骤
    addStep(){
        this.setState({imageUrl:'', contents:''});
        let step_list = this.state.stepList;
        let imageUrl = this.state.imageUrl;
        let contents = this.state.contents;
        let obj = { imageUrl, contents,recipeStepId:0,opacity:false }
        setStorageSync('stepObj',{})
        this.stepFn(imageUrl,contents,'请上传步骤图片和步骤说明',step_list,obj);
    }

    // 步骤方法
    stepFn(str1:string,str2:string,tips,listArr,obj){
        if(str1 == '' || str2 == ''){
            showToast({title:tips, icon:'none'});
        } else {
            listArr.push(obj);
        }
        this.setState({ listArr });
    }


    // 上传食谱封面
    recipeCover(){
        let _this = this;
        pictureUploadModel.pictureUpLoad(res =>{
            _this.setState({
                recipeCoverImg:JSON.parse(res.data).data
            })
        })
    }

    // 上传步骤图片
    addStepImg(){
        let _this = this;
        pictureUploadModel.pictureUpLoad(res => {
            _this.setState({
                imageUrl:JSON.parse(res.data).data
            })
        })
    }

    // 添加食谱名称
    addRecipesName = (res) => {
        this.setState({recipesName:res.detail.value})
    }

    // 创建食谱
    async confirm(){
        this.createFn(res => {
            this.recipeFn();
        });
    }

    // 创建方法
    createFn(callback){
        this.setState({ imageUrl:'', contents:'', materialsName:'', quantity:'' });
        let materialsName:string = this.state.materialsName;
        let quantity:string = this.state.quantity;
        let imageUrl:string = this.state.imageUrl;
        let contents:string = this.state.contents;
        let coverImage:string = this.state.recipeCoverImg;// 封面照片
        let recipeTitle:string = this.state.recipesName;// 食谱标题
        let recipeDescribe:string = this.state.foodstory;// 食谱描述
        let recipeStepList = this.state.stepList;// 食谱步骤
        let recipeMaterialsList = this.state.materialList;// 食谱食材


        if(imageUrl != '' || contents != ''){
            let obj = {
                imageUrl,
                contents
            }
            recipeStepList.push(obj);
        }
        if(materialsName != '' || quantity != ''){
            let obj = {
                materialsName,
                quantity
            }
            recipeMaterialsList.push(obj);
        }

        if(coverImage == ''){
            showToast({title:'请上传食谱封面', icon:'none'});
        } else if(recipeTitle == ''){
            showToast({title:'请输入食谱名称', icon:'none'});
        } else if(recipeDescribe == ''){
            showToast({title:'请输入食谱描述', icon:'none'});
        } else if(recipeMaterialsList.length <= 0){
            showToast({title:'至少添加一条食材', icon:'none'});
        }else if(recipeStepList.length <= 0){
            showToast({title:'至少添加一条步骤', icon:'none'});
        } else {
            callback();
        }

        this.setState({stepList:recipeStepList, materialList:recipeMaterialsList});
    }

    // 更改步骤图片
    editImg(res){
        let index:number = res.currentTarget.dataset.index;
        let stepList:Array = this.state.stepList;

        pictureUploadModel.pictureUpLoad(res =>　{
            stepList[index].imageUrl = JSON.parse(res.data).data;
        });
        this.setState({stepList});
    }

    // 去编辑
    goEdit = (res) =>　{
        let editType:string = res.currentTarget.dataset.edittype;
        let contents:string = res.currentTarget.dataset.contents;
        let materName:string = res.currentTarget.dataset.matername;
        let quantity:string = res.currentTarget.dataset.quantity;
        let stepIndex:number = res.currentTarget.dataset.setpindex;
        let isDelId:number = res.currentTarget.dataset.isdelid;


        navigate.go(`../stepInstru/stepInstru?editType=${editType}&stepIndex=${stepIndex}&materName=${materName}&quantity=${quantity}&contents=${contents}&isDelId=${isDelId}`);

        setStorageSync('stepObj', {});
        setStorageSync('materObj', {});
    }

    // 编辑食谱
    editRecipe = async () => {
        setStorageSync('stepObj', {});
        setStorageSync('materObj', {});

        this.createFn(res => {
            let recipeId:number = Number(this.$router.params.recipeId);
            this.recipeFn(recipeId);
        });
    }

    // 创建编辑方法
    async recipeFn( recipeId? ){
        let tips:string = this.state.tips_box;// 小贴士
        let recipeTypeId:number = [1];// 食谱分类ID
        let recipeTitle:string = this.state.recipesName;// 食谱标题
        let recipeDescribe:string = this.state.foodstory;// 食谱描述
        let recipeStepList = this.state.stepList;// 食谱步骤
        let recipeMaterialsList = this.state.materialList;// 食谱食材
        let coverImage:string = this.state.recipeCoverImg;// 封面照片

        try {
            if( recipeId ){
                await recipesModel.editRecipe(recipeId, coverImage,recipeTitle,tips,recipeDescribe,recipeTypeId,recipeStepList,recipeMaterialsList);
            } else {
                await recipesModel.createRecipe(coverImage,recipeTitle,tips,recipeDescribe,recipeTypeId,recipeStepList,recipeMaterialsList);
            }

            navigate.back();
        } catch (e) {
            dialog.handleError(e);
        }
    }

    // 调整
    adjustment = (res) => {
        let index:number = res.currentTarget.dataset.index;
        let stepList:Array = this.state.stepList;
        stepList[index].opacity =! stepList[index].opacity;
        this.setState({ stepList });
    }

    // 删除步骤
    delStep = (res) => {
        let index:number = res.currentTarget.dataset.index;
        let stepList:Array = this.state.stepList;

        stepList.map((item, key) => {
            if(key == index) {
                stepList.splice(key, 1);
            }
        });

        this.setState({ stepList });
    }

    //步骤上调
    moveUpStep = (res) => {
        let index:number = res.currentTarget.dataset.index;
        let stepList:Array = this.state.stepList;
        let upString:string = '';

        if(index == 0){
            showToast({title:'已经第一步', icon:'none'});
        } else {
            upString = stepList[index];
            stepList[index] = stepList[index - 1];
            stepList[index - 1] = upString;
            stepList[index].number = index - 1;
        }
        this.setState({ stepList });
    }
    // 步骤下调
    moveDownStep = (res) => {
        let index:number = res.currentTarget.dataset.index;
        let stepList:Array = this.state.stepList;
        let upString:string = '';

        if(index >= stepList.length - 1){
            showToast({title:'已经最后一步', icon:'none'});
        } else {
            upString = stepList[index];
            stepList[index] = stepList[index + 1];
            stepList[index + 1] = upString;
            stepList[index].number = index + 1;
        }

        this.setState({ stepList });
    }

    render () {
        return (
            <View>
                <View className={'recipes_over overflow'} onClick={this.recipeCover}>
                    {
                        this.state.recipeCoverImg == '' ? (
                            <View className={'font_size26 color_999 flex_center h100'}>上传食谱封面</View>
                        ) :(
                            <Image mode={'aspectFill'} className={'w100'} src={this.state.recipeCoverImg}></Image>
                        )
                    }
                </View>


                <View className={'w93'}>
                    <Input onInput={this.addRecipesName} value={this.state.recipesName} className={'recipes_tit font_size36 text_center big_tit border_btm'} placeholder={'请输入食谱名称'} maxLength={24} />

                    <Textarea onInput={this.food_story} value={this.foodstory} className={'food_story w100'} placeholderClass={'color_999'} placeholder={'输入这道美食背后的故事'} maxlength={125}></Textarea>
                    <View className={'recipes_tit small_tit'}>用料</View>

                    <View className={'material'}>
                        {
                            this.state.materialList.map((item,index)=>{
                                return  <View onClick={this.goEdit} data-isdelid={item.recipeMaterialsId} data-matername={item.materialsName} data-quantity={item.quantity} data-setpindex={index} data-edittype={'mater'} key={index} className={'pub_list border_btm flex_space_bet'}>
                                            <Input disabled={true} placeholder={'例：洋葱'} maxLength={12} value={item.materialsName}/>
                                            <Input disabled={true} placeholder={'适量'}  maxLength={12} value={item.quantity}/>
                                        </View>
                            })
                        }


                        <View className={'pub_list border_btm flex_space_bet'}>
                            <Input placeholder={'例：洋葱'} maxLength={12} data-mater={'material'} onInput={this.materialBox} value={this.state.materialsName}/>
                            <Input placeholder={'适量'}  maxLength={12} data-mater={'volume'} onInput={this.materialBox} value={this.state.quantity}/>
                        </View>
                    </View>

                    <View className={'recipes_tit small_tit'} onClick={this.addIngredients}>添加食材</View>

                    <View className={'recipes_tit small_tit color_333'} style={'margin-top:70rpx;margin-bottom:0rpx;'}>做法</View>

                    {
                        this.state.stepList.map((item,index)=>{
                            return <View className={'border_btm'} key={index}>
                                        <View className={'flex_space_bet step_tit'}>
                                            <Text className={'font_size36'}>步骤{index+1}</Text>
                                            <View className={'flex_space_bet'}>
                                                <View className={'flex_space_bet'+' '+(item.opacity?'opacity_cur':'opacity_step')}>
                                                    <View className={'flex_center'} onClick={this.delStep} data-index={index}>
                                                        <Image src={require('../../images/recipeDel.png')}></Image>删除
                                                    </View>
                                                    <Text></Text>
                                                    <View className={'flex_center'} onClick={this.moveUpStep} data-index={index}>
                                                        <Image src={require('../../images/moveUp.png')}></Image>上调
                                                    </View>
                                                    <Text></Text>
                                                    <View className={'flex_center'} onClick={this.moveDownStep} data-index={index}>
                                                        <Image src={require('../../images/moveDown.png')}></Image>下调
                                                    </View>
                                                </View>
                                                <Image onClick={this.adjustment} data-index={index} src={require('../../images/adjustment.png')}></Image>
                                            </View>
                                        </View>
                                        <Image mode={'scaleToFill'} data-index={index} onClick={this.editImg} className={'w100'} src={item.imageUrl}></Image>
                                        <View className={'practice'} data-setpindex={index} data-contents={item.contents} onClick={this.goEdit} data-edittype={'step'}>{item.contents}</View>
                                    </View>
                        })
                    }

                    <View className={'margin_top30'}>
                        <View className={'recipes_over overflow'} onClick={this.addStepImg}>
                            {
                                this.state.imageUrl == '' ? (
                                    <View className={'font_size26 color_999 flex_center h100'}>上传步骤图片</View>
                                ) :(
                                    <Image mode={'aspectFill'} className={'w100'} src={this.state.imageUrl}></Image>
                                )
                            }
                        </View>
                        <Input onInput={this.step_instr} value={this.state.contents} className={'food_story explain w100 border_btm'} placeholderClass={'color_999'} placeholder={'添加步骤说明'} maxLength={510} />
                    </View>


                    <View className={'recipes_tit small_tit'} onClick={this.addStep}>增加一步</View>

                    <View className={'recipes_tit small_tit'} style={'margin-top:70rpx;'}>小贴士</View>
                    <Textarea onInput={this.tips} value={this.state.tips_box} className={'food_story explain w100 border_btm'} placeholderClass={'color_999'} placeholder={'添加小贴士，提醒帮友们注意细节。'} maxlength={122}></Textarea>
                </View>
                {
                    this.state.recipeType == 'edit' ? (
                            <View className={'text_center w85 submit_btn continue'} onClick={this.editRecipe}>保存</View>
                        ): (
                        <View className={'text_center w85 submit_btn continue'} onClick={this.confirm}>创建食谱</View>
                    )
                }
            </View>
        )
    }
}
