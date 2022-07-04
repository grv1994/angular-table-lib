import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';
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

export type GeneratedTablesFilterDictionary = {
  id: number,
  filterDictionary: Map<string, string>
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
  @ViewChildren(MatPaginator) newTablePaginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) newTableSort = new QueryList<MatSort>();
  @ViewChildren(MatSelect) matReference!: QueryList<MatSelect>;
  @ViewChildren(MatInput) matInput!: QueryList<MatInput>;
  displayedColumns: string[] = this.columnDef.map(c => c.header)
  data = new MatTableDataSource(this.dataSource);
  filterDictionary = new Map<string, string>();
  generatedTablesFilterDictionary:GeneratedTablesFilterDictionary[] = []
  columns: Columns[] = [];
  max: number = 0;
  columnsForm: FormGroup = new FormGroup({});
  pipe: DatePipe = new DatePipe('en-US');
  showColumns: boolean = false;
  datesColumns: { [x: string]: { start: any; end: any; }; }[] = [];
  allFilters: { column: string; filters: string[]; type: any; selectedRanges?: string[]}[] = [];
  startDate: string | null | undefined;
  endDate: string | null | undefined;
  datesForm: FormGroup = new FormGroup({});
  rangesForm: FormGroup = new FormGroup({});
  min: number = 0;
  tablesDataSource: any[] = [];
  isLoading: boolean = false;

  constructor(
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
    this.filterPredicate(this.data);
    this.ngAfterViewInit();
  }

  filterPredicate(data: MatTableDataSource<DataSource>) {
    data.filterPredicate = (record: DataSource, filter: any) => {
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
  
  applyFilter(ob: { value: any; }, column: Columns, id?:number): void {
    if (ob.value.length) {
      // column type == select
      if (column.type == Constants.SELECT) {
        if(id){
          this.handleSelectFilterCase(ob, column, id);
        }else{
          this.handleSelectFilterCase(ob, column);
        }
      }
      // column type ==  range 
      if (column.type == Constants.RANGE) {
        if(id){
          this.handleRangeFilterCase(column, ob, id);
        }else{
          this.handleRangeFilterCase(column, ob);
        }
      }
    }
    else {
      if (column.type == Constants.RANGE) {
        if (column.list) {
          if(id){
            this.filterRanges(column.list, column, column.options.map(option => option.val), id);
          }else{
            this.filterRanges(column.list, column, column.options.map(option => option.val));
          }
        }
      } else if (column.type == Constants.SELECT) {
        if(id){
          this.filterSelected(column.options.map(el => el.val), column, id);
        }else{
          this.filterSelected(column.options.map(el => el.val), column);
        }
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
  handleSelectFilterCase(ob: { value: string[]; }, column: Columns, id?:number) {
    if (ob.value.includes('All')) {
      if(id){
        this.filterSelected(column.options.map(el => el.val), column, id);
      }else{
        this.filterSelected(column.options.map(el => el.val), column);
      }
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
      if(id){
        this.filterSelected(filteredSelectList, column, id);
      }else{
        this.filterSelected(filteredSelectList, column);
      }
    }
  }

  //filtering for range case 
  handleRangeFilterCase(column: Columns, ob: { value: string[]; }, id?: number) {
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
              if(id){
                this.filterRanges(filteredRangeListForTwoSteps, column, ob.value, id);
              }else{
                this.filterRanges(filteredRangeListForTwoSteps, column, ob.value);
              }
            }
            if (lesser && !greater) {
              const filteredRangeListForTwoSteps = columnListForTwoSteps.filter((el: number) => el <= Math.round(this.max / 2));
              if(id){
                this.filterRanges(filteredRangeListForTwoSteps, column, ob.value, id);
              }else{
                this.filterRanges(filteredRangeListForTwoSteps, column, ob.value);
              }
            }
            if (lesser && greater || ob.value.includes('All')) {
              const filteredRangeListForTwoSteps = columnListForTwoSteps.filter((el: number) => el <= Math.round(this.max) && el >= Math.round(this.min));
              if(id){
                this.filterRanges(filteredRangeListForTwoSteps, column, ob.value, id);
              }else{
                this.filterRanges(filteredRangeListForTwoSteps, column, ob.value);
              }
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
          if(id){
            this.filterRanges(filteredRangeList, column, ob.value, id);
          }else{
            this.filterRanges(filteredRangeList, column, ob.value);
          }
        }
      } else {
        let columnListForTwoSteps = column.list;
        let lesser = ob.value.find((elm: string) => elm.includes('Less') && elm.includes('Equal')
        )
        let greater = ob.value.find((elm: string) => elm.includes('Greater'));
        if (greater && !lesser) {
          const filteredRangeListForTwoSteps = columnListForTwoSteps.filter((el: number) => el > Math.round(parseFloat(column.stepsInfo ? column.stepsInfo?.max : '') / 2));
          if(id){
            this.filterRanges(filteredRangeListForTwoSteps, column, ob.value, id);
          }else{
            this.filterRanges(filteredRangeListForTwoSteps, column, ob.value);
          }
        }
        if (lesser && !greater) {
          const filteredRangeListForTwoSteps = columnListForTwoSteps.filter((el: number) => el <= Math.round(parseFloat(column.stepsInfo ? column.stepsInfo?.max : '') / 2));
          if(id){
            this.filterRanges(filteredRangeListForTwoSteps, column, ob.value, id);
          }else{
            this.filterRanges(filteredRangeListForTwoSteps, column, ob.value);
          }
        }
        if (lesser && greater || ob.value.includes('All')) {
          const filteredRangeListForTwoSteps = columnListForTwoSteps.filter((el: number) => el <= parseFloat(column.stepsInfo ? column.stepsInfo?.max : '') && el >= parseFloat(column.stepsInfo ? column.stepsInfo?.min : ''));
          if(id){
            this.filterRanges(filteredRangeListForTwoSteps, column, ob.value, id);
          }else{
            this.filterRanges(filteredRangeListForTwoSteps, column, ob.value);
          }
          // this.filterRanges(column.list, column);
        }
      }
    }
  }

  //filter search list 
  filterSearchList(input: any, col: Columns, id?: number) {
    if (input.value == '') {
      this.columns.forEach(column => {
        if (column.header == col.header) {
          column.filteredList = column.options;
          if(id){
            if(this.generatedTablesFilterDictionary.length){
              this.setFilterDictionaryInGeneratedTablesForSearchList(id,column)
            }else{
              this.generatedTablesFilterDictionary.push({id: id,filterDictionary:new Map<string,string>()});
              this.setFilterDictionaryInGeneratedTablesForSearchList(id,column)
            }
            this.setDataFilter(column, true, id);
          }else{
            this.filterDictionary.set(column.field, column.options.toString());
            this.setDataFilter(column, true);            
          }
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

  setFilterDictionaryInGeneratedTablesForSearchList(id: number, column: Columns) {
    this.generatedTablesFilterDictionary.forEach(data => {
      if(data.id === id){
        data.filterDictionary.set(column.field, column.options.toString());
      }
    })
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
  applyFilterForSearch(input: any, column: Columns, id?: number): void {
    if(id){
      if(this.generatedTablesFilterDictionary.length){
        this.setFilterDictionaryInGeneratedTablesForSearch(id,column,input);
      }else{
        this.generatedTablesFilterDictionary.push({id: id,filterDictionary:new Map<string,string>()});
        this.setFilterDictionaryInGeneratedTablesForSearch(id,column,input);
      }
      this.setDataFilter(column, true, id);
    }else{
      this.filterDictionary.set(column.field, input);
      this.setDataFilter(column, true);
    }
  }

  setFilterDictionaryInGeneratedTablesForSearch(id: number, column: Columns, input: string) {
    this.generatedTablesFilterDictionary.forEach(data => {
      if(data.id === id){
        data.filterDictionary.set(column.field, input);
      }
    })
  }
  //apply filter for date type
  // applyFilterForDate(input: any, column: Columns): void {
  //   this.filterDictionary.set(column.field, input?.value);
  //   this.setDataFilter(column, true);
  // }

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
  filterRanges(list: any[], column: Columns, selectedRanges: string[], id?: number): void {
    let filtered: string[] = [];
    for (let x of list) {
      if (column.haveSpaceForSymbol) {
        filtered.push(`${x} ${column.symbol}`);
      } else {
        filtered.push(`${x}${column.symbol}`);
      }
    }
    if(id){
      if(this.generatedTablesFilterDictionary.length){
        this.setFilterDictionaryInGeneratedTablesForSelectedAndRangesAndDate(id,column,filtered);
      }else{
        this.generatedTablesFilterDictionary.push({id: id,filterDictionary:new Map<string,string>()});
        this.setFilterDictionaryInGeneratedTablesForSelectedAndRangesAndDate(id,column,filtered);
      }
      this.setDataFilter(column, true, selectedRanges, id);
    }else{
      this.filterDictionary.set(column.field, filtered.join(','));
      this.setDataFilter(column, true, selectedRanges);
    }
  }

  //filter for select type
  filterSelected(list: any[], column: Columns, id?:number): void {
    if(id){
      if(this.generatedTablesFilterDictionary.length){
        this.setFilterDictionaryInGeneratedTablesForSelectedAndRangesAndDate(id,column,list)
      }else{
        this.generatedTablesFilterDictionary.push({id: id,filterDictionary:new Map<string,string>()});
        this.setFilterDictionaryInGeneratedTablesForSelectedAndRangesAndDate(id,column,list)
      }
      this.setDataFilter(column, true, id);
    }else{
      this.filterDictionary.set(column.field, list.join(','));
      this.setDataFilter(column, true);
    }
  }

  setFilterDictionaryInGeneratedTablesForSelectedAndRangesAndDate(id: number, column: Columns, list: any[]) {
    this.generatedTablesFilterDictionary.forEach(data => {
      if(data.id === id){
        data.filterDictionary.set(column.field, list.join(','));
      }
    })
  }

  //to set filters of data
  setDataFilter(column: Columns, saveFilter: boolean, selectedRanges?: any, id?: number): void {
    if(id){
      this.tablesDataSource.forEach(data => {
        if(data.id === id){
          var jsonStr = JSON.stringify(Array.from(data.filterDictionary.entries()));
          data.tableDataSource.filter = jsonStr;
        }
      })
    }else{
      var jsonStr = JSON.stringify(Array.from(this.filterDictionary.entries()));
      this.data.filter = jsonStr;
      if (saveFilter) {
        Array.from(this.filterDictionary.entries()).map(entry => {
          if(column.field === entry[0]){
            this.allFilters.forEach(element => {
              if(element.column === entry[0]){
                element.filters = entry[1].split(" ,")
                element.type = column.type
                if(selectedRanges){
                  element.selectedRanges = selectedRanges
                }
              }
            })
            if(!this.allFilters.find(element => element.column === entry[0])){
              if(selectedRanges){
                this.allFilters.push({
                  column: entry[0],
                  filters: entry[1].split(','),
                  type: column.type,
                  selectedRanges: selectedRanges
                })
              }else{
              this.allFilters.push({
                column: entry[0],
                filters: entry[1].split(','),
                type: column.type
              })
              }
            }
        }
        })
    }
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

  onDateChange(event: { value: string | number | Date; }, action: string, column: Columns, id?: number) {
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
    let selectedDateRange: any;
    this.datesColumns.forEach(col => {
      if (col[column.header] && col[column.header]?.start && col[column.header]?.end) {
        const list = column.options.map(el => el.val).filter((el: string) => {
          if (el) {
            selectedDateRange = {start: col[column.header].start, end: col[column.header].end};
            return el >= col[column.header].start && el <= col[column.header].end;
          } else {
            return false;
          }
        })
        if(id){
          if(this.generatedTablesFilterDictionary.length){
            this.setFilterDictionaryInGeneratedTablesForSelectedAndRangesAndDate(id,column,list)
          }else{
            this.generatedTablesFilterDictionary.push({id: id,filterDictionary:new Map<string,string>()});
            this.setFilterDictionaryInGeneratedTablesForSelectedAndRangesAndDate(id,column,list)
          }
          this.setDataFilter(column, true, selectedDateRange, id);
        }else{
          this.filterDictionary.set(column.field, list.join(','));
          this.setDataFilter(column, true, selectedDateRange);
        }
      }
    })
  }

  clearDate(event: { stopPropagation: () => void; }, column: Columns, id?: number) {
    // event.stopPropagation();
    this.datesForm.get(`start${[column.header]}`)?.setValue(null);
    this.datesForm.get(`end${[column.header]}`)?.setValue(null);
    this.datesColumns.forEach((el: any) => {
      if (el[column.header]) {
        el[column.header].end = null;
        el[column.header].start = null;
      }
    })
    if(id){
      if(this.generatedTablesFilterDictionary.length){
        this.setFilterDictionaryInGeneratedTablesForClearDate(id,column)
      }else{
        this.generatedTablesFilterDictionary.push({id: id,filterDictionary:new Map<string,string>()});
        this.setFilterDictionaryInGeneratedTablesForClearDate(id,column)
      }
      this.setDataFilter(column, true, id);
    }else{
      this.filterDictionary.set(column.field, column.options.map(el => el.val).toString());
      this.setDataFilter(column, true);
    }
  }

  setFilterDictionaryInGeneratedTablesForClearDate(id: number, column: Columns) {
    this.generatedTablesFilterDictionary.forEach(data => {
      if(data.id === id){
        data.filterDictionary.set(column.field, column.options.map(el => el.val).toString());
      }
    })
  }

  //getFilters
  getFilters() {
    this.getAllFilters.emit(this.allFilters);
    console.log(this.allFilters)
  }

  clearSelectedOptions(matselect: MatSelect, column: Columns, id?: number) {
    matselect.options.forEach((item: MatOption) => {
      item.deselect();
    });
    if(id){
      if(this.generatedTablesFilterDictionary.length){
        this.setFilterDictionaryInGeneratedTablesForClearDate(id,column)
      }else{
        this.generatedTablesFilterDictionary.push({id: id,filterDictionary:new Map<string,string>()});
        this.setFilterDictionaryInGeneratedTablesForClearDate(id,column)
      }
      this.setDataFilter(column, true, id);
    }else{
      this.filterDictionary.set(column.field, column.options.map(el => el.val).toString());
      this.setDataFilter(column, true);
    }
  }

  stop(event: any) {
    event.stopPropagation();
  }

  submitRangeForm(col: Columns, rangeForm: any, matRef: MatSelect,id?: number) {
    if(this.validRangeSubmitBtn(col,rangeForm)){
      if (col.list) {
        this._agTableService.getCustomDropdownListForRange(col, rangeForm.value);
        if(id){
          this.filterRanges(col.list, col, col.options.map(option => option.val), id);
        }else{
          this.filterRanges(col.list, col, col.options.map(option => option.val));
        }
      }
  
      matRef.options.forEach(option => {
        option.deselect();
      })
    }else{
      console.log("toastr")
    }
  }

  validRangeSubmitBtn(col: Columns, formValue: any) {
    if(formValue.get(`min${col.header}`).value && formValue.get(`max${col.header}`).value && formValue.get(`steps${col.header}`).value){
      return true;
    }
    return false;
  }

  checkRangeFormField(column: Columns,rangesForm: any){
    return !rangesForm.get(`min${column.header}`).value || !rangesForm.get(`max${column.header}`).value || !rangesForm.get(`steps${column.header}`).value
  }

  saveFilters() {
    this.isLoading = true;
    let tableDataSource = new MatTableDataSource(this.dataSource);
    this.filterPredicate(tableDataSource);
    let index = this.tablesDataSource.length;
    setTimeout(() => {
      tableDataSource.paginator = this.newTablePaginator.toArray()[index+1];
      tableDataSource.sort = this.newTableSort.toArray()[index+1];  
        }); 
    var jsonStr = JSON.stringify(Array.from(this.filterDictionary.entries()));
    tableDataSource.filter = jsonStr;
    this.tablesDataSource.push({tableDataSource:tableDataSource,id:index + 1});
    this.isLoading = false;
    console.log(this.tablesDataSource,this.filterDictionary,this.data,this.generatedTablesFilterDictionary)
  }

}