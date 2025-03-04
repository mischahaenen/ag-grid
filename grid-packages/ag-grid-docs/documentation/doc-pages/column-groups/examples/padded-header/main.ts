import { GridApi, createGrid, ColDef, ColGroupDef, GridOptions } from '@ag-grid-community/core';

const columnDefs: (ColDef | ColGroupDef)[] = [
  {
    headerName: 'Athlete Details',
    children: [
      { field: 'athlete' },
      { field: 'country' },
    ],
  },
  {
    field: 'age',
    width: 90,
    suppressSpanHeaderHeight: true
  }
]

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    filter: true,
  },
  // debug: true,
  columnDefs: columnDefs,
  rowData: null,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data))
})
