import { Component } from "@angular/core";
import { ICellRendererParams } from "@ag-grid-community/core";
import { ICellRendererAngularComp } from "@ag-grid-community/angular";

@Component({
    selector: 'update-cell-renderer',
    template: `
        <div>
            <button (click)="onClick()">Update Data</button>
        </div>
    `
})
export class UpdateCellRenderer implements ICellRendererAngularComp {
    public params!: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(): boolean {
        return false;
    }

    onClick(): void {
        const { node } = this.params;
        const { gold, silver, bronze } = node.data;
        node.updateData({
            ...node.data,
            gold: gold + 1,
            silver: silver + 1,
            bronze: bronze + 1
        });
    }
}
