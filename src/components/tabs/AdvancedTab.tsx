import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChatbotConfig } from "@/hooks/useChatbotConfig";

interface AdvancedTabProps {
  config: ChatbotConfig;
  updateConfig: (updates: Partial<ChatbotConfig>) => void;
}

export const AdvancedTab = ({ config, updateConfig }: AdvancedTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-2 block">Webhook URL</Label>
        <Input
          type="url"
          value={config.webhookUrl}
          onChange={(e) => updateConfig({ webhookUrl: e.target.value })}
          placeholder="https://your-n8n-instance.com/webhook/your-workflow-id"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter your n8n workflow webhook URL here
        </p>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Custom CSS</Label>
        <Textarea
          value={config.customCSS}
          onChange={(e) => updateConfig({ customCSS: e.target.value })}
          placeholder="/* Add custom CSS here to override default styles */
.chatbot-container {
  /* Your custom styles */
}"
          className="min-h-[200px] font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Add custom CSS to override default chatbot styling
        </p>
      </div>
    </div>
  );
};