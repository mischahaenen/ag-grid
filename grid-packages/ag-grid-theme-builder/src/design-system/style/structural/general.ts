import { block, hidden, literal, none, themePart } from 'design-system/css-in-js';

export const generalStructuralStyles = themePart({
  'ag-grid, ag-grid-angular, ag-grid-ng2, ag-grid-polymer, ag-grid-aurelia': {
    display: block,
  },
  hidden: {
    display: none.important,
  },
  invisible: {
    visibility: hidden.important,
  },
  noTransition: {
    transition: none.important,
  },
  rootWrapper: {
    border: literal('solid 1px blue'),
  },
});
