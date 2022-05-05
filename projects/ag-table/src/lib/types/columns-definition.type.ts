import { ColumnType } from "./column.type";

export type ColumnDefinition = {
    field: string;
    header: string;
    selected?: boolean;
    type: ColumnType;
    steps?: string;
    symbol?: string;
}

