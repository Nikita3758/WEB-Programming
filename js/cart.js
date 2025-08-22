const API_URL = 'http://localhost:3000';

// Загрузка корзины при открытии страницы
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    
    // Обработчик для кнопки оформления заказа
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
});

// Загрузка корзины
function loadCart() {
    fetch(`${API_URL}/cart`)
        .then(response => response.json())
        .then(cart => {
            displayCart(cart);
            updateSummary(cart);
        })
        .catch(error => {
            console.error('Ошибка загрузки корзины:', error);
        });
}

// Отображение корзины
function displayCart(cart) {
    const container = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <h3>Ваша корзина пуста</h3>
                <p>Добавьте услуги из каталога</p>
                <a href="catalog.html" class="back-to-catalog">Перейти в каталог</a>
            </div>
        `;
        document.getElementById('cartSummary').style.display = 'none';
        document.getElementById('checkoutBtn').style.display = 'none';
        return;
    }
    
    document.getElementById('cartSummary').style.display = 'block';
    document.getElementById('checkoutBtn').style.display = 'block';
    
    container.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.id = item.id;
        
        // ПРАВИЛЬНОЕ формирование HTML с вызовом функции
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.name}</h3>
                <div class="cart-item-category">${item.category}</div>
                <div class="cart-item-price">${item.price} руб. × ${item.quantity} = ${item.price * item.quantity} руб.</div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="changeQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="changeQuantity('${item.id}', parseInt(this.value))">
                        <button class="quantity-btn" onclick="changeQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')">Удалить</button>
                </div>
            </div>
        `;
        
        container.appendChild(cartItem);
    });
}

// Обновление итоговой суммы
function updateSummary(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('subtotal').textContent = subtotal + ' руб.';
    document.getElementById('total').textContent = subtotal + ' руб.';
}

// Изменение количества товара
function changeQuantity(productId, newQuantity) {
    if (newQuantity < 1) newQuantity = 1;
    
    fetch(`${API_URL}/cart/${productId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            quantity: newQuantity
        })
    })
    .then(() => {
        // Перезагружаем корзину
        loadCart();
    });
}

// Изменение количества товара
function changeQuantity(cartItemId, newQuantity) {
    if (newQuantity < 1) newQuantity = 1;
    
    fetch(`${API_URL}/cart/${cartItemId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            quantity: newQuantity
        })
    })
    .then(() => {
        // Перезагружаем корзину
        loadCart();
    });
}

// Удаление из корзины (глобальная функция)
function removeFromCart(cartItemId) {
    fetch(`${API_URL}/cart/${cartItemId}`, {
        method: 'DELETE'
    })
    .then(() => {
        // Перезагружаем корзину
        loadCart();
    });
}

// Оформление заказа
function checkout() {
    fetch(`${API_URL}/cart`)
        .then(response => response.json())
        .then(cart => {
            if (cart.length === 0) {
                alert('Корзина пуста!');
                return;
            }
            
            // Очищаем корзину
            cart.forEach(item => {
                fetch(`${API_URL}/cart/${item.id}`, {
                    method: 'DELETE'
                });
            });
            
            // Показываем сообщение об успешном заказе
            alert('Заказ успешно оформлен! Спасибо за покупку!');
            
            // Перезагружаем корзину
            loadCart();
        });
}