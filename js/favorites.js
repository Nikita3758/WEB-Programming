const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    loadFavorites();
    updateTranslations(localStorage.getItem('language') || 'ru');
});

function loadFavorites() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const lang = localStorage.getItem('language') || 'ru';

    if (!user.id) {
        showEmptyFavorites(translations[lang]['favorites.loginRequired'] || 'Пожалуйста, войдите в систему чтобы просмотреть избранное');
        return;
    }

    fetch(`${API_URL}/favorites?userId=${user.id}`)
        .then(response => response.json())
        .then(favorites => {
            if (favorites.length === 0) {
                showEmptyFavorites(translations[lang]['favorites.empty'] || 'В избранном пока ничего нет');
            } else {
                displayFavorites(favorites);
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки избранного:', error);
            showEmptyFavorites(translations[lang]['favorites.loadError'] || 'Произошла ошибка при загрузке избранного');
        });
}

function showEmptyFavorites(message) {
    const container = document.getElementById('favoritesGrid');
    const lang = localStorage.getItem('language') || 'ru';
    
    container.innerHTML = `
        <div class="empty-favorites">
            <h3>${message}</h3>
            <p>${translations[lang]['favorites.addHint'] || 'Добавьте услуги, которые вам понравились'}</p>
            <a href="catalog.html" class="back-to-catalog">${translations[lang]['favorites.goToCatalog'] || 'Перейти в каталог'}</a>
        </div>
    `;
}

function displayFavorites(favorites) {
    const container = document.getElementById('favoritesGrid');
    const lang = localStorage.getItem('language') || 'ru';
    
    container.innerHTML = '';
    
    favorites.forEach(favorite => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        
        card.innerHTML = `
            <button class="remove-btn" onclick="removeFromFavorites(${favorite.id})" title="${translations[lang]['favorites.remove'] || 'Удалить из избранного'}">×</button>
            <img src="${favorite.image}" alt="${favorite.name}" class="favorite-image">
            <div class="favorite-info">
                <div class="favorite-category">${getTranslatedCategory(favorite.category, lang)}</div>
                <h3 class="favorite-title">${favorite.name}</h3>
                <div class="favorite-price">${favorite.price} ${translations[lang]['favorites.currency'] || 'руб.'}</div>
                <div class="favorite-actions">
                    <button class="action-btn cart-btn" onclick="addToCartFromFavorites(${favorite.id})">
                        ${translations[lang]['favorites.addToCart'] || 'В корзину'}
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function getTranslatedCategory(category, lang) {
    const categoryTranslations = {
        'planting': translations[lang]['category.planting'] || 'Посадка',
        'care': translations[lang]['category.care'] || 'Уход',
        'design': translations[lang]['category.design'] || 'Дизайн',
        'maintenance': translations[lang]['category.maintenance'] || 'Обустройство'
    };
    
    return categoryTranslations[category] || category;
}

function removeFromFavorites(favoriteId) {
    const lang = localStorage.getItem('language') || 'ru';
    const confirmMessage = translations[lang]['favorites.removeConfirm'] || 'Вы уверены, что хотите удалить из избранного?';
    
    if (!confirm(confirmMessage)) return;
    
    fetch(`${API_URL}/favorites/${favoriteId}`, {
        method: 'DELETE'
    })
    .then(() => {
        loadFavorites();
        showNotification(translations[lang]['favorites.removed'] || 'Удалено из избранного', 'success');
    })
    .catch(error => {
        console.error('Ошибка удаления из избранного:', error);
        showNotification(translations[lang]['favorites.removeError'] || 'Ошибка при удалении', 'error');
    });
}

function addToCartFromFavorites(favoriteId) {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const lang = localStorage.getItem('language') || 'ru';
    
    if (!user.id) {
        showNotification(translations[lang]['favorites.loginRequired'] || 'Пожалуйста, войдите в систему', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    fetch(`${API_URL}/favorites/${favoriteId}`)
        .then(response => response.json())
        .then(favoriteItem => {
            fetch(`${API_URL}/cart?userId=${user.id}&productId=${favoriteItem.productId}`)
                .then(response => response.json())
                .then(cart => {
                    const existingItem = cart.find(item => item.productId == favoriteItem.productId);
                    
                    if (existingItem) {
                        fetch(`${API_URL}/cart/${existingItem.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                quantity: existingItem.quantity + 1
                            })
                        })
                        .then(() => {
                            showNotification(translations[lang]['favorites.quantityIncreased'] || 'Количество товара увеличено!', 'success');
                        })
                        .catch(error => {
                            console.error('Ошибка обновления корзины:', error);
                            showNotification(translations[lang]['favorites.cartError'] || 'Ошибка добавления в корзину', 'error');
                        });
                    } else {
                        const cartItem = {
                            ...favoriteItem,
                            productId: favoriteItem.productId,
                            userId: user.id,
                            quantity: 1
                        };

                        delete cartItem.id;
                        
                        fetch(`${API_URL}/cart`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(cartItem)
                        })
                        .then(() => {
                            showNotification(translations[lang]['favorites.addedToCart'] || 'Товар добавлен в корзину!', 'success');
                        })
                        .catch(error => {
                            console.error('Ошибка добавления в корзину:', error);
                            showNotification(translations[lang]['favorites.cartError'] || 'Ошибка добавления в корзину', 'error');
                        });
                    }
                })
                .catch(error => {
                    console.error('Ошибка загрузки корзины:', error);
                    showNotification(translations[lang]['favorites.cartError'] || 'Ошибка добавления в корзину', 'error');
                });
        })
        .catch(error => {
            console.error('Ошибка загрузки избранного:', error);
            showNotification(translations[lang]['favorites.loadError'] || 'Ошибка загрузки товара', 'error');
        });
}

function showNotification(message, type = 'success') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
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
        animation: slideIn 0.3s ease;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification {
            font-family: Arial, sans-serif;
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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