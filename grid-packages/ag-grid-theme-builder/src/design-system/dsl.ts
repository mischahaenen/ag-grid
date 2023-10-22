import {
  ColorExpression,
  DimensionExpression,
  Expression,
  HexColorString,
  LiteralExpression,
  StringsExpression,
} from './expressions';
import { NestedRuleSet } from './model';
import { proxy, toKebabCase } from './utils';
import { Variables } from './variables';

export const strings = (content: string[]) => new StringsExpression(content);

export const dimension = (number: number, units: string) => new DimensionExpression(number, units);

export const px = (number: number) => dimension(number, 'px');

export const literal = (css: string) => new LiteralExpression(css);

export const important = <T>(expression: Expression<T>) =>
  new LiteralExpression<T>(expression.toCss() + '!important');

export const rgb = (r: number, g: number, b: number, a = 1) => new ColorExpression(r, g, b, a);

export const hex = <T extends string>(value: HexColorString<T>) => ColorExpression.fromHex(value);

export const fontWeight = (weight: 'normal' | 'bold' | number) =>
  new LiteralExpression(String(weight));

export const block = literal('block');
export const none = literal('none');
export const flex = literal('flex');
export const hidden = literal('hidden');
export const visible = literal('visible');

export const v = proxy(
  (prop) => new LiteralExpression(`var(--ag-${String(toKebabCase(String(prop)))})`),
) as Variables;

export const themePart = (part: NestedRuleSet) => part;
