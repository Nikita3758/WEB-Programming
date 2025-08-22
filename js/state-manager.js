class StateManager {
    constructor() {
        this.services = [];
        this.filteredServices = [];
        this.favorites = [];
        this.cart = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.sortCriteria = 'default';
        this.selectedCategories = [];
        this.allCategories = [];
    }

    async initialize() {
        await this.loadServices();
        await this.loadFavorites();
        await this.loadCart();
        this.allCategories = this.getAllCategories();
    }

    async loadServices() {
        this.services = await ApiService.getServices();
        this.filteredServices = [...this.services];
    }

    async loadFavorites() {
        this.favorites = await ApiService.getFavorites();
    }

    async loadCart() {
        this.cart = await ApiService.getCart();
    }

    getAllCategories() {
        const categories = new Set();
        this.services.forEach(service => categories.add(service.category));
        return Array.from(categories).sort();
    }

    async applyFilters() {
        let result = [...this.services];

        if (this.searchQuery) {
            result = await ApiService.searchServices(this.searchQuery);
        }

        if (this.selectedCategories.length > 0) {
            result = result.filter(service => 
                this.selectedCategories.includes(service.category)
            );
        }

        switch(this.currentFilter) {
            case 'filter':
                result = result.filter(service => service.price > 200);
                break;
            case 'map':
                result = result.map(service => ({
                    ...service,
                    price: service.price * 0.9,
                    originalPrice: service.price,
                    hasDiscount: true
                }));
                break;
            case 'find':
                const mostPopular = result.find(service => 
                    service.popularity === Math.max(...result.map(s => s.popularity))
                );
                result = mostPopular ? [mostPopular] : [];
                break;
            case 'some':
                const hasCheap = result.some(service => service.price < 150);
                result = hasCheap ? result.filter(service => service.price < 150) : [];
                break;
            case 'every':
                const allHighRated = result.every(service => service.rating > 4.5);
                result = allHighRated ? result : result.filter(service => service.rating > 4.5);
                break;
            case 'reduce':
                if (result.length > 0) {
                    const bestValue = result.reduce((best, current) => {
                        const valueRatio = current.rating / (current.price / 100);
                        const bestValueRatio = best.rating / (best.price / 100);
                        return valueRatio > bestValueRatio ? current : best;
                    });
                    result = [bestValue];
                }
                break;
            case 'slice':
                result = result.slice(0, 5);
                break;
        }

        this.filteredServices = await ApiService.sortServices(this.sortCriteria, result);
        return this.filteredServices;
    }

    handleSearch(query) {
        this.searchQuery = query.trim();
        return this.applyFilters();
    }

    handleSortChange(criteria) {
        this.sortCriteria = criteria;
        return this.applyFilters();
    }

    handleCategoryChange(category) {
        const index = this.selectedCategories.indexOf(category);
        if (index === -1) {
            this.selectedCategories.push(category);
        } else {
            this.selectedCategories.splice(index, 1);
        }
        return this.applyFilters();
    }

    handleArrayFilter(filterType) {
        this.currentFilter = filterType;
        return this.applyFilters();
    }

    resetFilters() {
        this.searchQuery = '';
        this.selectedCategories = [];
        this.currentFilter = 'all';
        this.sortCriteria = 'default';
        return this.applyFilters();
    }

    async toggleFavorite(service) {
        const isFavorite = this.favorites.some(fav => fav.id === service.id);
        
        if (isFavorite) {
            await ApiService.removeFromFavorites(service.id);
            this.favorites = this.favorites.filter(fav => fav.id !== service.id);
        } else {
            const addedFavorite = await ApiService.addToFavorites(service);
            this.favorites.push(addedFavorite);
        }
        
        return this.favorites;
    }

    async addToCart(service, quantity = 1) {
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
    }

    async updateCartQuantity(itemId, newQuantity) {
        if (newQuantity <= 0) {
            return this.removeFromCart(itemId);
        }

        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            const updatedItem = {
                ...item,
                quantity: newQuantity,
                total: item.price * newQuantity
            };
            await ApiService.updateCartItem(itemId, updatedItem);
            this.cart = this.cart.map(item => 
                item.id === itemId ? updatedItem : item
            );
        }
        return this.cart;
    }

    async removeFromCart(itemId) {
        await ApiService.removeFromCart(itemId);
        this.cart = this.cart.filter(item => item.id !== itemId);
        return this.cart;
    }

    async clearCart() {
        for (const item of this.cart) {
            await ApiService.removeFromCart(item.id);
        }
        this.cart = [];
        return this.cart;
    }

    getStats() {
        if (this.filteredServices.length === 0) return null;

        const totalValue = this.filteredServices.reduce((sum, service) => sum + service.price, 0);
        const avgRating = this.filteredServices.reduce((sum, service) => sum + service.rating, 0) / this.filteredServices.length;
        const avgPrice = totalValue / this.filteredServices.length;
        const maxPrice = Math.max(...this.filteredServices.map(service => service.price));
        const minPrice = Math.min(...this.filteredServices.map(service => service.price));

        return {
            totalValue,
            avgRating,
            avgPrice,
            maxPrice,
            minPrice,
            count: this.filteredServices.length
        };
    }
}