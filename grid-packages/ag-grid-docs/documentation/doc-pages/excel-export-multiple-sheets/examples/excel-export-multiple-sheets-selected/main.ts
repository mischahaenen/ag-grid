import { GridApi, createGrid, ColDef, GridOptions, IRowNode } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  { field: 'athlete', minWidth: 200 },
  { field: 'age' },
  { field: 'country', minWidth: 200 },
  { field: 'year' },
  { field: 'date', minWidth: 150 },
  { field: 'sport', minWidth: 150 },
  { field: 'gold' },
  { field: 'silver' },
]

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    filter: true,
    minWidth: 100,
    flex: 1,
  },

  columnDefs: columnDefs,
  rowSelection: 'multiple',
}

function onBtExport() {
  var spreadsheets: string[] = []

  let nodesToExport: IRowNode[] = [];
  gridApi!.forEachNode((node, index) => {
    nodesToExport.push(node);

    if (index % 100 === 99) {
      gridApi!.setNodesSelected({ nodes: nodesToExport, newValue: true });
      spreadsheets.push(
        gridApi!.getSheetDataForExcel({
          onlySelected: true,
        })!
      )

      gridApi!.deselectAll()
      nodesToExport = [];
    }
  })

  // check if the last page was exported

  if (gridApi!.getSelectedNodes().length) {
    spreadsheets.push(
      gridApi!.getSheetDataForExcel({
        onlySelected: true,
      })!
    )
    gridApi!.deselectAll()
  }

  gridApi!.exportMultipleSheetsAsExcel({
    data: spreadsheets,
    fileName: 'ag-grid.xlsx'
  })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data))
})
