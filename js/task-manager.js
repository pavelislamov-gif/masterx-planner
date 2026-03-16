// js/task-manager.js - УНИВЕРСАЛЬНЫЙ МЕНЕДЖЕР ЗАДАЧ

class TaskManager {
    constructor(siteType, customOperations = {}) {
        this.siteType = siteType;
        this.customOperations = customOperations;
        this.currentDate = new Date();
        this.orders = [];
        this.tasks = [];
        
        // База операций по умолчанию для каждого участка
        this.baseOperations = {
            // Токарный участок
            tokarniy: {
                'XRAY 6-T2 BT 220 Шторка х2': [
                    'Заготовка',
                    'Точение Корпуса',
                    'Заготовка деталей Крышка',
                    'Точение деталей Кольцо',
                    'Фрезеровка Корпуса'
                ],
                'XGRAY v.1': ['Заготовка', 'Точение профиля', 'Точение планки'],
                'XGRAY v.2': ['Заготовка', 'Точение профиля', 'Точение планки'],
                'XSMART': ['Заготовка', 'Точение корпуса'],
                'default': ['Заготовка', 'Точение', 'Доводка']
            },
            
            // Слесарный участок
            slesarniy: {
                'XRAY 6-T2 BT 220 Шторка х2': [
                    'Нарезка резьбы Корпус+V',
                    'Установка Резьбовых заклепок 4*16',
                    'Нарезка резьбы Основание платы+V',
                    'Обработка Корпуса',
                    'Обработка Основания платы',
                    'Голтовка Кронштейна',
                    'УВ корпуса'
                ],
                'XGRAY v.1': ['Сборка корпуса', 'Установка линз', 'Герметизация'],
                'default': ['Сборка', 'Доводка', 'Контроль']
            },
            
            // Фрезерный участок
            frezerniy: {
                'XRAY 6-T2 BT 220 Шторка х2': [
                    'Фрезеровка корпуса',
                    'Фрезеровка крышки',
                    'Сверление отверстий'
                ],
                'default': ['Фрезеровка', 'Сверление', 'Обработка']
            },
            
            // Лазерно-гибочный
            lazerno: {
                'XRAY 6-T2 BT 220 Шторка х2': [
                    'Раскрой Основания платы',
                    'Раскрой Фоновая заглушка',
                    'Раскрой Кронштейн BT',
                    'Гибка Кронштейн BT'
                ],
                'default': ['Раскрой', 'Гибка', 'Резка']
            },
            
            // Полимерный
            polimerniy: {
                'XRAY 6-T2 BT 220 Шторка х2': [
                    'Корпус',
                    'Фоновая заглушка',
                    'Покраска'
                ],
                'default': ['Полимеризация', 'Покраска', 'Напыление']
            }
        };
    }
    
    // ============== ЗАГРУЗКА ДАННЫХ ==============
    
    loadData() {
        try {
            this.orders = loadOrdersFromStorage() || [];
            this.generateTasks();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.orders = [];
            this.tasks = [];
        }
        return this.tasks;
    }
    
    generateTasks() {
        this.tasks = [];
        const dateStr = this.formatDate(this.currentDate);
        
        this.orders.forEach(order => {
            if (order.status !== 'active') return;
            
            order.items.forEach(item => {
                const productName = item.product;
                const operations = this.getOperationsForProduct(productName);
                
                operations.forEach((op, index) => {
                    const taskId = `${order.id}_${this.siteType}_${index}_${Date.now()}`;
                    const taskStatus = order.tasks?.[taskId];
                    
                    const savedTask = this.loadTaskFromHistory(taskId, dateStr);
                    
                    this.tasks.push({
                        id: taskId,
                        orderId: order.id,
                        orderNumber: order.number,
                        product: productName,
                        size: item.size || 'Стандартный',
                        totalQuantity: parseInt(item.quantity) || 1,
                        completedQuantity: this.safeParseInt(savedTask?.completedQuantity) || 0,
                        operation: op,
                        index: index,
                        status: this.convertSquareStatus(taskStatus),
                        executors: savedTask?.executors?.map(e => ({
                            ...e,
                            quantity: this.safeParseInt(e.quantity) || 0
                        })) || [],
                        date: dateStr,
                        isExtra: false
                    });
                });
            });
            
            // Дополнительные задачи
            if (order.extraTasks) {
                order.extraTasks.forEach((extra, index) => {
                    if (extra.site !== this.siteType) return;
                    
                    const taskId = `${order.id}_extra_${index}`;
                    const taskStatus = order.tasks?.[taskId];
                    
                    const savedTask = this.loadTaskFromHistory(taskId, dateStr);
                    
                    this.tasks.push({
                        id: taskId,
                        orderId: order.id,
                        orderNumber: order.number,
                        product: extra.title,
                        description: extra.description || '',
                        totalQuantity: 1,
                        completedQuantity: this.safeParseInt(savedTask?.completedQuantity) || 0,
                        operation: extra.title,
                        isExtra: true,
                        status: this.convertSquareStatus(taskStatus),
                        executors: savedTask?.executors?.map(e => ({
                            ...e,
                            quantity: this.safeParseInt(e.quantity) || 0
                        })) || [],
                        date: dateStr
                    });
                });
            }
        });
        
        this.saveTasksToHistory(dateStr);
    }
    
    // ============== РАБОТА С ОПЕРАЦИЯМИ ==============
    
    getOperationsForProduct(productName) {
        // 1. Сначала ищем в кастомных операциях (из страницы участка)
        if (this.customOperations[productName]) {
            return this.customOperations[productName];
        }
        
        // 2. Потом в базовых для этого участка
        const siteOps = this.baseOperations[this.siteType] || {};
        if (siteOps[productName]) {
            return siteOps[productName];
        }
        
        // 3. Частичное совпадение
        const allOps = { ...this.customOperations, ...siteOps };
        for (const key in allOps) {
            if (key !== 'default' && productName.includes(key)) {
                return allOps[key];
            }
        }
        
        // 4. По умолчанию
        return siteOps.default || [this.getDefaultOperationName()];
    }
    
    getDefaultOperationName() {
        const names = {
            'tokarniy': 'Токарная операция',
            'slesarniy': 'Слесарная операция',
            'frezerniy': 'Фрезерная операция',
            'lazerno': 'Лазерная операция',
            'polimerniy': 'Полимерная операция'
        };
        return names[this.siteType] || 'Операция';
    }
    
    // ============== КОНВЕРТАЦИЯ СТАТУСОВ ==============
    
    convertSquareStatus(squareStatus) {
        if (squareStatus === 'green') return 'completed';
        if (squareStatus === 'orange') return 'in_progress';
        return 'pending';
    }
    
    convertTaskStatus(taskStatus) {
        if (taskStatus === 'completed') return 'green';
        if (taskStatus === 'in_progress') return 'orange';
        return '';
    }
    
    // ============== РАБОТА С ИСТОРИЕЙ ==============
    
    loadTaskFromHistory(taskId, dateStr) {
        try {
            const historyKey = `tasks_${this.siteType}_${dateStr}`;
            const history = localStorage.getItem(historyKey);
            if (history) {
                const tasks = JSON.parse(history);
                return tasks.find(t => t.id === taskId) || null;
            }
        } catch (error) {
            console.error('Ошибка загрузки из истории:', error);
        }
        return null;
    }
    
    saveTasksToHistory(dateStr) {
        try {
            const historyKey = `tasks_${this.siteType}_${dateStr}`;
            
            // Проверяем, не было ли изменений из другой вкладки
            const existingData = localStorage.getItem(historyKey);
            if (existingData) {
                const existingTasks = JSON.parse(existingData);
                // Объединяем данные (более новый приоритет)
                this.mergeTaskHistory(existingTasks);
            }
            
            localStorage.setItem(historyKey, JSON.stringify(this.tasks));
            
            // Оповещаем другие вкладки об изменении
            this.notifyHistoryChanged(dateStr);
        } catch (error) {
            console.error('Ошибка сохранения в историю:', error);
        }
    }
    
    mergeTaskHistory(existingTasks) {
        // Для каждой текущей задачи ищем в существующей истории
        this.tasks.forEach(currentTask => {
            const existingTask = existingTasks.find(et => et.id === currentTask.id);
            if (existingTask) {
                // Если у существующей задачи больше выполненное количество, берём его
                if (existingTask.completedQuantity > currentTask.completedQuantity) {
                    currentTask.completedQuantity = existingTask.completedQuantity;
                    currentTask.executors = existingTask.executors;
                    currentTask.status = existingTask.status;
                }
            }
        });
    }
    
    notifyHistoryChanged(dateStr) {
        const event = new CustomEvent('taskHistoryChanged', {
            detail: { siteType: this.siteType, date: dateStr }
        });
        window.dispatchEvent(event);
    }
    
    // ============== УПРАВЛЕНИЕ ИСПОЛНИТЕЛЯМИ ==============
    
    addExecutor(taskId, executorName) {
        if (!executorName || !executorName.trim()) return false;
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        if (!task.executors) task.executors = [];
        
        // Создаём уникальный ID для исполнителя
        const executorId = `${executorName.trim()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        task.executors.push({
            id: executorId,
            name: executorName.trim(),
            displayName: executorName.trim(),
            quantity: 0,
            status: 'pending'
        });
        
        this.saveTasksToHistory(this.formatDate(this.currentDate));
        return true;
    }
    
    updateExecutorQuantity(taskId, executorId, quantity) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        const executor = task.executors.find(e => e.id === executorId);
        if (!executor) return false;
        
        // Валидация количества
        quantity = this.safeParseInt(quantity);
        quantity = Math.max(0, Math.min(quantity, task.totalQuantity));
        
        const oldQuantity = executor.quantity;
        executor.quantity = quantity;
        
        // Пересчитываем общее выполнение
        const totalAssigned = task.executors.reduce((sum, e) => sum + (e.quantity || 0), 0);
        
        // Если превысили общее количество, корректируем
        if (totalAssigned > task.totalQuantity) {
            // Пропорционально уменьшаем
            const ratio = task.totalQuantity / totalAssigned;
            task.executors.forEach(e => {
                if (e.id === executorId) {
                    e.quantity = quantity; // текущий не меняем
                } else {
                    e.quantity = Math.floor(e.quantity * ratio);
                }
            });
        }
        
        // Обновляем общее выполнение
        task.completedQuantity = task.executors.reduce((sum, e) => sum + (e.quantity || 0), 0);
        
        // Обновляем статус задачи
        if (task.completedQuantity >= task.totalQuantity) {
            task.status = 'completed';
            this.updateOrderStatus(taskId, 'completed');
        } else if (task.completedQuantity > 0) {
            task.status = 'in_progress';
            this.updateOrderStatus(taskId, 'in_progress');
        }
        
        this.saveTasksToHistory(this.formatDate(this.currentDate));
        return true;
    }
    
    updateExecutorStatus(taskId, executorId, status) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        const executor = task.executors.find(e => e.id === executorId);
        if (!executor) return false;
        
        executor.status = status;
        
        if (status === 'in_progress' && task.status !== 'completed') {
            task.status = 'in_progress';
            this.updateOrderStatus(taskId, 'in_progress');
        }
        
        this.saveTasksToHistory(this.formatDate(this.currentDate));
        return true;
    }
    
    removeExecutor(taskId, executorId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        task.executors = task.executors.filter(e => e.id !== executorId);
        
        // Пересчитываем общее выполнение
        task.completedQuantity = task.executors.reduce((sum, e) => sum + (e.quantity || 0), 0);
        
        // Обновляем статус
        if (task.completedQuantity === 0) {
            task.status = 'pending';
            this.updateOrderStatus(taskId, 'pending');
        }
        
        this.saveTasksToHistory(this.formatDate(this.currentDate));
        return true;
    }
    
    // ============== ЗАВЕРШЕНИЕ ЗАДАЧИ ==============
    
    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        // Распределяем оставшееся количество
        const totalAssigned = task.executors.reduce((sum, e) => sum + (e.quantity || 0), 0);
        const remaining = task.totalQuantity - totalAssigned;
        
        if (remaining > 0 && task.executors.length > 0) {
            // Добавляем остаток первому активному исполнителю
            const activeExecutor = task.executors.find(e => e.status === 'in_progress') || task.executors[0];
            activeExecutor.quantity = (activeExecutor.quantity || 0) + remaining;
        }
        
        task.status = 'completed';
        task.completedQuantity = task.totalQuantity;
        
        task.executors.forEach(e => {
            e.status = 'completed';
        });
        
        this.updateOrderStatus(taskId, 'completed');
        this.saveTasksToHistory(this.formatDate(this.currentDate));
        return true;
    }
    
    // ============== ОБНОВЛЕНИЕ СТАТУСА В ЗАКАЗЕ ==============
    
    updateOrderStatus(taskId, status) {
        const [orderId] = taskId.split('_');
        const orders = loadOrdersFromStorage() || [];
        const orderIndex = orders.findIndex(o => o.id == orderId);
        
        if (orderIndex === -1) return;
        
        if (!orders[orderIndex].tasks) orders[orderIndex].tasks = {};
        
        orders[orderIndex].tasks[taskId] = this.convertTaskStatus(status);
        saveOrdersToStorage(orders);
        
        this.notifyOtherTabs(taskId, status);
    }
    
    // ============== УВЕДОМЛЕНИЯ ==============
    
    notifyOtherTabs(taskId, status) {
        const event = new CustomEvent('taskStatusChanged', {
            detail: { taskId, status }
        });
        window.dispatchEvent(event);
    }
    
    // ============== НАВИГАЦИЯ ПО ДАТАМ ==============
    
    setDate(date) {
        this.currentDate = new Date(date);
        this.loadData();
        return this.tasks;
    }
    
    prevDay() {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() - 1);
        
        // Проверка на выходной (опционально)
        // if (!this.isWorkingDay(newDate)) {
        //     return this.prevDay.call(this); // пропускаем выходной
        // }
        
        this.currentDate = newDate;
        this.loadData();
        return this.tasks;
    }
    
    nextDay() {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + 1);
        this.currentDate = newDate;
        this.loadData();
        return this.tasks;
    }
    
    today() {
        this.currentDate = new Date();
        this.loadData();
        return this.tasks;
    }
    
    isWorkingDay(date) {
        const day = date.getDay();
        return day !== 0 && day !== 6; // не воскресенье и не суббота
    }
    
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    // ============== СТАТИСТИКА ==============
    
    getStats() {
        return {
            total: this.tasks.length,
            pending: this.tasks.filter(t => t.status === 'pending').length,
            inProgress: this.tasks.filter(t => t.status === 'in_progress').length,
            completed: this.tasks.filter(t => t.status === 'completed').length
        };
    }
    
    getTasksByStatus(status) {
        if (status === 'all') return this.tasks;
        return this.tasks.filter(t => t.status === status);
    }
    
    // ============== ВСПОМОГАТЕЛЬНЫЕ ==============
    
    safeParseInt(value) {
        if (value === undefined || value === null) return 0;
        const parsed = parseInt(value);
        return isNaN(parsed) ? 0 : parsed;
    }
}

// Делаем класс глобально доступным
window.TaskManager = TaskManager;
