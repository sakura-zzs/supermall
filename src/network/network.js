// axios封装
import axios from 'axios'
export function request(config) {
    // 创建局部配置axios实例
    const instance = axios.create({
        baseURL: 'http://106.54.54.237:8000/api/mn',
        timeout:5000
    })
    // axios实例返回promise对象
    return instance(config)
}