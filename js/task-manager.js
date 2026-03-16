// Менеджер задач для участков
class TaskManager {
    constructor(siteType) {
        this.siteType = siteType; // 'tokarniy', 'slesarniy', и т.д.
        this.currentDate = new Date();
        this.tasks = [];
        this.orders = [];
    }
    
    // Загрузить заказы и задачи
    loadData() {
        this.orders = loadOrdersFromStorage() || [];
        this.tasks = this.generateTasks();
        return this.tasks;
    }
    
    // Сгенерировать задачи для участка
    generateTasks() {
        const tasks = [];
        
        this.orders.forEach(order => {
            if (order.status !== 'active') return; // только активные заказы
            
            order.items.forEach(item => {
                const productName = item.product;
                const operations = this.getOperationsForProduct(productName);
                
                operations.forEach(op => {
                    const taskId = `${order.id}_${productName}_${this.siteType}_${op.name}`;
                    const taskStatus = this.getTaskStatus(order, taskId);
                    
                    tasks.push({
                        id: taskId,
                        orderId: order.id,
                        orderNumber: order.number,
                        product: productName,
                        size: item.size,
                        quantity: item.quantity,
                        operation: op.name,
                        operationCode: op.code,
                        status: taskStatus || 'pending',
                        executors: taskStatus?.executors || [],
                        date: this.currentDate.toISOString().split('T')[0]
                    });
                });
            });
        });
        
        return tasks;
    }
    
    // Получить операции для изделия (из техкарт)
    getOperationsForProduct(productName) {
        const operationsDB = {
            'XGRAY v.1': [
                { code: 'T01', name: 'Заготовка', site: 'tokarniy' },
                { code: 'T02', name: 'Точение Корпуса', site: 'tokarniy' },
                { code: 'T03', name: 'Фрезеровка Корпуса', site: 'tokarniy' },
                { code: 'S01', name: 'Нарезка резьбы', site: 'slesarniy' },
                { code: 'S02', name: 'Голтовка', site: 'slesarniy' },
                { code: 'S03', name: 'УВ корпуса', site: 'slesarniy' },
                { code: 'F01', name: 'Фрезеровка профиля', site: 'frezerniy' },
                { code: 'L01', name: 'Раскрой', site: 'lazerno' },
                { code: 'L02', name: 'Гибка', site: 'lazerno' },
                { code: 'P01', name: 'Заглушка AL', site: 'polimerniy' },
                { code: 'P02', name: 'Обработка', site: 'polimerniy' }
            ],
            'XSMART mini': [
                { code: 'T01', name: 'Заготовка', site: 'tokarniy' },
                { code: 'T02', name: 'Точение', site: 'tokarniy' },
                { code: 'S01', name: 'Сборка', site: 'slesarniy' },
                { code: 'F01', name: 'Фрезеровка', site: 'frezerniy' },
                { code: 'L01', name: 'Раскрой', site: 'lazerno' },
                { code: 'P01', name: 'Заглушка', site: 'polimerniy' }
            ]
        };
        
        return operationsDB[productName]?.filter(op => op.site === this.siteType) || [];
    }
    
    // Получить статус задачи из заказа
    getTaskStatus(order, taskId) {
        return order.tasks && order.tasks[taskId] ? order.tasks[taskId] : null;
    }
    
    // Обновить статус задачи
    updateTaskStatus(taskId, status, executor = null) {
        // Найти заказ
        const [orderId] = taskId.split('_');
        const orderIndex = this.orders.findIndex(o => o.id == orderId);
        
        if (orderIndex === -1) return false;
        
        // Инициализировать tasks если нет
        if (!this.orders[orderIndex].tasks) {
            this.orders[orderIndex].tasks = {};
        }
        
        // Обновить статус
        this.orders[orderIndex].tasks[taskId] = status;
        
        // Сохранить
        saveOrdersToStorage(this.orders);
        
        // Оповестить другие вкладки
        this.notifyOtherTabs(taskId, status);
        
        return true;
    }
    
    // Добавить исполнителя
    addExecutor(taskId, executorName) {
        const [orderId] = taskId.split('_');
        const orderIndex = this.orders.findIndex(o => o.id == orderId);
        
        if (orderIndex === -1) return false;
        
        if (!this.orders[orderIndex].tasks) {
            this.orders[orderIndex].tasks = {};
        }
        
        const task = this.orders[orderIndex].tasks[taskId] || { executors: [] };
        
        task.executors = task.executors || [];
        task.executors.push({
            name: executorName,
            status: 'pending'
        });
        
        this.orders[orderIndex].tasks[taskId] = task;
        saveOrdersToStorage(this.orders);
        
        return true;
    }
    
    // Обновить статус исполнителя
    updateExecutorStatus(taskId, executorName, status) {
        const [orderId] = taskId.split('_');
        const orderIndex = this.orders.findIndex(o => o.id == orderId);
        
        if (orderIndex === -1) return false;
        
        const task = this.orders[orderIndex].tasks?.[taskId];
        if (!task || !task.executors) return false;
        
        const executor = task.executors.find(e => e.name === executorName);
        if (executor) {
            executor.status = status;
            saveOrdersToStorage(this.orders);
            
            // Если все исполнители завершили, обновить статус задачи
            const allCompleted = task.executors.every(e => e.status === 'completed');
            if (allCompleted) {
                this.orders[orderIndex].tasks[taskId] = 'completed';
                saveOrdersToStorage(this.orders);
            }
            
            return true;
        }
        
        return false;
    }
    
    // Оповестить другие вкладки
    notifyOtherTabs(taskId, status) {
        const event = new CustomEvent('taskStatusChanged', {
            detail: { taskId, status }
        });
        window.dispatchEvent(event);
    }
    
    // Фильтр по дате
    setDate(date) {
        this.currentDate = new Date(date);
    }
    
    // Получить задачи на дату
    getTasksForDate(date) {
        const dateStr = new Date(date).toISOString().split('T')[0];
        return this.tasks.filter(t => t.date === dateStr);
    }
}