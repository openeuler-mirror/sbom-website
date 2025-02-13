import axios, { AxiosInstance } from 'axios';
import { ElMessage } from 'element-plus';
import { ShowFullScreenLoading, HideLoading } from '@/utils';
import SbomDataService from '@/services/SbomDataService';
import router from './router';
import store from './store';

export const SERVER_API_HOST = process.env.VUE_APP_SERVER_API_HOST;
console.log('VUE_APP_SERVER_API_HOST:' + SERVER_API_HOST);

function refreshToken() {
  SbomDataService.refreshToken().then(() => {
    window.location.reload();
  });
}

const apiClient: AxiosInstance = axios.create({
  // baseURL: "http://localhost:13331/sbom",
  // baseURL: "https://sbom-service.test.osinfra.cn/sbom-api",
  baseURL: SERVER_API_HOST + `/sbom-api`,

  headers: {
    // "Content-type": "application/json",
    hideLoading: false,
  },
});

//请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    if (!config.headers.hideLoading) {
      ShowFullScreenLoading('Loading...');
    }
    return config;
  },
  (error) => {
    HideLoading();
    return Promise.reject(error);
  }
);

//响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    if (response.data.code === 400) {
      ElMessage('error', response.data.message);
      return Promise.reject(response.data.message);
    }
    HideLoading();
    return Promise.resolve(response);
  },
  async (error) => {
    const { status, data } = error.response;
    // 无权限
    if (status === 401) {
      ElMessage({
        message: data || '无权限或token已过期，请重新登录！',
        type: 'error',
      });
      store.commit('setUser', {});
      router.replace('/login');
    }
    // token过期
    if (status === 409) {
      await refreshToken();
    }
    HideLoading();
    return Promise.reject(error);
  }
);

export default apiClient;
