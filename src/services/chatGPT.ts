import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:8080'
/**
 * 请求处理函数，抛出错误以及提取数据
 * @param res
 */
const formatData = function <T>(res: {data: {data: T, success?: boolean}}) : T | null  {
  console.log('res.data', res.data)
  if (!res.data.success) {
    return null;
  }
  return res.data.data;
};


/** 请求ChatGPT POST  */
export async function createCompletion(options?: { [key: string]: any }) {
  return axios<{
    data: string;
  }>('/api/chatGPT/completion', {
    method: 'POST',
    ...(options || {}),
  }).then(formatData);
}

/** 请求ChatGPT POST  */
export async function createChat(options?: { [key: string]: any }) {
  return axios<{
    data: string;
  }>('/api/chatGPT/chat', {
    method: 'POST',
    responseType: 'stream',
    ...(options || {}),
  }).then(formatData);
}

/** 请求ChatGPT POST  */
export async function createImage(options?: { [key: string]: any }) {
  return axios<{
    data: string;
  }>('/api/chatGPT/createImage', {
    method: 'POST',
    ...(options || {}),
  }).then(formatData);
}

/** 获取ChatGPT模型列表 POST /analysisData */
export async function getListModels(options?: { [key: string]: any }) {
  return axios<{
    data: any;
  }>('/api/chatGPT/listModels', {
    method: 'GET',
    ...(options || {}),
  }).then(formatData);
}
