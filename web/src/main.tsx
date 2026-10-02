import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider as JotaiProvider } from "jotai";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import "./index.css";
import App from "./App";
import ErrorBoundary from "@/components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
            <JotaiProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </JotaiProvider>
        </QueryClientProvider>
    </ErrorBoundary>
);
