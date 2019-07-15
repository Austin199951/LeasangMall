// 登录
import Model from './model'

import { setStorage, getStorage } from '@tarojs/taro'

const STORAGE_USER_KEY = 'ls_storage_user'

type LoginData = {
    code: string;
    encryptedData: string;
    iv: string;
}

class LoginModel extends Model {

    private userData: any;

    fetchWxLogin = async (data: LoginData): Promise<object> => {
        let res = this.fetch({ url: 'User/WxLogin', data: data, withoutToken: true })
        return res;
    }

    getUser = async (): Promise<object> => {

        try {
            let userData = await getStorage({ key: STORAGE_USER_KEY })
            this.userData = userData
        } catch (err) {
            console.log(err)
        }

        this.getUser = ():object => {
            return this.userData
        }

        return this.userData
    }

    setUser = (user) => {
        this.userData = user
        setStorage({ key: STORAGE_USER_KEY, data: user })
    }
}

export default new LoginModel()