import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ColorPicker } from "@/components/ui/color-picker";
import { ChatbotConfig } from "@/hooks/useChatbotConfig";

interface BubbleTabProps {
  config: ChatbotConfig;
  updateConfig: (updates: Partial<ChatbotConfig>) => void;
}

export const BubbleTab = ({ config, updateConfig }: BubbleTabProps) => {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground mb-4">
        Modify the appearance of your chat bubble including its size, position, colors, and custom icon. This is the floating button users click to open the chat.
      </p>
      
      <div>
        <Label className="text-sm font-medium mb-3 block">Border Radius Style</Label>
        <RadioGroup
          value={config.borderRadiusStyle}
          onValueChange={(value) => updateConfig({ borderRadiusStyle: value as "circle" | "rounded" | "none" })}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="circle" id="circle" />
            <Label htmlFor="circle">Circle</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rounded" id="rounded" />
            <Label htmlFor="rounded">Rounded</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="none" />
            <Label htmlFor="none">None</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Background Color</Label>
        <ColorPicker
          value={config.backgroundColor}
          onChange={(value) => updateConfig({ backgroundColor: value })}
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Custom Icon URL</Label>
        <Input
          type="url"
          value={config.customIconUrl}
          onChange={(e) => updateConfig({ customIconUrl: e.target.value })}
          placeholder="https://www.svgrepo.com/show/235143/customer-service-24-hours.svg"
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">
          Custom Icon Size: {config.customIconSize}%
        </Label>
        <Slider
          value={[config.customIconSize]}
          onValueChange={([value]) => updateConfig({ customIconSize: value })}
          max={100}
          min={20}
          step={1}
          className="w-full"
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">
          Custom Icon Border Radius: {config.customIconBorderRadius}
        </Label>
        <Slider
          value={[config.customIconBorderRadius]}
          onValueChange={([value]) => updateConfig({ customIconBorderRadius: value })}
          max={50}
          min={0}
          step={1}
          className="w-full"
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Color of Title Text</Label>
        <ColorPicker
          value={config.titleTextColor}
          onChange={(value) => updateConfig({ titleTextColor: value })}
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Bubble Size (px)</Label>
        <Input
          type="number"
          value={config.bubbleSize}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value)) {
              updateConfig({ bubbleSize: value });
            }
          }}
          className="w-full"
          placeholder="50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Right Position (px)</Label>
          <Input
            type="number"
            value={config.rightPosition}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value)) {
                updateConfig({ rightPosition: value });
              }
            }}
            className="w-full"
            placeholder="20"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">Bottom Position (px)</Label>
          <Input
            type="number"
            value={config.bottomPosition}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value)) {
                updateConfig({ bottomPosition: value });
              }
            }}
            className="w-full"
            placeholder="20"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Auto Open Bot Window</Label>
        <Switch
          checked={config.autoOpenBot}
          onCheckedChange={(checked) => updateConfig({ autoOpenBot: checked })}
        />
      </div>

      {config.autoOpenBot && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Open Delay (seconds)</Label>
          <Input
            type="number"
            value={config.openDelay}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 1) {
                updateConfig({ openDelay: value });
              }
            }}
            className="w-full"
            placeholder="3"
          />
          <p className="text-xs text-muted-foreground mt-1">Minimum: 1 second</p>
        </div>
      )}
    </div>
  );
};