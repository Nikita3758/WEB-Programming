class UIManager {
    constructor(stateManager) {
        this.state = stateManager;
        this.searchTimeout = null;
    }

    initializeUI() {
        this.createFilterButtons();
        this.createCategoriesFilter();
        this.setupEventListeners();
        this.setupMobileMenu();
    }

    createFilterButtons() {
        const buttonsContainer = document.querySelector('.filter-buttons');
        if (!buttonsContainer) return;

        const filters = [
            { type: 'all', text: 'All Services' },
            { type: 'filter', text: 'Price > $200' },
            { type: 'map', text: '10% Discount' },
            { type: 'find', text: 'Most Popular' },
            { type: 'some', text: 'Under $150' },
            { type: 'every', text: 'Rating > 4.5' },
            { type: 'reduce', text: 'Best Value' },
            { type: 'slice', text: 'First 5' }
        ];

        buttonsContainer.innerHTML = '';

        filters.forEach(filter => {
            const button = document.createElement('button');
            button.className = 'filter-button';
            button.textContent = filter.text;
            button.dataset.filter = filter.type;
            button.addEventListener('click', () => this.handleFilterButtonClick(filter.type));
            buttonsContainer.appendChild(button);
        });

        const resetButton = document.createElement('button');
        resetButton.className = 'filter-button reset';
        resetButton.textContent = 'Reset All';
        resetButton.addEventListener('click', () => this.handleResetClick());
        buttonsContainer.appendChild(resetButton);

        this.updateActiveButton();
    }

    createCategoriesFilter() {
        const categoriesContainer = document.querySelector('.categories-grid');
        if (!categoriesContainer) return;

        categoriesContainer.innerHTML = '';

        this.state.allCategories.forEach(category => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
                <input type="checkbox" id="category-${category}" class="category-checkbox" 
                       value="${category}">
                <label for="category-${category}" class="category-label">${category}</label>
            `;
            
            const checkbox = wrapper.querySelector('input');
            checkbox.checked = this.state.selectedCategories.includes(category);
            checkbox.addEventListener('change', () => this.handleCategoryChange(category));
            
            categoriesContainer.appendChild(wrapper);
        });
    }

    async generateServiceCards(servicesArray) {
        const catalogGrid = document.getElementById('catalog-grid');
        if (!catalogGrid) return;

        catalogGrid.innerHTML = '';

        if (servicesArray.length === 0) {
            catalogGrid.innerHTML = this.createNoResultsTemplate();
            return;
        }

        for (const service of servicesArray) {
            const card = this.createServiceCard(service);
            catalogGrid.appendChild(card);
        }
    }

    createServiceCard(service) {
        const card = document.createElement('div');
        card.className = 'service-card';
        
        const isFavorite = this.state.favorites.some(fav => fav.id === service.id);
        const priceDisplay = service.hasDiscount ? 
            `$${service.price.toFixed(2)} <small style="text-decoration: line-through; color: #999;">$${service.originalPrice}</small>` :
            `$${service.price}`;

        card.innerHTML = `
            <img src="${service.image}" alt="${service.title}" class="service-image">
            <div class="service-content">
                <div class="service-category">${service.category}</div>
                <h3 class="service-title">${service.title}</h3>
                <p class="service-description">${service.description}</p>
                <div class="service-details">
                    <span class="service-price">${priceDisplay}</span>
                    <span class="service-duration">${service.duration}</span>
                    <span class="service-rating">⭐ ${service.rating}/5</span>
                </div>
                <div class="service-details">
                    <span>Popularity: ${service.popularity}%</span>
                    <div class="service-actions">
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="uiManager.handleFavoriteClick(${service.id})">
                            ♥
                        </button>
                        <button class="service-button" onclick="uiManager.handleAddToCart(${service.id})">
                            Add to Cart
                        </button>
                    </div>
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
                <button class="service-button" onclick="uiManager.handleResetClick()">Reset All Filters</button>
            </div>
        `;
    }

    updateFilterInfo() {
        const filterInfo = document.getElementById('filter-info');
        if (!filterInfo) return;

        let infoText = '';

        if (this.state.searchQuery) {
            infoText += `Search: "${this.state.searchQuery}" • `;
        }

        if (this.state.selectedCategories.length > 0) {
            infoText += `Categories: ${this.state.selectedCategories.join(', ')} • `;
        }

        if (this.state.currentFilter !== 'all') {
            const filterNames = {
                'filter': 'Price > $200',
                'map': '10% Discount',
                'find': 'Most Popular',
                'some': 'Under $150',
                'every': 'Rating > 4.5',
                'reduce': 'Best Value',
                'slice': 'First 5'
            };
            infoText += `Filter: ${filterNames[this.state.currentFilter]} • `;
        }

        if (this.state.sortCriteria !== 'default') {
            const sortNames = {
                'priceAsc': 'Price ↑',
                'priceDesc': 'Price ↓',
                'rating': 'Rating',
                'nameAsc': 'Name A-Z',
                'nameDesc': 'Name Z-A',
                'popularity': 'Popularity'
            };
            infoText += `Sort: ${sortNames[this.state.sortCriteria]} • `;
        }

        infoText = infoText.replace(/ • $/, '');

        filterInfo.innerHTML = infoText ? `
            <strong>Active filters:</strong> ${infoText} | 
            <strong>Results:</strong> ${this.state.filteredServices.length} services
        ` : `<strong>Showing all</strong> ${this.state.filteredServices.length} services`;
    }

    updateStats() {
        const statsContainer = document.getElementById('stats-container');
        if (!statsContainer) return;

        const stats = this.state.getStats();
        if (!stats) {
            statsContainer.innerHTML = '';
            return;
        }

        statsContainer.innerHTML = `
            <h3>📊 Current Selection Statistics</h3>
            <p>Total value: $${stats.totalValue.toFixed(2)}</p>
            <p>Average price: $${stats.avgPrice.toFixed(2)}</p>
            <p>Price range: $${stats.minPrice} - $${stats.maxPrice}</p>
            <p>Average rating: ${stats.avgRating.toFixed(2)}/5 ⭐</p>
            <p>Number of services: ${stats.count}</p>
        `;
    }

    updateActiveButton() {
        const buttons = document.querySelectorAll('.filter-button');
        buttons.forEach(button => {
            if (button.dataset.filter === this.state.currentFilter) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    setupEventListeners() {
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.handleSortChange(e.target.value);
        });
    }

    async handleSearch(query) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(async () => {
            const services = await this.state.handleSearch(query);
            await this.generateServiceCards(services);
            this.updateFilterInfo();
            this.updateStats();
        }, 300);
    }

    async handleSortChange(criteria) {
        const services = await this.state.handleSortChange(criteria);
        await this.generateServiceCards(services);
        this.updateFilterInfo();
        this.updateStats();
    }

    async handleCategoryChange(category) {
        const services = await this.state.handleCategoryChange(category);
        await this.generateServiceCards(services);
        this.updateFilterInfo();
        this.updateStats();
        this.createCategoriesFilter(); 
    }

    async handleFilterButtonClick(filterType) {
        const services = await this.state.handleArrayFilter(filterType);
        await this.generateServiceCards(services);
        this.updateFilterInfo();
        this.updateStats();
        this.updateActiveButton();
    }

    async handleResetClick() {
        const services = await this.state.resetFilters();

        document.getElementById('search-input').value = '';
        document.getElementById('sort-select').value = 'default';
        
        await this.generateServiceCards(services);
        this.updateFilterInfo();
        this.updateStats();
        this.updateActiveButton();
        this.createCategoriesFilter();
    }

    async handleFavoriteClick(serviceId) {
        const service = this.state.services.find(s => s.id === serviceId);
        if (service) {
            await this.state.toggleFavorite(service);
            await this.generateServiceCards(this.state.filteredServices);
        }
    }

    async handleAddToCart(serviceId) {
        const service = this.state.services.find(s => s.id === serviceId);
        if (service) {
            await this.state.addToCart(service);
            this.showNotification('Service added to cart!');
        }
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
}