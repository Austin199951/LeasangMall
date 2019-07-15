/**
 * 分页辅助类
 */

import fetch from './fetch'
import { produce } from 'immer'

export type MultiState<ItemT> = {
    isLoading: boolean;
    hasMore: boolean;
    data: Array<ItemT>;
}

type DataHandler<ItemT> = (data: any) => Array<ItemT>

export type MultiPageParam<ItemT> = {
    /**
     * 默认数据状态
     */
    defaultState?: MultiState<ItemT>;

    /**
     * 数据处理
     */
    dataHandler: DataHandler<ItemT>;

    /**
     * 接口路径
     */
    url: string;

    /**
     * 接口参数
     */
    data?: object;

    /**
     * 数据量
     */
    pageSize?: number;
}

class MultiPage<ItemT> {
    private state: MultiState<ItemT>;
    private dataHandler: DataHandler<ItemT>;
    private pageSize: number;
    private data?: object;
    private url: string;
    private taskQueue: Promise<any>;

    constructor(param: MultiPageParam<ItemT>) {
        this.state = param.defaultState || { isLoading: false, hasMore: true, data: [] }
        this.dataHandler = param.dataHandler
        this.pageSize = param.pageSize || 10
        this.url = param.url
        this.data = param.data
        this.taskQueue = Promise.resolve()
    }

    /**
     * @pageSize 获取数量
     * @all 是否从pageIndex = 0开始获取数据
     */
    _fetch = async (pageSize: number, all: boolean): Promise<MultiState<ItemT>> => {

        //修改网络状态
        this.state = produce(this.state, (draft) => {
            draft.isLoading = true
        })

        let err
        let result: Array<ItemT> = []

        //将新的请求任务压入任务队列中
        this.taskQueue = this.taskQueue.then(async () => {
            try {
                let resp = await fetch.request({ url: this.url, data: { pageNum: all ? 1 : 1 + this.state.data.length, pageSize: pageSize, ...this.data } })
                result = this.dataHandler(resp)
            } catch (e) {
                err = e
            }
        })

        //等待最新的任务完成
        await this.taskQueue

        this.state = produce(this.state, (draft) => {
            draft.isLoading = false
        })

        if (err) {
            throw err
        }

        //更新数据
        this.state = produce(this.state, (draft: MultiState<ItemT>) => {

            if (all) {
                draft.data = result
            } else {
                result.map((single) => {
                    draft.data.push(single)
                })
            }

            if (result.length === 0) {
                draft.hasMore = false
            } else {
                draft.hasMore = true
            }

        })

        return this.state
    }

    /**
     * 获取网络数据
     */
    fetch = async (reset: boolean = true): Promise<MultiState<ItemT>> => {

        //防止多次触发
        // if(this.state.isLoading) {
        //     return this.state
        // }

        let state = await this._fetch(reset ? this.pageSize : this.state.data.length, true)
        return state
    }

    /**
     * 获取更多网络数据
     */
    fetchMore = async (): Promise<MultiState<ItemT>> => {

        //防止多次触发
        // if(this.state.isLoading) {
        //     return this.state
        // }

        let state = await this._fetch(this.pageSize, false)
        return state
    }

    /**
     * 获取数据内容
     * @param state 
     */
    getState = (): MultiState<ItemT> => {
        return this.state
    }

    /**
     * 修改数据内容
     * @param state 
     */
    setState = (state: MultiState<ItemT>) => {
        this.state = state
    }
}

export default MultiPage