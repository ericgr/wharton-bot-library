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
    this.config = {
      // Default configuration
      n8nChatUrl: '',
      metadata: {},
      theme: {
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
      },
      ...options
    };

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

    // Create tooltip
    if (this.config.theme.showTooltip) {
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
    const position = this.config.theme.bubblePosition;
    const bubbleSize = this.config.theme.bubbleSize;
    
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

    // Header
    if (this.config.theme.showTitleSection) {
      const header = this.createHeader();
      window.appendChild(header);
    }

    // Messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.id = 'chatbot-messages';
    messagesContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;
    window.appendChild(messagesContainer);

    // Starter prompts
    if (this.config.theme.starterPrompts && this.config.theme.starterPrompts.length > 0) {
      const promptsContainer = this.createStarterPrompts();
      window.appendChild(promptsContainer);
    }

    // Input area
    const inputArea = this.createInputArea();
    window.appendChild(inputArea);

    // Footer
    if (this.config.theme.showFooter) {
      const footer = this.createFooter();
      window.appendChild(footer);
    }

    this.container.appendChild(window);
  }

  getWindowPosition() {
    const position = this.config.theme.bubblePosition;
    const bubbleSize = this.config.theme.bubbleSize;
    const windowHeight = this.config.theme.windowHeight;
    
    if (position.includes('bottom')) {
      return `bottom: ${bubbleSize + 10}px;`;
    } else {
      return `top: ${bubbleSize + 10}px;`;
    }
  }

  createHeader() {
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 12px;
      background: ${this.config.theme.windowBackgroundColor};
    `;

    const iconMap = {
      'Bot': '🤖',
      'MessageCircle': '💬',
      'HeadphonesIcon': '🎧'
    };

    header.innerHTML = `
      <span style="font-size: 20px;">${iconMap[this.config.theme.windowIcon] || '🤖'}</span>
      <span style="font-weight: 600; color: ${this.config.theme.windowTextColor}; flex: 1;">
        ${this.config.theme.windowTitle}
      </span>
      <button id="chatbot-close" style="
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #6b7280;
        padding: 4px;
      ">✕</button>
    `;

    header.querySelector('#chatbot-close').addEventListener('click', () => this.toggleChat());
    return header;
  }

  createStarterPrompts() {
    const container = document.createElement('div');
    container.style.cssText = `
      padding: 0 16px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    this.config.theme.starterPrompts.forEach(prompt => {
      const button = document.createElement('button');
      button.style.cssText = `
        padding: 8px 12px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        text-align: left;
        cursor: pointer;
        font-size: 14px;
        color: ${this.config.theme.windowTextColor};
        transition: background-color 0.2s;
      `;
      button.textContent = prompt;
      button.addEventListener('click', () => this.sendMessage(prompt));
      container.appendChild(button);
    });

    return container;
  }

  createInputArea() {
    const container = document.createElement('div');
    container.style.cssText = `
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
      align-items: end;
    `;

    const input = document.createElement('textarea');
    input.id = 'chatbot-input';
    input.placeholder = this.config.theme.placeholderText;
    input.style.cssText = `
      flex: 1;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      resize: none;
      font-size: 14px;
      font-family: inherit;
      max-height: 100px;
      min-height: 40px;
    `;

    const sendButton = document.createElement('button');
    sendButton.style.cssText = `
      background: ${this.config.theme.sendButtonColor};
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 16px;
      cursor: pointer;
      font-size: 16px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    sendButton.innerHTML = '→';

    // Character warning
    const warningDiv = document.createElement('div');
    warningDiv.id = 'character-warning';
    warningDiv.style.cssText = `
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
      display: none;
    `;

    input.addEventListener('input', (e) => {
      this.inputValue = e.target.value;
      this.updateCharacterWarning();
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    sendButton.addEventListener('click', () => this.sendMessage());

    container.appendChild(input);
    container.appendChild(sendButton);
    
    const inputContainer = document.createElement('div');
    inputContainer.appendChild(container);
    inputContainer.appendChild(warningDiv);
    
    return inputContainer;
  }

  createFooter() {
    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 8px 16px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    `;

    footer.innerHTML = `
      <a href="${this.config.theme.footerLink}" target="_blank" style="
        color: #6b7280;
        text-decoration: none;
        font-size: 12px;
      ">${this.config.theme.footerText}</a>
    `;

    return footer;
  }

  updateCharacterWarning() {
    const warning = document.getElementById('character-warning');
    const input = document.getElementById('chatbot-input');
    
    if (this.config.theme.showCharacterWarning && 
        this.inputValue.length > this.config.theme.maxCharacters) {
      warning.textContent = this.config.theme.maxCharactersWarningMessage;
      warning.style.display = 'block';
      input.style.borderColor = '#ef4444';
    } else {
      warning.style.display = 'none';
      input.style.borderColor = '#e5e7eb';
    }
  }

  showTooltip() {
    const tooltip = document.getElementById('chatbot-tooltip');
    if (tooltip && !this.isOpen) {
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
    }
  }

  hideTooltip() {
    const tooltip = document.getElementById('chatbot-tooltip');
    if (tooltip) {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const window = document.getElementById('chatbot-window');
    const bubble = document.getElementById('chatbot-bubble');
    
    if (this.isOpen) {
      window.style.display = 'flex';
      this.hideTooltip();
      // Focus input
      setTimeout(() => {
        const input = document.getElementById('chatbot-input');
        if (input) input.focus();
      }, 100);
    } else {
      window.style.display = 'none';
    }
    
    this.updateBubbleIcon(bubble);
  }

  sendMessage(message = null) {
    const input = document.getElementById('chatbot-input');
    const messageText = message || this.inputValue || input?.value || '';
    
    if (!messageText.trim()) return;

    // Check character limit
    if (messageText.length > this.config.theme.maxCharacters) {
      return;
    }

    // Add user message
    this.messages.push({
      type: 'user',
      content: messageText,
      timestamp: new Date()
    });

    // Clear input
    this.inputValue = '';
    if (input) {
      input.value = '';
      this.updateCharacterWarning();
    }

    this.updateChatWindow();

    // Send to webhook if configured
    if (this.config.n8nChatUrl || this.config.theme.webhookUrl) {
      this.sendToWebhook(messageText);
    } else {
      // Simulate bot response
      setTimeout(() => {
        this.messages.push({
          type: 'bot',
          content: 'Thank you for your message! This is a demo response.',
          timestamp: new Date()
        });
        this.updateChatWindow();
      }, 1000);
    }
  }

  async sendToWebhook(message) {
    const webhookUrl = this.config.theme.webhookUrl || this.config.n8nChatUrl;
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          metadata: this.config.metadata,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          this.messages.push({
            type: 'bot',
            content: data.response,
            timestamp: new Date()
          });
          this.updateChatWindow();
        }
      }
    } catch (error) {
      console.error('Error sending message to webhook:', error);
      this.messages.push({
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      });
      this.updateChatWindow();
    }
  }

  updateChatWindow() {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = '';

    this.messages.forEach(msg => {
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = `
        display: flex;
        gap: 8px;
        ${msg.type === 'user' ? 'flex-direction: row-reverse;' : ''}
      `;

      // Avatar
      const avatar = document.createElement('div');
      avatar.style.cssText = `
        width: ${this.config.theme.avatarSize}px;
        height: ${this.config.theme.avatarSize}px;
        border-radius: ${this.config.theme.avatarBorderRadius}%;
        background: ${msg.type === 'user' ? '#3b82f6' : '#6b7280'};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      `;
      avatar.textContent = msg.type === 'user' ? 'U' : 'B';

      // Message bubble
      const bubble = document.createElement('div');
      bubble.style.cssText = `
        background: ${msg.type === 'user' ? '#3b82f6' : '#f3f4f6'};
        color: ${msg.type === 'user' ? 'white' : this.config.theme.windowTextColor};
        padding: 12px 16px;
        border-radius: ${this.config.theme.messageBorderRadius}px;
        max-width: 80%;
        font-size: 14px;
        line-height: 1.4;
      `;
      bubble.textContent = msg.content;

      messageDiv.appendChild(avatar);
      messageDiv.appendChild(bubble);
      messagesContainer.appendChild(messageDiv);
    });

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Export for use
window.Chatbot = new ChatbotWidget();

// Also support ES6 import
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.Chatbot;
}