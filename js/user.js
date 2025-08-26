document.addEventListener('DOMContentLoaded', function() {
    initializeUserMenu();
    updateNavigation();
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
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUser');
    updateNavigation(); 
    window.location.href = 'index.html'; 
}

window.updateNavigation = updateNavigation;
window.checkAuth = checkAuth;
window.checkFeedbackAccess = checkFeedbackAccess;
window.logout = logout;