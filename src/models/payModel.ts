// 支付
import { requestPayment, showToast } from '@tarojs/taro'
import Model from './model'
import navigate from "../utils/navigate";


class PayModel extends Model{
    async Payment(orderId:number, payType?:string): Promise<any>{
        let res = await this.fetch({url:'Order/ApplyPay', data:{orderId}});
        let applyPay = JSON.parse(res);

        requestPayment({
            timeStamp: applyPay.timeStamp,
            nonceStr: applyPay.nonceStr,
            package: applyPay.package,
            signType: applyPay.signType,
            paySign: applyPay.paySign,
            success(res) {//支付成功
                showToast({title:"支付成功",icon: "none"});
                if(payType == 'goods'){
                    navigate.go(`../pendingPay/pendingPay?state=${2}`);
                }
            },
            fail(res){
                showToast({title:'支付失败',icon:'none'});
                if(payType == 'goods'){
                    navigate.go(`../pendingPay/pendingPay?state=${1}`);
                }
            }
        })
    }
}

export default new PayModel()