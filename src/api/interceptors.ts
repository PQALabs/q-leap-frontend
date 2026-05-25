import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';

export const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  return config;
};

export const successInterceptor = (response: AxiosResponse): AxiosResponse => {
  return response;
};

export const errorInterceptor = async (error: AxiosError): Promise<void> => {
  const status = error?.response?.status;
  const data = error?.response?.data as any;

  if (status === 401) {
    const token = useForumAuthStore.getState().token;
    if (token) {
      useForumAuthStore.getState().clearAuth();
      toast.error('Session expired. Please sign in again.');
    }
  }

  return Promise.reject(data?.meta || data || error);
};
