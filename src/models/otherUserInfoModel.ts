// 其他用户信息

import Model from './model'

class OtherUserInfoModel extends Model{
    // 获取其他用户信息
    async getOtherUserInfo(userId:number): Promise<> {
        let res = await this.fetch({url:'User/GetUserById', data:{userId}})
        return res;
    }
}

export default new OtherUserInfoModel()