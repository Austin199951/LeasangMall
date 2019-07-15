// 商品详情数据

import Model from './model'

export type goodsData = Array<{}>

class GoodsDetailModel extends Model{
    // 获取购物车详情
    async getGoodsDetail(productId: number): Promise<goodsData>{
        let res = await this.fetch({url:'Product/GetById', data:{productId}})
        res.coverImage = JSON.parse(res.coverImage);
        return res;
    }

    // 添加到购物车
    async AddToCart(quantity:number,productId:number,productPriceId:number): Promise<goodsData>{
        let res = await this.fetch({url:'Product/CreateCart', data:{quantity,productId,productPriceId}})

        return res;
    }

    // 修改购物车
    async updateCart(productCartId:number,quantity:number): Promise<goodsData>{
        let res = await this.fetch({url:'Product/UpdateCart', data:{productCartId,quantity}})

        return res;
    }
}

export default new GoodsDetailModel()