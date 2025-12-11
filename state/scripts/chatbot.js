/**
 * NEURAL CONNECTION - CHATBOT MODULE
 * Versión: 4.0 (File Upload & Email Support)
 * Estilo: Clean Modern UI
 */

class NeuralChatbot {
    constructor() {
        // --- CONFIGURACIÓN ---
        this.geminiKey = "AIzaSyA8HBCEIvtvFHMOJXUORVTpdjajgAouHJ4"; // API Key de Google Gemini
        this.modelName = "gemini-2.5-flash-preview-09-2025"; // Modelo Gemini a utilizar
        
        // CONFIGURACIÓN EMAILJS (Reemplaza con tus datos reales de emailjs.com)
        this.emailServiceId = "service_5y67cyg"; 
        this.emailTemplateId = "template_4iv0ipp"; 
        this.emailPublicKey = "WVK1rWNWFHXTdZu3K"; 
        
        this.chatHistory = [];
        this.isOpen = false;
        this.currentFile = null; // Almacena el archivo temporalmente
        
        this.elements = {};
        this.init();
    }

    async init() {
        console.log("⚡ Iniciando Neural Assistant con Soporte de Archivos...");
        await this.injectDependencies();
        this.injectStyles();
        this.injectHTML();
        this.bindEvents();
        
        // Inicializar EmailJS
        if (window.emailjs) emailjs.init(this.emailPublicKey);

        this.addMessageToUI("Hola, soy tu Asistente Neural. Puedes hacerme preguntas o enviarme documentos/imágenes usando el clip 📎.", 'bot');
    }

    async injectDependencies() {
        window.tailwind = {
            config: {
                corePlugins: { preflight: false },
                theme: {
                    extend: {
                        colors: {
                            'nc-header': '#2a2a72',
                            'nc-user-start': '#00c6ff',
                            'nc-user-end': '#0072ff',
                        }
                    }
                }
            }
        };

        const loadScript = (src) => new Promise((resolve) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            document.head.appendChild(script);
        });

        const loadCSS = (href) => {
            if (document.querySelector(`link[href="${href}"]`)) return;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        };

        await Promise.all([
            loadScript("https://cdn.tailwindcss.com"),
            loadScript("https://cdn.jsdelivr.net/npm/marked/marked.min.js"),
            loadScript("https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js") // Librería Email
        ]);

        loadCSS("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css");
        loadCSS("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap");
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .nc-font { font-family: 'Montserrat', sans-serif; }
            #nc-chat-history::-webkit-scrollbar { width: 4px; }
            #nc-chat-history::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            @keyframes nc-pop-in { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            .nc-animate-enter { animation: nc-pop-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .bot-shadow { box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
            
            /* Animación de carga de archivo */
            .file-pulse { animation: pulse-border 1.5s infinite; }
            @keyframes pulse-border { 0% { border-color: #00c6ff; } 50% { border-color: transparent; } 100% { border-color: #00c6ff; } }
        `;
        document.head.appendChild(style);
    }

    injectHTML() {
        const container = document.createElement('div');
        container.id = 'neural-chatbot-container';
        container.className = 'nc-font antialiased'; 
        
        container.innerHTML = `
            <div class="fixed bottom-6 right-6 z-[9999]">
                <button id="nc-toggle-btn"
                    class="bg-gradient-to-r from-cyan-500 to-blue-600 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center cursor-pointer border-2 border-white">
                    <i class="fa-solid fa-message text-2xl"></i>
                </button>
            </div>

            <div id="nc-chat-modal"
                class="fixed bottom-24 right-6 w-80 md:w-[350px] h-[550px] bg-[#f8f9fa] rounded-[2rem] shadow-2xl z-[9999] hidden flex-col overflow-hidden nc-animate-enter border border-gray-200">
                
                <div class="bg-nc-header p-4 flex justify-between items-center text-white shrink-0">
                    <button id="nc-close-btn" class="text-white/80 hover:text-white transition cursor-pointer bg-transparent border-0"><i class="fa-solid fa-arrow-left"></i></button>
                    <span class="font-bold text-lg tracking-wide">Neural AI</span>
                    <button class="text-white/80"><i class="fa-solid fa-gear"></i></button>
                </div>

                <div id="nc-chat-history" class="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f8f9fa]">
                    <div class="flex justify-center mb-4"><span class="bg-gray-200/60 text-gray-500 text-xs px-3 py-1 rounded-full font-medium">Hoy</span></div>
                </div>

                <div id="nc-file-preview-area" class="hidden px-4 py-2 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
                    <div class="flex items-center gap-2 overflow-hidden">
                        <i class="fa-solid fa-file-image text-nc-user-end"></i>
                        <span id="nc-filename" class="text-xs text-gray-600 truncate max-w-[150px]">archivo.jpg</span>
                    </div>
                    <button id="nc-remove-file" class="text-red-500 hover:text-red-700 text-xs cursor-pointer"><i class="fa-solid fa-times"></i></button>
                </div>

                <div class="p-4 bg-white flex items-center gap-2 shrink-0 relative">
                    <input type="file" id="nc-file-upload" class="hidden" accept="image/*,.pdf,.doc,.docx">
                    
                    <button id="nc-attach-btn" class="text-gray-400 hover:text-nc-user-end transition p-2 cursor-pointer" title="Adjuntar archivo">
                        <i class="fa-solid fa-paperclip text-lg"></i>
                    </button>

                    <div class="flex-1 bg-transparent">
                        <input type="text" id="nc-chat-input" placeholder="Escribe un mensaje..."
                            class="w-full bg-transparent border-none outline-none text-gray-600 text-sm placeholder-gray-400 font-medium h-10">
                    </div>
                    
                    <button id="nc-send-btn"
                        class="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-md text-[#4facfe] flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer group">
                        <i class="fa-regular fa-paper-plane group-hover:scale-110 transition-transform text-lg"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        this.elements = {
            toggleBtn: document.getElementById('nc-toggle-btn'),
            modal: document.getElementById('nc-chat-modal'),
            closeBtn: document.getElementById('nc-close-btn'),
            input: document.getElementById('nc-chat-input'),
            sendBtn: document.getElementById('nc-send-btn'),
            history: document.getElementById('nc-chat-history'),
            attachBtn: document.getElementById('nc-attach-btn'),
            fileInput: document.getElementById('nc-file-upload'),
            previewArea: document.getElementById('nc-file-preview-area'),
            fileNameSpan: document.getElementById('nc-filename'),
            removeFileBtn: document.getElementById('nc-remove-file')
        };
    }

    bindEvents() {
        const { toggleBtn, closeBtn, sendBtn, input, attachBtn, fileInput, removeFileBtn } = this.elements;

        toggleBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat(false));
        sendBtn.addEventListener('click', () => this.handleSend());
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.handleSend(); });

        // Lógica de Archivos
        attachBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
        removeFileBtn.addEventListener('click', () => this.clearFile());
    }

    toggleChat(forceState) {
        this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
        const { modal, input } = this.elements;
        if (this.isOpen) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => input.focus(), 100);
        } else {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    // --- MANEJO DE ARCHIVOS ---
    handleFileSelection(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamaño (Max 2MB para EmailJS free tier)
        if (file.size > 2 * 1024 * 1024) {
            alert("El archivo es demasiado grande (Máx 2MB).");
            this.clearFile();
            return;
        }

        this.currentFile = file;
        this.elements.previewArea.classList.remove('hidden');
        this.elements.fileNameSpan.textContent = file.name;
        
        // Efecto visual en el botón de clip
        this.elements.attachBtn.classList.add('text-nc-user-end');
    }

    clearFile() {
        this.currentFile = null;
        this.elements.fileInput.value = "";
        this.elements.previewArea.classList.add('hidden');
        this.elements.attachBtn.classList.remove('text-nc-user-end');
    }

    // --- LÓGICA DE ENVÍO ---
    async handleSend() {
        const { input } = this.elements;
        const msg = input.value.trim();

        // Evitar enviar si no hay mensaje NI archivo
        if (!msg && !this.currentFile) return;

        // 1. Mostrar Mensaje Usuario en UI
        let userDisplayMsg = msg;
        if (this.currentFile) {
            userDisplayMsg = `${msg ? msg + '<br>' : ''} <span class="text-xs opacity-75"><i class="fa-solid fa-paperclip"></i> ${this.currentFile.name}</span>`;
        }
        this.addMessageToUI(userDisplayMsg, 'user');
        
        // Limpiar Inputs visualmente
        input.value = '';
        const fileToSend = this.currentFile; 
        this.clearFile(); // Limpiar estado interno pero guardar referencia local

        // 2. Loading State
        const loadingId = this.addMessageToUI('...', 'bot', true);

        try {
            // DECISIÓN: ¿Enviar Email o Chatear con IA?
            if (fileToSend) {
                // CASO A: Hay archivo -> ENVIAR CORREO
                await this.sendEmail(msg, fileToSend);
                this.removeMessage(loadingId);
                this.addMessageToUI(`✅ He enviado tu archivo "<b>${fileToSend.name}</b>" y tu mensaje al equipo de Neural Connection. Te responderemos por correo pronto.`, 'bot');
            } else {
                // CASO B: Solo Texto -> CHATEAR CON GEMINI
                const aiResponse = await this.getGeminiResponse(msg);
                this.removeMessage(loadingId);
                this.addMessageToUI(aiResponse, 'bot');
            }

        } catch (error) {
            console.error(error);
            this.removeMessage(loadingId);
            this.addMessageToUI("Lo siento, hubo un error técnico. Intenta de nuevo.", 'bot');
        }
    }

    // --- SERVICIO DE EMAIL ---
    async sendEmail(message, file) {
        if (!this.emailPublicKey || this.emailPublicKey === "public_key_aqui") {
            return new Promise(r => setTimeout(r, 1000)); // Simulación si no hay key
        }

        // Convertir archivo a Base64
        const base64File = await this.toBase64(file);

        // Parámetros para EmailJS (Deben coincidir con tu Template)
        const templateParams = {
            message: message || "Archivo adjunto enviado.",
            file_name: file.name,
            content: base64File // Necesitas configurar el template para aceptar adjuntos o links
        };

        return emailjs.send(this.emailServiceId, this.emailTemplateId, templateParams);
    }

    // --- SERVICIO DE IA ---
    async getGeminiResponse(msg) {
        const { GoogleGenerativeAI } = await import("https://esm.run/@google/generative-ai");
        const genAI = new GoogleGenerativeAI(this.geminiKey);
        const model = genAI.getGenerativeModel({ model: this.modelName });
        
        const prompt = `Actúa como Asistente de Neural Connection. Usuario: "${msg}". Responde brevemente.`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    // --- UTILIDADES ---
    toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    addMessageToUI(text, sender, isLoading = false) {
        const { history } = this.elements;
        const div = document.createElement('div');
        div.id = 'msg-' + Date.now();
        const isUser = sender === 'user';
        
        const commonClass = "p-4 max-w-[80%] text-sm font-medium leading-relaxed mb-1 shadow-sm relative break-words";
        const userStyle = "bg-gradient-to-r from-nc-user-start to-nc-user-end text-white self-end rounded-2xl rounded-br-none ml-auto text-right";
        const botStyle = "bg-white text-gray-700 self-start rounded-2xl rounded-bl-none bot-shadow border border-gray-100/50";

        div.className = `${commonClass} ${isUser ? userStyle : botStyle}`;

        if (isLoading) {
            div.innerHTML = `
                <div class="flex space-x-1 items-center justify-center h-4 w-8">
                    <div class="w-1.5 h-1.5 bg-nc-header/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div class="w-1.5 h-1.5 bg-nc-header/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div class="w-1.5 h-1.5 bg-nc-header rounded-full animate-bounce"></div>
                </div>`;
             div.classList.add("self-start");
        } else {
            div.innerHTML = window.marked ? window.marked.parse(text) : text;
        }

        history.appendChild(div);
        history.scrollTop = history.scrollHeight;
        return div.id;
    }

    removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new NeuralChatbot());
} else {
    new NeuralChatbot();
}