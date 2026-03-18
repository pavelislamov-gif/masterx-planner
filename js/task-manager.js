// ============== task-manager.js - УНИВЕРСАЛЬНЫЙ МЕНЕДЖЕР ЗАДАЧ ==============
// ВСЕ ОПЕРАЦИИ БЕРУТСЯ ИЗ task-operations.js (TASK_OPERATIONS)

// Хранилище задач
let tasks = [];
let currentFilterDate = new Date().toISOString().split('T')[0]; // Сегодня по умолчанию

// Класс TaskManager
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
    }

    // ============== ЗАГРУЗКА ДАННЫХ ==============
    
    loadData() {
        if (this._isLoading) {
            console.log('loadData: уже загружается, пропускаем');
            return this.tasks;
        }
        
        this._isLoading = true;
        
        try {
            this.orders = typeof window.loadOrdersFromStorage === 'function' 
                ? window.loadOrdersFromStorage() || [] 
                : [];
            this.generateTasks();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.orders = [];
            this.tasks = [];
        } finally {
            setTimeout(() => {
                this._isLoading = false;
            }, 100);
        }
        
        return this.tasks;
    }
    
    generateTasks() {
        console.log('generateTasks начата для участка:', this.siteType);
        this.tasks = [];
        const dateStr = this.formatDate(this.currentDate);
        
        // Загружаем историю для этой даты
        let historyTasks = [];
        try {
            const historyKey = `tasks_${this.siteType}_${dateStr}`;
            const history = localStorage.getItem(historyKey);
            if (history) {
                historyTasks = JSON.parse(history);
                console.log(`Загружено ${historyTasks.length} задач из истории`);
            }
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
        }
        
        if (!this.orders || this.orders.length === 0) {
            this.tasks = historyTasks;
            return;
        }
        
        this.orders.forEach(order => {
            if (order.status !== 'active') return;
            
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item, idx) => {
                    const productName = item.product || 'Изделие';
                    const operations = this.getOperationsForProduct(productName);
                    
                    operations.forEach((op, index) => {
                        const taskId = `${order.id}_${this.siteType}_${idx}_${index}`;
                        const taskStatus = order.tasks?.[taskId];
                        
                        const historyTask = historyTasks.find(t => t.id === taskId);
                        
                        const task = {
                            id: taskId,
                            orderId: order.id,
                            orderNumber: order.number || order.id,
                            product: productName,
                            size: item.size || 'Стандартный',
                            totalQuantity: parseInt(item.quantity) || 1,
                            completedQuantity: historyTask?.completedQuantity || 0,
                            operation: op,
                            index: index,
                            status: historyTask?.status || this.convertSquareStatus(taskStatus) || 'pending',
                            executors: historyTask?.executors || [],
                            date: dateStr,
                            isExtra: false
                        };
                        
                        this.tasks.push(task);
                    });
                });
            }
            
            if (order.extraTasks && Array.isArray(order.extraTasks)) {
                order.extraTasks.forEach((extra, index) => {
                    if (extra.site !== this.siteType) return;
                    
                    const taskId = `${order.id}_extra_${index}`;
                    const taskStatus = order.tasks?.[taskId];
                    
                    const historyTask = historyTasks.find(t => t.id === taskId);
                    
                    const task = {
                        id: taskId,
                        orderId: order.id,
                        orderNumber: order.number || order.id,
                        product: extra.title || 'Доп. задача',
                        description: extra.description || '',
                        totalQuantity: 1,
                        completedQuantity: historyTask?.completedQuantity || 0,
                        operation: extra.title || 'Доп. операция',
                        isExtra: true,
                        status: historyTask?.status || this.convertSquareStatus(taskStatus) || 'pending',
                        executors: historyTask?.executors || [],
                        date: dateStr
                    };
                    
                    this.tasks.push(task);
                });
            }
        });
        
        console.log(`generateTasks завершена, всего задач: ${this.tasks.length}`);
        this._saveTasksToHistoryInternal(dateStr);
    }
    
    // ============== ПОЛУЧЕНИЕ ОПЕРАЦИЙ ИЗ ТЕХКАРТ ==============
    
    getOperationsForProduct(productName) {
        // 1. Сначала ищем в кастомных операциях
        if (this.customOperations[productName]) {
            return this.customOperations[productName];
        }
        
        // 2. Потом в TASK_OPERATIONS из task-operations.js
        if (window.TASK_OPERATIONS && window.TASK_OPERATIONS[this.siteType]) {
            const siteOps = window.TASK_OPERATIONS[this.siteType];
            
            // Точное совпадение
            if (siteOps[productName]) {
                return siteOps[productName];
            }
            
            // Частичное совпадение
            for (const key in siteOps) {
                if (key !== 'default' && productName && productName.includes(key)) {
                    return siteOps[key];
                }
            }
            
            // Операции по умолчанию для этого участка
            if (siteOps['default']) {
                return siteOps['default'];
            }
        }
        
        // 3. Если ничего не нашли
        console.warn(`Не найдены операции для ${productName} на участке ${this.siteType}`);
        return [this.getDefaultOperationName()];
    }
    
    getDefaultOperationName() {
        const names = {
            'tokarniy': 'Токарная операция',
            'slesarniy': 'Слесарная операция',
            'frezerniy': 'Фрезерная операция',
            'lazerno-gibochniy': 'Лазерно-гибочная операция',
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
    
    _saveTasksToHistoryInternal(dateStr) {
        if (this._isSaving) {
            console.log('saveTasksToHistoryInternal: уже сохраняется, пропускаем');
            return;
        }
        
        this._isSaving = true;
        
        try {
            const historyKey = `tasks_${this.siteType}_${dateStr}`;
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
    
    saveTasksToHistory(dateStr) {
        this._saveTasksToHistoryInternal(dateStr);
        
        const now = Date.now();
        if (now - this._lastNotificationTime < 500) {
            return;
        }
        
        this._lastNotificationTime = now;
        this.notifyHistoryChanged(dateStr);
    }
    
    notifyHistoryChanged(dateStr) {
        if (this._isNotifying) return;
        
        this._isNotifying = true;
        
        setTimeout(() => {
            try {
                const event = new CustomEvent('taskHistoryChanged', {
                    detail: { 
                        siteType: this.siteType, 
                        date: dateStr,
                        timestamp: Date.now()
                    }
                });
                window.dispatchEvent(event);
                console.log(`📢 Уведомление отправлено для ${dateStr}`);
            } catch (error) {
                console.error('Ошибка при отправке уведомления:', error);
            } finally {
                setTimeout(() => {
                    this._isNotifying = false;
                }, 300);
            }
        }, 10);
    }
    
    // ============== УПРАВЛЕНИЕ ИСПОЛНИТЕЛЯМИ ==============
    
    addExecutor(taskId, executorName) {
        console.log('addExecutor:', taskId, executorName);
        
        if (!executorName || !executorName.trim()) return false;
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        if (!task.executors) task.executors = [];
        
        const existing = task.executors.find(e => e.name?.toLowerCase() === executorName.trim().toLowerCase());
        if (existing) return false;
        
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
        console.log('updateExecutorQuantity:', taskId, executorId, quantity);
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        const executor = task.executors.find(e => e.id === executorId);
        if (!executor) return false;
        
        quantity = this.safeParseInt(quantity);
        quantity = Math.max(0, Math.min(quantity, task.totalQuantity));
        
        executor.quantity = quantity;
        
        // Обновляем общее количество выполненных
        task.completedQuantity = task.executors.reduce((sum, e) => sum + (e.quantity || 0), 0);
        
        // Обновляем статус задачи в зависимости от прогресса
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
    
    // ============== ОСНОВНОЙ МЕТОД ИЗМЕНЕНИЯ СТАТУСА ==============
    updateExecutorStatus(taskId, executorId, status) {
        console.log('updateExecutorStatus вызван:', { taskId, executorId, status });
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) {
            console.warn('Задача не найдена:', taskId);
            return false;
        }
        
        const executor = task.executors.find(e => e.id === executorId);
        if (!executor) {
            console.warn('Исполнитель не найден:', executorId);
            return false;
        }
        
        // Обновляем статус исполнителя
        executor.status = status;
        console.log('Статус исполнителя обновлен:', executor);
        
        // Определяем новый статус задачи на основе всех исполнителей
        const allCompleted = task.executors.every(e => e.status === 'completed');
        const anyInProgress = task.executors.some(e => e.status === 'in_progress');
        
        let newTaskStatus;
        if (allCompleted) {
            newTaskStatus = 'completed';
            console.log('Все исполнители завершили, задача выполнена');
        } else if (anyInProgress) {
            newTaskStatus = 'in_progress';
            console.log('Задача в работе');
        } else {
            newTaskStatus = 'pending';
            console.log('Задача ожидает');
        }
        
        // Обновляем статус задачи
        task.status = newTaskStatus;
        
        // Обновляем статус в заказе
        this.updateOrderStatus(taskId, newTaskStatus);
        
        // Сохраняем в историю
        this.saveTasksToHistory(this.formatDate(this.currentDate));
        
        return true;
    }
    // ============================================================
    
    removeExecutor(taskId, executorId) {
        console.log('removeExecutor:', taskId, executorId);
        
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
        console.log('completeTask:', taskId);
        
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
        task.executors.forEach(e => e.status = 'completed');
        
        this.updateOrderStatus(taskId, 'completed');
        this.saveTasksToHistory(this.formatDate(this.currentDate));
        return true;
    }
    
    updateOrderStatus(taskId, status) {
        console.log('updateOrderStatus:', taskId, status);
        
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
    
    // ============== МЕТОД ДЛЯ УВЕДОМЛЕНИЯ ДРУГИХ ВКЛАДОК ==============
    notifyOtherTabs(taskId, status) {
        console.log('📢 notifyOtherTabs:', taskId, status);
        
        // Сохраняем в localStorage для других вкладок
        const data = {
            taskId: taskId,
            status: status,
            timestamp: Date.now()
        };
        localStorage.setItem('taskStatusChanged', JSON.stringify(data));
        console.log('💾 Сохранено в localStorage:', data);
    }
    
    // ============== НАВИГАЦИЯ ПО ДАТАМ ==============
    
    setDate(date) {
        const [year, month, day] = date.split('-');
        this.currentDate = new Date(year, month - 1, day, 12, 0, 0);
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
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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

// ============== ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ЗАДАЧАМИ ==============

function loadTasks() {
    const savedTasks = localStorage.getItem('production_tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        tasks = [
            {
                id: 1,
                title: 'Изготовление вала',
                description: 'Вал приводной, чертеж 123',
                site: 'tokarniy',
                status: 'in-progress',
                date: '2026-03-18',
                deadline: '2026-03-18',
                assignee: 'Петров'
            },
            {
                id: 2,
                title: 'Фрезеровка корпуса',
                description: 'Корпус редуктора',
                site: 'frezerniy',
                status: 'new',
                date: '2026-03-18',
                deadline: '2026-03-19',
                assignee: 'Сидоров'
            },
            {
                id: 3,
                title: 'Гибка листа',
                description: 'Лист 3мм, чертеж 456',
                site: 'lazerno-gibochniy',
                status: 'pending',
                date: '2026-03-19',
                deadline: '2026-03-20',
                assignee: 'Иванов'
            },
            {
                id: 4,
                title: 'Полировка деталей',
                description: 'Комплект деталей',
                site: 'polimerniy',
                status: 'new',
                date: '2026-03-20',
                deadline: '2026-03-21',
                assignee: 'Козлов'
            }
        ];
        saveTasks();
    }
    return tasks;
}

function saveTasks() {
    localStorage.setItem('production_tasks', JSON.stringify(tasks));
}

function getTasksBySiteAndDate(site, date = currentFilterDate) {
    return tasks.filter(task => task.site === site && task.date === date);
}

function getTodayTasksBySite(site) {
    const today = new Date().toISOString().split('T')[0];
    return getTasksBySiteAndDate(site, today);
}

function getTasksByDate(date) {
    return tasks.filter(task => task.date === date);
}

function setFilterDate(date) {
    currentFilterDate = date;
    return currentFilterDate;
}

function getCurrentFilterDate() {
    return currentFilterDate;
}

function addTask(task) {
    task.id = Date.now();
    task.date = task.date || new Date().toISOString().split('T')[0];
    tasks.push(task);
    saveTasks();
    return task;
}

function updateTask(updatedTask) {
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
        tasks[index] = updatedTask;
        saveTasks();
        return true;
    }
    return false;
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
}

function getTasksStats(date = currentFilterDate) {
    const tasksOnDate = tasks.filter(task => task.date === date);
    
    return {
        total: tasksOnDate.length,
        active: tasksOnDate.filter(t => t.status !== 'completed').length,
        completed: tasksOnDate.filter(t => t.status === 'completed').length,
        bySite: {
            tokarniy: tasksOnDate.filter(t => t.site === 'tokarniy').length,
            frezerniy: tasksOnDate.filter(t => t.site === 'frezerniy').length,
            'lazerno-gibochniy': tasksOnDate.filter(t => t.site === 'lazerno-gibochniy').length,
            polimerniy: tasksOnDate.filter(t => t.site === 'polimerniy').length,
            slesarniy: tasksOnDate.filter(t => t.site === 'slesarniy').length
        }
    };
}

// ============== ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ==============
window.TaskManager = TaskManager;
window.tasks = tasks;
window.loadTasks = loadTasks;
window.saveTasks = saveTasks;
window.getTasksBySiteAndDate = getTasksBySiteAndDate;
window.getTodayTasksBySite = getTodayTasksBySite;
window.getTasksByDate = getTasksByDate;
window.setFilterDate = setFilterDate;
window.getCurrentFilterDate = getCurrentFilterDate;
window.addTask = addTask;
window.updateTask = updateTask;
window.deleteTask = deleteTask;
window.getTasksStats = getTasksStats;

console.log('✅ task-manager.js загружен (операции берутся из TASK_OPERATIONS)');
