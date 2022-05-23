import { ColumnType } from "./column.type";

export type ColumnDefinition = {
    field: string;
    header: string;
    selected?: boolean;
    type: ColumnType;
    stepsInfo?: {max:string,min:string,steps:string};
    symbol?: string;
}

