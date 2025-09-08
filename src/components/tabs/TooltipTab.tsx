import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "@/components/ui/color-picker";
import { ChatbotConfig } from "@/hooks/useChatbotConfig";

interface TooltipTabProps {
  config: ChatbotConfig;
  updateConfig: (updates: Partial<ChatbotConfig>) => void;
}

export const TooltipTab = ({ config, updateConfig }: TooltipTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Show Tooltip</Label>
        <Switch
          checked={config.showTooltip}
          onCheckedChange={(checked) => updateConfig({ showTooltip: checked })}
        />
      </div>

      {config.showTooltip && (
        <>
          <div>
            <Label className="text-sm font-medium mb-2 block">Message</Label>
            <Textarea
              value={config.tooltipMessage}
              onChange={(e) => updateConfig({ tooltipMessage: e.target.value })}
              placeholder="Hi 👋 Ask me about the WEMBA program."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Background Color</Label>
            <ColorPicker
              value={config.tooltipBackgroundColor}
              onChange={(value) => updateConfig({ tooltipBackgroundColor: value })}
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Text Color</Label>
            <ColorPicker
              value={config.tooltipTextColor}
              onChange={(value) => updateConfig({ tooltipTextColor: value })}
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Font Size (px): {config.tooltipFontSize}
            </Label>
            <Slider
              value={[config.tooltipFontSize]}
              onValueChange={([value]) => updateConfig({ tooltipFontSize: value })}
              max={24}
              min={10}
              step={1}
              className="w-full"
            />
          </div>
        </>
      )}
    </div>
  );
};