import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { DecimalPipe } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { Constants } from './constants/grid.constant';
import { ColumnDefinition } from '../public-api';
import { ColumnTypeService } from './services/column-type.service';
import { AgTableService } from './ag-table.service';
import { Columns } from './types/columns-data.type';
import { DataSource } from './types/data-source.type';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';

@Component({
  selector: 'lib-ag-table',
  templateUrl: './ag-table.component.html',
  styleUrls: ['./ag-table.component.css']
})

export class AgTableComponent implements OnInit, AfterViewInit {
  @Output() onGridReady: EventEmitter<any> = new EventEmitter();
  @Input() dataSource: DataSource[] = [];
  @Input() columnDef: ColumnDefinition[] = [];
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChildren(MatSelect) matReference!: QueryList<MatSelect>
  displayedColumns: string[] = this.columnDef.map(c => c.header)
  data = new MatTableDataSource(this.dataSource);
  filterDictionary = new Map<string, any>();
  columns: Columns[] = [];
  max: number = 0;

  columnsForm: FormGroup = new FormGroup({
    // 'Good To Trade': new FormControl(true),
    // 'Counterparty': new FormControl(true),
    // 'Repo Type': new FormControl(true),
    // 'Side': new FormControl(true),
    // 'Available Cash Settlement Amount': new FormControl(true),
    // 'Cash Settlement Currency': new FormControl(true),
    // 'Rate/Spread Over Benchmark': new FormControl(true),
    // 'Floating': new FormControl(true),
    // 'Purchasing Date': new FormControl(true),
    // 'Repurchase Date': new FormControl(true),
    // 'Repo Term Type': new FormControl(true),
    // 'Market Sector': new FormControl(true),
    // 'Issuer Domicile': new FormControl(true),
    // 'Quality': new FormControl(true),
    // 'Collaterals': new FormControl(true)
  });

  dateForm = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
});

  showColumns: boolean = false;
  // ranges: any[] = [];

  // 'Good To Trade' = this.columnsForm.get("Good To Trade");
  // 'Counterparty' = this.columnsForm.get("Counterparty");
  // 'Repo Type' = this.columnsForm.get("Repo Type");
  // 'Side' = this.columnsForm.get("Side");
  // 'Available Cash Settlement Amount' = this.columnsForm.get("Available Cash Settlement Amount");
  // 'Cash Settlement Currency' = this.columnsForm.get("Cash Settlement Currency");
  // 'Rate/Spread Over Benchmark' = this.columnsForm.get("Rate/Spread Over Benchmark");
  // 'Floating' = this.columnsForm.get("Floating");
  // 'Purchasing Date' = this.columnsForm.get("Purchasing Date");
  // 'Repurchase Date' = this.columnsForm.get("Repurchase Date");
  // 'Repo Term Type' = this.columnsForm.get("Repo Term Type");
  // 'Market Sector' = this.columnsForm.get("Market Sector");
  // 'Issuer Domicile' = this.columnsForm.get("Issuer Domicile");
  // 'Quality' = this.columnsForm.get("Quality");
  // 'Collaterals' = this.columnsForm.get("Collaterals");

  // get fromDate() { return this.dateForm.get('start').value; }
  // get toDate() { return this.dateForm.get('end').value; }

  constructor(private _decimalPipe: DecimalPipe, public columnTypeService: ColumnTypeService, public agTableService: AgTableService) {}

  ngOnInit(): void {
    this.displayedColumns = this.columnDef.map(c => c.header);
    this.displayedColumns.forEach(col => {
      this.columnsForm.addControl(col, new FormControl(true));
    })
    this.agTableService.getColumnsData(this.dataSource, this.columnDef);
    this.columns = this.agTableService.columns;

    this.data = new MatTableDataSource(this.dataSource);
    this.data.filterPredicate = (record: DataSource, filter: any) => {
      var map = new Map(JSON.parse(filter));
      let isMatch = false;
      for (let [key, value] of map) {
        let val = typeof (value) == 'string' ? value.split(',') : [];
        let isMatchForRange = [];
        for (let x of val) {
          isMatchForRange.push(x == 'All' || record[key as keyof DataSource] == x);
        }
        isMatch = isMatchForRange.includes(true);
        if (!isMatchForRange.includes(true)) return false;
      }
      // if (this.dateForm.get('start')?.value && this.dateForm.get('end')?.value) {
      //   let dates = ['Repurchase Date', 'Purchasing Date'];
      //   for(let key of dates){
      //     return record[key as keyof DataSource] >= this.dateForm.get('start')?.value && 
      //     record[key as keyof DataSource] >= this.dateForm.get('end')?.value
      //   }
      // }
      return isMatch;
    };
  }

  ngAfterViewInit(): void {
    this.data.paginator = this.paginator;
    this.data.sort = this.sort;
    this.onGridReady.emit(this);
  }

  // applyFilter(target:any) {
  //   console.log(target.value)
  //   this.data.filter = target.value?.trim()?.toLowerCase();
  // }

  applyFilter(ob: { value: any; }, column: { type: any; list?: any; options: any; field: string; steps?: any; symbol?: string }): void {
    if (ob.value.length) {
      // column type == select
      if (column.type == Constants.SELECT) {
        this.handleSelectFilterCase(ob, column);
      }
      // column type ==  range 
      if (column.type == Constants.RANGE) {
        this.handleRangeFilterCase(column, ob);
      }
    }
    else {
      if (column.type == Constants.RANGE) {
        this.filterRanges(column.list, column);
      } else if (column.type == Constants.SELECT) {
        this.filterSelected(column.options, column)
      }
    }
  }

  toggleCheckBox(column: any, field: any, value: any) {
    value.selected = !value.selected;
    if (value.val == 'All' && value.selected) {
      column = column.map((col: any) => {col.selected = true; return col});
      field.options.forEach( (item : MatOption) => {
        item.select();
      });
    } else {
      if (value.selected) {
        const allSelected = column.filter((col: any) => col.val !== 'All' && col.selected).length === column.length - 1;
        if (allSelected) {
          column = column.map((col: any) => {col.selected = true; return col});
          field.options.forEach( (item : MatOption) => {
            item.select();
          });
        }
      } else {
        column = column.map((col: any) => {if (col.val === 'All') col.selected = false; return col});
        field.options.forEach( (item : MatOption) => {
          item.value === 'All' && item.deselect();
        });
      }
    }
  }

  // filtering if its select case
  handleSelectFilterCase(ob: { value: string[]; }, column: { type: any; list?: any; options: any; field: string; steps?: any; symbol?: string }) {
    if (ob.value.includes('All')) {
      this.filterSelected(column.options, column);
    } else {
      const filteredSelectList: any[] = [];
      column.options.forEach((col: string) => {
        if (ob.value.includes(col)) {
          if (!filteredSelectList.length) {
            filteredSelectList.push(col);
          } else {
            if (!filteredSelectList.includes(col)) {
              filteredSelectList.push(col);
            }
          }
        }
      })

      this.filterSelected(filteredSelectList, column);
    }
  }

  //filtering for range case 
  handleRangeFilterCase(column: { type: any; list?: any; options: any; field: string; steps?: any; symbol?: string }, ob: { value: string[]; }) {
    if (column.steps == '2') {
      let columnListForTwoSteps = column.list;
      this.max = Math.max(...columnListForTwoSteps);
      let lesser = ob.value.find((elm: string) => elm.includes('Less') && elm.includes('Equal')
      )
      let greater = ob.value.find((elm: string) => elm.includes('Greater'))
      if (greater && !lesser) {
        const filteredRangeListForTwoSteps = columnListForTwoSteps.filter((el: number) => el > Math.round(this.max / 2))
        this.filterRanges(filteredRangeListForTwoSteps, column);
      }
      if (lesser && !greater) {
        const filteredRangeListForTwoSteps = columnListForTwoSteps.filter((el: number) => el <= Math.round(this.max / 2))
        this.filterRanges(filteredRangeListForTwoSteps, column);
      }
      if (lesser && greater || ob.value.includes('All')) {
        this.filterRanges(column.list, column);
      }
    } else {
      var numberArray: number[] = [];
      let filteredRangeList: any[] = []

      ob.value.forEach((elm: string) => {
        if (ob.value.includes('All')) {
          filteredRangeList = column.list;
        } else {
          const stringArray = elm.split(' to ');
          let i = 0;
          while (i < stringArray.length) {
            numberArray.push(parseFloat(stringArray[i]));
            i += 1;
          }
          const minimum = Math.min(...numberArray);
          const maximum = Math.max(...numberArray)
          filteredRangeList = column.list.filter((el: number) => el >= minimum && el <= maximum);
        }
      })
      this.filterRanges(filteredRangeList, column);
    }
  }

  //filter for search type
  applyFilterForSearch(input: any, column: { type: string; field: string; }): void {
    this.filterDictionary.set(column.field, input?.value);
    this.setDataFilter();
  }

  //apply filter for date type
  applyFilterForDate(input: any, column: { type: string; field: string; }): void {
    this.filterDictionary.set(column.field, input?.value);
    this.setDataFilter();
  }
  
  // filter columns
  updateColumns(cd: any): void {
    this.columnDef.forEach(elm => {
      if (elm.header == cd) {
        if (elm.selected == undefined && elm.selected == null) {
          elm.selected = true;
        }
        elm.selected = !elm.selected;
      }
    });
    this.displayedColumns = this.columnDef.filter(col => col.selected).map(c => c.header);
  }

  //filter for range type
  filterRanges(list: any[], column: { type: any; list?: any; options: any; field: any; steps?: any; symbol?: string; }): void {
    let filtered: any[] = [];
    for (let x of list) {
      if (column.symbol == '%') {
        filtered.push(`${x}${column.symbol}`);
      } else {
        filtered.push(`${x} ${column.symbol}`);
      }
    }
    this.filterDictionary.set(column.field, filtered.join(','));
    this.setDataFilter();
  }

  //filter for select type
  filterSelected(list: any[], column: { type: any; list?: any; options: any; field: any; steps?: any; symbol?: string }): void {
    this.filterDictionary.set(column.field, list.join(','));
    this.setDataFilter();
  }

  //to set filters of data
  setDataFilter(): void {
    var jsonStr = JSON.stringify(Array.from(this.filterDictionary.entries()));
    this.data.filter = jsonStr;
  }

  //reset filters
  resetFilters(): void {
    this.matReference.forEach(matselect => {
      matselect.options.forEach((data: MatOption) => data.select())
    });
    this.data.filter = '';
    this.columnDef.forEach(elm => {
      elm.selected = true;
      this.columnsForm.patchValue({[elm.header]: true});
    });
    console.log(this.columnDef)
    this.displayedColumns = this.columnDef.map(col => col.header);      
  }

  // updateChecks
  updateChecksOfDropdownsList() {

  }
}
