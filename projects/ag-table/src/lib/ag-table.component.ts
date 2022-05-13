import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { Constants } from './constants/grid.constant';
import { ColumnDefinition } from '../public-api';
import { ColumnTypeService } from './services/column-type.service';
import { AgTableService } from './ag-table.service';
import { Columns } from './types/columns-data.type';
import { DataSource } from './types/data-source.type';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatDateRangePicker } from '@angular/material/datepicker';
export type filterType = {
  column: string,
  filters: string[]
}

@Component({
  selector: 'lib-ag-table',
  templateUrl: './ag-table.component.html',
  styleUrls: ['./ag-table.component.css']
})

export class AgTableComponent implements OnInit, AfterViewInit {
  @Output() onGridReady: EventEmitter<any> = new EventEmitter();
  @Output() getAllFilters: EventEmitter<any> = new EventEmitter();
  @Input() dataSource: DataSource[] = [];
  @Input() columnDef: ColumnDefinition[] = [];
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChildren(MatSelect) matReference!: QueryList<MatSelect>;
  displayedColumns: string[] = this.columnDef.map(c => c.header)
  data = new MatTableDataSource(this.dataSource);
  filterDictionary = new Map<string, string>();
  columns: Columns[] = [];
  max: number = 0;
  columnsForm: FormGroup = new FormGroup({});
  pipe: DatePipe = new DatePipe('en-US');
  showColumns: boolean = false;
  datesColumns: { [x: string]: { start: any; end: any; }; }[] = [];
  allFilters: { column: string; filters: string[]; type: any; }[] | undefined;
  startDate: string | null | undefined;
  endDate: string | null | undefined;
  datesForm: FormGroup = new FormGroup({});

  constructor(private _decimalPipe: DecimalPipe, public columnTypeService: ColumnTypeService, public agTableService: AgTableService) { }

  ngOnInit(): void {
    this.displayedColumns = this.columnDef.map(c => c.header);
    this.displayedColumns.forEach(col => {
      this.columnsForm.addControl(col, new FormControl(true));
    })
    this.agTableService.getColumnsData(this.dataSource, this.columnDef);
    this.columns = this.agTableService.columns;
    let datesHeaders = this.columnDef.filter(c => this.columnTypeService.isDate(c)).map(c => c.header);
    for (let header of datesHeaders) {
      this.datesColumns.push({ [header]: { start: this.startDate, end: this.endDate } });
      this.datesForm.addControl(`start${header}`, new FormControl(this.startDate));
      this.datesForm.addControl(`end${header}`, new FormControl(this.endDate));
    }
    this.data = new MatTableDataSource(this.dataSource);
    this.data.filterPredicate = (record: DataSource, filter: any) => {
      console.log(filter)
      var map = new Map(JSON.parse(filter));
      let isMatch = false;
      let include = false;
      for (let [key, value] of map) {
        let values = typeof (value) == 'string' ? value.split(',') : [];
        let isMatchForRange = [];
        for (let x of values) {
          record[key as keyof DataSource].split(',').forEach((el:any) => {
          if(el.includes(x)){
            include = true;
          }
        })
          let includes = record[key as keyof DataSource].split(',').includes(x);     
          isMatchForRange.push(x == 'All' || includes);
        }
        isMatch = isMatchForRange.includes(true);
        if (!isMatchForRange.includes(true)) return false;
      }
      return isMatch;
    };
  }

  ngAfterViewInit(): void {
    this.data.paginator = this.paginator;
    this.data.sort = this.sort;
    this.onGridReady.emit(this);
  }

  applyFilter(ob: { value: any; }, column: Columns): void {
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
        if (column.list) {
          this.filterRanges(column.list, column);
        }
      } else if (column.type == Constants.SELECT) {
        this.filterSelected(column.options, column)
      }
    }
  }

  toggleCheckBox(column: { val: string, selected: boolean }[], field: MatSelect, value: { selected: boolean; val: string; }) {
    value.selected = !value.selected;
    if (value.val == 'All') {
      if (value.selected) {
        column = column.map(col => { col.selected = true; return col });
        field.options.forEach((item: MatOption) => {
          item.select();
        });
      } else if (!value.selected) {
        column = column.map(col => { col.selected = false; return col });
        field.options.forEach((item: MatOption) => {
          item.deselect();
        });
      }
    } else {
      if (value.selected) {
        const allSelected = column.filter(col => col.val !== 'All' && col.selected).length === column.length - 1;
        if (allSelected) {
          column = column.map(col => { col.selected = true; return col });
          field.options.forEach((item: MatOption) => {
            item.select();
          });
        }
      } else {
        column = column.map(col => { if (col.val === 'All') col.selected = false; return col });
        field.options.forEach((item: MatOption) => {
          item.value === 'All' && item.deselect();
        });
      }
    }
  }

  // filtering if its select case
  handleSelectFilterCase(ob: { value: string[]; }, column: Columns) {
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
  handleRangeFilterCase(column: Columns, ob: { value: string[]; }) {
    if (column.list) {
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
        let filteredRangeList: any[] | undefined = []

        ob.value.forEach((elm: string) => {
          if (ob.value.includes('All')) {
            filteredRangeList = column.list;
          } else {
            const stringArray = elm.split(' to ');
            let i = 0;
            while (i < stringArray.length) {
              numberArray.push(parseFloat(stringArray[i]));
              i = 1;
            }
            const minimum = Math.min(...numberArray);
            const maximum = Math.max(...numberArray);
            filteredRangeList = column.list?.filter((el: number) => el >= minimum && el <= maximum);
          }
        })
        this.filterRanges(filteredRangeList, column);
      }
    }
  }

  //filter for search type
  applyFilterForSearch(input: any, column: Columns): void {
    if (input.value == '') {
      this.filterDictionary.set(column.field, column.options.toString());
      this.setDataFilter(column);
    } else {
      this.filterDictionary.set(column.field, input?.value);
      this.setDataFilter(column);
    }
  }

  //apply filter for date type
  applyFilterForDate(input: any, column: Columns): void {
    this.filterDictionary.set(column.field, input?.value);
    this.setDataFilter(column);
  }

  // filter columns
  updateColumns(cd: string): void {
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
  filterRanges(list: any[], column: Columns): void {
    let filtered: string[] = [];
    for (let x of list) {
      if (column.symbol == '%') {
        filtered.push(`${x}${column.symbol}`);
      } else {
        filtered.push(`${x} ${column.symbol}`);
      }
    }
    this.filterDictionary.set(column.field, filtered.join(','));
    this.setDataFilter(column);
  }

  //filter for select type
  filterSelected(list: any[], column: Columns): void {
    this.filterDictionary.set(column.field, list.join(','),);
    this.setDataFilter(column);
  }

  //to set filters of data
  setDataFilter(column: Columns): void {
    var jsonStr = JSON.stringify(Array.from(this.filterDictionary.entries()));
    this.data.filter = jsonStr;
    this.allFilters = Array.from(this.filterDictionary.entries()).map(entry => {
      return {
        column: entry[0],
        filters: entry[1].split(','),
        type: column.type
      }
    })
  }

  //reset filters
  resetFilters(): void {
    this.matReference.forEach(matselect => {
      matselect.options.forEach((data: MatOption) => data.deselect())
    });
    this.data.filter = '';
    this.columnDef.forEach(elm => {
      elm.selected = true;
      this.columnsForm.patchValue({ [elm.header]: true });
    });
    this.displayedColumns = this.columnDef.map(col => col.header);
    this.datesForm.reset();
    this.datesColumns.forEach((el: any) => {
      for(let header in el){
      if (el[header]) {
        el[header].end = null;
         el[header].start = null;
      }
      }

    })
  }

  onDateChange(event: { value: string | number | Date; }, action: string, column: Columns) {
    let startDate: string | number | null;
    let endDate: string | number | null;
    if (action === 'start') {
      startDate = this.pipe.transform(new Date(event.value), 'yyyy/MM/dd');
      this.datesColumns.forEach((el: any) => {
        if (el[column.header]) {
          el[column.header].start = startDate;
          this.datesForm.get(`start${[column.header]}`)?.setValue(new Date(event.value));
        }
      })
    } else if (action === 'end') {
      endDate = this.pipe.transform(new Date(event.value), 'yyyy/MM/dd');
      this.datesColumns.forEach((el: any) => {
        if (el[column.header]) {
          el[column.header].end = endDate;
          this.datesForm.get(`end${[column.header]}`)?.setValue(new Date(event.value));
        }
      })
    }
    this.datesColumns.forEach(col => {
      console.log(col[column.header])
      if (col[column.header] && col[column.header]?.start && col[column.header]?.end) {
        console.log(this.datesForm)
        const list = column.options.filter((el: string) => {
          if (el) {
            return el >= col[column.header].start && el <= col[column.header].end;
          } else {
            return false;
          }
        })
        // console.log(list)
        this.filterDictionary.set(column.field, list.join(','));
        this.setDataFilter(column);
      }
    })
  }

  clearDate(event: { stopPropagation: () => void; }, column: Columns) {
    // event.stopPropagation();
    this.datesForm.get(`start${[column.header]}`)?.setValue(null);
    this.datesForm.get(`end${[column.header]}`)?.setValue(null);
    this.datesColumns.forEach((el: any) => {
      if (el[column.header]) {
        el[column.header].end = null;
         el[column.header].start = null;
      }
    })
    console.log(this.datesForm)
    this.filterDictionary.set(column.field, column.options.toString());
    this.setDataFilter(column);
  }

  //getFilters
  getFilters() {
    this.getAllFilters.emit(this.allFilters);
    console.log(this.allFilters)
  }
}
