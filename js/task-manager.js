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
    
    // Загрузить базу операций из техкарт
    loadOperationsDatabase() {
        return {
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
    }
    
    // Получить операции для изделия на текущем участке
    getOperationsForProduct(productName) {
        const siteOps = this.operationsDB[this.siteType];
        if (!siteOps) return [];
        
        // Прямое совпадение
        if (siteOps[productName]) {
            return siteOps[productName];
        }
        
        // Поиск по частичному совпадению
        for (let key in siteOps) {
            if (productName.includes(key) || key.includes(productName)) {
                return siteOps[key];
            }
        }
        
        return [];
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
            try {
                let historyTasks = JSON.parse(savedHistory);
                
                // Фильтруем задачи: оставляем только те, чьи заказы существуют
                historyTasks = historyTasks.filter(task => {
                    return this.orders.some(o => o.id === task.orderId);
                });
                
                this.taskHistory[dateStr] = historyTasks;
                this.tasks = historyTasks;
                
                // Если задачи отфильтровались, сохраняем обновлённую историю
                if (historyTasks.length !== JSON.parse(savedHistory).length) {
                    this.saveHistoryForDate(date);
                }
            } catch (e) {
                console.error('Ошибка парсинга истории:', e);
                this.tasks = this.generateTasks();
                this.saveHistoryForDate(date);
            }
        } else {
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
        
        const activeOrders = this.orders.filter(o => o.status === 'active');
        
        activeOrders.forEach(order => {
            if (!order.items || !order.items[0]) return;
            
            const item = order.items[0];
            const productName = item.product;
            const operations = this.getOperationsForProduct(productName);
            const totalQuantity = item.quantity || 1;
            
            // Создаём задачи для каждой операции
            operations.forEach((op, index) => {
                const taskId = `${order.id}_${productName}_${this.siteType}_${index}`;
                
                // Проверяем, есть ли уже задача в истории для этой даты
                const existingTask = this.tasks.find(t => t.id === taskId);
                
                if (existingTask) {
                    tasks.push(existingTask);
                } else {
                    tasks.push({
                        id: taskId,
                        orderId: order.id,
                        orderNumber: order.number,
                        product: productName,
                        size: item.size || 'Стандартный',
                        totalQuantity: totalQuantity,
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
            
            // Дополнительные задачи
            if (order.extraTasks && order.extraTasks.length > 0) {
                order.extraTasks.forEach((extraTask, index) => {
                    if (extraTask.site !== this.siteType) return;
                    
                    const taskId = `${order.id}_extra_${index}`;
                    
                    // Проверяем, есть ли уже задача в истории
                    const existingTask = this.tasks.find(t => t.id === taskId);
                    
                    if (existingTask) {
                        tasks.push(existingTask);
                    } else {
                        tasks.push({
                            id: taskId,
                            orderId: order.id,
                            orderNumber: order.number,
                            product: extraTask.title,
                            description: extraTask.description,
                            totalQuantity: 1,
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
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        
        if (!this.tasks[taskIndex].executors) {
            this.tasks[taskIndex].executors = [];
        }
        
        // Проверяем, нет ли уже такого исполнителя
        const existing = this.tasks[taskIndex].executors.find(e => e.name === executorName);
        if (existing) return false;
        
        this.tasks[taskIndex].executors.push({
            name: executorName,
            quantity: 0,
            status: 'pending',
            addedAt: new Date().toISOString()
        });
        
        this.saveHistoryForDate(this.currentDate);
        return true;
    }
    
    // Обновить количество исполнителя
    updateExecutorQuantity(taskId, executorName, quantity) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        
        const executor = this.tasks[taskIndex].executors?.find(e => e.name === executorName);
        if (!executor) return false;
        
        // Обновляем количество
        executor.quantity = quantity;
        
        // Пересчитываем общее выполнение
        const totalCompleted = this.tasks[taskIndex].executors.reduce((sum, e) => sum + (e.quantity || 0), 0);
        this.tasks[taskIndex].completedQuantity = totalCompleted;
        
        // Если исполнитель выполнил работу, отмечаем как in_progress
        if (quantity > 0 && executor.status !== 'completed') {
            executor.status = 'in_progress';
        }
        
        // Проверяем, выполнена ли задача полностью
        if (totalCompleted >= this.tasks[taskIndex].totalQuantity) {
            this.tasks[taskIndex].status = 'completed';
            this.tasks[taskIndex].completedQuantity = this.tasks[taskIndex].totalQuantity;
            
            this.updateOrderTaskStatus(taskId, 'completed');
        } else if (totalCompleted > 0) {
            this.tasks[taskIndex].status = 'in_progress';
            this.updateOrderTaskStatus(taskId, 'in_progress');
        }
        
        this.saveHistoryForDate(this.currentDate);
        return true;
    }
    
    // Обновить статус исполнителя
    updateExecutorStatus(taskId, executorName, status) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        
        const executor = this.tasks[taskIndex].executors?.find(e => e.name === executorName);
        if (!executor) return false;
        
        executor.status = status;
        
        if (status === 'in_progress' && this.tasks[taskIndex].status !== 'completed') {
            this.updateTaskStatus(taskId, 'in_progress');
        }
        
        this.saveHistoryForDate(this.currentDate);
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
    
    // Предыдущий день
    prevDay() {
        this.currentDate.setDate(this.currentDate.getDate() - 1);
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    // Следующий день
    nextDay() {
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    // Сегодня
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
