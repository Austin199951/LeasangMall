// 商品数据层

import Model from './model'
export type goodsList = Array<{}>

class GoodsModel extends Model{
    // 获取商品列表
    async getGoodsList(pageNumber:number): Promise<goodsList> {
        let res = await this.fetch({url:'Product/PageList', data:{pageNumber}});

        return res;
    }

    // 去购买
    async goShopping(productId:number): Promise<goodsList> {
        let res = await this.fetch({url:'Product/GetById', data:{productId}});
        return res;
    }
}

export default new GoodsModel()