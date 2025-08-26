const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
    checkRememberedUser();
    updateTranslations(localStorage.getItem('language') || 'ru');
});

function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const forgotPassword = document.getElementById('forgotPassword');
    const modal = document.getElementById('passwordModal');
    const closeModal = document.querySelector('.close');
    const recoveryForm = document.getElementById('passwordRecoveryForm');

    loginForm.addEventListener('submit', handleLogin);

    forgotPassword.addEventListener('click', function(e) {
        e.preventDefault();
        modal.style.display = 'block';
    });

    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    recoveryForm.addEventListener('submit', handlePasswordRecovery);
}

function checkRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        const user = JSON.parse(rememberedUser);
        document.getElementById('login').value = user.login;
        document.getElementById('rememberMe').checked = true;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const login = document.getElementById('login').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const lang = localStorage.getItem('language') || 'ru';

    document.getElementById('loginError').textContent = '';
    document.getElementById('passwordError').textContent = '';

    try {
        const response = await fetch(`${API_URL}/users?${
            login.includes('@') ? 
            `email=${login}` : 
            `phone=${login}`
        }`);
        
        const users = await response.json();
        
        if (users.length === 0) {
            document.getElementById('loginError').textContent = translations[lang]['login.userNotFound'] || 'Пользователь не найден';
            return;
        }

        const user = users[0];

        if (password !== user.password) {
            document.getElementById('passwordError').textContent = translations[lang]['login.wrongPassword'] || 'Неверный пароль';
            return;
        }

        localStorage.setItem('currentUserId', user.id);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        if (rememberMe) {
            localStorage.setItem('rememberedUser', JSON.stringify({
                login: login,
                timestamp: Date.now()
            }));
        } else {
            localStorage.removeItem('rememberedUser');
        }

        window.location.href = 'index.html';

    } catch (error) {
        console.error('Ошибка входа:', error);
        document.getElementById('loginError').textContent = translations[lang]['login.serverError'] || 'Ошибка сервера';
    }
}

async function handlePasswordRecovery(e) {
    e.preventDefault();
    
    const email = document.getElementById('recoveryEmail').value;
    const errorElement = document.getElementById('recoveryError');
    const lang = localStorage.getItem('language') || 'ru';

    errorElement.textContent = '';

    try {
        const response = await fetch(`${API_URL}/users?email=${email}`);
        const users = await response.json();
        
        if (users.length === 0) {
            errorElement.textContent = translations[lang]['login.emailNotFound'] || 'Пользователь с таким email не найден';
            return;
        }

        alert(translations[lang]['login.recoverySent'] || 'Ссылка для восстановления пароля отправлена на ваш email');
        document.getElementById('passwordModal').style.display = 'none';
        
    } catch (error) {
        console.error('Ошибка восстановления пароля:', error);
        errorElement.textContent = translations[lang]['login.serverError'] || 'Ошибка сервера';
    }
}

function logout() {
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}