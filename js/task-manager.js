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
            // ТОКАРНЫЙ УЧАСТОК
            'tokarniy': {
                'XRAY 1': ['Заготовка', 'Точение Корпуса', 'Заготовка деталей Крышка', 'Точение деталей Кольцо', 'Фрезеровка Корпуса'],
                'XRAY 3': ['Заготовка', 'Точение Корпуса', 'Заготовка деталей Крышка', 'Точение деталей Кольцо', 'Фрезеровка Корпуса'],
                'XRAY 3-2': ['Заготовка', 'Точение Корпус-1', 'Точение Корпус-2', 'Заготовка деталей Крышка', 'Точение деталей Кольцо', 'Фрезеровка Корпус-1', 'Фрезеровка Корпус-2'],
                'XRAY 3-GRP': ['Заготовка', 'Точение Корпуса', 'Точение Основания платы', 'Фрезеровка Корпуса', 'Фрезеровка Основания платы'],
                'XRAY 6': ['Заготовка', 'Точение Корпуса', 'Заготовка деталей Крышка', 'Точение деталей Кольцо', 'Фрезеровка Корпуса'],
                'XRAY 6 RGBW': ['Заготовка', 'Точение Корпуса', 'Заготовка деталей Крышка', 'Точение деталей Кольцо', 'Фрезеровка Корпуса', 'Фрезеровка Крышки'],
                'XRAY 6-2 проходной': ['Заготовка', 'Точение Корпуса х 2', 'Точение Втулки', 'Точение деталей Кольцо х 2', 'Фрезеровка Корпуса', 'Фрезеровка Втулки'],
                'XRAY 6-2 оконечный': ['Заготовка', 'Точение Корпуса х 2', 'Точение Втулки', 'Точение деталей Кольцо х 2', 'Фрезеровка Корпуса', 'Фрезеровка Втулки'],
                'XRAY 6-T2 BT 180': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BT 200': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BT 220': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BT 220 Шторка x2': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BT 240 Шторка': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BZ 180': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BZ 200 Шторка': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BZ 220': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса', 'Фрезеровка Кронштейна'],
                'XRAY 6-T2 BZ 220 Шторка x2': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BZ 240 Шторка': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6T Накладной': ['Заготовка', 'Точение Корпуса', 'Точение Крепления', 'Фрезеровка Корпуса', 'Фрезеровка крепления'],
                'XRAY 6T BT 120': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6T BT 140 Шторка': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6T BZ 120': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса', 'Фрезеровка Кронштейна'],
                'XRAY 6T BZ 140 Шторка': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6T RGBW BT 150': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 9': ['Заготовка', 'Точение Корпуса', 'Заготовка деталей Крышка', 'Точение деталей Кольцо', 'Фрезеровка Корпуса', 'Фрезеровка детали Кольцо', 'Фрезеровка детали Крышка'],
                'XRAY 9S': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 12S': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 18': ['Заготовка', 'Точение Корпуса', 'Заготовка деталей Крышка', 'Точение деталей Кольцо', 'Фрезеровка Корпуса', 'Фрезеровка детали Кольцо', 'Фрезеровка детали Крышка'],
                'XRAY 18S': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XSLOPE': ['Заготовка', 'Точение Корпуса', 'Точение Модуля', 'Фрезеровка Корпуса', 'Фрезеровка Модуля'],
                'XPIXEL BIN v.1': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XPIXEL BIN v.2': ['Заготовка', 'Точение Корпуса', 'Точение Фланца', 'Фрезеровка Корпуса'],
                'XPIXEL BIN v.3': ['Заготовка', 'Точение Корпуса', 'Точение деталей Кольцо', 'Фрезеровка Корпуса'],
                'XPIXEL OVHD': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XDISK': ['Заготовка', 'Точение Корпуса', 'Точение деталей Крышка', 'Точение деталей Кронштейн', 'Точение деталей Стойка', 'Фрезеровка Корпуса', 'Фрезеровка Кронштейн', 'Фрезеровка Стойки'],
                'XPOINT OVHD': ['Заготовка', 'Точение Корпуса'],
                'XSPOT': ['Заготовка', 'Точение Корпуса', 'Точение Основания платы', 'Фрезеровка Корпуса', 'Фрезеровка Основания платы'],
                'ACENTO 3T': ['Заготовка', 'Точение Корпуса', 'Точение Втулки', 'Фрезеровка Корпуса'],
                'ACENTO 4': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XGRAY v.1': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XGRAY v.2': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XSMART mini': ['Заготовка', 'Точение']
            },
            
            // СЛЕСАРНЫЙ УЧАСТОК
            'slesarniy': {
                'XRAY 1': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Крышка+V', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XRAY 3': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Крышка+V', 'Голтовка Кронштейна', 'РТИ', 'УВ корпуса'],
                'XRAY 3-2': ['Нарезка резьбы Корпус+V', 'Голтовка Кронштейна', 'РТИ', 'УВ корпуса'],
                'XRAY 3-GRP': ['Нарезка резьбы Корпус+V', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XRAY 6': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Крышка+V', 'Голтовка Кронштейна', 'РТИ', 'УВ корпуса'],
                'XRAY 6 RGBW': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Крышка+V', 'Голтовка Кронштейна', 'РТИ', 'УВ корпуса'],
                'XRAY 6-2 проходной': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Втулка+V', 'Голтовка Кронштейна', 'РТИ', 'УВ корпуса'],
                'XRAY 6-2 оконечный': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Втулка+V', 'Голтовка Кронштейна', 'РТИ', 'УВ корпуса'],
                'XRAY 6-T2 BT 180': ['Нарезка резьбы Корпус+V', 'Установка Резьбовых заклепок 4*16', 'Нарезка резьбы Основание платы+V', 'Обработка Корпуса', 'Обработка Основания платы', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XRAY 6-T2 BT 200': ['Нарезка резьбы Корпус+V', 'Установка Резьбовых заклепок 4*16', 'Нарезка резьбы Основание платы+V', 'Торцовка Корпуса под шторку', 'Обработка Корпуса', 'Обработка Основания платы', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XRAY 6-T2 BT 220': ['Нарезка резьбы Корпус+V', 'Установка Резьбовых заклепок 4*16', 'Нарезка резьбы Основание платы+V', 'Обработка Корпуса', 'Обработка Основания платы', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XRAY 6-T2 BT 220 Шторка x2': ['Нарезка резьбы Корпус+V', 'Установка Резьбовых заклепок 4*16', 'Нарезка резьбы Основание платы+V', 'Торцовка Корпуса под шторку', 'Обработка Корпуса', 'Обработка Основания платы', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XRAY 6T Накладной': ['Нарезка резьбы Крышка+V', 'Нарезка резьбы Крепление', 'Нарезка резьбы Основание платы+V', 'Обработка Корпуса', 'Обработка Основания платы', 'УВ корпуса'],
                'XRAY 9': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Крышка+V', 'Кольцо V', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XGRAY v.1': ['Нарезка резьбы', 'Голтовка', 'УВ корпуса'],
                'XSMART mini': ['Сборка']
            },
            
            // ФРЕЗЕРНЫЙ УЧАСТОК
            'frezerniy': {
                'XRAY 1': ['Поликарбонат Прозрачный 6мм'],
                'XGRAY v.1': ['Заглушка AL 3мм Левая', 'Заглушка AL 3мм Правая'],
                'XLUMO': ['Заглушка AL 3мм', 'Вставка ПВХ 3мм без выемки верхняя', 'Вставка ПВХ 3мм без выемки нижняя', 'Вставка ПВХ 3мм с выемкой верхняя', 'Вставка ПВХ 3мм с выемкой нижняя']
            },
            
            // ЛАЗЕРНО-ГИБОЧНЫЙ УЧАСТОК
            'lazerno': {
                'XRAY 1': ['Раскрой XRAY 1 Кронштейн', 'Гибка XRAY 1 Кронштейн'],
                'XGRAY v.1': ['Раскрой Заглушка модуля'],
                'XGRAY v.2': ['Раскрой Заглушка модуля', 'Раскрой Кронштейна P Лира выносная', 'Раскрой Кронштейн LU или PU', 'Гибка Кронштейна P Лира выносная', 'Гибка Кронштейн LU или PU']
            },
            
            // ПОЛИМЕРНЫЙ УЧАСТОК
            'polimerniy': {
                'XRAY 1': ['Корпус в сборе', 'Кронштейн'],
                'XGRAY v.1': ['Профиль', 'Заглушка Левая', 'Заглушка Правая', 'Кронштейн AL'],
                'XSMART mini': ['Профиль', 'Заглушка', 'Лира', 'Кронштейн']
            }
        };
    }
    
    // Получить операции для изделия на текущем участке
    getOperationsForProduct(productName) {
        const siteOps = this.operationsDB[this.siteType];
        if (!siteOps) return [];
        
        if (siteOps[productName]) {
            return siteOps[productName];
        }
        
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
            let historyTasks = JSON.parse(savedHistory);
            
            // Фильтруем задачи: оставляем только те, чьи заказы существуют
            historyTasks = historyTasks.filter(task => {
                return this.orders.some(o => o.id === task.orderId);
            });
            
            this.taskHistory[dateStr] = historyTasks;
            this.tasks = historyTasks;
            
            if (historyTasks.length !== JSON.parse(savedHistory).length) {
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
            order.items.forEach(item => {
                const productName = item.product;
                const operations = this.getOperationsForProduct(productName);
                const totalQuantity = item.quantity || 1;
                
                operations.forEach((op, index) => {
                    const taskId = `${order.id}_${productName}_${this.siteType}_${index}`;
                    
                    // Ищем существующую задачу в истории
                    let existingTask = null;
                    for (let date in this.taskHistory) {
                        const found = this.taskHistory[date].find(t => t.id === taskId);
                        if (found) {
                            existingTask = found;
                            break;
                        }
                    }
                    
                    if (existingTask) {
                        // Переносим задачу на текущую дату с сохранением прогресса
                        tasks.push({
                            ...existingTask,
                            date: dateStr
                        });
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
            });
            
            // Дополнительные задачи
            if (order.extraTasks && order.extraTasks.length > 0) {
                order.extraTasks.forEach((extraTask, index) => {
                    if (extraTask.site !== this.siteType) return;
                    
                    const taskId = `${order.id}_extra_${index}`;
                    
                    let existingTask = null;
                    for (let date in this.taskHistory) {
                        const found = this.taskHistory[date].find(t => t.id === taskId);
                        if (found) {
                            existingTask = found;
                            break;
                        }
                    }
                    
                    if (existingTask) {
                        tasks.push({
                            ...existingTask,
                            date: dateStr
                        });
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
    
    // Обновить количество исполнителя
    updateExecutorQuantity(taskId, executorName, quantity) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        
        const executor = this.tasks[taskIndex].executors?.find(e => e.name === executorName);
        if (!executor) return false;
        
        executor.quantity = quantity;
        
        // Пересчитываем общее выполнение
        const totalCompleted = this.tasks[taskIndex].executors.reduce((sum, e) => sum + (e.quantity || 0), 0);
        this.tasks[taskIndex].completedQuantity = totalCompleted;
        
        // Если исполнитель выполнил свою часть, но задача ещё не завершена
        if (executor.quantity > 0 && executor.status !== 'completed') {
            executor.status = 'in_progress';
        }
        
        // Проверяем, выполнена ли задача полностью
        if (totalCompleted >= this.tasks[taskIndex].totalQuantity) {
            this.tasks[taskIndex].status = 'completed';
            this.tasks[taskIndex].completedQuantity = this.tasks[taskIndex].totalQuantity;
            
            this.tasks[taskIndex].executors.forEach(e => {
                e.status = 'completed';
            });
            
            this.updateOrderTaskStatus(taskId, 'completed');
        } else {
            if (totalCompleted > 0) {
                this.tasks[taskIndex].status = 'in_progress';
                this.updateOrderTaskStatus(taskId, 'in_progress');
            }
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
