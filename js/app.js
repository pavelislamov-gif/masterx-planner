// В конец файла app.js добавьте:
function updateSiteSquares() {
    const cards = document.querySelectorAll('.order-card');
    cards.forEach(card => {
        const orderId = card.dataset.orderId;
        const order = orders.find(o => o.id == orderId);
        if (!order) return;
        
        // Обновляем квадратики
        const squares = card.querySelectorAll('.square');
        squares.forEach(square => {
            const taskId = square.dataset.task;
            if (taskId && order.tasks && order.tasks[taskId]) {
                square.className = `square ${order.tasks[taskId]}`;
            }
        });
    });
}

// Слушаем события от участков
window.addEventListener('taskStatusChanged', function(e) {
    console.log('Статус задачи изменён:', e.detail);
    
    // Находим заказ и обновляем его
    const [orderId] = e.detail.taskId.split('_');
    const order = orders.find(o => o.id == orderId);
    if (order) {
        if (!order.tasks) order.tasks = {};
        order.tasks[e.detail.taskId] = e.detail.status === 'completed' ? 'green' : 'orange';
        saveOrdersToStorage(orders);
        loadOrders(); // Перезагружаем отображение
    }
});
