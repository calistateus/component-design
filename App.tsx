import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { DataTable } from './components/DataTable';
import { generateMockData } from './components/DataTable/mockData';
import { ColumnDef, Row } from './components/DataTable/DataTable.types';

const columns: ColumnDef<Row>[] = [
  { key: 'name', label: 'Name', width: 150, sortable: true },
  { key: 'role', label: 'Role', width: 160, sortable: true },
  { key: 'department', label: 'Department', width: 140, sortable: true },
  { key: 'salary', label: 'Salary', width: 120, sortable: true, editable: true, editType: 'text' },
  { key: 'startDate', label: 'Start Date', width: 140, sortable: true, editable: true, editType: 'date' },
  { key: 'status', label: 'Status', width: 120, sortable: true, editable: true, editType: 'dropdown', editOptions: ['active', 'inactive', 'pending'] },
  { key: 'rating', label: 'Rating', width: 100, sortable: true },
];

const data = generateMockData(30);

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <DataTable<Row>
        columns={columns}
        data={data}
        zebraStriping
        groupBy={{ getGroupKey: (row) => row.department, getGroupLabel: (key) => key }}
        rowSelection="radio"
        onRowSelect={(row) => console.log('Selected:', row?.name)}
        onCellEdit={(rowId, key, oldVal, newVal) => console.log(`Edit [${String(key)}]: "${oldVal}" -> "${newVal}"`)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });