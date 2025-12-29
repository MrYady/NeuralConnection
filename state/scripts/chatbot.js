/**
 * NEURAL CONNECTION - CHATBOT KERNEL v7.1 (OPTIMIZED)
 * Fixes: UI Toggle logic & Mobile Responsiveness
 */

class NeuralChatbot {
    constructor() {
        // --- CONFIGURACIÓN ---
        this.config = {
            ollama: {
                // NOTA: Para móviles, cambia esto por tu IP local (ej: http://192.168.1.5:11434)
                baseUrl: "http://localhost:11434", 
                model: "llama3.2", 
                apiKey: "2284d9dcb7e94b2091cbdc804dcb3ae3.EEu-wihQ3KNj_ydh7m3w5HM6" 
            },
            email: {
                serviceId: "service_5y67cyg",
                templateId: "template_4iv0ipp",
                publicKey: "E8FXxIMj8tOcON4Gz"
            }
        };

        this.rubikPersona = `
        ROL:
Eres "Rubik", el asistente virtual de la agencia de marketing y desarrollo "Neural Connection". Tu objetivo es asistir a clientes y usuarios proporcionando información sobre nuestros servicios expertos en desarrollo y estrategias digitales.

TONO Y ESTILO:
- Breve, amable y profesional.
- Accesible pero experto.
- Conciso y directo en todas las respuestas.

TUS SERVICIOS CLAVE (Usa esta información para responder consultas sobre qué hacemos):
- Diseño y desarrollo web (Especialidad en React, Node.js, Python).
- Diseño UX/UI (Herramientas: Figma, Adobe XD).
- Desarrollo de Apps móviles (Flutter, React Native).
- Integración de Inteligencia Artificial (GPT-4, Gemini).
- Marketing Digital (Estrategias SEO, SEM y gestión de Redes Sociales).
- Análisis de datos (Google Analytics).
- Soporte y mantenimiento técnico.

DIRECTRICES DE RESPUESTA:
1. Prioriza la brevedad; ve al grano.
2. Si debes compartir enlaces, usa siempre formato markdown para ocultar la URL en el texto (ejemplo: [Instagram](https://instagram.com...)) para mantener la limpieza visual.
3. No inventes servicios que no están en la lista.

DATOS DE CONTACTO Y OPERATIVOS (Proporciónalos SOLO si el usuario pregunta explícitamente por ellos):
- Sitio Web: [Neural Connection](https://neuralconnection.net)
- Email: neuralconnection@neuralconnection.net
- Teléfono: 849-503-1616
- Redes Sociales: [Instagram](https://instagram.com/neural_connection_rd) | [LinkedIn](https://linkedin.com/company/neural-connection)
- Ubicación: Santo Domingo, República Dominicana.
- Horario de atención: Lunes a Viernes, de 9:00 AM a 6:00 PM.
            `;

        this.state = {
            isOpen: false,
            currentFile: null,
            awaitingEmail: false,
            userEmail: null,
            history: [],
            isProcessing: false
        };

        this.dom = {};
        this.init();
    }

    async init() {
        console.log("🦙 Rubik v7.1 Initializing...");
        await this.injectDependencies();
        this.injectStyles();
        this.injectHTML();
        this.cacheDOM();
        this.bindEvents();
        if (window.emailjs) emailjs.init(this.config.email.publicKey);
        this.addSystemMessage("Hola. Soy **Rubik**, tu asistente en *Neural Connection*. ¿En qué puedo ayudarte hoy?");
    }

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
            
            /* Animaciones optimizadas */
            .nc-fade-in { animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            .nc-scale-in { animation: scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            .nc-fade-out { opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }
            
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            
            .nc-message-bubble { overflow-wrap: anywhere; word-break: break-word; }
            .nc-message-bubble a { color: #4F46E5; font-weight: 600; text-decoration: underline; }
            .nc-user-msg a { color: white; }
        `;
        document.head.appendChild(style);
    }

    injectHTML() {
        const container = document.createElement('div');
        container.className = 'nc-font antialiased fixed z-[10000]'; 
        
        container.innerHTML = `
            <button id="nc-toggle" class="fixed bottom-6 right-6 w-14 h-14 bg-nc-primary text-white rounded-full shadow-xl hover:bg-nc-secondary transition-all duration-300 flex items-center justify-center transform hover:scale-110 border-2 border-white z-[10001]">
                <i class="fa-solid fa-robot text-2xl"></i>
            </button>

            <div id="nc-modal" class="hidden fixed 
                bottom-0 right-0 w-full h-full rounded-none
                md:bottom-20 md:right-6 md:w-[400px] md:h-[600px] md:rounded-2xl 
                bg-white shadow-2xl flex flex-col border border-slate-200 overflow-hidden z-[10002]">
                
                <div class="bg-gradient-to-r from-nc-primary to-nc-secondary p-4 flex justify-between items-center text-white shrink-0 shadow-md">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <i class="fa-solid fa-brain text-white text-sm"></i>
                        </div>
                        <div>
                            <span class="font-bold tracking-wide block text-sm">Neural Connection</span>
                            <span class="text-xs text-indigo-200">Rubik AI</span>
                        </div>
                    </div>
                    <button id="nc-close" class="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                        <i class="fa-solid fa-xmark text-lg"></i> 
                    </button>
                </div>

                <div id="nc-chat-history" class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 touch-pan-y"></div>

                <div id="nc-file-area" class="hidden px-4 py-3 bg-indigo-50 border-t border-indigo-100 flex justify-between items-center">
                    <div class="flex items-center gap-2 overflow-hidden">
                        <i class="fa-solid fa-file-arrow-up text-nc-primary"></i>
                        <span id="nc-filename" class="text-xs text-indigo-800 font-medium truncate max-w-[200px]"></span>
                    </div>
                    <button id="nc-clear-file" class="text-indigo-400 hover:text-red-500">
                        <i class="fa-solid fa-circle-xmark"></i>
                    </button>
                </div>

                <div class="p-3 bg-white border-t border-slate-100 pb-safe"> 
                    <div class="flex items-end gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 focus-within:border-nc-primary transition-colors">
                        <input type="file" id="nc-file-input" class="hidden" accept="image/*,.pdf,.doc,.txt">
                        <button id="nc-attach-btn" class="p-2 text-slate-400 hover:text-nc-primary h-10 w-10 shrink-0">
                            <i class="fa-solid fa-paperclip"></i>
                        </button>
                        <textarea id="nc-input" rows="1" placeholder="Escribe aquí..." class="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-700 resize-none py-2.5 max-h-24 overflow-y-auto"></textarea>
                        <button id="nc-send-btn" class="p-2 bg-nc-primary text-white rounded-xl hover:bg-nc-secondary h-10 w-10 shrink-0 flex items-center justify-center shadow-lg">
                            <i class="fa-solid fa-paper-plane text-sm"></i>
                        </button>
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
        this.dom['nc-toggle'].addEventListener('click', () => this.toggleChat(true));
        this.dom['nc-close'].addEventListener('click', () => this.toggleChat(false));
        this.dom['nc-attach-btn'].addEventListener('click', () => this.dom['nc-file-input'].click());
        this.dom['nc-file-input'].addEventListener('change', (e) => this.handleFileSelect(e));
        this.dom['nc-clear-file'].addEventListener('click', () => this.clearFile());
        this.dom['nc-send-btn'].addEventListener('click', () => this.processUserAction());
        this.dom['nc-input'].addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.processUserAction(); } });
    }

    // --- FUNCIÓN CLAVE DE OPTIMIZACIÓN UI ---
    toggleChat(isOpen) {
        this.state.isOpen = isOpen;
        const modal = this.dom['nc-modal'];
        const toggleBtn = this.dom['nc-toggle'];

        if (isOpen) {
            // Abrir Chat: Ocultar botón, mostrar modal
            toggleBtn.classList.add('opacity-0', 'pointer-events-none', 'scale-0'); // Efecto desaparición
            modal.classList.remove('hidden');
            modal.classList.add('nc-scale-in'); // Animación entrada modal
            this.dom['nc-input'].focus();
            this.scrollToBottom();
        } else {
            // Cerrar Chat: Mostrar botón, ocultar modal
            modal.classList.add('hidden');
            modal.classList.remove('nc-scale-in');
            
            toggleBtn.classList.remove('opacity-0', 'pointer-events-none', 'scale-0'); // Reaparecer botón
        }
    }

    // ... (El resto de métodos handleFileSelect, processUserAction, etc. se mantienen igual) ...
    // Asegúrate de incluir aquí el resto de métodos de la versión anterior (processUserAction, getOllamaResponse, etc.)
    // Para brevedad, asumo que mantienes la lógica interna igual.
    
    // --- LÓGICA RED (Ollama) Actualizada ---
    async getOllamaResponse(userMsg) {
        this.state.history.push({ role: "user", content: userMsg });
        
        try {
            const response = await fetch(`${this.config.ollama.baseUrl}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: this.config.ollama.model,
                    messages: [{ role: "system", content: this.rubikPersona }, ...this.state.history],
                    stream: false
                })
            });
            
            if (!response.ok) throw new Error("Ollama Network Error"); // Manejo de error HTTP
            
            const data = await response.json();
            const reply = data.message.content;
            this.state.history.push({ role: "assistant", content: reply });
            return reply;

        } catch (error) {
            console.error("Connection Error:", error);
            // Mensaje de error amigable para móviles
            return `⚠️ **Error de Conexión**: No puedo conectar con el servidor Ollama en \`${this.config.ollama.baseUrl}\`. \n\n**Solución:**\n1. Asegúrate que la PC servidor tiene Ollama corriendo.\n2. Asegúrate de configurar la variable de entorno \`OLLAMA_HOST=0.0.0.0\`.\n3. Si estás en móvil, usa la IP local de tu PC (ej: 192.168.x.x) en lugar de localhost.`;
        }
    }
    
    // ... [Incluir resto de funciones auxiliares: addMessageToUI, etc.] ...
    addMessageToUI(text, sender, file = null) {
        const div = document.createElement('div');
        const isUser = sender === 'user';
        div.className = `flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`;
        const bubbleClass = isUser ? 'bg-nc-primary text-white nc-user-msg rounded-br-none' : 'bg-white text-nc-text border border-slate-200 shadow-sm rounded-bl-none';
        const fileHTML = file ? `<div class="mb-2 pb-2 border-b ${isUser ? 'border-white/20' : 'border-slate-100'} text-xs flex gap-2"><i class="fa-solid fa-file"></i> ${file.name}</div>` : '';
        const parsedText = sender === 'bot' && window.marked ? window.marked.parse(text) : text;

        div.innerHTML = `<div class="nc-message-bubble max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${bubbleClass} nc-fade-in">${fileHTML}<div>${parsedText}</div></div>`;
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
    async processUserAction() {
        // ... (Tu lógica original de processUserAction aquí, la he omitido para ahorrar espacio pero es necesaria) ...
         const text = this.dom['nc-input'].value.trim();
        if ((!text && !this.state.currentFile) || this.state.isProcessing) return;

        this.addMessageToUI(text, 'user', this.state.currentFile);
        this.dom['nc-input'].value = '';
        const fileToSend = this.state.currentFile;
        const textToSend = text;
        this.clearFile();

        this.state.isProcessing = true;
        const loadingId = this.addLoadingIndicator();

        // SIMULACIÓN LOGICA (Debes pegar tu lógica completa de emails aquí)
        // Por brevedad, solo llamo a Ollama
        const aiResponse = await this.getOllamaResponse(textToSend);
        this.removeMessage(loadingId);
        this.addSystemMessage(aiResponse);
        this.state.isProcessing = false;
    }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => new NeuralChatbot());
else new NeuralChatbot();