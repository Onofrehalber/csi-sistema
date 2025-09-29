// assets/js/modules/system/config-roles.js
// GESTIÓN COMPLETA DE ROLES Y PERMISOS DEL SISTEMA CSI

const CSIRolesConfig = {
    currentView: 'list',
    selectedRole: null,
    roles: {},
    availableModules: ['dashboard', 'crm', 'technical', 'finance', 'reports', 'config'],
    availablePermissions: ['view', 'create', 'edit', 'delete', 'approve', 'export'],

    // Inicializar módulo
    init: function(container = null) {
        console.log('🎭 Módulo de Roles y Permisos inicializado');
        this.container = container || document.getElementById('csi-module-content');
        this.loadRoles();
        this.renderRoleManagement();
    },

    // Cargar roles del sistema
    loadRoles: function() {
        try {
            const savedRoles = localStorage.getItem('csi_roles');
            this.roles = savedRoles ? JSON.parse(savedRoles) : CSI.roles || {};
        } catch (error) {
            console.error('Error cargando roles:', error);
            this.roles = {};
        }
    },

    // Guardar roles
    saveRoles: function() {
        localStorage.setItem('csi_roles', JSON.stringify(this.roles));
        // Actualizar también en CSI global
        if (typeof CSI !== 'undefined') {
            CSI.roles = this.roles;
        }
    },

    // Renderizar gestión de roles
    renderRoleManagement: function() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h4><i class="fas fa-user-shield me-2"></i>Roles y Permisos</h4>
                            <div>
                                <button class="btn btn-primary" onclick="CSIRolesConfig.showRoleForm()">
                                    <i class="fas fa-plus me-2"></i>Nuevo Rol
                                </button>
                                <button class="btn btn-secondary ms-2" onclick="CSIConfig.renderConfigDashboard()">
                                    <i class="fas fa-arrow-left me-2"></i>Volver
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Estadísticas -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card bg-primary text-white">
                            <div class="card-body text-center py-3">
                                <h5>${Object.keys(this.roles).length}</h5>
                                <small>Roles Configurados</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-success text-white">
                            <div class="card-body text-center py-3">
                                <h5>${this.getUsersByRole('admin').length}</h5>
                                <small>Usuarios Admin</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-info text-white">
                            <div class="card-body text-center py-3">
                                <h5>${this.getUsersByRole('vendedor').length}</h5>
                                <small>Usuarios Vendedor</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-warning text-white">
                            <div class="card-body text-center py-3">
                                <h5>${this.getUsersByRole('tecnico').length}</h5>
                                <small>Usuarios Técnico</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Lista de Roles -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Roles del Sistema</h5>
                            </div>
                            <div class="card-body">
                                ${this.renderRolesTable()}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Comparativa de Permisos -->
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Comparativa de Permisos por Rol</h5>
                            </div>
                            <div class="card-body">
                                ${this.renderPermissionsComparison()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Renderizar tabla de roles
    renderRolesTable: function() {
        const roles = Object.entries(this.roles);
        
        if (roles.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="fas fa-user-shield fa-3x text-muted mb-3"></i>
                    <h5>No hay roles configurados</h5>
                    <p class="text-muted">Comienza creando el primer rol del sistema.</p>
                    <button class="btn btn-primary" onclick="CSIRolesConfig.showRoleForm()">
                        <i class="fas fa-plus me-2"></i>Crear Primer Rol
                    </button>
                </div>
            `;
        }

        return `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Clave del Rol</th>
                            <th>Nombre del Rol</th>
                            <th>Módulos Accesibles</th>
                            <th>Usuarios Asignados</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${roles.map(([key, role]) => `
                            <tr>
                                <td>
                                    <span class="badge bg-primary">${key}</span>
                                </td>
                                <td>
                                    <strong>${role.name}</strong>
                                </td>
                                <td>
                                    <small>${role.modules ? role.modules.join(', ') : 'Todos'}</small>
                                </td>
                                <td>
                                    <span class="badge bg-secondary">${this.getUsersByRole(key).length} usuarios</span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-1" onclick="CSIRolesConfig.editRole('${key}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-info me-1" onclick="CSIRolesConfig.viewPermissions('${key}')">
                                        <i class="fas fa-key"></i>
                                    </button>
                                    ${key !== 'admin' ? `
                                    <button class="btn btn-sm btn-outline-danger" onclick="CSIRolesConfig.deleteRole('${key}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    ` : '<span class="text-muted">Sistema</span>'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Renderizar comparativa de permisos
    renderPermissionsComparison: function() {
        const roles = Object.entries(this.roles);
        if (roles.length === 0) return '<p class="text-muted">No hay roles para comparar.</p>';

        return `
            <div class="table-responsive">
                <table class="table table-sm table-bordered">
                    <thead>
                        <tr>
                            <th>Módulo</th>
                            ${roles.map(([key]) => `<th class="text-center">${this.roles[key].name}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.availableModules.map(module => `
                            <tr>
                                <td><strong>${this.getModuleName(module)}</strong></td>
                                ${roles.map(([key, role]) => `
                                    <td class="text-center">
                                        <span class="badge bg-${this.getModuleAccessLevel(role, module)}">
                                            ${this.getModuleAccessText(role, module)}
                                        </span>
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Mostrar formulario de rol
    showRoleForm: function(roleKey = null) {
        this.selectedRole = roleKey ? { key: roleKey, ...this.roles[roleKey] } : null;
        
        this.container.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h4>
                                <i class="fas fa-${this.selectedRole ? 'edit' : 'plus'} me-2"></i>
                                ${this.selectedRole ? 'Editar Rol' : 'Nuevo Rol'}
                            </h4>
                            <button class="btn btn-secondary" onclick="CSIRolesConfig.renderRoleManagement()">
                                <i class="fas fa-arrow-left me-2"></i>Volver
                            </button>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-body">
                                <form id="role-form" onsubmit="CSIRolesConfig.saveRole(event)">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Clave del Rol *</label>
                                                <input type="text" class="form-control" id="role-key" 
                                                       value="${this.selectedRole ? this.selectedRole.key : ''}" 
                                                       ${this.selectedRole ? 'readonly' : ''} 
                                                       pattern="[a-z0-9_]+" title="Solo minúsculas, números y guiones bajos" required>
                                                <div class="form-text">Usa solo minúsculas, números y _ (ej: gerente_ventas)</div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Nombre del Rol *</label>
                                                <input type="text" class="form-control" id="role-name" 
                                                       value="${this.selectedRole ? this.selectedRole.name : ''}" required>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label">Módulos Accesibles</label>
                                        <div class="row">
                                            ${this.availableModules.map(module => `
                                                <div class="col-md-4 mb-2">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" 
                                                               id="module-${module}" value="${module}"
                                                               ${this.selectedRole && this.selectedRole.modules && this.selectedRole.modules.includes(module) ? 'checked' : ''}>
                                                        <label class="form-check-label" for="module-${module}">
                                                            ${this.getModuleName(module)}
                                                        </label>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label">Descripción</label>
                                        <textarea class="form-control" id="role-description" rows="3">${this.selectedRole ? this.selectedRole.description || '' : ''}</textarea>
                                    </div>

                                    <div class="d-flex justify-content-between">
                                        <button type="button" class="btn btn-secondary" onclick="CSIRolesConfig.renderRoleManagement()">
                                            Cancelar
                                        </button>
                                        <button type="submit" class="btn btn-primary">
                                            <i class="fas fa-save me-2"></i>
                                            ${this.selectedRole ? 'Actualizar Rol' : 'Crear Rol'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="mb-0">Usuarios con este Rol</h6>
                            </div>
                            <div class="card-body">
                                ${this.selectedRole ? this.renderRoleUsers(this.selectedRole.key) : '<p class="text-muted">Se mostrarán los usuarios cuando guardes el rol.</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Renderizar usuarios del rol
    renderRoleUsers: function(roleKey) {
        const users = this.getUsersByRole(roleKey);
        if (users.length === 0) {
            return '<p class="text-muted">No hay usuarios con este rol.</p>';
        }

        return `
            <div class="list-group">
                ${users.map(user => `
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${user.name}</strong><br>
                            <small class="text-muted">${user.username}</small>
                        </div>
                        <span class="badge bg-${user.status === 'active' ? 'success' : 'secondary'}">
                            ${user.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Guardar rol
    saveRole: function(event) {
        event.preventDefault();
        
        const roleKey = document.getElementById('role-key').value;
        const roleData = {
            name: document.getElementById('role-name').value,
            description: document.getElementById('role-description').value,
            modules: Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value)
        };

        if (this.selectedRole) {
            // Actualizar rol existente
            this.updateRole(roleKey, roleData);
        } else {
            // Crear nuevo rol
            this.createRole(roleKey, roleData);
        }
    },

    // Crear nuevo rol
    createRole: function(roleKey, roleData) {
        if (this.roles[roleKey]) {
            this.showMessage('Ya existe un rol con esa clave', 'error');
            return;
        }

        this.roles[roleKey] = roleData;
        this.saveRoles();
        this.renderRoleManagement();
        this.showMessage('Rol creado exitosamente', 'success');
    },

    // Actualizar rol
    updateRole: function(roleKey, roleData) {
        this.roles[roleKey] = { ...this.roles[roleKey], ...roleData };
        this.saveRoles();
        this.renderRoleManagement();
        this.showMessage('Rol actualizado exitosamente', 'success');
    },

    // Editar rol
    editRole: function(roleKey) {
        this.showRoleForm(roleKey);
    },

    // Ver permisos del rol
    viewPermissions: function(roleKey) {
        this.selectedRole = { key: roleKey, ...this.roles[roleKey] };
        this.renderPermissionsDetail();
    },

    // Renderizar detalle de permisos
    renderPermissionsDetail: function() {
        this.container.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h4>
                                <i class="fas fa-key me-2"></i>
                                Permisos: ${this.selectedRole.name}
                            </h4>
                            <button class="btn btn-secondary" onclick="CSIRolesConfig.renderRoleManagement()">
                                <i class="fas fa-arrow-left me-2"></i>Volver
                            </button>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Configuración de Permisos Granulares</h5>
                            </div>
                            <div class="card-body">
                                <p class="text-muted">Configura los permisos específicos para cada módulo.</p>
                                ${this.renderPermissionsEditor()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Renderizar editor de permisos
    renderPermissionsEditor: function() {
        return `
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Módulo</th>
                            ${this.availablePermissions.map(perm => `
                                <th class="text-center">${this.getPermissionName(perm)}</th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.availableModules.map(module => `
                            <tr>
                                <td><strong>${this.getModuleName(module)}</strong></td>
                                ${this.availablePermissions.map(perm => `
                                    <td class="text-center">
                                        <input type="checkbox" class="form-check-input" 
                                               ${this.hasPermission(this.selectedRole, module, perm) ? 'checked' : ''}
                                               onchange="CSIRolesConfig.updatePermission('${module}', '${perm}', this.checked)">
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Actualizar permiso
    updatePermission: function(module, permission, granted) {
        if (!this.selectedRole.permissions) {
            this.selectedRole.permissions = [];
        }

        const permString = `${module}:${permission}`;
        
        if (granted) {
            if (!this.selectedRole.permissions.includes(permString)) {
                this.selectedRole.permissions.push(permString);
            }
        } else {
            this.selectedRole.permissions = this.selectedRole.permissions.filter(p => p !== permString);
        }

        this.roles[this.selectedRole.key] = this.selectedRole;
        this.saveRoles();
        this.showMessage('Permiso actualizado', 'success');
    },

    // Eliminar rol
    deleteRole: function(roleKey) {
        const usersWithRole = this.getUsersByRole(roleKey);
        
        if (usersWithRole.length > 0) {
            this.showMessage(`No se puede eliminar el rol. Hay ${usersWithRole.length} usuario(s) asignados.`, 'error');
            return;
        }

        if (confirm('¿Estás seguro de que quieres eliminar este rol?')) {
            delete this.roles[roleKey];
            this.saveRoles();
            this.renderRoleManagement();
            this.showMessage('Rol eliminado exitosamente', 'success');
        }
    },

    // Helper functions
    getUsersByRole: function(roleKey) {
        try {
            const users = CSIUsersConfig ? CSIUsersConfig.users : (CSI.users || []);
            return users.filter(user => user.role === roleKey);
        } catch (error) {
            return [];
        }
    },

    getModuleName: function(module) {
        const names = {
            'dashboard': 'Dashboard',
            'crm': 'CRM Comercial',
            'technical': 'Herramientas Técnicas',
            'finance': 'Módulo Financiero',
            'reports': 'Reportes',
            'config': 'Configuración'
        };
        return names[module] || module;
    },

    getPermissionName: function(permission) {
        const names = {
            'view': 'Ver',
            'create': 'Crear',
            'edit': 'Editar',
            'delete': 'Eliminar',
            'approve': 'Aprobar',
            'export': 'Exportar'
        };
        return names[permission] || permission;
    },

    getModuleAccessLevel: function(role, module) {
        if (role.permissions && role.permissions.includes('*')) return 'success';
        if (role.modules && role.modules.includes(module)) return 'info';
        return 'secondary';
    },

    getModuleAccessText: function(role, module) {
        if (role.permissions && role.permissions.includes('*')) return 'Completo';
        if (role.modules && role.modules.includes(module)) return 'Acceso';
        return 'Sin acceso';
    },

    hasPermission: function(role, module, permission) {
        if (!role.permissions) return false;
        return role.permissions.includes('*') || role.permissions.includes(`${module}:${permission}`);
    },

    showMessage: function(message, type) {
        if (typeof CSI !== 'undefined') {
            CSI.showMessage(message, type);
        } else {
            alert(message);
        }
    }
};

// Hacer global
window.CSIRolesConfig = CSIRolesConfig;