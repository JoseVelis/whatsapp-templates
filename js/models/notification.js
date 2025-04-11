class NotificationManager {
    #position = 'bottom-right';
    #duration = 3000;
    
    constructor() {
        this.container = this.#createContainer();
    }

    #createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = `fixed ${this.#position === 'bottom-right' ? 'bottom-4 right-4' : 'top-4 right-4'} z-50 space-y-2`;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `
            flex items-center p-4 rounded-lg shadow-lg transform translate-x-0
            ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
            text-white animate-fade-in
        `;

        notification.innerHTML = `
            <div class="flex-grow">${message}</div>
            <button class="ml-4 hover:text-gray-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;

        this.container.appendChild(notification);
        notification.querySelector('button').onclick = () => this.#removeNotification(notification);

        setTimeout(() => this.#removeNotification(notification), this.#duration);
    }

    #removeNotification(notification) {
        notification.classList.add('opacity-0', 'translate-x-full');
        notification.style.transition = 'all 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }

    success(message) { this.show(message, 'success'); }
    error(message) { this.show(message, 'error'); }
}

// Crear instancia global
window.notifications = new NotificationManager();