// 获取食谱列表

import Model from './model'
export type RecipesList = Array<any>
import { produce } from 'immer'
import Utils from '../utils/util'

class RecipesModel extends Model{
    // 获取食谱列表
    async getRecipeList(userId:number, pageNumber:number): Promise<RecipesList>{
        let res = await this.fetch({url:'Recipe/ListByUserId', data:{userId, pageNumber}});
        return res;
    }

    // 创建食谱
    async createRecipe(coverImage:string,recipeTitle:string,tips:string,recipeDescribe:string,recipeTypeId:number,recipeStepList,recipeMaterialsList): Promise<RecipesList>{

        let res = await this.fetch({url:'Recipe/Create', data:{coverImage,recipeTitle,tips,recipeDescribe,recipeTypeId,recipeStepList,recipeMaterialsList}});

        return res;
    }

    // 编辑食谱
    async editRecipe(recipeId:number,coverImage:string,recipeTitle:string,tips:string,recipeDescribe:string,recipeTypeId:number,recipeStepList,recipeMaterialsList): Promise<any> {

        let res = await this.fetch({url:'Recipe/Update', data:{recipeId,coverImage,recipeTitle,tips,recipeDescribe,recipeTypeId,recipeStepList,recipeMaterialsList}});

        return res;
    }

    //删除评论
    async deleteCommnent(commentId:number): Promise<RecipesList>{
        let res = await this.fetch({url:'Recipe/DeleteCommnent', data:{commentId}});
        return res;
    }

    // 创建回复评论
    async createCommentReply(userId:number,commentId:number,contents:string): Promise<RecipesList>{
        let res = await this.fetch({url:'Recipe/CreateCommentReply', data:{userId, commentId,contents}});
        return res;
    }

    //发送评论消息
    async createCommnent(recipeId:string, contents:string): Promise<RecipesList>{
        let res = await this.fetch({url:'Recipe/CreateCommnent', data:{recipeId,contents}});
        return res;
    }


    // 获取食谱详情
    async getRecipeDetail(recipeId:string): Promise<RecipesList>{
        let res = await this.fetch({url:'Recipe/GetById', data:{recipeId}});
        return res;
    }

    // 获取食谱列表
    async getRecipeTypeList(pageNumber:number, Search?:string): Promise<RecipesList>{
        let res = await this.fetch({url:'Recipe/PageList', data:{pageNumber, Search}});
        return res;
    }


    // 删除食谱
    async delRrecipe(recipeId:string): Promise<RecipesList>{
        let res = await this.fetch({url:'Recipe/Delete', data:{recipeId}});
        return res;
    }

    // 获取大神列表
    async getOkamiList(pageNumber:number): Promise<any>{
        let res = await this.fetch({url:'Recipe/ExpertUserRecipeList', data:{pageNumber}});
        this.getOkamiListFn(res);
        return res;
    }

    getOkamiListFn = async (res) => {
        let newData = produce(res, (draf) => {
            for(let item of res.data){
                let createDate = new Date(Utils.getCreateTime(item.createDate)); //  创建时间
                let currentTime = new Date(Utils.getCurTime()); // 当前时间

                let curTime = currentTime.getTime(),creTime = createDate.getTime();
                let total = (curTime - creTime)/1000; // 创建时间减去当前时间的到的时间


                let day = parseInt(total / (24*60*60));//计算整数天数
                let afterDay = total - day*24*60*60;//取得算出天数后剩余的秒数
                let hour = parseInt(afterDay/(60*60));//计算整数小时数
                let afterHour = total - day*24*60*60 - hour*60*60;//取得算出小时数后剩余的秒数
                let min = parseInt(afterHour/60);//计算整数分

                item.createDate = Utils.computingTime(day,hour,min);
            }
        });

        return newData;
    }


    // 获取食谱分类列表
    recipeTypeList = async () => {
        let res = await this.fetch({url:'RecipeType/List'});
        return res;
    }

    // 获取分类推荐
    classifyRecommend = async () => {
        let res = await this.fetch({url:'RecipeType/Recommend'});
        return res;
    }
}
export default new RecipesModel()