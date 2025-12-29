import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

import { appConfig } from '@/config';
import { errorInterceptor, requestInterceptor, successInterceptor } from './interceptors';

const axiosRequestConfig: AxiosRequestConfig = {
  baseURL: appConfig.apiUrl,
  responseType: 'json',
};

const client: AxiosInstance = axios.create(axiosRequestConfig);

client.interceptors.response.use(successInterceptor, errorInterceptor);

client.interceptors.request.use(requestInterceptor, errorInterceptor);

export const request = client;
