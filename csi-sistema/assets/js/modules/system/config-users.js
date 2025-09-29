// assets/js/modules/system/config-users.js
// GESTIÓN COMPLETA DE USUARIOS DEL SISTEMA CSI

const CSIUsersConfig = {
    currentView: 'list',
    selectedUser: null,
    users: [],

    // Inicializar módulo
    init: function(container = null) {
        console.log('👥 Módulo de Gestión de Usuarios inicializado');
        this.container = container || document.getElementById('csi-module-content');
        this.loadUsers();
        this.renderUserManagement();
    },

    // Cargar usuarios del sistema
    loadUsers: function() {
        try {
            const savedUsers = localStorage.getItem('csi_users');
            this.users = savedUsers ? JSON.parse(savedUsers) : CSI.users || [];
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            this.users = [];
        }
    },

    // Guardar usuarios
    saveUsers: function() {
        localStorage.setItem('csi_users', JSON.stringify(this.users));
        // Actualizar también en CSI global
        if (typeof CSI !== 'undefined') {
            CSI.users = this.users;
        }
    },

    // Renderizar gestión de usuarios
    renderUserManagement: function() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h4><i class="fas fa-users me-2"></i>Gestión de Usuarios</h4>
                            <div>
                                <button class="btn btn-primary" onclick="CSIUsersConfig.showUserForm()">
                                    <i class="fas fa-user-plus me-2"></i>Nuevo Usuario
                                </button>
                                <button class="btn btn-secondary ms-2" onclick="CSIConfig.renderConfigDashboard()">
                                    <i class="fas fa-arrow-left me-2"></i>Volver
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filtros y Búsqueda -->
                <div class="row mb-4">
                    <div class="col-md-4">
                        <input type="text" class="form-control" id="user-search" placeholder="Buscar usuarios..." onkeyup="CSIUsersConfig.filterUsers()">
                    </div>
                    <div class="col-md-4">
                        <select class="form-select" id="role-filter" onchange="CSIUsersConfig.filterUsers()">
                            <option value="">Todos los roles</option>
                            <option value="admin">Administrador</option>
                            <option value="vendedor">Vendedor</option>
                            <option value="tecnico">Técnico</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <select class="form-select" id="status-filter" onchange="CSIUsersConfig.filterUsers()">
                            <option value="">Todos los estados</option>
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                        </select>
                    </div>
                </div>

                <!-- Estadísticas -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card bg-primary text-white">
                            <div class="card-body text-center py-3">
                                <h5>${this.getActiveUsersCount()}</h5>
                                <small>Usuarios Activos</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-success text-white">
                            <div class="card-body text-center py-3">
                                <h5>${this.getUsersByRole('admin').length}</h5>
                                <small>Administradores</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-info text-white">
                            <div class="card-body text-center py-3">
                                <h5>${this.getUsersByRole('vendedor').length}</h5>
                                <small>Vendedores</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-warning text-white">
                            <div class="card-body text-center py-3">
                                <h5>${this.getUsersByRole('tecnico').length}</h5>
                                <small>Técnicos</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Lista de Usuarios -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Lista de Usuarios del Sistema</h5>
                            </div>
                            <div class="card-body">
                                ${this.renderUsersTable()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Renderizar tabla de usuarios
    renderUsersTable: function() {
        if (this.users.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="fas fa-users fa-3x text-muted mb-3"></i>
                    <h5>No hay usuarios registrados</h5>
                    <p class="text-muted">Comienza creando el primer usuario del sistema.</p>
                    <button class="btn btn-primary" onclick="CSIUsersConfig.showUserForm()">
                        <i class="fas fa-user-plus me-2"></i>Crear Primer Usuario
                    </button>
                </div>
            `;
        }

        return `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Nombre</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Último Acceso</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.users.map(user => `
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="avatar-circle bg-primary text-white me-3">
                                            ${user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <strong>${user.username}</strong>
                                    </div>
                                </td>
                                <td>${user.name}</td>
                                <td>
                                    <span class="badge bg-${this.getRoleBadgeColor(user.role)}">
                                        ${this.getRoleName(user.role)}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge bg-${user.status === 'active' ? 'success' : 'secondary'}">
                                        ${user.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-1" onclick="CSIUsersConfig.editUser(${user.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-${user.status === 'active' ? 'warning' : 'success'}" 
                                            onclick="CSIUsersConfig.toggleUserStatus(${user.id})">
                                        <i class="fas fa-${user.status === 'active' ? 'pause' : 'play'}"></i>
                                    </button>
                                    ${user.role !== 'admin' ? `
                                    <button class="btn btn-sm btn-outline-danger ms-1" onclick="CSIUsersConfig.deleteUser(${user.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Mostrar formulario de usuario
    showUserForm: function(userId = null) {
        this.selectedUser = userId ? this.users.find(u => u.id === userId) : null;
        
        this.container.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h4>
                                <i class="fas fa-${this.selectedUser ? 'edit' : 'user-plus'} me-2"></i>
                                ${this.selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h4>
                            <button class="btn btn-secondary" onclick="CSIUsersConfig.renderUserManagement()">
                                <i class="fas fa-arrow-left me-2"></i>Volver
                            </button>
                        </div>
                    </div>
                </div>

                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-body">
                                <form id="user-form" onsubmit="CSIUsersConfig.saveUser(event)">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Nombre Completo *</label>
                                                <input type="text" class="form-control" id="user-name" 
                                                       value="${this.selectedUser ? this.selectedUser.name : ''}" required>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Usuario *</label>
                                                <input type="text" class="form-control" id="user-username" 
                                                       value="${this.selectedUser ? this.selectedUser.username : ''}" required>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Contraseña ${this.selectedUser ? '(dejar en blanco para no cambiar)' : '*'}</label>
                                                <input type="password" class="form-control" id="user-password" 
                                                       ${this.selectedUser ? '' : 'required'}>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Rol *</label>
                                                <select class="form-select" id="user-role" required>
                                                    <option value="">Seleccionar rol...</option>
                                                    <option value="admin" ${this.selectedUser && this.selectedUser.role === 'admin' ? 'selected' : ''}>Administrador</option>
                                                    <option value="vendedor" ${this.selectedUser && this.selectedUser.role === 'vendedor' ? 'selected' : ''}>Vendedor</option>
                                                    <option value="tecnico" ${this.selectedUser && this.selectedUser.role === 'tecnico' ? 'selected' : ''}>Técnico</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label">Estado</label>
                                        <div>
                                            <div class="form-check form-check-inline">
                                                <input class="form-check-input" type="radio" name="user-status" id="status-active" 
                                                       value="active" ${!this.selectedUser || this.selectedUser.status === 'active' ? 'checked' : ''}>
                                                <label class="form-check-label" for="status-active">Activo</label>
                                            </div>
                                            <div class="form-check form-check-inline">
                                                <input class="form-check-input" type="radio" name="user-status" id="status-inactive" 
                                                       value="inactive" ${this.selectedUser && this.selectedUser.status === 'inactive' ? 'checked' : ''}>
                                                <label class="form-check-label" for="status-inactive">Inactivo</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="d-flex justify-content-between">
                                        <button type="button" class="btn btn-secondary" onclick="CSIUsersConfig.renderUserManagement()">
                                            Cancelar
                                        </button>
                                        <button type="submit" class="btn btn-primary">
                                            <i class="fas fa-save me-2"></i>
                                            ${this.selectedUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Guardar usuario
    saveUser: function(event) {
        event.preventDefault();
        
        const userData = {
            name: document.getElementById('user-name').value,
            username: document.getElementById('user-username').value,
            role: document.getElementById('user-role').value,
            status: document.querySelector('input[name="user-status"]:checked').value
        };

        if (document.getElementById('user-password').value) {
            userData.password = document.getElementById('user-password').value;
        }

        if (this.selectedUser) {
            // Editar usuario existente
            userData.id = this.selectedUser.id;
            if (!userData.password) {
                userData.password = this.selectedUser.password;
            }
            userData.permissions = this.selectedUser.permissions;
            userData.assigned_clients = this.selectedUser.assigned_clients;
            this.updateUser(userData);
        } else {
            // Nuevo usuario
            userData.id = this.generateUserId();
            userData.password = userData.password || '1234'; // Contraseña por defecto
            userData.permissions = this.getDefaultPermissions(userData.role);
            userData.assigned_clients = [];
            this.createUser(userData);
        }
    },

    // Crear nuevo usuario
    createUser: function(userData) {
        this.users.push(userData);
        this.saveUsers();
        this.renderUserManagement();
        this.showMessage('Usuario creado exitosamente', 'success');
    },

    // Actualizar usuario
    updateUser: function(userData) {
        const index = this.users.findIndex(u => u.id === userData.id);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...userData };
            this.saveUsers();
            this.renderUserManagement();
            this.showMessage('Usuario actualizado exitosamente', 'success');
        }
    },

    // Editar usuario
    editUser: function(userId) {
        this.showUserForm(userId);
    },

    // Cambiar estado de usuario
    toggleUserStatus: function(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.status = user.status === 'active' ? 'inactive' : 'active';
            this.saveUsers();
            this.renderUserManagement();
            this.showMessage(`Usuario ${user.status === 'active' ? 'activado' : 'desactivado'}`, 'success');
        }
    },

    // Eliminar usuario
    deleteUser: function(userId) {
        if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            this.users = this.users.filter(u => u.id !== userId);
            this.saveUsers();
            this.renderUserManagement();
            this.showMessage('Usuario eliminado exitosamente', 'success');
        }
    },

    // Filtrar usuarios
    filterUsers: function() {
        // Implementación básica de filtros
        console.log('Filtrando usuarios...');
    },

    // Helper functions
    getActiveUsersCount: function() {
        return this.users.filter(u => u.status === 'active').length;
    },

    getUsersByRole: function(role) {
        return this.users.filter(u => u.role === role);
    },

    getRoleName: function(role) {
        const roles = {
            'admin': 'Administrador',
            'vendedor': 'Vendedor',
            'tecnico': 'Técnico'
        };
        return roles[role] || role;
    },

    getRoleBadgeColor: function(role) {
        const colors = {
            'admin': 'danger',
            'vendedor': 'success',
            'tecnico': 'warning'
        };
        return colors[role] || 'secondary';
    },

    generateUserId: function() {
        return Math.max(...this.users.map(u => u.id), 0) + 1;
    },

    getDefaultPermissions: function(role) {
        const defaultPermissions = {
            'admin': { full_access: true },
            'vendedor': {
                crm: ['view', 'create'],
                clients: ['view_assigned', 'edit_own'],
                quotes: ['create', 'edit_own'],
                orders: ['view', 'create']
            },
            'tecnico': {
                technical: ['view', 'edit'],
                orders: ['view_assigned', 'update_checklist']
            }
        };
        return defaultPermissions[role] || {};
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
window.CSIUsersConfig = CSIUsersConfig;