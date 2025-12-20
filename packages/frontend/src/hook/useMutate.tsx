import { useMutation } from 'react-query';
import type {
  UseMutationResult,
  QueryKey,
  UseMutationOptions,
} from 'react-query';
import { APIClient } from '../api/api-client';

export enum RequestType {
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

type MutateRequestOptions<R> = {
  queryKey: string;
  endPoint: string;
  requestType: RequestType;
  config?: Omit<
    UseMutationOptions<R, Error, unknown, QueryKey>,
    'mutationFn' | 'mutationKey'
  >;
};

export function useMutate<R, D>(
  props: MutateRequestOptions<R>
): UseMutationResult<R, Error, D, QueryKey> {
  const {
    queryKey,
    requestType,
    endPoint,
    config = {},
  } = props;
  return useMutation(
    queryKey,
    (a: D) => axiosCall<R, D>(requestType, endPoint, a),
    config
  );
}

export function axiosCall<R, D>(type: RequestType, endPoint: string, data: D) {
  switch (type) {
    case RequestType.POST:
      return APIClient.getInstance().post<R, D>(endPoint, data);

    case RequestType.PUT:
      return APIClient.getInstance().put<R, D>(endPoint, data);

    case RequestType.PATCH:
      return APIClient.getInstance().patch<R, D>(endPoint, data);

    case RequestType.DELETE:
      return APIClient.getInstance().delete<R>(endPoint);
  }
}
