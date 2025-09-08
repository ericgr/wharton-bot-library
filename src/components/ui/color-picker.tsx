import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ColorPicker = ({ value, onChange, className }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const presetColors = [
    "#026CB5", "#ffffff", "#000000", "#dceae8",
    "#666666", "#ff0000", "#00ff00", "#0000ff",
    "#ffff00", "#ff00ff", "#00ffff", "#ffa500",
    "#800080", "#008000", "#ffc0cb", "#a52a2a"
  ];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="w-8 h-8 rounded border-2 border-border hover:border-ring transition-colors cursor-pointer"
            style={{ backgroundColor: value }}
            onClick={() => setIsOpen(true)}
          />
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="start">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Custom Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={handleColorChange}
                  className="w-12 h-10 rounded border border-input cursor-pointer"
                />
                <Input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="font-mono text-sm flex-1"
                  placeholder="#026CB5"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Preset Colors</label>
              <div className="grid grid-cols-8 gap-1">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-border hover:border-ring transition-colors cursor-pointer"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setInputValue(color);
                      onChange(color);
                      setIsOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        className="font-mono text-sm flex-1"
        placeholder="#026CB5"
      />
    </div>
  );
};