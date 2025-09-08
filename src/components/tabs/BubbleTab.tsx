import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChatbotConfig } from "@/hooks/useChatbotConfig";

interface BubbleTabProps {
  config: ChatbotConfig;
  updateConfig: (updates: Partial<ChatbotConfig>) => void;
}

export const BubbleTab = ({ config, updateConfig }: BubbleTabProps) => {
  return (
    <div className="space-y-6">
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
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded border border-border"
            style={{ backgroundColor: config.backgroundColor }}
          />
          <Input
            type="text"
            value={config.backgroundColor}
            onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
            className="font-mono text-sm"
            placeholder="#026CB5"
          />
        </div>
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
        <Label className="text-sm font-medium mb-2 block">Color of Internal Icons</Label>
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded border border-border"
            style={{ backgroundColor: config.internalIconColor }}
          />
          <Input
            type="text"
            value={config.internalIconColor}
            onChange={(e) => updateConfig({ internalIconColor: e.target.value })}
            className="font-mono text-sm"
            placeholder="#dceae8"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">
          Bubble Size (px): {config.bubbleSize}
        </Label>
        <Slider
          value={[config.bubbleSize]}
          onValueChange={([value]) => updateConfig({ bubbleSize: value })}
          max={100}
          min={30}
          step={1}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Right Position (px): {config.rightPosition}
          </Label>
          <Slider
            value={[config.rightPosition]}
            onValueChange={([value]) => updateConfig({ rightPosition: value })}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Bottom Position (px): {config.bottomPosition}
          </Label>
          <Slider
            value={[config.bottomPosition]}
            onValueChange={([value]) => updateConfig({ bottomPosition: value })}
            max={100}
            min={0}
            step={1}
            className="w-full"
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
          <Label className="text-sm font-medium mb-2 block">
            Open Delay (seconds): {config.openDelay}
          </Label>
          <Slider
            value={[config.openDelay]}
            onValueChange={([value]) => updateConfig({ openDelay: value })}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">Minimum: 1 second</p>
        </div>
      )}
    </div>
  );
};