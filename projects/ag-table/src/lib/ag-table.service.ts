import { Injectable } from '@angular/core';
import { DataInterface } from 'projects/test-table/src/app/interface/data.type';
import { ColumnDefinition } from '../public-api';
import { AgTableComponent } from './ag-table.component';
import { Constants } from './constants/grid.constant';
import { ColumnTypeService } from './services/column-type.service';
import { Columns } from './types/columns-data.type';

@Injectable({
  providedIn: 'root'
})

export class AgTableService {
  rangelist: { val: string; selected: boolean; }[] = []
  list: any[] = []; //values of the column fields could be anything string,number,etc.
  columns: Columns[] = [];
  defaultValue: string = 'All';
  defaultSteps: string = '2';
  haveSpaceForSymbol: boolean = false;
  constructor(public _columnTypeService: ColumnTypeService) { }

  getColumnsData(dataSource: DataInterface[], columnDef: ColumnDefinition[]): void {
    if (this.columns.length) {
      this.columns = [];
    }
    for (let col of columnDef) {
      this.list = [];
      this.rangelist = [];

      //generates droplist for select and values of fields for ranges and search
      this.getDropdownListForSelect(dataSource, col);
      //generate columns Info like ==>>> field header type options symbol steps list defaultValue
      this.generateColumnsInfo(col);
      //generates droplist for range type
      this.getDropdownListForRange(col);
    }
  }

  generateColumnsInfo(col: ColumnDefinition) {
    if (this._columnTypeService.isRange(col)) {
      this.columns.push({
        field: col.field,
        header: col.header,
        type: col.type,
        options: this.rangelist, //dropdown options
        symbol: col.symbol || '',
        stepsInfo: { steps: '', max: '', min: '' },
        list: this.list, //values of this field
        filteredList: this.rangelist,
        defaultValue: this.defaultValue,
        haveSpaceForSymbol: this.haveSpaceForSymbol
      })
    } else {
      if (this._columnTypeService.isSelect(col)) {
        this.list.push({ val: 'All', selected: false });
      }
      //sort
      if (this._columnTypeService.isSearch(col)) {
        let dropdownList = this.list.map(el => el.val).join(',').split(',').sort((a, b) => (a > b) ? 1 : ((b > a) ? -1 : 0))
        this.columns.push({
          field: col.field,
          header: col.header,
          type: col.type,
          options: dropdownList, //dropdown options == values of this field
          filteredList: dropdownList,
          list: this.list,
          defaultValue: this.defaultValue,
        })
      } else {
        this.list.sort((a, b) => (a.val > b.val) ? 1 : ((b.val > a.val) ? -1 : 0))
        this.columns.push({
          field: col.field,
          header: col.header,
          type: col.type,
          options: this.list, //dropdown options == values of this field
          filteredList: this.list,
          list: this.list,
          defaultValue: this.defaultValue,
        })
      }

    }
  }

  getDropdownListForSelect(dataSource: any[], col: ColumnDefinition): void {
    dataSource.forEach(el => {
      // if (this.list.length) {
      if (this._columnTypeService.isSelect(col) || this._columnTypeService.isSearch(col) || this._columnTypeService.isDate(col)) {
        if (this.list.length) {
          if (!this.list.find((item: { val: any; }) => item.val == el[col.field])) {
            this.list.push({ val: el[col.field], selected: false });
          }
        } else {
          this.list.push({ val: el[col.field], selected: false });
        }
      }
      if (this._columnTypeService.isRange(col)) {
        if (typeof (el[col.field]) == 'string') {
          const valueAndSymbolArray = el[col.field].split(" ");
          const str = valueAndSymbolArray[0] ? valueAndSymbolArray[0].replace(/[^0-9.]/g, '') : el[col.field].replace(/[^0-9.]/g, '')
          this.haveSpaceForSymbol = valueAndSymbolArray.length > 1 ? true : false;
          const num = parseFloat(str);
          if (this.list.length) {
            if (!this.list.includes(num)) {
              this.list.push(num);
            }
          }
          else {
            this.list.push(num);
          }
        } 
      }
    })
  }

  getDropdownListForRange(col: ColumnDefinition): void {
    if (this._columnTypeService.isRange(col)) {
      const list = this.list;
      let max = Math.max(...list);
      let min = Math.min(...list);
      if (max > 1) {
        this.rangelist = [{ val: 'All', selected: false }, { val: `Less than or Equal to ${Math.round(max / 2)} `, selected: false }, { val: `Greater than ${Math.round(max / 2)} `, selected: false }]
      } else {
        this.rangelist = [{ val: 'All', selected: false }, { val: `Less than or Equal to 1`, selected: false }]
      }

      this.columns.forEach(column => {
        if (column.header == col.header) {
          column.filteredList = this.rangelist;
          column.options = this.rangelist;
          column.stepsInfo = { steps: '', max: max.toString(), min: min.toString() };
        }
      })
    }
  }

  getCustomDropdownListForRange(col: ColumnDefinition, formValue: any): void {
    if (this._columnTypeService.isRange(col)) {
      this.rangelist = [];
      let max = parseFloat(formValue[`max${[col.header]}`]);
      let min = parseFloat(formValue[`min${[col.header]}`]);
      let steps = (max - min) / parseFloat(formValue[`steps${[col.header]}`]);
      let difference = parseFloat(formValue[`steps${[col.header]}`]);

      this.rangelist.push({ val: 'All', selected: false });
      if (steps) {
        if (steps == 2) {
          if (max > 1) {
            this.rangelist = [{ val: 'All', selected: false }, { val: `Less than or Equal to ${Math.round(max / 2)} `, selected: false }, { val: `Greater than ${Math.round(max / 2)} `, selected: false }]
          } else {
            this.rangelist = [{ val: 'All', selected: false }, { val: `Less than or Equal to 1`, selected: false }]
          }
        }
        else {
          let startvalue = min;
          let i = 1;
          while (i < steps + 1) {
            let range;
            if (difference + startvalue > max) {
              range = i == steps ? { val: `${startvalue} to ${(max)}`, selected: false } : { val: `${startvalue} to ${Math.round(max)}`, selected: false };
            } else {
              range = i == steps ? { val: `${startvalue} to ${(difference + startvalue)}`, selected: false } : { val: `${startvalue} to ${Math.round(difference + startvalue)}`, selected: false };
            }
            startvalue = Math.round(difference + startvalue);
            this.rangelist.push(range);
            i += 1;
          }
        }
      }
      this.columns.forEach(column => {
        if (column.header == col.header) {
          column.filteredList = this.rangelist;
          column.options = this.rangelist;
          column.stepsInfo = { steps: difference.toString(), max: max.toString(), min: min.toString() };
        }
      })
    }
  }
}
