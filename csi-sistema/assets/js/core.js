// assets/js/core.js - VERSIÓN COMPATIBLE CON TU HTML
const CSI = {
    // Estado del sistema
    state: {
        currentUser: null,
        currentModule: 'dashboard',
        isAuthenticated: false
    },

    // Usuarios del sistema
    users: [
        { username: 'admin', password: 'admin', role: 'admin', name: 'Administrador' },
        { username: 'usuario1', password: '1234', role: 'user', name: 'Usuario Normal' }
    ],

    // Inicializar sistema
    init: function() {
        console.log('🚀 Iniciando Sistema CSI...');
        this.checkAuthStatus();
        this.setupEventListeners();
    },

    // Verificar estado de autenticación
    checkAuthStatus: function() {
        const savedUser = localStorage.getItem('csi_currentUser');
        if (savedUser) {
            this.state.currentUser = JSON.parse(savedUser);
            this.state.isAuthenticated = true;
            this.showMainApp();
        } else {
            this.showLogin();
        }
    },

    // Configurar event listeners
    setupEventListeners: function() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Navegación de módulos
        document.querySelectorAll('.csi-module-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const module = e.currentTarget.getAttribute('data-module');
                if (module && !e.currentTarget.classList.contains('coming-soon')) {
                    this.loadModule(module);
                }
            });
        });
    },

    // Manejar login
    handleLogin: function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.state.currentUser = user;
            this.state.isAuthenticated = true;
            
            // Guardar en localStorage
            localStorage.setItem('csi_currentUser', JSON.stringify(user));
            
            this.showMainApp();
            this.showMessage(`Bienvenido, ${user.name}`, 'success');
        } else {
            this.showMessage('Usuario o contraseña incorrectos', 'error');
        }
    },

    // Manejar logout
    logout: function() {
        this.state.currentUser = null;
        this.state.isAuthenticated = false;
        localStorage.removeItem('csi_currentUser');
        this.showLogin();
    },

    // Mostrar aplicación principal
    showMainApp: function() {
        document.getElementById('csi-login-container').style.display = 'none';
        document.getElementById('csi-header').style.display = 'block';
        document.getElementById('csi-main-container').style.display = 'block';
        
        this.updateUserInfo();
        this.loadModule('dashboard');
    },

    // Mostrar login
    showLogin: function() {
        document.getElementById('csi-login-container').style.display = 'flex';
        document.getElementById('csi-header').style.display = 'none';
        document.getElementById('csi-main-container').style.display = 'none';
    },

    // Actualizar información del usuario
    updateUserInfo: function() {
        const userInfoElement = document.getElementById('current-user');
        if (userInfoElement && this.state.currentUser) {
            userInfoElement.textContent = `${this.state.currentUser.name} (${this.state.currentUser.role})`;
        }
    },

    // === SISTEMA DE MÓDULOS ===

    // Cargar módulo
    loadModule: function(moduleName) {
        console.log(`📦 Cargando módulo: ${moduleName}`);
        this.state.currentModule = moduleName;
        
        // Actualizar navegación activa
        this.updateActiveNav();
        
        // Cargar contenido del módulo
        this.loadModuleContent(moduleName);
    },

    // Actualizar navegación activa
    updateActiveNav: function() {
        // Remover activo de todos los items
        document.querySelectorAll('.csi-module-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Activar el actual
        const activeItem = document.querySelector(`.csi-module-item[data-module="${this.state.currentModule}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    },

    // Cargar contenido del módulo
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

    // === FUNCIÓN loadModuleScript AÑADIDA ===
    loadModuleScript: function(src) {
        return new Promise((resolve, reject) => {
            // Verificar si el script ya está cargado
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

    // === CONTENIDO DE MÓDULOS ===

    // Cargar Dashboard
    loadDashboard: function(contentArea) {
        contentArea.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <h2 class="mb-4"><i class="fas fa-tachometer-alt me-2"></i>Dashboard Principal</h2>
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
                                <hr>
                                <button class="btn btn-danger" onclick="CSI.loadCRMContent('clients')">
                                    <i class="fas fa-user-plus me-2"></i>Gestión de Clientes
                                </button>
                            </div>
                        </div>
                    </div>
                    
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
                </div>
            </div>
        `;
    },

    // Cargar módulo CRM
    loadCRM: function(contentArea) {
        contentArea.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <h2 class="mb-4"><i class="fas fa-users me-2"></i>CRM Comercial</h2>
                        <p class="text-muted">Flujo de trabajo CSI: Cotización → Aprobación → OV# → Ejecución → Cobranza</p>
                    </div>
                </div>

                <div class="row mb-4">
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
                </div>
            </div>
        `;
    },

    // Cargar contenido específico del CRM
    loadCRMContent: function(section) {
        const contentArea = document.getElementById('csi-module-content');
        
        if (section === 'clients') {
            contentArea.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div><p class="mt-2">Cargando módulo de clientes...</p></div>';
            
            // Cargar módulos necesarios
            this.loadModuleScript('assets/js/utils/database.js')
                .then(() => {
                    return this.loadModuleScript('assets/js/modules/crm/clients.js');
                })
                .then(() => {
                    // Verificar que el módulo se cargó correctamente
                    if (typeof CSIClients !== 'undefined') {
                        // Crear contenedor específico para clientes
                        contentArea.innerHTML = '<div id="crm-clients-content"></div>';
                        
                        // Inicializar módulo de clientes
                        setTimeout(() => {
                            CSIClients.init();
                        }, 100);
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
            
            // Cargar database PRIMERO, luego quotes
            this.loadModuleScript('assets/js/utils/database.js')
                .then(() => {
                    return this.loadModuleScript('assets/js/modules/crm/quotes.js');
                })
                .then(() => {
                    if (typeof CSIQuotes !== 'undefined') {
                        contentArea.innerHTML = '<div id="crm-quotes-content"></div>';
                        setTimeout(() => {
                            CSIQuotes.init();
                        }, 100);
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
                
        } else if (section === 'orders') {
            // Mostrar placeholder para órdenes de venta
            contentArea.innerHTML = `
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                            <div class="alert alert-info">
                                <h4><i class="fas fa-tools me-2"></i>Módulo en Desarrollo</h4>
                                <p>El sistema de <strong>Órdenes de Venta</strong> está actualmente en desarrollo.</p>
                                <p><strong>Funcionalidades planeadas:</strong></p>
                                <ul>
                                    <li>Gestión de proyectos OV#</li>
                                    <li>Seguimiento de avances</li>
                                    <li>Control de tiempos y recursos</li>
                                </ul>
                                <div class="mt-3">
                                    <button class="btn btn-primary me-2" onclick="CSI.loadModule('crm')">
                                        <i class="fas fa-arrow-left me-2"></i>Volver al CRM
                                    </button>
                                    <button class="btn btn-success" onclick="CSI.loadCRMContent('clients')">
                                        <i class="fas fa-users me-2"></i>Ir a Gestión de Clientes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            this.showComingSoon();
        }
    },

    // Cargar módulo Técnico
    loadTechnical: function(contentArea) {
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

    // Cargar módulo Configuración
    loadConfig: function(contentArea) {
        // Solo permitir a administradores
        if (this.state.currentUser.role !== 'admin') {
            contentArea.innerHTML = `
                <div class="alert alert-warning">
                    <h4><i class="fas fa-exclamation-triangle me-2"></i>Acceso Denegado</h4>
                    <p>No tienes permisos para acceder a la configuración del sistema.</p>
                </div>
            `;
            return;
        }

        contentArea.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <h2 class="mb-4"><i class="fas fa-cog me-2"></i>Configuración del Sistema</h2>
                        <div class="alert alert-info">
                            <h4><i class="fas fa-tools me-2"></i>Módulo en Construcción</h4>
                            <p>La configuración del sistema estará disponible en la próxima actualización.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Template para módulos en desarrollo
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

    // Mostrar mensaje "próximamente"
    showComingSoon: function() {
        this.showMessage('🔧 Esta funcionalidad estará disponible en la próxima actualización', 'info');
    },

    // === SISTEMA DE MENSAJES ===

    // Mostrar mensaje
    showMessage: function(message, type = 'info') {
        // Remover mensajes anteriores
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

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            const messageElement = document.getElementById('csi-message');
            if (messageElement) {
                messageElement.remove();
            }
        }, 5000);
    }
};

// === FUNCIÓN GLOBAL PARA FORMULARIO DE CLIENTES ===
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