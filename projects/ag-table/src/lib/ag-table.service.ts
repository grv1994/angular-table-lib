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
  showCustomDropdownListForRange: boolean = false;
  showDropdownFormForRange: boolean = false;

  constructor() { }

  getColumnsData(dataSource: DataInterface[], columnDef: ColumnDefinition[]):void {
    if(this.columns.length){
      this.columns = [];
    }
    for (let col of columnDef) {
      this.list = [];
      this.rangelist = [];

      //generates droplist for select and values of fields for ranges and search
      this.getDropdownListForSelect(dataSource,col);
      //generates droplist for range type
      // this.getDropdownListForRange(col);
      //generate columns Info like ==>>> field header type options symbol steps list defaultValue
      this.generateColumnsInfo(col);
    }
  }

  generateColumnsInfo(col: ColumnDefinition){
    if (col.type == Constants.RANGE) {
      this.columns.push({
        field: col.field,
        header: col.header,
        type: col.type,
        options: this.rangelist, //dropdown options
        symbol: col.symbol || '',
        stepsInfo:{steps:'',max:'',min:''},
        list: this.list, //values of this field
        filteredList: this.rangelist,
        defaultValue: this.defaultValue
      })
    } else {
      if(col.type == Constants.SELECT){
        this.list.push({val: 'All',selected: false});
      }
      //sort
      this.list.sort((a,b) => (a.val > b.val) ? 1 : ((b.val > a.val) ? -1 : 0))

      this.columns.push({
        field: col.field,
        header: col.header,
        type: col.type,
        options: this.list, //dropdown options == values of this field
        filteredList: this.list,
        defaultValue: this.defaultValue
      })
    }
  }

  getDropdownListForSelect(dataSource: any[],col: ColumnDefinition):void {
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

  // getDropdownListForRange(col: ColumnDefinition):void {
  //   if (col.type == Constants.RANGE) {
  //     const list = this.list;
  //     this.max = Math.max(...list);
  //     if(col.steps){
  //       if (col.steps == '2') {
  //         if (this.max > 1) {
  //           this.rangelist = [{val: `Less than or Equal to ${Math.round(this.max / 2)} %`,selected: false}, {val:`Greater than ${Math.round(this.max / 2)} %`, selected: false}]
  //         } else {
  //           this.rangelist = [{val: `Less than or Equal to 1%`,selected: false}]
  //         }
  //       }
  //       else {
  //         let steps = parseFloat(col.steps);
  //         let startvalue = 0;
  //         let i = 1;
  //         let difference = this.max / steps;
  //         while(i < steps+1){
  //           let range = i == steps ? {val: `${startvalue} to ${(difference)*i }`,selected: false} : {val: `${startvalue} to ${Math.round(difference)*i}`,selected: false};
  //           startvalue = Math.round(difference)*i;
  //           this.rangelist.push(range);
  //           i += 1;
  //         }
  //       }
  //     }
  //   }
  // }

  getCustomDropdownListForRange(col: ColumnDefinition,formValue: any):void {
    if (col.type == Constants.RANGE) {
      this.rangelist = [];
      // const list = this.list;
      console.log(formValue)
      let max = parseFloat(formValue[`max${[col.header]}`]);
      let min = parseFloat(formValue[`min${[col.header]}`]);
      let steps = parseFloat(formValue[`steps${[col.header]}`]);
      console.log(max,min,steps)
      if(steps){
        if (steps == 2) {
          if (max > 1) {
            this.rangelist = [{val: `Less than or Equal to ${Math.round(max / 2)} %`,selected: false}, {val:`Greater than ${Math.round(max / 2)} %`, selected: false}]
          } else {
            this.rangelist = [{val: `Less than or Equal to 1%`,selected: false}]
          }
        }
        else {
          let startvalue = min;
          let i = 1;
          let difference = max / steps;
          while(i < steps+1){
            let range = i == steps ? {val: `${startvalue} to ${(difference)*i }`,selected: false} : {val: `${startvalue} to ${Math.round(difference)*i}`,selected: false};
            startvalue = Math.round(difference)*i;
            this.rangelist.push(range);
            i += 1;
          }
        }
      }
      this.rangelist.push({val: 'All',selected: false});
      this.columns.forEach(column => {
         if(column.header == col.header){
           column.filteredList = this.rangelist;
           column.stepsInfo = {steps: steps.toString(),max: max.toString(),min: min.toString()};
         }
      })
      this.showDropdownFormForRange = false;
    }
  }

  showCustomDropdownForRange(){
    Promise.resolve().then(() => this.showCustomDropdownListForRange = true);
  }

  showDropdownForm(){
    this.showDropdownFormForRange = true;
  }
}
