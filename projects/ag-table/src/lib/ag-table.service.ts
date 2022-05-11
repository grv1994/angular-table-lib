import { Injectable } from '@angular/core';
import { DataInterface } from 'projects/test-table/src/app/interface/data.type';
import { ColumnDefinition } from '../public-api';
import { Constants } from './constants/grid.constant';
import { Columns } from './types/columns-data.type';

@Injectable({
  providedIn: 'root'
})

export class AgTableService {
  rangelist: { val: string; selected: boolean; }[] = []
  list: any[] = []; //values of the column fields could be anything string,number,etc.
  max: number = 0;
  columns: Columns[] = [];
  defaultValue: string = 'All';
  defaultSteps: string = '2';

  constructor() { }

  getColumnsData(dataSource: DataInterface[], columnDef: ColumnDefinition[]):void {
    for (let col of columnDef) {
      this.list = [];
      this.rangelist = [];
      // ranges = [];
      //generates droplist for select and values of fields for ranges and search
      this.getDropdownListForSelect(dataSource,col);

      //generates droplist for range type
      this.getDropdownListForRange(col);
      //generate columns Info like ==>>> field header type options symbol steps list defaultValue
      if (col.type == Constants.RANGE) {
        this.rangelist.push({val: 'All',selected: false});
        this.columns.push({
          field: col.field,
          header: col.header,
          type: col.type,
          options: this.rangelist.map(item => item.val), //dropdown options
          symbol: col.symbol || '',
          steps: col.steps || this.defaultSteps,
          list: this.list, //values of this field
          listWithChecks: this.rangelist,
          defaultValue: this.defaultValue
        })
      } else {
        this.list.push({val: 'All',selected: false});
        this.columns.push({
          field: col.field,
          header: col.header,
          type: col.type,
          options: this.list.map(item => item.val), //dropdown options == values of this field
          listWithChecks: this.list,
          defaultValue: this.defaultValue
        })
      }
    }
  }

  getDropdownListForSelect(dataSource: any[],col: { field: any; header?: string; selected?: boolean | undefined; type: any; steps?: string | undefined; symbol?: string | undefined; }):void {
    dataSource.forEach(el => {
      if (this.list.length) {
          if (col.type == Constants.SELECT || col.type == Constants.SEARCH || col.type == Constants.DATE) {
            if (!this.list.find((item: { val: any; }) => item.val == el[col.field])) {
            this.list.push({val: el[col.field],selected: false});
          }
        }
          if (col.type == Constants.RANGE) {
            if (typeof (el[col.field]) == 'string') {
              const str = el[col.field].substring(0, el[col.field].length - 1);
              const num = parseFloat(str)
              if (!this.list.includes(num)) {
                this.list.push(num);
              }
              // ranges.push(num);
            }
          }
        
      } else {
        if (col.type == Constants.SELECT || col.type == Constants.SEARCH || col.type == Constants.DATE) {
          this.list.push({val: el[col.field],selected: false});
        }
        if (col.type == Constants.RANGE) {
          if (typeof (el[col.field]) == 'string') {
            const str = el[col.field].substring(0, el[col.field].length - 1);
            const num = parseFloat(str)
            this.list.push(num);
            // ranges.push(num);
          }
        }
      }
    })
  }

  getDropdownListForRange(col: { field?: string; header?: string; selected?: boolean | undefined; type: any; steps?: string; symbol?: string | undefined; }):void {
    if (col.type == Constants.RANGE) {
      const list = this.list;
      this.max = Math.max(...list);
      if(col.steps){
        if (col.steps == '2') {
          if (this.max > 1) {
            this.rangelist = [{val: `Less than or Equal to ${Math.round(this.max / 2)} %`,selected: false}, {val:`Greater than ${Math.round(this.max / 2)} %`, selected: false}]
          } else {
            this.rangelist = [{val: `Less than or Equal to 1%`,selected: false}]
          }
        }
        else {
          let steps = parseFloat(col.steps);
          let startvalue = 0;
          let i = 1;
          let difference = this.max / steps;
          while(i < steps+1){
            let range = i == steps ? {val: `${startvalue} to ${(difference)*i }`,selected: false} : {val: `${startvalue} to ${Math.round(difference)*i}`,selected: false};
            startvalue = Math.round(difference)*i;
            this.rangelist.push(range);
            i += 1;
          }
        }
      }
    }
  }
}
