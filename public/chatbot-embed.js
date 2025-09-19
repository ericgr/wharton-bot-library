/**
 * Custom Chatbot Embed Script V17 (Final with Pardot Integration)
 * A comprehensive embeddable chatbot widget with full feature and theming support.
 */
class ChatbotWidget {
  constructor() {
    // State properties
    this.config = {};
    this.isOpen = false;
    this.messages = [];
    this.container = null;
    this.inputValue = '';
    this.sessionId = null;
    // Drag/Resize properties
    this.isResizing = false;
    this.isDragging = false;
    this.initialX = 0;
    this.initialY = 0;
    this.initialWidth = 0;
    this.initialHeight = 0;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
  }

  // --- Core Initialization ---
  init(options) {
    this.mergeConfig(options);
    this.initializeSession(); 
    
    // Add the visitor ID to the metadata if found
    this.config.metadata = this.config.metadata || {};
    this.config.metadata.cookie_visitor_id = this.getVisitorIdCookie();
    
    this.loadMessages();
    this.createChatbot();

    const wasOpen = localStorage.getItem(`chatbot_open_${this.sessionId}`) === 'true';
    if (wasOpen) {
      this.toggleChat(true);
    }
    
    if (!wasOpen && this.config.theme.autoOpenBot) {
      setTimeout(() => this.toggleChat(true), this.config.theme.openDelay * 1000);
    }
  }

  mergeConfig(options) {
    const defaultTheme = {
      fontSize: 16,
      // Bubble
      bubbleSize: 50,
      bottomPosition: 20,
      rightPosition: 20,
      backgroundColor: '#054785',
      customIconUrl: null,
      customIconSize: 60,
      borderRadiusStyle: 'rounded',
      // Tooltip
      showTooltip: true,
      tooltipMessage: 'Hi! How can I help?',
      // Window
      titleText: 'WEMBA Digital Assistant',
      welcomeMessage: 'Hello! How can I help you?',
      windowWidth: 400,
      windowHeight: 600,
      showTitleSection: true,
      titleTextColor: '#ffffff',
      backgroundColorWindow: '#ffffff',
      windowBorderRadius: 11,
      // Avatars
      showBotAvatar: true,
      showUserAvatar: true,
      botAvatarUrl: null,
      userAvatarUrl: null,
      avatarSize: 24,
      avatarBorderRadius: 6,
      // Messages
      botMessageBackgroundColor: '#f5f5f5',
      botMessageTextColor: '#333333',
      userMessageBackgroundColor: '#e3f2fd',
      userMessageTextColor: '#1976d2',
      messageBorderRadius: 6,
      renderHtml: true,
      // Input
      placeholderText: 'How can I assist you?',
      sendButtonColor: '#054785',
      textInputBackgroundColor: '#ffffff',
      textInputTextColor: '#333333',
      textInputBorderRadius: 6,
      maxCharacters: 75,
      maxCharactersWarning: 'Character limit exceeded.',
      autoFocusInput: true,
      // Footer
      showFooter: false,
      footerText: 'Powered by Wharton',
      // Advanced
      customCSS: '',
      webhookUrl: null,
      customErrorMessage: 'Sorry, I couldn\'t connect. Please try again.',
    };

    const tempConfig = { ...this.config, ...options };
    tempConfig.theme = { ...defaultTheme, ...options.theme };
    this.config = tempConfig;

    // --- Compatibility Fixes ---
    if (this.config.theme.titleText) this.config.theme.windowTitle = this.config.theme.titleText;
    if (this.config.theme.titleTextColor) this.config.theme.windowTextColor = this.config.theme.titleTextColor;
    if (this.config.theme.backgroundColor) this.config.theme.bubbleColor = this.config.theme.backgroundColor;
  }

  // --- UI Creation ---
  createChatbot() {
    this.container = document.createElement('div');
    this.container.id = 'chatbot-root';
    document.body.appendChild(this.container);

    this.createChatWindow();
    this.createBubble();
    this.createTooltip();
    this.applyStyles();
    this.addEventListeners();
    
    if (this.messages.length === 0) {
        const initialMessage = this.config.theme.welcomeMessage || 'Hello! How can I help you today?';
        this.messages.push({ type: 'bot', content: initialMessage });
    }
    this.updateMessages();
    this.updateCharacterCounter();
  }

  createBubble() {
    const bubble = document.createElement('button');
    bubble.id = 'chatbot-bubble';
    this.container.appendChild(bubble);
    this.updateBubbleIcon();
  }

  createTooltip() {
    if (!this.config.theme.showTooltip) return;
    const tooltip = document.createElement('div');
    tooltip.id = 'chatbot-tooltip';
    tooltip.textContent = this.config.theme.tooltipMessage;
    this.container.appendChild(tooltip);
  }

  createChatWindow() {
    const windowEl = document.createElement('div');
    windowEl.id = 'chatbot-window';
    windowEl.innerHTML = `
      ${this.config.theme.showTitleSection ? this.createHeader() : ''}
      <div id="chatbot-messages"></div>
      <div id="starter-prompts"></div>
      <div id="input-area-wrapper">
        <div id="input-area">
          <textarea id="chatbot-input" placeholder="${this.config.theme.placeholderText}" rows="1"></textarea>
          <button id="chatbot-send" title="Send Message">${this.getIconSVG('send')}</button>
        </div>
        <div id="character-counter"></div>
      </div>
      ${this.config.theme.showFooter ? `<div id="chatbot-footer">${this.config.theme.footerText}</div>` : ''}
    `;
    this.container.appendChild(windowEl);
    this.createStarterPrompts();
  }

  createHeader() {
    const theme = this.config.theme;
    let iconHtml = theme.customIconUrl 
        ? `<img src="${theme.customIconUrl}" alt="Chatbot Icon" id="chatbot-header-icon-img" />`
        : this.getIconSVG('bot');

    return `
      <div id="chatbot-header">
        <div id="chatbot-resize-handle"></div>
        <div id="chatbot-title">
          ${iconHtml}
          <span id="chatbot-header-text">${theme.windowTitle}</span>
        </div>
        <div id="chatbot-header-buttons">
          <button id="chatbot-clear" title="Clear Chat">${this.getIconSVG('rotate-ccw')}</button>
          <button id="chatbot-close" title="Close Chat">${this.getIconSVG('close-window')}</button>
        </div>
      </div>
    `;
  }

  createStarterPrompts() {
      const promptsContainer = document.getElementById('starter-prompts');
      const prompts = this.config.theme.starterPrompts || [];
      if (prompts.length === 0) {
        promptsContainer.style.display = 'none';
        return;
      };
      promptsContainer.innerHTML = prompts.map(p => `<button class="starter-prompt">${p}</button>`).join('');
  }

  // --- Styling and DOM Updates ---
  applyStyles() {
    const theme = this.config.theme;
    const style = document.createElement('style');
    style.textContent = `
      #chatbot-root { position: fixed; bottom: ${theme.bottomPosition}px; right: ${theme.rightPosition}px; z-index: 2147483647; font-size: 16px; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
      #chatbot-root *, #chatbot-root *::before, #chatbot-root *::after { box-sizing: border-box; }
      #chatbot-root #chatbot-bubble { width: ${theme.bubbleSize}px; height: ${theme.bubbleSize}px; background: ${theme.bubbleColor}; border-radius: ${this.getBorderRadiusValue(theme.borderRadiusStyle)}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.2s; }
      #chatbot-root #chatbot-window { display: none; width: ${theme.windowWidth}px; height: ${theme.windowHeight}px; background: ${theme.backgroundColorWindow}; border-radius: ${theme.windowBorderRadius}px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); flex-direction: column; overflow: hidden; position: absolute; bottom: ${theme.bubbleSize + 10}px; right: 0; }
      #chatbot-root #chatbot-window.open { display: flex; }
      #chatbot-root #chatbot-header { position: relative; display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${theme.backgroundColor}; color: ${theme.titleTextColor}; flex-shrink: 0; cursor: move; }
      #chatbot-root #chatbot-resize-handle { position: absolute; top: 0; left: 0; width: 10px; height: 10px; cursor: nwse-resize; opacity: 0.2; }
      #chatbot-root #chatbot-title { display: flex; align-items: center; gap: 8px; font-weight: 600; }
      #chatbot-root #chatbot-header-icon-img { width: 24px; height: 24px; }
      #chatbot-root #chatbot-header-buttons button { background: none; border: none; cursor: pointer; color: inherit; padding: 4px; opacity: 0.8; }
      #chatbot-root #chatbot-header-buttons button:hover { opacity: 1; }
      #chatbot-root #chatbot-messages { flex: 1; overflow-y: ${theme.showScrollbar ? 'scroll' : 'auto'}; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
      #chatbot-root .message { display: flex; gap: 8px; max-width: 85%; }
      #chatbot-root .message .avatar { width: ${theme.avatarSize}px; height: ${theme.avatarSize}px; border-radius: ${theme.avatarBorderRadius}px; flex-shrink: 0; background-size: cover; background-position: center; }
      #chatbot-root .message .avatar.letter { display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; }
      #chatbot-root .message .bubble { padding: 10px 14px; border-radius: ${theme.messageBorderRadius}px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; font-size: 14px; }
      #chatbot-root .message .bubble p { margin-top: 0; margin-bottom: 8px; }
      #chatbot-root .message .bubble p:last-child { margin-bottom: 0; }
      #chatbot-root .message .bubble strong, #chatbot-root .message .bubble b { font-size: inherit; font-weight: bold; }
      #chatbot-root .message .bubble ul { padding-left: 20px; margin: 8px 0; }
      #chatbot-root .message .bubble li { padding: 0; margin-bottom: 4px; list-style-type: disc; }
      #chatbot-root .message.bot { align-self: flex-start; }
      #chatbot-root .message.bot .bubble { background: ${theme.botMessageBackgroundColor}; color: ${theme.botMessageTextColor}; }
      #chatbot-root .message.user { align-self: flex-end; flex-direction: row-reverse; }
      #chatbot-root .message.user .bubble { background: ${theme.userMessageBackgroundColor}; color: ${theme.userMessageTextColor}; }
      #chatbot-root #starter-prompts { padding: 0 16px 8px; display: flex; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid #e5e7eb; }
      #chatbot-root .starter-prompt { display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; font-weight: 500; border: 1px solid #e5e7eb; background: transparent; transition: all 0.2s; border-radius: 6px; font-size: 12px; height: auto; padding: 4px 8px; color: ${theme.botMessageTextColor}; cursor: pointer; }
      #chatbot-root .starter-prompt:hover { background: #f3f4f6; }
      #chatbot-root #input-area-wrapper { flex-shrink: 0; background: ${theme.textInputBackgroundColor}; border-top: 1px solid #e5e7eb; }
      #chatbot-root #input-area { display: flex; align-items: flex-end; padding: 10px; }
      #chatbot-root #chatbot-input { flex-grow: 1; border: 1px solid #ccc; border-radius: ${theme.textInputBorderRadius}px; padding: 8px; outline: none; resize: none; font: 14px ui-sans-serif, system-ui, sans-serif; color: ${theme.textInputTextColor}; background: transparent; max-height: 100px; line-height: 1.4; }
      #chatbot-root #chatbot-send { background: ${theme.sendButtonColor}; color: white; border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; margin-left: 8px; }
      #chatbot-root #character-counter { font-size: 12px; color: #65758b; padding: 0 12px 8px; text-align: right; }
      #chatbot-root #character-counter.error { color: red; }
      #chatbot-root #chatbot-tooltip { display: none; position: absolute; right: ${theme.bubbleSize + 10}px; bottom: 50%; transform: translateY(50%); background: ${theme.tooltipBackgroundColor}; color: ${theme.tooltipTextColor}; padding: 8px 12px; border-radius: 6px; font-size: 15px; white-space: nowrap; }
      #chatbot-root #chatbot-bubble:hover + #chatbot-tooltip { display: block; }
      #chatbot-root #chatbot-footer { padding: 8px; text-align: center; font-size: 12px; color: ${theme.footerTextColor}; background: ${theme.footerBackgroundColor}; border-top: 1px solid #e5e7eb; }
      #chatbot-root .typing-indicator { display: flex; align-items: center; justify-content: center; padding: 10px; }
      #chatbot-root .typing-indicator span { height: 8px; width: 8px; background: #9ca3af; border-radius: 50%; margin: 0 2px; animation: typing-blink 1.4s infinite both; }
      #chatbot-root .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
      #chatbot-root .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typing-blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
    `;
    document.head.appendChild(style);
    if (theme.customCSS) this.injectCustomCSS(theme.customCSS);
  }

  updateBubbleIcon() {
    const bubbleElement = document.getElementById('chatbot-bubble');
    const theme = this.config.theme;
    if (this.isOpen) {
      bubbleElement.innerHTML = this.getIconSVG('close');
    } else if (theme.customIconUrl) {
      const iconSize = theme.customIconSize || 60;
      bubbleElement.innerHTML = `<img src="${theme.customIconUrl}" alt="Chat" style="max-width: ${iconSize}%; max-height: ${iconSize}%;" />`;
    } else {
      bubbleElement.innerHTML = this.getIconSVG('message-circle');
    }
  }

  updateMessages() {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) return;
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
      
      const bubble = document.createElement('div');
      bubble.className = 'bubble';

      if (msg.thinking) {
        bubble.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
      } else if (theme.renderHtml) {
        bubble.innerHTML = msg.content || '';
      } else {
        bubble.textContent = msg.content;
      }
      
      messageEl.innerHTML = avatarHtml;
      messageEl.appendChild(bubble);
      messagesContainer.appendChild(messageEl);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    this.saveMessages();
  }
  
  updateCharacterCounter() {
    const counterEl = document.getElementById('character-counter');
    if (!counterEl) return;
    const charCount = this.inputValue.length;
    const limit = this.config.theme.maxCharacters;
    if (limit > 0) {
        counterEl.textContent = `${charCount}/${limit} characters`;
        counterEl.classList.toggle('error', charCount > limit);
    } else {
        counterEl.textContent = '';
    }
  }
  
  // --- Event Handling ---
  addEventListeners() {
    document.getElementById('chatbot-bubble').addEventListener('click', () => this.toggleChat());
    document.getElementById('chatbot-close').addEventListener('click', () => this.toggleChat(false));
    document.getElementById('chatbot-clear').addEventListener('click', () => this.clearChat());
    
    const input = document.getElementById('chatbot-input');
    input.addEventListener('input', e => { 
        this.inputValue = e.target.value; 
        this.updateCharacterCounter();
        e.target.style.height = 'auto';
        e.target.style.height = (e.target.scrollHeight) + 'px';
    });
    input.addEventListener('keypress', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); } });
    
    document.getElementById('chatbot-send').addEventListener('click', () => this.sendMessage());
    
    document.getElementById('starter-prompts').addEventListener('click', e => {
      if (e.target.classList.contains('starter-prompt')) {
        this.inputValue = e.target.textContent;
        this.sendMessage();
      }
    });
    
    const bubble = document.getElementById('chatbot-bubble');
    const tooltip = document.getElementById('chatbot-tooltip');
    if (tooltip) {
        bubble.addEventListener('mouseenter', () => { if (!this.isOpen) tooltip.style.display = 'block'; });
        bubble.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
    }

    const resizeHandle = document.getElementById('chatbot-resize-handle');
    const header = document.getElementById('chatbot-header');
    resizeHandle.addEventListener('mousedown', this.onResizeStart.bind(this));
    header.addEventListener('mousedown', this.onDragStart.bind(this));
    
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            this.reinitStateAfterBfcache();
        }
    });
  }
  
  toggleChat(forceOpen = null) {
    this.isOpen = forceOpen !== null ? forceOpen : !this.isOpen;
    document.getElementById('chatbot-window').classList.toggle('open', this.isOpen);
    this.updateBubbleIcon();
    
    localStorage.setItem(`chatbot_open_${this.sessionId}`, this.isOpen);

    const tooltip = document.getElementById('chatbot-tooltip');
    if (tooltip && this.isOpen) {
        tooltip.style.display = 'none';
    }

    if (this.isOpen && this.config.theme.autoFocusInput) {
      setTimeout(() => document.getElementById('chatbot-input').focus(), 100);
    }
  }

  sendMessage() {
    if (!this.inputValue.trim() || (this.config.theme.maxCharacters > 0 && this.inputValue.length > this.config.theme.maxCharacters)) return;
    this.messages.push({ type: 'user', content: this.inputValue });
    this.messages.push({ type: 'bot', thinking: true, content: '' });
    this.updateMessages();
    this.sendToWebhook(this.inputValue);
    const input = document.getElementById('chatbot-input');
    this.inputValue = '';
    input.value = '';
    input.style.height = 'auto';
    this.updateCharacterCounter();
  }
  
  clearChat() {
      const initialMessage = this.config.theme.welcomeMessage || 'Hello! How can I help you today?';
      this.messages = [{ type: 'bot', content: initialMessage }];
      this.updateMessages();
  }
  
  reinitStateAfterBfcache() {
      console.log('Page loaded from back-forward cache. Re-initializing chatbot state.');
      this.loadMessages();
      this.updateMessages();
      const wasOpen = localStorage.getItem(`chatbot_open_${this.sessionId}`) === 'true';
      if (this.isOpen !== wasOpen) {
          this.toggleChat(wasOpen);
      }
  }

  // --- Drag and Resize Handlers ---
  onResizeStart(e) {
      e.preventDefault(); e.stopPropagation();
      this.isResizing = true;
      const windowEl = document.getElementById('chatbot-window');
      this.initialX = e.clientX; this.initialY = e.clientY;
      this.initialWidth = windowEl.offsetWidth; this.initialHeight = windowEl.offsetHeight;
      this.onResizeMove = this.onResizeMove.bind(this);
      this.onResizeEnd = this.onResizeEnd.bind(this);
      document.addEventListener('mousemove', this.onResizeMove);
      document.addEventListener('mouseup', this.onResizeEnd);
  }

  onResizeMove(e) {
      if (!this.isResizing) return;
      const windowEl = document.getElementById('chatbot-window');
      const dx = e.clientX - this.initialX; const dy = e.clientY - this.initialY;
      const newWidth = this.initialWidth - dx; const newHeight = this.initialHeight - dy;
      if (newWidth > 300) windowEl.style.width = `${newWidth}px`;
      if (newHeight > 200) windowEl.style.height = `${newHeight}px`;
  }

  onResizeEnd() {
      this.isResizing = false;
      document.removeEventListener('mousemove', this.onResizeMove);
      document.removeEventListener('mouseup', this.onResizeEnd);
  }

  onDragStart(e) {
      if (e.target.closest('button') || e.target.id === 'chatbot-resize-handle') return;
      e.preventDefault();
      this.isDragging = true;
      const rootEl = document.getElementById('chatbot-root');
      this.dragOffsetX = e.clientX - rootEl.offsetLeft; this.dragOffsetY = e.clientY - rootEl.offsetTop;
      this.onDragMove = this.onDragMove.bind(this);
      this.onDragEnd = this.onDragEnd.bind(this);
      document.addEventListener('mousemove', this.onDragMove);
      document.addEventListener('mouseup', this.onDragEnd);
  }
  
  onDragMove(e) {
      if (!this.isDragging) return;
      const rootEl = document.getElementById('chatbot-root');
      rootEl.style.right = 'auto'; rootEl.style.bottom = 'auto';
      rootEl.style.left = `${e.clientX - this.dragOffsetX}px`;
      rootEl.style.top = `${e.clientY - this.dragOffsetY}px`;
  }
  
  onDragEnd() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.onDragMove);
      document.removeEventListener('mouseup', this.onDragEnd);
  }
  
  // --- Data and API ---
  initializeSession() {
    this.sessionId = localStorage.getItem(`chatbot_session_${this.config.chatbotId}`);
    if (!this.sessionId) {
      this.sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(`chatbot_session_${this.config.chatbotId}`, this.sessionId);
    }
  }

  saveMessages() {
    localStorage.setItem(`chatbot_messages_${this.sessionId}`, JSON.stringify(this.messages));
  }

  loadMessages() {
    const saved = localStorage.getItem(`chatbot_messages_${this.sessionId}`);
    if (saved) {
        try { this.messages = JSON.parse(saved); }
        catch (e) { this.messages = []; }
    }
  }

  async sendToWebhook(message) {
    try {
      if (!this.config.chatbotId || !this.config.routingUrl) throw new Error('Chatbot not configured.');
      
      const response = await fetch(`${this.config.routingUrl}/${this.config.chatbotId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: message, sessionId: this.sessionId, ...this.config.metadata })
      });
      
      this.messages = this.messages.filter(m => !m.thinking);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'API Error');

      const botResponse = data.output || 'Sorry, I encountered an issue.';
      this.messages.push({ type: 'bot', content: botResponse });
      this.updateMessages();
    } catch (error) {
      console.error('Webhook Error:', error);
      this.messages = this.messages.filter(m => !m.thinking);
      this.messages.push({ type: 'bot', content: this.config.theme.customErrorMessage });
      this.updateMessages();
    }
  }
  
  // --- Utilities ---
  getVisitorIdCookie() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        // Pardot cookies typically start with 'visitor_id'
        if (cookie.startsWith('visitor_id')) {
            return cookie.split('=')[1];
        }
    }
    return null;
  }

  injectCustomCSS(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  getBorderRadiusValue(style) {
      const map = { rounded: '16px', circle: '50%', none: '0px' };
      return map[style] || '50%';
  }

  getIconSVG(name) {
    const theme = this.config.theme;
    const iconColor = (name === 'send' || name === 'close-window' || name === 'rotate-ccw' || name === 'bot') ? theme.titleTextColor : 'white';
    const icons = {
      'bot': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
      'message-circle': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>`,
      'close': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
      'send': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
      'rotate-ccw': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
      'close-window': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`
    };
    return icons[name] || '';
  }
}

// --- Global Initialization ---
window.Chatbot = new ChatbotWidget();
