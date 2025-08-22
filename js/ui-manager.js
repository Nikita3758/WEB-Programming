class UIManager {
    constructor(stateManager) {
        this.state = stateManager;
        this.searchTimeout = null;
        this.priceRange = { min: 0, max: 1000 };
    }

    async initializeUI() {
        await this.loadPriceRange();
        this.createFilterUI();
        this.setupEventListeners();
        this.setupMobileMenu();
    }

    async loadPriceRange() {
        try {
            this.priceRange = await ApiService.getPriceRange();
            this.state.filters.priceRange = this.priceRange;
            this.initializePriceSlider();
        } catch (error) {
            console.warn('Failed to load price range:', error);
            this.priceRange = { min: 0, max: 1000 };
        }
    }

    createFilterUI() {
        this.createSearchSection();
        this.createCategoryFilters();
        this.createPriceFilter();
        this.createRatingFilter();
        this.createSortFilter();
        this.createFilterButtons();
    }

    createSearchSection() {
        const searchSection = document.querySelector('.search-section');
        if (!searchSection) return;

        searchSection.innerHTML = `
            <div class="search-input-container">
                <input type="text" id="search-input" class="search-input" 
                       placeholder="Search by name, description, category or tags..." 
                       value="${this.state.filters.searchQuery}">
                <span class="search-icon">🔍</span>
            </div>
        `;
    }

    async createCategoryFilters() {
        const categoriesSection = document.querySelector('.categories-section');
        if (!categoriesSection) return;

        try {
            const categories = await ApiService.getAllCategories();
            
            categoriesSection.innerHTML = `
                <label class="filter-label">Categories:</label>
                <div class="categories-grid">
                    ${categories.map(category => `
                        <div class="category-item">
                            <input type="checkbox" id="category-${category}" 
                                   class="category-checkbox" value="${category}"
                                   ${this.state.filters.categories.includes(category) ? 'checked' : ''}>
                            <label for="category-${category}" class="category-label">
                                ${category}
                            </label>
                        </div>
                    `).join('')}
                </div>
            `;

            document.querySelectorAll('.category-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.handleCategoryChange(e.target.value, e.target.checked);
                });
            });

        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    createPriceFilter() {
        const priceSection = document.querySelector('.price-filter-section');
        if (!priceSection) return;

        priceSection.innerHTML = `
            <label class="filter-label">Price Range: $${this.state.filters.priceRange.min} - $${this.state.filters.priceRange.max}</label>
            <div class="price-slider-container">
                <input type="range" id="price-min" class="price-slider" min="${this.priceRange.min}" 
                       max="${this.priceRange.max}" value="${this.state.filters.priceRange.min}">
                <input type="range" id="price-max" class="price-slider" min="${this.priceRange.min}" 
                       max="${this.priceRange.max}" value="${this.state.filters.priceRange.max}">
            </div>
            <div class="price-values">
                <span>$${this.state.filters.priceRange.min}</span>
                <span>$${this.state.filters.priceRange.max}</span>
            </div>
        `;

        this.initializePriceSliders();
    }

    createRatingFilter() {
        const ratingSection = document.querySelector('.rating-filter-section');
        if (!ratingSection) return;

        ratingSection.innerHTML = `
            <label class="filter-label">Minimum Rating: ${this.state.filters.minRating}+ ⭐</label>
            <div class="rating-slider-container">
                <input type="range" id="rating-slider" class="rating-slider" min="0" max="5" 
                       step="0.1" value="${this.state.filters.minRating}">
                <div class="rating-values">
                    <span>0</span>
                    <span>5</span>
                </div>
            </div>
        `;

        document.getElementById('rating-slider').addEventListener('input', (e) => {
            this.handleRatingChange(parseFloat(e.target.value));
        });
    }

    createSortFilter() {
        const sortSection = document.querySelector('.sort-section');
        if (!sortSection) return;

        const sortOptions = [
            { value: 'id', text: 'Default' },
            { value: 'price_asc', text: 'Price: Low to High' },
            { value: 'price_desc', text: 'Price: High to Low' },
            { value: 'rating_desc', text: 'Rating: Highest First' },
            { value: 'name_asc', text: 'Name: A to Z' },
            { value: 'name_desc', text: 'Name: Z to A' },
            { value: 'popularity_desc', text: 'Popularity' }
        ];

        sortSection.innerHTML = `
            <label class="filter-label">Sort By:</label>
            <select id="sort-select" class="filter-select">
                ${sortOptions.map(option => `
                    <option value="${option.value}" ${this.getSortOptionSelected(option.value)}>
                        ${option.text}
                    </option>
                `).join('')}
            </select>
        `;
    }

    createFilterButtons() {
        const buttonsContainer = document.querySelector('.filter-buttons');
        if (!buttonsContainer) return;

        buttonsContainer.innerHTML = `
            <button class="filter-button apply-filters" onclick="uiManager.applyFilters()">
                Apply Filters
            </button>
            <button class="filter-button reset" onclick="uiManager.resetFilters()">
                Reset All
            </button>
        `;
    }

    async generateServiceCards(services) {
        const catalogGrid = document.getElementById('catalog-grid');
        if (!catalogGrid) return;

        catalogGrid.innerHTML = '';

        if (services.length === 0) {
            catalogGrid.innerHTML = this.createNoResultsTemplate();
            return;
        }

        const favoritesMap = new Map();
        this.state.favorites.forEach(fav => {
            favoritesMap.set(fav.id, true);
        });

        for (const service of services) {
            const card = this.createServiceCard(service, favoritesMap.has(service.id));
            catalogGrid.appendChild(card);
        }
    }

    createServiceCard(service, isFavorite) {
        const card = document.createElement('div');
        card.className = 'service-card';
        
        card.innerHTML = `
            <img src="${service.image}" alt="${service.title}" class="service-image">
            <div class="service-content">
                <div class="service-category">${service.category}</div>
                <h3 class="service-title">${service.title}</h3>
                <p class="service-description">${service.description}</p>
                
                <div class="service-details">
                    <span class="service-price">$${service.price}</span>
                    <span class="service-duration">${service.duration}</span>
                    <span class="service-rating">⭐ ${service.rating}/5</span>
                </div>
                
                <div class="service-tags">
                    ${service.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
                
                <div class="service-actions">
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="uiManager.toggleFavorite(${service.id})">
                        ♥ ${isFavorite ? 'Added' : 'Add to Favorites'}
                    </button>
                    <button class="add-to-cart-btn" onclick="uiManager.addToCart(${service.id})">
                        🛒 Add to Cart
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    createNoResultsTemplate() {
        return `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No services found</h3>
                <p>Try adjusting your search criteria or filters.</p>
                <button class="service-button" onclick="uiManager.resetFilters()">
                    Reset All Filters
                </button>
            </div>
        `;
    }

    updatePagination() {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        const paginationInfo = this.state.getPaginationInfo();

        if (paginationInfo.totalPages <= 1) {
            paginationContainer.innerHTML = `
                <div class="pagination-info">
                    Showing all ${paginationInfo.totalItems} items
                </div>
            `;
            return;
        }

        paginationContainer.innerHTML = `
            <div class="pagination-info">
                Showing ${paginationInfo.startItem}-${paginationInfo.endItem} of ${paginationInfo.totalItems} items
            </div>
            <div class="pagination-controls">
                <button class="pagination-btn" onclick="uiManager.prevPage()" 
                        ${paginationInfo.currentPage === 1 ? 'disabled' : ''}>
                    ← Previous
                </button>
                
                <div class="pagination-numbers">
                    ${this.generatePageNumbers(paginationInfo.currentPage, paginationInfo.totalPages)}
                </div>
                
                <button class="pagination-btn" onclick="uiManager.nextPage()" 
                        ${paginationInfo.currentPage === paginationInfo.totalPages ? 'disabled' : ''}>
                    Next →
                </button>
            </div>
        `;
    }

    generatePageNumbers(currentPage, totalPages) {
        let pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisible - 1);
            
            if (end - start + 1 < maxVisible) {
                start = end - maxVisible + 1;
            }
            
            if (start > 1) pages.push(1, '...');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages) pages.push('...', totalPages);
        }
        
        return pages.map(page => 
            page === '...' ? 
            `<span class="pagination-dots">...</span>` :
            `<button class="pagination-number ${page === currentPage ? 'active' : ''}" 
                    onclick="uiManager.goToPage(${page})">${page}</button>`
        ).join('');
    }

    setupEventListeners() {
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.handleSortChange(e.target.value);
        });
    }

    initializePriceSliders() {
        const minSlider = document.getElementById('price-min');
        const maxSlider = document.getElementById('price-max');
        
        minSlider.addEventListener('input', () => {
            if (parseInt(minSlider.value) > parseInt(maxSlider.value)) {
                minSlider.value = maxSlider.value;
            }
            this.updatePriceDisplay();
        });
        
        maxSlider.addEventListener('input', () => {
            if (parseInt(maxSlider.value) < parseInt(minSlider.value)) {
                maxSlider.value = minSlider.value;
            }
            this.updatePriceDisplay();
        });
    }

    async handleSearch(query) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(async () => {
            await this.state.searchServices(query);
            await this.updateUI();
        }, 500);
    }

    async handleCategoryChange(category, isChecked) {
        let categories = [...this.state.filters.categories];
        
        if (isChecked) {
            categories.push(category);
        } else {
            categories = categories.filter(c => c !== category);
        }
        
        await this.state.filterByCategories(categories);
        await this.updateUI();
    }

    async handlePriceChange() {
        const min = parseInt(document.getElementById('price-min').value);
        const max = parseInt(document.getElementById('price-max').value);
        await this.state.filterByPriceRange(min, max);
        await this.updateUI();
    }

    async handleRatingChange(rating) {
        await this.state.filterByRating(rating);
        await this.updateUI();
    }

    async handleSortChange(sortValue) {
        const [sortBy, order] = sortValue.split('_');
        await this.state.sortServices(sortBy, order || 'asc');
        await this.updateUI();
    }

    async applyFilters() {
        await this.updateFiltersFromUI();
        await this.state.applyFilters();
        await this.updateUI();
    }

        async updateFiltersFromUI() {
        const minSlider = document.getElementById('price-min');
        const maxSlider = document.getElementById('price-max');
        if (minSlider && maxSlider) {
            this.state.filters.priceRange = {
                min: parseInt(minSlider.value),
                max: parseInt(maxSlider.value)
            };
        }

        const ratingSlider = document.getElementById('rating-slider');
        if (ratingSlider) {
            this.state.filters.minRating = parseFloat(ratingSlider.value);
        }

        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            const [sortBy, order] = sortSelect.value.split('_');
            this.state.filters.sortBy = sortBy;
            this.state.filters.sortOrder = order || 'asc';
        }
    }

    async resetFilters() {
        await this.state.resetFilters();
        await this.updateUI();
        await this.loadPriceRange();
        this.createFilterUI();
    }

    async goToPage(page) {
        await this.state.goToPage(page);
        await this.updateUI();
    }

    async nextPage() {
        await this.state.nextPage();
        await this.updateUI();
    }

    async prevPage() {
        await this.state.prevPage();
        await this.updateUI();
    }

    async toggleFavorite(serviceId) {
        const service = this.state.services.find(s => s.id === serviceId);
        if (service) {
            await this.state.toggleFavorite(service);
            await this.updateUI();
        }
    }

    async addToCart(serviceId) {
        const service = this.state.services.find(s => s.id === serviceId);
        if (service) {
            await this.state.addToCart(service);
            this.showNotification('Service added to cart!');
            this.updateCartUI();
        }
    }

    async updateUI() {
        await this.generateServiceCards(this.state.filteredServices);
        this.updateFilterInfo();
        this.updatePagination();
        this.updateStats();
    }

    updateFilterInfo() {
        const filterInfo = document.getElementById('filter-info');
        if (!filterInfo) return;

        const info = [];
        
        if (this.state.filters.searchQuery) {
            info.push(`Search: "${this.state.filters.searchQuery}"`);
        }
        
        if (this.state.filters.categories.length > 0) {
            info.push(`Categories: ${this.state.filters.categories.join(', ')}`);
        }
        
        if (this.state.filters.priceRange.min > this.priceRange.min || 
            this.state.filters.priceRange.max < this.priceRange.max) {
            info.push(`Price: $${this.state.filters.priceRange.min}-$${this.state.filters.priceRange.max}`);
        }
        
        if (this.state.filters.minRating > 0) {
            info.push(`Rating: ${this.state.filters.minRating}+ ⭐`);
        }
        
        if (this.state.filters.sortBy !== 'id') {
            info.push(`Sorted by: ${this.state.filters.sortBy} ${this.state.filters.sortOrder}`);
        }

        filterInfo.innerHTML = info.length > 0 ? 
            `<strong>Active filters:</strong> ${info.join(' • ')}` : 
            `<strong>Showing all services</strong>`;
    }

    updateStats() {
        const statsContainer = document.getElementById('stats-container');
        if (!statsContainer) return;

        const paginationInfo = this.state.getPaginationInfo();
        const cartStats = this.state.getCartStats();

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <h3>Displaying</h3>
                    <p>${paginationInfo.totalItems} total services</p>
                    <p>Page ${paginationInfo.currentPage} of ${paginationInfo.totalPages}</p>
                </div>
                <div class="stat-item">
                    <h3>🛒 Cart</h3>
                    <p>${cartStats.totalItems} items</p>
                    <p>Total: $${cartStats.totalValue}</p>
                </div>
                <div class="stat-item">
                    <h3>♥ Favorites</h3>
                    <p>${this.state.favorites.length} items</p>
                </div>
            </div>
        `;
    }

    updateCartUI() {
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            const cartStats = this.state.getCartStats();
            cartIcon.setAttribute('data-count', cartStats.totalItems);
        }
    }

    getSortOptionSelected(value) {
        const currentSort = `${this.state.filters.sortBy}_${this.state.filters.sortOrder}`;
        return currentSort === value ? 'selected' : '';
    }

    updatePriceDisplay() {
        const min = document.getElementById('price-min').value;
        const max = document.getElementById('price-max').value;
        document.querySelector('.price-filter-section .filter-label').textContent = 
            `Price Range: $${min} - $${max}`;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    setupMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('.nav');
        
        if (menuToggle && nav) {
            menuToggle.addEventListener('click', () => {
                nav.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });
        }

        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const nav = document.querySelector('.nav');
                const menuToggle = document.querySelector('.mobile-menu-toggle');
                
                if (nav) nav.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
            });
        });
    }
}