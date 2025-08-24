const API_URL = 'http://localhost:3000';
let currentProductId = null;
let deleteCallback = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth('admin')) return;
    
    initializeAdminPanel();
    loadProducts();
    loadReviews();
    loadStats();
});

function initializeAdminPanel() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            tabButtons.forEach(function(b) {
                b.classList.remove('active');
            });

            document.querySelectorAll('.tab-content').forEach(function(c) {
                c.classList.remove('active');
            });

            this.classList.add('active');

            const tabId = this.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');

            if (this.getAttribute('data-tab') === 'reviews') {
                loadReviews();
            } else if (this.getAttribute('data-tab') === 'stats') {
                loadStats();
            }
        });
    });

    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('input', validateProductForm);
        productForm.addEventListener('submit', handleProductSubmit);
    }

    const productFilter = document.getElementById('reviewProductFilter');
    const statusFilter = document.getElementById('reviewStatusFilter');
    
    if (productFilter) {
        productFilter.addEventListener('change', loadReviews);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', loadReviews);
    }
}

function validateProductForm() {
    const form = document.getElementById('productForm');
    const submitBtn = document.getElementById('saveProductBtn');
    
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = document.getElementById('productPrice').value;
    const rating = document.getElementById('productRating').value;
    const description = document.getElementById('productDescription').value;

    let isValid = true;
    
    if (name.length < 3) {
        document.getElementById('nameError').textContent = 'Минимум 3 символа';
        isValid = false;
    } else {
        document.getElementById('nameError').textContent = '';
    }
    
    if (!category) {
        document.getElementById('categoryError').textContent = 'Выберите категорию';
        isValid = false;
    } else {
        document.getElementById('categoryError').textContent = '';
    }
    
    if (!price || price < 0) {
        document.getElementById('priceError').textContent = 'Введите корректную цену';
        isValid = false;
    } else {
        document.getElementById('priceError').textContent = '';
    }
    
    if (!rating || rating < 0 || rating > 5) {
        document.getElementById('ratingError').textContent = 'Рейтинг от 0 до 5';
        isValid = false;
    } else {
        document.getElementById('ratingError').textContent = '';
    }
    
    if (description.length < 10) {
        document.getElementById('descriptionError').textContent = 'Минимум 10 символов';
        isValid = false;
    } else {
        document.getElementById('descriptionError').textContent = '';
    }
    
    submitBtn.disabled = !isValid;
    return isValid;
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    if (!validateProductForm()) return;
    
    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        rating: parseFloat(document.getElementById('productRating').value),
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').value || './img/services/default.png',
        details: {
            complexity: document.getElementById('productComplexity').value,
            duration: document.getElementById('productDuration').value,
            area: 'до 20 м²'
        },
        inStock: true,
        popular: false
    };
    
    try {
        let response;
        
        if (currentProductId) {
            response = await fetch(`${API_URL}/products/${currentProductId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } else {
            response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }
        
        if (response.ok) {
            showNotification(currentProductId ? 'Товар обновлен!' : 'Товар добавлен!');
            document.getElementById('productModal').style.display = 'none';
            loadProducts();
        }
    } catch (error) {
        console.error('Ошибка сохранения товара:', error);
        showNotification('Ошибка сохранения товара', true);
    }
}

function resetProductForm() {
    document.getElementById('productForm').reset();
    currentProductId = null;
    document.getElementById('saveProductBtn').disabled = true;
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = '';
        
        products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'product-item';
            productItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image" 
                     onerror="this.src='./img/services/default.png'">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p>${product.category} • ${product.price} руб. • ★${product.rating}</p>
                    <p>${product.description}</p>
                </div>
                <div class="product-actions">
                    <button class="btn-edit" onclick="editProduct('${product.id}')">✏️</button>
                    <button class="btn-delete" onclick="confirmDelete('product', '${product.id}')">🗑️</button>
                </div>
            `;
            productsList.appendChild(productItem);
        });
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        showNotification('Ошибка загрузки товаров', true);
    }
}

async function editProduct(productId) {
    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        const product = await response.json();

        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productRating').value = product.rating;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productComplexity').value = product.details?.complexity || '';
        document.getElementById('productDuration').value = product.details?.duration || '';
        
        currentProductId = product.id;
        validateProductForm();

        document.getElementById('modalTitle').textContent = 'Редактировать товар';
        document.getElementById('productModal').style.display = 'block';
    } catch (error) {
        console.error('Ошибка загрузки товара:', error);
        showNotification('Ошибка загрузки товара', true);
    }
}

function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${isError ? 'error' : ''}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

async function loadReviews() {
    try {
        const productFilter = document.getElementById('reviewProductFilter').value;
        const userFilter = document.getElementById('reviewUserFilter').value;
        const statusFilter = document.getElementById('reviewStatusFilter').value;
        
        let url = `${API_URL}/feedback?_expand=product`;
        
        if (productFilter) url += `&productId=${productFilter}`;
        if (userFilter) url += `&userId=${userFilter}`;
        if (statusFilter) url += `&status=${statusFilter}`;
        
        const response = await fetch(url);
        const reviews = await response.json();
        
        const reviewsList = document.getElementById('reviewsList');
        reviewsList.innerHTML = '';
        
        reviews.forEach(review => {
            let userName = 'Анонимный пользователь';
            if (review.userId) {
                userName = `Пользователь #${review.userId}`;
            }
            
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.innerHTML = `
                <div class="review-header">
                    <span class="review-product">${review.product?.name || 'Неизвестный товар'}</span>
                    <span class="review-rating">★${review.rating}</span>
                </div>
                <div class="review-user">
                    ${userName}
                </div>
                <p class="review-comment">${review.comment}</p>
                <span class="review-status status-${review.status}">${getStatusText(review.status)}</span>
                <div class="product-actions" style="margin-top: 10px;">
                    ${review.status === 'pending' ? `
                        <button class="btn-edit" onclick="approveReview('${review.id}')">✅ Одобрить</button>
                        <button class="btn-delete" onclick="rejectReview('${review.id}')">❌ Отклонить</button>
                    ` : ''}
                    <button class="btn-delete" onclick="confirmDelete('review', '${review.id}')">🗑️ Удалить</button>
                </div>
            `;
            reviewsList.appendChild(reviewItem);
        });
        
        await loadReviewFilters();
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        alert('Ошибка загрузки отзывов: ' + error.message);
    }
}

async function loadReviewFilters() {
    try {
        const productsResponse = await fetch(`${API_URL}/products`);
        const products = await productsResponse.json();
        
        const productFilter = document.getElementById('reviewProductFilter');
        const currentValue = productFilter.value;
        productFilter.innerHTML = '<option value="">Все товары</option>';
        
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            productFilter.appendChild(option);
        });
        productFilter.value = currentValue;

        const userFilter = document.getElementById('reviewUserFilter');
        userFilter.innerHTML = '<option value="">Все пользователи</option>';
        userFilter.disabled = true; 
        
    } catch (error) {
        console.error('Ошибка загрузки фильтров:', error);
    }
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'На модерации',
        'approved': 'Одобрено',
        'rejected': 'Отклонено'
    };
    return statusMap[status] || status;
}

async function approveReview(reviewId) {
    try {
        const response = await fetch(`${API_URL}/feedback/${reviewId}`);
        if (!response.ok) {
            throw new Error('Ошибка загрузки отзыва');
        }
        
        const review = await response.json();

        const updatedReview = {
            ...review,
            status: 'approved'
        };

        const updateResponse = await fetch(`${API_URL}/feedback/${reviewId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedReview)
        });
        
        if (updateResponse.ok) {
            console.log('Отзыв одобрен успешно');
            loadReviews();
        } else {
            throw new Error('Ошибка сервера при обновлении');
        }
    } catch (error) {
        console.error('Ошибка одобрения отзыва:', error);
        alert('Ошибка при одобрении отзыва: ' + error.message);
    }
}

async function rejectReview(reviewId) {
    try {
        const response = await fetch(`${API_URL}/feedback/${reviewId}`);
        if (!response.ok) {
            throw new Error('Ошибка загрузки отзыва');
        }
        
        const review = await response.json();

        const updatedReview = {
            ...review,
            status: 'rejected'
        };

        const updateResponse = await fetch(`${API_URL}/feedback/${reviewId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedReview)
        });
        
        if (updateResponse.ok) {
            loadReviews();
        } else {
            throw new Error('Ошибка сервера при обновлении');
        }
    } catch (error) {
        console.error('Ошибка отклонения отзыва:', error);
        alert('Ошибка при отклонении отзыва: ' + error.message);
    }
}

async function loadStats() {
    try {
        const [productsRes, reviewsRes, ordersRes] = await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/feedback`),
            fetch(`${API_URL}/orders`)
        ]);
        
        const products = await productsRes.json();
        const reviews = await reviewsRes.json();
        const orders = await ordersRes.json();

        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalReviews').textContent = reviews.length;
        document.getElementById('totalOrders').textContent = orders.length;
        
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        document.getElementById('totalRevenue').textContent = `${totalRevenue} руб`;

        const ordersList = document.getElementById('ordersList');
        ordersList.innerHTML = '';
        
        orders.slice(-5).reverse().forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <div class="order-header">
                    <span class="order-id">Заказ #${order.id}</span>
                    <span class="order-date">${new Date(order.orderDate).toLocaleDateString()}</span>
                </div>
                <div class="order-amount">${order.totalAmount} руб</div>
                <div>Товаров: ${order.products.length}</div>
            `;
            ordersList.appendChild(orderItem);
        });
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

function confirmDelete(type, id) {
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    message.textContent = `Вы уверены, что хотите удалить этот ${type === 'product' ? 'товар' : 'отзыв'}?`;
    
    deleteCallback = async () => {
        try {
            await fetch(`${API_URL}/${type === 'product' ? 'products' : 'feedback'}/${id}`, {
                method: 'DELETE'
            });
            
            if (type === 'product') {
                loadProducts();
            } else {
                loadReviews();
            }
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления');
        }
    };
    
    modal.style.display = 'flex';
    confirmBtn.onclick = deleteCallback;
}

function hideModal() {
    document.getElementById('confirmModal').style.display = 'none';
    deleteCallback = null;
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

function logout() {
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}