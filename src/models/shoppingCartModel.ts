// 购物车数据

import Model from './model'

class ShoppingCartModel extends Model{
    // 获取购物车列表
    async getShoppingCartList(): Promise<>{
        let res = await this.fetch({url:'Product/ListCart'})

        return res;
    }

    // 删除商品
    async delGoods(productCartId:number): Promise<>{
        let res = await this.fetch({url:'Product/DeleteCart', data:{productCartId}})

        return res;
    }
}

export default new ShoppingCartModel()