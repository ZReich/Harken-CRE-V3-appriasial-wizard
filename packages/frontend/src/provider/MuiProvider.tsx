import { StyledEngineProvider} from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import { primaryTheme } from "../utils";

type Props = {
    children: React.ReactNode;
  };

export function MuiProvider({ children }: Props) {
  return (
    <>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={primaryTheme}>{children}</ThemeProvider>
      </StyledEngineProvider>
    </>
  );
}
