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
  userMessageBackgroundColor: string;
  userMessageTextColor: string;
  botMessageBackgroundColor: string;
  botMessageTextColor: string;
  textInputBackgroundColor: string;
  textInputTextColor: string;
  sendButtonColor: string;
  maxCharacters: number;
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
  userMessageBackgroundColor: "#e3f2fd",
  userMessageTextColor: "#1976d2",
  botMessageBackgroundColor: "#f5f5f5",
  botMessageTextColor: "#333333",
  textInputBackgroundColor: "#ffffff",
  textInputTextColor: "#333333",
  sendButtonColor: "#026CB5",
  maxCharacters: 75,
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
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return {
    config,
    updateConfig,
    resetConfig: () => setConfig(defaultConfig)
  };
};