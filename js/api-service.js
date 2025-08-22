const API_BASE_URL = 'http://localhost:3001';

class ApiService {
    static async checkServerStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/services`);
            return response.ok;
        } catch (error) {
            console.warn('JSON Server is not running. Using local data.');
            return false;
        }
    }

    static async getServices() {
        try {
            const response = await fetch(`${API_BASE_URL}/services`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.warn('Using local services data');
            return localServices;
        }
    }

    static async getServiceById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/services/${id}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.warn('Using local service data');
            return localServices.find(service => service.id === id);
        }
    }

    static async getFavorites() {
        try {
            const response = await fetch(`${API_BASE_URL}/favorites`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.warn('Using local favorites data');
            return [];
        }
    }

    static async addToFavorites(service) {
        try {
            const response = await fetch(`${API_BASE_URL}/favorites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...service, addedAt: new Date().toISOString() })
            });
            return await response.json();
        } catch (error) {
            console.warn('Failed to add to favorites');
            return service;
        }
    }

    static async removeFromFavorites(id) {
        try {
            await fetch(`${API_BASE_URL}/favorites/${id}`, { method: 'DELETE' });
            return { success: true };
        } catch (error) {
            console.warn('Failed to remove from favorites');
            return { success: false };
        }
    }

    static async getCart() {
        try {
            const response = await fetch(`${API_BASE_URL}/cart`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.warn('Using local cart data');
            return [];
        }
    }

    static async addToCart(service, quantity = 1) {
        try {
            const cartItem = {
                ...service,
                quantity,
                total: service.price * quantity,
                addedAt: new Date().toISOString()
            };

            const response = await fetch(`${API_BASE_URL}/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cartItem)
            });
            return await response.json();
        } catch (error) {
            console.warn('Failed to add to cart');
            return service;
        }
    }

    static async updateCartItem(id, updates) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            console.warn('Failed to update cart item');
            return updates;
        }
    }

    static async removeFromCart(id) {
        try {
            await fetch(`${API_BASE_URL}/cart/${id}`, { method: 'DELETE' });
            return { success: true };
        } catch (error) {
            console.warn('Failed to remove from cart');
            return { success: false };
        }
    }

    static async searchServices(query) {
        try {
            const services = await this.getServices();
            const searchTerm = query.toLowerCase();
            
            return services.filter(service =>
                service.title.toLowerCase().includes(searchTerm) ||
                service.description.toLowerCase().includes(searchTerm) ||
                service.category.toLowerCase().includes(searchTerm) ||
                service.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }

    static async filterByCategory(category) {
        try {
            const services = await this.getServices();
            return services.filter(service =>
                service.category.toLowerCase() === category.toLowerCase()
            );
        } catch (error) {
            console.error('Filter error:', error);
            return [];
        }
    }

    static async sortServices(criteria, servicesArray) {
        try {
            const services = servicesArray || await this.getServices();
            const sorted = [...services];

            switch(criteria) {
                case 'priceAsc':
                    return sorted.sort((a, b) => a.price - b.price);
                case 'priceDesc':
                    return sorted.sort((a, b) => b.price - a.price);
                case 'rating':
                    return sorted.sort((a, b) => b.rating - a.rating);
                case 'nameAsc':
                    return sorted.sort((a, b) => a.title.localeCompare(b.title));
                case 'nameDesc':
                    return sorted.sort((a, b) => b.title.localeCompare(a.title));
                case 'popularity':
                    return sorted.sort((a, b) => b.popularity - a.popularity);
                default:
                    return sorted;
            }
        } catch (error) {
            console.error('Sort error:', error);
            return servicesArray || [];
        }
    }
}