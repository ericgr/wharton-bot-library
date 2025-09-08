import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ChatbotConfig } from "@/hooks/useChatbotConfig";

interface FooterTabProps {
  config: ChatbotConfig;
  updateConfig: (updates: Partial<ChatbotConfig>) => void;
}

export const FooterTab = ({ config, updateConfig }: FooterTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Show Footer</Label>
        <Switch
          checked={config.showFooter}
          onCheckedChange={(checked) => updateConfig({ showFooter: checked })}
        />
      </div>

      {config.showFooter && (
        <>
          <div>
            <Label className="text-sm font-medium mb-2 block">Footer Text</Label>
            <Textarea
              value={config.footerText}
              onChange={(e) => updateConfig({ footerText: e.target.value })}
              placeholder="Powered by WEMBA"
              className="min-h-[60px]"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Background Color</Label>
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded border border-border"
                style={{ backgroundColor: config.footerBackgroundColor }}
              />
              <Input
                type="text"
                value={config.footerBackgroundColor}
                onChange={(e) => updateConfig({ footerBackgroundColor: e.target.value })}
                className="font-mono text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Text Color</Label>
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded border border-border"
                style={{ backgroundColor: config.footerTextColor }}
              />
              <Input
                type="text"
                value={config.footerTextColor}
                onChange={(e) => updateConfig({ footerTextColor: e.target.value })}
                className="font-mono text-sm"
                placeholder="#666666"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};