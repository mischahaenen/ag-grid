import { DimensionExpression, VarExpression } from '.';
import { Expression } from './Expression';

export const calc = <T extends CalcPart[]>(...parts: ValidCalcParts<T>) =>
  new CalcExpression(parts);

type Operator = '+' | '-' | '*' | '/';
type Value = CalcExpression | DimensionExpression | VarExpression | number;

type CalcPart = Operator | Value;

// Compile time validation that the argument list to calc(...) only contains
// valid expressions, e.g. calc(3, '+', 2) but not calc(3, '+')
type ValidCalcParts<T extends CalcPart[]> = T extends [Value]
  ? T
  : T extends [infer First extends Value, ...infer Rest extends CalcPart[]]
  ? CalcExtension<[First], Rest>
  : never;

type CalcExtension<L extends CalcPart[], R extends CalcPart[]> = R extends []
  ? L
  : R extends [infer O extends Operator, infer V extends Value, ...infer Rest extends CalcPart[]]
  ? CalcExtension<[...L, O, V], Rest>
  : never;

export class CalcExpression extends Expression {
  constructor(readonly parts: ReadonlyArray<CalcPart>) {
    super();
  }

  calcCss(nested: boolean): string {
    return (
      (nested ? '(' : 'calc(') +
      this.parts
        .map((part): string => {
          switch (typeof part) {
            case 'string':
              return part;
            case 'number':
              return String(part);
            case 'object':
              return part instanceof CalcExpression ? part.calcCss(true) : part.expressionCss();
          }
        })
        .join(' ') +
      ')'
    );
  }

  expressionCss(): string {
    return this.calcCss(false);
  }
}
