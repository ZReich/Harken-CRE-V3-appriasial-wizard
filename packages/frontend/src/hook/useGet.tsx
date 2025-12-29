// @ts-nocheck - Legacy file using old react-query, not actively used
import { useQuery } from 'react-query';
import type { UseQueryOptions, UseQueryResult } from 'react-query';
import { APIClient } from '../api/api-client';
import { globalRouter } from '@/utils/commonFunctions';

type GetRequestOptions = {
  queryKey: string;
  endPoint: string;
  cacheTime?: any;
  // config?: Omit<UseQueryOptions, 'queryKey' | 'querfn'>;

  config?: Omit<
    UseQueryOptions<unknown, unknown, unknown, string>,
    'queryKey' | 'querfn'
  > & {
    refetchOnWindowFocus?: boolean;
  };
};

export function useGet<R>(props: GetRequestOptions): UseQueryResult<R, Error> {
  const { queryKey, endPoint, config } = props;
  const result: any = useQuery({
    queryKey: queryKey,
    cacheTime: 0,
    queryFn: () => GetRequest<R>(endPoint),
    ...config,
  });
  if (result?.error?.response?.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    localStorage.removeItem('refresh');
    // localStorage.removeItem('activeButton');
    localStorage.removeItem('activeMain');
    if (globalRouter?.navigate) {
      globalRouter?.navigate('/login');
    }
  }
  return result as UseQueryResult<R, Error>;
}

async function GetRequest<R>(endPoint: string): Promise<R> {
  return await APIClient.getInstance().get<R>(endPoint);
}
