import { ColumnType } from "./column.type";

export type Columns = {
    field: string;
    header: string;
    type: ColumnType;
    steps?: string;
    symbol?: string;
    options: any[];
    defaultValue: string;
    list?: any[]
    listWithChecks: { val: any , selected: boolean}[]
}

