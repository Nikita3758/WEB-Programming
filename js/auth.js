const API_URL = 'http://localhost:3000';
let nicknameGenerationAttempts = 0;
const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123', 'welcome1'];

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthForm();
});

function initializeAuthForm() {
    const form = document.getElementById('registrationForm');
    const passwordMethod = document.getElementById('passwordMethod');
    const manualPasswordFields = document.querySelectorAll('.manual-password');
    const generateBtn = document.getElementById('generateNickname');
    const switchToLogin = document.getElementById('switchToLogin');

    passwordMethod.addEventListener('change', function() {
        manualPasswordFields.forEach(field => {
            field.style.display = this.value === 'manual' ? 'block' : 'none';
        });
        validateForm();
    });

    generateBtn.addEventListener('click', generateNickname);
    generateNickname(); 

    switchToLogin.addEventListener('click', function(e) {
        e.preventDefault();
    });

    form.addEventListener('input', validateForm);
    form.addEventListener('submit', handleRegistration);
}

function generateNickname() {
    const firstName = document.getElementById('firstName').value || 'User';
    const lastName = document.getElementById('lastName').value || 'User';
    
    if (nicknameGenerationAttempts >= 5) {
        document.getElementById('nickname').readOnly = false;
        document.getElementById('generateNickname').style.display = 'none';
        return;
    }

    const firstPart = firstName.slice(0, 3);
    const secondPart = lastName.slice(0, 3);
    const randomNum = Math.floor(Math.random() * 990) + 10;
    
    const suffixes = ['', 'X', 'Pro', 'Master', '2024'];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    let nickname = `${firstPart}${secondPart}${randomNum}${suffix}`;
    nickname = nickname.replace(/\s+/g, '');
    
    document.getElementById('nickname').value = nickname;
    nicknameGenerationAttempts++;
    
    checkNicknameUnique(nickname);
}

async function checkNicknameUnique(nickname) {
    try {
        const response = await fetch(`${API_URL}/users?nickname=${nickname}`);
        const users = await response.json();
        
        if (users.length > 0) {
            document.getElementById('nicknameError').textContent = 'Этот никнейм уже занят';
            generateNickname();
        } else {
            document.getElementById('nicknameError').textContent = '';
        }
    } catch (error) {
        console.error('Ошибка проверки никнейма:', error);
    }
}

function validateForm() {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    let isValid = true;

    const phone = document.getElementById('phone').value;
    if (!validatePhone(phone)) {
        document.getElementById('phoneError').textContent = 'Введите корректный номер РБ';
        isValid = false;
    }

    const email = document.getElementById('email').value;
    if (!validateEmail(email)) {
        document.getElementById('emailError').textContent = 'Введите корректный email';
        isValid = false;
    }

    const birthDate = new Date(document.getElementById('birthDate').value);
    if (!validateBirthDate(birthDate)) {
        document.getElementById('birthDateError').textContent = 'Вам должно быть не менее 16 лет';
        isValid = false;
    }

    if (document.getElementById('passwordMethod').value === 'manual') {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!validatePassword(password)) {
            document.getElementById('passwordError').textContent = 'Пароль не соответствует требованиям';
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Пароли не совпадают';
            isValid = false;
        }
    }

    submitBtn.disabled = !isValid;
    return isValid;
}

function validatePhone(phone) {
    const regex = /^\+375\s?(25|29|33|44)\s?\d{3}[-]?\d{2}[-]?\d{2}$/;
    return regex.test(phone);
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validateBirthDate(birthDate) {
    const today = new Date();
    const minAgeDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    return birthDate <= minAgeDate;
}

function validatePassword(password) {
    if (password.length < 8 || password.length > 20) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/\d/.test(password)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    if (commonPasswords.includes(password.toLowerCase())) return false;
    return true;
}

async function handleRegistration(e) {
    e.preventDefault();
    
    if (!validateForm()) return;

    const userData = {
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        birthDate: document.getElementById('birthDate').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        patronymic: document.getElementById('patronymic').value,
        nickname: document.getElementById('nickname').value,
        role: 'user',
        agreementAccepted: true,
        registrationDate: new Date().toISOString()
    };

    if (document.getElementById('passwordMethod').value === 'auto') {
        userData.password = generateRandomPassword();
    } else {
        userData.password = document.getElementById('password').value;
    }

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const newUser = await response.json();

            localStorage.setItem('currentUserId', newUser.id);
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            alert('Регистрация успешна!');
            window.location.href = 'index.html'; 
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        alert('Ошибка регистрации');
    }
}

function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password;
}