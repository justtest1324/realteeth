export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
