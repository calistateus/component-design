export type Row = {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  startDate: string;
  status: 'active' | 'inactive' | 'pending';
  rating: number;
};

export type ColumnDef<T> = {
  key: keyof T;
  label: string;
  width?: number;
  sortable?: boolean;
  editable?: boolean;
  editType?: 'text' | 'dropdown' | 'date';
  editOptions?: string[];
};

export type GroupByConfig<T> = {
  getGroupKey: (row: T) => string;
  getGroupLabel?: (key: string) => string;
  defaultCollapsed?: boolean;
};

export type DataTableProps<T extends { id: string }> = {
  columns: ColumnDef<T>[];
  data: T[];
  zebraStriping?: boolean;
  groupBy?: GroupByConfig<T>;
  rowSelection?: 'radio' | 'none';
  onRowSelect?: (row: T | null) => void;
  onCellEdit?: (rowId: string, columnKey: keyof T, oldValue: unknown, newValue: unknown) => void;
};