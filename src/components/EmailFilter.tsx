import type { ChangeEvent } from 'react';
import { TextField, Box } from '@mui/material';

interface EmailFilterProps {
  filterEmail: string;
  onFilterChange: (email: string) => void;
}

export default function EmailFilter({ filterEmail, onFilterChange }: EmailFilterProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFilterChange(event.target.value);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <TextField
        fullWidth
        label="Filtrar por Email"
        variant="outlined"
        value={filterEmail}
        onChange={handleChange}
        placeholder="Digite o email do aluno"
      />
    </Box>
  );
}