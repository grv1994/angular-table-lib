import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output,ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { DecimalPipe } from '@angular/common';

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
  displayedColumns: any[] = [];
  data: any;

  constructor(private _decimalPipe: DecimalPipe) {
  }

  ngOnInit(): void {
    console.log(this.dataSource)
    this.displayedColumns = this.columnDef.map(colummn => colummn.header);
    this.data = new MatTableDataSource(this.dataSource);
  }

  ngAfterViewInit() {
    this.data.paginator = this.paginator;
    this.data.sort = this.sort;
    this.onGridReady.emit(this);
  }

  

  applyFilter(target:any) {
    console.log(target.value)
    this.data.filter = target.value?.trim()?.toLowerCase();
  }
}