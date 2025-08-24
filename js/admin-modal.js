document.addEventListener('DOMContentLoaded', function() {
    initializeModalHandlers();
    initializeLogoutHandler();
});

function initializeModalHandlers() {
    const productModal = document.getElementById('productModal');
    const addProductBtn = document.getElementById('addProductBtn');
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelProductBtn');
    const confirmModal = document.getElementById('confirmModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    if (addProductBtn) {
        addProductBtn.addEventListener('click', openAddProductModal);
    }

    if (closeModal) {
        closeModal.addEventListener('click', closeProductModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeProductModal);
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeConfirmModal);
    }

    window.addEventListener('click', function(e) {
        if (e.target === productModal) {
            closeProductModal();
        }
        if (e.target === confirmModal) {
            closeConfirmModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
            closeConfirmModal();
        }
    });
}

function initializeLogoutHandler() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

function openAddProductModal() {
    const modal = document.getElementById('productModal');
    document.getElementById('modalTitle').textContent = 'Добавить товар';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    modal.style.display = 'block';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'none';
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'none';
    deleteCallback = null;
}

function openEditModal(productId) {
    editProduct(productId);
}

function confirmDelete(type, id) {
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    message.textContent = 'Вы уверены, что хотите удалить этот ' + (type === 'product' ? 'товар' : 'отзыв') + '?';
    
    deleteCallback = async function() {
        try {
            await fetch(API_URL + '/' + (type === 'product' ? 'products' : 'feedback') + '/' + id, {
                method: 'DELETE'
            });
            
            if (type === 'product') {
                loadProducts();
            } else {
                loadReviews();
            }
            showNotification('Удаление выполнено успешно');
        } catch (error) {
            console.error('Ошибка удаления:', error);
            showNotification('Ошибка удаления', true);
        }
    };
    
    modal.style.display = 'block';
    confirmBtn.onclick = deleteCallback;
}

function showNotification(message, isError) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification ' + (isError ? 'error' : '');
    notification.classList.add('show');
    
    setTimeout(function() {
        notification.classList.remove('show');
    }, 3000);
}