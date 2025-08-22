function generateServiceCards() {
    const catalogGrid = document.getElementById('catalog-grid');
    
    if (!catalogGrid) return;
    
    services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';
        
        card.innerHTML = `
            <img src="${service.image}" alt="${service.title}" class="service-image">
            <div class="service-content">
                <div class="service-category">${service.category}</div>
                <h3 class="service-title">${service.title}</h3>
                <p class="service-description">${service.description}</p>
                <div class="service-details">
                    <span class="service-price">${service.price}</span>
                    <span class="service-duration">${service.duration}</span>
                </div>
                <div class="service-details">
                    <span>Rating: ${service.rating}/5</span>
                    <a href="#" class="service-button">Learn More</a>
                </div>
            </div>
        `;
        
        catalogGrid.appendChild(card);
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
    generateServiceCards();
    initMobileMenu();
});