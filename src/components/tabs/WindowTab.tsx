import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, X } from "lucide-react";
import { ChatbotConfig } from "@/hooks/useChatbotConfig";

interface WindowTabProps {
  config: ChatbotConfig;
  updateConfig: (updates: Partial<ChatbotConfig>) => void;
}

export const WindowTab = ({ config, updateConfig }: WindowTabProps) => {
  const addStarterPrompt = () => {
    updateConfig({ 
      starterPrompts: [...config.starterPrompts, ""] 
    });
  };

  const removeStarterPrompt = (index: number) => {
    updateConfig({ 
      starterPrompts: config.starterPrompts.filter((_, i) => i !== index) 
    });
  };

  const updateStarterPrompt = (index: number, value: string) => {
    const newPrompts = [...config.starterPrompts];
    newPrompts[index] = value;
    updateConfig({ starterPrompts: newPrompts });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground mb-4">
        Design your chat interface by customizing the chat window's appearance, messages, avatars, and input field. These settings affect the main chat experience.
      </p>
      
      <div>
        <Label className="text-sm font-medium mb-3 block">Border Radius Style</Label>
        <RadioGroup
          value={config.windowBorderRadius > 0 ? "rounded" : "none"}
          onValueChange={(value) => updateConfig({ windowBorderRadius: value === "rounded" ? 12 : 0 })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rounded" id="rounded" />
            <Label htmlFor="rounded" className="text-sm">Rounded</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="none" />
            <Label htmlFor="none" className="text-sm">None</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Avatar Size</Label>
          <Input
            type="number"
            value={config.avatarSize}
            onChange={(e) => updateConfig({ avatarSize: parseInt(e.target.value) || 24 })}
            min={10}
            max={50}
            className="w-full"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">Avatar Border Radius</Label>
          <Input
            type="number"
            value={config.avatarBorderRadius}
            onChange={(e) => updateConfig({ avatarBorderRadius: parseInt(e.target.value) || 0 })}
            min={0}
            max={25}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Message Border Radius</Label>
        <Input
          type="number"
          value={config.messageBorderRadius}
          onChange={(e) => updateConfig({ messageBorderRadius: parseInt(e.target.value) || 0 })}
          min={0}
          max={25}
          className="w-full"
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Background Color</Label>
        <ColorPicker
          value={config.backgroundColorWindow}
          onChange={(value) => updateConfig({ backgroundColorWindow: value })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Show Title Section</Label>
        <Switch
          checked={config.showTitleSection}
          onCheckedChange={(checked) => updateConfig({ showTitleSection: checked })}
        />
      </div>

      {config.showTitleSection && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Title</Label>
          <Input
            value={config.titleText}
            onChange={(e) => updateConfig({ titleText: e.target.value })}
            placeholder="WEMBA Digital Assistant"
          />
        </div>
      )}

      <div>
        <Label className="text-sm font-medium mb-2 block">Welcome Message</Label>
        <Textarea
          value={config.welcomeMessage}
          onChange={(e) => updateConfig({ welcomeMessage: e.target.value })}
          placeholder="Hi there! I'm here to help you..."
          className="min-h-[100px]"
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Custom Error Message</Label>
        <Textarea
          value={config.customErrorMessage}
          onChange={(e) => updateConfig({ customErrorMessage: e.target.value })}
          placeholder="I'm sorry. Something has gone wrong..."
          className="min-h-[60px]"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium">Starter Prompts</Label>
          <Button onClick={addStarterPrompt} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Prompt
          </Button>
        </div>
        <div className="space-y-2">
          {config.starterPrompts.map((prompt, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={prompt}
                onChange={(e) => updateStarterPrompt(index, e.target.value)}
                placeholder="Enter starter prompt..."
                className="flex-1"
              />
              <Button
                onClick={() => removeStarterPrompt(index)}
                size="sm"
                variant="outline"
                className="px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Render HTML in Response</Label>
          <Switch
            checked={config.renderHtml}
            onCheckedChange={(checked) => updateConfig({ renderHtml: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Clear Chat on Reload</Label>
          <Switch
            checked={config.clearChatOnReload}
            onCheckedChange={(checked) => updateConfig({ clearChatOnReload: checked })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Show Scrollbar</Label>
          <Switch
            checked={config.showScrollbar}
            onCheckedChange={(checked) => updateConfig({ showScrollbar: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Enable File Upload</Label>
          <Switch
            checked={config.enableFileUpload}
            onCheckedChange={(checked) => updateConfig({ enableFileUpload: checked })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Height (px)</Label>
          <Input
            type="number"
            value={config.windowHeight}
            onChange={(e) => updateConfig({ windowHeight: parseInt(e.target.value) || 600 })}
            min={300}
            max={800}
            className="w-full"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">Width (px)</Label>
          <Input
            type="number"
            value={config.windowWidth}
            onChange={(e) => updateConfig({ windowWidth: parseInt(e.target.value) || 400 })}
            min={250}
            max={600}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Font Size (px)</Label>
          <Input
            type="number"
            value={config.fontSize}
            onChange={(e) => updateConfig({ fontSize: parseInt(e.target.value) || 16 })}
            min={10}
            max={24}
            className="w-full"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">Maximum Characters</Label>
          <Input
            type="number"
            value={config.maxCharacters}
            onChange={(e) => updateConfig({ maxCharacters: parseInt(e.target.value) || 75 })}
            min={25}
            max={500}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};