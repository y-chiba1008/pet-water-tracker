/** Partial mock を UseQuery / UseMutation の戻り値型へ渡すためのヘルパー */
export function asHookResult<T>(value: unknown): T {
  return value as T
}
