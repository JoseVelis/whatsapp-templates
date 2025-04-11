// Move all DOM-dependent code inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize elements
    const templatesContainer = document.querySelector("#templates-container");
    const btnNewTemplate = document.querySelector("#new-template");
    const modal = document.getElementById('template-modal');
    const form = document.getElementById('template-form');
    const btnCancel = document.getElementById('cancel-template');
    const undoButton = document.getElementById('undo-delete');
    const resetButton = document.getElementById('reset-templates');
    const searchInput = document.getElementById('search-templates');
    const templatesCount = document.getElementById('templates-count');

    // Verify required elements exist
    if (!templatesContainer || !modal || !form) {
        console.error('Required DOM elements not found');
        return;
    }

    // Initial render
    renderTemplates();

    // Event Listeners
    if (btnNewTemplate) {
        btnNewTemplate.addEventListener('click', () => {
            modal.classList.remove('hidden');
            form.reset();
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas eliminar todas las plantillas? Esta acción no se puede deshacer.')) {
                if (templatesStore.resetTemplates()) {
                    notifications.success('Todas las plantillas han sido eliminadas');
                } else {
                    notifications.error('Error al eliminar las plantillas');
                }
            }
        });
    }

    // Modal form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const template = new Template(
            formData.get('title'),
            formData.get('message'),
            formData.get('hashtag'),
            formData.get('category') || 'general'
        );

        if (template.saveTemplate()) {
            modal.classList.add('hidden');
            form.reset();
            notifications.success('Plantilla creada correctamente');
        } else {
            notifications.error('Error al crear la plantilla');
        }
    });

    // Modal outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Undo functionality
    if (undoButton) {
        undoButton.addEventListener('click', () => {
            const restored = templatesStore.undoDelete();
            if (restored) {
                notifications.success(`Plantilla "${restored.title}" recuperada`);
                updateUndoButton();
            } else {
                notifications.error('No hay plantilla para recuperar');
            }
        });
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const templates = templatesStore.getState();
            
            const filteredTemplates = templates.filter(template => 
                template.title.toLowerCase().includes(searchTerm) ||
                template.message.toLowerCase().includes(searchTerm) ||
                template.hashtag.toLowerCase().includes(searchTerm)
            );

            renderTemplates(filteredTemplates);
        });
    }

    // Subscribe to store changes
    templatesStore.suscribe(renderTemplates);
    templatesStore.suscribe(updateUndoButton);
});

// Keep helper functions outside DOMContentLoaded
function updateUndoButton() {
    const undoButton = document.getElementById('undo-delete');
    if (undoButton) {
        if (templatesStore.hasUndoableAction()) {
            undoButton.classList.remove('hidden');
        } else {
            undoButton.classList.add('hidden');
        }
    }
}

function updateTemplatesCount(count) {
    const templatesCount = document.getElementById('templates-count');
    if (templatesCount) {
        templatesCount.textContent = `${count} plantilla${count !== 1 ? 's' : ''}`;
        templatesCount.className = count > 0 
            ? 'px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'
            : 'px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium';
    }
}

function renderTemplates(templates = templatesStore.getState()) {
    const container = document.getElementById('templates-container');
    
    container.innerHTML = '';
    
    if (templates.length === 0) {
        container.innerHTML = `
            <li class="col-span-full py-8 text-center text-gray-500">
                <p class="text-lg">No hay plantillas disponibles</p>
                <p class="text-sm mt-2">Haz clic en "Agregar template" para crear una nueva plantilla</p>
            </li>
        `;
        updateTemplatesCount(templates.length);
        return;
    }

    templates.forEach(template => {
        const templateElement = template.render();
        // Añadir animación de entrada
        templateElement.classList.add('animate-fade-in');
        container.appendChild(templateElement);
    });

    // Mostrar contador de plantillas
    const count = templates.length;
    const counterElement = document.createElement('div');
    counterElement.className = 'text-sm text-gray-500 mt-4';
    counterElement.textContent = `${count} plantilla${count !== 1 ? 's' : ''} disponible${count !== 1 ? 's' : ''}`;
    container.parentElement.appendChild(counterElement);

    updateTemplatesCount(templates.length);
}