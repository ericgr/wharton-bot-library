/**
 * Custom Chatbot Embed Script
 * A comprehensive embeddable chatbot widget with full theming support
 */

class ChatbotWidget {
  constructor() {
    this.config = {};
    this.isOpen = false;
    this.messages = [];
    this.container = null;
    this.inputValue = '';
  }

  init(options) {
    console.log('Chatbot options received:', options); // You can remove this line later

    // A temporary object to hold the merged top-level settings
    const tempConfig = {
      ...this.config, // Start with the initial defaults
      ...options      // Override with top-level settings from the embed (like chatbotId)
    };

    // Define default theme structure within the constructor or a static property if not already present
    // For this fix, we'll assume the defaults are set on this.config before this method
    const defaultTheme = {
        // Bubble
        bubbleIcon: 'MessageCircle',
        bubbleSize: 60,
        bubblePosition: 'bottom-right',
        bubbleColor: '#3b82f6',
        bubbleTextColor: '#ffffff',
        bubbleBorderRadius: 'full',
        autoOpenBot: false,
        openDelay: 3000,

        // Tooltip
        showTooltip: true,
        tooltipText: 'Hi there! 👋 How can I help you today?',
        tooltipBackgroundColor: '#1f2937',
        tooltipTextColor: '#ffffff',

        // Window
        windowTitle: 'Chat with us',
        windowIcon: 'Bot',
        showTitleSection: true,
        windowBackgroundColor: '#ffffff',
        windowTextColor: '#000000',
        windowBorderRadius: 16,
        windowWidth: 400,
        windowHeight: 600,
        avatarSize: 40,
        avatarBorderRadius: 50,
        messageBorderRadius: 12,

        // Text Input
        placeholderText: 'Type your message...',
        sendButtonColor: '#3b82f6',
        maxCharacters: 1000,
        showCharacterWarning: true,
        maxCharactersWarningMessage: 'Character limit exceeded',

        // Footer
        showFooter: true,
        footerText: 'Powered by n8n',
        footerLink: 'https://n8n.io',

        // Advanced
        webhookUrl: '',
        customCSS: '',
        starterPrompts: []
    };
    
    // Now, specifically merge the 'theme' objects
    tempConfig.theme = {
      ...defaultTheme,         // Start with the default theme
      ...options.theme         // Override with the custom theme settings from the embed
    };

    // Finally, assign the correctly merged configuration
    this.config = tempConfig;

    // Also, fix property name mismatches to be safe.
    // Your embed might use 'titleText' but the code uses 'windowTitle'. This makes them compatible.
    if (this.config.theme.titleText) {
      this.config.theme.windowTitle = this.config.theme.titleText;
    }
    if (this.config.theme.titleTextColor) {
      this.config.theme.windowTextColor = this.config.theme.titleTextColor;
    }

    // Apply custom CSS if provided
    if (this.config.theme.customCSS) {
      this.injectCustomCSS(this.config.theme.customCSS);
    }

    this.createChatbot();
    
    // Auto-open if configured
    if (this.config.theme.autoOpenBot && this.config.theme.openDelay) {
      setTimeout(() => {
        this.toggleChat();
      }, this.config.theme.openDelay);
    }
  }

  injectCustomCSS(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  createChatbot() {
    // Create main container
    this.container = document.createElement('div');
    this.container.id = 'chatbot-widget';
    this.container.style.cssText = `
      position: fixed;
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
      ${this.getPositionStyles()}
    `;

    // Create tooltip - Check if showTooltip is explicitly true
    if (this.config.theme.showTooltip === true) {
      this.createTooltip();
    }

    // Create chat window
    this.createChatWindow();

    // Create bubble button
    this.createBubbleButton();

    // Add initial message
    this.messages = [{
      type: 'bot',
      content: 'Hello! How can I help you today?',
      timestamp: new Date()
    }];

    document.body.appendChild(this.container);
    this.updateChatWindow();
  }

  getPositionStyles() {
    const position = this.config.theme.bubblePosition;
    const margin = '20px';
    
    switch (position) {
      case 'bottom-right':
        return `bottom: ${margin}; right: ${margin};`;
      case 'bottom-left':
        return `bottom: ${margin}; left: ${margin};`;
      case 'top-right':
        return `top: ${margin}; right: ${margin};`;
      case 'top-left':
        return `top: ${margin}; left: ${margin};`;
      default:
        return `bottom: ${margin}; right: ${margin};`;
    }
  }

  createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.id = 'chatbot-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      background: ${this.config.theme.tooltipBackgroundColor};
      color: ${this.config.theme.tooltipTextColor};
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      max-width: 200px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      ${this.getTooltipPosition()}
    `;
    tooltip.textContent = this.config.theme.tooltipText;
    this.container.appendChild(tooltip);
  }

  getTooltipPosition() {
    const position = this.config.theme.bubblePosition || 'bottom-right';
    const bubbleSize = this.config.theme.bubbleSize || 50;
    
    // Position tooltip based on bubble position
    if (position.includes('right')) {
      return `right: ${bubbleSize + 10}px; bottom: 50%; transform: translateY(50%);`;
    } else {
      return `left: ${bubbleSize + 10}px; bottom: 50%; transform: translateY(50%);`;
    }
  }

  createBubbleButton() {
    const bubble = document.createElement('button');
    bubble.id = 'chatbot-bubble';
    bubble.style.cssText = `
      width: ${this.config.theme.bubbleSize}px;
      height: ${this.config.theme.bubbleSize}px;
      background: ${this.config.theme.bubbleColor};
      color: ${this.config.theme.bubbleTextColor};
      border: none;
      border-radius: ${this.getBorderRadiusValue(this.config.theme.bubbleBorderRadius)};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      font-size: 24px;
      position: relative;
    `;

    // Add icon based on state
    this.updateBubbleIcon(bubble);

    // Add event listeners
    bubble.addEventListener('click', () => this.toggleChat());
    
    if (this.config.theme.showTooltip) {
      bubble.addEventListener('mouseenter', () => this.showTooltip());
      bubble.addEventListener('mouseleave', () => this.hideTooltip());
    }

    this.container.appendChild(bubble);
  }

  updateBubbleIcon(bubble) {
    const iconMap = {
      'MessageCircle': '💬',
      'Bot': '🤖',
      'HeadphonesIcon': '🎧',
      'HelpCircle': '❓',
      'Mail': '✉️'
    };

    if (this.isOpen) {
      bubble.innerHTML = '✕';
    } else {
      bubble.innerHTML = iconMap[this.config.theme.bubbleIcon] || '💬';
    }
  }

  getBorderRadiusValue(radius) {
    const radiusMap = {
      'none': '0px',
      'sm': '4px',
      'md': '8px',
      'lg': '12px',
      'xl': '16px',
      'full': '50%'
    };
    return radiusMap[radius] || '50%';
  }

  createChatWindow() {
    const window = document.createElement('div');
    window.id = 'chatbot-window';
    window.style.cssText = `
      position: absolute;
      width: ${this.config.theme.windowWidth}px;
      height: ${this.config.theme.windowHeight}px;
      background: ${this.config.theme.windowBackgroundColor};
      border-radius: ${this.config.theme.windowBorderRadius}px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
      ${this.getWindowPosition()}
    `;

    // Header - Check if showTitleSection is explicitly true
    if (this.config
