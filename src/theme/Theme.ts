// src/theme/Theme.ts
import { createTheme } from '@mui/material/styles';

// Define as cores
const primaryColor = '#5231ef'; // Roxo/Azul Vibrante
const secondaryColor = '#edf7fd'; // Azul muito claro

const theme = createTheme({
  palette: {
    mode: 'light', // Modo claro para o tema
    primary: {
      main: primaryColor,
    },
    secondary: {
      main: secondaryColor,
    },
    background: {
      default: '#FFFFFF', // Fundo principal da página será BRANCO
      paper: secondaryColor, // Fundo de componentes como Paper (tabelas, listas) será #edf7fd
    },
    text: {
      primary: '#1a1a1a', // Cor de texto padrão para melhor contraste
      secondary: primaryColor, // Exemplo de cor secundária para textos
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif', // Exemplo de fonte
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Mantém o texto dos botões sem ser em caixa alta
          borderRadius: 8, // Adiciona um leve arredondamento
        },
      },
    },
    // Estilo para o Paper (usado por DataTable e CompletedCourses)
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: secondaryColor, // Fundo dos cards/tabelas será #edf7fd
          padding: '16px', // Adicionar um padding padrão para as caixas
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)', // Uma leve sombra para destaque
        },
      },
    },
    MuiTableCell: { // Estilo para células da tabela
      styleOverrides: {
        head: {
          backgroundColor: primaryColor, // Fundo do cabeçalho da tabela
          color: '#FFFFFF', // Cor do texto do cabeçalho
          fontWeight: 'bold',
        },
        body: {
          color: '#333333', // Cor do texto do corpo da tabela
        },
      },
    },
  },
});

export default theme;