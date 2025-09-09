import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatbotBuilder as ChatbotBuilderComponent } from "@/components/ChatbotBuilder";
import { useChatbotConfig } from "@/hooks/useChatbotConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AuthGuard from "@/components/AuthGuard";
import UserProfileDropdown from "@/components/UserProfileDropdown";

const ChatbotBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { config, updateConfig, setFullConfig, resetConfig } = useChatbotConfig();
  const [chatbotName, setChatbotName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id && user) {
      loadChatbot();
    } else if (!id) {
      // Reset for new chatbot
      resetConfig();
      setChatbotName("");
    }
  }, [id, user]);

  const loadChatbot = async () => {
    if (!id || !user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("chatbot_configs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      console.log("Loaded chatbot data:", data);
      setChatbotName(data.name);
      
      // Use the loaded config directly, don't merge with current state
      const loadedConfig = data.config as any;
      console.log("Setting loaded config:", loadedConfig);
      setFullConfig(loadedConfig);
    } catch (error) {
      console.error("Error loading chatbot:", error);
      toast({
        title: "Error",
        description: "Failed to load chatbot configuration",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !chatbotName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a chatbot name",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const chatbotData = {
        name: chatbotName.trim(),
        config: config as any,
        user_id: user.id,
      };
      
      console.log("Saving config:", config);

      if (id) {
        // Update existing chatbot
        const { error } = await supabase
          .from("chatbot_configs")
          .update(chatbotData)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Chatbot updated successfully",
        });
      } else {
        // Create new chatbot
        const { error } = await supabase
          .from("chatbot_configs")
          .insert(chatbotData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Chatbot created successfully",
        });

        navigate("/");
      }
    } catch (error) {
      console.error("Error saving chatbot:", error);
      toast({
        title: "Error",
        description: "Failed to save chatbot",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading chatbot...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to My Chatbots
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-2xl font-bold">
                {id ? "Edit Chatbot" : "Create New Chatbot"}
              </h1>
            </div>
            <UserProfileDropdown />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Chatbot Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="chatbot-name">Chatbot Name</Label>
                <Input
                  id="chatbot-name"
                  value={chatbotName}
                  onChange={(e) => setChatbotName(e.target.value)}
                  placeholder="Enter a name for your chatbot"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving || !chatbotName.trim()} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : id ? "Update Chatbot" : "Create Chatbot"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <ChatbotBuilderComponent config={config} updateConfig={updateConfig} setFullConfig={setFullConfig} />
        </div>
      </div>
    </AuthGuard>
  );
};

export default ChatbotBuilder;