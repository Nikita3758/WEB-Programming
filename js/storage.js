class StorageManager {
    constructor() {
        this.userKey = 'currentUser'; 
        this.settingsKey = 'farmzi_settings';
    }

    saveUser(userData) {
        const data = {
            ...userData,
            lastLogin: new Date().toISOString()
        };
        localStorage.setItem(this.userKey, JSON.stringify(data));
        this.updateUserInterface();
    }

    getUser() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    clearUser() {
        localStorage.removeItem(this.userKey);
        this.updateUserInterface();
    }

    saveSettings(settings) {
        const currentSettings = this.getSettings();
        const newSettings = { ...currentSettings, ...settings };
        localStorage.setItem(this.settingsKey, JSON.stringify(newSettings));
    }

    getSettings() {
        const settings = localStorage.getItem(this.settingsKey);
        return settings ? JSON.parse(settings) : {
            language: 'ru',
            theme: 'light',
            notifications: true,
            sound: true
        };
    }

    resetSettings() {
        localStorage.removeItem(this.settingsKey);
        return this.getSettings();
    }

    getCart() {
        const user = this.getUser();
        return user?.cart || [];
    }

    saveCart(cartItems) {
        const user = this.getUser();
        if (user) {
            user.cart = cartItems;
            this.saveUser(user);
        }
    }

    getFavorites() {
        const user = this.getUser();
        return user?.favorites || [];
    }

    saveFavorites(favorites) {
        const user = this.getUser();
        if (user) {
            user.favorites = favorites;
            this.saveUser(user);
        }
    }

    updateUserInterface() {
        const user = this.getUser();
        const userMenu = document.getElementById('userMenu');
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');

        if (user) {
            if (userMenu) userMenu.style.display = 'flex';
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';

            this.updateUserAvatar(user);
        } else {
            if (userMenu) userMenu.style.display = 'none';
            if (loginLink) loginLink.style.display = 'block';
            if (registerLink) registerLink.style.display = 'block';
        }
    }

    updateUserAvatar(user) {
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            const displayName = user.nickname || user.firstName || user.email || 'Г';
            avatar.textContent = displayName.charAt(0).toUpperCase();
        }
    }

    init() {
        this.updateUserInterface();

        const settings = this.getSettings();
        if (window.themeManager) {
            themeManager.switchTheme(settings.theme);
        }
        if (window.translationManager) {
            translationManager.switchLanguage(settings.language);
        }
    }
}

window.storageManager = new StorageManager();