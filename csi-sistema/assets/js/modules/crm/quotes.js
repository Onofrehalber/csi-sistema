// ===== MÓDULO DE GESTIÓN DE COTIZACIONES - CSI REFRIGERACIÓN =====
const CSIQuotes = {
    currentFilters: {
        search: '',
        cliente: '',
        estatus: '',
        fechaDesde: '',
        fechaHasta: ''
    },

    // === INICIALIZACIÓN ===
    init: function() {
        console.log('💰 Módulo de Cotizaciones inicializado');
        CSIQuotes.renderQuoteList();
        CSIQuotes.setupEventListeners();
    },

    // === FUNCIONES BÁSICAS ===
    getQuotes: function() {
        console.log('📋 Obteniendo cotizaciones...');
        
        if (typeof CSIDatabase !== 'undefined' && CSIDatabase.getAll) {
            const quotes = CSIDatabase.getAll('quotes') || [];
            console.log('Cotizaciones en DB:', quotes);
            return quotes;
        } else {
            const savedQuotes = localStorage.getItem('csi_quotes');
            if (savedQuotes) {
                return JSON.parse(savedQuotes);
            }
            
            console.log('Usando cotizaciones de ejemplo');
            return [
                {
                    id: 1,
                    codigo: 'CSI-COT-OQ250925-1',
                    clienteId: 1,
                    tipo: 'suministro',
                    descripcion: 'Sistema de refrigeración para cámara de pescado',
                    fechaCreacion: '2024-09-25',
                    fechaVencimiento: '2024-10-09',
                    items: [
                        { descripcion: 'Compresor 5HP', cantidad: 2, precio: 15000, total: 30000 },
                        { descripcion: 'Evaporador industrial', cantidad: 1, precio: 25000, total: 25000 }
                    ],
                    subtotal: 55000,
                    iva: 8800,
                    total: 63800,
                    estatus: 'pendiente',
                    notas: 'Cotización válida por 15 días',
                    usuario: 'OQ'
                }
            ];
        }
    },

    getQuoteStats: function() {
        const quotes = this.getQuotes();
        return {
            total: quotes.length,
            pendientes: quotes.filter(q => q.estatus === 'pendiente').length,
            aprobadas: quotes.filter(q => q.estatus === 'aprobada').length,
            rechazadas: quotes.filter(q => q.estatus === 'rechazada').length,
            vencidas: quotes.filter(q => q.estatus === 'vencida').length,
            totalMonto: quotes.reduce((sum, quote) => sum + (quote.total || 0), 0)
        };
    },

    // === RENDERIZAR LISTA MEJORADA CON ETIQUETAS ===
    renderQuoteList: function(filteredQuotes = null) {
        console.log('📋 Renderizando lista de cotizaciones...');
        const container = document.getElementById('crm-quotes-content');
        if (!container) {
            console.error('❌ No se encontró el contenedor crm-quotes-content');
            return;
        }

        const quotes = this.getQuotes();
        const quotesToRender = filteredQuotes || quotes;
        const stats = this.getQuoteStats();
        const clients = this.getClients();

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-file-invoice-dollar me-2"></i>Lista de Cotizaciones</h4>
                <div>
                    <button class="btn btn-danger me-2" onclick="CSIQuotes.showQuoteForm()">
                        <i class="fas fa-plus me-2"></i>Nueva Cotización
                    </button>
                    <button class="btn btn-outline-secondary" onclick="CSIQuotes.exportQuotes()">
                        <i class="fas fa-download me-2"></i>Exportar
                    </button>
                </div>
            </div>

            <!-- Filtros y Búsqueda MEJORADO CON ETIQUETAS -->
            <div class="row mb-3">
                <div class="col-md-3">
                    <label class="form-label small text-muted mb-1">Buscar por código o descripción</label>
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Ej: CSI-COT o refrigeración..." id="quote-search" value="${this.currentFilters.search}">
                        <button class="btn btn-outline-primary" type="button" id="quote-search-button">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
                <div class="col-md-2">
                    <label class="form-label small text-muted mb-1">Filtrar por cliente</label>
                    <select class="form-select" id="quote-filter-client">
                        <option value="">Todos los clientes</option>
                        ${clients.map(client => 
                            `<option value="${client.id}" ${this.currentFilters.cliente === client.id.toString() ? 'selected' : ''}>
                                ${client.nombre}
                            </option>`
                        ).join('')}
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small text-muted mb-1">Filtrar por estatus</label>
                    <select class="form-select" id="quote-filter-status">
                        <option value="">Todos los estatus</option>
                        <option value="pendiente" ${this.currentFilters.estatus === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="aprobada" ${this.currentFilters.estatus === 'aprobada' ? 'selected' : ''}>Aprobada</option>
                        <option value="rechazada" ${this.currentFilters.estatus === 'rechazada' ? 'selected' : ''}>Rechazada</option>
                        <option value="vencida" ${this.currentFilters.estatus === 'vencida' ? 'selected' : ''}>Vencida</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small text-muted mb-1">Fecha desde</label>
                    <input type="date" class="form-control" id="quote-filter-fecha-desde" value="${this.currentFilters.fechaDesde}">
                </div>
                <div class="col-md-2">
                    <label class="form-label small text-muted mb-1">Fecha hasta</label>
                    <div class="d-flex">
                        <input type="date" class="form-control" id="quote-filter-fecha-hasta" value="${this.currentFilters.fechaHasta}">
                        <button class="btn btn-outline-danger ms-2" onclick="CSIQuotes.clearFilters()" title="Limpiar todos los filtros">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
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
                <h5 class="stats-number text-success">${stats.aprobadas}</h5>
                <small class="stats-label text-muted">Aprobadas</small>
            </div>
        </div>
    </div>
    <div class="col-md-2">
        <div class="card stats-card">
            <div class="card-body text-center">
                <h5 class="stats-number text-danger">${stats.rechazadas}</h5>
                <small class="stats-label text-muted">Rechazadas</small>
            </div>
        </div>
    </div>
    <div class="col-md-2">
        <div class="card stats-card">
            <div class="card-body text-center">
                <h5 class="stats-number text-secondary">${stats.vencidas}</h5>
                <small class="stats-label text-muted">Vencidas</small>
            </div>
        </div>
    </div>
    <div class="col-md-2">
        <div class="card stats-card">
            <div class="card-body text-center">
                <h5 class="stats-number text-info">$${stats.totalMonto.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
                <small class="stats-label text-muted">Monto Total</small>
            </div>
        </div>
    </div>
</div>

            <!-- Tabla de Cotizaciones CON FORMATO MEJORADO -->
            <div class="card">
                <div class="card-body">
                    ${quotesToRender.length === 0 ? `
                        <div class="text-center py-5">
                            <i class="fas fa-file-invoice-dollar fa-3x text-muted mb-3"></i>
                            <p class="text-muted">No se encontraron cotizaciones</p>
                            <button class="btn btn-danger" onclick="CSIQuotes.showQuoteForm()">
                                <i class="fas fa-plus me-2"></i>Crear primera cotización
                            </button>
                        </div>
                    ` : `
                    <div class="table-responsive">
                        <table class="table table-hover table-striped">
                            <thead class="table-dark">
                                <tr>
                                    <th>Código</th>
                                    <th>Cliente</th>
                                    <th>Descripción</th>
                                    <th>Fecha</th>
                                    <th>Vence</th>
                                    <th>Total</th>
                                    <th>Estatus</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${quotesToRender.map(quote => {
                                    const client = this.getClientById(quote.clienteId);
                                    return `
                                        <tr>
                                            <td><strong>${quote.codigo}</strong></td>
                                            <td>
                                                <div class="fw-bold">${client ? client.nombre : 'Cliente no encontrado'}</div>
                                                <small class="text-muted">${client ? (client.contacto || 'Sin contacto') : ''}</small>
                                            </td>
                                            <td>${quote.descripcion.substring(0, 50)}${quote.descripcion.length > 50 ? '...' : ''}</td>
                                            <td>${this.formatDate(quote.fechaCreacion)}</td>
                                            <td>${this.formatDate(quote.fechaVencimiento)}</td>
                                            <td><strong>$${quote.total.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
                                            <td>
                                                <span class="badge ${this.getQuoteStatusClass(quote.estatus)}">
                                                    ${this.getQuoteStatusLabel(quote.estatus)}
                                                </span>
                                            </td>
                                            <td>
                                                <div class="btn-group btn-group-sm">
                                                    <button class="btn btn-outline-primary" onclick="CSIQuotes.viewQuote(${quote.id})" title="Ver detalles">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                    <button class="btn btn-outline-warning" onclick="CSIQuotes.editQuote(${quote.id})" title="Editar">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button class="btn btn-outline-success" onclick="CSIQuotes.generatePDF(${quote.id})" title="Descargar PDF">
                                                        <i class="fas fa-file-pdf"></i>
                                                    </button>
                                                    <button class="btn btn-outline-danger" onclick="CSIQuotes.deleteQuote(${quote.id})" title="Eliminar">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    `}
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    // === CONFIGURACIÓN DE EVENT LISTENERS ===
    setupEventListeners: function() {
        console.log('🎯 Configurando event listeners de cotizaciones...');
        
        const searchButton = document.getElementById('quote-search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const searchInput = document.getElementById('quote-search');
                this.currentFilters.search = searchInput.value;
                this.applyFilters();
            });
        }
        
        const searchInput = document.getElementById('quote-search');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.currentFilters.search = e.target.value;
                    this.applyFilters();
                }
            });
        }

        const filterClient = document.getElementById('quote-filter-client');
        if (filterClient) {
            filterClient.addEventListener('change', (e) => {
                this.currentFilters.cliente = e.target.value;
                this.applyFilters();
            });
        }
        
        const filterStatus = document.getElementById('quote-filter-status');
        if (filterStatus) {
            filterStatus.addEventListener('change', (e) => {
                this.currentFilters.estatus = e.target.value;
                this.applyFilters();
            });
        }
        
        const filterFechaDesde = document.getElementById('quote-filter-fecha-desde');
        if (filterFechaDesde) {
            filterFechaDesde.addEventListener('change', (e) => {
                this.currentFilters.fechaDesde = e.target.value;
                this.applyFilters();
            });
        }
        
        const filterFechaHasta = document.getElementById('quote-filter-fecha-hasta');
        if (filterFechaHasta) {
            filterFechaHasta.addEventListener('change', (e) => {
                this.currentFilters.fechaHasta = e.target.value;
                this.applyFilters();
            });
        }
    },

    // === APLICAR FILTROS ===
    applyFilters: function() {
        let filteredQuotes = this.getQuotes();
        
        if (!this.currentFilters.search && !this.currentFilters.cliente && 
            !this.currentFilters.estatus && !this.currentFilters.fechaDesde && !this.currentFilters.fechaHasta) {
            this.renderQuoteList(filteredQuotes);
            return;
        }

        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filteredQuotes = filteredQuotes.filter(quote => 
                quote.codigo.toLowerCase().includes(searchTerm) ||
                quote.descripcion.toLowerCase().includes(searchTerm)
            );
        }

        if (this.currentFilters.cliente) {
            filteredQuotes = filteredQuotes.filter(quote => 
                quote.clienteId.toString() === this.currentFilters.cliente
            );
        }

        if (this.currentFilters.estatus) {
            filteredQuotes = filteredQuotes.filter(quote => 
                quote.estatus === this.currentFilters.estatus
            );
        }

        if (this.currentFilters.fechaDesde) {
            filteredQuotes = filteredQuotes.filter(quote => 
                quote.fechaCreacion >= this.currentFilters.fechaDesde
            );
        }

        if (this.currentFilters.fechaHasta) {
            filteredQuotes = filteredQuotes.filter(quote => 
                quote.fechaCreacion <= this.currentFilters.fechaHasta
            );
        }

        this.renderQuoteList(filteredQuotes);
    },

    // === LIMPIAR FILTROS ===
    clearFilters: function() {
        this.currentFilters = { search: '', cliente: '', estatus: '', fechaDesde: '', fechaHasta: '' };
        
        const searchInput = document.getElementById('quote-search');
        const filterClient = document.getElementById('quote-filter-client');
        const filterStatus = document.getElementById('quote-filter-status');
        const filterFechaDesde = document.getElementById('quote-filter-fecha-desde');
        const filterFechaHasta = document.getElementById('quote-filter-fecha-hasta');
        
        if (searchInput) searchInput.value = '';
        if (filterClient) filterClient.value = '';
        if (filterStatus) filterStatus.value = '';
        if (filterFechaDesde) filterFechaDesde.value = '';
        if (filterFechaHasta) filterFechaHasta.value = '';
        
        this.renderQuoteList();
        this.showMessage('Filtros limpiados correctamente', 'success');
    },

    // === SISTEMA DE PLANTILLAS POR TIPO ===
    applyTemplate: function(tipo) {
        const templateItems = this.getTemplateItems(tipo);
        const container = document.getElementById('quoteItemsContainer');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        templateItems.forEach((item, index) => {
            const newItem = document.createElement('div');
            newItem.className = 'quote-item row mb-2';
            newItem.setAttribute('data-index', index);
            newItem.innerHTML = `
                <div class="col-md-5">
                    <input type="text" class="form-control item-descripcion" placeholder="Descripción del item" value="${item.descripcion}" required>
                </div>
                <div class="col-md-2">
                    <input type="number" class="form-control item-cantidad" placeholder="Cant." value="${item.cantidad}" min="1" required>
                </div>
                <div class="col-md-3">
                    <input type="number" class="form-control item-precio" placeholder="Precio unitario" value="${item.precio}" step="0.01" min="0" required>
                </div>
                <div class="col-md-2">
                    <div class="d-flex">
                        <span class="form-control bg-light item-total">$${(item.cantidad * item.precio).toFixed(2)}</span>
                        ${index > 0 ? `<button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="CSIQuotes.removeQuoteItem(${index})">
                            <i class="fas fa-times"></i>
                        </button>` : ''}
                    </div>
                </div>
            `;
            container.appendChild(newItem);
        });
        
        this.setupAllItemEvents();
        this.calculateTotals();
    },

    getTemplateItems: function(tipo) {
        const templates = {
            'suministro': [
                { descripcion: 'Equipo de refrigeración', cantidad: 1, precio: 0, total: 0 },
                { descripcion: 'Instalación y montaje', cantidad: 1, precio: 0, total: 0 },
                { descripcion: 'Materiales y accesorios', cantidad: 1, precio: 0, total: 0 },
                { descripcion: 'Puesta en marcha', cantidad: 1, precio: 0, total: 0 }
            ],
            'mantenimiento': [
                { descripcion: 'Mantenimiento preventivo', cantidad: 1, precio: 0, total: 0 },
                { descripcion: 'Refacciones y repuestos', cantidad: 1, precio: 0, total: 0 },
                { descripcion: 'Mano de obra especializada', cantidad: 1, precio: 0, total: 0 },
                { descripcion: 'Diagnóstico y revisión', cantidad: 1, precio: 0, total: 0 }
            ],
            'proyecto': [
                { descripcion: 'Estudio y diseño del proyecto', cantidad: 1, precio: 0, total: 0 },
                { descripcion: 'Equipos principales', cantidad: 1, precio: 0, total: 0 },
                { descripcion: 'Instalación completa', cantidad: 1, precio: 0, total: 0 },
                { descripcion: 'Materiales y tuberías', cantidad: 1, precio: 0, total: 0 },
                { descripcion: 'Puesta en marcha y capacitación', cantidad: 1, precio: 0, total: 0 }
            ]
        };
        
        return templates[tipo] || [{ descripcion: 'Item de cotización', cantidad: 1, precio: 0, total: 0 }];
    },

    onTipoChange: function(tipo) {
        const applyTemplateBtn = document.getElementById('applyTemplateBtn');
        if (applyTemplateBtn) {
            applyTemplateBtn.disabled = !tipo;
            if (tipo) {
                applyTemplateBtn.innerHTML = `<i class="fas fa-magic me-1"></i>Cargar Plantilla ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
            } else {
                applyTemplateBtn.innerHTML = `<i class="fas fa-magic me-1"></i>Cargar Plantilla`;
            }
        }
    },

    // === SISTEMA DE ITEMS DINÁMICOS ===
    addQuoteItem: function() {
        const container = document.getElementById('quoteItemsContainer');
        const items = container.querySelectorAll('.quote-item');
        const newIndex = items.length;
        
        const newItem = document.createElement('div');
        newItem.className = 'quote-item row mb-2';
        newItem.setAttribute('data-index', newIndex);
        newItem.innerHTML = `
            <div class="col-md-5">
                <input type="text" class="form-control item-descripcion" placeholder="Descripción del item" required>
            </div>
            <div class="col-md-2">
                <input type="number" class="form-control item-cantidad" placeholder="Cant." value="1" min="1" required>
            </div>
            <div class="col-md-3">
                <input type="number" class="form-control item-precio" placeholder="Precio unitario" step="0.01" min="0" required>
            </div>
            <div class="col-md-2">
                <div class="d-flex">
                    <span class="form-control bg-light item-total">$0.00</span>
                    <button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="CSIQuotes.removeQuoteItem(${newIndex})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(newItem);
        this.setupItemEvents(newIndex);
        this.calculateTotals();
    },

    removeQuoteItem: function(index) {
        const item = document.querySelector(`.quote-item[data-index="${index}"]`);
        if (item && index > 0) {
            item.remove();
            this.renumberItems();
            this.calculateTotals();
        }
    },

    renumberItems: function() {
        const items = document.querySelectorAll('.quote-item');
        items.forEach((item, index) => {
            item.setAttribute('data-index', index);
            const removeBtn = item.querySelector('button');
            if (removeBtn) {
                removeBtn.setAttribute('onclick', `CSIQuotes.removeQuoteItem(${index})`);
            }
        });
    },

    setupItemEvents: function(index) {
        const item = document.querySelector(`.quote-item[data-index="${index}"]`);
        if (item) {
            const cantidadInput = item.querySelector('.item-cantidad');
            const precioInput = item.querySelector('.item-precio');
            
            const calculateItemTotal = () => {
                const cantidad = parseFloat(cantidadInput.value) || 0;
                const precio = parseFloat(precioInput.value) || 0;
                const total = cantidad * precio;
                item.querySelector('.item-total').textContent = `$${total.toFixed(2)}`;
                this.calculateTotals();
            };
            
            cantidadInput.addEventListener('input', calculateItemTotal);
            precioInput.addEventListener('input', calculateItemTotal);
        }
    },

    setupAllItemEvents: function() {
        const items = document.querySelectorAll('.quote-item');
        items.forEach((item, index) => {
            this.setupItemEvents(index);
        });
    },

    // === CÁLCULOS AUTOMÁTICOS ===
    calculateTotals: function() {
        let subtotal = 0;
        const items = document.querySelectorAll('.quote-item');
        
        items.forEach(item => {
            const cantidad = parseFloat(item.querySelector('.item-cantidad').value) || 0;
            const precio = parseFloat(item.querySelector('.item-precio').value) || 0;
            subtotal += cantidad * precio;
        });
        
        const iva = subtotal * 0.16;
        const total = subtotal + iva;
        
        const subtotalElement = document.getElementById('quoteSubtotal');
        const ivaElement = document.getElementById('quoteIva');
        const totalElement = document.getElementById('quoteTotal');
        
        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        if (ivaElement) ivaElement.textContent = `$${iva.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    },

    collectQuoteItems: function() {
        const items = [];
        const itemElements = document.querySelectorAll('.quote-item');
        
        itemElements.forEach((itemElement, index) => {
            const descripcion = itemElement.querySelector('.item-descripcion').value;
            const cantidad = parseFloat(itemElement.querySelector('.item-cantidad').value) || 0;
            const precio = parseFloat(itemElement.querySelector('.item-precio').value) || 0;
            
            if (descripcion && cantidad > 0 && precio >= 0) {
                items.push({
                    descripcion: descripcion,
                    cantidad: cantidad,
                    precio: precio,
                    total: cantidad * precio
                });
            }
        });
        
        return items;
    },

    renderQuoteItems: function(items) {
        if (!items || items.length === 0) {
            return this.renderEmptyQuoteItem();
        }
        
        let html = '';
        items.forEach((item, index) => {
            html += `
                <div class="quote-item row mb-2" data-index="${index}">
                    <div class="col-md-5">
                        <input type="text" class="form-control item-descripcion" placeholder="Descripción del item" value="${item.descripcion}" required>
                    </div>
                    <div class="col-md-2">
                        <input type="number" class="form-control item-cantidad" placeholder="Cant." value="${item.cantidad}" min="1" required>
                    </div>
                    <div class="col-md-3">
                        <input type="number" class="form-control item-precio" placeholder="Precio unitario" value="${item.precio}" step="0.01" min="0" required>
                    </div>
                    <div class="col-md-2">
                        <div class="d-flex">
                            <span class="form-control bg-light item-total">$${(item.cantidad * item.precio).toFixed(2)}</span>
                            ${index > 0 ? `<button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="CSIQuotes.removeQuoteItem(${index})">
                                <i class="fas fa-times"></i>
                            </button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        return html;
    },

    renderEmptyQuoteItem: function() {
        return `
            <div class="quote-item row mb-2" data-index="0">
                <div class="col-md-5">
                    <input type="text" class="form-control item-descripcion" placeholder="Descripción del item" required>
                </div>
                <div class="col-md-2">
                    <input type="number" class="form-control item-cantidad" placeholder="Cant." value="1" min="1" required>
                </div>
                <div class="col-md-3">
                    <input type="number" class="form-control item-precio" placeholder="Precio unitario" step="0.01" min="0" required>
                </div>
                <div class="col-md-2">
                    <span class="form-control bg-light item-total">$0.00</span>
                </div>
            </div>
        `;
    },

    // === FORMULARIO MEJORADO CON PLANTILLAS ===
    showQuoteForm: function(quote = null) {
        console.log('📝 Mostrando formulario completo de cotización...');
        const isEdit = quote !== null;
        const clients = this.getClients();
        
        const modalHTML = `
            <div class="modal fade" id="quoteModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-file-invoice-dollar me-2"></i>
                                ${isEdit ? 'Editar Cotización' : 'Nueva Cotización'}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="quoteForm">
                                ${isEdit ? `<input type="hidden" id="editQuoteId" value="${quote.id}">` : ''}
                                
                                <div class="row mb-4">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label"><i class="fas fa-building me-2"></i>Cliente *</label>
                                            <select class="form-select" id="quoteClienteId" required>
                                                <option value="">Seleccionar cliente...</option>
                                                ${clients.map(client => `
                                                    <option value="${client.id}" ${isEdit && quote.clienteId === client.id ? 'selected' : ''}>
                                                        ${client.codigo || 'CSI-000'} - ${client.nombre}
                                                    </option>
                                                `).join('')}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label"><i class="fas fa-tag me-2"></i>Tipo de Cotización *</label>
                                            <select class="form-select" id="quoteTipo" required onchange="CSIQuotes.onTipoChange(this.value)">
                                                <option value="">Seleccionar tipo...</option>
                                                <option value="suministro" ${isEdit && quote.tipo === 'suministro' ? 'selected' : ''}>Suministro</option>
                                                <option value="mantenimiento" ${isEdit && quote.tipo === 'mantenimiento' ? 'selected' : ''}>Mantenimiento</option>
                                                <option value="proyecto" ${isEdit && quote.tipo === 'proyecto' ? 'selected' : ''}>Proyecto</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label"><i class="fas fa-hashtag me-2"></i>Código</label>
                                            <input type="text" class="form-control bg-light" id="quoteCodigo" value="${isEdit ? quote.codigo : this.generateQuoteCode()}" readonly>
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label"><i class="fas fa-file-alt me-2"></i>Descripción del Trabajo *</label>
                                    <textarea class="form-control" id="quoteDescripcion" rows="3" required placeholder="Describa detalladamente el trabajo a realizar...">${isEdit ? quote.descripcion : ''}</textarea>
                                </div>
                                
                                <div class="row mb-4">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label"><i class="fas fa-calendar me-2"></i>Fecha de Creación</label>
                                            <input type="date" class="form-control" id="quoteFechaCreacion" value="${isEdit ? quote.fechaCreacion : new Date().toISOString().split('T')[0]}" required>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label"><i class="fas fa-calendar-times me-2"></i>Fecha de Vencimiento *</label>
                                            <input type="date" class="form-control" id="quoteFechaVencimiento" value="${isEdit ? quote.fechaVencimiento : ''}" required>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label"><i class="fas fa-tag me-2"></i>Estatus *</label>
                                            <select class="form-select" id="quoteEstatus" required>
                                                <option value="pendiente" ${isEdit && quote.estatus === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                                                <option value="aprobada" ${isEdit && quote.estatus === 'aprobada' ? 'selected' : ''}>Aprobada</option>
                                                <option value="rechazada" ${isEdit && quote.estatus === 'rechazada' ? 'selected' : ''}>Rechazada</option>
                                                <option value="vencida" ${isEdit && quote.estatus === 'vencida' ? 'selected' : ''}>Vencida</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-4">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5><i class="fas fa-list me-2"></i>Items de la Cotización</h5>
                                        <div>
                                            <button type="button" class="btn btn-sm btn-outline-primary me-2" onclick="CSIQuotes.addQuoteItem()">
                                                <i class="fas fa-plus me-1"></i>Agregar Item
                                            </button>
                                            ${!isEdit ? `
                                                <button type="button" class="btn btn-sm btn-outline-info" onclick="CSIQuotes.applyTemplate(document.getElementById('quoteTipo').value)" id="applyTemplateBtn" disabled>
                                                    <i class="fas fa-magic me-1"></i>Cargar Plantilla
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                    <div id="quoteItemsContainer">
                                        ${isEdit ? this.renderQuoteItems(quote.items) : this.renderEmptyQuoteItem()}
                                    </div>
                                </div>
                                
                                <div class="row mb-4">
                                    <div class="col-md-4 offset-md-8">
                                        <div class="border p-3 bg-light rounded">
                                            <div class="d-flex justify-content-between mb-2">
                                                <span>Subtotal:</span>
                                                <span id="quoteSubtotal">$${isEdit ? (quote.subtotal || 0).toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</span>
                                            </div>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span>IVA (16%):</span>
                                                <span id="quoteIva">$${isEdit ? (quote.iva || 0).toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</span>
                                            </div>
                                            <div class="d-flex justify-content-between fw-bold fs-5">
                                                <span>Total:</span>
                                                <span id="quoteTotal">$${isEdit ? (quote.total || 0).toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label"><i class="fas fa-sticky-note me-2"></i>Notas y Condiciones</label>
                                    <textarea class="form-control" id="quoteNotas" rows="3" placeholder="Condiciones de pago, garantías, tiempo de entrega, etc.">${isEdit ? (quote.notas || '') : 'Cotización válida por 15 días. Precios incluyen IVA. 50% anticipo, 50% contra entrega. Garantía: 1 año en equipos nuevos.'}</textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Cancelar
                            </button>
                            <button type="button" class="btn btn-danger" onclick="CSIQuotes.${isEdit ? 'updateQuote' : 'saveQuote'}()">
                                <i class="fas fa-save me-2"></i>${isEdit ? 'Actualizar' : 'Guardar'} Cotización
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.showModal(modalHTML);
        
        setTimeout(() => {
            this.setupAllItemEvents();
            this.calculateTotals();
            
            if (!isEdit) {
                const tipoSelect = document.getElementById('quoteTipo');
                const applyTemplateBtn = document.getElementById('applyTemplateBtn');
                if (tipoSelect.value) {
                    applyTemplateBtn.disabled = false;
                    this.onTipoChange(tipoSelect.value);
                }
            }
        }, 100);
    },

    // === GENERACIÓN DE CÓDIGO ===
    generateQuoteCode: function() {
        const user = JSON.parse(localStorage.getItem('csi_currentUser')) || { name: 'OQ', id: 'OQ' };
        const today = new Date();
        const dateStr = today.getDate().toString().padStart(2, '0') + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getFullYear().toString().slice(-2);
        
        const nameParts = user.name ? user.name.split(' ') : ['O', 'Q'];
        const initials = (nameParts[0].charAt(0) + (nameParts[1] ? nameParts[1].charAt(0) : 'Q')).toUpperCase();
        
        const quotes = this.getQuotes();
        const userQuotesToday = quotes.filter(quote => {
            const quoteDate = new Date(quote.fechaCreacion);
            return quote.usuario === user.id && 
                   quoteDate.toDateString() === today.toDateString();
        });
        
        const consecutive = userQuotesToday.length + 1;
        
        return `CSI-COT-${initials}${dateStr}-${consecutive}`;
    },

    // === GENERACIÓN DE PDF REAL ===
    generatePDF: function(quoteId) {
        const quote = this.getQuotes().find(q => q.id === quoteId);
        if (!quote) {
            this.showMessage('❌ Cotización no encontrada para generar PDF', 'danger');
            return;
        }

        const client = this.getClientById(quote.clienteId);
        
        const pdfContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Cotización ${quote.codigo}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                    .company-info { text-align: left; margin-bottom: 20px; }
                    .quote-info { margin: 20px 0; background: #f8f9fa; padding: 15px; border-radius: 5px; }
                    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    .table th { background-color: #ce2d43; color: white; }
                    .totals { float: right; width: 300px; margin-top: 20px; background: #f8f9fa; padding: 15px; border-radius: 5px; }
                    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; }
                    .badge { padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }
                    .bg-success { background-color: #28a745; }
                    .bg-warning { background-color: #ffc107; color: black; }
                    .bg-danger { background-color: #dc3545; }
                    .bg-secondary { background-color: #6c757d; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 style="color: #ce2d43; margin-bottom: 5px;">CSI REFRIGERACIÓN</h1>
                    <h2 style="color: #234b79; margin-top: 0;">COTIZACIÓN ${quote.codigo}</h2>
                </div>
                
                <div class="company-info">
                    <p><strong>CSI Refrigeración</strong><br>
                    Especialistas en Sistemas de Refrigeración Comercial e Industrial<br>
                    Tel: (33) 1234-5678 | Email: info@csirefrigeracion.com<br>
                    www.csirefrigeracion.com</p>
                </div>
                
                <div class="quote-info">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <strong>CLIENTE:</strong><br>
                            ${client ? client.nombre : 'N/A'}<br>
                            ${client ? (client.contacto || '') : ''}<br>
                            ${client ? (client.telefono || '') : ''}
                        </div>
                        <div>
                            <strong>FECHA DE COTIZACIÓN:</strong> ${this.formatDate(quote.fechaCreacion)}<br>
                            <strong>VÁLIDA HASTA:</strong> ${this.formatDate(quote.fechaVencimiento)}<br>
                            <strong>ESTATUS:</strong> <span class="badge ${this.getQuoteStatusClass(quote.estatus)}">${this.getQuoteStatusLabel(quote.estatus)}</span>
                        </div>
                    </div>
                </div>
                
                <h3>DESCRIPCIÓN DEL TRABAJO:</h3>
                <p style="background: #f8f9fa; padding: 15px; border-left: 4px solid #ce2d43;">${quote.descripcion}</p>
                
                <h3>DETALLE DE COTIZACIÓN:</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th width="80">Cantidad</th>
                            <th width="120">Precio Unitario</th>
                            <th width="120">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quote.items.map(item => `
                            <tr>
                                <td>${item.descripcion}</td>
                                <td style="text-align: center;">${item.cantidad}</td>
                                <td style="text-align: right;">$${item.precio.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                <td style="text-align: right;"><strong>$${item.total.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="totals">
                    <table style="width: 100%;">
                        <tr>
                            <td><strong>Subtotal:</strong></td>
                            <td style="text-align: right;">$${quote.subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                            <td><strong>IVA (16%):</strong></td>
                            <td style="text-align: right;">$${quote.iva.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                        <tr style="border-top: 2px solid #333;">
                            <td><strong>TOTAL:</strong></td>
                            <td style="text-align: right; font-size: 1.2em;"><strong>$${quote.total.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
                        </tr>
                    </table>
                </div>
                
                <div style="clear: both;"></div>
                
                <div class="footer">
                    <h4>NOTAS Y CONDICIONES:</h4>
                    <p>${quote.notas || 'Cotización válida por 15 días. Precios incluyen IVA. Tiempo de entrega según disponibilidad. Garantía: 1 año en equipos nuevos.'}</p>
                    
                    <div style="margin-top: 30px;">
                        <p><strong>Atentamente,</strong><br>
                        <strong>CSI Refrigeración</strong><br>
                        ${quote.usuario}<br>
                        Especialista en Refrigeración</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
        
        this.showMessage('📄 PDF generado correctamente. Use la opción de impresión para guardar como PDF.', 'success');
    },

    // === CRUD OPERATIONS ===
    saveQuote: function() {
        console.log('💾 Guardando nueva cotización...');
        
        const clienteId = document.getElementById('quoteClienteId').value;
        const tipo = document.getElementById('quoteTipo').value;
        const descripcion = document.getElementById('quoteDescripcion').value;
        const fechaVencimiento = document.getElementById('quoteFechaVencimiento').value;
        
        if (!clienteId || !tipo || !descripcion || !fechaVencimiento) {
            this.showMessage('❌ Complete todos los campos obligatorios', 'danger');
            return;
        }

        const items = this.collectQuoteItems();
        if (items.length === 0) {
            this.showMessage('❌ Debe agregar al menos un item', 'danger');
            return;
        }

        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const iva = subtotal * 0.16;
        const total = subtotal + iva;

        const user = JSON.parse(localStorage.getItem('csi_currentUser')) || { id: 'OQ', name: 'Onofre Quispe' };

        const nuevaCotizacion = {
            id: Date.now(),
            codigo: this.generateQuoteCode(),
            clienteId: parseInt(clienteId),
            tipo: tipo,
            descripcion: descripcion,
            fechaCreacion: document.getElementById('quoteFechaCreacion').value,
            fechaVencimiento: fechaVencimiento,
            items: items,
            subtotal: subtotal,
            iva: iva,
            total: total,
            estatus: document.getElementById('quoteEstatus').value,
            notas: document.getElementById('quoteNotas').value,
            usuario: user.id
        };

        if (typeof CSIDatabase !== 'undefined' && CSIDatabase.insert) {
            CSIDatabase.insert('quotes', nuevaCotizacion);
        } else {
            const quotes = this.getQuotes();
            quotes.push(nuevaCotizacion);
            localStorage.setItem('csi_quotes', JSON.stringify(quotes));
        }
        
        this.showMessage('✅ Cotización guardada correctamente', 'success');
        bootstrap.Modal.getInstance(document.getElementById('quoteModal')).hide();
        this.renderQuoteList();
    },

    editQuote: function(quoteId) {
        const quote = this.getQuotes().find(q => q.id === quoteId);
        if (quote) {
            this.showQuoteForm(quote);
        }
    },

    updateQuote: function() {
        console.log('✏️ Actualizando cotización...');
        const quoteId = parseInt(document.getElementById('editQuoteId').value);
        
        const clienteId = document.getElementById('quoteClienteId').value;
        const tipo = document.getElementById('quoteTipo').value;
        const descripcion = document.getElementById('quoteDescripcion').value;
        const fechaVencimiento = document.getElementById('quoteFechaVencimiento').value;
        
        if (!clienteId || !tipo || !descripcion || !fechaVencimiento) {
            this.showMessage('❌ Complete todos los campos obligatorios', 'danger');
            return;
        }

        const items = this.collectQuoteItems();
        if (items.length === 0) {
            this.showMessage('❌ Debe tener al menos un item', 'danger');
            return;
        }

        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const iva = subtotal * 0.16;
        const total = subtotal + iva;

        const datosActualizados = {
            clienteId: parseInt(clienteId),
            tipo: tipo,
            descripcion: descripcion,
            fechaCreacion: document.getElementById('quoteFechaCreacion').value,
            fechaVencimiento: fechaVencimiento,
            items: items,
            subtotal: subtotal,
            iva: iva,
            total: total,
            estatus: document.getElementById('quoteEstatus').value,
            notas: document.getElementById('quoteNotas').value
        };

        if (typeof CSIDatabase !== 'undefined' && CSIDatabase.update) {
            CSIDatabase.update('quotes', quoteId, datosActualizados);
        } else {
            const quotes = this.getQuotes();
            const index = quotes.findIndex(q => q.id === quoteId);
            if (index !== -1) {
                quotes[index] = { ...quotes[index], ...datosActualizados };
                localStorage.setItem('csi_quotes', JSON.stringify(quotes));
            }
        }
        
        this.showMessage('✅ Cotización actualizada correctamente', 'success');
        bootstrap.Modal.getInstance(document.getElementById('quoteModal')).hide();
        this.renderQuoteList();
    },

    viewQuote: function(quoteId) {
        const quote = this.getQuotes().find(q => q.id === quoteId);
        if (!quote) {
            this.showMessage('❌ Cotización no encontrada', 'danger');
            return;
        }

        const client = this.getClientById(quote.clienteId);
        
        const modalHTML = `
            <div class="modal fade" id="viewQuoteModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-eye me-2"></i>Detalles de Cotización: ${quote.codigo}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <strong>Cliente:</strong> ${client ? client.nombre : 'N/A'}<br>
                                    <strong>Tipo:</strong> ${quote.tipo}<br>
                                    <strong>Fecha creación:</strong> ${this.formatDate(quote.fechaCreacion)}
                                </div>
                                <div class="col-md-6">
                                    <strong>Vencimiento:</strong> ${this.formatDate(quote.fechaVencimiento)}<br>
                                    <strong>Estatus:</strong> <span class="badge ${this.getQuoteStatusClass(quote.estatus)}">${this.getQuoteStatusLabel(quote.estatus)}</span><br>
                                    <strong>Usuario:</strong> ${quote.usuario}
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <strong>Descripción:</strong><br>
                                ${quote.descripcion}
                            </div>
                            
                            <div class="table-responsive mb-3">
                                <table class="table table-sm table-bordered">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Descripción</th>
                                            <th width="80">Cant.</th>
                                            <th width="120">Precio Unit.</th>
                                            <th width="120">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${quote.items.map(item => `
                                            <tr>
                                                <td>${item.descripcion}</td>
                                                <td class="text-center">${item.cantidad}</td>
                                                <td class="text-end">$${item.precio.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                                <td class="text-end"><strong>$${item.total.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot class="table-light">
                                        <tr>
                                            <td colspan="3" class="text-end"><strong>Subtotal:</strong></td>
                                            <td class="text-end"><strong>$${quote.subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
                                        </tr>
                                        <tr>
                                            <td colspan="3" class="text-end"><strong>IVA (16%):</strong></td>
                                            <td class="text-end"><strong>$${quote.iva.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
                                        </tr>
                                        <tr>
                                            <td colspan="3" class="text-end"><strong>TOTAL:</strong></td>
                                            <td class="text-end"><strong class="text-danger">$${quote.total.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            
                            ${quote.notas ? `
                                <div class="mb-3">
                                    <strong>Notas y condiciones:</strong><br>
                                    ${quote.notas}
                                </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Cerrar
                            </button>
                            <button type="button" class="btn btn-warning" onclick="CSIQuotes.editQuote(${quote.id})">
                                <i class="fas fa-edit me-2"></i>Editar
                            </button>
                            <button type="button" class="btn btn-success" onclick="CSIQuotes.generatePDF(${quote.id})">
                                <i class="fas fa-file-pdf me-2"></i>Descargar PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.showModal(modalHTML);
    },

    deleteQuote: function(quoteId) {
        const quote = this.getQuotes().find(q => q.id === quoteId);
        if (!quote) {
            this.showMessage('❌ Cotización no encontrada', 'danger');
            return;
        }

        if (confirm(`¿Estás seguro de eliminar la cotización ${quote.codigo}?\n\nEsta acción no se puede deshacer.`)) {
            if (typeof CSIDatabase !== 'undefined' && CSIDatabase.delete) {
                CSIDatabase.delete('quotes', quoteId);
            } else {
                const quotes = this.getQuotes();
                const updatedQuotes = quotes.filter(q => q.id !== quoteId);
                localStorage.setItem('csi_quotes', JSON.stringify(updatedQuotes));
            }
            
            this.showMessage('✅ Cotización eliminada correctamente', 'success');
            this.renderQuoteList();
        }
    },

    // === FUNCIONES DE CLIENTES ===
    getClients: function() {
        console.log('📋 Obteniendo clientes para cotizaciones...');
        
        if (typeof CSIClients !== 'undefined' && typeof CSIClients.getClients === 'function') {
            console.log('✅ Usando CSIClients.getClients()');
            return CSIClients.getClients();
        } else if (typeof CSIDatabase !== 'undefined' && CSIDatabase.getAll) {
            console.log('✅ Usando CSIDatabase para clientes');
            const clients = CSIDatabase.getAll('clients') || [];
            return clients;
        } else {
            console.log('⚠️ Usando clientes de ejemplo');
            return [
                { 
                    id: 1, 
                    codigo: 'CSI-001',
                    nombre: 'Pesquera del Pacífico SA', 
                    contacto: 'Ing. Carlos Rodríguez', 
                    telefono: '33 1234 5678', 
                    email: 'compras@pesquera.com',
                    tipo: 'cliente_final',
                    sector: 'pesquero',
                    estatus: 'activo'
                },
                { 
                    id: 2, 
                    codigo: 'CSI-002',
                    nombre: 'Frío Industrial Monterrey', 
                    contacto: 'Lic. Ana Martínez', 
                    telefono: '81 2345 6789', 
                    email: 'ventas@frioindustrial.com',
                    tipo: 'distribuidor',
                    sector: 'industrial', 
                    estatus: 'activo'
                }
            ];
        }
    },

    getClientById: function(clientId) {
        const clients = this.getClients();
        const client = clients.find(client => client.id === clientId);
        return client;
    },

    // === HELPER FUNCTIONS ===
    getQuoteStatusLabel: function(estatus) {
        const status = {
            'pendiente': 'Pendiente',
            'aprobada': 'Aprobada', 
            'rechazada': 'Rechazada',
            'vencida': 'Vencida'
        };
        return status[estatus] || estatus;
    },

    getQuoteStatusClass: function(estatus) {
        const classes = {
            'pendiente': 'bg-warning',
            'aprobada': 'bg-success',
            'rechazada': 'bg-danger',
            'vencida': 'bg-secondary'
        };
        return classes[estatus] || 'bg-secondary';
    },

    formatDate: function(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    },

    // === EXPORT FUNCTION ===
    exportQuotes: function() {
        let quotes = this.getQuotes();

        if (this.currentFilters.search || this.currentFilters.cliente || this.currentFilters.estatus || 
            this.currentFilters.fechaDesde || this.currentFilters.fechaHasta) {
            quotes = quotes.filter(quote => {
                let matches = true;

                if (this.currentFilters.search) {
                    const term = this.currentFilters.search.toLowerCase();
                    matches = matches && (
                        quote.codigo.toLowerCase().includes(term) ||
                        quote.descripcion.toLowerCase().includes(term)
                    );
                }

                if (this.currentFilters.cliente) {
                    matches = matches && quote.clienteId.toString() === this.currentFilters.cliente;
                }

                if (this.currentFilters.estatus) {
                    matches = matches && quote.estatus === this.currentFilters.estatus;
                }

                if (this.currentFilters.fechaDesde) {
                    matches = matches && quote.fechaCreacion >= this.currentFilters.fechaDesde;
                }

                if (this.currentFilters.fechaHasta) {
                    matches = matches && quote.fechaCreacion <= this.currentFilters.fechaHasta;
                }

                return matches;
            });
        }

        if (!quotes || quotes.length === 0) {
            this.showMessage('❌ No hay cotizaciones para exportar', 'danger');
            return;
        }

        const headers = ['Código', 'Cliente', 'Descripción', 'Fecha Creación', 'Fecha Vencimiento', 'Subtotal', 'IVA', 'Total', 'Estatus', 'Usuario'];
        const rows = quotes.map(q => {
            const client = this.getClientById(q.clienteId);
            return [
                q.codigo || '',
                client ? client.nombre : 'N/A',
                q.descripcion || '',
                q.fechaCreacion || '',
                q.fechaVencimiento || '',
                q.subtotal || 0,
                q.iva || 0,
                q.total || 0,
                this.getQuoteStatusLabel(q.estatus) || '',
                q.usuario || ''
            ];
        });

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
        a.download = 'cotizaciones_filtradas.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('✅ Cotizaciones exportadas correctamente', 'success');
    },

    // === UTILITY FUNCTIONS ===
    showModal: function(content) {
        let modalContainer = document.getElementById('modal-container');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'modal-container';
            document.body.appendChild(modalContainer);
        }
        modalContainer.innerHTML = content;
        
        const modalId = content.includes('id="viewQuoteModal"') ? 'viewQuoteModal' : 'quoteModal';
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
    },

    showMessage: function(message, type) {
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'warning' ? 'alert-warning' : 'alert-danger';
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

window.CSIQuotes = CSIQuotes;