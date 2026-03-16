// Менеджер задач для участков с поддержкой истории по датам
class TaskManager {
    constructor(siteType) {
        this.siteType = siteType; // 'tokarniy', 'slesarniy', и т.д.
        this.currentDate = new Date();
        this.tasks = [];
        this.orders = [];
        this.taskHistory = {}; // хранилище задач по датам
    }
    
    // Загрузить заказы и задачи
    loadData() {
        this.orders = loadOrdersFromStorage() || [];
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    // Загрузить историю задач для конкретной даты
    loadHistoryForDate(date) {
        const dateStr = this.formatDate(date);
        const savedHistory = localStorage.getItem(`tasks_${this.siteType}_${dateStr}`);
        
        if (savedHistory) {
            this.taskHistory[dateStr] = JSON.parse(savedHistory);
            this.tasks = this.taskHistory[dateStr] || [];
        } else {
            // Если истории нет, генерируем задачи из заказов
            this.tasks = this.generateTasks();
            this.saveHistoryForDate(date);
        }
        
        return this.tasks;
    }
    
    // Сохранить историю задач для даты
    saveHistoryForDate(date) {
        const dateStr = this.formatDate(date);
        this.taskHistory[dateStr] = this.tasks;
        localStorage.setItem(`tasks_${this.siteType}_${dateStr}`, JSON.stringify(this.tasks));
    }
    
    // Сгенерировать задачи для участка из заказов
    generateTasks() {
        const tasks = [];
        const dateStr = this.formatDate(this.currentDate);
        
        this.orders.forEach(order => {
            if (order.status !== 'active') return; // только активные заказы
            
            order.items.forEach(item => {
                const productName = item.product;
                const operations = this.getOperationsForProduct(productName);
                
                operations.forEach(op => {
                    const taskId = `${order.id}_${productName}_${this.siteType}_${op.code}`;
                    
                    // Проверяем, есть ли уже задача в истории
                    const existingTask = this.taskHistory[dateStr]?.find(t => t.id === taskId);
                    
                    if (existingTask) {
                        tasks.push(existingTask);
                    } else {
                        // Создаём новую задачу
                        tasks.push({
                            id: taskId,
                            orderId: order.id,
                            orderNumber: order.number,
                            product: productName,
                            size: item.size,
                            quantity: item.quantity,
                            operation: op.name,
                            operationCode: op.code,
                            status: 'pending', // pending, in_progress, completed
                            executors: [],
                            date: dateStr,
                            squares: this.getSquareCount(productName, this.siteType) // количество квадратиков
                        });
                    }
                });
            });
        });
        
        return tasks;
    }
    
    // Получить количество квадратиков для изделия
    getSquareCount(productName, siteType) {
        const operations = this.getOperationsForProduct(productName);
        return operations.length;
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
    
    // Обновить статус задачи
    updateTaskStatus(taskId, status) {
        const dateStr = this.formatDate(this.currentDate);
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) return false;
        
        // Обновить статус
        this.tasks[taskIndex].status = status;
        
        // Сохранить историю
        this.saveHistoryForDate(this.currentDate);
        
        // Обновить статус в заказе для планировщика
        this.updateOrderTaskStatus(taskId, status);
        
        // Оповестить другие вкладки
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
        
        // Преобразуем статус для квадратика
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
        
        // Инициализировать массив исполнителей
        if (!this.tasks[taskIndex].executors) {
            this.tasks[taskIndex].executors = [];
        }
        
        // Добавить нового исполнителя
        this.tasks[taskIndex].executors.push({
            name: executorName,
            status: 'pending', // pending, in_progress, completed
            addedAt: new Date().toISOString()
        });
        
        // Сохранить историю
        this.saveHistoryForDate(this.currentDate);
        
        return true;
    }
    
    // Обновить статус исполнителя
    updateExecutorStatus(taskId, executorName, status) {
        const dateStr = this.formatDate(this.currentDate);
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) return false;
        
        const executor = this.tasks[taskIndex].executors?.find(e => e.name === executorName);
        if (!executor) return false;
        
        executor.status = status;
        
        // Сохранить историю
        this.saveHistoryForDate(this.currentDate);
        
        // Если статус in_progress, обновить статус задачи
        if (status === 'in_progress' && this.tasks[taskIndex].status !== 'completed') {
            this.updateTaskStatus(taskId, 'in_progress');
        }
        
        return true;
    }
    
    // Проверить, все ли исполнители завершили работу
    checkAllExecutorsCompleted(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        
        const executors = this.tasks[taskIndex].executors || [];
        if (executors.length === 0) return false;
        
        return executors.every(e => e.status === 'completed');
    }
    
    // Завершить задачу (кнопка "ГОТОВО")
    completeTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        
        this.tasks[taskIndex].status = 'completed';
        
        // Отметить всех исполнителей как завершённых
        if (this.tasks[taskIndex].executors) {
            this.tasks[taskIndex].executors.forEach(e => {
                e.status = 'completed';
            });
        }
        
        // Сохранить историю
        this.saveHistoryForDate(this.currentDate);
        
        // Обновить статус в заказе (зелёный квадратик)
        this.updateOrderTaskStatus(taskId, 'completed');
        
        return true;
    }
    
    // Установить дату
    setDate(date) {
        this.currentDate = new Date(date);
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    // Перейти на предыдущий день
    prevDay() {
        this.currentDate.setDate(this.currentDate.getDate() - 1);
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    // Перейти на следующий день
    nextDay() {
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    // Перейти на сегодня
    today() {
        this.currentDate = new Date();
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    // Форматировать дату
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    // Оповестить другие вкладки
    notifyOtherTabs(taskId, status) {
        const event = new CustomEvent('taskStatusChanged', {
            detail: { taskId, status }
        });
        window.dispatchEvent(event);
    }
}
