/**
 * 网络请求封装
 */

import {getStorage, setStorage, request} from '@tarojs/taro'
import errorHelper, {ErrorCodes} from './errorHelper'

const STROAGE_TOKEN_KEY = 'leasang_token'

export type RequestParam = {
    url: string, //接口路径
    data?: object, //参数
    method?: 'GET' | 'POST',
    withoutToken?: boolean, //不带token
}

const fetch = {
    _host: '',
    _token: '',
    /**
     * 设置域名
     * @param host 
     */
    setHost(host: string) {
        this._host = host;
    },
    async getToken():Promise<String> {

        try {
            let result = await getStorage({key: STROAGE_TOKEN_KEY})
            this._token = this._token || result.data || ''
        } catch (error) {
            console.log(error)
        }
        
        //只执行一次初始化
        this.getToken = function() {
            return this._token
        }

        return this._token
    },
    /**
     * 获取到新的token需要在这里设置一下
     * @param token 
     */
    setToken(token: string) {
        this._token = token
        setStorage({key: STROAGE_TOKEN_KEY, data: token})
    },
    /**
     * 检测是否已登录
     */
    async checkLogin() {
        let token = await this.getToken()
        if(!token) {
            throw errorHelper.createError(ErrorCodes.AUTH_ERROR, '')
        }
        return true
    },
    async request(params: RequestParam) {
        let token = await this.getToken()
        let data = params.data

        if(!params.withoutToken) {
            data = {token,...data}
        }

        let resp = await request({
                url: this._host + params.url,
                data: data,
                method: params.method || 'POST',
                header: {
                    'content-type': 'application/json',    
                }
        })
        
        if(resp.statusCode !== 200) {
            throw errorHelper.createError(ErrorCodes.NORMAL_ERROR, '网络请求错误')    
        }

        if(resp.data.code == 300) {
            //重置token
            this.setToken('')
            throw errorHelper.createError(ErrorCodes.AUTH_ERROR, resp.data.msg) 
        }

        if(resp.data.code == 200) {
            return resp.data.data
        }

        throw errorHelper.createError(ErrorCodes.NORMAL_ERROR, resp.data.msg) 
    }
}

export default fetch