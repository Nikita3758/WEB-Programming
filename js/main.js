let stateManager;
let uiManager;

async function initializeApp() {
    try {
        console.log('Initializing application...');

        const isServerAvailable = await checkServerAvailability();
        
        if (!isServerAvailable) {
            console.warn('JSON Server is not available. Please make sure it\'s running on port 3001');
            showServerError();
        }

        stateManager = new StateManager();
        uiManager = new UIManager(stateManager);

        await stateManager.initialize();
        await uiManager.initializeUI();

        const services = await stateManager.applyFilters();
        await uiManager.generateServiceCards(services);
        uiManager.updateFilterInfo();
        uiManager.updateStats();
        uiManager.updatePagination();

        console.log('Application initialized successfully');

    } catch (error) {
        console.error('Failed to initialize application:', error);
        showError('Failed to load services. Please try again later.');
    }
}

async function checkServerAvailability() {
    try {
        const response = await fetch('http://localhost:3001/services', {
            method: 'HEAD',
            timeout: 5000
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

function showServerError() {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'server-error';
    errorDiv.innerHTML = `
        <div class="error-content">
            <h3>⚠️ Server Connection Error</h3>
            <p>JSON Server is not running. Please start the server with:</p>
            <code>npx json-server --watch db.json --port 3001</code>
            <p>Using local data with limited functionality.</p>
        </div>
    `;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 10000;
        max-width: 400px;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 10000);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

window.uiManager = uiManager;
window.stateManager = stateManager;

window.applyFilters = () => uiManager.applyFilters();
window.resetFilters = () => uiManager.resetFilters();
window.goToPage = (page) => uiManager.goToPage(page);
window.nextPage = () => uiManager.nextPage();
window.prevPage = () => uiManager.prevPage();
window.toggleFavorite = (id) => uiManager.toggleFavorite(id);
window.addToCart = (id) => uiManager.addToCart(id);

document.addEventListener('DOMContentLoaded', initializeApp);