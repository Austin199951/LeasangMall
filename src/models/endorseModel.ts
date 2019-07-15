// 点赞

import Model from './model'
import {RecipesList} from "./recipesModel";
import { produce } from 'immer'
import dialog from "../utils/dialog";

class Endorse extends Model {
    // 点赞
    async endorse(objId: number, typeId: number): Promise<RecipesList> {
        let res = await this.fetch({url: 'Endorse/Create', data: {objId, typeId}});
        return res;
    }

    // 取消点赞
    async cancelEndorse(objId: number, typeId: number): Promise<RecipesList> {
        let res = await this.fetch({url: 'Endorse/Delete', data: {objId, typeId}});
        return res;
    }
}

export default new Endorse()