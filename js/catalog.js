const API_URL = 'http://localhost:3000';
let currentPage = 1;
const itemsPerPage = 9;
let currentFilters = {
    category: [],
    complexity: [],
    price: 20000,
    rating: 5,
    sort: 'name_asc',
    search: ''
};

document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadComplexityOptions();
    loadProducts();

    document.getElementById('searchInput').addEventListener('input', function(e) {
        currentFilters.search = e.target.value;
        currentPage = 1;
        loadProducts();
    });
    
    document.getElementById('priceRange').addEventListener('input', function(e) {
        currentFilters.price = parseInt(e.target.value);
        document.getElementById('priceValue').textContent = currentFilters.price + ' руб.';
        currentPage = 1;
        loadProducts();
    });
    
    document.getElementById('ratingRange').addEventListener('input', function(e) {
        currentFilters.rating = parseFloat(e.target.value);
        document.getElementById('ratingValue').textContent = currentFilters.rating.toFixed(1);
        currentPage = 1;
        loadProducts();
    });
    
    document.getElementById('sortSelect').addEventListener('change', function(e) {
        currentFilters.sort = e.target.value;
        currentPage = 1;
        loadProducts();
    });
});

function loadCategories() {
    fetch(`${API_URL}/products`)
        .then(response => response.json())
        .then(products => {
            const categories = [...new Set(products.map(p => p.category))];
            const container = document.getElementById('categoryFilters');
            
            categories.forEach(category => {
                const checkbox = document.createElement('div');
                checkbox.className = 'filter-checkbox';
                checkbox.innerHTML = `
                    <input type="checkbox" id="cat-${category}" value="${category}">
                    <label for="cat-${category}">${category}</label>
                `;
                container.appendChild(checkbox);
                
                checkbox.querySelector('input').addEventListener('change', function() {
                    if (this.checked) {
                        currentFilters.category.push(this.value);
                    } else {
                        currentFilters.category = currentFilters.category.filter(c => c !== this.value);
                    }
                    currentPage = 1;
                    loadProducts();
                });
            });
        });
}

function loadComplexityOptions() {
    fetch(`${API_URL}/products`)
        .then(response => response.json())
        .then(products => {
            const complexities = [...new Set(products.map(p => p.details?.complexity))].filter(Boolean);
            const container = document.getElementById('complexityFilters');
            
            complexities.forEach(complexity => {
                const checkbox = document.createElement('div');
                checkbox.className = 'filter-checkbox';
                checkbox.innerHTML = `
                    <input type="checkbox" id="comp-${complexity}" value="${complexity}">
                    <label for="comp-${complexity}">${complexity}</label>
                `;
                container.appendChild(checkbox);
                
                checkbox.querySelector('input').addEventListener('change', function() {
                    if (this.checked) {
                        currentFilters.complexity.push(this.value);
                    } else {
                        currentFilters.complexity = currentFilters.complexity.filter(c => c !== this.value);
                    }
                    currentPage = 1;
                    loadProducts();
                });
            });
        });
}

function loadProducts() {
    fetch(`${API_URL}/products`)
        .then(response => response.json())
        .then(allProducts => {
            let filteredProducts = [...allProducts];

            if (currentFilters.search) {
                const searchTerm = currentFilters.search.toLowerCase();
                filteredProducts = filteredProducts.filter(product => 
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm)
                );
            }

            if (currentFilters.category.length > 0) {
                filteredProducts = filteredProducts.filter(product =>
                    currentFilters.category.includes(product.category)
                );
            }

            if (currentFilters.complexity.length > 0) {
                filteredProducts = filteredProducts.filter(product =>
                    product.details?.complexity && 
                    currentFilters.complexity.includes(product.details.complexity)
                );
            }

            filteredProducts = filteredProducts.filter(product =>
                product.price <= currentFilters.price
            );

            filteredProducts = filteredProducts.filter(product =>
                product.rating <= currentFilters.rating
            );

            const [sortField, sortOrder] = currentFilters.sort.split('_');
            filteredProducts.sort((a, b) => {
                let valueA = a[sortField];
                let valueB = b[sortField];

                if (typeof valueA === 'string') {
                    valueA = valueA.toLowerCase();
                    valueB = valueB.toLowerCase();
                }
                
                if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
                if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });

            const totalCount = filteredProducts.length;
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
            
            console.log('Всего найдено:', totalCount, 'На странице:', paginatedProducts.length);

            displayProducts(paginatedProducts);
            setupPagination(totalCount);
        })
        .catch(error => {
            console.error('Ошибка загрузки продуктов:', error);
            document.getElementById('productsGrid').innerHTML = `
                <div class="no-results">
                    <h3>Произошла ошибка при загрузке данных</h3>
                    <p>Попробуйте перезагрузить страницу</p>
                </div>
            `;
        });
}

function displayProducts(products) {
    const container = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить параметры фильтрации</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(product.rating)) {
                stars += '★';
            } else if (i === Math.ceil(product.rating) && !Number.isInteger(product.rating)) {
                stars += '½';
            } else {
                stars += '☆';
            }
        }
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <div class="product-price">${product.price} руб.</div>
                    <div class="product-rating">
                        ${stars} <span>${product.rating}</span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="action-btn favorite-btn">В избранное</button>
                    <button class="action-btn cart-btn">В корзину</button>
                </div>
            </div>
        `;

        const favoriteBtn = card.querySelector('.favorite-btn');
        const cartBtn = card.querySelector('.cart-btn');
        
        favoriteBtn.addEventListener('click', () => {
            addToFavorites(product.id);
        });
        
        cartBtn.addEventListener('click', () => {
            addToCart(product.id);
        });
        
        container.appendChild(card);
    });
}

function setupPagination(totalCount) {
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const container = document.getElementById('pagination');
    
    container.innerHTML = '';
    
    if (totalPages <= 1) {
        return;
    }

    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '&laquo;';
        prevBtn.addEventListener('click', () => {
            currentPage--;
            loadProducts();
            window.scrollTo(0, 0);
        });
        container.appendChild(prevBtn);
    }

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            loadProducts();
            window.scrollTo(0, 0);
        });
        container.appendChild(pageBtn);
    }

    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = '&raquo;';
        nextBtn.addEventListener('click', () => {
            currentPage++;
            loadProducts();
            window.scrollTo(0, 0);
        });
        container.appendChild(nextBtn);
    }
}

function addToFavorites(productId) {
    fetch(`${API_URL}/favorites`)
        .then(response => response.json())
        .then(favorites => {
            if (favorites.some(item => item.productId == productId)) {
                alert('Этот товар уже в избранном!');
                return;
            }

            fetch(`${API_URL}/products/${productId}`)
                .then(response => response.json())
                .then(product => {
                    const favoriteItem = {
                        ...product,
                        productId: product.id 
                    };

                    delete favoriteItem.id;
                    
                    fetch(`${API_URL}/favorites`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(favoriteItem)
                    })
                    .then(() => {
                        alert('Товар добавлен в избранное!');
                    });
                });
        });
}

function addToCart(productId) {
    fetch(`${API_URL}/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            fetch(`${API_URL}/cart`)
                .then(response => response.json())
                .then(cart => {
                    const existingItem = cart.find(item => item.productId == productId);
                    
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
                            ...product,
                            productId: product.id, 
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