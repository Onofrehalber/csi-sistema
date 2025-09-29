// assets/js/modules/crm/orders.js
// MÓDULO DE ÓRDENES DE VENTA - CSI REFRIGERACIÓN
// VERSIÓN COMPLETA 100% FUNCIONAL

const CSIOrders = {
    currentFilters: {
        search: '',
        status: '',
        type: ''
    },

    currentOrder: null,

    // Inicializar módulo
    init: function(container = null) {
        console.log('📋 Módulo de Órdenes de Venta inicializado');
        this.container = container || document.getElementById('csi-module-content');
        if (!this.container) {
            console.error('❌ No se encontró el contenedor para órdenes');
            return;
        }
        this.renderOrdersDashboard();
    },

    // Renderizar dashboard de órdenes
    renderOrdersDashboard: function(filteredOrders = null) {
        console.log('📊 Renderizando dashboard de órdenes...');
        if (!this.container) return;

        const orders = this.getOrders();
        const ordersToRender = filteredOrders || orders;
        const stats = this.getOrderStats();

        this.container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-file-invoice-dollar me-2"></i>Órdenes de Venta</h4>
                <div>
                    <button class="btn btn-danger me-2" onclick="CSIOrders.showOrderForm()">
                        <i class="fas fa-plus me-2"></i>Nueva Orden
                    </button>
                    <button class="btn btn-outline-secondary" onclick="CSIOrders.exportOrders()">
                        <i class="fas fa-download me-2"></i>Exportar
                    </button>
                </div>
            </div>

            <!-- Filtros y Búsqueda -->
            <div class="row mb-3">
                <div class="col-md-4">
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Buscar órdenes..." id="order-search" value="${this.currentFilters.search}">
                        <button class="btn btn-outline-secondary" type="button" id="order-search-button">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
                <div class="col-md-3">
                    <select class="form-select" id="order-filter-status">
                        <option value="">Todos los estados</option>
                        <option value="pendiente" ${this.currentFilters.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="aprobada" ${this.currentFilters.status === 'aprobada' ? 'selected' : ''}>Aprobada</option>
                        <option value="en_proceso" ${this.currentFilters.status === 'en_proceso' ? 'selected' : ''}>En Proceso</option>
                        <option value="en_produccion" ${this.currentFilters.status === 'en_produccion' ? 'selected' : ''}>En Producción</option>
                        <option value="enviada" ${this.currentFilters.status === 'enviada' ? 'selected' : ''}>Enviada</option>
                        <option value="completada" ${this.currentFilters.status === 'completada' ? 'selected' : ''}>Completada</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <select class="form-select" id="order-filter-type">
                        <option value="">Todos los tipos</option>
                        <option value="mantenimiento" ${this.currentFilters.type === 'mantenimiento' ? 'selected' : ''}>Mantenimiento</option>
                        <option value="proyectos" ${this.currentFilters.type === 'proyectos' ? 'selected' : ''}>Proyectos</option>
                        <option value="suministro" ${this.currentFilters.type === 'suministro' ? 'selected' : ''}>Suministro</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <button class="btn btn-outline-danger w-100" onclick="CSIOrders.clearFilters()" title="Limpiar todos los filtros">
                        X Filtros
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
                            <h5 class="stats-number text-warning">${stats.pendientes}</h5>
                            <small class="stats-label text-muted">Pendientes</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="card stats-card">
                        <div class="card-body text-center">
                            <h5 class="stats-number text-info">${stats.en_proceso}</h5>
                            <small class="stats-label text-muted">En Proceso</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="card stats-card">
                        <div class="card-body text-center">
                            <h5 class="stats-number text-success">${stats.completadas}</h5>
                            <small class="stats-label text-muted">Completadas</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="card stats-card">
                        <div class="card-body text-center">
                            <h5 class="stats-number text-dark">$${stats.ingresos.toLocaleString()}</h5>
                            <small class="stats-label text-muted">Ingresos</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="card stats-card">
                        <div class="card-body text-center">
                            <h5 class="stats-number text-secondary">${ordersToRender.length}</h5>
                            <small class="stats-label text-muted">Mostradas</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla de Órdenes -->
            <div class="card">
                <div class="card-body">
                    ${ordersToRender.length === 0 ? `
                        <div class="text-center py-5">
                            <i class="fas fa-file-invoice-dollar fa-3x text-muted mb-3"></i>
                            <p class="text-muted">No se encontraron órdenes de venta</p>
                            <button class="btn btn-danger" onclick="CSIOrders.showOrderForm()">
                                <i class="fas fa-plus me-2"></i>Crear primera orden
                            </button>
                        </div>
                    ` : `
                    <div class="table-responsive">
                        <table class="table table-hover table-striped">
                            <thead class="table-dark">
                                <tr>
                                    <th>Orden #</th>
                                    <th>Cliente</th>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Estado</th>
                                    <th>Entrega</th>
                                    <th>Total</th>
                                    <th>Checklist</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${ordersToRender.map(order => `
                                    <tr>
                                        <td><strong>${order.id}</strong></td>
                                        <td>
                                            <div class="fw-bold">${order.cliente.nombre}</div>
                                            <small class="text-muted">${order.cliente.contacto || 'Sin contacto'}</small>
                                        </td>
                                        <td>${order.fechaCreacion}</td>
                                        <td>
                                            <span class="badge bg-primary">${this.getTypeLabel(order.tipo)}</span>
                                        </td>
                                        <td>
                                            <span class="badge ${this.getStatusClass(order.estado)}">
                                                ${this.getStatusLabel(order.estado)}
                                            </span>
                                        </td>
                                        <td>${order.fechaEntrega || 'Por definir'}</td>
                                        <td>
                                            <strong>$${order.total.toLocaleString()}</strong>
                                            <small class="text-muted d-block">IVA: $${order.iva.toLocaleString()}</small>
                                        </td>
                                        <td>
                                            <div class="progress" style="height: 8px;" title="${this.getChecklistProgress(order.checklist)}% completado">
                                                <div class="progress-bar bg-success" 
                                                     style="width: ${this.getChecklistProgress(order.checklist)}%">
                                                </div>
                                            </div>
                                            <small class="text-muted">${this.getChecklistProgress(order.checklist)}%</small>
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-primary" onclick="CSIOrders.viewOrder('${order.id}')" title="Ver detalles">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn btn-outline-warning" onclick="CSIOrders.editOrder('${order.id}')" title="Editar orden">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-outline-danger" onclick="CSIOrders.deleteOrder('${order.id}')" title="Eliminar orden">
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

    // Configurar event listeners
    setupEventListeners: function() {
        console.log('🎯 Configurando event listeners de órdenes...');
        
        // Búsqueda
        const searchButton = document.getElementById('order-search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const searchInput = document.getElementById('order-search');
                this.currentFilters.search = searchInput.value;
                this.applyFilters();
            });
        }
        
        // Búsqueda con ENTER
        const searchInput = document.getElementById('order-search');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.currentFilters.search = e.target.value;
                    this.applyFilters();
                }
            });
        }

        // Filtros
        const filterStatus = document.getElementById('order-filter-status');
        const filterType = document.getElementById('order-filter-type');
        
        if (filterStatus) {
            filterStatus.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.applyFilters();
            });
        }
        
        if (filterType) {
            filterType.addEventListener('change', (e) => {
                this.currentFilters.type = e.target.value;
                this.applyFilters();
            });
        }
    },

    // Aplicar filtros
    applyFilters: function() {
        let filteredOrders = this.getOrders();
        
        if (!this.currentFilters.search && !this.currentFilters.status && !this.currentFilters.type) {
            this.renderOrdersDashboard(filteredOrders);
            return;
        }

        // Filtro por búsqueda
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filteredOrders = filteredOrders.filter(order => 
                order.id.toLowerCase().includes(searchTerm) ||
                order.cliente.nombre.toLowerCase().includes(searchTerm) ||
                (order.cliente.contacto && order.cliente.contacto.toLowerCase().includes(searchTerm))
            );
        }

        // Filtro por estado
        if (this.currentFilters.status) {
            filteredOrders = filteredOrders.filter(order => 
                order.estado === this.currentFilters.status
            );
        }

        // Filtro por tipo
        if (this.currentFilters.type) {
            filteredOrders = filteredOrders.filter(order => 
                order.tipo === this.currentFilters.type
            );
        }

        this.renderOrdersDashboard(filteredOrders);
    },

    // Limpiar filtros
    clearFilters: function() {
        this.currentFilters = { search: '', status: '', type: '' };
        
        const searchInput = document.getElementById('order-search');
        const filterStatus = document.getElementById('order-filter-status');
        const filterType = document.getElementById('order-filter-type');
        
        if (searchInput) searchInput.value = '';
        if (filterStatus) filterStatus.value = '';
        if (filterType) filterType.value = '';
        
        this.renderOrdersDashboard();
        this.showMessage('Filtros limpiados correctamente', 'success');
    },

    // Obtener órdenes desde localStorage
    getOrders: function() {
        try {
            const saved = localStorage.getItem('csi_orders');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading orders:', error);
            return [];
        }
    },

    // Guardar órdenes en localStorage
    saveOrders: function(orders) {
        try {
            localStorage.setItem('csi_orders', JSON.stringify(orders));
            return true;
        } catch (error) {
            console.error('Error saving orders:', error);
            return false;
        }
    },

    // Obtener estadísticas de órdenes
    getOrderStats: function() {
        const orders = this.getOrders();
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const stats = orders.reduce((acc, order) => {
            // Contar por estado
            acc[order.estado] = (acc[order.estado] || 0) + 1;
            acc.total++;
            
            // Ingresos del mes
            const orderDate = new Date(order.fechaCreacion);
            if (orderDate.getMonth() === currentMonth && 
                orderDate.getFullYear() === currentYear &&
                order.estado === 'completada') {
                acc.ingresos += order.total;
            }
            
            return acc;
        }, {
            total: 0,
            pendiente: 0,
            aprobada: 0,
            en_proceso: 0,
            en_produccion: 0,
            enviada: 0,
            completada: 0,
            ingresos: 0
        });

        // Asegurar que todas las propiedades existan
        return {
            total: stats.total || 0,
            pendientes: stats.pendiente || 0,
            en_proceso: stats.en_proceso || 0,
            completadas: stats.completada || 0,
            ingresos: stats.ingresos || 0
        };
    },

    // Generar próximo ID de orden
    generateNextOrderId: function() {
        const orders = this.getOrders();
        const lastOrder = orders.reduce((max, order) => {
            const num = parseInt(order.id.split('-')[1]) || 0;
            return num > max ? num : max;
        }, 0);
        
        return `OV-${String(lastOrder + 1).padStart(3, '0')}`;
    },

    // Obtener checklist por tipo
    getChecklistByType: function(tipo) {
        const checklists = {
            mantenimiento: [
                { id: 1, descripcion: 'Revisión de componentes eléctricos', completado: false },
                { id: 2, descripcion: 'Limpieza de filtros y serpentines', completado: false },
                { id: 3, descripcion: 'Verificación de presión y temperatura', completado: false },
                { id: 4, descripcion: 'Prueba de funcionamiento final', completado: false },
                { id: 5, descripcion: 'Firma de conformidad del cliente', completado: false }
            ],
            proyectos: [
                { id: 1, descripcion: 'Evaluación del sitio de instalación', completado: false },
                { id: 2, descripcion: 'Preparación de base y soportes', completado: false },
                { id: 3, descripcion: 'Instalación de equipo principal', completado: false },
                { id: 4, descripcion: 'Conexiones eléctricas y refrigerantes', completado: false },
                { id: 5, descripcion: 'Pruebas de presión y vacío', completado: false },
                { id: 6, descripcion: 'Puesta en marcha y calibración', completado: false }
            ],
            suministro: [
                { id: 1, descripcion: 'Verificación de inventario', completado: false },
                { id: 2, descripcion: 'Empaque y protección del equipo', completado: false },
                { id: 3, descripcion: 'Documentación técnica incluida', completado: false },
                { id: 4, descripcion: 'Coordinación de entrega', completado: false },
                { id: 5, descripcion: 'Instrucciones de uso al cliente', completado: false }
            ]
        };
        return JSON.parse(JSON.stringify(checklists[tipo] || checklists.mantenimiento));
    },

    // Obtener progreso del checklist
    getChecklistProgress: function(checklist) {
        if (!checklist || checklist.length === 0) return 0;
        const completed = checklist.filter(item => item.completado).length;
        return Math.round((completed / checklist.length) * 100);
    },

    // Renderizar items del formulario
    renderOrderItemsForm: function(items) {
        if (!items || items.length === 0) {
            return '<p class="text-muted">No hay items agregados</p>';
        }

        return items.map((item, index) => `
            <div class="order-item-row mb-2 p-2 border rounded">
                <div class="row g-2">
                    <div class="col-md-5">
                        <input type="text" class="form-control form-control-sm" 
                               value="${item.descripcion || ''}" 
                               placeholder="Descripción del item"
                               onchange="CSIOrders.updateOrderItem(${index}, 'descripcion', this.value)">
                    </div>
                    <div class="col-md-2">
                        <input type="number" class="form-control form-control-sm" 
                               value="${item.cantidad || 1}" min="1"
                               placeholder="Cantidad"
                               onchange="CSIOrders.updateOrderItem(${index}, 'cantidad', this.value)">
                    </div>
                    <div class="col-md-3">
                        <input type="number" class="form-control form-control-sm" 
                               value="${item.precio || 0}" step="0.01" min="0"
                               placeholder="Precio unitario"
                               onchange="CSIOrders.updateOrderItem(${index}, 'precio', this.value)">
                    </div>
                    <div class="col-md-2">
                        <span class="badge bg-secondary">$${(item.cantidad * item.precio).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Renderizar checklist del formulario
    renderChecklistForm: function(checklist) {
        return checklist.map(item => `
            <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" 
                       ${item.completado ? 'checked' : ''}
                       id="checklist-${item.id}"
                       onchange="CSIOrders.updateChecklistItem(${item.id}, this.checked)">
                <label class="form-check-label ${item.completado ? 'text-decoration-line-through text-muted' : ''}" 
                       for="checklist-${item.id}">
                    ${item.descripcion}
                </label>
            </div>
        `).join('');
    },

    // Actualizar item de la orden
    updateOrderItem: function(index, field, value) {
        if (!this.currentOrder || !this.currentOrder.items) return;
        
        if (this.currentOrder.items[index]) {
            this.currentOrder.items[index][field] = field === 'cantidad' || field === 'precio' ? 
                parseFloat(value) || 0 : value;
            this.calculateOrderTotals();
        }
    },

    // Actualizar item del checklist
    updateChecklistItem: function(itemId, completed) {
        if (!this.currentOrder || !this.currentOrder.checklist) return;
        
        const item = this.currentOrder.checklist.find(i => i.id === itemId);
        if (item) {
            item.completado = completed;
        }
    },

    // Calcular totales de la orden
    calculateOrderTotals: function() {
        if (!this.currentOrder || !this.currentOrder.items) return;
        
        const subtotal = this.currentOrder.items.reduce((sum, item) => 
            sum + (item.cantidad * item.precio), 0);
        
        this.currentOrder.subtotal = subtotal;
        this.currentOrder.iva = subtotal * 0.16;
        this.currentOrder.total = subtotal + this.currentOrder.iva;
    },

    // Agregar nuevo item
    addItem: function() {
        if (!this.currentOrder) return;
        
        if (!this.currentOrder.items) {
            this.currentOrder.items = [];
        }
        
        this.currentOrder.items.push({
            descripcion: '',
            cantidad: 1,
            precio: 0
        });
        
        this.updateOrderForm();
    },

    // Actualizar formulario de orden
    updateOrderForm: function() {
        const itemsContainer = document.getElementById('orderItemsContainer');
        if (itemsContainer) {
            itemsContainer.innerHTML = this.renderOrderItemsForm(this.currentOrder.items);
        }
        this.calculateOrderTotals();
    },

    // Actualizar checklist al cambiar tipo
    updateChecklist: function(tipo) {
        if (!this.currentOrder) return;
        
        this.currentOrder.tipo = tipo;
        this.currentOrder.checklist = this.getChecklistByType(tipo);
        
        const checklistContainer = document.getElementById('checklistContainer');
        if (checklistContainer) {
            checklistContainer.innerHTML = this.renderChecklistForm(this.currentOrder.checklist);
        }
    },

    // Mostrar formulario de orden
    showOrderForm: function(order = null) {
        console.log('📝 Mostrando formulario de orden...');
        const isEdit = order !== null;
        
        this.currentOrder = order ? {...order} : this.createEmptyOrder();
        
        const modalHTML = `
            <div class="modal fade" id="orderModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">${isEdit ? 'Editar Orden' : 'Nueva Orden de Venta'}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="orderForm">
                                ${isEdit ? `<input type="hidden" id="editOrderId" value="${order.id}">` : ''}
                                
                                <!-- Información Básica -->
                                <div class="row mb-4">
                                    <div class="col-md-12">
                                        <h6><i class="fas fa-info-circle me-2"></i>Información Básica</h6>
                                        <hr>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="mb-3">
                                            <label class="form-label">Número de Orden</label>
                                            <input type="text" class="form-control" value="${this.currentOrder.id}" disabled>
                                        </div>
                                    </div>
                                    <div class="col-md-5">
                                        <div class="mb-3">
                                            <label class="form-label">Cliente *</label>
                                            <select class="form-select" id="orderCliente" required>
                                                <option value="">Seleccionar cliente...</option>
                                                ${this.getAvailableClients().map(client => `
                                                    <option value="${client.id}" ${this.currentOrder.cliente.id === client.id ? 'selected' : ''}>
                                                        ${client.nombre} - ${client.contacto || 'Sin contacto'}
                                                    </option>
                                                `).join('')}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Tipo de Orden *</label>
                                            <select class="form-select" id="orderTipo" required onchange="CSIOrders.updateChecklist(this.value)">
                                                <option value="mantenimiento" ${this.currentOrder.tipo === 'mantenimiento' ? 'selected' : ''}>Mantenimiento</option>
                                                <option value="proyectos" ${this.currentOrder.tipo === 'proyectos' ? 'selected' : ''}>Proyectos</option>
                                                <option value="suministro" ${this.currentOrder.tipo === 'suministro' ? 'selected' : ''}>Suministro</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <!-- Información de Entrega -->
                                <div class="row mb-4">
                                    <div class="col-md-12">
                                        <h6><i class="fas fa-truck me-2"></i>Información de Entrega/Instalación</h6>
                                        <hr>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Dirección de Instalación</label>
                                            <input type="text" class="form-control" id="orderDireccion" 
                                                   value="${this.currentOrder.entrega.direccion}" placeholder="Dirección completa">
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="mb-3">
                                            <label class="form-label">Fecha de Entrega</label>
                                            <input type="date" class="form-control" id="orderFechaEntrega" 
                                                   value="${this.currentOrder.fechaEntrega}">
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="mb-3">
                                            <label class="form-label">Horario Preferido</label>
                                            <input type="text" class="form-control" id="orderHorario" 
                                                   value="${this.currentOrder.entrega.horario}" placeholder="Ej: 9:00 AM - 2:00 PM">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Contacto en Sitio</label>
                                            <input type="text" class="form-control" id="orderContacto" 
                                                   value="${this.currentOrder.entrega.contacto}" placeholder="Nombre del contacto">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Teléfono de Contacto</label>
                                            <input type="tel" class="form-control" id="orderTelefono" 
                                                   value="${this.currentOrder.entrega.telefono}" placeholder="Teléfono">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Estado</label>
                                            <select class="form-select" id="orderEstado" required>
                                                <option value="pendiente" ${this.currentOrder.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                                                <option value="aprobada" ${this.currentOrder.estado === 'aprobada' ? 'selected' : ''}>Aprobada</option>
                                                <option value="en_proceso" ${this.currentOrder.estado === 'en_proceso' ? 'selected' : ''}>En Proceso</option>
                                                <option value="en_produccion" ${this.currentOrder.estado === 'en_produccion' ? 'selected' : ''}>En Producción</option>
                                                <option value="enviada" ${this.currentOrder.estado === 'enviada' ? 'selected' : ''}>Enviada</option>
                                                <option value="completada" ${this.currentOrder.estado === 'completada' ? 'selected' : ''}>Completada</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="mb-3">
                                            <label class="form-label">Especificaciones Técnicas</label>
                                            <textarea class="form-control" id="orderEspecificaciones" rows="3" 
                                                      placeholder="Especificaciones adicionales...">${this.currentOrder.entrega.especificaciones}</textarea>
                                        </div>
                                    </div>
                                </div>

                                <!-- Items y Precios -->
                                <div class="row mb-4">
                                    <div class="col-md-12">
                                        <h6><i class="fas fa-list me-2"></i>Items y Precios</h6>
                                        <hr>
                                        <div id="orderItemsContainer">
                                            ${this.renderOrderItemsForm(this.currentOrder.items)}
                                        </div>
                                        <button type="button" class="btn btn-outline-primary btn-sm mt-2" onclick="CSIOrders.addItem()">
                                            <i class="fas fa-plus me-1"></i>Agregar Item
                                        </button>
                                        <div class="mt-3 p-3 bg-light rounded">
                                            <div class="row">
                                                <div class="col-md-4"><strong>Subtotal:</strong></div>
                                                <div class="col-md-8">$${this.currentOrder.subtotal.toLocaleString()}</div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-4"><strong>IVA (16%):</strong></div>
                                                <div class="col-md-8">$${this.currentOrder.iva.toLocaleString()}</div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-4"><strong>Total:</strong></div>
                                                <div class="col-md-8"><strong>$${this.currentOrder.total.toLocaleString()}</strong></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Checklist -->
                                <div class="row mb-4">
                                    <div class="col-md-12">
                                        <h6><i class="fas fa-tasks me-2"></i>Checklist</h6>
                                        <hr>
                                        <div id="checklistContainer">
                                            ${this.renderChecklistForm(this.currentOrder.checklist)}
                                        </div>
                                        <div class="mt-2">
                                            <small class="text-muted">Progreso: ${this.getChecklistProgress(this.currentOrder.checklist)}% completado</small>
                                        </div>
                                    </div>
                                </div>

                                <!-- Observaciones -->
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="mb-3">
                                            <label class="form-label">Observaciones</label>
                                            <textarea class="form-control" id="orderObservaciones" rows="3" 
                                                      placeholder="Observaciones importantes...">${this.currentOrder.observaciones}</textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" onclick="CSIOrders.${isEdit ? 'updateOrder' : 'saveOrder'}()">
                                <i class="fas fa-save me-2"></i>${isEdit ? 'Actualizar' : 'Guardar'} Orden
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.showModal(modalHTML);
    },

    // Crear orden vacía
    createEmptyOrder: function() {
        const client = this.getAvailableClients()[0];
        return {
            id: this.generateNextOrderId(),
            cliente: client,
            tipo: 'mantenimiento',
            estado: 'pendiente',
            fechaCreacion: new Date().toISOString().split('T')[0],
            fechaEntrega: '',
            items: [],
            subtotal: 0,
            iva: 0,
            total: 0,
            checklist: this.getChecklistByType('mantenimiento'),
            entrega: {
                direccion: '',
                horario: '',
                contacto: '',
                telefono: '',
                especificaciones: ''
            },
            observaciones: '',
            timeline: [{
                estado: 'pendiente',
                fecha: new Date().toISOString(),
                usuario: 'Sistema'
            }]
        };
    },

    // Guardar nueva orden
    saveOrder: function() {
        if (!this.validateOrderForm()) return;

        // Actualizar datos del formulario
        this.updateOrderFromForm();

        const orders = this.getOrders();
        orders.push(this.currentOrder);
        
        if (this.saveOrders(orders)) {
            this.showMessage('✅ Orden guardada correctamente', 'success');
            this.closeModal();
            this.renderOrdersDashboard();
        } else {
            this.showMessage('❌ Error al guardar la orden', 'error');
        }
    },

    // Actualizar orden existente
    updateOrder: function() {
        if (!this.validateOrderForm()) return;

        // Actualizar datos del formulario
        this.updateOrderFromForm();

        const orders = this.getOrders();
        const index = orders.findIndex(order => order.id === this.currentOrder.id);
        
        if (index !== -1) {
            orders[index] = this.currentOrder;
            
            if (this.saveOrders(orders)) {
                this.showMessage('✅ Orden actualizada correctamente', 'success');
                this.closeModal();
                this.renderOrdersDashboard();
            } else {
                this.showMessage('❌ Error al actualizar la orden', 'error');
            }
        }
    },

    // Validar formulario de orden
    validateOrderForm: function() {
        const clienteSelect = document.getElementById('orderCliente');
        if (!clienteSelect || !clienteSelect.value) {
            this.showMessage('❌ Debe seleccionar un cliente', 'error');
            return false;
        }

        if (!this.currentOrder.items || this.currentOrder.items.length === 0) {
            this.showMessage('❌ Debe agregar al menos un item', 'error');
            return false;
        }

        // Validar que todos los items tengan descripción y precio
        const invalidItems = this.currentOrder.items.filter(item => 
            !item.descripcion || item.precio <= 0
        );

        if (invalidItems.length > 0) {
            this.showMessage('❌ Todos los items deben tener descripción y precio válido', 'error');
            return false;
        }

        return true;
    },

    // Actualizar orden desde formulario
    updateOrderFromForm: function() {
        const clienteSelect = document.getElementById('orderCliente');
        const clienteId = clienteSelect ? parseInt(clienteSelect.value) : null;
        const cliente = this.getAvailableClients().find(c => c.id === clienteId);

        this.currentOrder.cliente = cliente || this.currentOrder.cliente;
        this.currentOrder.tipo = document.getElementById('orderTipo')?.value || this.currentOrder.tipo;
        this.currentOrder.estado = document.getElementById('orderEstado')?.value || this.currentOrder.estado;
        this.currentOrder.fechaEntrega = document.getElementById('orderFechaEntrega')?.value || '';
        
        this.currentOrder.entrega = {
            direccion: document.getElementById('orderDireccion')?.value || '',
            horario: document.getElementById('orderHorario')?.value || '',
            contacto: document.getElementById('orderContacto')?.value || '',
            telefono: document.getElementById('orderTelefono')?.value || '',
            especificaciones: document.getElementById('orderEspecificaciones')?.value || ''
        };

        this.currentOrder.observaciones = document.getElementById('orderObservaciones')?.value || '';
        
        // Recalcular totales
        this.calculateOrderTotals();
    },

    // Ver orden
    viewOrder: function(orderId) {
        const order = this.getOrders().find(o => o.id === orderId);
        if (order) {
            const modalHTML = `
                <div class="modal fade" id="viewOrderModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header bg-primary text-white">
                                <h5 class="modal-title"><i class="fas fa-file-invoice-dollar me-2"></i>Orden ${order.id}</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <h6><i class="fas fa-info-circle me-2"></i>Información General</h6>
                                        <p><strong>Cliente:</strong> ${order.cliente.nombre}</p>
                                        <p><strong>Contacto:</strong> ${order.cliente.contacto || 'No especificado'}</p>
                                        <p><strong>Tipo:</strong> <span class="badge bg-primary">${this.getTypeLabel(order.tipo)}</span></p>
                                        <p><strong>Estado:</strong> <span class="badge ${this.getStatusClass(order.estado)}">${this.getStatusLabel(order.estado)}</span></p>
                                    </div>
                                    <div class="col-md-6">
                                        <h6><i class="fas fa-calendar me-2"></i>Fechas</h6>
                                        <p><strong>Creación:</strong> ${order.fechaCreacion}</p>
                                        <p><strong>Entrega:</strong> ${order.fechaEntrega || 'Por definir'}</p>
                                        <p><strong>Checklist:</strong> ${this.getChecklistProgress(order.checklist)}% completado</p>
                                    </div>
                                </div>
                                
                                <div class="mt-3">
                                    <h6><i class="fas fa-list me-2"></i>Items</h6>
                                    <div class="table-responsive">
                                        <table class="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Descripción</th>
                                                    <th>Cantidad</th>
                                                    <th>Precio</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${order.items.map(item => `
                                                    <tr>
                                                        <td>${item.descripcion}</td>
                                                        <td>${item.cantidad}</td>
                                                        <td>$${item.precio.toLocaleString()}</td>
                                                        <td>$${(item.cantidad * item.precio).toLocaleString()}</td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                <div class="row mt-3">
                                    <div class="col-md-6">
                                        <p><strong>Subtotal:</strong> $${order.subtotal.toLocaleString()}</p>
                                        <p><strong>IVA (16%):</strong> $${order.iva.toLocaleString()}</p>
                                        <p><strong>Total:</strong> <strong>$${order.total.toLocaleString()}</strong></p>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-warning" onclick="CSIOrders.editOrder('${order.id}')">
                                    <i class="fas fa-edit me-2"></i>Editar Orden
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

    // Editar orden
    editOrder: function(orderId) {
        const order = this.getOrders().find(o => o.id === orderId);
        if (order) {
            this.showOrderForm(order);
        }
    },

    // Eliminar orden
    deleteOrder: function(orderId) {
        if (confirm('¿Estás seguro de eliminar esta orden? Esta acción no se puede deshacer.')) {
            const orders = this.getOrders();
            const filteredOrders = orders.filter(order => order.id !== orderId);
            
            if (this.saveOrders(filteredOrders)) {
                this.showMessage('✅ Orden eliminada correctamente', 'success');
                this.renderOrdersDashboard();
            } else {
                this.showMessage('❌ Error al eliminar la orden', 'error');
            }
        }
    },

    // Exportar órdenes
    exportOrders: function() {
        const orders = this.getOrders();
        
        if (orders.length === 0) {
            this.showMessage('❌ No hay órdenes para exportar', 'error');
            return;
        }

        const headers = ['Orden #', 'Cliente', 'Fecha', 'Tipo', 'Estado', 'Total', 'Checklist %'];
        const rows = orders.map(order => [
            order.id,
            order.cliente.nombre,
            order.fechaCreacion,
            this.getTypeLabel(order.tipo),
            this.getStatusLabel(order.estado),
            `$${order.total.toLocaleString()}`,
            `${this.getChecklistProgress(order.checklist)}%`
        ]);

        let csvContent = '';
        csvContent += headers.join(',') + '\r\n';
        rows.forEach(row => {
            const escapedRow = row.map(value => `"${value.toString().replace(/"/g, '""')}"`);
            csvContent += escapedRow.join(',') + '\r\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ordenes_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('✅ Órdenes exportadas correctamente', 'success');
    },

    // Helper functions
    getAvailableClients: function() {
        // Integrar con módulo de clientes real en el futuro
        if (typeof CSIClients !== 'undefined') {
            return CSIClients.getClients().map(client => ({
                id: client.id,
                nombre: client.nombre,
                contacto: client.contacto
            }));
        }
        
        return [
            { id: 1, nombre: 'Pesquera del Pacífico SA', contacto: 'Ing. Carlos Rodríguez' },
            { id: 2, nombre: 'Frío Industrial Monterrey', contacto: 'Lic. Ana Martínez' },
            { id: 3, nombre: 'Lácteos La Vaquita', contacto: 'Sr. Roberto González' }
        ];
    },

    getTypeLabel: function(tipo) {
        const tipos = {
            'mantenimiento': 'Mantenimiento',
            'proyectos': 'Proyectos',
            'suministro': 'Suministro'
        };
        return tipos[tipo] || tipo;
    },

    getStatusLabel: function(estado) {
        const estados = {
            'pendiente': 'Pendiente',
            'aprobada': 'Aprobada',
            'en_proceso': 'En Proceso',
            'en_produccion': 'En Producción',
            'enviada': 'Enviada',
            'completada': 'Completada'
        };
        return estados[estado] || estado;
    },

    getStatusClass: function(estado) {
        const classes = {
            'pendiente': 'bg-warning',
            'aprobada': 'bg-info',
            'en_proceso': 'bg-primary',
            'en_produccion': 'bg-secondary',
            'enviada': 'bg-dark',
            'completada': 'bg-success'
        };
        return classes[estado] || 'bg-secondary';
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
        
        const modal = new bootstrap.Modal(document.getElementById(content.includes('viewOrderModal') ? 'viewOrderModal' : 'orderModal'));
        modal.show();
    },

    // Cerrar modal
    closeModal: function() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
        if (modal) {
            modal.hide();
        }
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
            modalContainer.innerHTML = '';
        }
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
    }
};

window.CSIOrders = CSIOrders;