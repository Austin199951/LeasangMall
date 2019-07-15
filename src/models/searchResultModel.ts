// 搜索结果

import Model from './model'

export type resultList = Array<any>

class  SearchResultModel extends Model{
    async getSearchResult(search): Promise<resultList> {

        let res = await this.fetch({url:`Home/Search`,data:{search}});
        return res;
    }
}

export default new SearchResultModel()