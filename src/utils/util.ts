import Taro, { Component, Config } from '@tarojs/taro'
import CryptoJS from 'crypto-js';


// 计算多少天前、多少小时前、多少分钟前
const computingTime = (day,hour,min) => {
    let minutes = '';

    if (day > 0) {
        minutes = day + "天前";
    }
    if (hour>0) {
        minutes += hour + "小时前";
    }
    if (min>0) {
        minutes += parseFloat(min) + "分钟前";
    } else {
        minutes = '刚刚'
    }

    // 计算出多少天前替换后面的值
    let str = RegExp(/天前/);
    if(minutes.match(str)){
        let index = minutes.indexOf("前");
        let sub = minutes.substring(index+1,minutes.length);
        minutes = minutes.replace(sub,' ');
    }

    //计算出多少小时前替换后面的值
    let str1 = RegExp(/小时前/);
    if(minutes.match(str1)){
        let index = minutes.indexOf("前");
        let sub = minutes.substring(index+1,minutes.length);
        minutes = minutes.replace(sub,' ');
    }
    return minutes
}

// 获取当前时间
const getCurTime = () => {
    let date = new Date();
    let Y = date.getFullYear();
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    let D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let H = date.getHours();
    let Mi = date.getMinutes();
    let S = date.getSeconds();
    return Y+'/'+M+'/'+D+' '+H+":"+Mi+':'+S;
}

// 获取创建时间
const getCreateTime = (data) => {
    let create_date = new Date(data);
    let y = create_date.getFullYear();
    let m = (create_date.getMonth() + 1 < 10 ? '0' + (create_date.getMonth() + 1) : create_date.getMonth() + 1);
    let d = create_date.getDate() < 10 ? '0' + create_date.getDate() : create_date.getDate();
    let h = create_date.getHours();
    let mi = create_date.getMinutes();
    let s = create_date.getSeconds();
    return y+'/'+m+'/'+d+' '+h+":"+mi+':'+s;
}

const Utils = {
    getCreateTime,
    getCurTime,
    computingTime,
}

export default Utils