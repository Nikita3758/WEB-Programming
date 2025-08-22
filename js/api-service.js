const API_BASE_URL = 'http://localhost:3001';

class ApiService {
    static async fetchData(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn(`API request failed: ${url}`, error);
            throw error;
        }
    }

    static async getServices(params = {}) {
        const queryString = this.buildQueryString(params);
        const response = await fetch(`${API_BASE_URL}/services${queryString}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const totalCount = response.headers.get('X-Total-Count');
        
        return {
            data,
            totalCount: totalCount ? parseInt(totalCount) : data.length
        };
    }

    static async searchServices(query, params = {}) {
        const allServices = await this.fetchData(`${API_BASE_URL}/services`);

        const searchTerm = query.toLowerCase();
        const filteredData = allServices.filter(service =>
            service.title.toLowerCase().includes(searchTerm) ||
            service.description.toLowerCase().includes(searchTerm) ||
            service.category.toLowerCase().includes(searchTerm) ||
            (service.tags && service.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );

        const page = params._page || 1;
        const limit = params._limit || 12;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        return {
            data: paginatedData,
            totalCount: filteredData.length
        };
    }

    static async filterByCategory(category, params = {}) {
        const queryParams = { ...params, category: category };
        const queryString = this.buildQueryString(queryParams);
        const response = await fetch(`${API_BASE_URL}/services${queryString}`);
        
        const data = await response.json();
        const totalCount = response.headers.get('X-Total-Count');
        
        return {
            data,
            totalCount: totalCount ? parseInt(totalCount) : data.length
        };
    }

    static async filterByPriceRange(min, max, params = {}) {
        const queryParams = { 
            ...params, 
            price_gte: min, 
            price_lte: max 
        };
        const queryString = this.buildQueryString(queryParams);
        const response = await fetch(`${API_BASE_URL}/services${queryString}`);
        
        const data = await response.json();
        const totalCount = response.headers.get('X-Total-Count');
        
        return {
            data,
            totalCount: totalCount ? parseInt(totalCount) : data.length
        };
    }

    static async filterByRating(minRating, params = {}) {
        const queryParams = { ...params, rating_gte: minRating };
        const queryString = this.buildQueryString(queryParams);
        const response = await fetch(`${API_BASE_URL}/services${queryString}`);
        
        const data = await response.json();
        const totalCount = response.headers.get('X-Total-Count');
        
        return {
            data,
            totalCount: totalCount ? parseInt(totalCount) : data.length
        };
    }

    static async sortServices(sortBy, order = 'asc', params = {}) {
        const queryParams = { ...params, _sort: sortBy, _order: order };
        const queryString = this.buildQueryString(queryParams);
        const response = await fetch(`${API_BASE_URL}/services${queryString}`);
        
        const data = await response.json();
        const totalCount = response.headers.get('X-Total-Count');
        
        return {
            data,
            totalCount: totalCount ? parseInt(totalCount) : data.length
        };
    }

    static async getPaginatedServices(page = 1, limit = 12, params = {}) {
        const queryParams = { 
            ...params, 
            _page: page, 
            _limit: limit 
        };
        const queryString = this.buildQueryString(queryParams);
        const response = await fetch(`${API_BASE_URL}/services${queryString}`);
        
        const data = await response.json();
        const totalCount = response.headers.get('X-Total-Count');
        
        return {
            data,
            totalCount: totalCount ? parseInt(totalCount) : data.length
        };
    }

    static async applyComplexFilters(filters = {}) {
        const {
            searchQuery = '',
            categories = [],
            priceRange = { min: 0, max: 1000 },
            minRating = 0,
            sortBy = 'id',
            sortOrder = 'asc',
            page = 1,
            limit = 12
        } = filters;

        const allServices = await this.fetchData(`${API_BASE_URL}/services`);

        let filteredData = allServices;

        if (searchQuery) {
            const searchTerm = searchQuery.toLowerCase();
            filteredData = filteredData.filter(service =>
                service.title.toLowerCase().includes(searchTerm) ||
                service.description.toLowerCase().includes(searchTerm) ||
                service.category.toLowerCase().includes(searchTerm) ||
                (service.tags && service.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }

        if (categories.length > 0) {
            filteredData = filteredData.filter(service =>
                categories.includes(service.category)
            );
        }

        filteredData = filteredData.filter(service =>
            service.price >= priceRange.min && service.price <= priceRange.max
        );

        if (minRating > 0) {
            filteredData = filteredData.filter(service =>
                service.rating >= minRating
            );
        }

        filteredData.sort((a, b) => {
            let aValue, bValue;
            
            switch(sortBy) {
                case 'price':
                    aValue = a.price;
                    bValue = b.price;
                    break;
                case 'rating':
                    aValue = a.rating;
                    bValue = b.rating;
                    break;
                case 'name':
                    aValue = a.title;
                    bValue = b.title;
                    break;
                case 'popularity':
                    aValue = a.popularity;
                    bValue = b.popularity;
                    break;
                default:
                    aValue = a.id;
                    bValue = b.id;
            }

            if (typeof aValue === 'string') {
                return sortOrder === 'asc' ? 
                    aValue.localeCompare(bValue) : 
                    bValue.localeCompare(aValue);
            } else {
                return sortOrder === 'asc' ? 
                    aValue - bValue : 
                    bValue - aValue;
            }
        });

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        return {
            data: paginatedData,
            totalCount: filteredData.length
        };
    }

    static async getFavorites() {
        return this.fetchData(`${API_BASE_URL}/favorites`);
    }

    static async addToFavorites(service) {
        return this.fetchData(`${API_BASE_URL}/favorites`, {
            method: 'POST',
            body: JSON.stringify({
                ...service,
                addedAt: new Date().toISOString()
            })
        });
    }

    static async removeFromFavorites(id) {
        return this.fetchData(`${API_BASE_URL}/favorites/${id}`, {
            method: 'DELETE'
        });
    }

    static async getCart() {
        return this.fetchData(`${API_BASE_URL}/cart`);
    }

    static async addToCart(service, quantity = 1) {
        return this.fetchData(`${API_BASE_URL}/cart`, {
            method: 'POST',
            body: JSON.stringify({
                ...service,
                quantity,
                total: service.price * quantity,
                addedAt: new Date().toISOString()
            })
        });
    }

    static buildQueryString(params = {}) {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    value.forEach(v => queryParams.append(key, v));
                } else {
                    queryParams.append(key, value);
                }
            }
        });
        
        return queryParams.toString() ? `?${queryParams.toString()}` : '';
    }

    static async getAllCategories() {
        const services = await this.fetchData(`${API_BASE_URL}/services`);
        const categories = new Set(services.map(service => service.category));
        return Array.from(categories).sort();
    }

    static async getPriceRange() {
        const services = await this.fetchData(`${API_BASE_URL}/services`);
        const prices = services.map(service => service.price);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }
}