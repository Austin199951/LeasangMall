/**
 * 首页数据层
 */

import Model from './model'

export type ProductRecommendData = Array<{
    key: string,
    coverImage: object,
    productName: string,
    productId:number
}>

export type TenSpectrumList = Array<{}>

class IndexModel extends Model {
    async fetchProductRecommend(): Promise<ProductRecommendData> {

        //获取数据
        let data = await this.fetch({ url: 'Home/ProductRecommend' })

        //TODO:例子，细节不完全正确
        //处理数据;处理成想要的数据再返回给页面
        let result = data.map((single) => {
            return {
                key: single.id, //数据唯一ID，例子
                coverImage: JSON.parse(single.coverImage),
                productName: single.productName,
                productId: single.productId
            }
        })

        //返回数据
        return result
    }

    async fetchRecipeRecommend(): Promise<TenSpectrumList> {
        let res = await this.fetch({url:'Home/RecipeRecommend'})
        return res
    }


    // 获取轮播图片
    getBanner = async () => {
        let res = await this.fetch({url:'Home/Banner'});
        return res;
    }
}

export default new IndexModel()