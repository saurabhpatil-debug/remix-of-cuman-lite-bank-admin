import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import { Toaster } from "@/components/ui/sonner";
import "./styles.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
      <Toaster position="bottom-right" richColors />
    </BrowserRouter>
  </QueryClientProvider>,
);