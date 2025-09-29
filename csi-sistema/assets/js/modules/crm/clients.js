// ===== MÓDULO DE GESTIÓN DE CLIENTES - CSI REFRIGERACIÓN =====
const CSIClients = {
    currentFilters: {
        search: '',
        tipo: '',
        sector: '',
        estatus: ''
    },

    // Inicializar módulo
    init: function() {
        console.log('👥 Módulo de Clientes inicializado');
        this.renderClientList();
    },

    // Renderizar lista de clientes
    renderClientList: function(filteredClients = null) {
        console.log('📋 Renderizando lista de clientes...');
        const container = document.getElementById('crm-clients-content');
        if (!container) {
            console.error('❌ No se encontró el contenedor crm-clients-content');
            return;
        }

        const clients = this.getClients();
        const clientsToRender = filteredClients || clients;
        const stats = this.getClientStats();
        const isAdmin = true;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-users me-2"></i>Lista de Clientes</h4>
                <div>
                    <button class="btn btn-danger me-2" onclick="CSIClients.showClientForm()">
                        <i class="fas fa-plus me-2"></i>Nuevo Cliente
                    </button>
                    <button class="btn btn-outline-secondary" onclick="CSIClients.exportClients()">
                        <i class="fas fa-download me-2"></i>Exportar
                    </button>
                </div>
            </div>

            <!-- Filtros y Búsqueda -->
            <div class="row mb-3">
                <div class="col-md-4">
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Buscar cliente..." id="client-search" value="${this.currentFilters.search}">
                        <button class="btn btn-outline-secondary" type="button" id="search-button">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
                <div class="col-md-2">
                    <select class="form-select" id="client-filter-type">
                        <option value="">Todos los tipos</option>
                        <option value="cliente_final" ${this.currentFilters.tipo === 'cliente_final' ? 'selected' : ''}>Cliente Final</option>
                        <option value="contratista" ${this.currentFilters.tipo === 'contratista' ? 'selected' : ''}>Contratista</option>
                        <option value="socio_comercial" ${this.currentFilters.tipo === 'socio_comercial' ? 'selected' : ''}>Socio Comercial</option>
                        <option value="distribuidor" ${this.currentFilters.tipo === 'distribuidor' ? 'selected' : ''}>Distribuidor</option>
                        <option value="otros" ${this.currentFilters.tipo === 'otros' ? 'selected' : ''}>Otros</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <select class="form-select" id="client-filter-sector">
                        <option value="">Todos los sectores</option>
                        <option value="pesquero" ${this.currentFilters.sector === 'pesquero' ? 'selected' : ''}>Pesquero</option>
                        <option value="agroindustrial" ${this.currentFilters.sector === 'agroindustrial' ? 'selected' : ''}>Agroindustrial</option>
                        <option value="carnico" ${this.currentFilters.sector === 'carnico' ? 'selected' : ''}>Cárnico</option>
                        <option value="lacteo" ${this.currentFilters.sector === 'lacteo' ? 'selected' : ''}>Lácteo</option>
                        <option value="industrial" ${this.currentFilters.sector === 'industrial' ? 'selected' : ''}>Industrial</option>
                        <option value="otros" ${this.currentFilters.sector === 'otros' ? 'selected' : ''}>Otros</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <select class="form-select" id="client-filter-status">
                        <option value="">Todos los estatus</option>
                        <option value="activo" ${this.currentFilters.estatus === 'activo' ? 'selected' : ''}>Activos</option>
                        <option value="potencial" ${this.currentFilters.estatus === 'potencial' ? 'selected' : ''}>Potenciales</option>
                        <option value="inactivo" ${this.currentFilters.estatus === 'inactivo' ? 'selected' : ''}>Inactivos</option>
                    </select>
                </div>
                <div class="col-md-1">
                    <button class="btn btn-outline-danger w-100" onclick="CSIClients.clearFilters()" title="Limpiar todos los filtros">
                    X        Filtros
                    </button>
                    </div>
            </div>

            <!-- Estadísticas Windows 11 -->
<div class="row mb-4">
    <div class="col-md-2">
        <div class="card stats-card">
            <div class="card-body text-center">
                <h5 class="stats-number text-primary">${stats.total}</h5>
                <small class="stats-label text-muted">Total</small>
            </div>
        </div>
    </div>
    <div class="col-md-2">
        <div class="card stats-card">
            <div class="card-body text-center">
                <h5 class="stats-number text-success">${stats.activos}</h5>
                <small class="stats-label text-muted">Activos</small>
            </div>
        </div>
    </div>
    <div class="col-md-2">
        <div class="card stats-card">
            <div class="card-body text-center">
                <h5 class="stats-number text-warning">${stats.potenciales}</h5>
                <small class="stats-label text-muted">Potenciales</small>
            </div>
        </div>
    </div>
    <div class="col-md-2">
        <div class="card stats-card">
            <div class="card-body text-center">
                <h5 class="stats-number text-secondary">${stats.inactivos}</h5>
                <small class="stats-label text-muted">Inactivos</small>
            </div>
        </div>
    </div>
    <div class="col-md-2">
        <div class="card stats-card">
            <div class="card-body text-center">
                <h5 class="stats-number text-info">${stats.proyectosTotales}</h5>
                <small class="stats-label text-muted">Proyectos</small>
            </div>
        </div>
    </div>
    <div class="col-md-2">
        <div class="card stats-card">
            <div class="card-body text-center">
                <h5 class="stats-number text-dark">${clientsToRender.length}</h5>
                <small class="stats-label text-muted">Mostrados</small>
            </div>
        </div>
    </div>
</div>

            <!-- Tabla de Clientes -->
            <div class="card">
                <div class="card-body">
                    ${clientsToRender.length === 0 ? `
                        <div class="text-center py-5">
                            <i class="fas fa-users fa-3x text-muted mb-3"></i>
                            <p class="text-muted">No se encontraron clientes</p>
                            <button class="btn btn-danger" onclick="CSIClients.showClientForm()">
                                <i class="fas fa-plus me-2"></i>Agregar primer cliente
                            </button>
                        </div>
                    ` : `
                    <div class="table-responsive">
                        <table class="table table-hover table-striped">
                            <thead class="table-dark">
                                <tr>
                                    <th>Código</th>
                                    <th>Cliente</th>
                                    <th>Contacto</th>
                                    <th>Teléfono</th>
                                    <th>Tipo</th>
                                    <th>Sector</th>
                                    <th>Estatus</th>
                                    <th>Proyectos</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${clientsToRender.map(client => `
                                    <tr>
                                        <td><strong>${client.codigo || 'N/A'}</strong></td>
                                        <td>
                                            <div class="fw-bold">${client.nombre || 'N/A'}</div>
                                            <small class="text-muted">${client.email || 'Sin email'}</small>
                                        </td>
                                        <td>${client.contacto || 'N/A'}</td>
                                        <td>${client.telefono || 'N/A'}</td>
                                        <td>
                                            <span class="badge bg-primary">${this.getTipoLabel(client.tipo) || 'N/A'}</span>
                                        </td>
                                        <td>
                                            <span class="badge bg-info">${client.sector ? this.getSectorLabel(client.sector) : 'N/A'}</span>
                                        </td>
                                        <td>
                                            <span class="badge ${this.getStatusClass(client.estatus)}">
                                                ${this.getStatusLabel(client.estatus) || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge bg-dark">${client.proyectos || 0}</span>
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-primary" onclick="CSIClients.viewClient(${client.id})" title="Ver detalles">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn btn-outline-warning" onclick="CSIClients.editClient(${client.id})" title="Editar cliente">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-outline-danger" onclick="CSIClients.deleteClient(${client.id})" title="Eliminar cliente">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    `}
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    // Configurar event listeners CORREGIDO
    setupEventListeners: function() {
        console.log('🎯 Configurando event listeners...');
        
        // BÚSQUEDA CON BOTÓN (CORREGIDO)
        const searchButton = document.getElementById('search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const searchInput = document.getElementById('client-search');
                this.currentFilters.search = searchInput.value;
                this.applyFilters();
            });
        }
        
        // También buscar con ENTER
        const searchInput = document.getElementById('client-search');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.currentFilters.search = e.target.value;
                    this.applyFilters();
                }
            });
        }

        // FILTROS CON SELECT (automáticos)
        const filterType = document.getElementById('client-filter-type');
        const filterSector = document.getElementById('client-filter-sector');
        const filterStatus = document.getElementById('client-filter-status');
        
        if (filterType) {
            filterType.addEventListener('change', (e) => {
                this.currentFilters.tipo = e.target.value;
                this.applyFilters();
            });
        }
        
        if (filterSector) {
            filterSector.addEventListener('change', (e) => {
                this.currentFilters.sector = e.target.value;
                this.applyFilters();
            });
        }
        
        if (filterStatus) {
            filterStatus.addEventListener('change', (e) => {
                this.currentFilters.estatus = e.target.value;
                this.applyFilters();
            });
        }
    },

    // Aplicar filtros MEJORADO
    applyFilters: function() {
        let filteredClients = this.getClients();
        
        // Si todos los filtros están vacíos, mostrar todos
        if (!this.currentFilters.search && !this.currentFilters.tipo && 
            !this.currentFilters.sector && !this.currentFilters.estatus) {
            this.renderClientList(filteredClients);
            return;
        }

        // Filtro por búsqueda
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filteredClients = filteredClients.filter(client => 
                client.nombre.toLowerCase().includes(searchTerm) ||
                (client.contacto && client.contacto.toLowerCase().includes(searchTerm)) ||
                (client.email && client.email.toLowerCase().includes(searchTerm)) ||
                (client.codigo && client.codigo.toLowerCase().includes(searchTerm))
            );
        }

        // Filtro por tipo
        if (this.currentFilters.tipo) {
            filteredClients = filteredClients.filter(client => 
                client.tipo === this.currentFilters.tipo
            );
        }

        // Filtro por sector
        if (this.currentFilters.sector) {
            filteredClients = filteredClients.filter(client => 
                client.sector === this.currentFilters.sector
            );
        }

        // Filtro por estatus
        if (this.currentFilters.estatus) {
            filteredClients = filteredClients.filter(client => 
                client.estatus === this.currentFilters.estatus
            );
        }

        this.renderClientList(filteredClients);
    },

    // Limpiar todos los filtros
    clearFilters: function() {
        this.currentFilters = { search: '', tipo: '', sector: '', estatus: '' };
        
        // Limpiar valores de los inputs
        const searchInput = document.getElementById('client-search');
        const filterType = document.getElementById('client-filter-type');
        const filterSector = document.getElementById('client-filter-sector');
        const filterStatus = document.getElementById('client-filter-status');
        
        if (searchInput) searchInput.value = '';
        if (filterType) filterType.value = '';
        if (filterSector) filterSector.value = '';
        if (filterStatus) filterStatus.value = '';
        
        this.renderClientList();
        this.showMessage('Filtros limpiados correctamente', 'success');
    },

    // Obtener clientes desde la base de datos
    getClients: function() {
        if (typeof CSIDatabase !== 'undefined') {
            return CSIDatabase.getAll('clients');
        } else {
            return [
                {
                    id: 1,
                    codigo: 'CSI-001',
                    nombre: 'Pesquera del Pacífico SA',
                    telefono: '+52 33 1234 5678',
                    email: 'compras@pesqueradelpacifico.com',
                    tipo: 'cliente_final',
                    sector: 'pesquero',
                    estatus: 'activo',
                    contacto: 'Ing. Carlos Rodríguez',
                    proyectos: 3,
                    fechaRegistro: '2024-01-15'
                },
                {
                    id: 2,
                    codigo: 'CSI-002',
                    nombre: 'Frío Industrial Monterrey',
                    telefono: '+52 81 2345 6789',
                    email: 'ventas@frioindustrial.com',
                    tipo: 'distribuidor',
                    sector: 'industrial',
                    estatus: 'activo',
                    contacto: 'Lic. Ana Martínez',
                    proyectos: 5,
                    fechaRegistro: '2024-02-20'
                },
                {
                    id: 3,
                    codigo: 'CSI-003',
                    nombre: 'Lácteos La Vaquita',
                    telefono: '+52 33 3456 7890',
                    email: 'gerente@lacteoslavaquita.com',
                    tipo: 'cliente_final',
                    sector: 'lacteo',
                    estatus: 'potencial',
                    contacto: 'Sr. Roberto González',
                    proyectos: 0,
                    fechaRegistro: '2024-03-10'
                }
            ];
        }
    },

    // Obtener estadísticas
    getClientStats: function() {
        const clients = this.getClients();
        return {
            total: clients.length,
            activos: clients.filter(c => c.estatus === 'activo').length,
            potenciales: clients.filter(c => c.estatus === 'potencial').length,
            inactivos: clients.filter(c => c.estatus === 'inactivo').length,
            proyectosTotales: clients.reduce((sum, client) => sum + (client.proyectos || 0), 0)
        };
    },

    // Generar código de cliente
    generateClientCode: function() {
        const clients = this.getClients();
        const nextId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
        return `CSI-${nextId.toString().padStart(3, '0')}`;
    },

    // Mostrar formulario de cliente
    showClientForm: function(client = null) {
        console.log('📝 Mostrando formulario de cliente...');
        const isEdit = client !== null;
        
        const modalHTML = `
            <div class="modal fade" id="clientModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">${isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="clientForm">
                                ${isEdit ? `<input type="hidden" id="editClientId" value="${client.id}">` : ''}
                                
                                <div class="row">
                                    <div class="col-md-8">
                                        <div class="mb-3">
                                            <label class="form-label">Nombre del Cliente *</label>
                                            <input type="text" class="form-control" name="nombre" value="${isEdit ? client.nombre : ''}" required>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">RFC</label>
                                            <input type="text" class="form-control" name="rfc" value="${isEdit ? client.rfc || '' : ''}">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Teléfono *</label>
                                            <input type="tel" class="form-control" name="telefono" value="${isEdit ? client.telefono : ''}" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Email</label>
                                            <input type="email" class="form-control" name="email" value="${isEdit ? client.email : ''}">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Dirección</label>
                                    <textarea class="form-control" name="direccion" rows="2">${isEdit ? client.direccion || '' : ''}</textarea>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Tipo de Cliente *</label>
                                            <select class="form-select" name="tipo" required>
                                                <option value="">Seleccionar tipo...</option>
                                                <option value="cliente_final" ${isEdit && client.tipo === 'cliente_final' ? 'selected' : ''}>Cliente Final</option>
                                                <option value="contratista" ${isEdit && client.tipo === 'contratista' ? 'selected' : ''}>Contratista</option>
                                                <option value="socio_comercial" ${isEdit && client.tipo === 'socio_comercial' ? 'selected' : ''}>Socio Comercial</option>
                                                <option value="distribuidor" ${isEdit && client.tipo === 'distribuidor' ? 'selected' : ''}>Distribuidor</option>
                                                <option value="otros" ${isEdit && client.tipo === 'otros' ? 'selected' : ''}>Otros</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Sector *</label>
                                            <select class="form-select" name="sector" required>
                                                <option value="">Seleccionar sector...</option>
                                                <option value="pesquero" ${isEdit && client.sector === 'pesquero' ? 'selected' : ''}>Pesquero</option>
                                                <option value="agroindustrial" ${isEdit && client.sector === 'agroindustrial' ? 'selected' : ''}>Agroindustrial</option>
                                                <option value="carnico" ${isEdit && client.sector === 'carnico' ? 'selected' : ''}>Cárnico</option>
                                                <option value="lacteo" ${isEdit && client.sector === 'lacteo' ? 'selected' : ''}>Lácteo</option>
                                                <option value="industrial" ${isEdit && client.sector === 'industrial' ? 'selected' : ''}>Industrial</option>
                                                <option value="otros" ${isEdit && client.sector === 'otros' ? 'selected' : ''}>Otros</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Persona de Contacto *</label>
                                            <input type="text" class="form-control" name="contacto" value="${isEdit ? client.contacto : ''}" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Estatus *</label>
                                            <select class="form-select" name="estatus" required>
                                                <option value="activo" ${isEdit && client.estatus === 'activo' ? 'selected' : ''}>Activo</option>
                                                <option value="potencial" ${isEdit && client.estatus === 'potencial' ? 'selected' : ''}>Potencial</option>
                                                <option value="inactivo" ${isEdit && client.estatus === 'inactivo' ? 'selected' : ''}>Inactivo</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" onclick="CSIClients.${isEdit ? 'updateClient' : 'saveClient'}()">
                                <i class="fas fa-save me-2"></i>${isEdit ? 'Actualizar' : 'Guardar'} Cliente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.showModal(modalHTML);
    },

    // Guardar nuevo cliente
    saveClient: function() {
        console.log('💾 Guardando nuevo cliente...');
        const form = document.getElementById('clientForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const clientData = {
            codigo: this.generateClientCode(),
            nombre: formData.get('nombre'),
            rfc: formData.get('rfc'),
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            direccion: formData.get('direccion'),
            tipo: formData.get('tipo'),
            sector: formData.get('sector'),
            contacto: formData.get('contacto'),
            estatus: formData.get('estatus'),
            proyectos: 0,
            fechaRegistro: new Date().toISOString().split('T')[0]
        };

        if (typeof CSIDatabase !== 'undefined') {
            const newClient = CSIDatabase.insert('clients', clientData);
            if (newClient) {
                this.showMessage('✅ Cliente guardado correctamente', 'success');
                this.renderClientList();
                bootstrap.Modal.getInstance(document.getElementById('clientModal')).hide();
            }
        } else {
            this.showMessage('✅ Cliente guardado correctamente', 'success');
            this.renderClientList();
            bootstrap.Modal.getInstance(document.getElementById('clientModal')).hide();
        }
    },

    // Ver cliente
    viewClient: function(clientId) {
        const client = this.getClients().find(c => c.id === clientId);
        if (client) {
            const modalHTML = `
                <div class="modal fade" id="viewClientModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header bg-primary text-white">
                                <h5 class="modal-title"><i class="fas fa-building me-2"></i>${client.nombre}</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <h6><i class="fas fa-info-circle me-2"></i>Información General</h6>
                                        <p><strong>Código:</strong> ${client.codigo}</p>
                                        <p><strong>RFC:</strong> ${client.rfc || 'No especificado'}</p>
                                        <p><strong>Tipo:</strong> <span class="badge bg-primary">${this.getTipoLabel(client.tipo)}</span></p>
                                        <p><strong>Sector:</strong> <span class="badge bg-info">${this.getSectorLabel(client.sector)}</span></p>
                                    </div>
                                    <div class="col-md-6">
                                        <h6><i class="fas fa-user me-2"></i>Contacto</h6>
                                        <p><strong>Contacto:</strong> ${client.contacto}</p>
                                        <p><strong>Teléfono:</strong> ${client.telefono}</p>
                                        <p><strong>Email:</strong> ${client.email}</p>
                                        <p><strong>Estatus:</strong> <span class="badge ${this.getStatusClass(client.estatus)}">${this.getStatusLabel(client.estatus)}</span></p>
                                    </div>
                                </div>
                                ${client.direccion ? `
                                <div class="mt-3">
                                    <h6><i class="fas fa-map-marker-alt me-2"></i>Dirección</h6>
                                    <p>${client.direccion}</p>
                                </div>
                                ` : ''}
                                <div class="mt-3">
                                    <h6><i class="fas fa-chart-bar me-2"></i>Estadísticas</h6>
                                    <p><strong>Proyectos:</strong> <span class="badge bg-dark">${client.proyectos || 0}</span></p>
                                    <p><strong>Fecha de registro:</strong> ${client.fechaRegistro}</p>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-warning" onclick="CSIClients.editClient(${client.id})">
                                    <i class="fas fa-edit me-2"></i>Editar Cliente
                                </button>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            this.showModal(modalHTML);
        }
    },

    // Editar cliente
    editClient: function(clientId) {
        const client = this.getClients().find(c => c.id === clientId);
        if (client) {
            this.showClientForm(client);
        }
    },

    // Actualizar cliente
    updateClient: function() {
        console.log('✏️ Actualizando cliente...');
        const form = document.getElementById('clientForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const clientId = parseInt(document.getElementById('editClientId').value);
        const formData = new FormData(form);
        
        const updateData = {
            nombre: formData.get('nombre'),
            rfc: formData.get('rfc'),
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            direccion: formData.get('direccion'),
            tipo: formData.get('tipo'),
            sector: formData.get('sector'),
            contacto: formData.get('contacto'),
            estatus: formData.get('estatus')
        };

        if (typeof CSIDatabase !== 'undefined') {
            const updated = CSIDatabase.update('clients', clientId, updateData);
            if (updated) {
                this.showMessage('✅ Cliente actualizado correctamente', 'success');
                this.renderClientList();
                bootstrap.Modal.getInstance(document.getElementById('clientModal')).hide();
            }
        } else {
            this.showMessage('✅ Cliente actualizado correctamente', 'success');
            this.renderClientList();
            bootstrap.Modal.getInstance(document.getElementById('clientModal')).hide();
        }
    },

    // Eliminar cliente
    deleteClient: function(clientId) {
        if (confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
            if (typeof CSIDatabase !== 'undefined') {
                const deleted = CSIDatabase.delete('clients', clientId);
                if (deleted) {
                    this.showMessage('✅ Cliente eliminado correctamente', 'success');
                    this.renderClientList();
                }
            } else {
                this.showMessage('✅ Cliente eliminado correctamente', 'success');
                this.renderClientList();
            }
        }
    },

    // Helper functions
    getTipoLabel: function(tipo) {
        const tipos = {
            'cliente_final': 'Cliente Final',
            'contratista': 'Contratista',
            'socio_comercial': 'Socio Comercial',
            'distribuidor': 'Distribuidor',
            'otros': 'Otros'
        };
        return tipos[tipo] || tipo;
    },

    getSectorLabel: function(sector) {
        const sectores = {
            'pesquero': 'Pesquero',
            'agroindustrial': 'Agroindustrial',
            'carnico': 'Cárnico',
            'lacteo': 'Lácteo',
            'industrial': 'Industrial',
            'otros': 'Otros'
        };
        return sectores[sector] || sector;
    },

    getStatusLabel: function(estatus) {
        const status = {
            'activo': 'Activo', 'potencial': 'Potencial', 'inactivo': 'Inactivo'
        };
        return status[estatus] || estatus;
    },

    getStatusClass: function(estatus) {
        const classes = {
            'activo': 'bg-success', 'potencial': 'bg-warning', 'inactivo': 'bg-secondary'
        };
        return classes[estatus] || 'bg-secondary';
    },

    // Mostrar modal
    showModal: function(content) {
        let modalContainer = document.getElementById('modal-container');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'modal-container';
            document.body.appendChild(modalContainer);
        }
        modalContainer.innerHTML = content;
        
        const modalId = content.includes('id="viewClientModal"') ? 'viewClientModal' : 'clientModal';
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
    },

    // Mostrar mensaje
    showMessage: function(message, type) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
        
        const messageHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert" 
                 style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                <i class="fas ${icon} me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', messageHTML);
        
        setTimeout(() => {
            const alert = document.querySelector('.alert');
            if (alert) alert.remove();
        }, 5000);
    },

            // Exportar clientes filtrados a CSV
        exportClients: function() {
            // Tomar los clientes actualmente renderizados según filtros
            let clients = this.getClients();

            // Aplicar filtros actuales
            if (this.currentFilters.search || this.currentFilters.tipo || this.currentFilters.sector || this.currentFilters.estatus) {
                clients = clients.filter(client => {
                    let matches = true;

                    // Búsqueda
                    if (this.currentFilters.search) {
                        const term = this.currentFilters.search.toLowerCase();
                        matches = matches && (
                            (client.nombre && client.nombre.toLowerCase().includes(term)) ||
                            (client.contacto && client.contacto.toLowerCase().includes(term)) ||
                            (client.email && client.email.toLowerCase().includes(term)) ||
                            (client.codigo && client.codigo.toLowerCase().includes(term))
                        );
                    }

                    // Tipo
                    if (this.currentFilters.tipo) {
                        matches = matches && client.tipo === this.currentFilters.tipo;
                    }

                    // Sector
                    if (this.currentFilters.sector) {
                        matches = matches && client.sector === this.currentFilters.sector;
                    }

                    // Estatus
                    if (this.currentFilters.estatus) {
                        matches = matches && client.estatus === this.currentFilters.estatus;
                    }

                    return matches;
                });
            }

            if (!clients || clients.length === 0) {
                this.showMessage('❌ No hay clientes para exportar', 'danger');
                return;
            }

            const headers = ['Código', 'Nombre', 'Contacto', 'Teléfono', 'Email', 'Tipo', 'Sector', 'Estatus', 'Proyectos', 'Fecha Registro'];
            const rows = clients.map(c => [
                c.codigo || '',
                c.nombre || '',
                c.contacto || '',
                c.telefono || '',
                c.email || '',
                this.getTipoLabel(c.tipo) || '',
                this.getSectorLabel(c.sector) || '',
                this.getStatusLabel(c.estatus) || '',
                c.proyectos || 0,
                c.fechaRegistro || ''
            ]);

            // Construir CSV
            let csvContent = '';
            csvContent += headers.join(',') + '\r\n';
            rows.forEach(row => {
                const escapedRow = row.map(value => `"${value.toString().replace(/"/g, '""')}"`);
                csvContent += escapedRow.join(',') + '\r\n';
            });

            // Crear blob y enlace de descarga
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'clientes_filtrados.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showMessage('✅ Clientes exportados correctamente', 'success');
        }
};

window.CSIClients = CSIClients;