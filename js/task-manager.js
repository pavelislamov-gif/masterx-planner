// js/task-manager.js - УНИВЕРСАЛЬНЫЙ МЕНЕДЖЕР ЗАДАЧ (ИСПРАВЛЕННАЯ ВЕРСИЯ)
// Хранилище задач
let tasks = [];
let currentFilterDate = new Date().toISOString().split('T')[0]; // Сегодня по умолчанию

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
// Загрузка задач из localStorage
export function loadTasks() {
    const savedTasks = localStorage.getItem('production_tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        // Тестовые данные
        tasks = [
            {
                id: 1,
                title: 'Изготовление вала',
                description: 'Вал приводной, чертеж 123',
                site: 'tokarniy',
                status: 'in-progress',
                date: '2026-03-18', // Сегодня
                deadline: '2026-03-18',
                assignee: 'Петров'
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
            {
                id: 2,
                title: 'Фрезеровка корпуса',
                description: 'Корпус редуктора',
                site: 'frezerniy',
                status: 'new',
                date: '2026-03-18', // Сегодня
                deadline: '2026-03-19',
                assignee: 'Сидоров'
            },
            frezerniy: {
                'default': ['Фрезеровка', 'Сверление', 'Обработка']
            {
                id: 3,
                title: 'Гибка листа',
                description: 'Лист 3мм, чертеж 456',
                site: 'lazerno-gibochniy',
                status: 'pending',
                date: '2026-03-19', // Завтра
                deadline: '2026-03-20',
                assignee: 'Иванов'
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
        if (this._isLoading) {
            console.log('loadData: уже загружается, пропускаем');
            return this.tasks;
        }
        
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
            // Сбрасываем флаг через setTimeout
            setTimeout(() => {
                this._isLoading = false;
            }, 100);
        }
        
        return this.tasks;
    }
    
    generateTasks() {
        console.log('generateTasks начата');
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
        
        this.orders.forEach(order => {
            if (order.status !== 'active') return;
            
            order.items.forEach(item => {
                const productName = item.product;
                const operations = this.getOperationsForProduct(productName);
                
                operations.forEach((op, index) => {
                    const taskId = `${order.id}_${this.siteType}_${index}`;
                    const taskStatus = order.tasks?.[taskId];
                    
                    // Ищем задачу в истории
                    const historyTask = historyTasks.find(t => t.id === taskId);
                    
                    const task = {
                        id: taskId,
                        orderId: order.id,
                        orderNumber: order.number,
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
                    
                    console.log(`Создана задача ${taskId} с ${task.executors.length} исполнителями:`, task.executors);
                    this.tasks.push(task);
                });
            });
            
            // Дополнительные задачи
            if (order.extraTasks) {
                order.extraTasks.forEach((extra, index) => {
                    if (extra.site !== this.siteType) return;
                    
                    const taskId = `${order.id}_extra_${index}`;
                    const taskStatus = order.tasks?.[taskId];
                    
                    const historyTask = historyTasks.find(t => t.id === taskId);
                    
                    const task = {
                        id: taskId,
                        orderId: order.id,
                        orderNumber: order.number,
                        product: extra.title,
                        description: extra.description || '',
                        totalQuantity: 1,
                        completedQuantity: historyTask?.completedQuantity || 0,
                        operation: extra.title,
                        isExtra: true,
                        status: historyTask?.status || this.convertSquareStatus(taskStatus) || 'pending',
                        executors: historyTask?.executors || [],
                        date: dateStr
                    };
                    
                    console.log(`Создана доп. задача ${taskId} с ${task.executors.length} исполнителями:`, task.executors);
                    this.tasks.push(task);
                });
            }
        });
        
        console.log(`generateTasks завершена, всего задач: ${this.tasks.length}`);
        
        // Сохраняем в историю
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
            {
                id: 4,
                title: 'Полировка деталей',
                description: 'Комплект деталей',
                site: 'polimerniy',
                status: 'new',
                date: '2026-03-20', // Послезавтра
                deadline: '2026-03-21',
                assignee: 'Козлов'
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
        if (this._isSaving) {
            console.log('saveTasksToHistoryInternal: уже сохраняется, пропускаем');
            return;
        }
        
        this._isSaving = true;
        
        try {
            const historyKey = `tasks_${this.siteType}_${dateStr}`;
            
            // Загружаем существующую историю
            let existingTasks = [];
            try {
                const existing = localStorage.getItem(historyKey);
                if (existing) {
                    existingTasks = JSON.parse(existing);
                }
            } catch (e) {
                console.warn('Ошибка загрузки существующей истории:', e);
            }
            
            // Объединяем задачи - сохраняем все текущие задачи
            localStorage.setItem(historyKey, JSON.stringify(this.tasks));
            console.log(`✅ История сохранена для ${dateStr}, задач: ${this.tasks.length}`);
            
            // Для отладки: проверим, сохранились ли исполнители
            const saved = JSON.parse(localStorage.getItem(historyKey));
            const totalExecutors = saved.reduce((sum, t) => sum + (t.executors?.length || 0), 0);
            console.log(`  Из них исполнителей: ${totalExecutors}`);
            
        } catch (error) {
            console.error('Ошибка сохранения в историю:', error);
        } finally {
            setTimeout(() => {
                this._isSaving = false;
            }, 100);
        }
    }
    
    // Публичный метод с уведомлением
    saveTasksToHistory(dateStr) {
        this._saveTasksToHistoryInternal(dateStr);
        
        // Защита от слишком частых уведомлений
        const now = Date.now();
        if (now - this._lastNotificationTime < 500) {
            console.log('saveTasksToHistory: слишком часто, пропускаем уведомление');
            return;
        }
        
        this._lastNotificationTime = now;
        this.notifyHistoryChanged(dateStr);
    }
    
    notifyHistoryChanged(dateStr) {
        // Предотвращаем множественные уведомления
        if (this._isNotifying) {
            console.log('notifyHistoryChanged: уже уведомляем, пропускаем');
            return;
        }
        
        this._isNotifying = true;
        
        // Используем setTimeout для асинхронной отправки
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
                console.log(`📢 Уведомление об изменении истории отправлено для ${dateStr}`);
            } catch (error) {
                console.error('Ошибка при отправке уведомления:', error);
            } finally {
                // Сбрасываем флаг через некоторое время
                setTimeout(() => {
                    this._isNotifying = false;
                }, 300);
            }
        }, 10);
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
        const existing = task.executors.find(e => e.name.toLowerCase() === executorName.trim().toLowerCase());
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
        console.log('Текущие исполнители:', task.executors);
        
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
        ];
        saveTasks();
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
    return tasks;
}

// Сохранение задач
export function saveTasks() {
    localStorage.setItem('production_tasks', JSON.stringify(tasks));
}

// Получение задач для конкретного участка и даты
export function getTasksBySiteAndDate(site, date = currentFilterDate) {
    return tasks.filter(task => 
        task.site === site && task.date === date
    );
}

// Получение задач на сегодня для участка
export function getTodayTasksBySite(site) {
    const today = new Date().toISOString().split('T')[0];
    return getTasksBySiteAndDate(site, today);
}

// Получение задач на выбранную дату
export function getTasksByDate(date) {
    return tasks.filter(task => task.date === date);
}

// Установка текущей даты фильтрации
export function setFilterDate(date) {
    currentFilterDate = date;
    return currentFilterDate;
}

// Получение текущей даты фильтрации
export function getCurrentFilterDate() {
    return currentFilterDate;
}

// Добавление задачи
export function addTask(task) {
    task.id = Date.now();
    task.date = task.date || new Date().toISOString().split('T')[0]; // Дата выполнения задачи
    tasks.push(task);
    saveTasks();
    return task;
}

// Обновление задачи
export function updateTask(updatedTask) {
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
        tasks[index] = updatedTask;
        saveTasks();
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
    return false;
}

// Делаем класс глобально доступным
if (typeof window !== 'undefined') {
    window.TaskManager = TaskManager;
// Удаление задачи
export function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
}

console.log('✅ task-manager.js загружен (исправленная версия)');
// Получение статистики по задачам на дату
export function getTasksStats(date = currentFilterDate) {
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
