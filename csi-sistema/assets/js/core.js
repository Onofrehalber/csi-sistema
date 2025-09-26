// CSI Refrigeración - Sistema Integral de Gestión
// Core System - Gestión central del sistema
// Versión: 2.0 - Soporte completo para módulo Quotes

class CSISystem {
    constructor() {
        this.currentUser = null;
        this.currentModule = 'dashboard';
        this.currentSubmodule = '';
        this.modules = {
            admin: ['dashboard', 'crm', 'finance', 'technical', 'inventory', 'hr', 'bi'],
            user: ['dashboard', 'crm']
        };
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadDashboard();
    }

    checkAuth() {
        const user = sessionStorage.getItem('csi_user');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.showMainApp();
        } else {
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('app-section').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        this.updateUserInfo();
        this.setupNavigation();
    }

    updateUserInfo() {
        const userInfo = document.getElementById('user-info');
        if (userInfo && this.currentUser) {
            userInfo.innerHTML = `
                <span class="user-name">${this.currentUser.name}</span>
                <span class="user-role">${this.currentUser.role}</span>
            `;
        }
    }

    setupNavigation() {
        this.setupModuleNavigation();
        this.setupSubmoduleNavigation();
    }

    setupModuleNavigation() {
        const moduleLinks = document.querySelectorAll('.module-link');
        moduleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const module = e.target.closest('a').dataset.module;
                this.switchModule(module);
            });
        });
    }

    setupSubmoduleNavigation() {
        const sidebar = document.getElementById('module-sidebar');
        if (!sidebar) return;

        let menuItems = [];
        const currentModule = this.currentModule;

        if (currentModule === 'dashboard') {
            menuItems = [
                { id: 'main', name: '📊 Dashboard Principal', icon: '📊' }
            ];
        } else if (currentModule === 'crm') {
            menuItems = [
                { id: 'clients', name: '👥 Gestión de Clientes', icon: '👥' },
                { id: 'quotes', name: '💰 Cotizaciones', icon: '💰' },
                { id: 'orders', name: '📋 Órdenes Venta', icon: '📋' },
                { id: 'projects', name: '📈 Seguimiento Proyectos', icon: '📈' },
                { id: 'collections', name: '💸 Cobranza', icon: '💸' }
            ];
        } else if (currentModule === 'finance') {
            menuItems = [
                { id: 'billing', name: '🧾 Facturación CFDI', icon: '🧾' },
                { id: 'expenses', name: '💳 Control Gastos', icon: '💳' },
                { id: 'reports', name: '📊 Reportes Financieros', icon: '📊' }
            ];
        }

        sidebar.innerHTML = menuItems.map(item => `
            <a href="#" class="submodule-link" data-submodule="${item.id}">
                <span class="icon">${item.icon}</span>
                ${item.name}
            </a>
        `).join('');

        const submoduleLinks = document.querySelectorAll('.submodule-link');
        submoduleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const submodule = e.target.closest('a').dataset.submodule;
                this.switchSubmodule(submodule);
            });
        });

        // Activar primer submodule por defecto
        if (menuItems.length > 0) {
            this.switchSubmodule(menuItems[0].id);
        }
    }

    switchModule(moduleName) {
        if (!this.hasPermission(moduleName)) {
            this.showMessage('No tienes permisos para acceder a este módulo', 'error');
            return;
        }

        this.currentModule = moduleName;
        this.currentSubmodule = '';

        // Actualizar navegación principal
        document.querySelectorAll('.module-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-module="${moduleName}"]`).classList.add('active');

        // Actualizar título
        document.getElementById('module-title').textContent = this.getModuleTitle(moduleName);

        // Configurar sidebar para el módulo
        this.setupSubmoduleNavigation();
    }

    switchSubmodule(submoduleName) {
        this.currentSubmodule = submoduleName;

        // Actualizar navegación secundaria
        document.querySelectorAll('.submodule-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-submodule="${submoduleName}"]`).classList.add('active');

        // Cargar contenido del submodule
        this.loadModuleContent(this.currentModule, submoduleName);
    }

    loadModuleContent(moduleName, submoduleName) {
        const contentArea = document.getElementById('module-content');
        
        if (!contentArea) return;

        // Mostrar loader
        contentArea.innerHTML = '<div class="loading">Cargando módulo...</div>';

        // Cargar contenido específico del módulo
        if (moduleName === 'dashboard') {
            this.loadDashboard();
        } else if (moduleName === 'crm' && submoduleName === 'clients') {
            contentArea.innerHTML = `
                <div class="module-header">
                    <h2>👥 Gestión de Clientes</h2>
                    <button class="btn-primary" onclick="showNewClientModal()">
                        ＋ Nuevo Cliente
                    </button>
                </div>
                <div id="crm-clients-content">
                    <!-- Contenido cargado por clients.js -->
                </div>
            `;
            this.loadModuleScript(moduleName, submoduleName);
        } else if (moduleName === 'crm' && submoduleName === 'quotes') {
            contentArea.innerHTML = `
                <div class="module-header">
                    <h2>💰 Gestión de Cotizaciones</h2>
                    <button class="btn-primary" onclick="showNewQuoteModal()">
                        ＋ Nueva Cotización
                    </button>
                </div>
                <div id="crm-quotes-content">
                    <!-- Contenido cargado por quotes.js -->
                </div>
            `;
            this.loadModuleScript(moduleName, submoduleName);
        } else {
            // Contenido por defecto para módulos no implementados
            contentArea.innerHTML = `
                <div class="module-header">
                    <h2>${this.getModuleTitle(moduleName)} - ${submoduleName}</h2>
                </div>
                <div class="coming-soon">
                    <h3>🚧 Módulo en Desarrollo</h3>
                    <p>Esta funcionalidad estará disponible próximamente.</p>
                    <div class="progress">
                        <div class="progress-bar" style="width: 25%"></div>
                    </div>
                </div>
            `;
        }
    }

    loadModuleScript(moduleName, submoduleName) {
        // Limpiar scripts anteriores del mismo módulo
        const oldScript = document.getElementById(`script-${moduleName}-${submoduleName}`);
        if (oldScript) {
            oldScript.remove();
        }

        // Cargar nuevo script
        const script = document.createElement('script');
        script.id = `script-${moduleName}-${submoduleName}`;
        
        if (moduleName === 'crm' && submoduleName === 'clients') {
            script.src = 'assets/js/modules/crm/clients.js';
        } else if (moduleName === 'crm' && submoduleName === 'quotes') {
            script.src = 'assets/js/modules/crm/quotes.js';
        }
        
        script.onload = () => {
            console.log(`✅ ${moduleName}/${submoduleName} cargado`);
            this.initModule(moduleName, submoduleName);
        };
        script.onerror = () => {
            console.error(`❌ Error cargando ${moduleName}/${submoduleName}`);
            document.getElementById('module-content').innerHTML += 
                '<p class="error">Error cargando el módulo</p>';
        };
        
        document.body.appendChild(script);
    }

    initModule(moduleName, submoduleName) {
        // Inicializar módulos específicos
        if (moduleName === 'crm' && submoduleName === 'clients' && typeof initClientsModule === 'function') {
            initClientsModule();
        } else if (moduleName === 'crm' && submoduleName === 'quotes' && typeof initQuotesModule === 'function') {
            initQuotesModule();
        }
    }

    loadDashboard() {
        const contentArea = document.getElementById('module-content');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="dashboard">
                <div class="module-header">
                    <h2>📊 Dashboard Principal</h2>
                    <div class="dashboard-actions">
                        <button class="btn-secondary" onclick="csiSystem.generateReport()">
                            📋 Generar Reporte
                        </button>
                    </div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-info">
                            <h3>Clientes</h3>
                            <span class="stat-number" id="total-clients">0</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-info">
                            <h3>Cotizaciones</h3>
                            <span class="stat-number" id="total-quotes">0</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📋</div>
                        <div class="stat-info">
                            <h3>Órdenes Activas</h3>
                            <span class="stat-number" id="active-orders">0</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💸</div>
                        <div class="stat-info">
                            <h3>Ingresos Mes</h3>
                            <span class="stat-number" id="month-income">$0</span>
                        </div>
                    </div>
                </div>

                <div class="recent-activity">
                    <h3>📈 Actividad Reciente</h3>
                    <div id="recent-activities">
                        <p>No hay actividad reciente</p>
                    </div>
                </div>
            </div>
        `;

        this.updateDashboardStats();
    }

    updateDashboardStats() {
        // Simular datos del dashboard
        setTimeout(() => {
            const clients = JSON.parse(localStorage.getItem('csi_clients') || '[]');
            const quotes = JSON.parse(localStorage.getItem('csi_quotes') || '[]');
            
            document.getElementById('total-clients').textContent = clients.length;
            document.getElementById('total-quotes').textContent = quotes.length;
            document.getElementById('active-orders').textContent = '3';
            document.getElementById('month-income').textContent = '$45,800';
        }, 500);
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // ✅ USUARIOS CORRECTOS - quitamos "remember" que causaba error
    const users = [
        { username: 'admin', password: 'admin', name: 'Administrador', role: 'admin' },
        { username: 'usuario1', password: '1234', name: 'Usuario Demo', role: 'user' }
    ];

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        this.currentUser = user;
        sessionStorage.setItem('csi_user', JSON.stringify(user));
        
        this.showMainApp();
        this.showMessage(`Bienvenido, ${user.name}`, 'success');
        
        // ✅ LIMPIAR FORMULARIO después del login
        document.getElementById('login-form').reset();
    } else {
        this.showMessage('Usuario o contraseña incorrectos', 'error');
    }
}

    handleLogout() {
        this.currentUser = null;
        sessionStorage.removeItem('csi_user');
        localStorage.removeItem('csi_user');
        localStorage.removeItem('csi_remember');
        
        this.showLogin();
        this.showMessage('Sesión cerrada correctamente', 'success');
    }

    hasPermission(module) {
        if (!this.currentUser) return false;
        
        if (this.currentUser.role === 'admin') return true;
        
        return this.modules.user.includes(module);
    }

    getModuleTitle(module) {
        const titles = {
            dashboard: 'Dashboard Principal',
            crm: 'CRM - Gestión de Clientes',
            finance: 'Módulo Financiero',
            technical: 'Módulo Técnico',
            inventory: 'Gestión de Inventario',
            hr: 'Recursos Humanos',
            bi: 'Business Intelligence'
        };
        return titles[module] || module;
    }

    showMessage(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    generateReport() {
        this.showMessage('Generando reporte... Esta funcionalidad estará disponible pronto.', 'info');
    }
}

// Inicializar sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.csiSystem = new CSISystem();
    window.csiSystem.init();
});

// Funciones globales para uso en HTML
window.showNewClientModal = function() {
    if (typeof showClientModal === 'function') {
        showClientModal();
    } else {
        csiSystem.showMessage('Módulo de clientes aún no está completamente cargado', 'warning');
    }
};

window.showNewQuoteModal = function() {
    if (typeof showQuoteModal === 'function') {
        showQuoteModal();
    } else {
        csiSystem.showMessage('Módulo de cotizaciones aún no está completamente cargado', 'warning');
    }
};

// Utility functions
window.formatCurrency = function(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

window.formatDate = function(dateString) {
    return new Date(dateString).toLocaleDateString('es-MX');
};
