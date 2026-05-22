interface APIResponse<T = any> {
  body: T;
  success?: boolean;
  message?: string;
}

type APIResult<T = any> = [APIResponse<T> | null, string | null];
type APIFunction<T = any> = Promise<[APIResponse<T> | null, string | null]>;
