// 签到数据

import Model from './model'
import Taro, { showToast } from '@tarojs/taro'

export type SignIn  = Array<{}>

class SignInModel extends Model {
    async fetchSignIn(data): Promise<SignIn>{
        let res = await this.fetch({url:'User/Sign'});
        return res;
    }
}

export default new SignInModel();