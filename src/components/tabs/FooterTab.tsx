import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "@/components/ui/color-picker";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
            <RichTextEditor
              value={config.footerText}
              onChange={(value) => updateConfig({ footerText: value })}
              placeholder="Powered by WEMBA"
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Background Color</Label>
            <ColorPicker
              value={config.footerBackgroundColor}
              onChange={(value) => updateConfig({ footerBackgroundColor: value })}
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Text Color</Label>
            <ColorPicker
              value={config.footerTextColor}
              onChange={(value) => updateConfig({ footerTextColor: value })}
            />
          </div>
        </>
      )}
    </div>
  );
};