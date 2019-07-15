/**
 * 浮层封装
 */

import {showToast} from '@tarojs/taro'
import {ErrorCodes, BusinessError} from './errorHelper'
import navigate from './navigate'

export default {
    // 处理错误
    handleError(error: any) {
        if(error instanceof Error) {
            error = error as BusinessError
            if(error.code === ErrorCodes.NORMAL_ERROR || error.code === ErrorCodes.NOT_EXPECT) {
                error.message && showToast({title: error.message, icon: 'none'})
            } else if(error.code === ErrorCodes.AUTH_ERROR) {
                navigate.redirect('../../pages/login/login')
            }
        }        
    },
    
}