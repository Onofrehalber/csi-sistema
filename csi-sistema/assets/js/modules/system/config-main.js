// assets/js/modules/system/config-main.js
// MÓDULO PRINCIPAL DE CONFIGURACIÓN DEL SISTEMA CSI

const CSIConfig = {
    currentSection: 'dashboard',
    
    // Inicializar módulo
    init: function(container = null) {
        console.log('⚙️ Módulo de Configuración inicializado');
        this.container = container || document.getElementById('csi-module-content');
        if (!this.container) {
            console.error('❌ No se encontró el contenedor para configuración');
            return;
        }
        this.renderConfigDashboard();
    },

    // Renderizar dashboard de configuración
    renderConfigDashboard: function() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <h2 class="mb-4"><i class="fas fa-cog me-2"></i>Configuración del Sistema</h2>
                        <p class="text-muted">Administra todos los aspectos del sistema CSI Refrigeración</p>
                    </div>
                </div>

                <!-- Tarjetas de Configuración -->
                <div class="row">
                    <!-- Gestión de Usuarios -->
                    <div class="col-md-4 mb-4">
                        <div class="card config-card h-100">
                            <div class="card-header bg-primary text-white">
                                <h5 class="mb-0"><i class="fas fa-users me-2"></i>Gestión de Usuarios</h5>
                            </div>
                            <div class="card-body">
                                <p class="small">Administra usuarios, contraseñas y accesos al sistema</p>
                                <ul class="list-unstyled small text-muted">
                                    <li><i class="fas fa-user-plus me-2"></i>Crear nuevos usuarios</li>
                                    <li><i class="fas fa-edit me-2"></i>Modificar permisos</li>
                                    <li><i class="fas fa-lock me-2"></i>Gestionar contraseñas</li>
                                </ul>
                                <button class="btn btn-primary w-100 mt-3" onclick="CSIConfig.loadSection('users')">
                                    <i class="fas fa-arrow-right me-2"></i>Abrir Gestión de Usuarios
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Roles y Permisos -->
                    <div class="col-md-4 mb-4">
                        <div class="card config-card h-100">
                            <div class="card-header bg-success text-white">
                                <h5 class="mb-0"><i class="fas fa-user-shield me-2"></i>Roles y Permisos</h5>
                            </div>
                            <div class="card-body">
                                <p class="small">Configura roles del sistema y permisos granulares</p>
                                <ul class="list-unstyled small text-muted">
                                    <li><i class="fas fa-layer-group me-2"></i>Gestionar roles</li>
                                    <li><i class="fas fa-key me-2"></i>Asignar permisos</li>
                                    <li><i class="fas fa-sitemap me-2"></i>Jerarquías de acceso</li>
                                </ul>
                                <button class="btn btn-success w-100 mt-3" onclick="CSIConfig.loadSection('roles')">
                                    <i class="fas fa-arrow-right me-2"></i>Abrir Roles y Permisos
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Información de Empresa -->
                    <div class="col-md-4 mb-4">
                        <div class="card config-card h-100">
                            <div class="card-header bg-info text-white">
                                <h5 class="mb-0"><i class="fas fa-building me-2"></i>Información de Empresa</h5>
                            </div>
                            <div class="card-body">
                                <p class="small">Configura datos fiscales y información corporativa</p>
                                <ul class="list-unstyled small text-muted">
                                    <li><i class="fas fa-file-invoice me-2"></i>Datos fiscales</li>
                                    <li><i class="fas fa-address-card me-2"></i>Información contacto</li>
                                    <li><i class="fas fa-palette me-2"></i>Personalización</li>
                                </ul>
                                <button class="btn btn-info w-100 mt-3" onclick="CSIConfig.loadSection('company')">
                                    <i class="fas fa-arrow-right me-2"></i>Abrir Empresa
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Flujos de Trabajo -->
                    <div class="col-md-4 mb-4">
                        <div class="card config-card h-100">
                            <div class="card-header bg-warning text-white">
                                <h5 class="mb-0"><i class="fas fa-project-diagram me-2"></i>Flujos de Trabajo</h5>
                            </div>
                            <div class="card-body">
                                <p class="small">Configura estados y procesos del negocio</p>
                                <ul class="list-unstyled small text-muted">
                                    <li><i class="fas fa-tasks me-2"></i>Estados de cotizaciones</li>
                                    <li><i class="fas fa-clipboard-check me-2"></i>Checklists por orden</li>
                                    <li><i class="fas fa-bell me-2"></i>Notificaciones</li>
                                </ul>
                                <button class="btn btn-warning w-100 mt-3" onclick="CSIConfig.loadSection('workflows')">
                                    <i class="fas fa-arrow-right me-2"></i>Abrir Flujos
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Parámetros Comerciales -->
                    <div class="col-md-4 mb-4">
                        <div class="card config-card h-100">
                            <div class="card-header bg-danger text-white">
                                <h5 class="mb-0"><i class="fas fa-chart-line me-2"></i>Parámetros Comerciales</h5>
                            </div>
                            <div class="card-body">
                                <p class="small">Configura reglas de negocio y parámetros comerciales</p>
                                <ul class="list-unstyled small text-muted">
                                    <li><i class="fas fa-handshake me-2"></i>Tipos de cliente</li>
                                    <li><i class="fas fa-calendar-alt me-2"></i>Días de crédito</li>
                                    <li><i class="fas fa-percentage me-2"></i>Comisiones</li>
                                </ul>
                                <button class="btn btn-danger w-100 mt-3" onclick="CSIConfig.loadSection('commercial')">
                                    <i class="fas fa-arrow-right me-2"></i>Abrir Parámetros
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Seguridad y Backup -->
                    <div class="col-md-4 mb-4">
                        <div class="card config-card h-100">
                            <div class="card-header bg-dark text-white">
                                <h5 class="mb-0"><i class="fas fa-shield-alt me-2"></i>Seguridad y Backup</h5>
                            </div>
                            <div class="card-body">
                                <p class="small">Configura seguridad, backups y políticas del sistema</p>
                                <ul class="list-unstyled small text-muted">
                                    <li><i class="fas fa-database me-2"></i>Backups automáticos</li>
                                    <li><i class="fas fa-history me-2"></i>Logs de actividad</li>
                                    <li><i class="fas fa-lock me-2"></i>Políticas seguridad</li>
                                </ul>
                                <button class="btn btn-dark w-100 mt-3" onclick="CSIConfig.loadSection('security')">
                                    <i class="fas fa-arrow-right me-2"></i>Abrir Seguridad
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Estadísticas Rápidas -->
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header bg-secondary text-white">
                                <h5 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Resumen del Sistema</h5>
                            </div>
                            <div class="card-body">
                                <div class="row text-center">
                                    <div class="col-md-2">
                                        <h4 class="text-primary">${this.getUserCount()}</h4>
                                        <small class="text-muted">Usuarios Activos</small>
                                    </div>
                                    <div class="col-md-2">
                                        <h4 class="text-success">${this.getRoleCount()}</h4>
                                        <small class="text-muted">Roles Configurados</small>
                                    </div>
                                    <div class="col-md-2">
                                        <h4 class="text-info">${this.getClientCount()}</h4>
                                        <small class="text-muted">Clientes en Sistema</small>
                                    </div>
                                    <div class="col-md-2">
                                        <h4 class="text-warning">${this.getOrderCount()}</h4>
                                        <small class="text-muted">Órdenes Activas</small>
                                    </div>
                                    <div class="col-md-2">
                                        <h4 class="text-danger">${this.getQuoteCount()}</h4>
                                        <small class="text-muted">Cotizaciones Pendientes</small>
                                    </div>
                                    <div class="col-md-2">
                                        <h4 class="text-dark">v2.1</h4>
                                        <small class="text-muted">Versión Sistema</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Cargar sección específica de configuración
    loadSection: function(section) {
        this.currentSection = section;
        
        switch(section) {
            case 'users':
                this.loadUsersSection();
                break;
            case 'roles':
                this.loadRolesSection();
                break;
            case 'company':
                this.loadCompanySection();
                break;
            case 'workflows':
                this.loadWorkflowsSection();
                break;
            case 'commercial':
                this.loadCommercialSection();
                break;
            case 'security':
                this.loadSecuritySection();
                break;
            default:
                this.renderConfigDashboard();
        }
    },


    // Cargar sección de usuarios
loadUsersSection: function() {
    this.container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div><p class="mt-2">Cargando gestión de usuarios...</p></div>';
    
    // Cargar el módulo de usuarios
    CSI.loadModuleScript('assets/js/modules/system/config-users.js')
        .then(() => {
            if (typeof CSIUsersConfig !== 'undefined') {
                CSIUsersConfig.init(this.container);
            } else {
                throw new Error('Módulo CSIUsersConfig no disponible');
            }
        })
        .catch(error => {
            console.error('Error cargando gestión de usuarios:', error);
            this.container.innerHTML = `
                <div class="alert alert-danger">
                    <h4><i class="fas fa-exclamation-triangle me-2"></i>Error de carga</h4>
                    <p>No se pudo cargar el módulo de gestión de usuarios.</p>
                    <button class="btn btn-primary mt-2" onclick="CSIConfig.renderConfigDashboard()">
                        <i class="fas fa-arrow-left me-2"></i>Volver a Configuración
                    </button>
                </div>
            `;
        });
},

    // Cargar sección de roles
    
loadRolesSection: function() {
    this.container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div><p class="mt-2">Cargando roles y permisos...</p></div>';
    
    // Cargar el módulo de roles
    CSI.loadModuleScript('assets/js/modules/system/config-roles.js')
        .then(() => {
            if (typeof CSIRolesConfig !== 'undefined') {
                CSIRolesConfig.init(this.container);
            } else {
                throw new Error('Módulo CSIRolesConfig no disponible');
            }
        })
        .catch(error => {
            console.error('Error cargando roles y permisos:', error);
            this.container.innerHTML = `
                <div class="alert alert-danger">
                    <h4><i class="fas fa-exclamation-triangle me-2"></i>Error de carga</h4>
                    <p>No se pudo cargar el módulo de roles y permisos.</p>
                    <button class="btn btn-primary mt-2" onclick="CSIConfig.renderConfigDashboard()">
                        <i class="fas fa-arrow-left me-2"></i>Volver a Configuración
                    </button>
                </div>
            `;
        });
},
    // Cargar sección de empresa
loadCompanySection: function() {
    this.container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div><p class="mt-2">Cargando información de empresa...</p></div>';
    
    // Cargar el módulo de empresa
    CSI.loadModuleScript('assets/js/modules/system/config-company.js')
        .then(() => {
            if (typeof CSICompanyConfig !== 'undefined') {
                CSICompanyConfig.init(this.container);
            } else {
                throw new Error('Módulo CSICompanyConfig no disponible');
            }
        })
        .catch(error => {
            console.error('Error cargando información de empresa:', error);
            this.container.innerHTML = `
                <div class="alert alert-danger">
                    <h4><i class="fas fa-exclamation-triangle me-2"></i>Error de carga</h4>
                    <p>No se pudo cargar el módulo de información de empresa.</p>
                    <button class="btn btn-primary mt-2" onclick="CSIConfig.renderConfigDashboard()">
                        <i class="fas fa-arrow-left me-2"></i>Volver a Configuración
                    </button>
                </div>
            `;
        });
},

    // Cargar sección de flujos
    loadWorkflowsSection: function() {
        this.container.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h4><i class="fas fa-project-diagram me-2"></i>Flujos de Trabajo</h4>
                            <button class="btn btn-primary" onclick="CSIConfig.renderConfigDashboard()">
                                <i class="fas fa-arrow-left me-2"></i>Volver al Configuración
                            </button>
                        </div>
                        <p class="text-muted">Configura los estados y procesos del negocio</p>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Módulo en Desarrollo</strong> - La configuración de flujos de trabajo estará disponible en la próxima actualización.
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Cargar sección comercial
    loadCommercialSection: function() {
        this.container.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h4><i class="fas fa-chart-line me-2"></i>Parámetros Comerciales</h4>
                            <button class="btn btn-primary" onclick="CSIConfig.renderConfigDashboard()">
                                <i class="fas fa-arrow-left me-2"></i>Volver al Configuración
                            </button>
                        </div>
                        <p class="text-muted">Configura reglas de negocio y parámetros comerciales</p>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Módulo en Desarrollo</strong> - Los parámetros comerciales estarán disponibles en la próxima actualización.
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Cargar sección de seguridad
    loadSecuritySection: function() {
        this.container.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h4><i class="fas fa-shield-alt me-2"></i>Seguridad y Backup</h4>
                            <button class="btn btn-primary" onclick="CSIConfig.renderConfigDashboard()">
                                <i class="fas fa-arrow-left me-2"></i>Volver al Configuración
                            </button>
                        </div>
                        <p class="text-muted">Configura seguridad, backups y políticas del sistema</p>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Módulo en Desarrollo</strong> - La configuración de seguridad estará disponible en la próxima actualización.
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Helper functions para estadísticas
    getUserCount: function() {
        return CSI.users ? CSI.users.length : 0;
    },

    getRoleCount: function() {
        return CSI.roles ? Object.keys(CSI.roles).length : 0;
    },

    getClientCount: function() {
        try {
            const clients = CSIClients ? CSIClients.getClients() : [];
            return clients.length;
        } catch {
            return 0;
        }
    },

    getOrderCount: function() {
        try {
            const orders = CSIOrders ? CSIOrders.getOrders() : [];
            return orders.length;
        } catch {
            return 0;
        }
    },

    getQuoteCount: function() {
        try {
            const quotes = CSIQuotes ? CSIQuotes.getQuotes() : [];
            return quotes.filter(q => q.estatus === 'pendiente').length;
        } catch {
            return 0;
        }
    },

    // Mostrar mensaje
    showMessage: function(message, type) {
        CSI.showMessage(message, type);
    }
};

// Hacer global
window.CSIConfig = CSIConfig;