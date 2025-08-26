class ProfileManager {
    constructor() {
        this.modal = document.getElementById('userModal');
        this.storageManager = window.storageManager;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();
    }

    setupEventListeners() {
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            avatar.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }

        const profileLink = document.querySelector('.user-dropdown a[href="profile.html"]');
        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
                this.closeDropdown();
            });
        }

        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('userDropdown');
            const avatar = document.getElementById('userAvatar');
            
            if (dropdown && avatar && 
                !dropdown.contains(e.target) && 
                !avatar.contains(e.target)) {
                this.closeDropdown();
            }
        });

        const closeBtn = this.modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        const form = document.getElementById('userProfileForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        const resetBtn = document.getElementById('resetSettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        const nicknameInput = document.getElementById('userNickname');
        const emailInput = document.getElementById('userEmail');
        const phoneInput = document.getElementById('userPhone');

        if (nicknameInput) {
            nicknameInput.addEventListener('blur', () => this.validateNickname(nicknameInput));
        }
        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmail(emailInput));
        }
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => this.validatePhone(phoneInput));
        }
    }

    validateNickname(input) {
        const value = input.value.trim();
        const errorElement = this.getOrCreateErrorElement(input);
        const lang = localStorage.getItem('language') || 'ru';
        
        if (!value) {
            this.showError(input, errorElement, translations[lang]['profile.nicknameRequired'] || 'Никнейм обязателен для заполнения');
            return false;
        }
        
        if (value.length < 3) {
            this.showError(input, errorElement, translations[lang]['profile.nicknameMinLength'] || 'Никнейм должен содержать минимум 3 символа');
            return false;
        }
        
        if (value.length > 20) {
            this.showError(input, errorElement, translations[lang]['profile.nicknameMaxLength'] || 'Никнейм не должен превышать 20 символов');
            return false;
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            this.showError(input, errorElement, translations[lang]['profile.nicknameInvalid'] || 'Никнейм может содержать только буквы, цифры и подчеркивание');
            return false;
        }
        
        this.hideError(input, errorElement);
        return true;
    }

    validateEmail(input) {
        const value = input.value.trim();
        const errorElement = this.getOrCreateErrorElement(input);
        const lang = localStorage.getItem('language') || 'ru';
        
        if (!value) {
            this.showError(input, errorElement, translations[lang]['profile.emailRequired'] || 'Email обязателен для заполнения');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            this.showError(input, errorElement, translations[lang]['profile.emailInvalid'] || 'Введите корректный email адрес');
            return false;
        }
        
        this.hideError(input, errorElement);
        return true;
    }

    validatePhone(input) {
        const value = input.value.trim();
        const errorElement = this.getOrCreateErrorElement(input);
        const lang = localStorage.getItem('language') || 'ru';
        
        if (!value) {
            this.showError(input, errorElement, translations[lang]['profile.phoneRequired'] || 'Телефон обязателен для заполнения');
            return false;
        }
        
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
        
        if (!phoneRegex.test(cleanPhone)) {
            this.showError(input, errorElement, translations[lang]['profile.phoneInvalid'] || 'Введите корректный номер телефона');
            return false;
        }
        
        this.hideError(input, errorElement);
        return true;
    }

    getOrCreateErrorElement(input) {
        let errorElement = input.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        return errorElement;
    }

    showError(input, errorElement, message) {
        input.style.borderColor = '#ff4444';
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    hideError(input, errorElement) {
        input.style.borderColor = '';
        errorElement.style.display = 'none';
    }

    toggleDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
    }

    closeDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    openModal() {
        this.loadUserData();
        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.clearErrors();
    }

    clearErrors() {
        const errorElements = this.modal.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.style.display = 'none';
        });
        
        const inputs = this.modal.querySelectorAll('input');
        inputs.forEach(input => {
            input.style.borderColor = '';
        });
    }

    loadUserData() {
        if (!this.storageManager) {
            console.error('StorageManager не доступен');
            return;
        }
        
        const user = this.storageManager.getUser();
        if (user) {
            const nicknameInput = document.getElementById('userNickname');
            const emailInput = document.getElementById('userEmail');
            const phoneInput = document.getElementById('userPhone');

            if (nicknameInput) nicknameInput.value = user.nickname || '';
            if (emailInput) emailInput.value = user.email || '';
            if (phoneInput) phoneInput.value = user.phone || '';
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const isNicknameValid = this.validateNickname(document.getElementById('userNickname'));
        const isEmailValid = this.validateEmail(document.getElementById('userEmail'));
        const isPhoneValid = this.validatePhone(document.getElementById('userPhone'));
        
        const lang = localStorage.getItem('language') || 'ru';
        
        if (!isNicknameValid || !isEmailValid || !isPhoneValid) {
            this.showNotification(translations[lang]['profile.formErrors'] || 'Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }
        
        const userData = {
            nickname: document.getElementById('userNickname').value.trim(),
            email: document.getElementById('userEmail').value.trim(),
            phone: document.getElementById('userPhone').value.trim()
        };

        if (!this.storageManager) {
            this.showNotification(translations[lang]['profile.saveError'] || 'Ошибка сохранения данных', 'error');
            return;
        }

        const currentUser = this.storageManager.getUser() || {};
        const updatedUser = { ...currentUser, ...userData };
        
        this.storageManager.saveUser(updatedUser);
        this.closeModal();

        this.showNotification(translations[lang]['profile.saveSuccess'] || 'Данные сохранены успешно!', 'success');

        this.updateAvatar(updatedUser.nickname);
    }

    updateAvatar(nickname) {
        const avatar = document.getElementById('userAvatar');
        if (avatar && nickname) {
            avatar.textContent = nickname.charAt(0).toUpperCase();
        }
    }

    resetSettings() {
        const lang = localStorage.getItem('language') || 'ru';
        const confirmMessage = translations[lang]['profile.resetConfirm'] || 'Вы уверены, что хотите сбросить все настройки?';
        
        if (confirm(confirmMessage)) {
            if (!this.storageManager) {
                this.showNotification(translations[lang]['profile.resetError'] || 'Ошибка сброса настроек', 'error');
                return;
            }

            const defaultSettings = this.storageManager.resetSettings();

            if (window.themeManager) {
                window.themeManager.switchTheme(defaultSettings.theme);
            }
            if (window.translationManager) {
                window.translationManager.switchLanguage(defaultSettings.language);
            }
            
            this.showNotification(translations[lang]['profile.resetSuccess'] || 'Настройки сброшены к значениям по умолчанию', 'success');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#ff4444'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (typeof storageManager !== 'undefined') {
            window.profileManager = new ProfileManager();
        } else {
            console.error('StorageManager не найден');
        }
    }, 100);
});