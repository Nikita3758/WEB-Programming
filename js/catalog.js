let filteredServices = [...services];
let activeFilter = 'all';
let searchQuery = '';
let sortCriteria = 'default';
let selectedCategories = [];
let allCategories = [];

function getAllCategories() {
    const categories = new Set();
    services.forEach(service => categories.add(service.category));
    return Array.from(categories).sort();
}

function applyAllFilters() {
    let result = [...services];

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(service => 
            service.title.toLowerCase().includes(query) ||
            service.description.toLowerCase().includes(query) ||
            service.category.toLowerCase().includes(query)
        );
    }

    if (selectedCategories.length > 0) {
        result = result.filter(service => 
            selectedCategories.includes(service.category)
        );
    }

    switch(activeFilter) {
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
            const hasCheapServices = result.some(service => service.price < 150);
            result = hasCheapServices ? 
                result.filter(service => service.price < 150) : [];
            break;
        case 'every':
            const allHighRated = result.every(service => service.rating > 4.5);
            result = allHighRated ? result : 
                result.filter(service => service.rating > 4.5);
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
    
    switch(sortCriteria) {
        case 'priceAsc':
            result.sort((a, b) => a.price - b.price);
            break;
        case 'priceDesc':
            result.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            result.sort((a, b) => b.rating - a.rating);
            break;
        case 'nameAsc':
            result.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'nameDesc':
            result.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'popularity':
            result.sort((a, b) => b.popularity - a.popularity);
            break;
    }
    
    filteredServices = result;
    generateServiceCards(filteredServices);
    updateFilterInfo();
    showStats();
}

function generateServiceCards(servicesArray) {
    const catalogGrid = document.getElementById('catalog-grid');
    
    if (!catalogGrid) return;

    catalogGrid.innerHTML = '';
    
    if (servicesArray.length === 0) {
        catalogGrid.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No services found</h3>
                <p>Try adjusting your search criteria or filters.</p>
                <button class="service-button" onclick="resetAllFilters()">Reset All Filters</button>
            </div>
        `;
        return;
    }
    
    servicesArray.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';
        
        const priceDisplay = service.hasDiscount ? 
            `<span class="service-price">$${service.price.toFixed(2)} <small style="text-decoration: line-through; color: #999;">$${service.originalPrice}</small></span>` :
            `<span class="service-price">$${service.price}</span>`;
        
        card.innerHTML = `
            <img src="${service.image}" alt="${service.title}" class="service-image">
            <div class="service-content">
                <div class="service-category">${service.category}</div>
                <h3 class="service-title">${service.title}</h3>
                <p class="service-description">${service.description}</p>
                <div class="service-details">
                    ${priceDisplay}
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

function updateFilterInfo() {
    const filterInfo = document.getElementById('filter-info');
    if (!filterInfo) return;
    
    let infoText = '';
    
    if (searchQuery) {
        infoText += `Search: "${searchQuery}" • `;
    }
    
    if (selectedCategories.length > 0) {
        infoText += `Categories: ${selectedCategories.join(', ')} • `;
    }
    
    if (activeFilter !== 'all') {
        const filterNames = {
            'filter': 'Price > $200',
            'map': '10% Discount',
            'find': 'Most Popular',
            'some': 'Under $150',
            'every': 'Rating > 4.5',
            'reduce': 'Best Value',
            'slice': 'First 5'
        };
        infoText += `Filter: ${filterNames[activeFilter]} • `;
    }
    
    if (sortCriteria !== 'default') {
        const sortNames = {
            'priceAsc': 'Price ↑',
            'priceDesc': 'Price ↓',
            'rating': 'Rating',
            'nameAsc': 'Name A-Z',
            'nameDesc': 'Name Z-A',
            'popularity': 'Popularity'
        };
        infoText += `Sort: ${sortNames[sortCriteria]} • `;
    }
    
    infoText = infoText.replace(/ • $/, ''); 
    
    filterInfo.innerHTML = infoText ? `
        <strong>Active filters:</strong> ${infoText} | 
        <strong>Results:</strong> ${filteredServices.length} services
    ` : `<strong>Showing all</strong> ${filteredServices.length} services`;
}

function showStats() {
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer || filteredServices.length === 0) {
        if (statsContainer) statsContainer.innerHTML = '';
        return;
    }
    
    const totalValue = filteredServices.reduce((sum, service) => sum + service.price, 0);
    const avgRating = filteredServices.reduce((sum, service) => sum + service.rating, 0) / filteredServices.length;
    const avgPrice = totalValue / filteredServices.length;
    const maxPrice = Math.max(...filteredServices.map(service => service.price));
    const minPrice = Math.min(...filteredServices.map(service => service.price));
    
    statsContainer.innerHTML = `
        <h3>📊 Current Selection Statistics</h3>
        <p>Total value: $${totalValue.toFixed(2)}</p>
        <p>Average price: $${avgPrice.toFixed(2)}</p>
        <p>Price range: $${minPrice} - $${maxPrice}</p>
        <p>Average rating: ${avgRating.toFixed(2)}/5 ⭐</p>
        <p>Number of services: ${filteredServices.length}</p>
    `;
}

function handleSearch(event) {
    searchQuery = event.target.value.trim();
    applyAllFilters();
}

function handleSortChange(event) {
    sortCriteria = event.target.value;
    applyAllFilters();
}

function handleCategoryChange(category) {
    const index = selectedCategories.indexOf(category);
    if (index === -1) {
        selectedCategories.push(category);
    } else {
        selectedCategories.splice(index, 1);
    }
    applyAllFilters();
}

function applyArrayFilter(filterType) {
    activeFilter = filterType;
    updateActiveButton();
    applyAllFilters();
}

function resetAllFilters() {
    searchQuery = '';
    selectedCategories = [];
    activeFilter = 'all';
    sortCriteria = 'default';

    document.getElementById('search-input').value = '';
    document.getElementById('sort-select').value = 'default';

    const checkboxes = document.querySelectorAll('.category-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    updateActiveButton();
    
    applyAllFilters();
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

function createFilterUI() {
    createFilterButtons();
    createCategoriesFilter();
}

function createFilterButtons() {
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
    
    filters.forEach(filter => {
        const button = document.createElement('button');
        button.className = 'filter-button';
        button.textContent = filter.text;
        button.dataset.filter = filter.type;
        button.addEventListener('click', () => applyArrayFilter(filter.type));
        buttonsContainer.appendChild(button);
    });

    const resetButton = document.createElement('button');
    resetButton.className = 'filter-button reset';
    resetButton.textContent = 'Reset All';
    resetButton.addEventListener('click', resetAllFilters);
    buttonsContainer.appendChild(resetButton);
}

function createCategoriesFilter() {
    const categoriesContainer = document.querySelector('.categories-grid');
    if (!categoriesContainer) return;
    
    allCategories.forEach(category => {
        const wrapper = document.createElement('div');
        
        wrapper.innerHTML = `
            <input type="checkbox" id="category-${category}" class="category-checkbox" 
                   value="${category}" onchange="handleCategoryChange('${category}')">
            <label for="category-${category}" class="category-label">${category}</label>
        `;
        
        categoriesContainer.appendChild(wrapper);
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
    allCategories = getAllCategories();
    createFilterUI();
    initMobileMenu();

    document.getElementById('search-input').addEventListener('input', handleSearch);
    document.getElementById('sort-select').addEventListener('change', handleSortChange);

    applyAllFilters();
});