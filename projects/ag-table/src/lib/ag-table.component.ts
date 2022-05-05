import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { DecimalPipe } from '@angular/common';
import { MatSelectChange } from '@angular/material/select';
import { DataInterface } from '../../../test-table/src/app/app.component';
import { FormControl, FormGroup } from '@angular/forms';
import { __values } from 'tslib';

@Component({
  selector: 'lib-ag-table',
  templateUrl: './ag-table.component.html',
  styleUrls: ['./ag-table.component.css']
})

export class AgTableComponent implements OnInit, AfterViewInit {
  @Output() onGridReady: EventEmitter<any> = new EventEmitter();
  @Input() dataSource: any[] = [];
  @Input() columnDef: any[] = [];
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;
  displayedColumns: string[] = this.columnDef.map(c => c.header)
  data: any;
  filterDictionary = new Map<string, any>();
  filters: any[] = [];
  defaultValue = 'All';
  list: any[] = [];
  form: FormGroup = new FormGroup({
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
  showColumns: boolean = false;
  ranges: any[] = [];
  max: number = 0;
  activeType: string | undefined;
  defaultSteps: number = 2;
  rangelist: string[] = [];

  // 'Good To Trade' = this.form.get("Good To Trade");
  // 'Counterparty' = this.form.get("Counterparty");
  // 'Repo Type' = this.form.get("Repo Type");
  // 'Side' = this.form.get("Side");
  // 'Available Cash Settlement Amount' = this.form.get("Available Cash Settlement Amount");
  // 'Cash Settlement Currency' = this.form.get("Cash Settlement Currency");
  // 'Rate/Spread Over Benchmark' = this.form.get("Rate/Spread Over Benchmark");
  // 'Floating' = this.form.get("Floating");
  // 'Purchasing Date' = this.form.get("Purchasing Date");
  // 'Repurchase Date' = this.form.get("Repurchase Date");
  // 'Repo Term Type' = this.form.get("Repo Term Type");
  // 'Market Sector' = this.form.get("Market Sector");
  // 'Issuer Domicile' = this.form.get("Issuer Domicile");
  // 'Quality' = this.form.get("Quality");
  // 'Collaterals' = this.form.get("Collaterals");


  constructor(private _decimalPipe: DecimalPipe) {
  }

  ngOnInit(): void {
    this.displayedColumns = this.columnDef.map(c => c.header);
    this.displayedColumns.forEach(col => {
      this.form.addControl(col, new FormControl(true));
    })
    for (let col of this.columnDef) {
      // console.log(col,"col")
      this.list = [];
      this.rangelist = [];
      this.ranges = [];
      //generates dropdown list for select 
      this.dataSource.map(el => {
        if (this.list.length > 0) {
          if (!this.list.includes(el[col.field])) {
            if (col.type == 'select' || col.type == 'search') {
              this.list.push(el[col.field]);
            }
            if (col.type == 'range') {
              if (typeof (el[col.field]) == 'string') {
                console.log("jhjh")
                const str = el[col.field].substring(0, el[col.field].length - 1);
                const num = parseFloat(str)
                console.log(num)
                if (!this.list.includes(num)) {
                  this.list.push(num);
                }
                this.ranges.push(num);
              }
            }
          }
        } else {
          if (col.type == 'select' || col.type == 'search') {
            this.list.push(el[col.field]);
          }
          if (col.type == 'range') {
            if (typeof (el[col.field]) == 'string') {
              const str = el[col.field].substring(0, el[col.field].length - 1);
              const num = parseFloat(str)
              this.list.push(num);
              this.ranges.push(num);
            }
          }
        }
      })

      //generates dropdown list for range type
      if (col.type == 'range') {
        this.max = Math.max(...this.list);
        console.log(col, this.max)
        if (col.steps && col.steps !== '2') {
          let steps = col.steps;
          let startvalue = 0;
          for (let i = steps; i > 0; i--) {
            let range = i == 1 ? startvalue + ' to ' + (this.max / i) : startvalue + ' to ' + Math.round(this.max / i);
            startvalue = Math.round(this.max / i);
            this.rangelist.push(range)
          }
          console.log(this.rangelist)
        }
        else {
          if (this.max > 1) {
            this.rangelist = ['Less than or Equal to ' + Math.round(this.max / 2) + '%', 'Greater than ' + Math.round(this.max / 2) + '%']
          } else {
            this.rangelist = ['Less than or Equal to 1%']
          }
        }
      }
      if (col.type == 'range') {
        this.rangelist.push('All');
        this.filters.push({
          field: col.field,
          header: col.header,
          type: col.type,
          options: this.rangelist, //values of this field
          symbol: col.symbol,
          steps: col.steps || this.defaultSteps,
          list: this.ranges, //dropdown options
          defaultValue: this.defaultValue
        })
      } else {
        this.list.push('All');
        this.filters.push({
          field: col.field,
          header: col.header,
          type: col.type,
          options: this.list, //dropdown options == values of this field
          defaultValue: this.defaultValue
        })
      }
    }

    // console.log(this.dataSource,this.filters)
    this.data = new MatTableDataSource(this.dataSource);
    this.data.filterPredicate = function (record: DataInterface, filter: any) {
      console.log(filter, this.activeType)
      var map = new Map(JSON.parse(filter));
      let isMatch = false;
      for (let [key, value] of map) {
        let val = typeof (value) == 'string' ? value.split(',') : [];
        console.log(val)
        let isMatchForRange = [];
        for (let x of val) {
          isMatchForRange.push(x == 'All' || record[key as keyof DataInterface] == x);
        }
        isMatch = isMatchForRange.includes(true);
        if (!isMatchForRange.includes(true)) return false;
      }
      return isMatch;
    };
  }

  ngAfterViewInit() {
    this.data.paginator = this.paginator;
    this.data.sort = this.sort;
    this.onGridReady.emit(this);
  }

  // applyFilter(target:any) {
  //   console.log(target.value)
  //   this.data.filter = target.value?.trim()?.toLowerCase();
  // }

  applyFilter(ob: any, filter: any) {
    console.log(ob.value, filter)
    if (ob.value.length > 0) {
      // filter type == select
      if (filter.type == 'select' || filter.type == 'search') {
        this.filterDictionary.set(filter.field, ob.value);
        var jsonString = JSON.stringify(Array.from(this.filterDictionary.entries()));
        this.data.filter = jsonString;
      }
      // filter type ==  range 
      if (filter.type == 'range') {
        console.log(filter.steps, "steps")
        if (filter.steps == '2') {
          let lesser = ob.value.find((elm: string) => elm.includes('Less') && elm.includes('Equal')
          )
          let greater = ob.value.find((elm: string) => elm.includes('Greater'))
          if (greater && !lesser) {
            const value = filter.list.filter((el: number) => el > Math.round(this.max / 2))
            this.filterRates(value, filter);
          }
          if (lesser && !greater) {
            const value = filter.list.filter((el: number) => el <= Math.round(this.max / 2))
            this.filterRates(value, filter);
          }
          if (lesser && greater || ob.value.includes('All')) {
            this.filterRates(filter.list, filter);
          }
        } else {
          console.log(ob.value, "ob.value")
          var numberArray: number[] = [];
          let filteredRange: any[] = []
          ob.value.map((elm: string) => {
            if (ob.value.includes('All')) {
              filteredRange = filter.list;
            } else {
              const stringArray = elm.split(' to ');
              for (var i = 0; i < stringArray.length; i++) {
                numberArray.push(parseFloat(stringArray[i]));
              }
              const minimum = Math.min(...numberArray);
              const maximum = Math.max(...numberArray)
              console.log(minimum, maximum, filter.list)

              filteredRange = filter.list.filter((el: number) => el >= minimum && el <= maximum);
            }
          })
          this.filterRates(filteredRange, filter);
          console.log(filteredRange)
        }
      }
    }
    else {
      // this.data.filter = '';
      this.filterRates(this.ranges, filter);
    }
    console.log(this.data.filter)
    console.log(this.data, "tabledata");
  }

  updateColumns(cd: any) {
    console.log(cd)
    this.columnDef.map(elm => {
      if (elm.header == cd) {
        elm.selected = !elm.selected;
      }
    });
    this.displayedColumns = this.columnDef.filter(col => col.selected).map(c => c.header)
    console.log("displayedColumns", this.displayedColumns, this.data);
  }

  filterRates(value: any[], filter: any) {
    console.log(filter);
    let filtered: any[] = [];
    // if (value.length > 0) {
    for (let x of value) {
      if(filter.symbol == '%'){
        filtered.push(x + filter.symbol);
      }else{
        filtered.push(x + ' ' +filter.symbol);
      }
    }
    this.filterDictionary.set(filter.field, filtered.join(','));
    var jsonStr = JSON.stringify(Array.from(this.filterDictionary.entries()));
    this.data.filter = jsonStr;
    // }
  }
}
