// Работа с localStorage
const STORAGE_KEY = 'masterx_orders';

function saveOrdersToStorage(orders) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function loadOrdersFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}