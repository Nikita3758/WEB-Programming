const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    initializeFeedbackForm();
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
            alert('Пожалуйста, войдите в систему');
            window.location.href = 'auth.html';
            return;
        }

        const userResponse = await fetch(`${API_URL}/users/${userId}`);
        const user = await userResponse.json();
        
        if (user.role === 'admin') {
            alert('Администраторы не могут оставлять отзывы');
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
        select.innerHTML = '<option value="">-- Выберите товар --</option>';
        
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
    }
}

function setupRatingStars() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.dataset.value);
            ratingInput.value = value;
            
            stars.forEach(s => {
                s.style.color = parseInt(s.dataset.value) <= value ? '#ffd700' : '#ccc';
            });
            
            validateForm();
        });
    });
}

function setupFormValidation() {
    const form = document.getElementById('feedbackForm');
    const comment = document.getElementById('comment');
    const charCount = document.querySelector('.char-count');
    
    comment.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = `${length}/50 символов`;
        charCount.style.color = length >= 50 ? 'green' : 'red';
        validateForm();
    });
    
    form.addEventListener('input', validateForm);
    form.addEventListener('submit', handleFeedbackSubmit);
}

function validateForm() {
    const form = document.getElementById('feedbackForm');
    const submitBtn = document.getElementById('submitFeedback');
    const isValid = form.checkValidity();
    submitBtn.disabled = !isValid;
    return isValid;
}

async function handleFeedbackSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const userId = localStorage.getItem('currentUserId');
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
            alert('Отзыв отправлен на модерацию!');
            window.location.href = 'catalog.html';
        }
    } catch (error) {
        console.error('Ошибка отправки отзыва:', error);
        alert('Ошибка отправки отзыва');
    }
}