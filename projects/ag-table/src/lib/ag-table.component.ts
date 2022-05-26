import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Constants } from './constants/grid.constant';
import { ColumnDefinition } from '../public-api';
import { ColumnTypeService } from './services/column-type.service';
import { AgTableService } from './ag-table.service';
import { Columns } from './types/columns-data.type';
import { DataSource } from './types/data-source.type';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';

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
  @ViewChildren(MatInput) matInput!: QueryList<MatInput>;
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
  rangesForm: FormGroup = new FormGroup({});
  min: number = 0;

  constructor(
    private _decimalPipe: DecimalPipe,
    public _columnTypeService: ColumnTypeService,
    public _agTableService: AgTableService
  ) { }

  ngOnInit(): void {
    this.prepareTableData();
    
  }

  prepareTableData() {
    this.displayedColumns = this.columnDef.map(c => c.header);
    this.displayedColumns.forEach(col => {
      this.columnsForm.addControl(col, new FormControl(true));
    })
    //date form
    this.columnDef.forEach(col => {
      if (this._columnTypeService.isDate(col)) {
        this.datesColumns.push({ [col.header]: { start: this.startDate, end: this.endDate } });
        this.datesForm.addControl(`start${col.header}`, new FormControl(this.startDate));
        this.datesForm.addControl(`end${col.header}`, new FormControl(this.endDate));
      }
    })
    //range form
    // this.usersList().push(this.user());

    this.columnDef.forEach(col => {
      if (this._columnTypeService.isRange(col)) {
        this.rangesForm.addControl(`max${col.header}`, new FormControl());
        this.rangesForm.addControl(`min${col.header}`, new FormControl());
        this.rangesForm.addControl(`steps${col.header}`, new FormControl());
      }
    })

    this._agTableService.getColumnsData(this.dataSource, this.columnDef);
    this.columns = this._agTableService.columns;
    this.data = new MatTableDataSource(this.dataSource);

    this.data.filterPredicate = (record: DataSource, filter: any) => {
      var map = new Map(JSON.parse(filter));
      let isMatch = false;
      let include = false;
      for (let [key, value] of map) {
        let values = typeof (value) == 'string' ? value.split(',') : [];
        let isMatchForRange = [];
        for (let x of values) {
          record[key as keyof DataSource].split(',').forEach((el: any) => {
            if (el.toLowerCase().includes(x.toLowerCase())) {
              include = true;
            }
          })
          let includes = record[key as keyof DataSource].split(',').map((el: string) => el = el.toLowerCase()).includes(x.toLowerCase());
          isMatchForRange.push(x == 'All' || includes);
        }
        isMatch = isMatchForRange.includes(true);
        if (!isMatchForRange.includes(true)) return false;
      }
      return isMatch;
    };
    this.ngAfterViewInit();
  }

  // prepareData(): void {
  //   this._agTableService.getColumnsData(this.dataSource, this.columnDef);
  //   this.columns = this._agTableService.columns;
  //   this.data = new MatTableDataSource(this.dataSource);
  // }

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
        this.filterSelected(column.options.map(el => el.val), column);
      }
    }
  }

  toggleCheckBox(column: { val: string, selected: boolean }[], matselect: MatSelect, value: { selected: boolean; val: string; }) {
    value.selected = !value.selected;
    if (value.val == 'All') {
      if (value.selected) {
        column = column.map(col => { col.selected = true; return col });
        matselect.options.forEach((item: MatOption) => {
          item.select();
        });
      } else if (!value.selected) {
        column = column.map(col => { col.selected = false; return col });
        matselect.options.forEach((item: MatOption) => {
          item.deselect();
        });
      }
    } else {
      if (value.selected) {
        const allSelected = column.filter(col => col.val !== 'All' && col.selected).length === column.length - 1;
        if (allSelected) {
          column = column.map(col => { col.selected = true; return col });
          matselect.options.forEach((item: MatOption) => {
            item.select();
          });
        }
      } else {
        column = column.map(col => { if (col.val === 'All') col.selected = false; return col });
        matselect.options.forEach((item: MatOption) => {
          item.value === 'All' && item.deselect();
        });
      }
    }
  }

  // filtering if its select case
  handleSelectFilterCase(ob: { value: string[]; }, column: Columns) {
    if (ob.value.includes('All')) {
      this.filterSelected(column.options.map(el => el.val), column);
    } else {
      const filteredSelectList: any[] = [];
      column.options.map(el => el.val).forEach((col: string) => {
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
    if (column.list && column.stepsInfo) {
      if (column.stepsInfo.steps) {
        this.max = parseFloat(column.stepsInfo?.max);
        this.min = parseFloat(column.stepsInfo?.min);
        let steps = (this.max - this.min) / parseFloat(column.stepsInfo.steps);
        if (steps == 2) {
          let columnListForTwoSteps = column.list;
          if (this.min && this.max) {
            let lesser = ob.value.find((elm: string) => elm.includes('Less') && elm.includes('Equal')
            )
            let greater = ob.value.find((elm: string) => elm.includes('Greater'))
            if (greater && !lesser) {
              const filteredRangeListForTwoSteps = columnListForTwoSteps.filter((el: number) => el > Math.round(this.max / 2));
              this.filterRanges(filteredRangeListForTwoSteps, column);
            }
            if (lesser && !greater) {
              const filteredRangeListForTwoSteps = columnListForTwoSteps.filter((el: number) => el <= Math.round(this.max / 2));
              this.filterRanges(filteredRangeListForTwoSteps, column);
            }
            if (lesser && greater || ob.value.includes('All')) {
              const filteredRangeListForTwoSteps = columnListForTwoSteps.filter((el: number) => el <= Math.round(this.max) && el >= Math.round(this.min));
              this.filterRanges(filteredRangeListForTwoSteps, column);
              // this.filterRanges(column.list, column);
            }
          }
        } else {
          var numberArray: number[] = [];
          let filteredRangeList: any[] | undefined = []

          ob.value.forEach((elm: string) => {
            if (ob.value.includes('All')) {
              filteredRangeList = column.list?.filter((el: number) => el >= this.min && el <= this.max);
            } else {
              const stringArray = elm.split(' to ');
              let i = 0;
              while (i < stringArray.length) {
                numberArray.push(parseFloat(stringArray[i]));
                i += 1;
              }
              const minimum = Math.min(...numberArray);
              const maximum = Math.max(...numberArray);
              filteredRangeList = column.list?.filter((el: number) => el >= minimum && el <= maximum);
            }
          })
          this.filterRanges(filteredRangeList, column);
        }
      } else {
        let columnListForTwoSteps = column.list;
        let lesser = ob.value.find((elm: string) => elm.includes('Less') && elm.includes('Equal')
        )
        let greater = ob.value.find((elm: string) => elm.includes('Greater'));
        if (greater && !lesser) {
          const filteredRangeListForTwoSteps = columnListForTwoSteps.filter((el: number) => el > Math.round(parseFloat(column.stepsInfo ? column.stepsInfo?.max : '') / 2));
          this.filterRanges(filteredRangeListForTwoSteps, column);
        }
        if (lesser && !greater) {
          const filteredRangeListForTwoSteps = columnListForTwoSteps.filter((el: number) => el <= Math.round(parseFloat(column.stepsInfo ? column.stepsInfo?.max : '') / 2));
          this.filterRanges(filteredRangeListForTwoSteps, column);
        }
        if (lesser && greater || ob.value.includes('All')) {
          const filteredRangeListForTwoSteps = columnListForTwoSteps.filter((el: number) => el <= parseFloat(column.stepsInfo ? column.stepsInfo?.max : '') && el >= parseFloat(column.stepsInfo ? column.stepsInfo?.min : ''));
          this.filterRanges(filteredRangeListForTwoSteps, column);
          // this.filterRanges(column.list, column);
        }
      }
    }
  }

  //filter search list 
  filterSearchList(input: any, col: Columns) {
    if (input.value == '') {
      this.columns.forEach(column => {
        if (column.header == col.header) {
          column.filteredList = column.options;
          this.filterDictionary.set(column.field, column.options.toString());
          this.setDataFilter(column, true);
        }
      })
    } else {
      this.columns.forEach(column => {
        if (column.header == col.header) {
          const filterValue = input.value.toLowerCase();
          let filtered: any[] = []
          column.options.forEach((option: any) => {
            if (option.toLowerCase().includes(filterValue) || this.checkStringInString(option, filterValue)) {
              filtered.push(option);
            }
          })
          column.filteredList = filtered;
        }
      })
    }
  }

  checkStringInString(option: string, filterValue: any) {
    let include = false;
    option.split(",").forEach((el) => {
      if (el.toLowerCase().includes(filterValue)) {
        include = true;
      }
    })
    return include;
  }

  //filter for search type
  applyFilterForSearch(input: any, column: Columns): void {
    this.filterDictionary.set(column.field, input);
    this.setDataFilter(column, true);
  }

  //apply filter for date type
  applyFilterForDate(input: any, column: Columns): void {
    this.filterDictionary.set(column.field, input?.value);
    this.setDataFilter(column, true);
  }

  //filter through search in select type
  filterSearchedinSelectList(input: any, col: Columns) {
    this.columns.forEach(column => {
      if (column.header == col.header) {
        if (input.value == '') {
          column.filteredList = column.options;
        } else {
          const filterValue = input.value.toLowerCase();
          let filtered: { val: any; selected: boolean; }[] = [];
          column.options.forEach((option: any) => {
            if (option.val.toLowerCase().includes(filterValue) || this.checkStringInString(option.val, filterValue)) {
              filtered.push({ val: option.val, selected: option.selected })
            }
          })
          column.filteredList = filtered;
        }
      }
    })
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
      if (column.haveSpaceForSymbol) {
        filtered.push(`${x} ${column.symbol}`);
      } else {
        filtered.push(`${x}${column.symbol}`);
      }
    }
    this.filterDictionary.set(column.field, filtered.join(','));
    this.setDataFilter(column, true);
  }

  //filter for select type
  filterSelected(list: any[], column: Columns): void {
    this.filterDictionary.set(column.field, list.join(','),);
    this.setDataFilter(column, true);
  }

  //to set filters of data
  setDataFilter(column: Columns, saveFilter: boolean): void {
    var jsonStr = JSON.stringify(Array.from(this.filterDictionary.entries()));
    this.data.filter = jsonStr;
    if (saveFilter) {
      this.allFilters = Array.from(this.filterDictionary.entries()).map(entry => {
        return {
          column: entry[0],
          filters: entry[1].split(','),
          type: column.type
        }
      })
    }
  }

  //reset filters
  resetFilters(): void {
    this.matReference.forEach(matselect => {
      matselect.options.forEach((data: MatOption) => data.deselect())
    });
    this.matInput.forEach(matinput => {
      matinput.value = '';
    })
    this.data.filter = '';
    this.allFilters = [];
    this.columnDef.forEach(elm => {
      elm.selected = true;
      this.columnsForm.patchValue({ [elm.header]: true });
    });
    this.displayedColumns = this.columnDef.map(col => col.header);
    this.datesForm.reset();
    this.rangesForm.reset();
    this.datesColumns.forEach((el: any) => {
      for (let header in el) {
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
      if (col[column.header] && col[column.header]?.start && col[column.header]?.end) {
        const list = column.options.map(el => el.val).filter((el: string) => {
          if (el) {
            return el >= col[column.header].start && el <= col[column.header].end;
          } else {
            return false;
          }
        })
        this.filterDictionary.set(column.field, list.join(','));
        this.setDataFilter(column, true);
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
    this.filterDictionary.set(column.field, column.options.map(el => el.val).toString());
    this.setDataFilter(column, true);
  }

  //getFilters
  getFilters() {
    this.getAllFilters.emit(this.allFilters);
    console.log(this.allFilters)
  }

  clearSelectedOptions(matselect: MatSelect, column: Columns) {
    matselect.options.forEach((item: MatOption) => {
      item.deselect();
    });
    this.filterDictionary.set(column.field, column.options.map(el => el.val).toString());
    this.setDataFilter(column, true);
  }

  stop(event: any) {
    event.stopPropagation();
  }

  submitRangeForm(col: Columns, rangeForm: any, matRef: MatSelect) {
    console.log(rangeForm)
    if(this.validRangeSubmitBtn(col,rangeForm)){
      if (col.list) {
        this.filterRanges(col.list, col);
        this._agTableService.getCustomDropdownListForRange(col, rangeForm.value);
      }
  
      matRef.options.forEach(option => {
        option.deselect();
      })
    }else{
      console.log("toastr")
    }
  }

  validRangeSubmitBtn(col: Columns, formValue: any) {
    console.log(formValue.value,formValue.get('maxAvailable Cash Settlement Amount').value,formValue.get(`min${col.header}`).value,col,"submit")
    if(formValue.get(`min${col.header}`).value && formValue.get(`max${col.header}`).value && formValue.get(`steps${col.header}`).value){
      return true;
    }
    return false;
  }

  checkRangeFormField(column: Columns,rangesForm: any){
    return !rangesForm.get('min'+column.header).value || !rangesForm.get('max'+column.header).value || !rangesForm.get('steps'+column.header).value
  }

}