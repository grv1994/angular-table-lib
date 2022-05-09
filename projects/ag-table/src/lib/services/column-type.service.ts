import { Injectable } from '@angular/core';
import { Constants } from '../constants/grid.constant';
import { ColumnDefinition } from '../types/columns-definition.type';

@Injectable({
    providedIn: 'root'
})
export class ColumnTypeService {

    constructor() { }

    isSelect(column: ColumnDefinition) {
        return column.type == Constants.SELECT;
    }

    isSearch(column: ColumnDefinition) {
        return column.type == Constants.SEARCH;
    }

    isRange(column: ColumnDefinition) {
        return column.type == Constants.RANGE;
    }

    isDate(column: ColumnDefinition){
        return column.type == Constants.DATE;
    }
}

