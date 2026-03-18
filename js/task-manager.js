// js/task-manager.js - УНИВЕРСАЛЬНЫЙ МЕНЕДЖЕР ЗАДАЧ (БЕЗ EXPORT)

class TaskManager {
    constructor(siteType, customOperations = {}) {
        this.siteType = siteType;
        this.customOperations = customOperations;
        this.currentDate = new Date();
        this.orders = [];
        this.tasks = [];
        
        // Флаги для предотвращения рекурсии
        this._isSaving = false;
        this._isLoading = false;
        this._isNotifying = false;
        this._lastNotificationTime = 0;
        
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
            'lazerno-gibochniy': {
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
        if (this._isLoading) {
            console.log('loadData: уже загружается, пропускаем');
            return this.tasks;
        }
        
        this._isLoading = true;
        
        try {
            // Загружаем заказы из глобальной функции если она есть
            if (typeof window.loadOrdersFromStorage === 'function') {
                this.orders = window.loadOrdersFromStorage() || [];
            } else {
                this.orders = [];
            }
            
            this.generateTasks();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.orders = [];
            this.tasks = [];
        } finally {
            // Сбрасываем флаг через setTimeout
            setTimeout(() => {
                this._isLoading = false;
            }, 100);
        }
        
        return this.tasks;
    }
    
generateTasks() {
    console.log('generateTasks начата для даты:', this.formatDate(this.currentDate));
    
    const dateStr = this.formatDate(this.currentDate);
    
    // Загружаем историю ТОЛЬКО для ЭТОЙ даты
    let historyTasks = [];
    try {
        const historyKey = `tasks_${this.siteType}_${dateStr}`;
        const history = localStorage.getItem(historyKey);
        if (history) {
            historyTasks = JSON.parse(history);
            console.log(`Загружено ${historyTasks.length} задач из истории для ${dateStr}`);
        } else {
            console.log(`Нет истории для ${dateStr}`);
        }
    } catch (error) {
        console.error('Ошибка загрузки истории:', error);
    }
    
    // Если есть задачи в истории для этой даты - используем их
    if (historyTasks.length > 0) {
        this.tasks = historyTasks;
        console.log(`Использую ${this.tasks.length} задач из истории для ${dateStr}`);
        return;
    }
    
    // Если нет истории - создаем пустой список
    this.tasks = [];
    console.log(`Создан пустой список задач для ${dateStr}`);
    
    // Сохраняем пустой список в историю
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
            if (key !== 'default' && productName && productName.includes(key)) {
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
            'lazerno-gibochniy': 'Лазерная операция',
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
    if (this._isSaving) {
        console.log('saveTasksToHistoryInternal: уже сохраняется, пропускаем');
        return;
    }
    
    this._isSaving = true;
    
    try {
        const historyKey = `tasks_${this.siteType}_${dateStr}`;
        
        // Сохраняем ТОЛЬКО задачи для этой конкретной даты
        localStorage.setItem(historyKey, JSON.stringify(this.tasks));
        console.log(`✅ История сохранена для ${dateStr}, задач: ${this.tasks.length}`);
        
    } catch (error) {
        console.error('Ошибка сохранения в историю:', error);
    } finally {
        setTimeout(() => {
            this._isSaving = false;
        }, 100);
    }
}
    
    // ============== УПРАВЛЕНИЕ ИСПОЛНИТЕЛЯМИ ==============
    
    addExecutor(taskId, executorName) {
        console.log('addExecutor called:', taskId, executorName);
        
        if (!executorName || !executorName.trim()) {
            console.warn('Имя исполнителя пустое');
            return false;
        }
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) {
            console.warn('Задача не найдена:', taskId);
            return false;
        }
        
        if (!task.executors) {
            task.executors = [];
        }
        
        // Проверяем, нет ли уже такого исполнителя
        const existing = task.executors.find(e => e.name && e.name.toLowerCase() === executorName.trim().toLowerCase());
        if (existing) {
            console.warn('Исполнитель уже существует:', executorName);
            return false;
        }
        
        // Создаем уникальный ID
        const executorId = `${executorName.trim()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        const newExecutor = {
            id: executorId,
            name: executorName.trim(),
            displayName: executorName.trim(),
            quantity: 0,
            status: 'pending'
        };
        
        task.executors.push(newExecutor);
        
        console.log('✅ Исполнитель добавлен, теперь исполнителей:', task.executors.length);
        
        // Сохраняем в историю
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
        
        if (typeof window.loadOrdersFromStorage === 'function') {
            const orders = window.loadOrdersFromStorage() || [];
            const orderIndex = orders.findIndex(o => o.id == orderId);
            
            if (orderIndex !== -1) {
                if (!orders[orderIndex].tasks) orders[orderIndex].tasks = {};
                
                orders[orderIndex].tasks[taskId] = this.convertTaskStatus(status);
                
                if (typeof window.saveOrdersToStorage === 'function') {
                    window.saveOrdersToStorage(orders);
                }
            }
        }
        
        this.notifyOtherTabs(taskId, status);
    }
    
    notifyOtherTabs(taskId, status) {
        setTimeout(() => {
            const event = new CustomEvent('taskStatusChanged', {
                detail: { 
                    taskId, 
                    status,
                    timestamp: Date.now()
                }
            });
            window.dispatchEvent(event);
        }, 10);
    }
    
    // ============== НАВИГАЦИЯ ПО ДАТАМ ==============
    
setDate(date) {
    this.currentDate = new Date(date);  // ПРОБЛЕМА: учитывает часовой пояс
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
    
    // Метод для отладки - проверить, что сохранено в истории
    debugHistory() {
        const dateStr = this.formatDate(this.currentDate);
        const historyKey = `tasks_${this.siteType}_${dateStr}`;
        const history = localStorage.getItem(historyKey);
        if (history) {
            const tasks = JSON.parse(history);
            console.log('=== ОТЛАДКА ИСТОРИИ ===');
            console.log(`Дата: ${dateStr}`);
            console.log(`Задач в истории: ${tasks.length}`);
            tasks.forEach(t => {
                console.log(`  Задача ${t.id}: ${t.executors?.length || 0} исполнителей`);
            });
        } else {
            console.log(`Нет истории для ${dateStr}`);
        }
    }
}

// Делаем класс глобально доступным
if (typeof window !== 'undefined') {
    window.TaskManager = TaskManager;
}

console.log('✅ task-manager.js загружен (без export)');
