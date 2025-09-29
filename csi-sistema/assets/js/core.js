// assets/js/core.js - SISTEMA CSI CON CONTROL DE PERMISOS
const CSI = {
    // Estado del sistema MEJORADO
    state: {
        currentUser: null,
        currentModule: 'dashboard',
        isAuthenticated: false,
        userPermissions: {},
        userRole: null
    },

    // Base de datos de usuarios MEJORADA
    users: [
        { 
            id: 1, 
            username: 'admin', 
            password: 'admin', 
            role: 'admin', 
            name: 'Administrador',
            permissions: { full_access: true },
            assigned_clients: []
        },
        { 
            id: 2, 
            username: 'vendedor1', 
            password: '1234', 
            role: 'vendedor', 
            name: 'Juan Vendedor',
            permissions: {
                crm: ['view', 'create'],
                clients: ['view_assigned', 'edit_own'],
                quotes: ['create', 'edit_own'],
                orders: ['view', 'create']
            },
            assigned_clients: [1, 2]
        },
        { 
            id: 3, 
            username: 'tecnico1', 
            password: '1234', 
            role: 'tecnico', 
            name: 'Carlos Técnico',
            permissions: {
                technical: ['view', 'edit'],
                orders: ['view_assigned', 'update_checklist']
            },
            assigned_clients: []
        }
    ],

    // Roles del sistema NUEVO
    roles: {
        admin: {
            name: 'Administrador',
            permissions: ['*'],
            modules: ['dashboard', 'crm', 'technical', 'config']
        },
        gerente: {
            name: 'Gerente Comercial',
            permissions: ['crm:view', 'crm:edit', 'reports:view'],
            modules: ['dashboard', 'crm']
        },
        vendedor: {
            name: 'Vendedor',
            permissions: ['crm:view_own', 'crm:create', 'clients:view_assigned'],
            modules: ['dashboard', 'crm']
        },
        tecnico: {
            name: 'Técnico',
            permissions: ['technical:view', 'orders:view_assigned', 'checklist:update'],
            modules: ['dashboard', 'technical']
        },
        finanzas: {
            name: 'Finanzas',
            permissions: ['finance:view', 'reports:view'],
            modules: ['dashboard', 'finance']
        }
    },

    // Inicializar sistema MEJORADO
    init: function() {
        console.log('🚀 Iniciando Sistema CSI con Control de Permisos...');
        this.loadSystemData();
        this.checkAuthStatus();
        this.setupEventListeners();
    },

    // Cargar datos del sistema NUEVO
    loadSystemData: function() {
        try {
            // Intentar cargar desde localStorage
            const savedUsers = localStorage.getItem('csi_users');
            const savedRoles = localStorage.getItem('csi_roles');
            
            if (savedUsers) this.users = JSON.parse(savedUsers);
            if (savedRoles) this.roles = JSON.parse(savedRoles);
            
        } catch (error) {
            console.log('📂 Usando datos predefinidos del sistema');
        }
    },


    // Mostrar pantalla de login
showLogin: function() {
    // SOLO esto, no tocar display
    document.getElementById('csi-header').style.display = 'none';
    document.getElementById('csi-main-container').style.display = 'none';
},


    
    // Verificar estado de autenticación MEJORADO
    checkAuthStatus: function() {
    const savedUser = localStorage.getItem('csi_currentUser');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        this.state.currentUser = userData;
        this.state.isAuthenticated = true;
        this.state.userRole = userData.role;
        this.state.userPermissions = userData.permissions || {};
        this.showMainApp();
    } else {
        this.showLogin();
    }
},

    // Configurar event listeners (igual)
    setupEventListeners: function() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        document.querySelectorAll('.csi-module-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const module = e.currentTarget.getAttribute('data-module');
                if (module && !e.currentTarget.classList.contains('coming-soon')) {
                    this.loadModule(module);
                }
            });
        });
    },

    // Manejar login MEJORADO
    handleLogin: function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.state.currentUser = user;
            this.state.isAuthenticated = true;
            this.state.userRole = user.role;
            this.state.userPermissions = user.permissions || {};
            
            // Guardar en localStorage
            localStorage.setItem('csi_currentUser', JSON.stringify(user));
            
            this.showMainApp();
            this.showMessage(`Bienvenido, ${user.name} (${this.roles[user.role]?.name || user.role})`, 'success');
        } else {
            this.showMessage('Usuario o contraseña incorrectos', 'error');
        }
    },

    // Manejar logout MEJORADO
    logout: function() {
    this.state.currentUser = null;
    this.state.isAuthenticated = false;
    this.state.userRole = null;
    this.state.userPermissions = {};
    localStorage.removeItem('csi_currentUser');
    
    // MOSTRAR LOGIN CORRECTAMENTE
    document.getElementById('csi-login-container').style.display = 'flex';
    document.getElementById('csi-header').style.display = 'none';
    document.getElementById('csi-main-container').style.display = 'none';
    
    // LIMPIAR FORMULARIO
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
},




    // Mostrar aplicación principal MEJORADO
    showMainApp: function() {
        document.getElementById('csi-login-container').style.display = 'none';
        document.getElementById('csi-header').style.display = 'block';
        document.getElementById('csi-main-container').style.display = 'block';
        
        this.updateUserInfo();
        this.updateNavigation(); // NUEVO: Actualizar navegación por permisos
        this.loadModule('dashboard');
    },

    // Actualizar información del usuario MEJORADO
    updateUserInfo: function() {
        const userInfoElement = document.getElementById('current-user');
        if (userInfoElement && this.state.currentUser) {
            const roleName = this.roles[this.state.userRole]?.name || this.state.userRole;
            userInfoElement.textContent = `${this.state.currentUser.name} (${roleName})`;
        }
    },

    // Actualizar navegación por permisos NUEVO
    updateNavigation: function() {
        document.querySelectorAll('.csi-module-item').forEach(item => {
            const module = item.getAttribute('data-module');
            const allowedModules = this.roles[this.state.userRole]?.modules || [];
            
            if (module && !allowedModules.includes(module) && module !== 'dashboard') {
                item.style.display = 'none';
            } else {
                item.style.display = 'flex';
            }
        });
    },

    // === SISTEMA DE MÓDULOS MEJORADO ===

    // Verificar permisos NUEVO
    hasPermission: function(module, action = 'view') {
        if (this.state.userRole === 'admin') return true;
        if (!this.state.userPermissions) return false;
        
        // Permisos full_access
        if (this.state.userPermissions.full_access) return true;
        
        // Permisos específicos por módulo
        const modulePermissions = this.state.userPermissions[module];
        if (modulePermissions) {
            return modulePermissions.includes(action) || modulePermissions.includes('*');
        }
        
        return false;
    },

    // Cargar módulo MEJORADO
    loadModule: function(moduleName) {
        // Verificar permisos antes de cargar
        if (!this.hasPermission(moduleName, 'view')) {
            this.showMessage('No tienes permisos para acceder a este módulo', 'error');
            this.loadModule('dashboard');
            return;
        }

        console.log(`📦 Cargando módulo: ${moduleName} (Usuario: ${this.state.userRole})`);
        this.state.currentModule = moduleName;
        
        this.updateActiveNav();
        this.loadModuleContent(moduleName);
    },

    // Actualizar navegación activa (igual)
    updateActiveNav: function() {
        document.querySelectorAll('.csi-module-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`.csi-module-item[data-module="${this.state.currentModule}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    },

    // Cargar contenido del módulo MEJORADO
    loadModuleContent: function(moduleName) {
        const contentArea = document.getElementById('csi-module-content');
        
        switch (moduleName) {
            case 'dashboard':
                this.loadDashboard(contentArea);
                break;
                
            case 'crm':
                this.loadCRM(contentArea);
                break;
                
            case 'technical':
                this.loadTechnical(contentArea);
                break;
                
            case 'config':
                this.loadConfig(contentArea);
                break;
                
            default:
                contentArea.innerHTML = this.getComingSoonTemplate(moduleName);
        }
    },

    // === FUNCIÓN loadModuleScript (igual) ===
    loadModuleScript: function(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    // === CONTENIDO DE MÓDULOS ACTUALIZADO ===

    // Cargar Dashboard MEJORADO
    loadDashboard: function(contentArea) {
        const userName = this.state.currentUser?.name || 'Usuario';
        const roleName = this.roles[this.state.userRole]?.name || this.state.userRole;
        
        contentArea.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <h2 class="mb-4"><i class="fas fa-tachometer-alt me-2"></i>Dashboard Principal</h2>
                        <p class="text-muted">Bienvenido <strong>${userName}</strong> - ${roleName}</p>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card bg-primary text-white">
                            <div class="card-body text-center">
                                <h3>12</h3>
                                <p>Clientes Activos</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-success text-white">
                            <div class="card-body text-center">
                                <h3>8</h3>
                                <p>Proyectos en Curso</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-warning text-white">
                            <div class="card-body text-center">
                                <h3>5</h3>
                                <p>Cotizaciones Pendientes</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-danger text-white">
                            <div class="card-body text-center">
                                <h3>$125,000</h3>
                                <p>Ventas del Mes</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    ${this.hasPermission('crm', 'view') ? `
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-danger text-white">
                                <h5 class="mb-0"><i class="fas fa-users me-2"></i>Acceso Rápido - CRM</h5>
                            </div>
                            <div class="card-body">
                                <p>Gestión completa de clientes y proyectos</p>
                                <button class="btn btn-outline-danger" onclick="CSI.loadModule('crm')">
                                    <i class="fas fa-arrow-right me-2"></i>Ir al CRM
                                </button>
                                ${this.hasPermission('clients', 'view') ? `
                                <hr>
                                <button class="btn btn-danger" onclick="CSI.loadCRMContent('clients')">
                                    <i class="fas fa-user-plus me-2"></i>Gestión de Clientes
                                </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${this.hasPermission('technical', 'view') ? `
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-primary text-white">
                                <h5 class="mb-0"><i class="fas fa-tools me-2"></i>Acceso Rápido - Técnico</h5>
                            </div>
                            <div class="card-body">
                                <p>Herramientas técnicas y cálculos</p>
                                <button class="btn btn-outline-primary" onclick="CSI.loadModule('technical')">
                                    <i class="fas fa-arrow-right me-2"></i>Ir a Herramientas
                                </button>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // Cargar módulo CRM MEJORADO
    loadCRM: function(contentArea) {
        if (!this.hasPermission('crm', 'view')) {
            contentArea.innerHTML = this.getPermissionDeniedTemplate('CRM');
            return;
        }

        contentArea.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <h2 class="mb-4"><i class="fas fa-users me-2"></i>CRM Comercial</h2>
                        <p class="text-muted">Flujo de trabajo CSI: Cotización → Aprobación → OV# → Ejecución → Cobranza</p>
                    </div>
                </div>

                <div class="row mb-4">
                    ${this.hasPermission('clients', 'view') ? `
                    <div class="col-md-4">
                        <div class="card h-100">
                            <div class="card-header bg-danger text-white">
                                <h5 class="mb-0"><i class="fas fa-users me-2"></i>Gestión de Clientes</h5>
                            </div>
                            <div class="card-body">
                                <p class="small">Base de datos centralizada de clientes con historial completo y seguimiento comercial</p>
                                <ul class="list-unstyled small">
                                    <li><i class="fas fa-check text-success me-2"></i>Registro y categorización</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Historial de proyectos</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Documentación digital</li>
                                </ul>
                                <button class="btn btn-danger w-100" onclick="CSI.loadCRMContent('clients')">
                                    <i class="fas fa-arrow-right me-2"></i>Abrir Gestión de Clientes
                                </button>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${this.hasPermission('quotes', 'view') ? `
                    <div class="col-md-4">
                        <div class="card h-100">
                            <div class="card-header bg-warning text-white">
                                <h5 class="mb-0"><i class="fas fa-file-invoice-dollar me-2"></i>Cotizaciones</h5>
                            </div>
                            <div class="card-body">
                                <p class="small">Sistema de cotizaciones técnicas con cálculos automatizados y generación de documentos</p>
                                <ul class="list-unstyled small">
                                    <li><i class="fas fa-calculator text-warning me-2"></i>Cálculos técnicos integrados</li>
                                    <li><i class="fas fa-file-pdf text-warning me-2"></i>Generador de PDF profesional</li>
                                    <li><i class="fas fa-history text-warning me-2"></i>Seguimiento de estatus</li>
                                </ul>
                                <button class="btn btn-warning w-100" onclick="CSI.loadCRMContent('quotes')">
                                    <i class="fas fa-arrow-right me-2"></i>Abrir Cotizaciones
                                </button>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${this.hasPermission('orders', 'view') ? `
                    <div class="col-md-4">
                        <div class="card h-100">
                            <div class="card-header bg-info text-white">
                                <h5 class="mb-0"><i class="fas fa-clipboard-list me-2"></i>Órdenes de Venta</h5>
                            </div>
                            <div class="card-body">
                                <p class="small">Control completo de órdenes OV# con seguimiento de proyectos y avances</p>
                                <ul class="list-unstyled small">
                                    <li><i class="fas fa-project-diagram text-info me-2"></i>Gestión de proyectos</li>
                                    <li><i class="fas fa-tasks text-info me-2"></i>Control de avances</li>
                                    <li><i class="fas fa-chart-line text-info me-2"></i>Métricas de ejecución</li>
                                </ul>
                                <button class="btn btn-info w-100" onclick="CSI.loadCRMContent('orders')">
                                    <i class="fas fa-arrow-right me-2"></i>Abrir Órdenes de Venta
                                </button>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // Cargar contenido específico del CRM MEJORADO
    loadCRMContent: function(section) {
        // Verificar permisos específicos por sección
        if (!this.hasPermission(section, 'view')) {
            const contentArea = document.getElementById('csi-module-content');
            contentArea.innerHTML = this.getPermissionDeniedTemplate(section);
            return;
        }

        const contentArea = document.getElementById('csi-module-content');
        
        if (section === 'clients') {
            contentArea.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div><p class="mt-2">Cargando módulo de clientes...</p></div>';
            
            this.loadModuleScript('assets/js/utils/database.js')
                .then(() => this.loadModuleScript('assets/js/modules/crm/clients.js'))
                .then(() => {
                    if (typeof CSIClients !== 'undefined') {
                        contentArea.innerHTML = '<div id="crm-clients-content"></div>';
                        setTimeout(() => CSIClients.init(), 100);
                    } else {
                        throw new Error('Módulo CSIClients no disponible');
                    }
                })
                .catch(error => {
                    console.error('Error cargando módulos:', error);
                    contentArea.innerHTML = `
                        <div class="alert alert-danger">
                            <h4><i class="fas fa-exclamation-triangle me-2"></i>Error de carga</h4>
                            <p>No se pudieron cargar los módulos necesarios.</p>
                            <div class="mt-3">
                                <button class="btn btn-primary me-2" onclick="CSI.loadModule('crm')">
                                    <i class="fas fa-arrow-left me-2"></i>Volver al CRM
                                </button>
                                <button class="btn btn-secondary" onclick="CSI.loadCRMContent('clients')">
                                    <i class="fas fa-redo me-2"></i>Reintentar
                                </button>
                            </div>
                        </div>
                    `;
                });
                
        } else if (section === 'quotes') {
            contentArea.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div><p class="mt-2">Cargando módulo de cotizaciones...</p></div>';
            
            this.loadModuleScript('assets/js/utils/database.js')
                .then(() => this.loadModuleScript('assets/js/modules/crm/quotes.js'))
                .then(() => {
                    if (typeof CSIQuotes !== 'undefined') {
                        contentArea.innerHTML = '<div id="crm-quotes-content"></div>';
                        setTimeout(() => CSIQuotes.init(), 100);
                    } else {
                        throw new Error('Módulo CSIQuotes no disponible');
                    }
                })
                .catch(error => {
                    console.error('Error cargando cotizaciones:', error);
                    contentArea.innerHTML = `
                        <div class="alert alert-danger">
                            <h4><i class="fas fa-exclamation-triangle me-2"></i>Error de carga</h4>
                            <p>No se pudo cargar el módulo de cotizaciones: ${error.message}</p>
                            <button class="btn btn-primary mt-2" onclick="CSI.loadModule('crm')">
                                <i class="fas fa-arrow-left me-2"></i>Volver al CRM
                            </button>
                        </div>
                    `;
                });
                
        } else if (section === "orders") {
            contentArea.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-info"></div><p class="mt-2">Cargando módulo de Órdenes...</p></div>';

            this.loadModuleScript("assets/js/modules/crm/orders.js")
                .then(() => {
                    if (typeof CSIOrders !== 'undefined') {
                        CSIOrders.init(contentArea);
                    } else {
                        contentArea.innerHTML = `
                            <div class="alert alert-warning">
                                <h4>Módulo de Órdenes no disponible</h4>
                                <p>El módulo no se cargó correctamente.</p>
                            </div>
                        `;
                    }
                })
                .catch(err => {
                    console.error('Error cargando órdenes:', err);
                    contentArea.innerHTML = `
                        <div class="alert alert-danger">
                            <h4>Error cargando módulo de Órdenes</h4>
                            <p>${err.message}</p>
                        </div>
                    `;
                });
        }
    },

    // Cargar módulo Técnico MEJORADO
    loadTechnical: function(contentArea) {
        if (!this.hasPermission('technical', 'view')) {
            contentArea.innerHTML = this.getPermissionDeniedTemplate('Herramientas Técnicas');
            return;
        }

        contentArea.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <h2 class="mb-4"><i class="fas fa-tools me-2"></i>Herramientas Técnicas</h2>
                        <div class="alert alert-info">
                            <h4><i class="fas fa-tools me-2"></i>Módulo en Construcción</h4>
                            <p>Las herramientas técnicas estarán disponibles en la próxima actualización.</p>
                            <ul>
                                <li>Calculadora de Racks de Compresores</li>
                                <li>Cálculo de Cargas Térmicas</li>
                                <li>Especificaciones Técnicas</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Cargar módulo Configuración NUEVO
    loadConfig: function(contentArea) {
    // Solo admin puede acceder a configuración
    if (this.state.userRole !== 'admin') {
        contentArea.innerHTML = this.getPermissionDeniedTemplate('Configuración del Sistema');
        return;
    }

    contentArea.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div><p class="mt-2">Cargando módulo de configuración...</p></div>';

    this.loadModuleScript('assets/js/modules/system/config-main.js')
        .then(() => {
            if (typeof CSIConfig !== 'undefined') {
                CSIConfig.init(contentArea);
            } else {
                throw new Error('Módulo CSIConfig no disponible');
            }
        })
        .catch(error => {
            console.error('Error cargando configuración:', error);
            contentArea.innerHTML = `
                <div class="alert alert-danger">
                    <h4><i class="fas fa-exclamation-triangle me-2"></i>Error de carga</h4>
                    <p>No se pudo cargar el módulo de configuración: ${error.message}</p>
                    <button class="btn btn-primary mt-2" onclick="CSI.loadModule('dashboard')">
                        <i class="fas fa-arrow-left me-2"></i>Volver al Dashboard
                    </button>
                </div>
            `;
        });
},

    // Template para permisos denegados NUEVO
    getPermissionDeniedTemplate: function(moduleName) {
        return `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="alert alert-warning text-center py-5">
                            <i class="fas fa-lock fa-3x mb-3"></i>
                            <h3>Acceso Denegado</h3>
                            <p>No tienes permisos para acceder al módulo <strong>${moduleName}</strong>.</p>
                            <p class="text-muted">Tu rol actual: <strong>${this.roles[this.state.userRole]?.name || this.state.userRole}</strong></p>
                            <button class="btn btn-primary mt-3" onclick="CSI.loadModule('dashboard')">
                                <i class="fas fa-arrow-left me-2"></i>Volver al Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Template para módulos en desarrollo (igual)
    getComingSoonTemplate: function(moduleName) {
        return `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="alert alert-info text-center py-5">
                            <i class="fas fa-tools fa-3x mb-3"></i>
                            <h3>Módulo en Desarrollo</h3>
                            <p>El módulo <strong>${moduleName}</strong> estará disponible próximamente.</p>
                            <button class="btn btn-primary mt-3" onclick="CSI.loadModule('dashboard')">
                                <i class="fas fa-arrow-left me-2"></i>Volver al Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Mostrar mensaje "próximamente" (igual)
    showComingSoon: function() {
        this.showMessage('🔧 Esta funcionalidad estará disponible en la próxima actualización', 'info');
    },

    // === SISTEMA DE MENSAJES (igual) ===
    showMessage: function(message, type = 'info') {
        const existingMessage = document.getElementById('csi-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type] || 'alert-info';

        const messageHTML = `
            <div id="csi-message" class="alert ${alertClass} alert-dismissible fade show" role="alert" style="position: fixed; top: 80px; right: 20px; z-index: 1000; min-width: 300px;">
                <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
                ${message}
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', messageHTML);

        setTimeout(() => {
            const messageElement = document.getElementById('csi-message');
            if (messageElement) {
                messageElement.remove();
            }
        }, 5000);
    }
};

// === FUNCIÓN GLOBAL PARA FORMULARIO DE CLIENTES (igual) ===
window.showClientForm = function() {
    if (typeof CSIClients !== 'undefined') {
        CSIClients.showClientForm();
    } else {
        alert('El módulo de clientes no está cargado. Por favor, ve a CRM → Gestión de Clientes primero.');
    }
};

// Inicializar sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    CSI.init();
});

// Hacer global
window.CSI = CSI;