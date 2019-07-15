// 发布作品

import Model from './model'
export type publish = Array<any>

class PubWorksModel extends Model{
    async releaseWork(contents: string, img): Promise<publish> {
        let res = await this.fetch({url:'Share/Create', data:{contents, img}});
        console.log(res);

        return res;
    }
}

export default new PubWorksModel()