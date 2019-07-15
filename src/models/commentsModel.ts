// 评论


import Model from './model'
import {getStorageSync} from "@tarojs/taro";
import Utils from "../utils/util";
import {produce} from 'immer'

class CommentsModel extends Model{
    // 评论列表
    async getCommentList(objId:number, typeId:number, pageNumber:number): Promise<any> {
        let res = this.fetch({url:'Comment/PageList', data:{objId, typeId, pageNumber}});

        this.processingTime(res);
        return res;
    }

    processingTime = (res) =>　{
        let newData = produce(res, (draft) => {

            res.then(resolve => {
                for(let item of resolve){
                    item.is_del = false;
                    let userId = getStorageSync('userId');
                    if(userId == item.userId) {
                        item.is_del = true;
                    }

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
        });

        return newData;
    }

    // 创建评论
    async createCommnent(objId:number,typeId:number,contents:string, score:number, img:Array): Promise<>{
        let res = await this.fetch({url:'Comment/CreateCommnent', data:{objId, typeId, contents, score, img}});
        return res;
    }

    // 创建回复评论
    async createCommentReply(userId:number,commentId:number,contents:string): Promise<any>{
        let res = await this.fetch({url:'Comment/CreateCommentReply', data:{userId, commentId,contents}});
        return res;
    }

    //删除评论
    async deleteCommnent(commentId:number): Promise<any>{
        let res = await this.fetch({url:'Comment/DeleteCommnent', data:{commentId}});
        return res;
    }
}

export default new CommentsModel()