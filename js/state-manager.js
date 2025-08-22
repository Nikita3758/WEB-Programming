class StateManager {
    constructor() {
        this.services = [];
        this.filteredServices = [];
        this.favorites = [];
        this.cart = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.totalItems = 0;
        this.totalPages = 1;
        
        this.filters = {
            searchQuery: '',
            categories: [],
            priceRange: { min: 0, max: 1000 },
            minRating: 0,
            sortBy: 'id',
            sortOrder: 'asc'
        };
    }

    async initialize() {
        await this.loadInitialData();
        const priceRange = await ApiService.getPriceRange();
        this.filters.priceRange = priceRange;
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadServices(),
                this.loadFavorites(),
                this.loadCart()
            ]);
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    async loadServices() {
        try {
            const result = await ApiService.getServices({
                _page: this.currentPage,
                _limit: this.itemsPerPage
            });
            this.services = result.data;
            this.filteredServices = result.data;
            this.totalItems = result.totalCount;
            this.totalPages = Math.ceil(result.totalCount / this.itemsPerPage);
        } catch (error) {
            console.error('Failed to load services:', error);
        }
    }

    async loadFavorites() {
        this.favorites = await ApiService.getFavorites();
    }

    async loadCart() {
        this.cart = await ApiService.getCart();
    }

    async applyFilters() {
        try {
            const result = await ApiService.applyComplexFilters({
                searchQuery: this.filters.searchQuery,
                categories: this.filters.categories,
                priceRange: this.filters.priceRange,
                minRating: this.filters.minRating,
                sortBy: this.filters.sortBy,
                sortOrder: this.filters.sortOrder,
                page: this.currentPage,
                limit: this.itemsPerPage
            });

            this.filteredServices = result.data;
            this.totalItems = result.totalCount;
            this.totalPages = Math.ceil(result.totalCount / this.itemsPerPage);
            
            return result.data;
        } catch (error) {
            console.error('Failed to apply filters:', error);
            this.filteredServices = [];
            this.totalItems = 0;
            this.totalPages = 1;
            return [];
        }
    }

    async searchServices(query) {
        this.filters.searchQuery = query;
        this.currentPage = 1; 
        return this.applyFilters();
    }

    async filterByCategories(categories) {
        this.filters.categories = categories;
        this.currentPage = 1;
        return this.applyFilters();
    }

    async filterByPriceRange(min, max) {
        this.filters.priceRange = { min, max };
        this.currentPage = 1;
        return this.applyFilters();
    }

    async filterByRating(minRating) {
        this.filters.minRating = minRating;
        this.currentPage = 1;
        return this.applyFilters();
    }

    async sortServices(sortBy, order = 'asc') {
        this.filters.sortBy = sortBy;
        this.filters.sortOrder = order;
        this.currentPage = 1;
        return this.applyFilters();
    }

    async goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            return this.applyFilters();
        }
        return this.filteredServices;
    }

    async nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            return this.applyFilters();
        }
        return this.filteredServices;
    }

    async prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            return this.applyFilters();
        }
        return this.filteredServices;
    }

    async resetFilters() {
        const priceRange = await ApiService.getPriceRange();
        
        this.filters = {
            searchQuery: '',
            categories: [],
            priceRange: priceRange,
            minRating: 0,
            sortBy: 'id',
            sortOrder: 'asc'
        };
        this.currentPage = 1;
        return this.applyFilters();
    }

    async toggleFavorite(service) {
        const isFavorite = this.favorites.some(fav => fav.id === service.id);
        
        try {
            if (isFavorite) {
                await ApiService.removeFromFavorites(service.id);
                this.favorites = this.favorites.filter(fav => fav.id !== service.id);
            } else {
                const addedFavorite = await ApiService.addToFavorites(service);
                this.favorites.push(addedFavorite);
            }
            return this.favorites;
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            throw error;
        }
    }

    async addToCart(service, quantity = 1) {
        try {
            const existingItem = this.cart.find(item => item.id === service.id);
            
            if (existingItem) {
                const updatedItem = {
                    ...existingItem,
                    quantity: existingItem.quantity + quantity,
                    total: existingItem.price * (existingItem.quantity + quantity)
                };
                await ApiService.updateCartItem(existingItem.id, updatedItem);
                this.cart = this.cart.map(item => 
                    item.id === service.id ? updatedItem : item
                );
            } else {
                const newItem = await ApiService.addToCart(service, quantity);
                this.cart.push(newItem);
            }
            
            return this.cart;
        } catch (error) {
            console.error('Failed to add to cart:', error);
            throw error;
        }
    }

    getPaginationInfo() {
        return {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            totalItems: this.totalItems,
            itemsPerPage: this.itemsPerPage,
            startItem: (this.currentPage - 1) * this.itemsPerPage + 1,
            endItem: Math.min(this.currentPage * this.itemsPerPage, this.totalItems)
        };
    }

    getCartStats() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = this.cart.reduce((sum, item) => sum + item.total, 0);
        
        return {
            totalItems,
            totalValue: totalValue.toFixed(2),
            itemCount: this.cart.length
        };
    }
}