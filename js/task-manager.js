// Менеджер задач для участков
class TaskManager {
    constructor(siteType) {
        this.siteType = siteType;
        this.currentDate = new Date();
        this.tasks = [];
        this.orders = [];
    }
    
    // Загрузить заказы и задачи
    loadData() {
        this.orders = loadOrdersFromStorage() || [];
        this.generateTasks();
        return this.tasks;
    }
    
    // Сгенерировать задачи для участка из заказов
    generateTasks() {
        this.tasks = [];
        
        this.orders.forEach(order => {
            if (order.status !== 'active') return;
            
            order.items.forEach(item => {
                const productName = item.product;
                const operations = this.getOperationsForProduct(productName);
                const totalQuantity = item.quantity || 1;
                
                operations.forEach((op, index) => {
                    const taskId = `${order.id}_${productName}_${this.siteType}_${index}`;
                    
                    // Получаем статус из заказа
                    const taskStatus = order.tasks && order.tasks[taskId] ? order.tasks[taskId] : 'pending';
                    
                    this.tasks.push({
                        id: taskId,
                        orderId: order.id,
                        orderNumber: order.number,
                        product: productName,
                        size: item.size || 'Стандартный',
                        totalQuantity: totalQuantity,
                        completedQuantity: 0,
                        operation: op,
                        operationIndex: index,
                        status: taskStatus,
                        executors: [],
                        isExtra: false
                    });
                });
            });
            
            // Дополнительные задачи
            if (order.extraTasks) {
                order.extraTasks.forEach((extraTask, index) => {
                    if (extraTask.site !== this.siteType) return;
                    
                    const taskId = `${order.id}_extra_${index}`;
                    const taskStatus = order.tasks && order.tasks[taskId] ? order.tasks[taskId] : 'pending';
                    
                    this.tasks.push({
                        id: taskId,
                        orderId: order.id,
                        orderNumber: order.number,
                        product: extraTask.title,
                        description: extraTask.description,
                        totalQuantity: 1,
                        completedQuantity: 0,
                        operation: extraTask.title,
                        status: taskStatus,
                        executors: [],
                        isExtra: true
                    });
                });
            }
        });
    }
    
    // Получить операции для изделия
    getOperationsForProduct(productName) {
        const operationsDB = {
            'tokarniy': {
                'XRAY 6-T2 BT 220 Шторка x2': [
                    'Заготовка',
                    'Точение Корпуса',
                    'Заготовка деталей Крышка',
                    'Точение деталей Кольцо',
                    'Фрезеровка Корпуса'
                ]
            },
            'slesarniy': {
                'XRAY 6-T2 BT 220 Шторка x2': [
                    'Нарезка резьбы Корпус+V',
                    'Установка Резьбовых заклепок 4*16',
                    'Нарезка резьбы Основание платы+V',
                    'Обработка Корпуса',
                    'Обработка Основания платы',
                    'Голтовка Кронштейна',
                    'УВ корпуса'
                ]
            },
            'frezerniy': {
                'XRAY 6-T2 BT 220 Шторка x2': [
                    'Поликарбонат Прозрачный 3мм х 2'
                ]
            },
            'lazerno': {
                'XRAY 6-T2 BT 220 Шторка x2': [
                    'Раскрой Основания платы',
                    'Раскрой Фоновая заглушка',
                    'Раскрой Кронштейн BT',
                    'Гибка Кронштейн BT'
                ]
            },
            'polimerniy': {
                'XRAY 6-T2 BT 220 Шторка x2': [
                    'Корпус',
                    'Фоновая заглушка'
                ]
            }
        };
        
        return operationsDB[this.siteType]?.[productName] || [];
    }
    
    // Обновить статус задачи
    updateTaskStatus(taskId, status) {
        const [orderId] = taskId.split('_');
        const orderIndex = this.orders.findIndex(o => o.id == orderId);
        
        if (orderIndex === -1) return false;
        
        if (!this.orders[orderIndex].tasks) {
            this.orders[orderIndex].tasks = {};
        }
        
        let squareStatus = '';
        if (status === 'in_progress') squareStatus = 'orange';
        if (status === 'completed') squareStatus = 'green';
        
        this.orders[orderIndex].tasks[taskId] = squareStatus;
        saveOrdersToStorage(this.orders);
        
        // Обновляем локальные задачи
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].status = status;
        }
        
        // Оповещаем другие вкладки
        this.notifyOtherTabs(taskId, status);
        
        return true;
    }
    
    // Оповестить другие вкладки
    notifyOtherTabs(taskId, status) {
        const event = new CustomEvent('taskStatusChanged', {
            detail: { taskId, status }
        });
        window.dispatchEvent(event);
    }
}
