import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Border Radius Style: {config.windowBorderRadius}
        </Label>
        <Slider
          value={[config.windowBorderRadius]}
          onValueChange={([value]) => updateConfig({ windowBorderRadius: value })}
          max={50}
          min={0}
          step={1}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Avatar Size: {config.avatarSize}
          </Label>
          <Slider
            value={[config.avatarSize]}
            onValueChange={([value]) => updateConfig({ avatarSize: value })}
            max={50}
            min={10}
            step={1}
            className="w-full"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Avatar Border Radius: {config.avatarBorderRadius}
          </Label>
          <Slider
            value={[config.avatarBorderRadius]}
            onValueChange={([value]) => updateConfig({ avatarBorderRadius: value })}
            max={25}
            min={0}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">
          Message Border Radius: {config.messageBorderRadius}
        </Label>
        <Slider
          value={[config.messageBorderRadius]}
          onValueChange={([value]) => updateConfig({ messageBorderRadius: value })}
          max={25}
          min={0}
          step={1}
          className="w-full"
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Background Color</Label>
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded border border-border"
            style={{ backgroundColor: config.backgroundColorWindow }}
          />
          <Input
            type="text"
            value={config.backgroundColorWindow}
            onChange={(e) => updateConfig({ backgroundColorWindow: e.target.value })}
            className="font-mono text-sm"
            placeholder="#ffffff"
          />
        </div>
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
          <Label className="text-sm font-medium mb-2 block">
            Height (px): {config.windowHeight}
          </Label>
          <Slider
            value={[config.windowHeight]}
            onValueChange={([value]) => updateConfig({ windowHeight: value })}
            max={800}
            min={300}
            step={10}
            className="w-full"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Width (px): {config.windowWidth}
          </Label>
          <Slider
            value={[config.windowWidth]}
            onValueChange={([value]) => updateConfig({ windowWidth: value })}
            max={600}
            min={250}
            step={10}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">
          Font Size (px): {config.fontSize}
        </Label>
        <Slider
          value={[config.fontSize]}
          onValueChange={([value]) => updateConfig({ fontSize: value })}
          max={24}
          min={10}
          step={1}
          className="w-full"
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">
          Maximum Characters: {config.maxCharacters}
        </Label>
        <Slider
          value={[config.maxCharacters]}
          onValueChange={([value]) => updateConfig({ maxCharacters: value })}
          max={500}
          min={25}
          step={5}
          className="w-full"
        />
      </div>
    </div>
  );
};