'use strict';

export type RecursivePartial<T> = {
  [P in keyof T]?:
  T[P] extends Array<infer U> ? Array<RecursivePartial<U>> :
    T[P] extends object ? RecursivePartial<T[P]> :
      T[P];
};

export enum NumberedBoolean {
  FALSE = 0,
  TRUE = 1,
}