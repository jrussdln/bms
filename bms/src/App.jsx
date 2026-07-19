import { BrowserRouter } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useTheme } from "./hooks/useTheme";
import { getMuiTheme } from "./lib/muiTheme";
import AppRoute from "./routes/AppRoute";

function MuiThemeBridge({ children }) {
  const { theme } = useTheme();
  const muiTheme = getMuiTheme(theme);
  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <MuiThemeBridge>
        <BrowserRouter>
          <AuthProvider>
            <AppRoute />
          </AuthProvider>
        </BrowserRouter>
      </MuiThemeBridge>
    </ThemeProvider>
  );
}

export default App;