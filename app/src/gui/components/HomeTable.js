import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'age', headerName: 'Age (years old)', width: 150 },
  { field: 'employee', headerName: 'Employee', width: 220 },
];

const rows = [
  {
    id: 1, employee: 'Jon', age: 35,
  },
  {
    id: 2, employee: 'Cersei', age: 42,
  },
  {
    id: 3, employee: 'Jaime', age: 45,
  },
  {
    id: 4, employee: 'Arya', age: 16,
  },
  {
    id: 5, employee: 'Daenerys', age: 11,
  },
  {
    id: 6, employee: 'haha', age: 150,
  },
  {
    id: 7, employee: 'Ferrara', age: 44,
  },
  {
    id: 8, employee: 'Rossini', age: 36,
  },
  {
    id: 9, employee: 'Harvey', age: 65,
  },
  {
    id: 10, employee: 'Haobo', age: 11,
  },
];

export default function HomeTable() {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[3]}
        checkboxSelection
      />
    </div>
  );
}
