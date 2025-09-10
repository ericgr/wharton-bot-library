import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Code2, Settings, Copy, Check, MessageSquare } from "lucide-react";
import UserProfile from "./UserProfile";
import { BubbleTab } from "./tabs/BubbleTab";
import { TooltipTab } from "./tabs/TooltipTab";
import { WindowTab } from "./tabs/WindowTab";
import { FooterTab } from "./tabs/FooterTab";
import { AdvancedTab } from "./tabs/AdvancedTab";
import { ChatbotPreview } from "./ChatbotPreview";
import { InPageChatPreview } from "./InPageChatPreview";
import { useChatbotConfig, ChatbotConfig } from "@/hooks/useChatbotConfig";

interface ChatbotBuilderProps {
  config?: ChatbotConfig;
  updateConfig?: (updates: Partial<ChatbotConfig>) => void;
  setFullConfig?: (config: ChatbotConfig) => void;
  chatbotId?: string | null;
}

export const ChatbotBuilder = ({ config: propConfig, updateConfig: propUpdateConfig, chatbotId }: ChatbotBuilderProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"popup" | "inpage">("popup");
  const hookResult = useChatbotConfig();
  
  // Use props if provided, otherwise use hook
  const config = propConfig || hookResult.config;
  const updateConfig = propUpdateConfig || hookResult.updateConfig;

  const handleCopyCode = async () => {
    const chatbotIdToUse = chatbotId || "your-unique-chatbot-id";
    
    let embedCode;
    if (mode === "popup") {
      embedCode = `<script src="https://chatbot.headstartmarketingplatform.com/chatbot-embed.js"></script>
<script>
Chatbot.init({
  chatbotId: "${chatbotIdToUse}",
  routingUrl: "https://jppjdfmeblnmfdowpumn.supabase.co/functions/v1/chat",
  metadata: {},
  theme: ${JSON.stringify(config, null, 2)}
});
</script>`;
    } else {
      embedCode = `<script src="https://chatbot.headstartmarketingplatform.com/chatbot-embed.js"></script>
<kmtbot-inpage></kmtbot-inpage>
<script>
Chatbot.init({
  chatbotId: "${chatbotIdToUse}",
  routingUrl: "https://jppjdfmeblnmfdowpumn.supabase.co/functions/v1/chat",
  metadata: {},
  theme: ${JSON.stringify(config, null, 2)}
});
</script>`;
    }
    
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Chatbot Configuration Tool
              </h1>
              <p className="text-muted-foreground">
                Create and customize your embeddable chatbot widget
              </p>
            </div>
            <UserProfile />
          </div>

          {/* Mode Selector */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">Mode:</span>
              <Select value={mode} onValueChange={(value: "popup" | "inpage") => setMode(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popup">Pop-up</SelectItem>
                  <SelectItem value="inpage">In-page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 group"
            >
              <Badge variant={currentStep === 1 ? "default" : "secondary"} className="px-3 py-1">
                STEP 1
              </Badge>
               <span className={`font-medium transition-colors ${
                currentStep === 1 
                  ? 'text-foreground border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
                {mode === "popup" ? "Customize" : "Preview"}
              </span>
            </button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <button 
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 group"
            >
              <Badge variant={currentStep === 2 ? "default" : "secondary"} className="px-3 py-1">
                STEP 2
              </Badge>
              <span className={`font-medium transition-colors ${
                currentStep === 2 
                  ? 'text-foreground border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
                Embed Code
              </span>
            </button>
          </div>

          {currentStep === 1 ? (
            <div className="max-w-4xl mx-auto">
              {mode === "popup" ? (
                /* Configuration Panel */
                <div className="space-y-6">
                  <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Settings className="h-5 w-5" />
                        Customize Your Chatbot
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="bubble" className="w-full">
                        <TabsList className="grid w-full grid-cols-5 mb-6">
                          <TabsTrigger value="bubble" className="text-xs">Bubble</TabsTrigger>
                          <TabsTrigger value="tooltip" className="text-xs">Tooltip</TabsTrigger>
                          <TabsTrigger value="window" className="text-xs">Window</TabsTrigger>
                          <TabsTrigger value="footer" className="text-xs">Footer</TabsTrigger>
                          <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
                        </TabsList>

                        <TabsContent value="bubble" className="space-y-4">
                          <BubbleTab config={config} updateConfig={updateConfig} />
                        </TabsContent>

                        <TabsContent value="tooltip" className="space-y-4">
                          <TooltipTab config={config} updateConfig={updateConfig} />
                        </TabsContent>

                        <TabsContent value="window" className="space-y-4">
                          <WindowTab config={config} updateConfig={updateConfig} />
                        </TabsContent>

                        <TabsContent value="footer" className="space-y-4">
                          <FooterTab config={config} updateConfig={updateConfig} />
                        </TabsContent>

                        <TabsContent value="advanced" className="space-y-4">
                          <AdvancedTab config={config} updateConfig={updateConfig} />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                /* In-page Preview */
                <div className="space-y-6">
                  <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <MessageSquare className="h-5 w-5" />
                        In-page Preview
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        This preview shows how your chatbot will appear when embedded directly in a webpage
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6">
                        <InPageChatPreview config={config} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Code2 className="h-5 w-5" />
                    Embed Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mode === "inpage" && (
                    <div>
                      <h3 className="font-semibold mb-3">1. Add Widget Element</h3>
                      <div className="bg-muted/50 rounded-lg p-4 border">
                        <p className="text-sm text-muted-foreground mb-3">
                          Place this element where you want the chat widget to appear
                        </p>
                        <div className="relative">
                          <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm overflow-auto">
&lt;kmtbot-inpage&gt;&lt;/kmtbot-inpage&gt;
                          </pre>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText('<kmtbot-inpage></kmtbot-inpage>');
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="absolute top-3 right-3"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Note: For full-screen mode, set `margin: 0` to your body element to ensure the chat widget occupies the entire viewport.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold mb-3">{mode === "inpage" ? "2. Add Script to Body" : "Add Script to Body"}</h3>
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-md mb-4">
                        <div className="w-5 h-5 bg-warning rounded-full flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Important</p>
                           <p className="text-sm text-muted-foreground">
                            You'll need to create a chatbot configuration in your database with the displayed chatbot ID and your n8n webhook URL for this to work.
                          </p>
                        </div>
                      </div>
                      
                       <div className="relative">
                         <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm overflow-auto max-h-96">
{mode === "popup" ? 
`<script src="https://chatbot.headstartmarketingplatform.com/chatbot-embed.js"></script>
<script>
Chatbot.init({
  chatbotId: "${chatbotId || 'your-unique-chatbot-id'}",
  routingUrl: "https://jppjdfmeblnmfdowpumn.supabase.co/functions/v1/chat",
  metadata: {},
  theme: ${JSON.stringify(config, null, 2)}
});
</script>` :
`<script src="https://chatbot.headstartmarketingplatform.com/chatbot-embed.js"></script>
<script>
Chatbot.init({
  chatbotId: "${chatbotId || 'your-unique-chatbot-id'}",
  routingUrl: "https://jppjdfmeblnmfdowpumn.supabase.co/functions/v1/chat",
  metadata: {},
  theme: ${JSON.stringify(config, null, 2)}
});
</script>`}
                         </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyCode}
                          className="absolute top-3 right-3"
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Render the live chatbot only in popup mode */}
      {mode === "popup" && <ChatbotPreview config={config} />}
    </>
  );
};