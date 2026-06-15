/**
 * Área de Membros — Sobrancelha Moderna
 * Controla a interatividade do dashboard, controle do menu mobile e persistência do progresso
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initProgressTracker();
  initActiveNav();
});

/**
 * Menu Lateral Responsivo (Mobile)
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (!menuToggle || !sidebar) return;

  // Criar overlay para fechar o menu ao clicar fora no mobile
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  const toggleSidebar = () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  };

  const closeSidebar = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  };

  menuToggle.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', closeSidebar);

  // Fechar sidebar ao clicar em um link no mobile
  const navLinks = sidebar.querySelectorAll('.nav-item');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 992) {
        closeSidebar();
      }
    });
  });
}

/**
 * Gerenciador de Progresso dos Módulos (com LocalStorage)
 */
function initProgressTracker() {
  const STORAGE_KEY = 'sobrancelha_moderna_progresso';
  
  // Carrega do localStorage ou inicia vazio
  let completedModules = [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      completedModules = JSON.parse(stored);
    }
  } catch (err) {
    console.error('Erro ao ler localStorage:', err);
  }

  const cards = document.querySelectorAll('.module-card');
  
  // Função para atualizar o visual de um card específico
  const updateCardUI = (card, isCompleted) => {
    const progressBar = card.querySelector('.progress-fill');
    const progressText = card.querySelector('.progress-pct');
    const completeBtn = card.querySelector('.complete-btn');
    
    if (isCompleted) {
      card.classList.add('completed');
      if (progressBar) progressBar.style.width = '100%';
      if (progressText) progressText.textContent = '100% concluído';
      if (completeBtn) completeBtn.classList.add('active');
    } else {
      card.classList.remove('completed');
      if (progressBar) progressBar.style.width = '0%';
      if (progressText) progressText.textContent = '0% concluído';
      if (completeBtn) completeBtn.classList.remove('active');
    }
  };

  // Inicializa o estado visual de todos os cards
  cards.forEach(card => {
    const moduleId = card.getAttribute('data-module-id');
    const isCompleted = completedModules.includes(moduleId);
    updateCardUI(card, isCompleted);

    const completeBtn = card.querySelector('.complete-btn');
    if (completeBtn) {
      completeBtn.addEventListener('click', (e) => {
        // Impede que clicar no botão de check abra o link do módulo
        e.preventDefault();
        e.stopPropagation();

        const index = completedModules.indexOf(moduleId);
        const nowCompleted = index === -1;

        if (nowCompleted) {
          completedModules.push(moduleId);
        } else {
          completedModules.splice(index, 1);
        }

        // Salva e atualiza UI
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(completedModules));
        } catch (err) {
          console.error('Erro ao gravar localStorage:', err);
        }

        updateCardUI(card, nowCompleted);
      });
    }
  });
}

/**
 * Ativa links de navegação conforme scroll e cliques
 */
function initActiveNav() {
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-item');
  const sections = [];
  
  navLinks.forEach(link => {
    const hash = link.getAttribute('href');
    if (hash && hash.startsWith('#')) {
      const el = document.querySelector(hash);
      if (el) {
        sections.push({ link, el });
      }
    }
  });

  // Highlight ativo baseado no scroll
  const handleScroll = () => {
    const scrollPos = window.scrollY + 120;
    
    // Encontra a seção ativa
    let activeFound = false;
    for (let i = sections.length - 1; i >= 0; i--) {
      const { link, el } = sections[i];
      if (scrollPos >= el.offsetTop) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        activeFound = true;
        break;
      }
    }
    
    // Caso esteja no topo, ativa o primeiro link (Início)
    if (!activeFound && navLinks.length > 0) {
      navLinks.forEach(l => l.classList.remove('active'));
      navLinks[0].classList.add('active');
    }
  };

  window.addEventListener('scroll', handleScroll);
  
  // Scroll suave ao clicar nos links internos
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      if (hash && hash.startsWith('#')) {
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          window.scrollTo({
            top: target.offsetTop - 80,
            behavior: 'smooth'
          });
          
          // Força atualização da hash na URL e ativação imediata do link
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  });

  // Roda uma vez para definir o estado inicial
  handleScroll();
}
