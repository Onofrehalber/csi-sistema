// ===== MÓDULO DE GESTIÓN DE COTIZACIONES - CSI REFRIGERACIÓN =====
const CSIQuotes = {
    currentFilters: {
        search: '',
        cliente: '',
        estatus: '',
        fechaDesde: '',
        fechaHasta: ''
    },

    // === FUNCIONES BÁSICAS ===
    getQuotes: function() {
        console.log('📋 Obteniendo cotizaciones...');
        
        if (typeof CSIDatabase !== 'undefined' && CSIDatabase.getAll) {
            const quotes = CSIDatabase.getAll('quotes') || [];
            console.log('Cotizaciones en DB:', quotes);
            return quotes;
        } else {
            // Si no hay base de datos, usar localStorage
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

    // === GENERACIÓN DE CÓDIGO CORREGIDA ===
    generateQuoteCode: function() {
        const user = JSON.parse(localStorage.getItem('csi_currentUser')) || { name: 'OQ', id: 'OQ' };
        const today = new Date();
        const dateStr = today.getDate().toString().padStart(2, '0') + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getFullYear().toString().slice(-2);
        
        // Obtener iniciales del usuario
        const nameParts = user.name ? user.name.split(' ') : ['O', 'Q'];
        const initials = (nameParts[0].charAt(0) + (nameParts[1] ? nameParts[1].charAt(0) : 'Q')).toUpperCase();
        
        // Contar cotizaciones del usuario hoy
        const quotes = this.getQuotes();
        const userQuotesToday = quotes.filter(quote => {
            const quoteDate = new Date(quote.fechaCreacion);
            return quote.usuario === user.id && 
                   quoteDate.toDateString() === today.toDateString();
        });
        
        const consecutive = userQuotesToday.length + 1;
        
        return `CSI-COT-${initials}${dateStr}-${consecutive}`;
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
        
        // Agregar event listeners para cálculos automáticos
        this.setupItemEvents(newIndex);
        this.calculateTotals();
    },

    removeQuoteItem: function(index) {
        const item = document.querySelector(`.quote-item[data-index="${index}"]`);
        if (item && index > 0) { // No permitir eliminar el primer item
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
        
        // Actualizar totales en la interfaz
        const subtotalElement = document.getElementById('quoteSubtotal');
        const ivaElement = document.getElementById('quoteIva');
        const totalElement = document.getElementById('quoteTotal');
        
        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        if (ivaElement) ivaElement.textContent = `$${iva.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    },

    // === COLECCIÓN DE ITEMS DEL FORMULARIO ===
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

    getClients: function() {
        if (typeof CSIClients !== 'undefined') {
            console.log('📋 Obteniendo clientes desde CSIClients...');
            const clients = CSIClients.getClients();
            console.log('Clientes encontrados:', clients);
            return clients;
        } else if (typeof CSIDatabase !== 'undefined' && CSIDatabase.getAll) {
            console.log('📋 Obteniendo clientes desde CSIDatabase...');
            const clients = CSIDatabase.getAll('clients') || [];
            console.log('Clientes en DB:', clients);
            return clients;
        } else {
            console.log('📋 Usando clientes de ejemplo...');
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
    },

    // === FORMULARIO DE COTIZACIÓN MEJORADO ===
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
                                
                                <!-- Información General -->
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
                                            <select class="form-select" id="quoteTipo" required>
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

                                <!-- Descripción -->
                                <div class="mb-3">
                                    <label class="form-label"><i class="fas fa-file-alt me-2"></i>Descripción del Trabajo *</label>
                                    <textarea class="form-control" id="quoteDescripcion" rows="3" required placeholder="Describa detalladamente el trabajo a realizar...">${isEdit ? quote.descripcion : ''}</textarea>
                                </div>
                                
                                <!-- Fechas y Estatus -->
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
                                
                                <!-- Items de la cotización -->
                                <div class="mb-4">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5><i class="fas fa-list me-2"></i>Items de la Cotización</h5>
                                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="CSIQuotes.addQuoteItem()">
                                            <i class="fas fa-plus me-1"></i>Agregar Item
                                        </button>
                                    </div>
                                    <div id="quoteItemsContainer">
                                        ${isEdit ? this.renderQuoteItems(quote.items) : this.renderEmptyQuoteItem()}
                                    </div>
                                </div>
                                
                                <!-- Totales -->
                                <div class="row mb-4">
                                    <div class="col-md-4 offset-md-8">
                                        <div class="border p-3 bg-light rounded">
                                            <div class="d-flex justify-content-between mb-2">
                                                <span>Subtotal:</span>
                                                <span id="quoteSubtotal">$${isEdit ? (quote.subtotal || 0).toFixed(2) : '0.00'}</span>
                                            </div>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span>IVA (16%):</span>
                                                <span id="quoteIva">$${isEdit ? (quote.iva || 0).toFixed(2) : '0.00'}</span>
                                            </div>
                                            <div class="d-flex justify-content-between fw-bold fs-5">
                                                <span>Total:</span>
                                                <span id="quoteTotal">$${isEdit ? (quote.total || 0).toFixed(2) : '0.00'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Notas y Condiciones -->
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
        
        // Configurar eventos para cálculos automáticos
        setTimeout(() => {
            this.setupAllItemEvents();
            this.calculateTotals();
        }, 100);
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

    setupAllItemEvents: function() {
        const items = document.querySelectorAll('.quote-item');
        items.forEach((item, index) => {
            this.setupItemEvents(index);
        });
    },

    // === GUARDADO CORREGIDO ===
    saveQuote: function() {
        console.log('💾 Guardando nueva cotización...');
        
        // Validaciones
        const clienteId = document.getElementById('quoteClienteId').value;
        const tipo = document.getElementById('quoteTipo').value;
        const descripcion = document.getElementById('quoteDescripcion').value;
        const fechaVencimiento = document.getElementById('quoteFechaVencimiento').value;
        
        if (!clienteId || !tipo || !descripcion || !fechaVencimiento) {
            this.showMessage('❌ Complete todos los campos obligatorios', 'danger');
            return;
        }

        // Recolectar items
        const items = this.collectQuoteItems();
        if (items.length === 0) {
            this.showMessage('❌ Debe agregar al menos un item', 'danger');
            return;
        }

        // Calcular totales reales
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const iva = subtotal * 0.16;
        const total = subtotal + iva;

        // Obtener usuario actual
        const user = JSON.parse(localStorage.getItem('csi_currentUser')) || { id: 'OQ', name: 'Onofre Quispe' };

        // Crear cotización con datos reales
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

        console.log('Cotización a guardar:', nuevaCotizacion);

        // Guardar en base de datos o localStorage
        if (typeof CSIDatabase !== 'undefined' && CSIDatabase.insert) {
            CSIDatabase.insert('quotes', nuevaCotizacion);
        } else {
            // Guardar en localStorage como respaldo
            const quotes = this.getQuotes();
            quotes.push(nuevaCotizacion);
            localStorage.setItem('csi_quotes', JSON.stringify(quotes));
        }
        
        this.showMessage('✅ Cotización guardada correctamente', 'success');
        bootstrap.Modal.getInstance(document.getElementById('quoteModal')).hide();
        this.renderQuoteList();
    },

    updateQuote: function() {
        console.log('✏️ Actualizando cotización...');
        const quoteId = parseInt(document.getElementById('editQuoteId').value);
        
        // Validaciones
        const clienteId = document.getElementById('quoteClienteId').value;
        const tipo = document.getElementById('quoteTipo').value;
        const descripcion = document.getElementById('quoteDescripcion').value;
        const fechaVencimiento = document.getElementById('quoteFechaVencimiento').value;
        
        if (!clienteId || !tipo || !descripcion || !fechaVencimiento) {
            this.showMessage('❌ Complete todos los campos obligatorios', 'danger');
            return;
        }

        // Recolectar items
        const items = this.collectQuoteItems();
        if (items.length === 0) {
            this.showMessage('❌ Debe tener al menos un item', 'danger');
            return;
        }

        // Calcular totales reales
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

        // Actualizar en base de datos o localStorage
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

    // ... (el resto de las funciones se mantienen igual: viewQuote, deleteQuote, generatePDF, etc.)

    // === FILTROS Y BÚSQUEDA ===
    setupEventListeners: function() {
        console.log('🎯 Configurando event listeners de cotizaciones...');
        
        // Búsqueda con botón
        const searchButton = document.getElementById('quote-search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const searchInput = document.getElementById('quote-search');
                this.currentFilters.search = searchInput.value;
                this.applyFilters();
            });
        }
        
        // Búsqueda con ENTER
        const searchInput = document.getElementById('quote-search');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.currentFilters.search = e.target.value;
                    this.applyFilters();
                }
            });
        }

        // Filtro por cliente
        const filterClient = document.getElementById('quote-filter-client');
        if (filterClient) {
            filterClient.addEventListener('change', (e) => {
                this.currentFilters.cliente = e.target.value;
                this.applyFilters();
            });
        }
        
        // Filtro por estatus
        const filterStatus = document.getElementById('quote-filter-status');
        if (filterStatus) {
            filterStatus.addEventListener('change', (e) => {
                this.currentFilters.estatus = e.target.value;
                this.applyFilters();
            });
        }
        
        // Filtro por fecha desde
        const filterFechaDesde = document.getElementById('quote-filter-fecha-desde');
        if (filterFechaDesde) {
            filterFechaDesde.addEventListener('change', (e) => {
                this.currentFilters.fechaDesde = e.target.value;
                this.applyFilters();
            });
        }
        
        // Filtro por fecha hasta
        const filterFechaHasta = document.getElementById('quote-filter-fecha-hasta');
        if (filterFechaHasta) {
            filterFechaHasta.addEventListener('change', (e) => {
                this.currentFilters.fechaHasta = e.target.value;
                this.applyFilters();
            });
        }
    },

    applyFilters: function() {
        console.log('🔍 Aplicando filtros...', this.currentFilters);
        let filteredQuotes = this.getQuotes();
        
        // Aplicar filtros...
        // (mantener la lógica de filtrado existente)
        
        this.renderQuoteList(filteredQuotes);
    },

    // === FUNCIONES CRUD (mantener igual) ===
    viewQuote: function(quoteId) {
        // Mantener la función viewQuote existente
        const quote = this.getQuotes().find(q => q.id === quoteId);
        if (quote) {
            // ... código de viewQuote
        }
    },

    deleteQuote: function(quoteId) {
        // Mantener la función deleteQuote existente
        const quote = this.getQuotes().find(q => q.id === quoteId);
        if (quote && confirm(`¿Estás seguro de eliminar la cotización ${quote.codigo}?`)) {
            // ... código de deleteQuote
        }
    },

    generatePDF: function(quoteId) {
        // Mantener la función generatePDF existente
        const quote = this.getQuotes().find(q => q.id === quoteId);
        if (quote) {
            // ... código de generatePDF
        }
    },

    showModal: function(content) {
        let modalContainer = document.getElementById('modal-container');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'modal-container';
            document.body.appendChild(modalContainer);
        }
        modalContainer.innerHTML = content;
        
        const modal = new bootstrap.Modal(modalContainer.querySelector('.modal'));
        modal.show();
    },

    // === INICIALIZACIÓN ===
    init: function() {
        console.log('💰 Módulo de Cotizaciones inicializado');
        this.renderQuoteList();
        this.setupEventListeners();
    },

    renderQuoteList: function(filteredQuotes = null) {
        // Mantener la función renderQuoteList existente
        // (solo se corrigieron los problemas de cálculos y items)
        console.log('📋 Renderizando lista de cotizaciones...');
        const container = document.getElementById('crm-quotes-content');
        if (!container) return;

        const quotes = this.getQuotes();
        const quotesToRender = filteredQuotes || quotes;
        const stats = this.getQuoteStats();
        const clients = this.getClients();

        // ... código de renderQuoteList (mantener igual)
    }
};

window.CSIQuotes = CSIQuotes;