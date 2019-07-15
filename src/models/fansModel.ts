// 粉丝数据层

import Model from './model'
import {getStorageSync} from "@tarojs/taro";
import dialog from '../utils/dialog'

export type fansNum = Number;

class FansModel extends Model{
    // 获取粉丝列表
    async fetchGetFansList(): Promise<fansNum> {
        let res = await this.fetch({url:'Fans/FansList'});
        return res;
    }

    // 粉丝关注
    async follow(userId:number): Promise<fansNum> {
        let res = await this.fetch({url:'Fans/Create',data:{userId}});

        return res;
    }


    // 取消粉丝关注
    async cancelFollow(userId:number): Promise<fansNum> {
        let res = await this.fetch({url:'Fans/Cancel',data:{userId}});

        return res;
    }


    // 获取是否关注
    async isAttention(userId:number): Promise<any>{
        let res = await this.fetch({url:'Fans/IsAttention', data:{userId}});
        return res;
    }
}

export default new FansModel()