/**
 * Raw HTML Tool for CodeX Editor
 *
 * @author CodeX (team@codex.so)
 * @copyright CodeX 2018
 * @license The MIT License (MIT)
 */

/**
 *
 */
 class AnyTool {
    /**
     * Notify core that read-only mode is supported
     *
     * @returns {boolean}
     */
    static get isReadOnlySupported() {
      return true;
    }
  
    /**
     * Should this tool be displayed at the Editor's Toolbox
     *
     * @returns {boolean}
     * @public
     */
    static get displayInToolbox() {
      return true;
    }
  
    /**
     * Allow to press Enter inside the RawTool textarea
     *
     * @returns {boolean}
     * @public
     */
    static get enableLineBreaks() {
      return true;
    }
  
    /**
     * Get Tool toolbox settings
     * icon - Tool icon's SVG
     * title - title to show in toolbox
     *
     * @returns {{icon: string, title: string}}
     */
    static get toolbox() {
      return {
        icon: this.icon || '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>',
        title: this.title || 'Raw Data',
      };
    }
  
    /**
     * @typedef {object} RawData  plugin saved data
     * @param {string} html - previously saved HTML code
     * @property
     */
  
    /**
     * Render plugin`s main Element and fill it with saved data
     *
     * @param {RawData} data  previously saved HTML data
     * @param {object} config - user config for Tool
     * @param {object} api - CodeX Editor API
     * @param {boolean} readOnly - read-only mode flag
     */
    constructor({ data, config, api, readOnly }) {
      this.api = api;
      this.readOnly = readOnly;
      this.icon = config.icon;
      this.title = config.title;
      this.defaultData = JSON.stringify(config.data,null, 4);
  
      this.placeholder = config.placeholder || RawTool.DEFAULT_PLACEHOLDER;
  
      this.CSS = {
        baseClass: this.api.styles.block,
        input: this.api.styles.input,
        wrapper: 'ce-rawtool',
        textarea: 'ce-rawtool__textarea',
      };
      this.data = JSON.stringify(data,null, 4);
      this.textarea = null;
      this.resizeDebounce = null;
    }
  
    /**
     * Return Tool's view
     *
     * @returns {HTMLDivElement} this.element - RawTool's wrapper
     * @public
     */
    render() {
      const wrapper = document.createElement('div');
      const renderingTime = 100;
  
      this.textarea = document.createElement('textarea');
  
      wrapper.classList.add(this.CSS.baseClass, this.CSS.wrapper);
  
      this.textarea.classList.add(this.CSS.textarea, this.CSS.input);
      if (JSON.stringify(this.data)===`"{}"`) {
        this.textarea.textContent = this.defaultData;  
      } else {
        this.textarea.textContent = this.data;
      }
      this.textarea.placeholder = this.placeholder;
  
      if (this.readOnly) {
        this.textarea.disabled = true;
      } else {
        this.textarea.addEventListener('input', () => {
          this.onInput();
        });
      }
  
  
      wrapper.appendChild(this.textarea);
  
      setTimeout(() => {
        this.resize();
      }, renderingTime);
  
      return wrapper;
    }
  
    /**
     * Extract Tool's data from the view
     *
     * @param {HTMLDivElement} rawToolsWrapper - RawTool's wrapper, containing textarea with raw HTML code
     * @returns {RawData} - raw HTML code
     * @public
     */
    save(rawToolsWrapper) {
      return JSON.parse(rawToolsWrapper.querySelector('textarea').value);
    }
  
    /**
     * Default placeholder for RawTool's textarea
     *
     * @public
     * @returns {string}
     */
    static get DEFAULT_PLACEHOLDER() {
      return 'Enter raw data';
    }
  
    /**
     * Automatic sanitize config
     */
    static get sanitize() {
      return {
        html: true, // Allow HTML tags
      };
    }
  
    /**
     * Textarea change event
     *
     * @returns {void}
     */
    onInput() {
      if (this.resizeDebounce) {
        clearTimeout(this.resizeDebounce);
      }
  
      this.resizeDebounce = setTimeout(() => {
        this.resize();
      }, 200);
    }
  
    /**
     * Resize textarea to fit whole height
     *
     * @returns {void}
     */
    resize() {
      this.textarea.style.height = 'auto';
      this.textarea.style.height = this.textarea.scrollHeight + 'px';
    }
  }