import type { AxiosError as AError } from 'axios';
import type { FC, PropsWithChildren } from 'react';
import type { Connector, CreateConnectorFn } from 'wagmi';
import type { Icon } from '@/components/icons';

export type AxiosError<T = ApiErrorResponse> = AError<T>;

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {}
}

export type ApiErrorResponse = {
  error: {
    code: number | string;
    message: string;
    fields?: { field: string; message: string }[];
  };
};

export interface IPaginationMeta {
  code: number;
  message: string;

  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export type TResponse<T> = {
  success: boolean;
  data: T;
};

export type TListResponse<T> = {
  meta: IPaginationMeta;
  data: T[];
};

export type TPaginatedResponse<T> = {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

export type FCC<P = {}> = FC<PropsWithChildren<P>>;

export interface IOption<T> {
  label: string;
  value: T;
}

export interface IPaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface WalletDisplay {
  connector?: Connector<CreateConnectorFn>;
  icon: Icon;
  isMultipleChain: boolean;
  id: string;
  name: string;
}
