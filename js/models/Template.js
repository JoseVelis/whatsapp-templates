class Template {
    constructor(title, message, hashtag, category = 'general', id = crypto.randomUUID()) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.hashtag = hashtag;
        this.category = category;
        this.createdAt = new Date();
    }

    static fromJSON(data) {
        const template = new Template(
            data.title,
            data.message,
            data.hashtag,
            data.category,
            data.id
        );
        template.createdAt = new Date(data.createdAt);
        return template;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            message: this.message,
            hashtag: this.hashtag,
            category: this.category,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt || this.createdAt
        };
    }

    getFormattedMessage() {
        return `${this.message}\n\n${this.hashtag}`;
    }

    saveTemplate() {
        try {
            if (!templatesStore) {
                throw new Error('Store no inicializado');
            }
            templatesStore.addTemplate(this);
            return true;
        } catch (error) {
            console.error('Error al guardar template:', error);
            return false;
        }
    }

    update(changes) {
        try {
            if (!templatesStore) {
                throw new Error('Store no inicializado');
            }
            return templatesStore.updateTemplate(this.id, changes);
        } catch (error) {
            console.error('Error al actualizar template:', error);
            return false;
        }
    }

    #createTemplateHTML() {
        return `
            <article class="h-full flex flex-col justify-between">
                <div class="flex justify-between items-start">
                    <div class="flex-grow">
                        <h3 class="text-xl font-bold mb-2" 
                            contenteditable="true" 
                            data-field="title">${this.title}</h3>
                        <div class="space-y-2">
                            <p class="text-gray-600 whitespace-pre-line" 
                               contenteditable="true" 
                               data-field="message">${this.message}</p>
                            <p class="text-blue-500 text-sm font-medium" 
                               contenteditable="true" 
                               data-field="hashtag">${this.hashtag}</p>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button class="copy-btn text-gray-500 hover:text-blue-600 p-2" 
                                title="Copiar al portapapeles">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                            </svg>
                        </button>
                        <button class="delete-btn text-gray-500 hover:text-red-600 p-2" 
                                title="Eliminar plantilla">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="mt-4 flex justify-between items-center text-sm text-gray-500">
                    <span class="bg-gray-100 px-2 py-1 rounded-full">${this.category}</span>
                    <time datetime="${this.createdAt.toISOString()}">${new Date(this.createdAt).toLocaleDateString()}</time>
                </div>
            </article>
        `;
    }

    render() {
        const template = document.createElement('li');
        template.className = 'bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300';
        template.dataset.id = this.id;
        template.innerHTML = this.#createTemplateHTML();
        this.#attachEventListeners(template);
        return template;
    }

    #attachEventListeners(template) {
        const deleteBtn = template.querySelector('.delete-btn');
        const editableElements = template.querySelectorAll('[contenteditable="true"]');

        // Manejador de eliminación con confirmación
        deleteBtn.addEventListener('click', async () => {
            // Crear modal de confirmación
            const confirmModal = document.createElement('div');
            confirmModal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
            confirmModal.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 animate-fade-in">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">¿Eliminar plantilla?</h3>
                    <p class="text-gray-600 mb-6">Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar la plantilla "${this.title}"?</p>
                    <div class="flex justify-end space-x-3">
                        <button class="cancel-btn px-4 py-2 text-gray-600 hover:text-gray-800">
                            Cancelar
                        </button>
                        <button class="confirm-btn px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                            Eliminar
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(confirmModal);

            // Manejar respuesta del usuario
            const userResponse = await new Promise(resolve => {
                confirmModal.querySelector('.confirm-btn').addEventListener('click', () => resolve(true));
                confirmModal.querySelector('.cancel-btn').addEventListener('click', () => resolve(false));
                confirmModal.addEventListener('click', (e) => {
                    if (e.target === confirmModal) resolve(false);
                });
            });

            // Remover modal
            confirmModal.classList.add('opacity-0');
            setTimeout(() => confirmModal.remove(), 200);

            // Si el usuario confirma, proceder con la eliminación
            if (userResponse) {
                template.classList.add('opacity-0', 'transform', 'translate-y-2');
                template.style.transition = 'all 0.3s ease-out';
                
                await new Promise(resolve => setTimeout(resolve, 300));
                
                if (templatesStore.removeTemplate(this.id)) {
                    notifications.success('Plantilla eliminada correctamente');
                } else {
                    template.classList.remove('opacity-0', 'transform', 'translate-y-2');
                    notifications.error('Error al eliminar la plantilla');
                }
            }
        });

        // Manejar edición en línea
        editableElements.forEach(element => {
            let originalContent;

            element.addEventListener('focus', () => {
                originalContent = element.textContent;
                element.classList.add('bg-blue-50', 'outline-none', 'ring-2', 'ring-blue-300');
            });

            element.addEventListener('blur', async () => {
                const newContent = element.textContent.trim();
                if (newContent !== originalContent) {
                    const field = element.dataset.field;
                    const update = { [field]: newContent };
                    
                    if (await this.update(update)) {
                        element.textContent = newContent;
                        notifications.success('Cambios guardados automáticamente');
                    } else {
                        element.textContent = originalContent;
                        notifications.error('Error al guardar los cambios');
                    }
                }
                element.classList.remove('bg-blue-50', 'outline-none', 'ring-2', 'ring-blue-300');
            });
        });
    }
}
