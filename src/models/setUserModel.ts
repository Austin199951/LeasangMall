// 简介、个性签名

import Model from './model'
export type signature = Array<any>

class SignatureModel extends Model{
    // 保存自己的资料
    async save(address: string, email: string, gender: number, name: string, phone: string, portrait: string, signature: string): Promise<signature> {
        let res = await this.fetch({url:'User/SetUser', data: {address, email, gender, name, phone, portrait, signature}})

        return res;
    }

    // 获取自己的资料
    async self():Promise<any>{
        let res = await this.fetch({url:'User/Self'});
        return res;
    }
}

export default new SignatureModel()