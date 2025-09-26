// assets/js/utils/database.js - Base de datos simple para CSI
const CSIDatabase = {
    // Datos de ejemplo para pruebas
    data: {
        quotes: [
            {
                id: 1,
                codigo: "CSI-COT-001",
                cliente: "Cliente Ejemplo 1",
                proyecto: "Instalación sistema refrigeración",
                monto: 25000,
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 2, 
                codigo: "CSI-COT-002",
                cliente: "Cliente Ejemplo 2",
                proyecto: "Mantenimiento preventivo",
                monto: 8000,
                fechaCreacion: new Date().toISOString()
            }
        ],
        clients: [] // Se llenará desde clients.js
    },

    // Generar ID único
    generateId: function(table) {
        const items = this.data[table] || [];
        return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    },

    // Obtener todos los registros
    getAll: function(table) {
        return this.data[table] || [];
    },

        // Obtener registro por ID
    getById: function(table, id) {
        const items = this.data[table] || [];
        return items.find(item => item.id === id) || null;
    },


    // Insertar nuevo registro
    insert: function(table, item) {
        if (!this.data[table]) this.data[table] = [];
        
        const newItem = {
            id: this.generateId(table),
            ...item,
            fechaCreacion: new Date().toISOString()
        };
        
        this.data[table].push(newItem);
        this.saveToStorage();
        return newItem;
    },

    // Actualizar registro
    update: function(table, id, updates) {
        const items = this.data[table];
        if (!items) return false;
        
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            this.saveToStorage();
            return true;
        }
        return false;
    },

    // Eliminar registro
    delete: function(table, id) {
        const items = this.data[table];
        if (!items) return false;
        
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    },

    // Guardar en localStorage
    saveToStorage: function() {
        try {
            localStorage.setItem('csi_database', JSON.stringify(this.data));
        } catch (e) {
            console.error('Error guardando en localStorage:', e);
        }
    },

    // Cargar desde localStorage
    loadFromStorage: function() {
        try {
            const saved = localStorage.getItem('csi_database');
            if (saved) {
                this.data = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error cargando desde localStorage:', e);
        }
    }
};

// Inicializar cargando datos guardados
CSIDatabase.loadFromStorage();

// Hacer global
window.CSIDatabase = CSIDatabase;