// 图片上传
import { uploadFile, chooseImage, showLoading, hideLoading } from '@tarojs/taro'
import Model from './model'
import config from '../config'

export type upload = Array<any>

class PictureUploadModel extends Model{
    async pictureUpLoad(callback): Promise<upload> {
        return chooseImage ({
                count:1,
                success(e){
                    showLoading({title:'loading...'});
                    let tempFilePaths = e.tempFilePaths;

                    uploadFile({
                        url:config.HOST+'User/UploadFile',
                        filePath: tempFilePaths[0],
                        name: 'file',
                        formData: {},
                        success (res){
                            hideLoading();
                            callback(res);
                        }
                    });
                }
            })
    }
}

export default new PictureUploadModel()