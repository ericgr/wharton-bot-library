import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, RotateCcw, Copy } from "lucide-react";
import { ChatbotConfig } from "@/hooks/useChatbotConfig";

interface InPageChatPreviewProps {
  config: ChatbotConfig;
}

export const InPageChatPreview = ({ config }: InPageChatPreviewProps) => {
  const [messages, setMessages] = useState([
    { id: 1, text: config.welcomeMessage, isBot: true }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [showCharacterWarning, setShowCharacterWarning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update welcome message when config changes
  useEffect(() => {
    setMessages([{ id: 1, text: config.welcomeMessage, isBot: true }]);
  }, [config.welcomeMessage]);

  // Auto-focus input
  useEffect(() => {
    if (config.autoFocusInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [config.autoFocusInput]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    
    if (inputValue.length > config.maxCharacters) {
      setShowCharacterWarning(true);
      setTimeout(() => setShowCharacterWarning(false), 3000);
      return;
    }

    const userMessage = { id: Date.now(), text: inputValue, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse = { 
        id: Date.now() + 1, 
        text: "Thanks for your message! This is a preview of the chatbot functionality.", 
        isBot: true 
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{ id: 1, text: config.welcomeMessage, isBot: true }]);
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div 
      className="flex flex-col h-full w-full"
      style={{ 
        backgroundColor: config.backgroundColorWindow,
        borderRadius: `${config.windowBorderRadius}px`,
        minHeight: '500px',
        maxHeight: '600px'
      }}
    >
      {/* Header */}
      {config.showTitleSection && (
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ 
            backgroundColor: config.backgroundColor,
            color: config.titleTextColor,
            borderBottomColor: '#e2e8f0'
          }}
        >
          <div className="flex items-center gap-3">
            {config.showBotAvatar && (
              <img 
                src={config.botAvatarUrl || "/placeholder.svg"} 
                alt="Bot Avatar"
                className="rounded-full object-cover"
                style={{ 
                  width: `${config.avatarSize}px`, 
                  height: `${config.avatarSize}px`,
                  borderRadius: `${config.avatarBorderRadius}px`
                }}
              />
            )}
            <h3 
              className="font-semibold"
              style={{ 
                fontSize: `${config.fontSize}px`,
                color: config.titleTextColor
              }}
            >
              {config.titleText}
            </h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearChat}
            className="text-current hover:bg-white/10"
          >
            <RotateCcw size={16} />
          </Button>
        </div>
      )}

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ 
          maxHeight: config.showScrollbar ? 'auto' : '400px',
          scrollbarWidth: config.showScrollbar ? 'auto' : 'none',
          msOverflowStyle: config.showScrollbar ? 'auto' : 'none'
        }}
      >
        {/* Starter Prompts */}
        {messages.length === 1 && config.starterPrompts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {config.starterPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(prompt)}
                  className="text-xs"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}>
            {message.isBot && config.showBotAvatar && (
              <img 
                src={config.botAvatarUrl || "/placeholder.svg"} 
                alt="Bot Avatar"
                className="rounded-full object-cover flex-shrink-0"
                style={{ 
                  width: `${config.avatarSize}px`, 
                  height: `${config.avatarSize}px`,
                  borderRadius: `${config.avatarBorderRadius}px`
                }}
              />
            )}
            
            <div className={`max-w-[80%] group relative ${message.isBot ? 'mr-auto' : 'ml-auto'}`}>
              <div 
                className="p-3 break-words"
                style={{
                  backgroundColor: message.isBot ? config.botMessageBackgroundColor : config.userMessageBackgroundColor,
                  color: message.isBot ? config.botMessageTextColor : config.userMessageTextColor,
                  borderRadius: `${config.messageBorderRadius}px`,
                  fontSize: `${config.fontSize}px`
                }}
                {...(config.renderHtml && message.isBot ? 
                  { dangerouslySetInnerHTML: { __html: message.text } } : 
                  { children: message.text }
                )}
              />
              
              {message.isBot && config.showCopyToClipboard && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyMessage(message.text)}
                  className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy size={14} />
                </Button>
              )}
            </div>

            {!message.isBot && config.showUserAvatar && (
              <img 
                src={config.userAvatarUrl || "/placeholder.svg"} 
                alt="User Avatar"
                className="rounded-full object-cover flex-shrink-0"
                style={{ 
                  width: `${config.avatarSize}px`, 
                  height: `${config.avatarSize}px`,
                  borderRadius: `${config.avatarBorderRadius}px`
                }}
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div 
        className="p-4 border-t"
        style={{ borderTopColor: '#e2e8f0' }}
      >
        {showCharacterWarning && (
          <div className="mb-2 text-sm text-red-500">
            {config.maxCharactersWarning}
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={config.placeholderText}
            maxLength={config.maxCharacters}
            style={{
              backgroundColor: config.textInputBackgroundColor,
              color: config.textInputTextColor,
              borderRadius: `${config.textInputBorderRadius}px`,
              fontSize: `${config.fontSize}px`
            }}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim()}
            style={{
              backgroundColor: config.sendButtonColor,
              borderRadius: `${config.sendButtonBorderRadius}px`
            }}
          >
            <Send size={16} />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground mt-1">
          {inputValue.length}/{config.maxCharacters} characters
        </div>
      </div>

      {/* Footer */}
      {config.showFooter && config.footerText && (
        <div 
          className="text-center py-2 px-4 border-t text-xs"
          style={{
            backgroundColor: config.footerBackgroundColor,
            color: config.footerTextColor,
            borderTopColor: '#e2e8f0'
          }}
          dangerouslySetInnerHTML={{ __html: config.footerText }}
        />
      )}
    </div>
  );
};