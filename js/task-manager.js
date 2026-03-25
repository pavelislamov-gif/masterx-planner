// ============== task-manager.js - УНИВЕРСАЛЬНЫЙ МЕНЕДЖЕР ЗАДАЧ ==============

// Хранилище задач
let tasks = [];
let currentFilterDate = new Date().toISOString().split('T')[0];

// Класс TaskManager
class TaskManager {
    constructor(siteType, customOperations = {}) {
        this.siteType = siteType;
        this.customOperations = customOperations;
        this.currentDate = new Date();
        this.orders = [];
        this.tasks = [];
        
        this._isSaving = false;
        this._isLoading = false;
        this._isNotifying = false;
        this._lastNotificationTime = 0;
    }

    loadData() {
        if (this._isLoading) {
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
        
        let historyTasks = [];
        try {
            const historyKey = `tasks_${this.siteType}_${dateStr}`;
            const history = localStorage.getItem(historyKey);
            if (history) {
                historyTasks = JSON.parse(history);
                console.log(`📋 Загружено ${historyTasks.length} задач из истории для ${dateStr}`);
            }
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
        }
        
        if (!this.orders || this.orders.length === 0) {
            this.tasks = historyTasks;
            return;
        }
        
        const ordersForDate = this.orders.filter(order => order.date === dateStr);
        
        if (ordersForDate.length === 0) {
            this.tasks = historyTasks;
            return;
        }
        
        const historyTasksMap = new Map();
        historyTasks.forEach(task => {
            historyTasksMap.set(task.id, task);
        });
        
        const newTasks = [];
        
        ordersForDate.forEach(order => {
            if (order.status !== 'active') return;
            
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item, itemIndex) => {
                    const productName = item.product || 'Изделие';
                    const itemQuantity = parseInt(item.size?.quantity) || parseInt(item.quantity) || 1;
                    
                    const operations = this.getOperationsForProduct(productName);
                    
                    if (operations && operations.length > 0) {
                        operations.forEach((op, opIndex) => {
                            let operationName = '';
                            let plannedQuantity = itemQuantity;
                            
                            if (typeof op === 'object' && op.name) {
                                operationName = op.name;
                            } else {
                                operationName = op;
                            }
                            
                            const taskId = `${order.id}_${this.siteType}_${itemIndex}_${opIndex}`;
                            const taskStatus = order.tasks?.[taskId];
                            const historyTask = historyTasksMap.get(taskId);
                            
                            const task = {
                                id: taskId,
                                orderId: order.id,
                                orderNumber: order.number || order.id,
                                product: productName,
                                size: item.size?.name || 'Стандартный',
                                operation: operationName,
                                plannedQuantity: plannedQuantity,
                                completedQuantity: historyTask?.completedQuantity || 0,
                                totalQuantity: plannedQuantity,
                                index: opIndex,
                                status: historyTask?.status || this.convertSquareStatus(taskStatus) || 'pending',
                                executors: historyTask?.executors || [],
                                date: dateStr,
                                isExtra: false
                            };
                            
                            newTasks.push(task);
                            console.log(`📌 Создана задача: ${operationName} (${plannedQuantity} шт) для ${productName}`);
                        });
                    }
                    
                    // ============== ОБНОВЛЯЕМ ПЛАН ИЗ КОМПЛЕКТУЮЩИХ ==============
                    if (item.components && item.components.length > 0) {
                        item.components.forEach((comp) => {
                            const plannedQty = comp.quantity || 1;
                            
                            const existingTask = newTasks.find(task => 
                                this.isMatchingByKeywords(task.operation, comp.name)
                            );
                            
                            if (existingTask) {
                                existingTask.plannedQuantity = plannedQty;
                                existingTask.totalQuantity = plannedQty;
                                existingTask.isFromComponent = true;
                                console.log(`📊 ОБНОВЛЕН ПЛАН: "${existingTask.operation}" → ${plannedQty} шт (из комплектующей "${comp.name}")`);
                            } else {
                                const matchedOperation = this.findMatchingOperation(comp.name);
                                if (matchedOperation) {
                                    const taskId = `${order.id}_${this.siteType}_comp_${itemIndex}_${Date.now()}_${Math.random()}`;
                                    const task = {
                                        id: taskId,
                                        orderId: order.id,
                                        orderNumber: order.number || order.id,
                                        product: comp.name,
                                        component: true,
                                        operation: matchedOperation.name,
                                        plannedQuantity: plannedQty,
                                        completedQuantity: 0,
                                        totalQuantity: plannedQty,
                                        isComponent: true,
                                        status: 'pending',
                                        executors: [],
                                        date: dateStr
                                    };
                                    newTasks.push(task);
                                    console.log(`🔧 Создана задача для комплектующей: "${matchedOperation.name}" (${plannedQty} шт)`);
                                }
                            }
                        });
                    }
                });
            }
            
            if (order.extraTasks && Array.isArray(order.extraTasks)) {
                order.extraTasks.forEach((extra, index) => {
                    if (extra.site !== this.siteType) return;
                    
                    const taskId = `${order.id}_extra_${index}`;
                    const taskStatus = order.tasks?.[taskId];
                    const historyTask = historyTasksMap.get(taskId);
                    
                    const task = {
                        id: taskId,
                        orderId: order.id,
                        orderNumber: order.number || order.id,
                        product: extra.title || 'Доп. задача',
                        description: extra.description || '',
                        operation: extra.title || 'Доп. операция',
                        plannedQuantity: 1,
                        completedQuantity: historyTask?.completedQuantity || 0,
                        totalQuantity: 1,
                        isExtra: true,
                        status: historyTask?.status || this.convertSquareStatus(taskStatus) || 'pending',
                        executors: historyTask?.executors || [],
                        date: dateStr
                    };
                    
                    newTasks.push(task);
                });
            }
        });
        
        this.tasks = newTasks;
        this._saveTasksToHistoryInternal(dateStr);
    }
    
    // ============== ПРОВЕРКА СОВПАДЕНИЯ ПО КЛЮЧЕВЫМ СЛОВАМ ==============
    isMatchingByKeywords(operationName, componentName) {
        if (!operationName || !componentName) return false;
        
        const opLower = operationName.toLowerCase();
        const compLower = componentName.toLowerCase();
        
        const keywords = compLower.split(/\s+/);
        
        for (const keyword of keywords) {
            if (keyword.length > 2 && opLower.includes(keyword)) {
                return true;
            }
        }
        
        return false;
    }
    
    // ============== ПОИСК ОПЕРАЦИИ ПО КЛЮЧЕВЫМ СЛОВАМ ==============
    findMatchingOperation(componentName) {
        const siteOps = this.getSiteOperations();
        
        for (const op of siteOps) {
            const opName = op.name || op;
            if (opName.toLowerCase() === componentName.toLowerCase()) {
                return typeof op === 'object' ? op : { name: op, quantity: 1 };
            }
        }
        
        const fullNameLower = componentName.toLowerCase();
        const words = fullNameLower.split(/\s+/);
        
        for (const op of siteOps) {
            const opName = op.name || op;
            const opNameLower = opName.toLowerCase();
            
            if (opNameLower.includes(fullNameLower)) {
                return typeof op === 'object' ? op : { name: op, quantity: 1 };
            }
            
            const allWordsMatch = words.every(word => 
                word.length > 2 && opNameLower.includes(word)
            );
            
            if (allWordsMatch && words.length > 0) {
                return typeof op === 'object' ? op : { name: op, quantity: 1 };
            }
        }
        
        return null;
    }
    
    // ============== ПОЛУЧЕНИЕ ВСЕХ ОПЕРАЦИЙ УЧАСТКА ==============
    getSiteOperations() {
        const siteOps = [];
        
        if (window.TASK_OPERATIONS && window.TASK_OPERATIONS[this.siteType]) {
            const ops = window.TASK_OPERATIONS[this.siteType];
            
            if (ops.default) {
                siteOps.push(...ops.default);
            }
            
            for (const key in ops) {
                if (key !== 'default' && Array.isArray(ops[key])) {
                    siteOps.push(...ops[key]);
                }
            }
        }
        
        const uniqueOps = [];
        const opNames = new Set();
        for (const op of siteOps) {
            const opName = op.name || op;
            if (!opNames.has(opName)) {
                opNames.add(opName);
                uniqueOps.push(op);
            }
        }
        
        return uniqueOps;
    }
    
    getOperationsForProduct(productName) {
        if (this.customOperations[productName]) {
            return this.customOperations[productName];
        }
        
        if (window.TASK_OPERATIONS && window.TASK_OPERATIONS[this.siteType]) {
            const siteOps = window.TASK_OPERATIONS[this.siteType];
            
            if (siteOps[productName]) {
                return siteOps[productName];
            }
            
            for (const key in siteOps) {
                if (key !== 'default' && productName && productName.includes(key)) {
                    return siteOps[key];
                }
            }
            
            if (siteOps['default']) {
                return siteOps['default'];
            }
        }
        
        return [];
    }
    
    convertSquareStatus(squareStatus) {
        if (squareStatus === 'green') return 'completed';
        if (squareStatus === 'orange') return 'in_progress';
        return 'pending';
    }
    
    convertTaskStatus(taskStatus) {
        if (taskStatus === 'completed') return 'green';
        if (taskStatus === 'in_progress') return 'orange';
        if (taskStatus === 'shift_ended') return 'orange';
        return '';
    }
    
    _saveTasksToHistoryInternal(dateStr) {
        if (this._isSaving) return;
        this._isSaving = true;
        
        try {
            const historyKey = `tasks_${this.siteType}_${dateStr}`;
            localStorage.setItem(historyKey, JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        } finally {
            setTimeout(() => {
                this._isSaving = false;
            }, 100);
        }
    }
    
    saveTasksToHistory(dateStr) {
        this._saveTasksToHistoryInternal(dateStr);
        
        const now = Date.now();
        if (now - this._lastNotificationTime < 500) return;
        
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
            } catch (error) {
                console.error('Ошибка при отправке уведомления:', error);
            } finally {
                setTimeout(() => {
                    this._isNotifying = false;
                }, 300);
            }
        }, 10);
    }
    
    addExecutor(taskId, executorName) {
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
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        const executor = task.executors.find(e => e.id === executorId);
        if (!executor) return false;
        
        quantity = this.safeParseInt(quantity);
        executor.quantity = quantity;
        
        task.completedQuantity = task.executors.reduce((sum, e) => sum + (e.quantity || 0), 0);
        
        this.saveTasksToHistory(this.formatDate(this.currentDate));
        return true;
    }
    
    updateExecutorStatus(taskId, executorId, status) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        const executor = task.executors.find(e => e.id === executorId);
        if (!executor) return false;
        
        executor.status = status;
        
        let taskStatus = 'pending';
        const anyInProgress = task.executors.some(e => e.status === 'in_progress');
        const anyShiftEnded = task.executors.some(e => e.status === 'shift_ended');
        const allCompleted = task.executors.every(e => e.status === 'completed');
        
        if (allCompleted) {
            taskStatus = 'completed';
        } else if (anyInProgress || anyShiftEnded) {
            taskStatus = 'in_progress';
        } else {
            taskStatus = 'pending';
        }
        
        task.status = taskStatus;
        
        this.updateOrderStatus(taskId, taskStatus);
        this.saveTasksToHistory(this.formatDate(this.currentDate));
        return true;
    }
    
    updateOrderStatus(taskId, status) {
        const [orderId] = taskId.split('_');
        
        if (typeof window.loadOrdersFromStorage === 'function') {
            const orders = window.loadOrdersFromStorage() || [];
            const orderIndex = orders.findIndex(o => o.id == orderId);
            
            if (orderIndex !== -1) {
                if (!orders[orderIndex].tasks) {
                    orders[orderIndex].tasks = {};
                }
                
                const squareColor = this.convertTaskStatus(status);
                orders[orderIndex].tasks[taskId] = squareColor;
                
                if (typeof window.saveOrdersToStorage === 'function') {
                    window.saveOrdersToStorage(orders);
                }
            }
        }
        
        this.notifyOtherTabs(taskId, status);
    }
    
    removeExecutor(taskId, executorId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        const executorIndex = task.executors.findIndex(e => e.id === executorId);
        if (executorIndex === -1) return false;
        
        task.executors.splice(executorIndex, 1);
        task.completedQuantity = task.executors.reduce((sum, e) => sum + (e.quantity || 0), 0);
        
        if (task.executors.length === 0) {
            task.status = 'pending';
        } else {
            const anyInProgress = task.executors.some(e => e.status === 'in_progress');
            const allCompleted = task.executors.every(e => e.status === 'completed');
            if (allCompleted) {
                task.status = 'completed';
            } else if (anyInProgress) {
                task.status = 'in_progress';
            } else {
                task.status = 'pending';
            }
        }
        
        this.saveTasksToHistory(this.formatDate(this.currentDate));
        return true;
    }
    
    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        if (task.completedQuantity < task.plannedQuantity) {
            const confirmMsg = `Выполнено ${task.completedQuantity} из ${task.plannedQuantity} шт.\nЗавершить задачу?`;
            if (!confirm(confirmMsg)) return false;
        }
        
        task.status = 'completed';
        task.executors.forEach(e => e.status = 'completed');
        
        this.updateOrderStatus(taskId, 'completed');
        this.saveTasksToHistory(this.formatDate(this.currentDate));
        return true;
    }
    
    notifyOtherTabs(taskId, status) {
        const data = {
            taskId: taskId,
            status: status,
            timestamp: Date.now()
        };
        localStorage.setItem('taskStatusChanged', JSON.stringify(data));
    }
    
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
                console.log(`  Задача ${t.id}: ${t.executors?.length || 0} исполнителей, план: ${t.plannedQuantity} шт`);
            });
        } else {
            console.log(`Нет истории для ${dateStr}`);
        }
    }
}

// ============== ГЛОБАЛЬНЫЕ ФУНКЦИИ ==============
function loadTasks() {
    const savedTasks = localStorage.getItem('production_tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        tasks = [];
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

console.log('✅ task-manager.js загружен');
