// 地址数据层

import Model from './model'
import navigate from '../utils/navigate'


export type AddressList = Array<{}>

class AddressModel extends Model{
    /*获取地址列表*/
    async fetchGetAddrList(callback): Promise<AddressList>{
        let res = await this.fetch({url:'DeliveryAddress/List'});
        callback(res);
        return res;
    }


    // 修改地址信息
    async fetchEditAddr(deliveryAddressId:number,name:string,address:string,region:string,phone:string,initDefault:boolean): Promise<AddressList>{
        let res = await this.fetch({url:'DeliveryAddress/Edit',data:{deliveryAddressId,name,address,region,phone,initDefault}});

        navigate.back();
        return res;
    }


    // 删除收货地址
    async fetchDelAddr(deliveryAddressId:number): Promise<AddressList>{
        let res = await this.fetch({url:'DeliveryAddress/Delete',data:{deliveryAddressId}});

        navigate.back();
        return res;
    }


    // 新增收货地址
    async fetchNewAddr(name:string,phone:string,address:string,region:string,initDefault:boolean): Promise<AddressList>{
        let res = await this.fetch({url:'DeliveryAddress/Create',data:{name,phone,address,region,initDefault}});

        navigate.back();
        return res;
    }
}

export default new AddressModel();