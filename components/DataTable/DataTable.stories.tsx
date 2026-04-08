import React from 'react';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react-native';
import { DataTable } from './DataTable';
import { generateMockData } from './mockData';
import { ColumnDef, Row, GroupByConfig } from './DataTable.types';

const baseColumns: ColumnDef<Row>[] = [
  { key:'name', label:'Name', width:150, sortable:true },
  { key:'role', label:'Role', width:160, sortable:true },
  { key:'department', label:'Department', width:140, sortable:true },
  { key:'salary', label:'Salary', width:110, sortable:true },
  { key:'startDate', label:'Start Date', width:130, sortable:true },
  { key:'status', label:'Status', width:100, sortable:true },
  { key:'rating', label:'Rating', width:90, sortable:true },
];

const groupByDepartment: GroupByConfig<Row> = {
  getGroupKey: (row) => row.department,
  getGroupLabel: (key) => key,
  defaultCollapsed: false,
};

const meta: Meta<typeof DataTable<Row>> = {
  title: 'Design System/DataTable',
  component: DataTable,
  argTypes: {
    zebraStriping: { control:'boolean' },
    rowCount: { control:{ type:'range', min:5, max:100, step:5 } },
  },
};
export default meta;
type Story = StoryObj<typeof DataTable<Row>> & { args: { rowCount?: number } };

export const Default: Story = {
  args: { zebraStriping:false, rowCount:20 },
  render: ({ zebraStriping, ...args }) => {
    const rowCount = (args as { rowCount?: number }).rowCount ?? 20;
    return <DataTable<Row> columns={baseColumns} data={generateMockData(rowCount)} zebraStriping={zebraStriping} />;
  },
};

export const ZebraAndSort: Story = {
  args: { zebraStriping:true, rowCount:20 },
  render: ({ zebraStriping, ...args }) => {
    const rowCount = (args as { rowCount?: number }).rowCount ?? 20;
    const data = generateMockData(rowCount).sort((a,b) => b.salary-a.salary);
    return <DataTable<Row> columns={baseColumns} data={data} zebraStriping={zebraStriping} />;
  },
};

export const GroupedByDepartment: Story = {
  args: { zebraStriping:true, rowCount:30 },
  render: ({ zebraStriping, ...args }) => {
    const rowCount = (args as { rowCount?: number }).rowCount ?? 30;
    return <DataTable<Row> columns={baseColumns} data={generateMockData(rowCount)} zebraStriping={zebraStriping} groupBy={groupByDepartment} />;
  },
};

export const RowRadioSelection: Story = {
  args: { zebraStriping:false, rowCount:20 },
  render: ({ zebraStriping, ...args }) => {
    const rowCount = (args as { rowCount?: number }).rowCount ?? 20;
    return <DataTable<Row> columns={baseColumns} data={generateMockData(rowCount)} zebraStriping={zebraStriping} rowSelection="radio" onRowSelect={action('onRowSelect')} />;
  },
};

const fullColumns: ColumnDef<Row>[] = [
  { key:'name', label:'Name', width:150, sortable:true },
  { key:'role', label:'Role', width:160, sortable:true },
  { key:'department', label:'Department', width:140, sortable:true },
  { key:'salary', label:'Salary', width:120, sortable:true, editable:true, editType:'text' },
  { key:'startDate', label:'Start Date', width:140, sortable:true, editable:true, editType:'date' },
  { key:'status', label:'Status', width:120, sortable:true, editable:true, editType:'dropdown', editOptions:['active','inactive','pending'] },
  { key:'rating', label:'Rating', width:100, sortable:true, radioGroup:'ratingGroup' },
  { key:'approved', label:'Approved', width:110, radioGroup:'approvalGroup' },
];

export const FullFeatured: Story = {
  args: { zebraStriping:true, rowCount:30 },
  render: ({ zebraStriping, ...args }) => {
    const rowCount = (args as { rowCount?: number }).rowCount ?? 30;
    return (
      <DataTable<Row>
        columns={fullColumns}
        data={generateMockData(rowCount)}
        zebraStriping={zebraStriping}
        groupBy={groupByDepartment}
        rowSelection="radio"
        onRowSelect={action('onRowSelect')}
        onCellRadioChange={action('onCellRadioChange')}
        onCellEdit={action('onCellEdit')}
        onRowPress={action('onRowPress')}
      />
    );
  },
};