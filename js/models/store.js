// POO

function createStore(initialState = []) {
    // Cargar datos existentes o usar estado inicial
    let state = loadFromLocalStorage() ?? initialState;
    const listeners = [];
    let lastSaveTime = null;
    let lastDeletedTemplate = null;

    function validateTemplateData(data) {
        const requiredFields = ['id', 'title', 'message', 'hashtag', 'category', 'createdAt'];
        
        // Verificar estructura básica
        if (!data || typeof data !== 'object') return false;
        
        // Verificar campos requeridos
        for (const field of requiredFields) {
            if (!(field in data)) return false;
        }
        
        // Validar tipos de datos
        if (typeof data.id !== 'string' || !data.id) return false;
        if (typeof data.title !== 'string' || !data.title) return false;
        if (typeof data.message !== 'string' || !data.message) return false;
        if (typeof data.hashtag !== 'string' || !data.hashtag) return false;
        if (typeof data.category !== 'string') return false;
        if (!Date.parse(data.createdAt)) return false;

        return true;
    }

    function loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('whatsapp-templates');
            if (!stored) return null;

            const parsed = JSON.parse(stored);
            
            // Validar que sea un array
            if (!Array.isArray(parsed)) {
                throw new Error('Datos almacenados no válidos: se esperaba un array');
            }

            // Filtrar y validar cada plantilla
            const validTemplates = parsed
                .filter(data => validateTemplateData(data))
                .map(data => Template.fromJSON(data));

            // Notificar si se encontraron datos inválidos
            if (validTemplates.length < parsed.length) {
                notifications.error('Algunas plantillas fueron omitidas por datos inválidos');
            }

            return validTemplates;
        } catch (error) {
            console.error('Error al cargar plantillas:', error);
            notifications.error('Error al cargar las plantillas guardadas');
            return null;
        }
    }

    function saveToLocalStorage() {
        try {
            const serialized = JSON.stringify(state.map(template => template.toJSON()));
            localStorage.setItem('whatsapp-templates', serialized);
            lastSaveTime = new Date();
            updateSaveIndicator();
            return true;
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            notifications?.error('Error al guardar los cambios');
            return false;
        }
    }

    function updateSaveIndicator() {
        const indicator = document.getElementById('save-indicator');
        if (indicator) {
            indicator.textContent = `Último guardado: ${lastSaveTime.toLocaleTimeString()}`;
            indicator.className = 'text-green-600 animate-pulse';
            setTimeout(() => {
                indicator.className = 'text-gray-600';
            }, 1000);
        }
    }

    function getState() {
        return [...state];
    }

    function addTemplate(template) {
        state = [...state, template];
        if (saveToLocalStorage()) {
            notifyListeners();
            notifications?.success('Plantilla guardada automáticamente');
            return true;
        }
        return false;
    }

    function removeTemplate(templateId) {
        const templateToRemove = state.find(t => t.id === templateId);
        if (templateToRemove) {
            lastDeletedTemplate = templateToRemove;
            state = state.filter(t => t.id !== templateId);
            if (saveToLocalStorage()) {
                notifyListeners();
                notifications?.success('Plantilla eliminada y cambios guardados');
                return true;
            }
        }
        return false;
    }

    function undoDelete() {
        if (lastDeletedTemplate) {
            state = [...state, lastDeletedTemplate];
            const restored = lastDeletedTemplate;
            lastDeletedTemplate = null;
            saveToLocalStorage();
            notifyListeners();
            return restored;
        }
        return null;
    }

    function updateTemplate(templateId, updates) {
        try {
            state = state.map(template => 
                template.id === templateId 
                    ? { ...template, ...updates, updatedAt: new Date() }
                    : template
            );
            
            if (saveToLocalStorage()) {
                notifyListeners();
                notifications?.success('Cambios guardados automáticamente');
                return true;
            }
            throw new Error('Error al guardar los cambios');
        } catch (error) {
            console.error('Error al actualizar plantilla:', error);
            notifications?.error('Error al guardar los cambios');
            return false;
        }
    }

    function resetTemplates() {
        try {
            state = [];
            localStorage.removeItem('whatsapp-templates');
            notifyListeners();
            return true;
        } catch (error) {
            console.error('Error al resetear plantillas:', error);
            return false;
        }
    }

    function suscribe(listener) {
        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) listeners.splice(index, 1);
        };
    }

    function notifyListeners() {
        listeners.forEach(listener => listener(getState()));
    }

    // Cargar datos inmediatamente al crear el store
    const initialLoad = loadFromLocalStorage();
    if (initialLoad) {
        state = initialLoad;
        notifyListeners();
    }

    return {
        getState,
        addTemplate,
        removeTemplate,
        updateTemplate,
        resetTemplates,
        suscribe,
        loadFromLocalStorage,
        saveToLocalStorage,
        undoDelete,
        getLastSaveTime: () => lastSaveTime,
        hasUndoableAction: () => !!lastDeletedTemplate
    };
}

// Crear y exportar la instancia global del store
const templatesStore = createStore([]);
window.templatesStore = templatesStore;