// Менеджер задач для участков
class TaskManager {
    constructor(siteType) {
        this.siteType = siteType;
        this.currentDate = new Date();
        this.tasks = [];
        this.orders = [];
        this.taskHistory = {};
        this.operationsDB = this.loadOperationsDatabase();
    }
    
    loadOperationsDatabase() {
        // ... (та же база операций, что и раньше)
    }
    
    getOperationsForProduct(productName) {
        // ... (та же логика)
    }
    
    loadData() {
        this.orders = loadOrdersFromStorage() || [];
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    loadHistoryForDate(date) {
        const dateStr = this.formatDate(date);
        const savedHistory = localStorage.getItem(`tasks_${this.siteType}_${dateStr}`);
        
        if (savedHistory) {
            this.taskHistory[dateStr] = JSON.parse(savedHistory);
            this.tasks = this.taskHistory[dateStr] || [];
        } else {
            this.tasks = this.generateTasks();
            this.saveHistoryForDate(date);
        }
        
        return this.tasks;
    }
    
    saveHistoryForDate(date) {
        const dateStr = this.formatDate(date);
        this.taskHistory[dateStr] = this.tasks;
        localStorage.setItem(`tasks_${this.siteType}_${dateStr}`, JSON.stringify(this.tasks));
    }
    
    // ===== ГЕНЕРАЦИЯ ЗАДАЧ С УЧЁТОМ ДОПОЛНИТЕЛЬНЫХ =====
    generateTasks() {
        const tasks = [];
        const dateStr = this.formatDate(this.currentDate);
        
        this.orders.forEach(order => {
            if (order.status !== 'active') return;
            
            // Основные задачи из техкарт
            order.items.forEach(item => {
                const productName = item.product;
                const operations = this.getOperationsForProduct(productName);
                
                operations.forEach((op, index) => {
                    const taskId = `${order.id}_${productName}_${this.siteType}_${index}`;
                    const existingTask = this.taskHistory[dateStr]?.find(t => t.id === taskId);
                    
                    if (existingTask) {
                        tasks.push(existingTask);
                    } else {
                        tasks.push({
                            id: taskId,
                            orderId: order.id,
                            orderNumber: order.number,
                            product: productName,
                            size: item.size,
                            totalQuantity: item.quantity,
                            completedQuantity: 0,
                            operation: op,
                            operationIndex: index,
                            status: 'pending',
                            executors: [],
                            date: dateStr,
                            isExtra: false
                        });
                    }
                });
            });
            
            // Дополнительные задачи из заказа
            if (order.extraTasks && order.extraTasks.length > 0) {
                order.extraTasks.forEach((extraTask, index) => {
                    if (extraTask.site !== this.siteType) return;
                    
                    const taskId = `${order.id}_extra_${index}`;
                    const existingTask = this.taskHistory[dateStr]?.find(t => t.id === taskId);
                    
                    if (existingTask) {
                        tasks.push(existingTask);
                    } else {
                        tasks.push({
                            id: taskId,
                            orderId: order.id,
                            orderNumber: order.number,
                            product: extraTask.title,
                            description: extraTask.description,
                            totalQuantity: 1, // для доп. задач обычно 1
                            completedQuantity: 0,
                            operation: extraTask.title,
                            status: 'pending',
                            executors: [],
                            date: dateStr,
                            isExtra: true
                        });
                    }
                });
            }
        });
        
        return tasks;
    }
    
    // Обновить статус задачи
    updateTaskStatus(taskId, status) {
        const dateStr = this.formatDate(this.currentDate);
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) return false;
        
        this.tasks[taskIndex].status = status;
        this.saveHistoryForDate(this.currentDate);
        this.updateOrderTaskStatus(taskId, status);
        this.notifyOtherTabs(taskId, status);
        
        return true;
    }
    
    // Обновить статус в заказе (для квадратиков в планировщике)
    updateOrderTaskStatus(taskId, status) {
        const [orderId] = taskId.split('_');
        const orderIndex = this.orders.findIndex(o => o.id == orderId);
        
        if (orderIndex === -1) return;
        
        if (!this.orders[orderIndex].tasks) {
            this.orders[orderIndex].tasks = {};
        }
        
        let squareStatus = '';
        if (status === 'in_progress') squareStatus = 'orange';
        if (status === 'completed') squareStatus = 'green';
        
        this.orders[orderIndex].tasks[taskId] = squareStatus;
        saveOrdersToStorage(this.orders);
    }
    
    // Добавить исполнителя
    addExecutor(taskId, executorName) {
        const dateStr = this.formatDate(this.currentDate);
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) return false;
        
        if (!this.tasks[taskIndex].executors) {
            this.tasks[taskIndex].executors = [];
        }
        
        this.tasks[taskIndex].executors.push({
            name: executorName,
            quantity: 0,
            status: 'pending',
            addedAt: new Date().toISOString()
        });
        
        this.saveHistoryForDate(this.currentDate);
        return true;
    }
    
    // Обновить количество и статус исполнителя
    updateExecutorQuantity(taskId, executorName, quantity) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        
        const executor = this.tasks[taskIndex].executors?.find(e => e.name === executorName);
        if (!executor) return false;
        
        executor.quantity = quantity;
        
        // Пересчитать общее количество выполненных деталей
        const totalCompleted = this.tasks[taskIndex].executors.reduce((sum, e) => sum + (e.quantity || 0), 0);
        this.tasks[taskIndex].completedQuantity = totalCompleted;
        
        // Если исполнитель завершил свою часть, отметить его как completed
        if (executor.quantity >= this.tasks[taskIndex].totalQuantity) {
            executor.status = 'completed';
        }
        
        this.saveHistoryForDate(this.currentDate);
        
        // Обновить статус задачи в планировщике
        const squareStatus = totalCompleted > 0 ? 'in_progress' : 'pending';
        this.updateOrderTaskStatus(taskId, squareStatus);
        
        return true;
    }
    
    // Завершить задачу
    completeTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        
        this.tasks[taskIndex].status = 'completed';
        this.tasks[taskIndex].completedQuantity = this.tasks[taskIndex].totalQuantity;
        
        if (this.tasks[taskIndex].executors) {
            this.tasks[taskIndex].executors.forEach(e => {
                e.status = 'completed';
                e.quantity = this.tasks[taskIndex].totalQuantity;
            });
        }
        
        this.saveHistoryForDate(this.currentDate);
        this.updateOrderTaskStatus(taskId, 'completed');
        
        return true;
    }
    
    // Установить дату
    setDate(date) {
        this.currentDate = new Date(date);
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    prevDay() {
        this.currentDate.setDate(this.currentDate.getDate() - 1);
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    nextDay() {
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    today() {
        this.currentDate = new Date();
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    notifyOtherTabs(taskId, status) {
        const event = new CustomEvent('taskStatusChanged', {
            detail: { taskId, status }
        });
        window.dispatchEvent(event);
    }
}
