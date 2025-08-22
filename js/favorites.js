const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    loadFavorites();
});

function loadFavorites() {
    fetch(`${API_URL}/favorites`)
        .then(response => response.json())
        .then(favorites => {
            displayFavorites(favorites);
        })
        .catch(error => {
            console.error('Ошибка загрузки избранного:', error);
        });
}

function displayFavorites(favorites) {
    const container = document.getElementById('favoritesGrid');
    
    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-favorites">
                <h3>В избранном пока ничего нет</h3>
                <p>Добавьте услуги, которые вам понравились</p>
                <a href="catalog.html" class="back-to-catalog">Перейти в каталог</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    favorites.forEach(favorite => {
        const card = document.createElement('div');
        card.className = 'favorite-card';

        card.innerHTML = `
            <button class="remove-btn" onclick="removeFromFavorites('${favorite.id}')">×</button>
            <img src="${favorite.image}" alt="${favorite.name.replace(/"/g, '&quot;')}" class="favorite-image">
            <div class="favorite-info">
                <div class="favorite-category">${favorite.category}</div>
                <h3 class="favorite-title">${favorite.name}</h3>
                <div class="favorite-price">${favorite.price} руб.</div>
                <div class="favorite-actions">
                    <button class="action-btn cart-btn" onclick="addToCartFromFavorites('${favorite.id}')">В корзину</button>
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
    })
    .catch(error => {
        console.error('Ошибка при удалении из избранного:', error);
        alert('Не удалось удалить товар из избранного');
    });
}

function addToCartFromFavorites(favoriteId) {
    fetch(`${API_URL}/favorites/${favoriteId}`)
        .then(response => response.json())
        .then(favoriteItem => {
            fetch(`${API_URL}/cart`)
                .then(response => response.json())
                .then(cart => {
                    const productId = favoriteItem.productId || favoriteItem.id;
                    const existingItem = cart.find(item => item.productId === productId);
                    
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
                            productId: favoriteItem.productId || favoriteItem.id,
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