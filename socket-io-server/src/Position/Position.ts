import * as FPEq from "fp-ts/Eq";
import * as number from "fp-ts/number";

export namespace Position {
  export type T = {
    column: number;
    row: number;
  };
  export const Eq: FPEq.Eq<T> = FPEq.struct({
    column: number.Eq,
    row: number.Eq,
  });
}
