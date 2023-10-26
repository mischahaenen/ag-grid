/**
 * This script scans the source tree and generates typings for our components
 *
 * It uses regex to pull out things that look like class names e.g. ag-filters-toolpanel-header.
 *
 * Overrides can be added at the end of this file It's not 100% there, you can You can add overrides at the bottom
 */

// class names that should never be emitted as types
const ignoreClassNames = new Set([
  'ag-ltr',
  'ag-rtl',
  'ag-default',
  'ag-material',
  'ag-pastel',
  'ag-vivid',
  'ag-solar',
]);

const icons =
  'aggregation arrows asc cancel chart checkbox-checked checkbox-indeterminate checkbox-unchecked color-picker columns contracted copy cross csv cut desc excel expanded eye-slash eye filter first grip group last left linked loading maximize menu minimize next none not-allowed paste pin pivot previous radio-button-off radio-button-on right save small-down small-left small-right small-up tick tree-closed tree-indeterminate tree-open unlinked up down plus minus'.split(
    ' ',
  );

// these class names are added to Core *and* removed from any other module that they're found in
const classNamesByOwner: Record<string, Set<string>> = {
  Core: new Set([
    'ag-hidden',
    'ag-invisible',
    'ag-button',
    'ag-selected',
    'ag-no-transition',
    'ag-filter-condition-operator-or',
    'ag-filter-condition-operator-and',
    'ag-filter-date-from',
    'ag-filter-date-to',
    'ag-filter-from',
    'ag-filter-to',
    'ag-floating-filter-input',
    'ag-picker-collapsed',
    'ag-picker-field',
    'ag-picker-field-display',
    'ag-picker-field-icon',
    'ag-menu',
    'ag-button',
    'ag-wrapper',
    'ag-drag-handle',
    'ag-icon',
    'ag-cell-data-changed',
    'ag-cell-highlight',
    'ag-cell-data-changed-animation',
    'ag-cell-highlight-animation',
    'ag-group-container-horizontal',
    'ag-group-container-vertical',
    ...icons.map((i) => `ag-icon-${i}`),
  ]),
  Charts: new Set(['ag-chart-docked-container']),
  RichSelect: new Set(['ag-rich-select-field-input']),
  ColumnToolPanel: new Set(['ag-column-select-column-readonly']),
};

// Add raw TS union entries to modules
const additionalUnionEntries: Record<string, string[]> = {
  Core: [
    "VirtualListComponent<'autocomplete'>",
    "VirtualListComponent<'richSelect'>",
    "ListComponent<'select'>",
  ],
  AdvancedFilter: ["VirtualListComponent<'advancedFilterBuilder'>"],
  Charts: [
    "PanelComponent<'chartMenu'>",
    "PanelComponent<'chartData'>",
    "GroupComponent<'chartsFormatSubLevel'>",
    "GroupComponent<'chartsSettings'>",
    "TabsComponent<'chartTabbedMenu'>",
  ],
  Menu: ["TabsComponent<'menu'>"],
  ColumnToolPanel: ["VirtualListComponent<'columnSelect'>"],
  FilterToolPanel: ["GroupComponent<'filterToolpanel'>"],
  MultiFilter: ["GroupComponent<'multiFilter'>"],
  RowGrouping: ["VirtualListComponent<'selectAggFunc'>"],
  SetFilter: ["'setFilterBodyWrapper'", "VirtualListComponent<'filter'>"],
};

// Content at the top of the file
const beforeMatter =
  `/**
 * WARNING!
 * DO NOT EDIT THIS FILE!
 * Generate it using \`ts-node ${process.argv[1]}\`
 */

` +
  [
    'type GroupComponent<T extends string> =',
    '  | `${T}Group`',
    '  | `${T}GroupItem`',
    '  | `${T}GroupTitleBar`',
    '  | `${T}GroupTitleBarIcon`',
    '  | `${T}GroupTitle`',
    '  | `${T}GroupToolbar`',
    '  | `${T}GroupContainer`;',
    '',
    'type ListComponent<T extends string> =',
    '  | `${T}List`',
    '  | `${T}ListItem`;',
    '',
    'type VirtualListComponent<T extends string> =',
    '  | `${T}VirtualListViewport`',
    '  | `${T}VirtualListContainer`',
    '  | `${T}VirtualListItem`;',
    '',
    'type PanelComponent<T extends string> =',
    '  | `${T}Panel`',
    '  | `${T}PanelTitleBar`',
    '  | `${T}PanelTitleBarTitle`',
    '  | `${T}PanelTitleBarButtons`',
    '  | `${T}PanelContentWrapper`;',
    '',
    'type TabsComponent<T extends string> =',
    '  | T',
    '  | `${T}Header`',
    '  | `${T}Body`',
  ].join('\n') +
  '\n';

///
/// IMPLEMENTATION
///

const allOwnedClassNames = new Set(
  Object.values(classNamesByOwner).flatMap((set) => Array.from(set)),
);

const main = async () => {
  const fs = await import('fs/promises');
  const path = await import('path');

  const result: Record<string, Set<string>> = {};

  const scanPackages = async (packagesFolder: string) => {
    packagesFolder = path.resolve(__dirname, packagesFolder);
    const dirs = (await fs.readdir(packagesFolder)).filter(isValidDirectory);
    for (const dir of dirs) {
      const srcFolder = path.join(packagesFolder, dir);
      const typeName = dir.replaceAll(/(^|-)\w/g, (char) => char.toUpperCase()).replaceAll('-', '');
      result[typeName] ||= new Set();
      await scanFolder(srcFolder, typeName);
    }
  };

  const scanFolder = async (packageFolder: string, typeName: string) => {
    const entries = await fs.readdir(packageFolder, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && e.name.endsWith('.ts') && !e.name.endsWith('.test.ts'))
      .map((e) => e.name);
    for (const tsFile of files) {
      await scanFile(path.resolve(packageFolder, tsFile), typeName);
    }
    const subDir = entries
      .filter((e) => e.isDirectory() && isValidDirectory(e.name))
      .map((e) => e.name);
    for (const dir of subDir) {
      await scanFolder(path.join(packageFolder, dir), typeName);
    }
  };

  const scanFile = async (filePath: string, typeName: string) => {
    const content = (await fs.readFile(filePath, 'utf8')).replaceAll(/^import.*/gm, '');
    for (const interestPattern of contentOfInterestPatterns) {
      for (const [interestMatch] of content.matchAll(interestPattern)) {
        for (const [classMatch] of interestMatch.matchAll(/(?<=^|['" ])ag-[^'"\s]+/g)) {
          if (
            ignoreMatchPattern.test(classMatch) ||
            ignoreClassNames.has(classMatch) ||
            allOwnedClassNames.has(classMatch)
          ) {
            continue;
          }
          result[typeName].add(classMatch);
        }
      }
    }
  };

  const emit = async () => {
    const dstFile = path.resolve('./src/design-system/css-in-js/GridClassNames.ts');
    let content = '';
    for (const type of Object.keys(result).sort()) {
      const classes = additionalUnionEntries[type] || [];
      const values = Array.from(result[type].values()).sort();
      if (values.length === 0) continue;
      const union = values
        .map(classNameToCamelCase)
        .map((name) => `'${name}'`)
        .concat(classes)
        .map((name) => `\n  | ${name}`)
        .join('');
      content += `export type ${type}ClassNames =${union};\n\n`;
    }
    if (content.includes('-')) {
      throw new Error(
        'Content includes hyphen, you probably used an ag-class-name parameter instead of an className one.',
      );
    }
    await fs.writeFile(dstFile, beforeMatter + content, 'utf8');
  };

  await scanPackages('../../grid-community-modules');
  await scanPackages('../../grid-enterprise-modules');

  for (const module of Object.keys(additionalUnionEntries)) {
    if (!result[module]) {
      const available = Object.keys(additionalUnionEntries).join(', ');
      throw new Error(
        `Invalid module for additionalUnionEntries: "${module}" (available modules: ${available})`,
      );
    }
  }
  for (const module of Object.keys(classNamesByOwner)) {
    if (!result[module]) {
      const available = Object.keys(additionalUnionEntries).join(', ');
      throw new Error(
        `Invalid module for classNamesByOwner: "${module}" (available modules: ${available})`,
      );
    }
  }

  for (const [module, classNames] of Object.entries(classNamesByOwner)) {
    for (const className of classNames) {
      result[module].add(className);
    }
  }

  await emit();
};

const contentOfInterestPatterns = [
  // constant definitions
  /[A-Z_]+(\s*:\s*string)?\s*=[^\n]+/g,
  /[A-Z_]+, ['"]ag-.*/g,

  // variable definitions or map values
  /(\bclass\b|\w+Class\b|\bclass\w+)\s*[=:]\s*[^;]+/g,
  /CssClass\([^)]*\)[^}]*/g,

  // functions that can contain class names in code body
  /(getClassName|super|\w*class\w*\.push|clearHoveredItems)\([^}]+/gi,

  // function invocations that contain class names as arguments
  /(classList\.\w+|setAttribute|className\.\w+)\([^\n]+/gi,
  /(classList\.\w+|setAttribute|className\.\w+)\([^)]+/gi,

  // known class name prefixes
  /\bag-(header|icon|item-highlight|right-aligned|item|keyboard-focus|overlay-|popup-child|compact-menu-option)[a-z-]*/g,
];

const ignoreMatchPattern = /cssIdentifier|{cssClass}|{compId}|-$/i;

const classNameToCamelCase = (className: string) =>
  className
    .replace('ag-', '')
    .replaceAll(/(-)\w/g, (char) => char.toUpperCase())
    .replaceAll('-', '');

const isValidDirectory = (file: string) =>
  !['all-modules', 'node_modules', 'react', 'angular', 'vue', 'vue3', 'solid'].includes(file) &&
  !file.includes('.');

void main();
