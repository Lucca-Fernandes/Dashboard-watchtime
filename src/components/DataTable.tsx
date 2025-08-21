import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from '@mui/material';
import type { WatchTimeData } from '../types';

interface DataTableProps {
  data: WatchTimeData[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ mb: 4 }}>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Nome da Aula</TableCell>
              <TableCell>Nome do Curso</TableCell>
              <TableCell>Nome do Vídeo</TableCell>
              <TableCell>Tempo Consumido</TableCell> 
              <TableCell>Duração até Conclusão</TableCell> 
              <TableCell>Duração Total do Vídeo</TableCell> 
              <TableCell>Data de Conclusão</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={`${row.user_email}-${row.video_name}-${index}`}>
                <TableCell>{row.user_email}</TableCell>
                <TableCell>{row.user_full_name}</TableCell>
                <TableCell>{row.lesson_name}</TableCell>
                <TableCell>{row.course_name}</TableCell>
                <TableCell>{row.video_name}</TableCell>
                <TableCell>{row.total_duration}</TableCell>
                <TableCell>{row.until_completed_duration}</TableCell>
                <TableCell>{row.video_total_duration}</TableCell> 
                <TableCell>{row.completed_date}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Linhas por página"
      />
    </Paper>
  );
};

export default DataTable;