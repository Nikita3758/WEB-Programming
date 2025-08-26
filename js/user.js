document.addEventListener('DOMContentLoaded', function() {
    initializeUserMenu();
    updateNavigation();
    initializeThemeAndLanguage();
    loadUserPreferences();
});

function initializeUserMenu() {
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userAvatar && userDropdown) {
        userAvatar.addEventListener('click', function() {
            userDropdown.classList.toggle('show');
        });

        document.addEventListener('click', function(e) {
            if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
}

function updateNavigation() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const userMenu = document.getElementById('userMenu');
    const feedbackLink = document.getElementById('feedbackLink');
    const adminLink = document.getElementById('adminLink');
    const userAvatar = document.getElementById('userAvatar');
    
    if (user.id) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';

        if (userMenu) userMenu.style.display = 'flex';

        if (feedbackLink) feedbackLink.style.display = 'block';

        if (adminLink) {
            adminLink.style.display = user.role === 'admin' ? 'block' : 'none';
        }

        if (userAvatar) {
            const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
            userAvatar.textContent = initials || 'П';
        }
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';

        if (userMenu) userMenu.style.display = 'none';
        if (feedbackLink) feedbackLink.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

function checkAuth(requiredRole = null) {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!user.id) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (requiredRole && user.role !== requiredRole) {
        alert('Недостаточно прав для доступа к этой странице');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

function checkFeedbackAccess() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!user.id) {
        alert('Пожалуйста, войдите в систему чтобы оставить отзыв');
        window.location.href = 'login.html';
        return false;
    }
    
    if (user.role === 'admin') {
        alert('Администраторы не могут оставлять отзывы');
        window.location.href = 'catalog.html';
        return false;
    }
    
    return true;
}

function logout() {
    saveUserPreferences();
    
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUser');
    updateNavigation(); 
    window.location.href = 'index.html'; 
}

function initializeThemeAndLanguage() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.dataset.theme;
            switchTheme(theme);
        });
    });

    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.dataset.lang;
            switchLanguage(lang);
        });
    });
}

function switchTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme');

    document.body.classList.add(`${theme}-theme`);

    updateActiveThemeButton(theme);

    saveUserPreferences();

    updateThemeImages(theme);
}

function switchLanguage(lang) {
    updateActiveLanguageButton(lang);

    saveUserPreferences();
}

function updateActiveThemeButton(theme) {
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });
}

function updateActiveLanguageButton(lang) {
    const buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });
}

function updateThemeImages(theme) {
    const logo = document.querySelector('.logo');
    if (logo) {
        const newLogoSrc = theme === 'dark' ? './img/header/logo-dark.png' : './img/header/logo-light.png';

        const testImage = new Image();
        testImage.onload = function() {
            logo.src = newLogoSrc;
        };
        testImage.onerror = function() {
            logo.src = './img/header/logo.png';
        };
        testImage.src = newLogoSrc;
    }
}

function loadUserPreferences() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');

    const theme = preferences.theme || 'light';
    switchTheme(theme);

    const language = preferences.language || 'ru';
    switchLanguage(language);

    loadCartAndFavorites(user);
}

function saveUserPreferences() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const currentLang = document.querySelector('.lang-btn.active')?.dataset.lang || 'ru';
    
    const preferences = {
        theme: currentTheme,
        language: currentLang,
        lastUpdated: new Date().toISOString()
    };

    localStorage.setItem('userPreferences', JSON.stringify(preferences));

    if (user.id) {
        const userData = { ...user, preferences };
        localStorage.setItem('currentUser', JSON.stringify(userData));
    }
}

function loadCartAndFavorites(user) {
    if (user.id) {
        const cart = user.cart || [];
        updateCartUI(cart);

        const favorites = user.favorites || [];
        updateFavoritesUI(favorites);
    }
}

function updateCartUI(cartItems) {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cartItems.length;
    }

    console.log('Cart updated:', cartItems.length, 'items');
}

function updateFavoritesUI(favorites) {
    const favCount = document.getElementById('favCount');
    if (favCount) {
        favCount.textContent = favorites.length;
    }

    console.log('Favorites updated:', favorites.length, 'items');
}
window.updateNavigation = updateNavigation;
window.checkAuth = checkAuth;
window.checkFeedbackAccess = checkFeedbackAccess;
window.logout = logout;
window.switchTheme = switchTheme;
window.switchLanguage = switchLanguage;

function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.id) {
        console.log('User is logged in:', user.email);
    } else {
        console.log('User is not logged in');
    }
}

checkAuthStatus();