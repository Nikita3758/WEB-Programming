const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
});

function loadCart() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (!user.id) {
        showEmptyCart();
        return;
    }

    fetch(`${API_URL}/cart?userId=${user.id}`)
        .then(response => response.json())
        .then(cart => {
            if (cart.length === 0) {
                showEmptyCart();
            } else {
                displayCart(cart);
                updateSummary(cart);
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки корзины:', error);
            showEmptyCart();
        });
}

function showEmptyCart() {
    const container = document.getElementById('cartItems');
    container.innerHTML = `
        <div class="empty-cart">
            <h3>Ваша корзина пуста</h3>
            <p>Добавьте услуги из каталога</p>
            <a href="catalog.html" class="back-to-catalog">Перейти в каталог</a>
        </div>
    `;
    document.getElementById('cartSummary').style.display = 'none';
    document.getElementById('checkoutBtn').style.display = 'none';
}

function displayCart(cart) {
    const container = document.getElementById('cartItems');
    
    document.getElementById('cartSummary').style.display = 'block';
    document.getElementById('checkoutBtn').style.display = 'block';
    
    container.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.id = item.id;

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

function updateSummary(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('subtotal').textContent = subtotal + ' руб.';
    document.getElementById('total').textContent = subtotal + ' руб.';
}

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
        loadCart();
    });
}

function removeFromCart(cartItemId) {
    fetch(`${API_URL}/cart/${cartItemId}`, {
        method: 'DELETE'
    })
    .then(() => {
        loadCart();
    });
}

function checkout() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!user.id) {
        alert('Пожалуйста, войдите в систему для оформления заказа');
        window.location.href = 'login.html';
        return;
    }

    fetch(`${API_URL}/cart?userId=${user.id}`)
        .then(response => response.json())
        .then(cart => {
            if (cart.length === 0) {
                alert('Корзина пуста!');
                return;
            }
            
            const order = {
                userId: parseInt(user.id), 
                products: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                orderDate: new Date().toISOString(),
                status: 'completed'
            };

            fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            })
            .then(() => {
                return Promise.all(cart.map(item => 
                    fetch(`${API_URL}/cart/${item.id}`, { method: 'DELETE' })
                ));
            })
            .then(() => {
                alert('Заказ успешно оформлен! Спасибо за покупку!');
                loadCart();
            });
        })
        .catch(error => {
            console.error('Ошибка оформления заказа:', error);
            alert('Произошла ошибка при оформлении заказа');
        });
}