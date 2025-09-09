import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, X, RotateCcw, ChevronDown, Copy, Move } from "lucide-react";
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
  const [showCharacterWarning, setShowCharacterWarning] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: config.windowWidth, height: config.windowHeight });
  const [isResizing, setIsResizing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Auto-open functionality
  useEffect(() => {
    if (config.autoOpenBot && config.openDelay) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, config.openDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [config.autoOpenBot, config.openDelay]);

  // Update window size when config changes
  useEffect(() => {
    setWindowSize({ width: config.windowWidth, height: config.windowHeight });
  }, [config.windowWidth, config.windowHeight]);

  // Update welcome message when config changes
  useEffect(() => {
    setMessages([{ id: 1, text: config.welcomeMessage, isBot: true }]);
  }, [config.welcomeMessage]);

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    
    if (inputValue.length > config.maxCharacters) {
      setShowCharacterWarning(true);
      setTimeout(() => setShowCharacterWarning(false), 3000);
      return;
    }
    
    const newMessage = { id: Date.now(), text: inputValue, isBot: false };
    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setShowCharacterWarning(false);
    
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
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    setShowTooltip(false);
    
    // Auto focus input when opening and auto focus is enabled
    if (newIsOpen && config.autoFocusInput) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
    width: `${windowSize.width}px`,
    height: `${windowSize.height}px`,
    right: `${config.rightPosition}px`,
    bottom: `${config.bottomPosition + config.bubbleSize + 10}px`,
    borderRadius: config.windowBorderRadius > 0 ? `${config.windowBorderRadius}px` : "0px",
    backgroundColor: config.backgroundColorWindow,
    fontSize: `${config.fontSize}px`,
    overflow: 'hidden', // This ensures border radius is visible
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowSize.width;
    const startHeight = windowSize.height;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = startX - e.clientX;
      const deltaY = startY - e.clientY; // Fixed: reversed direction for intuitive dragging
      
      const newWidth = Math.max(250, Math.min(800, startWidth + deltaX)); // Increased max width
      const newHeight = Math.max(300, Math.min(800, startHeight + deltaY));
      
      setWindowSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  
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
          ref={windowRef}
          className="fixed z-40 shadow-xl border flex flex-col pointer-events-auto"
          style={getWindowStyle()}
        >
          {/* Resize handles */}
          <div 
            className="absolute -top-1 -left-1 w-4 h-4 cursor-nw-resize z-50 group"
            onMouseDown={handleMouseDown}
          >
            <div className="w-full h-full bg-gray-400/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Move size={10} className="text-gray-600" />
            </div>
          </div>
          <div 
            className="absolute -top-1 -right-1 w-4 h-4 cursor-ne-resize z-50 group"
            onMouseDown={handleMouseDown}
          >
            <div className="w-full h-full bg-gray-400/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Move size={10} className="text-gray-600" />
            </div>
          </div>
          {/* Header */}
          {config.showTitleSection && (
            <div 
              className="flex items-center justify-between p-3 border-b"
              style={{ backgroundColor: config.backgroundColor, color: config.titleTextColor }}
            >
              <div className="flex items-center gap-2">
                {config.customIconUrl && (
                  <img 
                    src={config.customIconUrl} 
                    alt="Chat"
                    style={{ 
                      width: `${config.avatarSize}px`, 
                      height: `${config.avatarSize}px`,
                      borderRadius: `${config.avatarBorderRadius}px`
                    }}
                  />
                )}
                <span className="font-medium text-sm">{config.titleText}</span>
              </div>
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

          {/* Character Warning */}
          {showCharacterWarning && (
            <div className="p-3 bg-red-50 border border-red-200 mx-3 mt-3 rounded-md">
              <p className="text-red-600 text-sm font-medium">{config.maxCharactersWarning}</p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 p-3 overflow-auto space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} items-start gap-2`}
              >
                {/* Bot avatar (left side) */}
                {message.isBot && config.showBotAvatar && config.botAvatarUrl && (
                  <img 
                    src={config.botAvatarUrl} 
                    alt="Bot"
                    style={{ 
                      width: `${config.avatarSize}px`, 
                      height: `${config.avatarSize}px`,
                      borderRadius: `${config.avatarBorderRadius}px`,
                      flexShrink: 0
                    }}
                  />
                )}
                
                <div className={`flex flex-col ${message.isBot ? 'items-start' : 'items-end'} max-w-[80%]`}>
                  <div className="relative group">
                    <div
                      className="px-3 py-2 text-sm"
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
                    
                    {/* Copy to clipboard for bot messages */}
                    {message.isBot && config.showCopyToClipboard && (
                      <button
                        onClick={() => copyToClipboard(message.text)}
                        className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                        title="Copy to clipboard"
                      >
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* User avatar (right side) */}
                {!message.isBot && config.showUserAvatar && config.userAvatarUrl && (
                  <img 
                    src={config.userAvatarUrl} 
                    alt="User"
                    style={{ 
                      width: `${config.avatarSize}px`, 
                      height: `${config.avatarSize}px`,
                      borderRadius: `${config.avatarBorderRadius}px`,
                      flexShrink: 0
                    }}
                  />
                )}
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
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={config.placeholderText}
                className="flex-1 text-sm"
                style={{
                  backgroundColor: config.textInputBackgroundColor,
                  color: config.textInputTextColor,
                  borderRadius: `${config.textInputBorderRadius}px`,
                }}
                maxLength={config.maxCharacters}
              />
              <Button 
                size="sm" 
                onClick={sendMessage}
                style={{ 
                  backgroundColor: config.sendButtonColor,
                  borderRadius: `${config.sendButtonBorderRadius}px`,
                }}
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
              <div dangerouslySetInnerHTML={{ __html: config.footerText }} />
            </div>
          )}
        </div>
      )}

      {/* Chat bubble */}
      <button
        className="fixed z-[9999] flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 pointer-events-auto"
        style={{
          ...getBubbleStyle(),
          display: 'flex',
          visibility: 'visible'
        }}
        onClick={toggleChat}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {isOpen ? (
          <ChevronDown 
            className="w-3/4 h-3/4" 
            style={{ color: config.titleTextColor }}
          />
        ) : (
          config.customIconUrl ? (
            <img 
              src={config.customIconUrl} 
              alt="Chat"
              style={{ 
                width: `${config.customIconSize}%`, 
                height: `${config.customIconSize}%`
              }}
            />
          ) : (
            <MessageSquare 
              className="w-3/4 h-3/4" 
              style={{ color: config.titleTextColor }}
            />
          )
        )}
      </button>
    </div>
  );
};