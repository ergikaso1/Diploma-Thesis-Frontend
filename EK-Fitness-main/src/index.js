import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useLocation, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

let theme = createTheme({
  palette: {
    primary: {
      main: "#00040f",
    },
    secondary: {
      main: "#F15C26",
    },
    white: {
      main: "#fff",
    },
  },
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <ScrollToTop />
      <App />
    </BrowserRouter>
  </ThemeProvider>,
  document.getElementById("root")
);