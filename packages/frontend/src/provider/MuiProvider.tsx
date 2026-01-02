import { StyledEngineProvider } from "@mui/material";
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../utils";

type Props = {
  children: React.ReactNode;
};

// Inner component that uses the theme context to select MUI theme
function MuiThemeWrapper({ children }: Props) {
  const { resolvedTheme } = useTheme();
  const muiTheme = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export function MuiProvider({ children }: Props) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider defaultTheme="system">
        <MuiThemeWrapper>{children}</MuiThemeWrapper>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
