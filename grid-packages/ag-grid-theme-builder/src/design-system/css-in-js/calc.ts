import { DimensionExpression } from '.';
import { Expression } from './Expression';
import { VarExpression } from './v';

export const calc = (...parts: ReadonlyArray<CalcPart>) => new CalcExpression(parts);

export type CalcPart =
  | '+'
  | '-'
  | '*'
  | '/'
  | CalcExpression
  | DimensionExpression
  | VarExpression
  | number;

export class CalcExpression extends Expression {
  constructor(readonly parts: ReadonlyArray<CalcPart>) {
    super();
  }

  expressionCss(nested: boolean): string {
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
              return part.expressionCss(true);
          }
        })
        .join(' ') +
      ')'
    );
  }
}
