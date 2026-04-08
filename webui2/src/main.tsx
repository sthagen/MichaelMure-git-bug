import { ApolloProvider } from "@apollo/client/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// eslint-disable-next-line import/no-unassigned-import
import "./index.css";
import { client } from "@/lib/apollo";
import { ThemeProvider } from "@/lib/theme";

import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </ThemeProvider>
  </StrictMode>,
);
