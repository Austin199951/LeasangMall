// 作品数据

import Model from './model'
import MultiPage from '../utils/multiPage'
import { produce } from 'immer'
import Utils from '../utils/util'
import {getStorageSync} from "@tarojs/taro";

class WorkDetailModel extends Model{

    // 缓存数据
    private sayData: object = {}
    private recipeData: object = {}
    private sayListMultiPage: MultiPage

    constructor() {
        super()
        this.sayListMultiPage = new MultiPage({url: 'Share/PageList', dataHandler: this.sayListDataHandler})
    }

    sayListDataHandler = (data)=> {
        let keys = []

        data.map((item)=> {
            let key = item.shareId
            keys.push(key)
            item.key = item.shareId
            this.sayData[key] = item
        })

        return keys
    }

    fetchSayList = ()=> {
        return this.sayListMultiPage.fetch()    
    }

    fetchMoreSayList = ()=> {
        return this.sayListMultiPage.fetchMore()
    }

    getSayListData = ()=> {
        return this.sayListMultiPage.getState()
    }

    
    // 获取作品详情列表
    async getDetailList(shareId:number): Promise<>{
        let res = await this.fetch({url:'Share/GetById', data:{shareId}});
        return res;
    }


    // 获取我的作品列表
    async getMyWork(userId:number,pageNumber:number): Promise<>{
        let res = await this.fetch({url:'Share/ListByUserId', data:{userId, pageNumber}});
        return res;
    }

    // 删除说说
    async delete(shareId:number): Promise<any>{
        let res = await this.fetch({url:'Share/Delete', data:{ shareId }});
        return res;
    }


    // 获取说说列表
    async getSayList(pageNumber:number): Promise<>{
        let res = await this.fetch({url:'Share/PageList', data:{pageNumber}});
        this.getSayListFn(res);
        return res;
    }

    getSayListFn(res){
        let newData = produce(res, (draf) => {
            let userId: number = getStorageSync('userId');

            for (let item of res.data) {
                // 转换JSON字符串为数组
                if (item.img != '') {
                    item.img = JSON.parse(item.img);
                }
                let day = parseInt(item.intDiff / 60 / 24);
                let hour = parseInt(item.intDiff / 60 % 24);
                let min = parseInt(item.intDiff % 60);
                item.intDiff = Utils.computingTime(day, hour, min);

                // 向数组晒进字段
                item.is_del = false;
                if (userId == item.userId) {
                    item.is_del = true;
                }
            }
        });

        return newData;
    }

    // 阅读说说
    async read(shareId:number): Promise<>{
        let res = await this.fetch({url:'Share/Read', data:{shareId}});
        return res;
    }
}

export default new WorkDetailModel()