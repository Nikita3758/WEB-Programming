const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    loadFavorites();
});

function loadFavorites() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (!user.id) {
        showEmptyFavorites('Пожалуйста, войдите в систему чтобы просмотреть избранное');
        return;
    }

    fetch(`${API_URL}/favorites?userId=${user.id}`)
        .then(response => response.json())
        .then(favorites => {
            if (favorites.length === 0) {
                showEmptyFavorites('В избранном пока ничего нет');
            } else {
                displayFavorites(favorites);
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки избранного:', error);
            showEmptyFavorites('Произошла ошибка при загрузке избранного');
        });
}

function showEmptyFavorites(message) {
    const container = document.getElementById('favoritesGrid');
    container.innerHTML = `
        <div class="empty-favorites">
            <h3>${message}</h3>
            <p>Добавьте услуги, которые вам понравились</p>
            <a href="catalog.html" class="back-to-catalog">Перейти в каталог</a>
        </div>
    `;
}

function displayFavorites(favorites) {
    const container = document.getElementById('favoritesGrid');
    
    container.innerHTML = '';
    
    favorites.forEach(favorite => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        
        card.innerHTML = `
            <button class="remove-btn" onclick="removeFromFavorites(${favorite.id})">×</button>
            <img src="${favorite.image}" alt="${favorite.name}" class="favorite-image">
            <div class="favorite-info">
                <div class="favorite-category">${favorite.category}</div>
                <h3 class="favorite-title">${favorite.name}</h3>
                <div class="favorite-price">${favorite.price} руб.</div>
                <div class="favorite-actions">
                    <button class="action-btn cart-btn" onclick="addToCartFromFavorites(${favorite.id})">В корзину</button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function removeFromFavorites(favoriteId) {
    fetch(`${API_URL}/favorites/${favoriteId}`, {
        method: 'DELETE'
    })
    .then(() => {
        loadFavorites();
    });
}

function addToCartFromFavorites(favoriteId) {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!user.id) {
        alert('Пожалуйста, войдите в систему');
        window.location.href = 'login.html';
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
                            alert('Количество товара увеличено!');
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
                            alert('Товар добавлен в корзину!');
                        });
                    }
                });
        });
}