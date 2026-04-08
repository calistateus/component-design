import { StyleProp, ViewStyle } from 'react-native';
import React from 'react';

export type Row = { id: string; name: string; role: string; department: string; salary: number; startDate: string; status: 'active'|'inactive'|'pending'; rating: number; approved: boolean; };
export type ColumnDef<T> = { key: keyof T; label: string; width?: number; sortable?: boolean; editable?: boolean; editType?: 'text'|'dropdown'|'date'; editOptions?: string[]; radioGroup?: string; renderCell?: (value: T[keyof T], row: T) => React.ReactNode; };
export type GroupByConfig<T> = { getGroupKey: (row: T) => string; getGroupLabel?: (key: string) => string; defaultCollapsed?: boolean; };
export type DataTableProps<T extends { id: string }> = { columns: ColumnDef<T>[]; data: T[]; zebraStriping?: boolean; groupBy?: GroupByConfig<T>; rowSelection?: 'radio'|'none'; onRowSelect?: (row: T|null) => void; onCellRadioChange?: (rowId: string, columnKey: keyof T, value: boolean) => void; onCellEdit?: (rowId: string, columnKey: keyof T, oldValue: unknown, newValue: unknown) => void; onRowPress?: (row: T) => void; tableStyle?: StyleProp<ViewStyle>; headerStyle?: StyleProp<ViewStyle>; rowStyle?: StyleProp<ViewStyle>; };
export type SortDirection = 'none'|'asc'|'desc';
export type SortState = { key: string; direction: SortDirection; };
export type EditState = { rowId: string; columnKey: string; value: string; }|null;
export type BreakpointName = 'mobile'|'tablet'|'desktop';
export type BreakpointConfig = { breakpoint: BreakpointName; paddingH: number; paddingV: number; fontSize: number; };
export type CellRadioPopoverState = { rowId: string; columnKey: string; radioGroup: string; x: number; y: number; }|null;
export type ConfirmationRowState<T extends { id: string }> = { row: T; }|null;