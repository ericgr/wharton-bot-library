import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, X, RotateCcw } from "lucide-react";
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

  // Auto-open functionality
  useEffect(() => {
    if (config.autoOpenBot && config.openDelay) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, config.openDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [config.autoOpenBot, config.openDelay]);

  // Update welcome message when config changes
  useEffect(() => {
    setMessages([{ id: 1, text: config.welcomeMessage, isBot: true }]);
  }, [config.welcomeMessage]);

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage = { id: Date.now(), text: inputValue, isBot: false };
    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = { 
        id: Date.now() + 1, 
        text: "This is a live preview response. In the actual implementation, this would connect to your webhook URL.", 
        isBot: true 
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const clearChat = () => {
    setMessages([{ id: 1, text: config.welcomeMessage, isBot: true }]);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowTooltip(false);
  };

  const getBubbleStyle = () => {
    const borderRadius = 
      config.borderRadiusStyle === "circle" ? "50%" :
      config.borderRadiusStyle === "rounded" ? `${config.customIconBorderRadius}px` : "0px";
    
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

  console.log("ChatbotPreview rendering with config:", config);
  console.log("Bubble style:", getBubbleStyle());
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">

      {/* Chatbot tooltip */}
      {config.showTooltip && showTooltip && !isOpen && (
        <div
          className="fixed z-50 px-3 py-2 text-sm rounded-lg shadow-lg max-w-xs pointer-events-none"
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
          className="fixed z-40 shadow-xl border flex flex-col pointer-events-auto"
          style={getWindowStyle()}
        >
          {/* Header */}
          {config.showTitleSection && (
            <div 
              className="flex items-center justify-between p-3 border-b"
              style={{ backgroundColor: config.backgroundColor, color: config.titleTextColor }}
            >
              <span className="font-medium text-sm">{config.titleText}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearChat}
                  className="hover:opacity-70 transition-opacity p-1"
                  style={{ color: config.titleTextColor }}
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={toggleChat}
                  className="hover:opacity-70 transition-opacity p-1"
                  style={{ color: config.titleTextColor }}
                >
                  <X size={16} />
                </button>
              </div>
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
        className="fixed z-[9999] flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 pointer-events-auto"
        style={{
          ...getBubbleStyle(),
          display: 'block',
          visibility: 'visible'
        }}
        onClick={toggleChat}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {config.customIconUrl ? (
          <img 
            src={config.customIconUrl} 
            alt="Chat"
            style={{ 
              width: `${config.customIconSize}%`, 
              height: `${config.customIconSize}%`,
              filter: `invert(1)` // This simulates the icon color change
            }}
          />
        ) : (
          <MessageSquare 
            className="w-3/4 h-3/4" 
            style={{ color: config.titleTextColor }}
          />
        )}
      </button>
    </div>
  );
};