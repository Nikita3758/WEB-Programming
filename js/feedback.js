const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    initializeFeedbackForm();
    updateTranslations(localStorage.getItem('language') || 'ru');
});

async function initializeFeedbackForm() {
    await loadProducts();
    setupRatingStars();
    setupFormValidation();
}

async function loadProducts() {
    try {
        const userId = localStorage.getItem('currentUserId');
        if (!userId) {
            alert(translations[localStorage.getItem('language') || 'ru']['feedback.loginRequired'] || 'Пожалуйста, войдите в систему');
            window.location.href = 'auth.html';
            return;
        }

        const userResponse = await fetch(`${API_URL}/users/${userId}`);
        const user = await userResponse.json();
        
        if (user.role === 'admin') {
            alert(translations[localStorage.getItem('language') || 'ru']['feedback.adminRestricted'] || 'Администраторы не могут оставлять отзывы');
            window.location.href = 'catalog.html';
            return;
        }

        const ordersResponse = await fetch(`${API_URL}/orders?userId=${userId}`);
        const orders = await ordersResponse.json();
        
        const purchasedProducts = new Set();
        orders.forEach(order => {
            order.products.forEach(product => {
                purchasedProducts.add(product.productId);
            });
        });

        const productsResponse = await fetch(`${API_URL}/products`);
        const products = await productsResponse.json();
        
        const select = document.getElementById('productSelect');
        select.innerHTML = `<option value="">-- ${translations[localStorage.getItem('language') || 'ru']['feedback.selectProduct'] || 'Выберите товар'} --</option>`;
        
        products.forEach(product => {
            if (purchasedProducts.has(product.id)) {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.name;
                select.appendChild(option);
            }
        });

    } catch (error) {
        console.error('Ошибка загрузки продуктов:', error);
        alert(translations[localStorage.getItem('language') || 'ru']['feedback.loadError'] || 'Ошибка загрузки продуктов');
    }
}

function setupRatingStars() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating');
    const lang = localStorage.getItem('language') || 'ru';
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.dataset.value);
            ratingInput.value = value;
            
            stars.forEach(s => {
                s.style.color = parseInt(s.dataset.value) <= value ? '#ffd700' : '#ccc';
            });
            
            validateForm();
        });

        star.addEventListener('mouseover', function() {
            const value = parseInt(this.dataset.value);
            this.title = `${value} ${value === 1 ? translations[lang]['feedback.star'] || 'звезда' : translations[lang]['feedback.stars'] || 'звезд'}`;
        });
    });
}

function setupFormValidation() {
    const form = document.getElementById('feedbackForm');
    const comment = document.getElementById('comment');
    const charCount = document.querySelector('.char-count');
    const lang = localStorage.getItem('language') || 'ru';
    
    comment.addEventListener('input', function() {
        const length = this.value.length;
        const minLength = parseInt(this.getAttribute('minlength')) || 50;
        charCount.textContent = `${length}/${minLength} ${translations[lang]['feedback.characters'] || 'символов'}`;
        charCount.style.color = length >= minLength ? 'green' : 'red';
        validateForm();
    });

    const productSelect = document.getElementById('productSelect');
    productSelect.addEventListener('change', validateForm);
    
    form.addEventListener('input', validateForm);
    form.addEventListener('submit', handleFeedbackSubmit);
}

function validateForm() {
    const form = document.getElementById('feedbackForm');
    const submitBtn = document.getElementById('submitFeedback');
    const lang = localStorage.getItem('language') || 'ru';

    const productSelect = document.getElementById('productSelect');
    const productError = document.getElementById('productError') || createErrorElement(productSelect);
    
    if (!productSelect.value) {
        productError.textContent = translations[lang]['feedback.productRequired'] || 'Выберите товар';
        productError.style.display = 'block';
        productSelect.style.borderColor = '#ff4444';
    } else {
        productError.style.display = 'none';
        productSelect.style.borderColor = '';
    }

    const ratingInput = document.getElementById('rating');
    const ratingError = document.getElementById('ratingError') || createErrorElement(ratingInput);
    
    if (!ratingInput.value) {
        ratingError.textContent = translations[lang]['feedback.ratingRequired'] || 'Выберите оценку';
        ratingError.style.display = 'block';
    } else {
        ratingError.style.display = 'none';
    }
    
    const isValid = form.checkValidity() && productSelect.value && ratingInput.value;
    submitBtn.disabled = !isValid;
    return isValid;
}

function createErrorElement(inputElement) {
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.style.cssText = 'color: #ff4444; font-size: 0.9em; display: block; margin-top: 5px;';
    inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
    return errorElement;
}

async function handleFeedbackSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const userId = localStorage.getItem('currentUserId');
    const lang = localStorage.getItem('language') || 'ru';
    const feedbackData = {
        productId: parseInt(document.getElementById('productSelect').value),
        userId: parseInt(userId),
        rating: parseInt(document.getElementById('rating').value),
        comment: document.getElementById('comment').value,
        createdAt: new Date().toISOString(),
        status: 'pending'
    };
    
    try {
        const response = await fetch(`${API_URL}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedbackData)
        });
        
        if (response.ok) {
            alert(translations[lang]['feedback.submitSuccess'] || 'Отзыв отправлен на модерацию!');
            window.location.href = 'catalog.html';
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.error('Ошибка отправки отзыва:', error);
        alert(translations[lang]['feedback.submitError'] || 'Ошибка отправки отзыва');
    }
}

function updateTranslations(lang) {
    if (typeof window.updateTranslations === 'function') {
        window.updateTranslations(lang);
    } else {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
    }
}