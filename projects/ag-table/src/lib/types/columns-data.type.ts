import { ColumnType } from "./column.type";

export type Columns = {
    field: string;
    header: string;
    type: ColumnType;
    stepsInfo?: {max:string,min:string,steps:string};
    symbol?: string;
    options: any[];
    defaultValue: string;
    list?: any[];
    filteredList: { val: any , selected: boolean}[];
    filteredOptions?: any[];
}

