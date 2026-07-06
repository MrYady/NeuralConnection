/**
 * @fileoverview Custom Element para un menú hamburguesa altamente optimizado.
 * @author Experto en Ingeniería de Software
 */

class HamburgerMenu extends HTMLElement {
  constructor() {
    super();
    // Encapsulamiento total mediante Shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Estado interno del componente
    this.isOpen = false;
    
    // Configuración de colores basada en los requerimientos
    this.theme = {
      oscuro: '#021024',
      primario: '#95c5ee',
      secundario: '#1e1f73',
      mainColor: '#052659',
      mainColorClaro: '#95c5ee',
      navAfter: '#f2f3f4',
      navAfterBg: '#021024e1',
      txtMenu: '#163761',
      txtMenuHover: '#1573ee',
      clarox: '#c1e8ff',
      claro: '#f7f9fa',
      speed: '0.3s'
    };
  }

  /**
   * Ciclo de vida: Inserción en el DOM
   */
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  /**
   * Define la estructura y el estilo encapsulado
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --transition: ${this.theme.speed} ease-in-out;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        /* Contenedor del Botón */
        .menu-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 45px;
          height: 45px;
          cursor: pointer;
          z-index: 1001;
          display: flex;
          justify-content: center;
          align-items: center;
          background: ${this.theme.mainColor};
          border-radius: 8px;
          border: 2px solid ${this.theme.primario};
          transition: var(--transition);
        }

        .menu-btn:hover {
          background: ${this.theme.secundario};
          transform: scale(1.05);
        }

        /* Líneas de la hamburguesa (Optimización con transiciones de transform) */
        .hamburger {
          width: 25px;
          height: 3px;
          background: ${this.theme.claro};
          position: relative;
          transition: background var(--transition);
        }

        .hamburger::before,
        .hamburger::after {
          content: '';
          position: absolute;
          width: 25px;
          height: 3px;
          background: ${this.theme.claro};
          transition: var(--transition);
        }

        .hamburger::before { transform: translateY(-8px); }
        .hamburger::after { transform: translateY(8px); }

        /* Estado Abierto del Botón */
        .menu-btn.open .hamburger {
          background: transparent;
        }
        .menu-btn.open .hamburger::before {
          transform: rotate(45deg) translate(0, 0);
        }
        .menu-btn.open .hamburger::after {
          transform: rotate(-45deg) translate(0, 0);
        }

        /* Overlay del Menú */
        .nav-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: ${this.theme.navAfterBg};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: opacity var(--transition), visibility var(--transition);
          backdrop-filter: blur(8px);
        }

        .nav-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        /* Lista de Enlaces */
        .menu-list {
          list-style: none;
          padding: 0;
          text-align: center;
          transform: translateY(20px);
          transition: transform var(--transition);
        }

        .nav-overlay.open .menu-list {
          transform: translateY(0);
        }

        .menu-item {
          margin: 1.5rem 0;
        }

        .menu-link {
          text-decoration: none;
          font-size: 2rem;
          font-weight: bold;
          color: ${this.theme.clarox};
          transition: var(--transition);
          position: relative;
          padding: 5px 10px;
        }

        .menu-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: ${this.theme.txtMenuHover};
          transition: var(--transition);
          transform: translateX(-50%);
        }

        .menu-link:hover {
          color: ${this.theme.txtMenuHover};
        }

        .menu-link:hover::after {
          width: 100%;
        }
      </style>

      <div class="menu-btn" id="btn">
        <div class="hamburger"></div>
      </div>

      <nav class="nav-overlay" id="overlay">
        <ul class="menu-list">
          <li class="menu-item"><a href="#" class="menu-link">Inicio</a></li>
          <li class="menu-item"><a href="#" class="menu-link">Servicios</a></li>
          <li class="menu-item"><a href="#" class="menu-link">Proyectos</a></li>
          <li class="menu-item"><a href="#" class="menu-link">Contacto</a></li>
        </ul>
      </nav>
    `;
  }

  /**
   * Configura los listeners de eventos de forma eficiente
   */
  setupEventListeners() {
    const btn = this.shadowRoot.getElementById('btn');
    const overlay = this.shadowRoot.getElementById('overlay');
    const links = this.shadowRoot.querySelectorAll('.menu-link');

    const toggleMenu = () => {
      this.isOpen = !this.isOpen;
      btn.classList.toggle('open', this.isOpen);
      overlay.classList.toggle('open', this.isOpen);
      
      // Bloquear scroll del body cuando el menú está abierto
      document.body.style.overflow = this.isOpen ? 'hidden' : '';
    };

    btn.addEventListener('click', toggleMenu);

    // Cerrar menú al hacer clic en un enlace (Delegación de eventos implícita)
    links.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isOpen) toggleMenu();
      });
    });
  }
}

// Registro del Custom Element
customElements.define('custom-hamburger-menu', HamburgerMenu);

// Inyectar automáticamente el tag al final del body si no existe
window.addEventListener('load', () => {
  if (!document.querySelector('custom-hamburger-menu')) {
    const menu = document.createElement('custom-hamburger-menu');
    document.body.appendChild(menu);
  }
});