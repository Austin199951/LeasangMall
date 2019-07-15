// 创建订单

import Model from './model'

export type orderList = Array<any>
class CreateOrderModel extends Model{
    // 获取订单列表
    async getOrderList(state:number, pageNumber:number): Promise<orderList> {
        let res = await this.fetch({url:'Order/PageListByState', data:{state,pageNumber}});
        return res;
    }

    // 创建订单
    async createOrder(remark:string,product:Array,addressId:number,logisticsFee:string): Promise<orderList> {
        let res = await this.fetch({url:'Order/Create', data:{remark,product,addressId,logisticsFee}})
        console.log(res);
        return res;
    }


    // 确认收货
    async receiving(orderId:number): Promise<orderList> {
        let res = await this.fetch({url:'Order/Receiving', data:{orderId}})
        console.log(res);
        return res;
    }

    // 获取订单详情
    async getOrderDetail(orderId:number): Promise<orderList> {
        let res = await this.fetch({url:'Order/GetById', data:{orderId}});
        return res;
    }

    // 申请退款
    async applyRefund(orderId:number, orderReasonId:number, remark?:string): Promise<orderList> {
        let res = await this.fetch({url:'Order/ReturnedGoods', data:{orderId, orderReasonId, remark}});
        return res;
    }


    // 获取退款原因
    async refundReason(): Promise<orderList> {
        let res = await this.fetch({url:'OrderRecede/List'});
        return res;
    }
}

export default new CreateOrderModel()