// 收藏列表数据

import Model from './model'
import {RecipesList} from "./recipesModel";

export type enshrineNum = Number;

class CollectionMode extends Model {
    // 获取个人收藏列表
    async fetchEnshrine(): Promise<enshrineNum>{
        let res = await this.fetch({url:'Enshrine/ListByUserId'});

        return res;
    }

    // 食谱收藏
    async recipeEnshrine(objId:number, typeId:number): Promise<RecipesList>{
        let res = await this.fetch({url:'Enshrine/Create', data:{objId, typeId}});
        return res;
    }

    // 取消食谱收藏
    async recipeCancelEnshrine(objId:number, typeId:number): Promise<RecipesList>{
        let res = await this.fetch({url:'Enshrine/Delete', data:{objId, typeId}});
        return res;
    }
}

export default new CollectionMode()