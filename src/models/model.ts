/**
 * 数据层Model基类
 * TODO: 1.本地数据处理
 */

import fetch, { RequestParam } from '../utils/fetch'

class Model {
    fetch = (param: RequestParam) => {
        return fetch.request(param)
    }
}

export default Model