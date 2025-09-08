import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, X, Minimize2, Maximize2 } from "lucide-react";
import { ChatbotConfig } from "@/hooks/useChatbotConfig";

interface ChatbotPreviewProps {
  config: ChatbotConfig;
}

export const ChatbotPreview = ({ config }: ChatbotPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: config.welcomeMessage, isBot: true }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [previewSize, setPreviewSize] = useState({ width: 400, height: 600 });
  const previewRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage = { id: Date.now(), text: inputValue, isBot: false };
    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = { 
        id: Date.now() + 1, 
        text: "This is a preview response. In the actual implementation, this would connect to your n8n workflow.", 
        isBot: true 
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowTooltip(false);
  };

  const getBubbleStyle = () => {
    const borderRadius = 
      config.borderRadiusStyle === "circle" ? "50%" :
      config.borderRadiusStyle === "rounded" ? "12px" : "0px";
    
    return {
      width: `${config.bubbleSize}px`,
      height: `${config.bubbleSize}px`,
      backgroundColor: config.backgroundColor,
      borderRadius,
      right: `${config.rightPosition}px`,
      bottom: `${config.bottomPosition}px`,
    };
  };

  const getWindowStyle = () => ({
    width: `${config.windowWidth}px`,
    height: `${config.windowHeight}px`,
    right: `${config.rightPosition}px`,
    bottom: `${config.bottomPosition + config.bubbleSize + 10}px`,
    borderRadius: `${config.windowBorderRadius}px`,
    backgroundColor: config.backgroundColorWindow,
    fontSize: `${config.fontSize}px`,
  });

  return (
    <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <MessageSquare className="h-5 w-5" />
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={previewRef}
          className="relative bg-gradient-to-br from-slate-100 to-slate-200 border rounded-lg overflow-hidden"
          style={{ 
            width: `${previewSize.width}px`, 
            height: `${previewSize.height}px`,
            minWidth: "300px",
            minHeight: "400px"
          }}
        >
          {/* Resize handles */}
          <div className="absolute top-0 left-0 w-3 h-3 bg-primary cursor-nw-resize opacity-50 hover:opacity-100" />
          <div className="absolute top-0 right-0 w-3 h-3 bg-primary cursor-ne-resize opacity-50 hover:opacity-100" />
          <div className="absolute bottom-0 left-0 w-3 h-3 bg-primary cursor-sw-resize opacity-50 hover:opacity-100" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary cursor-se-resize opacity-50 hover:opacity-100" />

          {/* Sample website content */}
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sample Website</h3>
            <p className="text-gray-600 text-sm">
              This is a preview of how your chatbot will appear on a website. 
              The chatbot widget will be positioned relative to the bottom-right corner.
            </p>
          </div>

          {/* Chatbot tooltip */}
          {config.showTooltip && showTooltip && !isOpen && (
            <div
              className="absolute z-50 px-3 py-2 text-sm rounded-lg shadow-lg max-w-xs"
              style={{
                backgroundColor: config.tooltipBackgroundColor,
                color: config.tooltipTextColor,
                fontSize: `${config.tooltipFontSize}px`,
                right: `${config.rightPosition + config.bubbleSize + 10}px`,
                bottom: `${config.bottomPosition + config.bubbleSize / 2}px`,
              }}
            >
              {config.tooltipMessage}
              <div 
                className="absolute w-0 h-0 border-l-8 border-r-0 border-t-8 border-l-transparent border-r-transparent"
                style={{ 
                  borderTopColor: config.tooltipBackgroundColor,
                  right: "-8px",
                  top: "50%",
                  transform: "translateY(-50%)"
                }}
              />
            </div>
          )}

          {/* Chat window */}
          {isOpen && (
            <div
              className="absolute z-40 shadow-xl border flex flex-col"
              style={getWindowStyle()}
            >
              {/* Header */}
              {config.showTitleSection && (
                <div className="flex items-center justify-between p-3 border-b bg-white">
                  <span className="font-medium text-sm">{config.titleText}</span>
                  <Button size="sm" variant="ghost" onClick={toggleChat}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 p-3 overflow-auto space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className="max-w-[80%] px-3 py-2 text-sm"
                      style={{
                        backgroundColor: message.isBot 
                          ? config.botMessageBackgroundColor 
                          : config.userMessageBackgroundColor,
                        color: message.isBot 
                          ? config.botMessageTextColor 
                          : config.userMessageTextColor,
                        borderRadius: `${config.messageBorderRadius}px`,
                      }}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Starter prompts */}
              {messages.length === 1 && config.starterPrompts.length > 0 && (
                <div className="px-3 pb-2">
                  <div className="flex flex-wrap gap-1">
                    {config.starterPrompts.slice(0, 3).map((prompt, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        className="text-xs h-auto py-1 px-2"
                        onClick={() => {
                          setInputValue(prompt);
                          setTimeout(sendMessage, 100);
                        }}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 text-sm"
                    style={{
                      backgroundColor: config.textInputBackgroundColor,
                      color: config.textInputTextColor,
                    }}
                    maxLength={config.maxCharacters}
                  />
                  <Button 
                    size="sm" 
                    onClick={sendMessage}
                    style={{ backgroundColor: config.sendButtonColor }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Footer */}
              {config.showFooter && (
                <div 
                  className="text-center text-xs py-2 border-t"
                  style={{
                    backgroundColor: config.footerBackgroundColor,
                    color: config.footerTextColor,
                  }}
                >
                  {config.footerText}
                </div>
              )}
            </div>
          )}

          {/* Chat bubble */}
          <button
            className="absolute z-50 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105"
            style={getBubbleStyle()}
            onClick={toggleChat}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {config.customIconUrl ? (
              <img 
                src={config.customIconUrl} 
                alt="Chat"
                className="w-3/4 h-3/4 object-contain"
                style={{ 
                  borderRadius: `${config.customIconBorderRadius}px`,
                  filter: `invert(1)` // This simulates the icon color change
                }}
              />
            ) : (
              <MessageSquare 
                className="w-3/4 h-3/4" 
                style={{ color: config.internalIconColor }}
              />
            )}
          </button>

          {/* Preview info overlay */}
          <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {previewSize.width} × {previewSize.height}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          Drag the corner handles to resize the preview and test different screen sizes
        </p>
      </CardContent>
    </Card>
  );
};