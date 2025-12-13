/**
 * NEURAL CONNECTION - CHATBOT KERNEL v7.0 (OLLAMA EDITION)
 * Engine: Ollama (Llama 3 / Mistral / Gemma)
 * Protocol: HTTP REST API
 */

class NeuralChatbot {
    constructor() {
        // --- CONFIGURACIÓN OLLAMA ---
        this.config = {
            ollama: {
                // URL de tu servidor Ollama. 
                // Si es local: "http://localhost:11434"
                // Si usas Ngrok o VPS: "https://tu-servidor.com"
                baseUrl: "http://localhost:11434", 
                
                // Nombre exacto del modelo que descargaste (ej: "llama3", "mistral", "gemma:2b")
                model: "llama3.2", 
                
                // Tu API KEY (Si tu servidor tiene autenticación, sino déjalo vacío)
                apiKey: "2284d9dcb7e94b2091cbdc804dcb3ae3.EEu-wihQ3KNj_ydh7m3w5HM6" 
            },
            email: {
                serviceId: "service_5y67cyg",
                templateId: "template_4iv0ipp",
                publicKey: "E8FXxIMj8tOcON4Gz"
            }
        };

        // --- PERSONALIDAD RUBIK ---
        this.rubikPersona = `
Eres "Rubik", el asistente de la agencia de marketing y desarrollo "Neural Connection".
            Somos expertos en desarrollo y estrategias de marketing digital.
            Responde de forma breve, amable y profesional.

            TUS SERVICIOS CLAVE:
            - Diseño y desarrollo web (React, Node.js, Python).
            - Diseño UX/UI (Figma, Adobe XD).
            - Apps móviles (Flutter, React Native).
            - Integración de IA (GPT-4, Gemini).
            - Marketing Digital (SEO, SEM, Redes Sociales).
            - Análisis de datos (Google Analytics).
            - Soporte y mantenimiento.

            DIRECTRICES:
            1. Sé conciso y directo.
            2. Usa tono profesional pero accesible.
            3. Si compartes enlaces, OCÚLTALOS en el texto (ej: [Instagram](url)) para que se vean limpios.
            
            DATOS DE CONTACTO (Úsalos solo si preguntan):
            - Web: https://neuralconnection.net
            - Email: neuralconnection@neuralconnection.net
            - Tel: 849-503-1616
            - Redes: Instagram (neural_connection_rd), LinkedIn (neural-connection).
            
            UBICACIÓN: Santo Domingo, RD. Horario: L-V 9AM-6PM.
        `;

        // --- ESTADO ---
        this.state = {
            isOpen: false,
            currentFile: null,
            awaitingEmail: false,
            userEmail: null,
            history: [], // Historial manual para Ollama
            isProcessing: false
        };

        this.dom = {};
        this.init();
    }

    async init() {
        console.log("🦙 Rubik (Ollama Engine) Initializing...");
        await this.injectDependencies();
        this.injectStyles();
        this.injectHTML();
        this.cacheDOM();
        this.bindEvents();
        
        if (window.emailjs) emailjs.init(this.config.email.publicKey);

        // Mensaje de bienvenida
        this.addSystemMessage("Hola. Soy **Rubik**, tu asistente en *Neural Connection*. ¿En qué puedo ayudarte hoy?");
    }

    // --- DEPENDENCIAS Y ESTILOS (Igual que antes) ---
    async injectDependencies() {
        const libs = [
            "https://cdn.tailwindcss.com",
            "https://cdn.jsdelivr.net/npm/marked/marked.min.js",
            "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"
        ];
        await Promise.all(libs.map(src => new Promise(resolve => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            document.head.appendChild(script);
        })));

        window.tailwind.config = {
            theme: { extend: { colors: { 'nc-primary': '#4F46E5', 'nc-secondary': '#4338ca', 'nc-text': '#1e293b' } } }
        };

        const cssLinks = ["https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css", "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"];
        cssLinks.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet'; link.href = href; document.head.appendChild(link);
        });
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .nc-font { font-family: 'Inter', sans-serif; }
            #nc-chat-history::-webkit-scrollbar { width: 5px; }
            #nc-chat-history::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            .nc-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .nc-message-bubble { overflow-wrap: anywhere; word-break: break-word; }
            .nc-message-bubble a { color: #4F46E5; font-weight: 600; text-decoration: underline; }
            .nc-user-msg a { color: white; }
        `;
        document.head.appendChild(style);
    }

    injectHTML() {
        const container = document.createElement('div');
        container.className = 'nc-font antialiased fixed bottom-6 right-6 z-[10000]';
        container.innerHTML = `
            <button id="nc-toggle" class="w-14 h-14 bg-nc-primary text-white rounded-full shadow-xl hover:bg-nc-secondary transition-all flex items-center justify-center transform hover:scale-110 border-2 border-white">
                <i class="fa-solid fa-robot text-2xl"></i>
            </button>
            <div id="nc-modal" class="hidden absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden nc-fade-in">
                <div class="bg-gradient-to-r from-nc-primary to-nc-secondary p-4 flex justify-between items-center text-white shrink-0 shadow-md">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><i class="fa-solid fa-brain text-white text-sm"></i></div>
                        <div><span class="font-bold tracking-wide block text-sm">Neural Connection</span><span class="text-xs text-indigo-200">Rubik Online</span></div>
                    </div>
                    <button id="nc-close" class="hover:text-indigo-200"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>
                <div id="nc-chat-history" class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"></div>
                <div id="nc-file-area" class="hidden px-4 py-3 bg-indigo-50 border-t border-indigo-100 flex justify-between items-center">
                    <div class="flex items-center gap-2 overflow-hidden"><i class="fa-solid fa-file-arrow-up text-nc-primary"></i><span id="nc-filename" class="text-xs text-indigo-800 font-medium truncate max-w-[200px]"></span></div>
                    <button id="nc-clear-file" class="text-indigo-400 hover:text-red-500"><i class="fa-solid fa-circle-xmark"></i></button>
                </div>
                <div class="p-3 bg-white border-t border-slate-100">
                    <div class="flex items-end gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 focus-within:border-nc-primary">
                        <input type="file" id="nc-file-input" class="hidden" accept="image/*,.pdf,.doc,.txt">
                        <button id="nc-attach-btn" class="p-2 text-slate-400 hover:text-nc-primary h-10 w-10 shrink-0"><i class="fa-solid fa-paperclip"></i></button>
                        <textarea id="nc-input" rows="1" placeholder="Escribe tu mensaje..." class="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-700 resize-none py-2.5 max-h-24 overflow-y-auto"></textarea>
                        <button id="nc-send-btn" class="p-2 bg-nc-primary text-white rounded-xl hover:bg-nc-secondary h-10 w-10 shrink-0 flex items-center justify-center"><i class="fa-solid fa-paper-plane text-sm"></i></button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(container);
    }

    cacheDOM() {
        const ids = ['nc-toggle', 'nc-modal', 'nc-close', 'nc-chat-history', 'nc-file-area', 'nc-filename', 'nc-clear-file', 'nc-file-input', 'nc-attach-btn', 'nc-input', 'nc-send-btn'];
        ids.forEach(id => this.dom[id] = document.getElementById(id));
    }

    bindEvents() {
        this.dom['nc-toggle'].addEventListener('click', () => this.toggleChat());
        this.dom['nc-close'].addEventListener('click', () => this.toggleChat(false));
        this.dom['nc-attach-btn'].addEventListener('click', () => this.dom['nc-file-input'].click());
        this.dom['nc-file-input'].addEventListener('change', (e) => this.handleFileSelect(e));
        this.dom['nc-clear-file'].addEventListener('click', () => this.clearFile());
        this.dom['nc-send-btn'].addEventListener('click', () => this.processUserAction());
        this.dom['nc-input'].addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.processUserAction(); } });
    }

    toggleChat(force) {
        this.state.isOpen = force !== undefined ? force : !this.state.isOpen;
        this.dom['nc-modal'].classList.toggle('hidden', !this.state.isOpen);
        if (this.state.isOpen) { this.dom['nc-input'].focus(); this.scrollToBottom(); }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) { alert("Archivo máximo 3MB."); return; }
        this.state.currentFile = file;
        this.dom['nc-filename'].textContent = `${file.name}`;
        this.dom['nc-file-area'].classList.remove('hidden');
    }

    clearFile() {
        this.state.currentFile = null;
        this.dom['nc-file-input'].value = "";
        this.dom['nc-file-area'].classList.add('hidden');
    }

    // --- LÓGICA PRINCIPAL ---
    async processUserAction() {
        const text = this.dom['nc-input'].value.trim();
        if ((!text && !this.state.currentFile) || this.state.isProcessing) return;

        this.addMessageToUI(text, 'user', this.state.currentFile);
        this.dom['nc-input'].value = '';
        const fileToSend = this.state.currentFile;
        const textToSend = text;
        this.clearFile();

        this.state.isProcessing = true;
        const loadingId = this.addLoadingIndicator();

        try {
            if (this.state.awaitingEmail) {
                await this.handleEmailCapture(textToSend, loadingId);
                return;
            }

            if (fileToSend) {
                if (!this.state.userEmail) {
                    this.state.pendingFile = fileToSend;
                    this.state.pendingText = textToSend;
                    this.removeMessage(loadingId);
                    this.addSystemMessage("He recibido tu archivo. Para analizarlo, **necesito tu correo electrónico**.");
                    this.state.awaitingEmail = true;
                    this.state.isProcessing = false;
                    return;
                } else {
                    await this.executeFullTransaction(textToSend, fileToSend, this.state.userEmail, loadingId);
                }
            } else {
                const aiResponse = await this.getOllamaResponse(textToSend);
                this.removeMessage(loadingId);
                this.addSystemMessage(aiResponse);
            }
        } catch (error) {
            console.error(error);
            this.removeMessage(loadingId);
            this.addSystemMessage("⚠️ Error conectando con el servidor neuronal (Ollama). Verifica que el servicio esté activo.");
        } finally {
            this.state.isProcessing = false;
        }
    }

    // --- CONEXIÓN OLLAMA (API REQUEST) ---
    async getOllamaResponse(userMsg) {
        // 1. Añadir mensaje actual al historial
        this.state.history.push({ role: "user", content: userMsg });

        const endpoint = `${this.config.ollama.baseUrl}/api/chat`;
        
        // 2. Construir los mensajes incluyendo el sistema
        const messagesPayload = [
            { role: "system", content: this.rubikPersona },
            ...this.state.history
        ];

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Solo enviamos Auth si hay API Key configurada
                    ...(this.config.ollama.apiKey ? { "Authorization": `Bearer ${this.config.ollama.apiKey}` } : {})
                },
                body: JSON.stringify({
                    model: this.config.ollama.model,
                    messages: messagesPayload,
                    stream: false // Importante: false para recibir respuesta completa de una vez
                })
            });

            if (!response.ok) throw new Error(`Ollama API Error: ${response.statusText}`);

            const data = await response.json();
            const botReply = data.message.content;

            // 3. Guardar respuesta del bot en historial
            this.state.history.push({ role: "assistant", content: botReply });

            return botReply;

        } catch (error) {
            console.error("Fallo en Ollama:", error);
            return "Lo siento, mi conexión neuronal con el servidor local ha fallado. Verifica la consola.";
        }
    }

    async generateExecutiveSummary(lastUserMsg) {
        // Petición "Single Shot" para el resumen
        const endpoint = `${this.config.ollama.baseUrl}/api/chat`;
        const prompt = `
            Actúa como Analista de Negocios. Resume este mensaje: "${lastUserMsg}".
            Formato: HTML simple (<ul>, <b>). Puntos clave: Intención, Servicios sugeridos, Urgencia.
        `;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(this.config.ollama.apiKey ? { "Authorization": `Bearer ${this.config.ollama.apiKey}` } : {})
                },
                body: JSON.stringify({
                    model: this.config.ollama.model,
                    messages: [{ role: "user", content: prompt }],
                    stream: false
                })
            });
            const data = await response.json();
            return data.message.content;
        } catch (e) {
            return "<p>No se pudo generar el resumen automático.</p>";
        }
    }

    // --- RESTO DE FUNCIONES (Email, UI) ---
    async handleEmailCapture(emailText, loadingId) {
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
        const match = emailText.match(emailRegex);
        if (match) {
            this.state.userEmail = match[0];
            this.state.awaitingEmail = false;
            this.removeMessage(loadingId);
            const newLoading = this.addLoadingIndicator();
            this.addSystemMessage(`¡Gracias! Procesando para **${this.state.userEmail}**...`);
            const file = this.state.pendingFile;
            const text = this.state.pendingText || "Envío de archivo.";
            await this.executeFullTransaction(text, file, this.state.userEmail, newLoading);
        } else {
            this.removeMessage(loadingId);
            this.addSystemMessage("Correo inválido. Inténtalo de nuevo.");
            this.state.isProcessing = false;
        }
    }

    async executeFullTransaction(msg, file, email, loadingId) {
        try {
            const summary = await this.generateExecutiveSummary(msg);
            await this.sendEmails(summary, file, email, msg);
            this.removeMessage(loadingId);
            this.addSystemMessage(`✅ **Listo.** Archivo enviado y resumen mandado a ${email}.`);
        } catch (err) {
            this.removeMessage(loadingId);
            this.addSystemMessage("Error enviando el correo.");
        }
    }

    async sendEmails(summary, file, userEmail, originalMsg) {
        let contentData = null;
        if (file) contentData = await this.toBase64(file);

        const baseParams = {
            summary_html: summary,
            user_email: userEmail,
            message: originalMsg,
            file_name: file ? file.name : "Sin archivo",
            content: contentData,
            from_name: "Neural AI (Rubik)"
        };

        const adminEmail = "neuralconnection@neuralconnection.net"; 
        
        await emailjs.send(this.config.email.serviceId, this.config.email.templateId, {
            ...baseParams, to_email: adminEmail, to_name: "Admin", subject: `🔔 Nuevo Lead: ${userEmail}`
        });

        await emailjs.send(this.config.email.serviceId, this.config.email.templateId, {
            ...baseParams, to_email: userEmail, to_name: "Cliente", subject: "Hemos recibido tu solicitud"
        });
    }

    addMessageToUI(text, sender, file = null) {
        const div = document.createElement('div');
        const isUser = sender === 'user';
        div.className = `flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`;
        const bubbleClass = isUser ? 'bg-nc-primary text-white nc-user-msg rounded-br-none' : 'bg-white text-nc-text border border-slate-200 shadow-sm rounded-bl-none';
        const fileHTML = file ? `<div class="mb-2 pb-2 border-b ${isUser ? 'border-white/20' : 'border-slate-100'} text-xs flex gap-2"><i class="fa-solid fa-file"></i> ${file.name}</div>` : '';
        const parsedText = sender === 'bot' && window.marked ? window.marked.parse(text) : text;

        div.innerHTML = `<div class="nc-message-bubble max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${bubbleClass}">${fileHTML}<div>${parsedText}</div></div>`;
        this.dom['nc-chat-history'].appendChild(div);
        this.scrollToBottom();
    }

    addSystemMessage(text) { this.addMessageToUI(text, 'bot'); }

    addLoadingIndicator() {
        const id = 'loader-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'flex w-full mb-4 justify-start';
        div.innerHTML = `<div class="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 shadow-sm"><div class="flex space-x-2"><div class="w-2 h-2 bg-nc-primary rounded-full animate-bounce"></div><div class="w-2 h-2 bg-nc-secondary rounded-full animate-bounce [animation-delay:0.2s]"></div><div class="w-2 h-2 bg-nc-primary rounded-full animate-bounce [animation-delay:0.4s]"></div></div></div>`;
        this.dom['nc-chat-history'].appendChild(div);
        this.scrollToBottom();
        return id;
    }

    removeMessage(id) { const el = document.getElementById(id); if (el) el.remove(); }
    scrollToBottom() { const h = this.dom['nc-chat-history']; h.scrollTop = h.scrollHeight; }
    toBase64(file) { return new Promise((r, j) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => r(reader.result); reader.onerror = j; }); }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => new NeuralChatbot());
else new NeuralChatbot();