import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ChatbotList from "./pages/ChatbotList";
import ChatbotBuilder from "./pages/ChatbotBuilder";
import ClientList from "./pages/ClientList";
import ClientChatbots from "./pages/ClientChatbots";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ClientList />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/:clientId/chatbots" element={<ClientChatbots />} />
          <Route path="/clients/:clientId/builder" element={<ChatbotBuilder />} />
          <Route path="/clients/:clientId/builder/:id" element={<ChatbotBuilder />} />
          <Route path="/legacy" element={<ChatbotList />} />
          <Route path="/builder" element={<ChatbotBuilder />} />
          <Route path="/builder/:id" element={<ChatbotBuilder />} />
          <Route path="/auth" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
