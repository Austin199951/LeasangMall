/**
 * 错误辅助处理
 */

export enum ErrorCodes {
    OK = 200, //返回正常
    NOT_EXPECT = 201, //与预期不一致
    AUTH_ERROR = 300, //验证失败
    NORMAL_ERROR = 999, //普通错误
}

export class BusinessError extends Error {
    // 错误码 
    code: ErrorCodes;

    constructor(message: string, code: ErrorCodes) {
        super();
        this.message = message;
        this.code = code;
    }
}

export default {
    createError(code: ErrorCodes, message: string) {
        let error = new BusinessError(message, code)
        return error
    }
}