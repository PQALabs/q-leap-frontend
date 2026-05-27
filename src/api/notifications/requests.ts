import { request } from '../client';
import type { INotificationsParams, INotificationsResponse, IUnreadCountResponse } from './types';

export const getNotificationsRequest = async (params: INotificationsParams = {}): Promise<INotificationsResponse> => {
  const { data } = await request<INotificationsResponse>({
    url: '/notifications',
    method: 'GET',
    params: {
      limit: 10,
      ...params,
    },
  });

  return data;
};

export const getUnreadCountRequest = async (): Promise<number> => {
  const { data } = await request<IUnreadCountResponse>({
    url: '/notifications/unread-count',
    method: 'GET',
  });

  return data.data.count;
};

export const markNotificationReadRequest = async (id: string): Promise<void> => {
  await request({
    url: `/notifications/${id}/read`,
    method: 'PATCH',
  });
};

export const markAllNotificationsReadRequest = async (): Promise<void> => {
  await request({
    url: '/notifications/read-all',
    method: 'PATCH',
  });
};
