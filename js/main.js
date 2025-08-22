let stateManager;
let uiManager;

async function initializeApp() {
    try {
        stateManager = new StateManager();
        await stateManager.initialize();

        uiManager = new UIManager(stateManager);
        uiManager.initializeUI();

        const services = await stateManager.applyFilters();
        await uiManager.generateServiceCards(services);
        uiManager.updateFilterInfo();
        uiManager.updateStats();

        console.log('Application initialized successfully');

    } catch (error) {
        console.error('Failed to initialize application:', error);
        const fallbackServices = await ApiService.getServices();
        await uiManager.generateServiceCards(fallbackServices);
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);

window.handleFavoriteClick = (serviceId) => uiManager.handleFavoriteClick(serviceId);
window.handleAddToCart = (serviceId) => uiManager.handleAddToCart(serviceId);
window.handleResetClick = () => uiManager.handleResetClick();