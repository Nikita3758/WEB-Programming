let filteredServices = [...services];
let activeFilter = 'all';

function generateServiceCards(servicesArray) {
    const catalogGrid = document.getElementById('catalog-grid');
    
    if (!catalogGrid) return;

    catalogGrid.innerHTML = '';
    
    if (servicesArray.length === 0) {
        catalogGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3>No services found</h3>
                <p>Try a different filter or reset to see all services.</p>
            </div>
        `;
        return;
    }
    
    servicesArray.forEach(service => {
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
                <div class="service-details">
                    <span>Popularity: ${service.popularity}%</span>
                    <button class="service-button">Learn More</button>
                </div>
            </div>
        `;
        
        catalogGrid.appendChild(card);
    });
}

function applyFilter(filterType) {
    activeFilter = filterType;
    updateActiveButton();
    
    switch(filterType) {
        case 'all':
            filteredServices = [...services];
            updateFilterInfo('Showing all services');
            break;
            
        case 'filter':
            filteredServices = services.filter(service => service.price > 200);
            updateFilterInfo('Services over $200');
            break;
            
        case 'map':
            filteredServices = services.map(service => ({
                ...service,
                price: service.price * 0.9,
                originalPrice: service.price,
                hasDiscount: true
            }));
            updateFilterInfo('Services with 10% discount (mapped)');
            break;
            
        case 'sortPriceAsc':
            filteredServices = [...services].sort((a, b) => a.price - b.price);
            updateFilterInfo('Sorted by price (low to high)');
            break;
            
        case 'sortPriceDesc':
            filteredServices = [...services].sort((a, b) => b.price - a.price);
            updateFilterInfo('Sorted by price (high to low)');
            break;
            
        case 'sortRating':
            filteredServices = [...services].sort((a, b) => b.rating - a.rating);
            updateFilterInfo('Sorted by rating (highest first)');
            break;
            
        case 'find':
            const mostPopular = services.find(service => 
                service.popularity === Math.max(...services.map(s => s.popularity))
            );
            filteredServices = mostPopular ? [mostPopular] : [];
            updateFilterInfo('Most popular service');
            break;
            
        case 'some':
            const hasCheapServices = services.some(service => service.price < 150);
            filteredServices = hasCheapServices ? 
                services.filter(service => service.price < 150) : [];
            updateFilterInfo(hasCheapServices ? 
                'Services under $150' : 'No services under $150');
            break;
            
        case 'every':
            const allHighRated = services.every(service => service.rating > 4.5);
            filteredServices = allHighRated ? [...services] : 
                services.filter(service => service.rating > 4.5);
            updateFilterInfo(allHighRated ? 
                'All services have rating > 4.5' : 'Services with rating > 4.5');
            break;
            
        case 'reduce':
            const bestValue = services.reduce((best, current) => {
                const valueRatio = current.rating / (current.price / 100);
                const bestValueRatio = best.rating / (best.price / 100);
                return valueRatio > bestValueRatio ? current : best;
            });
            filteredServices = [bestValue];
            updateFilterInfo('Best value service (rating/price ratio)');
            break;
            
        case 'slice':
            filteredServices = services.slice(0, 5);
            updateFilterInfo('First 5 services');
            break;
    }
    
    generateServiceCards(filteredServices);
    showStats();
}

function updateFilterInfo(text) {
    const filterInfo = document.getElementById('filter-info');
    if (filterInfo) {
        filterInfo.innerHTML = `<strong>Filter applied:</strong> ${text} | <strong>Results:</strong> ${filteredServices.length} services`;
    }
}

function updateActiveButton() {
    const buttons = document.querySelectorAll('.filter-button');
    buttons.forEach(button => {
        if (button.dataset.filter === activeFilter) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function showStats() {
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;
    
    const totalValue = filteredServices.reduce((sum, service) => sum + service.price, 0);
    const avgRating = filteredServices.reduce((sum, service) => sum + service.rating, 0) / filteredServices.length;
    const avgPrice = totalValue / filteredServices.length;
    
    statsContainer.innerHTML = `
        <h3>Current Selection Statistics</h3>
        <p>Total value: $${totalValue.toFixed(2)}</p>
        <p>Average price: $${avgPrice.toFixed(2)}</p>
        <p>Average rating: ${avgRating.toFixed(2)}/5</p>
        <p>Number of services: ${filteredServices.length}</p>
    `;
}

function createFilterButtons() {
    const buttonsContainer = document.querySelector('.filter-buttons');
    if (!buttonsContainer) return;
    
    const filters = [
        { type: 'all', text: 'All Services' },
        { type: 'filter', text: 'Price > $200' },
        { type: 'map', text: '10% Discount' },
        { type: 'sortPriceAsc', text: 'Sort: Price ↑' },
        { type: 'sortPriceDesc', text: 'Sort: Price ↓' },
        { type: 'sortRating', text: 'Sort: Rating' },
        { type: 'find', text: 'Most Popular' },
        { type: 'some', text: 'Under $150' },
        { type: 'every', text: 'Rating > 4.5' },
        { type: 'reduce', text: 'Best Value' },
        { type: 'slice', text: 'First 5' }
    ];
    
    filters.forEach(filter => {
        const button = document.createElement('button');
        button.className = 'filter-button';
        button.textContent = filter.text;
        button.dataset.filter = filter.type;
        button.addEventListener('click', () => applyFilter(filter.type));
        buttonsContainer.appendChild(button);
    });
}

function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
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

document.addEventListener('DOMContentLoaded', function() {
    createFilterButtons();
    applyFilter('all'); 
    initMobileMenu();
});