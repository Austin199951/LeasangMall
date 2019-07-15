/**
 * 导航API封装
 * 功能：1.跳转前的登陆验证 2.
 */

import {redirectTo, navigateTo, navigateBack, switchTab, reLaunch} from '@tarojs/taro'

export default {
    go(url: string) {
        navigateTo({url})
    },
    back(delta?: number) {
        navigateBack({delta})
    },
    redirect(url: string) {
        redirectTo({url})
    },
    reLaunch(url: string) {
        reLaunch({url})
    },
    switchTab(url: string) {
        switchTab({url});
    }
}