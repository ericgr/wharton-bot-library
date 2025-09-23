/**
 * Custom Chatbot Embed Script V20 (Payload & Sanitizer Ready)
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
    // NEW: Mode properties
    this.mode = 'bubble'; // Default mode
    this.rootSelector = '#chatbot-root'; // Default CSS selector for the root element
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

    // NEW: Determine mode and set the root CSS selector
    this.mode = this.config.mode || 'bubble';
    this.rootSelector = this.mode === 'inpage' ? 'kmtbot-inpage' : '#chatbot-root';

    // NEW: Conditional rendering based on mode
    if (this.mode === 'inpage') {
      this.createInPageChat();
    } else {
      this.createBubbleChat();
    }

    // Add the visitor ID to the metadata if a cookie name is provided
    if (this.config.visitorCookieName) {
      this.config.metadata = this.config.metadata || {};
      this.config.metadata.cookie_visitor_id = this.getCookieByName(this.config.visitorCookieName);
    }

    // Load messages and render them
    this.loadMessages();
    if (this.messages.length === 0) {
      const initialMessage = this.config.theme.welcomeMessage || 'Hello! How can I help you today?';
      this.messages.push({ type: 'bot', content: initialMessage });
    }
    this.updateMessages();
    this.updateCharacterCounter();
    
    // NEW: State restoration logic specific to bubble mode
    if (this.mode === 'bubble') {
        const wasOpen = localStorage.getItem(`chatbot_open_${this.sessionId}`) === 'true';
        if (wasOpen) {
          this.toggleChat(true);
        }
        if (!wasOpen && this.config.theme.autoOpenBot) {
          setTimeout(() => this.toggleChat(true), this.config.theme.openDelay * 1000);
        }
    }
  }

  mergeConfig(options) {
    const defaultTheme = {
      fontSize: 16,
      bubbleSize: 50,
      bottomPosition: 20,
      rightPosition: 20,
      backgroundColor: '#054785',
      customIconUrl: null,
      customIconSize: 60,
      borderRadiusStyle: 'rounded',
      showTooltip: true,
      tooltipMessage: 'Hi! How can I help?',
      titleText: 'WEMBA Digital Assistant',
      welcomeMessage: 'Hello! How can I help you?',
      windowWidth: 400,
      windowHeight: 600,
      showTitleSection: true,
      titleTextColor: '#ffffff',
      backgroundColorWindow: '#ffffff',
      windowBorderRadius: 11,
      showBotAvatar: true,
      showUserAvatar: true,
      botAvatarUrl: null,
      userAvatarUrl: null,
      avatarSize: 24,
      avatarBorderRadius: 6,
      botMessageBackgroundColor: '#f5f5f5',
      botMessageTextColor: '#333333',
      userMessageBackgroundColor: '#e3f2fd',
      userMessageTextColor: '#1976d2',
      messageBorderRadius: 6,
      renderHtml: true,
      placeholderText: 'How can I assist you?',
      sendButtonColor: '#054785',
      textInputBackgroundColor: '#ffffff',
      textInputTextColor: '#333333',
      textInputBorderRadius: 6,
      maxCharacters: 75,
      maxCharactersWarning: 'Character limit exceeded.',
      autoFocusInput: true,
      showFooter: false,
      footerText: 'Powered by Wharton',
      customCSS: '',
      webhookUrl: null,
      customErrorMessage: 'Sorry, I couldn\'t connect. Please try again.',
    };

    const tempConfig = { ...this.config, ...options };
    tempConfig.theme = { ...defaultTheme, ...options.theme };
    tempConfig.metadata = { ...this.config.metadata, ...options.metadata };
    this.config = tempConfig;

    if (this.config.theme.titleText) this.config.theme.windowTitle = this.config.theme.titleText;
    if (this.config.theme.titleTextColor) this.config.theme.windowTextColor = this.config.theme.titleTextColor;
    if (this.config.theme.backgroundColor) this.config.theme.bubbleColor = this.config.theme.backgroundColor;
  }

  // --- UI Creation ---
  createBubbleChat() {
    this.container = document.createElement('div');
    this.container.id = 'chatbot-root';
    document.body.appendChild(this.container);

    this.createChatWindow();
    this.createBubble();
    this.createTooltip();
    this.applyStyles();
    this.addEventListeners();
  }
  
  createInPageChat() {
    this.container = document.querySelector('kmtbot-inpage');
    if (!this.container) {
      console.error('Chatbot Error: In-page mode requires a <kmtbot-inpage> element on the page.');
      return;
    }

    this.createChatWindow();
    this.applyStyles();
    this.addEventListeners();

    const windowEl = document.getElementById('chatbot-window');
    windowEl.style.display = 'flex';
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
        
    const headerButtons = this.mode === 'bubble' ? `
        <div id="chatbot-header-buttons">
            <button id="chatbot-clear" title="Clear Chat">${this.getIconSVG('rotate-ccw')}</button>
            <button id="chatbot-close" title="Close Chat">${this.getIconSVG('close-window')}</button>
        </div>` : `<div id="chatbot-header-buttons"><button id="chatbot-clear" title="Clear Chat">${this.getIconSVG('rotate-ccw')}</button></div>`;
    
    const resizeHandle = this.mode === 'bubble' ? `<div id="chatbot-resize-handle"></div>` : '';

    return `
      <div id="chatbot-header">
        ${resizeHandle}
        <div id="chatbot-title">
          ${iconHtml}
          <span id="chatbot-header-text">${theme.windowTitle}</span>
        </div>
        ${headerButtons}
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
    const bubbleModeStyles = `
      ${this.rootSelector} { position: fixed; bottom: ${theme.bottomPosition}px; right: ${theme.rightPosition}px; z-index: 2147483647; }
      ${this.rootSelector} #chatbot-bubble { width: ${theme.bubbleSize}px; height: ${theme.bubbleSize}px; background: ${theme.bubbleColor}; border-radius: ${this.getBorderRadiusValue(theme.borderRadiusStyle)}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.2s; }
      ${this.rootSelector} #chatbot-window { display: none; width: ${theme.windowWidth}px; height: ${theme.windowHeight}px; position: absolute; bottom: ${theme.bubbleSize + 10}px; right: 0; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
      ${this.rootSelector} #chatbot-window.open { display: flex; }
      ${this.rootSelector} #chatbot-header { cursor: move; }
      ${this.rootSelector} #chatbot-resize-handle { position: absolute; top: 0; left: 0; width: 10px; height: 10px; cursor: nwse-resize; opacity: 0.2; }
      ${this.rootSelector} #chatbot-tooltip { display: none; position: absolute; right: ${theme.bubbleSize + 10}px; bottom: 50%; transform: translateY(50%); background: ${theme.tooltipBackgroundColor}; color: ${theme.tooltipTextColor}; padding: 8px 12px; border-radius: 6px; font-size: 15px; white-space: nowrap; }
      ${this.rootSelector} #chatbot-bubble:hover + #chatbot-tooltip { display: block; }
    `;
    const inPageModeStyles = `
      ${this.rootSelector} { display: block; position: relative; width: 100%; height: 100%; min-height: 600px; }
      ${this.rootSelector} #chatbot-window { width: 100%; height: 100%; position: absolute; top: 0; left: 0; box-shadow: none; border: 1px solid #e5e7eb; }
    `;
    style.textContent = `
      ${this.rootSelector} { font-size: 16px; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
      ${this.rootSelector} *, ${this.rootSelector} *::before, ${this.rootSelector} *::after { box-sizing: border-box; }
      ${this.rootSelector} #chatbot-window { background: ${theme.backgroundColorWindow}; border-radius: ${theme.windowBorderRadius}px; flex-direction: column; overflow: hidden; }
      ${this.rootSelector} #chatbot-header { position: relative; display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${theme.backgroundColor}; color: ${theme.titleTextColor}; flex-shrink: 0; }
      ${this.rootSelector} #chatbot-title { display: flex; align-items: center; gap: 8px; font-weight: 600; }
      ${this.rootSelector} #chatbot-header-icon-img { width: 24px; height: 24px; }
      ${this.rootSelector} #chatbot-header-buttons button { background: none; border: none; cursor: pointer; color: inherit; padding: 4px; opacity: 0.8; }
      ${this.rootSelector} #chatbot-header-buttons button:hover { opacity: 1; }
      ${this.rootSelector} #chatbot-messages { flex: 1; overflow-y: ${theme.showScrollbar ? 'scroll' : 'auto'}; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
      ${this.rootSelector} .message { display: flex; gap: 8px; max-width: 85%; }
      ${this.rootSelector} .message .avatar { width: ${theme.avatarSize}px; height: ${theme.avatarSize}px; border-radius: ${theme.avatarBorderRadius}px; flex-shrink: 0; background-size: cover; background-position: center; }
      ${this.rootSelector} .message .avatar.letter { display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; }
      ${this.rootSelector} .message .bubble { padding: 10px 14px; border-radius: ${theme.messageBorderRadius}px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; font-size: 14px; }
      ${this.rootSelector} .message .bubble p { margin-top: 0; margin-bottom: 8px; }
      ${this.rootSelector} .message .bubble p:last-child { margin-bottom: 0; }
      ${this.rootSelector} .message.bot { align-self: flex-start; }
      ${this.rootSelector} .message.bot .bubble { background: ${theme.botMessageBackgroundColor}; color: ${theme.botMessageTextColor}; }
      ${this.rootSelector} .message.user { align-self: flex-end; flex-direction: row-reverse; }
      ${this.rootSelector} .message.user .bubble { background: ${theme.userMessageBackgroundColor}; color: ${theme.userMessageTextColor}; }
      ${this.rootSelector} #starter-prompts { padding: 0 16px 8px; display: flex; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid #e5e7eb; }
      ${this.rootSelector} .starter-prompt { display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; font-weight: 500; border: 1px solid #e5e7eb; background: transparent; transition: all 0.2s; border-radius: 6px; font-size: 12px; height: auto; padding: 4px 8px; color: ${theme.botMessageTextColor}; cursor: pointer; }
      ${this.rootSelector} .starter-prompt:hover { background: #f3f4f6; }
      ${this.rootSelector} #input-area-wrapper { flex-shrink: 0; background: ${theme.textInputBackgroundColor}; border-top: 1px solid #e5e7eb; }
      ${this.rootSelector} #input-area { display: flex; align-items: flex-end; padding: 10px; }
      ${this.rootSelector} #chatbot-input { flex-grow: 1; border: 1px solid #ccc; border-radius: ${theme.textInputBorderRadius}px; padding: 8px; outline: none; resize: none; font: 14px ui-sans-serif, system-ui, sans-serif; color: ${theme.textInputTextColor}; background: transparent; max-height: 100px; line-height: 1.4; min-height: initial; }
      ${this.rootSelector} #chatbot-send { background: ${theme.sendButtonColor}; color: white; border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; margin-left: 8px; }
      ${this.rootSelector} #character-counter { font-size: 12px; color: #65758b; padding: 0 12px 8px; text-align: right; }
      ${this.rootSelector} #character-counter.error { color: red; }
      ${this.rootSelector} #chatbot-footer { padding: 8px; text-align: center; font-size: 12px; color: ${theme.footerTextColor}; background: ${theme.footerBackgroundColor}; border-top: 1px solid #e5e7eb; }
      ${this.rootSelector} #chatbot-footer p { margin: 0; line-height: 1.4; }
      ${this.rootSelector} .typing-indicator { display: flex; align-items: center; justify-content: center; padding: 10px; }
      ${this.rootSelector} .typing-indicator span { height: 8px; width: 8px; background: #9ca3af; border-radius: 50%; margin: 0 2px; animation: typing-blink 1.4s infinite both; }
      ${this.rootSelector} .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
      ${this.rootSelector} .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typing-blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
      ${this.mode === 'bubble' ? bubbleModeStyles : inPageModeStyles}
    `;
    document.head.appendChild(style);
    if (theme.customCSS) this.injectCustomCSS(theme.customCSS);
  }

  updateBubbleIcon() {
    const bubbleElement = document.getElementById('chatbot-bubble');
    if (!bubbleElement) return;
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
    if (this.mode === 'bubble') {
        document.getElementById('chatbot-bubble').addEventListener('click', () => this.toggleChat());
        document.getElementById('chatbot-close').addEventListener('click', () => this.toggleChat(false));
        const bubble = document.getElementById('chatbot-bubble');
        const tooltip = document.getElementById('chatbot-tooltip');
        if (tooltip) {
            bubble.addEventListener('mouseenter', () => { if (!this.isOpen) tooltip.style.display = 'block'; });
            bubble.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
        }
        const resizeHandle = document.getElementById('chatbot-resize-handle');
        const header = document.getElementById('chatbot-header');
        if(resizeHandle) resizeHandle.addEventListener('mousedown', this.onResizeStart.bind(this));
        if(header) header.addEventListener('mousedown', this.onDragStart.bind(this));
    }
    
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
    
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) { this.reinitStateAfterBfcache(); }
    });
  }
  
  toggleChat(forceOpen = null) {
    if (this.mode !== 'bubble') return;
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
      if (this.mode === 'bubble') {
          const wasOpen = localStorage.getItem(`chatbot_open_${this.sessionId}`) === 'true';
          if (this.isOpen !== wasOpen) {
              this.toggleChat(wasOpen);
          }
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
  getCookieByName(name) {
    if (!name) return null;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const trimmedCookie = cookie.trim();
        const separatorIndex = trimmedCookie.indexOf('=');
        if (separatorIndex === -1) continue;

        const cookieName = trimmedCookie.substring(0, separatorIndex);
        if (cookieName.startsWith(name)) {
            return trimmedCookie.substring(separatorIndex + 1);
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
