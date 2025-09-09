import { useState } from "react";

export interface ChatbotConfig {
  // Bubble settings
  borderRadiusStyle: "circle" | "rounded" | "none";
  backgroundColor: string;
  customIconUrl: string;
  customIconSize: number;
  customIconBorderRadius: number;
  titleTextColor: string;
  bubbleSize: number;
  rightPosition: number;
  bottomPosition: number;
  autoOpenBot: boolean;
  openDelay: number;

  // Tooltip settings
  showTooltip: boolean;
  tooltipMessage: string;
  tooltipBackgroundColor: string;
  tooltipTextColor: string;
  tooltipFontSize: number;

  // Window settings
  windowBorderRadius: number;
  avatarSize: number;
  avatarBorderRadius: number;
  messageBorderRadius: number;
  backgroundColorWindow: string;
  showTitleSection: boolean;
  titleText: string;
  welcomeMessage: string;
  customErrorMessage: string;
  starterPrompts: string[];
  renderHtml: boolean;
  clearChatOnReload: boolean;
  showScrollbar: boolean;
  windowHeight: number;
  windowWidth: number;
  fontSize: number;
  
  // Bot Message Settings
  botMessageBackgroundColor: string;
  botMessageTextColor: string;
  showBotAvatar: boolean;
  botAvatarUrl: string;
  showCopyToClipboard: boolean;
  
  // User Message Settings
  userMessageBackgroundColor: string;
  userMessageTextColor: string;
  showUserAvatar: boolean;
  userAvatarUrl: string;
  
  // Text Input Field Settings
  textInputBorderRadius: number;
  placeholderText: string;
  textInputBackgroundColor: string;
  textInputTextColor: string;
  sendButtonColor: string;
  sendButtonBorderRadius: number;
  maxCharacters: number;
  maxCharactersWarning: string;
  autoFocusInput: boolean;
  
  enableFileUpload: boolean;
  enableVoiceInput: boolean;

  // Footer settings
  showFooter: boolean;
  footerText: string;
  footerBackgroundColor: string;
  footerTextColor: string;

  // Advanced settings
  customCSS: string;
  webhookUrl: string;
}

const defaultConfig: ChatbotConfig = {
  // Bubble defaults
  borderRadiusStyle: "rounded",
  backgroundColor: "#026CB5",
  customIconUrl: "https://www.svgrepo.com/show/235143/customer-service-24-hours.svg",
  customIconSize: 86,
  customIconBorderRadius: 18,
  titleTextColor: "#ffffff",
  bubbleSize: 50,
  rightPosition: 20,
  bottomPosition: 20,
  autoOpenBot: true,
  openDelay: 2,

  // Tooltip defaults
  showTooltip: true,
  tooltipMessage: "Hi 👋 Ask me about the WEMBA program.",
  tooltipBackgroundColor: "#026CB5",
  tooltipTextColor: "#ffffff",
  tooltipFontSize: 15,

  // Window defaults
  windowBorderRadius: 32,
  avatarSize: 24,
  avatarBorderRadius: 6,
  messageBorderRadius: 6,
  backgroundColorWindow: "#ffffff",
  showTitleSection: true,
  titleText: "WEMBA Digital Assistant",
  welcomeMessage: "Hi there! I'm here to help you learn about the Western MiB Program for Executives. Please note that, as an AI, I may occasionally give things incorrect. Please use the webpage provided to verify any information.",
  customErrorMessage: "I'm sorry. Something has gone wrong. Please try asking your question again.",
  starterPrompts: ["What's new in 2025?", "What is the WEMBA program?"],
  renderHtml: true,
  clearChatOnReload: true,
  showScrollbar: true,
  windowHeight: 600,
  windowWidth: 400,
  fontSize: 16,
  
  // Bot Message defaults
  botMessageBackgroundColor: "#f5f5f5",
  botMessageTextColor: "#333333",
  showBotAvatar: true,
  botAvatarUrl: "https://www.svgrepo.com/show/334455/bot.svg",
  showCopyToClipboard: true,
  
  // User Message defaults
  userMessageBackgroundColor: "#e3f2fd",
  userMessageTextColor: "#1976d2",
  showUserAvatar: true,
  userAvatarUrl: "https://www.svgrepo.com/show/532363/user-alt-1.svg",
  
  // Text Input Field defaults
  textInputBorderRadius: 6,
  placeholderText: "How can I assist you?",
  textInputBackgroundColor: "#ffffff",
  textInputTextColor: "#333333",
  sendButtonColor: "#026CB5",
  sendButtonBorderRadius: 50,
  maxCharacters: 75,
  maxCharactersWarning: "You exceeded the characters limit. Please input less than 75 characters.",
  autoFocusInput: false,
  enableFileUpload: false,
  enableVoiceInput: false,

  // Footer defaults
  showFooter: true,
  footerText: "Powered by WEMBA",
  footerBackgroundColor: "#ffffff",
  footerTextColor: "#666666",

  // Advanced defaults
  customCSS: "",
  webhookUrl: ""
};

export const useChatbotConfig = () => {
  const [config, setConfig] = useState<ChatbotConfig>(defaultConfig);

  const updateConfig = (updates: Partial<ChatbotConfig>) => {
    console.log("🔄 Updating config with:", updates);
    console.log("🔄 Current config before update:", config);
    // Validate inputs for security
    const sanitizedUpdates = { ...updates };
    
    // Sanitize text inputs
    if (updates.titleText) {
      sanitizedUpdates.titleText = updates.titleText.slice(0, 100); // Max 100 chars
    }
    if (updates.welcomeMessage) {
      sanitizedUpdates.welcomeMessage = updates.welcomeMessage.slice(0, 500);
    }
    if (updates.tooltipMessage) {
      sanitizedUpdates.tooltipMessage = updates.tooltipMessage.slice(0, 200);
    }
    if (updates.footerText) {
      sanitizedUpdates.footerText = updates.footerText.slice(0, 100);
    }
    if (updates.webhookUrl) {
      // Basic URL validation
      try {
        new URL(updates.webhookUrl);
      } catch {
        return; // Don't update if invalid URL
      }
    }
    
    setConfig(prev => {
      const newConfig = { ...prev, ...sanitizedUpdates };
      console.log("🔄 New config after update:", newConfig);
      return newConfig;
    });
  };

  const setFullConfig = (newConfig: ChatbotConfig) => {
    console.log("Setting full config:", newConfig);
    setConfig(newConfig);
  };

  return {
    config,
    updateConfig,
    setFullConfig,
    resetConfig: () => setConfig(defaultConfig)
  };
};