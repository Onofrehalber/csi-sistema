// assets/js/modules/system/config-company.js
// CONFIGURACIÓN COMPLETA DE EMPRESA CSI REFRIGERACIÓN

const CSICompanyConfig = {
    currentData: null,
    currentSection: 'fiscal',

    // Inicializar módulo
    init: function(container = null) {
        console.log('🏢 Módulo de Configuración de Empresa inicializado');
        this.container = container || document.getElementById('csi-module-content');
        this.loadCompanyData();
        this.renderCompanyManagement();
    },

    // Cargar datos de la empresa
    loadCompanyData: function() {
        try {
            const savedData = localStorage.getItem('csi_company');
            this.currentData = savedData ? JSON.parse(savedData) : this.getDefaultData();
        } catch (error) {
            console.error('Error cargando datos empresa:', error);
            this.currentData = this.getDefaultData();
        }
    },

    // Datos por defecto
    getDefaultData: function() {
        return {
            fiscal: {
                razon_social: '',
                razon_comercial: '',
                rfc: '',
                regimen_fiscal: '601 - General de Ley Personas Morales',
                direccion: '',
                colonia: '',
                ciudad: '',
                estado: '',
                cp: '',
                telefono: ''
            },
            contacto: {
                email: '',
                telefono: '',
                sitio_web: '',
                redes_sociales: {
                    facebook: '',
                    linkedin: '',
                    instagram: ''
                }
            },
            branding: {
                color_principal: '#D13438',
                color_secundario: '#0078D4',
                logo_url: '',
                favicon_url: ''
            },
            regional: {
                moneda: 'MXN',
                zona_horaria: 'America/Mexico_City',
                idioma: 'es',
                formato_fecha: 'DD/MM/YYYY'
            }
        };
    },

    // Guardar datos
    saveCompanyData: function() {
        localStorage.setItem('csi_company', JSON.stringify(this.currentData));
        this.applyBranding();
        this.showMessage('Datos de empresa guardados exitosamente', 'success');
    },

    // Aplicar branding al sistema
    applyBranding: function() {
        if (this.currentData.branding.color_principal) {
            document.documentElement.style.setProperty('--csi-red', this.currentData.branding.color_principal);
        }
        if (this.currentData.branding.color_secundario) {
            document.documentElement.style.setProperty('--csi-blue', this.currentData.branding.color_secundario);
        }
        
        // Aplicar favicon si existe
        if (this.currentData.branding.favicon_url) {
            this.updateFavicon(this.currentData.branding.favicon_url);
        }
    },

    // Actualizar favicon
    updateFavicon: function(url) {
        let favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
        favicon.type = 'image/x-icon';
        favicon.rel = 'shortcut icon';
        favicon.href = url;
        document.head.appendChild(favicon);
    },

    // Renderizar gestión de empresa
    renderCompanyManagement: function() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h4><i class="fas fa-building me-2"></i>Información de Empresa</h4>
                            <button class="btn btn-secondary" onclick="CSIConfig.renderConfigDashboard()">
                                <i class="fas fa-arrow-left me-2"></i>Volver
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Navegación por secciones -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body py-3">
                                <nav class="nav nav-pills nav-justified">
                                    <button class="nav-link ${this.currentSection === 'fiscal' ? 'active' : ''}" 
                                            onclick="CSICompanyConfig.showSection('fiscal')">
                                        <i class="fas fa-file-invoice me-2"></i>Datos Fiscales
                                    </button>
                                    <button class="nav-link ${this.currentSection === 'contacto' ? 'active' : ''}" 
                                            onclick="CSICompanyConfig.showSection('contacto')">
                                        <i class="fas fa-address-card me-2"></i>Información Contacto
                                    </button>
                                    <button class="nav-link ${this.currentSection === 'branding' ? 'active' : ''}" 
                                            onclick="CSICompanyConfig.showSection('branding')">
                                        <i class="fas fa-palette me-2"></i>Personalización
                                    </button>
                                    <button class="nav-link ${this.currentSection === 'regional' ? 'active' : ''}" 
                                            onclick="CSICompanyConfig.showSection('regional')">
                                        <i class="fas fa-globe me-2"></i>Configuración Regional
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contenido de la sección -->
                <div class="row">
                    <div class="col-12">
                        ${this.renderCurrentSection()}
                    </div>
                </div>

                <!-- Vista Previa -->
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0"><i class="fas fa-eye me-2"></i>Vista Previa</h5>
                            </div>
                            <div class="card-body">
                                ${this.renderPreview()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Mostrar sección específica
    showSection: function(section) {
        this.currentSection = section;
        this.renderCompanyManagement();
    },

    // Renderizar sección actual
    renderCurrentSection: function() {
        switch(this.currentSection) {
            case 'fiscal':
                return this.renderFiscalSection();
            case 'contacto':
                return this.renderContactoSection();
            case 'branding':
                return this.renderBrandingSection();
            case 'regional':
                return this.renderRegionalSection();
            default:
                return this.renderFiscalSection();
        }
    },

    // Renderizar sección fiscal
    renderFiscalSection: function() {
        const fiscal = this.currentData.fiscal;
        
        return `
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0"><i class="fas fa-file-invoice me-2"></i>Datos Fiscales</h5>
                </div>
                <div class="card-body">
                    <form id="fiscal-form">

                             <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Razón Social *</label>
                                    <input type="text" class="form-control" id="razon-social" 
                                        value="${fiscal.razon_social}" required>
                                    <div class="form-text">Nombre legal completo según acta constitutiva</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Razón Comercial *</label>
                                    <input type="text" class="form-control" id="razon-comercial" 
                                        value="${fiscal.razon_comercial}" required>
                                    <div class="form-text">Nombre comercial para mostrar en documentos</div>
                                </div>
                            </div>
                        </div>



                                            <div class="mb-3">
                        <label class="form-label">Régimen Fiscal *</label>
                        <select class="form-select" id="regimen-fiscal" required>
                            <option value="">Seleccionar régimen...</option>
                            
                            <!-- PERSONAS FÍSICAS -->
                            <optgroup label="Personas Físicas">
                                <option value="601 - General de Ley Personas Morales" ${fiscal.regimen_fiscal === '601 - General de Ley Personas Morales' ? 'selected' : ''}>601 - General de Ley Personas Morales</option>
                                <option value="603 - Personas Morales con Fines no Lucrativos" ${fiscal.regimen_fiscal === '603 - Personas Morales con Fines no Lucrativos' ? 'selected' : ''}>603 - Personas Morales con Fines no Lucrativos</option>
                                <option value="605 - Sueldos y Salarios e Ingresos Asimilados a Salarios" ${fiscal.regimen_fiscal === '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios' ? 'selected' : ''}>605 - Sueldos y Salarios</option>
                                <option value="606 - Arrendamiento" ${fiscal.regimen_fiscal === '606 - Arrendamiento' ? 'selected' : ''}>606 - Arrendamiento</option>
                                <option value="607 - Régimen de Enajenación o Adquisición de Bienes" ${fiscal.regimen_fiscal === '607 - Régimen de Enajenación o Adquisición de Bienes' ? 'selected' : ''}>607 - Enajenación/Adquisición de Bienes</option>
                                <option value="608 - Demás Ingresos" ${fiscal.regimen_fiscal === '608 - Demás Ingresos' ? 'selected' : ''}>608 - Demás Ingresos</option>
                                <option value="610 - Residentes en el Extranjero sin Establecimiento Permanente" ${fiscal.regimen_fiscal === '610 - Residentes en el Extranjero sin Establecimiento Permanente' ? 'selected' : ''}>610 - Residentes en Extranjero</option>
                                <option value="611 - Ingresos por Dividendos" ${fiscal.regimen_fiscal === '611 - Ingresos por Dividendos' ? 'selected' : ''}>611 - Ingresos por Dividendos</option>
                                <option value="612 - Personas Físicas con Actividades Empresariales" ${fiscal.regimen_fiscal === '612 - Personas Físicas con Actividades Empresariales y Profesionales' ? 'selected' : ''}>612 - Personas Físicas con Actividades Empresariales</option>
                                <option value="614 - Ingresos por Intereses" ${fiscal.regimen_fiscal === '614 - Ingresos por Intereses' ? 'selected' : ''}>614 - Ingresos por Intereses</option>
                                <option value="615 - Régimen de los Ingresos por Obtención de Premios" ${fiscal.regimen_fiscal === '615 - Régimen de los Ingresos por Obtención de Premios' ? 'selected' : ''}>615 - Ingresos por Premios</option>
                                <option value="616 - Sin Obligaciones Fiscales" ${fiscal.regimen_fiscal === '616 - Sin Obligaciones Fiscales' ? 'selected' : ''}>616 - Sin Obligaciones Fiscales</option>
                                <option value="620 - Sociedades Cooperativas de Producción" ${fiscal.regimen_fiscal === '620 - Sociedades Cooperativas de Producción' ? 'selected' : ''}>620 - Sociedades Cooperativas</option>
                                <option value="621 - Incorporación Fiscal" ${fiscal.regimen_fiscal === '621 - Incorporación Fiscal' ? 'selected' : ''}>621 - Incorporación Fiscal</option>
                                <option value="622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" ${fiscal.regimen_fiscal === '622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' ? 'selected' : ''}>622 - Actividades Agropecuarias</option>
                                <option value="623 - Opcional para Grupos de Sociedades" ${fiscal.regimen_fiscal === '623 - Opcional para Grupos de Sociedades' ? 'selected' : ''}>623 - Grupos de Sociedades</option>
                                <option value="624 - Coordinados" ${fiscal.regimen_fiscal === '624 - Coordinados' ? 'selected' : ''}>624 - Coordinados</option>
                                <option value="625 - Régimen de las Actividades Empresariales con Ingresos a través de Plataformas Tecnológicas" ${fiscal.regimen_fiscal === '625 - Régimen de las Actividades Empresariales con Ingresos a través de Plataformas Tecnológicas' ? 'selected' : ''}>625 - Plataformas Tecnológicas</option>
                                <option value="626 - Régimen Simplificado de Confianza" ${fiscal.regimen_fiscal === '626 - Régimen Simplificado de Confianza' ? 'selected' : ''}>626 - Régimen Simplificado de Confianza</option>
                            </optgroup>
                            
                            <!-- PERSONAS MORALES -->
                            <optgroup label="Personas Morales">
                                <option value="601 - General de Ley Personas Morales" ${fiscal.regimen_fiscal === '601 - General de Ley Personas Morales' ? 'selected' : ''}>601 - General de Ley Personas Morales</option>
                                <option value="603 - Personas Morales con Fines no Lucrativos" ${fiscal.regimen_fiscal === '603 - Personas Morales con Fines no Lucrativos' ? 'selected' : ''}>603 - Personas Morales con Fines no Lucrativos</option>
                                <option value="629 - De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales" ${fiscal.regimen_fiscal === '629 - De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales' ? 'selected' : ''}>629 - Empresas Multinacionales</option>
                                <option value="630 - Enajenación de Acciones en Bolsa de Valores" ${fiscal.regimen_fiscal === '630 - Enajenación de Acciones en Bolsa de Valores' ? 'selected' : ''}>630 - Enajenación de Acciones en Bolsa</option>
                            </optgroup>
                        </select>
                    </div>

                        <div class="row">
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label class="form-label">Dirección *</label>
                                    <input type="text" class="form-control" id="direccion" 
                                           value="${fiscal.direccion}" required>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Colonia</label>
                                    <input type="text" class="form-control" id="colonia" 
                                           value="${fiscal.colonia}">
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Ciudad *</label>
                                    <input type="text" class="form-control" id="ciudad" 
                                           value="${fiscal.ciudad}" required>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Estado *</label>
                                    <input type="text" class="form-control" id="estado" 
                                           value="${fiscal.estado}" required>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Código Postal *</label>
                                    <input type="text" class="form-control" id="cp" 
                                           value="${fiscal.cp}" pattern="[0-9]{5}" required>
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Teléfono</label>
                            <input type="tel" class="form-control" id="telefono" 
                                   value="${fiscal.telefono}">
                        </div>

                        <div class="d-flex justify-content-between">
                            <button type="button" class="btn btn-secondary" onclick="CSICompanyConfig.showSection('contacto')">
                                Siguiente: Contacto <i class="fas fa-arrow-right ms-2"></i>
                            </button>
                            <button type="button" class="btn btn-primary" onclick="CSICompanyConfig.saveFiscalData()">
                                <i class="fas fa-save me-2"></i>Guardar Datos Fiscales
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    // Renderizar sección de contacto
    renderContactoSection: function() {
        const contacto = this.currentData.contacto;
        
        return `
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0"><i class="fas fa-address-card me-2"></i>Información de Contacto</h5>
                </div>
                <div class="card-body">
                    <form id="contacto-form">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Email Corporativo</label>
                                    <input type="email" class="form-control" id="email" 
                                           value="${contacto.email}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Teléfono de Contacto</label>
                                    <input type="tel" class="form-control" id="telefono-contacto" 
                                           value="${contacto.telefono}">
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Sitio Web</label>
                            <input type="url" class="form-control" id="sitio-web" 
                                   value="${contacto.sitio_web}" placeholder="https://...">
                        </div>

                        <h6 class="mt-4 mb-3">Redes Sociales</h6>
                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Facebook</label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fab fa-facebook text-primary"></i></span>
                                        <input type="url" class="form-control" id="facebook" 
                                               value="${contacto.redes_sociales.facebook}" placeholder="https://facebook.com/...">
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">LinkedIn</label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fab fa-linkedin text-info"></i></span>
                                        <input type="url" class="form-control" id="linkedin" 
                                               value="${contacto.redes_sociales.linkedin}" placeholder="https://linkedin.com/...">
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Instagram</label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fab fa-instagram text-danger"></i></span>
                                        <input type="url" class="form-control" id="instagram" 
                                               value="${contacto.redes_sociales.instagram}" placeholder="https://instagram.com/...">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between">
                            <button type="button" class="btn btn-secondary" onclick="CSICompanyConfig.showSection('fiscal')">
                                <i class="fas fa-arrow-left me-2"></i>Anterior: Fiscal
                            </button>
                            <div>
                                <button type="button" class="btn btn-outline-primary me-2" onclick="CSICompanyConfig.showSection('branding')">
                                    Siguiente: Personalización <i class="fas fa-arrow-right ms-2"></i>
                                </button>
                                <button type="button" class="btn btn-primary" onclick="CSICompanyConfig.saveContactoData()">
                                    <i class="fas fa-save me-2"></i>Guardar Contacto
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    // Renderizar sección de branding
    renderBrandingSection: function() {
        const branding = this.currentData.branding;
        
        return `
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0"><i class="fas fa-palette me-2"></i>Personalización y Branding</h5>
                </div>
                <div class="card-body">
                    <form id="branding-form">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Color Principal</label>
                                    <div class="input-group">
                                        <input type="color" class="form-control form-control-color" id="color-principal" 
                                               value="${branding.color_principal}" title="Elige el color principal">
                                        <input type="text" class="form-control" id="color-principal-hex" 
                                               value="${branding.color_principal}" readonly>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Color Secundario</label>
                                    <div class="input-group">
                                        <input type="color" class="form-control form-control-color" id="color-secundario" 
                                               value="${branding.color_secundario}" title="Elige el color secundario">
                                        <input type="text" class="form-control" id="color-secundario-hex" 
                                               value="${branding.color_secundario}" readonly>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">URL del Logo</label>
                                    <input type="url" class="form-control" id="logo-url" 
                                           value="${branding.logo_url}" placeholder="https://.../logo.png">
                                    <div class="form-text">Recomendado: 200x60 px formato PNG</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">URL del Favicon</label>
                                    <input type="url" class="form-control" id="favicon-url" 
                                           value="${branding.favicon_url}" placeholder="https://.../favicon.ico">
                                    <div class="form-text">Recomendado: 32x32 px formato ICO</div>
                                </div>
                            </div>
                        </div>

                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Los cambios de colores se aplicarán inmediatamente al sistema.
                        </div>

                        <div class="d-flex justify-content-between">
                            <button type="button" class="btn btn-secondary" onclick="CSICompanyConfig.showSection('contacto')">
                                <i class="fas fa-arrow-left me-2"></i>Anterior: Contacto
                            </button>
                            <div>
                                <button type="button" class="btn btn-outline-primary me-2" onclick="CSICompanyConfig.showSection('regional')">
                                    Siguiente: Regional <i class="fas fa-arrow-right ms-2"></i>
                                </button>
                                <button type="button" class="btn btn-primary" onclick="CSICompanyConfig.saveBrandingData()">
                                    <i class="fas fa-save me-2"></i>Aplicar Branding
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    // Renderizar sección regional
    renderRegionalSection: function() {
        const regional = this.currentData.regional;
        
        return `
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0"><i class="fas fa-globe me-2"></i>Configuración Regional</h5>
                </div>
                <div class="card-body">
                    <form id="regional-form">
                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Moneda</label>
                                    <select class="form-select" id="moneda">
                                        <option value="MXN" ${regional.moneda === 'MXN' ? 'selected' : ''}>MXN - Peso Mexicano</option>
                                        <option value="USD" ${regional.moneda === 'USD' ? 'selected' : ''}>USD - Dólar Americano</option>
                                        <option value="EUR" ${regional.moneda === 'EUR' ? 'selected' : ''}>EUR - Euro</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Zona Horaria</label>
                                    <select class="form-select" id="zona-horaria">
                                        <option value="America/Mexico_City" ${regional.zona_horaria === 'America/Mexico_City' ? 'selected' : ''}>Ciudad de México</option>
                                        <option value="America/New_York" ${regional.zona_horaria === 'America/New_York' ? 'selected' : ''}>Nueva York</option>
                                        <option value="Europe/Madrid" ${regional.zona_horaria === 'Europe/Madrid' ? 'selected' : ''}>Madrid</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Idioma</label>
                                    <select class="form-select" id="idioma">
                                        <option value="es" ${regional.idioma === 'es' ? 'selected' : ''}>Español</option>
                                        <option value="en" ${regional.idioma === 'en' ? 'selected' : ''}>English</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Formato de Fecha</label>
                            <select class="form-select" id="formato-fecha">
                                <option value="DD/MM/YYYY" ${regional.formato_fecha === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY (24/09/2025)</option>
                                <option value="MM/DD/YYYY" ${regional.formato_fecha === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY (09/24/2025)</option>
                                <option value="YYYY-MM-DD" ${regional.formato_fecha === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD (2025-09-24)</option>
                            </select>
                        </div>

                        <div class="d-flex justify-content-between">
                            <button type="button" class="btn btn-secondary" onclick="CSICompanyConfig.showSection('branding')">
                                <i class="fas fa-arrow-left me-2"></i>Anterior: Personalización
                            </button>
                            <button type="button" class="btn btn-primary" onclick="CSICompanyConfig.saveRegionalData()">
                                <i class="fas fa-save me-2"></i>Guardar Configuración
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    // Renderizar vista previa
    renderPreview: function() {
    const fiscal = this.currentData.fiscal;
    
    return `
        <div class="row">
            <div class="col-md-6">
                <h6>Datos Fiscales:</h6>
                <p><strong>Razón Social:</strong> ${fiscal.razon_social || 'No configurado'}</p>
                <p><strong>Razón Comercial:</strong> ${fiscal.razon_comercial || 'No configurado'}</p>
                <p><strong>RFC:</strong> ${fiscal.rfc || 'No configurado'}</p>
                <p><strong>Dirección:</strong> ${fiscal.direccion || 'No configurado'}</p>
            </div>
            <div class="col-md-6">
                <h6>Branding:</h6>
                <div class="d-flex align-items-center">
                    <div class="color-preview me-3" style="background-color: ${this.currentData.branding.color_principal}; width: 30px; height: 30px; border-radius: 4px;"></div>
                    <span>Color Principal: ${this.currentData.branding.color_principal}</span>
                </div>
                <div class="d-flex align-items-center mt-2">
                    <div class="color-preview me-3" style="background-color: ${this.currentData.branding.color_secundario}; width: 30px; height: 30px; border-radius: 4px;"></div>
                    <span>Color Secundario: ${this.currentData.branding.color_secundario}</span>
                </div>
            </div>
        </div>
    `;
},

    // Funciones de guardado
    saveFiscalData: function() {
    this.currentData.fiscal = {
        razon_social: document.getElementById('razon-social').value,
        razon_comercial: document.getElementById('razon-comercial').value,
        rfc: document.getElementById('rfc').value.toUpperCase(),
        regimen_fiscal: document.getElementById('regimen-fiscal').value,
        direccion: document.getElementById('direccion').value,
        colonia: document.getElementById('colonia').value,
        ciudad: document.getElementById('ciudad').value,
        estado: document.getElementById('estado').value,
        cp: document.getElementById('cp').value,
        telefono: document.getElementById('telefono').value
    };
    this.saveCompanyData();
},

    saveContactoData: function() {
        this.currentData.contacto = {
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono-contacto').value,
            sitio_web: document.getElementById('sitio-web').value,
            redes_sociales: {
                facebook: document.getElementById('facebook').value,
                linkedin: document.getElementById('linkedin').value,
                instagram: document.getElementById('instagram').value
            }
        };
        this.saveCompanyData();
    },

    saveBrandingData: function() {
        this.currentData.branding = {
            color_principal: document.getElementById('color-principal').value,
            color_secundario: document.getElementById('color-secundario').value,
            logo_url: document.getElementById('logo-url').value,
            favicon_url: document.getElementById('favicon-url').value
        };
        this.saveCompanyData();
    },

    saveRegionalData: function() {
        this.currentData.regional = {
            moneda: document.getElementById('moneda').value,
            zona_horaria: document.getElementById('zona-horaria').value,
            idioma: document.getElementById('idioma').value,
            formato_fecha: document.getElementById('formato-fecha').value
        };
        this.saveCompanyData();
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
window.CSICompanyConfig = CSICompanyConfig;