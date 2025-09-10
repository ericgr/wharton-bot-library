/**
 * Custom Chatbot Embed Script V2
 * A comprehensive embeddable chatbot widget with full theming and feature support.
 */
class ChatbotWidget {
  constructor() {
    this.config = {};
    this.isOpen = false;
    this.messages = [];
    this.container = null;
    this.inputValue = '';
  }

  // --- Core Initialization ---
  init(options) {
    // 1. Merge Configurations
    this.mergeConfig(options);

    // 2. Inject Custom CSS
    if (this.config.theme.customCSS) {
      this.injectCustomCSS(this.config.theme.customCSS);
    }

    // 3. Build the Chatbot UI
    this.createChatbot();

    // 4. Handle Auto-Open
    if (this.config.theme.autoOpenBot && this.config.theme.openDelay) {
      setTimeout(() => this.toggleChat(true), this.config.theme.openDelay);
    }
  }

  mergeConfig(options) {
    const defaultTheme = {
      // Bubble
      bubbleSize: 50,
      bubblePosition: 'bottom-right',
      bubbleColor: '#054785',
      // Window
      windowTitle: 'Chat with us',
      showTitleSection: true,
      windowBackgroundColor: '#ffffff',
      windowTextColor: '#333333',
      windowBorderRadius: 11,
      windowWidth: 400,
      windowHeight: 600,
      // Avatars
      showBotAvatar: true,
      showUserAvatar: true,
      avatarSize: 24,
      avatarBorderRadius: 6,
      // Messages
      botMessageBackgroundColor: '#f5f5f5',
      botMessageTextColor: '#333333',
      userMessageBackgroundColor: '#e3f2fd',
      userMessageTextColor: '#1976d2',
      messageBorderRadius: 6,
      // Input
      placeholderText: 'How can I assist you?',
      sendButtonColor: '#054785',
      maxCharacters: 75,
      maxCharactersWarning: 'Character limit exceeded.',
      // Footer
      showFooter: false,
      footerText: 'Powered by Wharton',
    };

    const tempConfig = { ...this.config, ...options };
    tempConfig.theme = { ...defaultTheme, ...options.theme };
    this.config = tempConfig;

    // --- Compatibility Fixes ---
    // Handle alternate naming from different builder versions
    if (this.config.theme.titleText) this.config.theme.windowTitle = this.config.theme.titleText;
    if (this.config.theme.titleTextColor) this.config.theme.windowTextColor = this.config.theme.titleTextColor;
    if (this.config.theme.backgroundColor) {
      this.config.theme.bubbleColor = this.config.theme.backgroundColor;
      this.config.theme.windowBackgroundColor = this.config.theme.backgroundColor;
    }
    if (this.config.theme.maxCharactersWarningMessage) {
        this.config.theme.maxCharactersWarning = this.config.theme.maxCharactersWarningMessage;
    }
  }

  // --- UI Creation ---
  createChatbot() {
    this.container = document.createElement('div');
    this.container.id = 'chatbot-widget';
    document.body.appendChild(this.container);

    this.createChatWindow();
    this.createBubbleButton();
    
    // Set initial message from theme if available
    const initialMessage = this.config.theme.welcomeMessage || 'Hello! How can I help you today?';
    this.messages.push({ type: 'bot', content: initialMessage });
    
    this.updateMessages();
  }

  createBubbleButton() {
    const bubble = document.createElement('button');
    bubble.id = 'chatbot-bubble';
    this.container.appendChild(bubble);
    this.updateBubbleIcon(bubble);
    bubble.addEventListener('click', () => this.toggleChat());
  }
  
  createChatWindow() {
    const window = document.createElement('div');
    window.id = 'chatbot-window';
    window.innerHTML = `
      ${this.config.theme.showTitleSection ? this.createHeader() : ''}
      <div id="chatbot-messages"></div>
      <div id="starter-prompts-container"></div>
      <div id="input-area-container"></div>
      ${this.config.theme.showFooter ? this.createFooter() : ''}
    `;
    this.container.appendChild(window);
    this.createInputArea();
    this.createStarterPrompts();
    this.applyStyles();
  }

  createHeader() {
    return `
      <div id="chatbot-header">
        <div id="chatbot-title">
          <span id="chatbot-header-icon">${this.getIconSVG('bot')}</span>
          <span id="chatbot-header-text">${this.config.theme.windowTitle}</span>
        </div>
        <div id="chatbot-header-buttons">
          <button id="chatbot-clear">${this.getIconSVG('rotate-ccw')}</button>
          <button id="chatbot-close">${this.getIconSVG('chevron-down')}</button>
        </div>
      </div>
    `;
  }
  
  createInputArea() {
    const container = document.getElementById('input-area-container');
    container.innerHTML = `
      <div id="chatbot-input-wrapper">
        <textarea id="chatbot-input" placeholder="${this.config.theme.placeholderText}" rows="1"></textarea>
        <button id="chatbot-send">${this.getIconSVG('send')}</button>
      </div>
      <div id="character-warning"></div>
    `;
    this.addInputListeners();
  }

  createStarterPrompts() {
      // Implementation for starter prompts if needed in the future
  }

  createFooter() {
    return `<div id="chatbot-footer">${this.config.theme.footerText}</div>`;
  }

  // --- Styling and DOM Updates ---
  applyStyles() {
    const theme = this.config.theme;
    const style = document.createElement('style');
    style.textContent = `
      #chatbot-widget { position: fixed; bottom: 20px; right: 20px; z-index: 9999; }
      #chatbot-bubble { width: ${theme.bubbleSize}px; height: ${theme.bubbleSize}px; background: ${theme.bubbleColor}; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.2s; }
      #chatbot-window { display: none; width: ${theme.windowWidth}px; height: ${theme.windowHeight}px; background: ${theme.windowBackgroundColor}; border-radius: ${theme.windowBorderRadius}px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); flex-direction: column; overflow: hidden; position: absolute; bottom: ${theme.bubbleSize + 10}px; right: 0; }
      #chatbot-window.open { display: flex; }
      #chatbot-header { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #e5e7eb; color: ${theme.windowTextColor}; }
      #chatbot-title { display: flex; align-items: center; gap: 8px; font-weight: 600; }
      #chatbot-header-buttons button { background: none; border: none; cursor: pointer; color: inherit; padding: 4px; }
      #chatbot-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
      .message { display: flex; gap: 8px; max-width: 85%; }
      .message .avatar { width: ${theme.avatarSize}px; height: ${theme.avatarSize}px; border-radius: ${theme.avatarBorderRadius}px; flex-shrink: 0; background-size: cover; background-position: center; }
      .message .avatar.letter { display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; }
      .message .bubble { padding: 10px 14px; border-radius: ${theme.messageBorderRadius}px; line-height: 1.5; }
      .message.bot { align-self: flex-start; }
      .message.bot .bubble { background: ${theme.botMessageBackgroundColor}; color: ${theme.botMessageTextColor}; }
      .message.user { align-self: flex-end; flex-direction: row-reverse; }
      .message.user .bubble { background: ${theme.userMessageBackgroundColor}; color: ${theme.userMessageTextColor}; }
      #chatbot-input-wrapper { display: flex; align-items: center; padding: 10px; border-top: 1px solid #e5e7eb; }
      #chatbot-input { flex: 1; border: none; outline: none; resize: none; font-size: 16px; background: transparent; }
      #chatbot-send { background: ${theme.sendButtonColor}; color: white; border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
      #character-warning { color: red; font-size: 12px; padding: 0 12px 8px; text-align: right; display: none; }
      #chatbot-footer { padding: 8px; text-align: center; font-size: 12px; color: #666; background: #f9f9f9; }
    `;
    document.head.appendChild(style);
    if (theme.customCSS) this.injectCustomCSS(theme.customCSS);
  }

  updateBubbleIcon(bubbleElement) {
    const theme = this.config.theme;
    if (this.isOpen) {
      bubbleElement.innerHTML = this.getIconSVG('close');
    } else if (theme.customIconUrl) {
      bubbleElement.innerHTML = `<img src="${theme.customIconUrl}" alt="Chat" style="width:60%; height:60%;" />`;
    } else {
      bubbleElement.innerHTML = this.getIconSVG('message-circle');
    }
  }

  updateMessages() {
    const messagesContainer = document.getElementById('chatbot-messages');
    messagesContainer.innerHTML = '';
    const theme = this.config.theme;

    this.messages.forEach(msg => {
      const messageEl = document.createElement('div');
      messageEl.className = `message ${msg.type}`;
      
      let avatarHtml = '';
      if ((msg.type === 'bot' && theme.showBotAvatar) || (msg.type === 'user' && theme.showUserAvatar)) {
        const avatarUrl = msg.type === 'bot' ? theme.botAvatarUrl : theme.userAvatarUrl;
        if (avatarUrl) {
          avatarHtml = `<div class="avatar" style="background-image: url('${avatarUrl}')"></div>`;
        } else {
          const letter = msg.type === 'bot' ? 'B' : 'U';
          const bgColor = msg.type === 'bot' ? '#6b7280' : '#3b82f6';
          avatarHtml = `<div class="avatar letter" style="background-color: ${bgColor}">${letter}</div>`;
        }
      }
      
      messageEl.innerHTML = `${avatarHtml}<div class="bubble">${msg.content}</div>`;
      messagesContainer.appendChild(messageEl);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  updateCharacterWarning() {
    const warningEl = document.getElementById('character-warning');
    const charCount = this.inputValue.length;
    const limit = this.config.theme.maxCharacters;
    if (charCount > limit) {
      warningEl.textContent = this.config.theme.maxCharactersWarning;
      warningEl.style.display = 'block';
    } else {
      warningEl.style.display = 'none';
    }
  }
  
  // --- Event Handling ---
  toggleChat(forceOpen = false) {
    this.isOpen = forceOpen ? true : !this.isOpen;
    document.getElementById('chatbot-window').classList.toggle('open', this.isOpen);
    this.updateBubbleIcon(document.getElementById('chatbot-bubble'));
  }

  addInputListeners() {
    const input = document.getElementById('chatbot-input');
    const sendButton = document.getElementById('chatbot-send');
    const clearButton = document.getElementById('chatbot-clear');
    const closeButton = document.getElementById('chatbot-close');

    input.addEventListener('input', e => {
        this.inputValue = e.target.value;
        this.updateCharacterWarning();
    });
    input.addEventListener('keypress', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    });
    sendButton.addEventListener('click', () => this.sendMessage());
    clearButton.addEventListener('click', () => this.clearChat());
    closeButton.addEventListener('click', () => this.toggleChat(false));
  }

  sendMessage() {
    if (!this.inputValue.trim() || this.inputValue.length > this.config.theme.maxCharacters) return;
    this.messages.push({ type: 'user', content: this.inputValue });
    this.updateMessages();
    this.sendToWebhook(this.inputValue);
    this.inputValue = '';
    document.getElementById('chatbot-input').value = '';
    this.updateCharacterWarning();
  }
  
  clearChat() {
      const initialMessage = this.config.theme.welcomeMessage || 'Hello! How can I help you today?';
      this.messages = [{ type: 'bot', content: initialMessage }];
      this.updateMessages();
  }

  // --- Data and API ---
  async sendToWebhook(message) {
    try {
      if (!this.config.chatbotId || !this.config.routingUrl) throw new Error('Chatbot not configured.');
      
      const response = await fetch(`${this.config.routingUrl}/${this.config.chatbotId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: message, ...this.config.metadata })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'API Error');

      const botResponse = data.output || 'Sorry, I encountered an issue.';
      this.messages.push({ type: 'bot', content: botResponse });
      this.updateMessages();

    } catch (error) {
      console.error('Webhook Error:', error);
      this.messages.push({ type: 'bot', content: 'Sorry, I couldn\'t connect. Please try again.' });
      this.updateMessages();
    }
  }
  
  // --- Utilities ---
  injectCustomCSS(css) {
    const style = document.createElement('style');
    style.id = 'chatbot-custom-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  getIconSVG(name) {
    const icons = {
      'bot': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>',
      'message-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>',
      'chevron-down': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
      'close': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
      'send': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
      'rotate-ccw': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    };
    return icons[name] || '';
  }
}

// --- Global Initialization ---
window.Chatbot = new ChatbotWidget();
