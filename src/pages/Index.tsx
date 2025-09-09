import { ChatbotBuilder } from "@/components/ChatbotBuilder";
import AuthGuard from "@/components/AuthGuard";

const Index = () => {
  return (
    <AuthGuard>
      <ChatbotBuilder />
    </AuthGuard>
  );
};

export default Index;
