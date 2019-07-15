// 获取关注列表

import Model from './model'

export type followNum = Number;


class IndexModel extends Model {
    // 获取个人关注列表
    async fetchGetFollowList(userId): Promise<followNum> {
        let res = await this.fetch({url:'Fans/AttentionList',data:{userId}});
        return res
    }
}

export default new IndexModel()