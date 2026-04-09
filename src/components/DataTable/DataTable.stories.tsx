import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import { generateMockData } from './mockData';
import { ColumnDef, Row } from './DataTable.types';
const base: ColumnDef<Row>[] = [
  { key:'name', label:'Name', width:160, sortable:true },
  { key:'role', label:'Role', width:180, sortable:true },
  { key:'department', label:'Department', width:150, sortable:true },
  { key:'salary', label:'Salary', width:120, sortable:true },
  { key:'startDate', label:'Start Date', width:130, sortable:true },
  { key:'status', label:'Status', width:110, sortable:true },
  { key:'rating', label:'Rating', width:90, sortable:true },
];
const editable: ColumnDef<Row>[] = [
  { key:'name', label:'Name', width:160, sortable:true },
  { key:'role', label:'Role', width:180, sortable:true },
  { key:'department', label:'Department', width:150, sortable:true },
  { key:'salary', label:'Salary', width:120, sortable:true, editable:true, editType:'text' },
  { key:'startDate', label:'Start Date', width:130, sortable:true, editable:true, editType:'date' },
  { key:'status', label:'Status', width:110, sortable:true, editable:true, editType:'dropdown', editOptions:['active','inactive','pending'] },
  { key:'rating', label:'Rating', width:90, sortable:true },
];
const meta: Meta<typeof DataTable<Row>> = {
  title: 'Design System/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof DataTable<Row>>;
export const Default: Story = { args: { columns:base, data:generateMockData(20), zebraStriping:false } };
export const ZebraStriping: Story = { args: { columns:base, data:generateMockData(20), zebraStriping:true } };
export const GroupedByDepartment: Story = { args: { columns:base, data:generateMockData(30), zebraStriping:true, groupBy:{ getGroupKey:(row)=>row.department, getGroupLabel:(key)=>key } } };
export const RowSelection: Story = { args: { columns:base, data:generateMockData(15), rowSelection:'radio', onRowSelect:(row)=>console.log('Selected:',row?.name) } };
export const EditableCells: Story = { args: { columns:editable, data:generateMockData(15), zebraStriping:true, onCellEdit:(id,key,o,n)=>console.log(String(key),o,n) } };
export const FullFeatured: Story = { args: { columns:editable, data:generateMockData(30), zebraStriping:true, groupBy:{ getGroupKey:(row)=>row.department, getGroupLabel:(key)=>key }, rowSelection:'radio', onRowSelect:(row)=>console.log('Selected:',row?.name), onCellEdit:(id,key,o,n)=>console.log(String(key),o,n) } };