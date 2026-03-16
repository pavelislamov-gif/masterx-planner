// js/task-manager.js - УНИВЕРСАЛЬНЫЙ МЕНЕДЖЕР ЗАДАЧ (ИСПРАВЛЕННАЯ ВЕРСИЯ)

class TaskManager {
    constructor(siteType, customOperations = {}) {
        this.siteType = siteType;
        this.customOperations = customOperations;
        this.currentDate = new Date();
        this.orders = [];
        this.tasks = [];
        
        // Флаг для предотвращения рекурсии
        this._isSaving = false;
        this._isLoading = false;
        
        // База операций по умолчанию для каждого участка
        this.baseOperations = {
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
                'default': ['Заготовка', 'Точение', 'Доводка']
            },
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
                'default': ['Сборка', 'Доводка', 'Контроль']
            },
            frezerniy: {
                'default': ['Фрезеровка', 'Сверление', 'Обработка']
            },
            lazerno: {
                'default': ['Раскрой', 'Гибка', 'Резка']
            },
            polimerniy: {
                'default': ['Полимеризация', 'Покраска', 'Напыление']
            }
        };
    }
    
    // ============== ЗАГРУЗКА ДАННЫХ ==============
    
    loadData() {
        // Предотвращаем повторный вход
        if (this._isLoading) return this.tasks;
        this._isLoading = true;
        
        try {
            this.orders = typeof loadOrdersFromStorage === 'function' 
                ? loadOrdersFromStorage() || [] 
                : [];
            this.generateTasks();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.orders = [];
            this.tasks = [];
        } finally {
            this._isLoading = false;
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
        
        // Сохраняем без уведомления (флаг _isSaving предотвратит рекурсию)
        this._saveTasksToHistoryInternal(dateStr);
    }
    
    // ============== РАБОТА С ОПЕРАЦИЯМИ ==============
    
    getOperationsForProduct(productName) {
        // 1. Сначала ищем в кастомных операциях
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
    
    // Внутренний метод сохранения без уведомления
    _saveTasksToHistoryInternal(dateStr) {
        if (this._isSaving) return;
        this._isSaving = true;
        
        try {
            const historyKey = `tasks_${this.siteType}_${dateStr}`;
            localStorage.setItem(historyKey, JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Ошибка сохранения в историю:', error);
        } finally {
            this._isSaving = false;
        }
    }
    
    // Публичный метод с уведомлением
    saveTasksToHistory(dateStr) {
        this._saveTasksToHistoryInternal(dateStr);
        this.notifyHistoryChanged(dateStr);
    }
    
    notifyHistoryChanged(dateStr) {
        // Используем setTimeout, чтобы избежать синхронной рекурсии
        setTimeout(() => {
            const event = new CustomEvent('taskHistoryChanged', {
                detail: { siteType: this.siteType, date: dateStr }
            });
            window.dispatchEvent(event);
        }, 0);
    }
    
    // ============== УПРАВЛЕНИЕ ИСПОЛНИТЕЛЯМИ ==============
    
    addExecutor(taskId, executorName) {
        if (!executorName || !executorName.trim()) return false;
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        if (!task.executors) task.executors = [];
        
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
        
        quantity = this.safeParseInt(quantity);
        quantity = Math.max(0, Math.min(quantity, task.totalQuantity));
        
        executor.quantity = quantity;
        
        const totalAssigned = task.executors.reduce((sum, e) => sum + (e.quantity || 0), 0);
        
        if (totalAssigned > task.totalQuantity) {
            const ratio = task.totalQuantity / totalAssigned;
            task.executors.forEach(e => {
                if (e.id === executorId) {
                    e.quantity = quantity;
                } else {
                    e.quantity = Math.floor(e.quantity * ratio);
                }
            });
        }
        
        task.completedQuantity = task.executors.reduce((sum, e) => sum + (e.quantity || 0), 0);
        
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
        
        task.completedQuantity = task.executors.reduce((sum, e) => sum + (e.quantity || 0), 0);
        
        if (task.completedQuantity === 0) {
            task.status = 'pending';
            this.updateOrderStatus(taskId, 'pending');
        }
        
        this.saveTasksToHistory(this.formatDate(this.currentDate));
        return true;
    }
    
    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        const totalAssigned = task.executors.reduce((sum, e) => sum + (e.quantity || 0), 0);
        const remaining = task.totalQuantity - totalAssigned;
        
        if (remaining > 0 && task.executors.length > 0) {
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
    
    updateOrderStatus(taskId, status) {
        const [orderId] = taskId.split('_');
        const orders = typeof loadOrdersFromStorage === 'function' ? loadOrdersFromStorage() || [] : [];
        const orderIndex = orders.findIndex(o => o.id == orderId);
        
        if (orderIndex === -1) return;
        
        if (!orders[orderIndex].tasks) orders[orderIndex].tasks = {};
        
        orders[orderIndex].tasks[taskId] = this.convertTaskStatus(status);
        
        if (typeof saveOrdersToStorage === 'function') {
            saveOrdersToStorage(orders);
        }
        
        this.notifyOtherTabs(taskId, status);
    }
    
    notifyOtherTabs(taskId, status) {
        // Используем setTimeout для асинхронной отправки
        setTimeout(() => {
            const event = new CustomEvent('taskStatusChanged', {
                detail: { taskId, status }
            });
            window.dispatchEvent(event);
        }, 0);
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
if (typeof window !== 'undefined') {
    window.TaskManager = TaskManager;
}

console.log('✅ task-manager.js загружен (исправленная версия)');
