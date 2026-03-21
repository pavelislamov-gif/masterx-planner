// Глобальные переменные
let products = [];
let brackets = [];
let lyres = [];
let orders = [];
let materialsReport = null;

// ============== ПРОВЕРКА ЗАВИСИМОСТЕЙ ==============
console.log('🔍 ПРОВЕРКА ЗАВИСИМОСТЕЙ app.js:');
console.log('='.repeat(50));

// Проверка storage.js
if (typeof loadOrdersFromStorage === 'function') {
    console.log('✅ storage.js: loadOrdersFromStorage загружена');
} else {
    console.error('❌ storage.js: loadOrdersFromStorage НЕ загружена!');
}

if (typeof saveOrdersToStorage === 'function') {
    console.log('✅ storage.js: saveOrdersToStorage загружена');
} else {
    console.error('❌ storage.js: saveOrdersToStorage НЕ загружена!');
}

// Проверка data-loader.js
if (typeof loadProducts === 'function') {
    console.log('✅ data-loader.js: loadProducts загружена');
} else {
    console.error('❌ data-loader.js: loadProducts НЕ загружена!');
}

if (typeof loadBrackets === 'function') {
    console.log('✅ data-loader.js: loadBrackets загружена');
} else {
    console.error('❌ data-loader.js: loadBrackets НЕ загружена!');
}

if (typeof loadLyres === 'function') {
    console.log('✅ data-loader.js: loadLyres загружена');
} else {
    console.error('❌ data-loader.js: loadLyres НЕ загружена!');
}

// Проверка materials-report.js
if (typeof MaterialsReport === 'function') {
    console.log('✅ materials-report.js: MaterialsReport загружен');
} else {
    console.warn('⚠️ materials-report.js: MaterialsReport НЕ загружен!');
}

console.log('⏳ Функции app.js будут объявлены далее...');
console.log('='.repeat(50));

// ============== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==============

// Форматирование даты
function formatDate(dateString) {
    if (!dateString) return 'Дата не указана';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

// Генерация номера заказа
function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const count = (orders.length + 1).toString().padStart(3, '0');
    return `З-${year}${month}${day}-${count}`;
}

// ============== СОЗДАНИЕ ЗАДАЧ ДЛЯ ЗАКАЗА НА КОНКРЕТНУЮ ДАТУ ==============

function createTasksForOrder(order) {
    const sites = ['tokarniy', 'slesarniy', 'frezerniy', 'lazerno', 'polimerniy'];
    const orderDate = order.date;
    
    console.log(`📅 Создание задач для заказа №${order.number} на дату ${orderDate}`);
    
    sites.forEach(siteKey => {
        const operations = getOperationNames(order.items[0].product, siteKey);
        
        if (!operations || operations.length === 0) {
            console.log(`⏭️ Нет операций для ${siteKey} на ${order.items[0].product}`);
            return;
        }
        
        const storageKey = `tasks_${siteKey}_${orderDate}`;
        
        let existingTasks = [];
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                existingTasks = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Ошибка загрузки задач:', e);
        }
        
        const newTasks = [];
        
        operations.forEach((operation, index) => {
            const taskId = `${order.id}_${siteKey}_0_${index}`;
            const exists = existingTasks.some(t => t.id === taskId);
            
            if (!exists) {
                newTasks.push({
                    id: taskId,
                    orderId: order.id,
                    orderNumber: order.number,
                    product: order.items[0].product,
                    size: order.items[0].size,
                    totalQuantity: order.items[0].quantity,
                    completedQuantity: 0,
                    operation: operation,
                    index: index,
                    status: 'pending',
                    executors: [],
                    date: orderDate,
                    isExtra: false
                });
            }
        });
        
        // Добавляем дополнительные задачи, если есть
        if (order.extraTasks && order.extraTasks.length > 0) {
            order.extraTasks.forEach((extra, idx) => {
                if (extra.site !== siteKey) return;
                
                const taskId = `${order.id}_extra_${idx}`;
                const exists = existingTasks.some(t => t.id === taskId);
                if (!exists) {
                    newTasks.push({
                        id: taskId,
                        orderId: order.id,
                        orderNumber: order.number,
                        product: extra.title || 'Доп. задача',
                        description: extra.description || '',
                        totalQuantity: 1,
                        completedQuantity: 0,
                        operation: extra.title || 'Доп. операция',
                        isExtra: true,
                        status: 'pending',
                        executors: [],
                        date: orderDate
                    });
                }
            });
        }
        
        if (newTasks.length > 0) {
            const updatedTasks = [...existingTasks, ...newTasks];
            localStorage.setItem(storageKey, JSON.stringify(updatedTasks));
            console.log(`✅ ${siteKey}: добавлено ${newTasks.length} задач на ${orderDate}`);
        }
    });
    
    console.log(`🎉 Задачи для заказа №${order.number} созданы!`);
}

// ============== ФУНКЦИИ ДЛЯ РАБОТЫ С ЗАКАЗАМИ ==============

// Загрузка и отображение заказов
function loadOrders() {
    console.log('loadOrders вызвана');
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    ordersList.innerHTML = '';

    if (orders.length === 0) {
        ordersList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Нет заказов</div></div>';
        return;
    }

    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    orders.forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';
        card.dataset.orderId = order.id;

        const header = document.createElement('div');
        header.className = 'order-header';

        const item = order.items[0];
        header.innerHTML = `
            <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                <h3>📦 Заказ №${order.number} от ${formatDate(order.date)}</h3>
                <span style="background: #ff3b3b; color: white; padding: 3px 10px; border-radius: 15px; font-size: 12px;">В работе</span>
                <span style="background: #2a2f38; padding: 3px 10px; border-radius: 15px; font-size: 12px; color: #fff;">
                    Деталей: ${item.quantity} шт
                </span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-info" onclick="event.stopPropagation(); showMaterialsReport(${order.id})">📊 Материалы</button>
                <button class="btn btn-danger" onclick="event.stopPropagation(); deleteOrder(${order.id})">🗑️ Удалить</button>
            </div>
        `;

        const content = document.createElement('div');
        content.className = 'order-content';
        content.style.display = 'none';

        content.innerHTML = `
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Изделие</th>
                        <th>Размер</th>
                        <th>Кол-во</th>
                        <th>Кронштейн</th>
                        <th>Лира</th>
                        <th>RAL</th>
                        <th>Текстура</th>
                    </thead>
                <tbody>
                    <tr>
                        <td><strong>${item.product}</strong></td>
                        <td>${item.size}</td>
                        <td>${item.quantity} шт</td>
                        <td>${item.bracket.type} (${item.bracket.quantity} шт)</td>
                        <td>${item.lyre.type} (${item.lyre.quantity} шт)</td>
                        <td>${item.ral || '-'}</td>
                        <td>${item.texture || '-'}</td>
                    </tr>
                </tbody>
             </table>
            
            <div class="sites-section">
                <h4 style="margin-bottom: 15px;">🏭 Производственные участки</h4>
                <div class="sites-grid">
                    ${createSiteRow('🔧 Токарный', order, 'tokarniy')}
                    ${createSiteRow('🔨 Слесарный', order, 'slesarniy')}
                    ${createSiteRow('⚙️ Фрезерный', order, 'frezerniy')}
                    ${createSiteRow('✨ Лазерно-гибочный', order, 'lazerno')}
                    ${createSiteRow('🧪 Полимерный', order, 'polimerniy')}
                </div>
            </div>
            
            ${order.additional ? `<div style="margin-top: 15px; padding: 10px; background: #15191f; border-radius: 5px; color: #a0a0a0;">📝 ${order.additional}</div>` : ''}
        `;

        header.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn')) {
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
            }
        });

        card.appendChild(header);
        card.appendChild(content);
        ordersList.appendChild(card);
    });
}

// Обновление статистики
function updateStatistics() {
    console.log('updateStatistics вызвана');
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalItemsEl = document.getElementById('totalItems');
    const activeTasksEl = document.getElementById('activeTasks');
    const completedTasksEl = document.getElementById('completedTasks');

    if (totalOrdersEl) totalOrdersEl.textContent = orders.length;

    const totalItems = orders.reduce((sum, order) => sum + (order.items[0]?.quantity || 0), 0);
    if (totalItemsEl) totalItemsEl.textContent = totalItems;

    let activeTasks = 0;
    let completedTasks = 0;

    orders.forEach(order => {
        if (order.tasks) {
            Object.values(order.tasks).forEach(status => {
                if (status === 'orange') activeTasks++;
                if (status === 'green') completedTasks++;
            });
        }
    });

    if (activeTasksEl) activeTasksEl.textContent = activeTasks;
    if (completedTasksEl) completedTasksEl.textContent = completedTasks;
}

// Обновление статуса задачи
function updateTaskStatus(taskId, status) {
    console.log('updateTaskStatus вызвана', taskId, status);

    const parts = taskId.split('_');
    const orderId = parts[0];

    const order = orders.find(o => o.id == orderId);
    if (!order) {
        console.warn('Заказ не найден:', orderId);
        return;
    }

    if (!order.tasks) order.tasks = {};

    let squareStatus = '';
    if (status === 'in_progress') squareStatus = 'orange';
    if (status === 'completed') squareStatus = 'green';

    order.tasks[taskId] = squareStatus;

    console.log(`✅ Обновлен статус задачи ${taskId}: ${squareStatus}`);

    saveOrdersToStorage(orders);
    loadOrders();
    updateStatistics();
}

// ============== СИНХРОНИЗАЦИЯ С УЧАСТКАМИ ==============
function syncTasksFromHistory() {
    console.log('🔄 Синхронизация задач из истории...');

    const today = new Date().toISOString().split('T')[0];
    const sites = ['tokarniy', 'slesarniy', 'frezerniy', 'lazerno', 'polimerniy'];
    let updatedCount = 0;

    sites.forEach(siteType => {
        try {
            const historyKey = `tasks_${siteType}_${today}`;
            const history = localStorage.getItem(historyKey);

            if (history) {
                const tasks = JSON.parse(history);
                console.log(`📊 Загружено ${tasks.length} задач для ${siteType}`);

                tasks.forEach(task => {
                    if (task.status === 'completed' || task.status === 'in_progress') {
                        const orderId = task.orderId;
                        const order = orders.find(o => o.id == orderId);

                        if (order) {
                            if (!order.tasks) order.tasks = {};

                            let squareStatus = '';
                            if (task.status === 'in_progress') squareStatus = 'orange';
                            if (task.status === 'completed') squareStatus = 'green';

                            if (order.tasks[task.id] !== squareStatus) {
                                order.tasks[task.id] = squareStatus;
                                updatedCount++;
                                console.log(`  📌 Задача ${task.id}: ${squareStatus}`);
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error(`❌ Ошибка синхронизации для ${siteType}:`, error);
        }
    });

    if (updatedCount > 0) {
        console.log(`✅ Обновлено ${updatedCount} статусов задач`);
        saveOrdersToStorage(orders);
        loadOrders();
        updateStatistics();
    } else {
        console.log('📭 Нет новых обновлений');
    }
}

// ============== ФУНКЦИИ ДЛЯ МОДАЛЬНОГО ОКНА ==============

// Открытие модального окна
function openOrderModal() {
    console.log('📝 Открытие модального окна создания заказа');
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'block';
        const dateInput = document.getElementById('orderDate');
        const numberInput = document.getElementById('orderNumber');
        const bracketQty = document.getElementById('bracketQuantity');
        const lyreQty = document.getElementById('lyreQuantity');

        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        if (numberInput) numberInput.value = generateOrderNumber();
        if (bracketQty) bracketQty.value = 1;
        if (lyreQty) lyreQty.value = 1;
    } else {
        console.error('❌ Модальное окно не найдено!');
    }
}

// Закрытие модального окна
function closeOrderModal() {
    console.log('📝 Закрытие модального окна');
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'none';
        const form = document.getElementById('orderForm');
        if (form) form.reset();
        // Очищаем контейнер комплектующих
        const componentsContainer = document.getElementById('componentsContainer');
        if (componentsContainer) componentsContainer.innerHTML = '';
    }
}

// ============== ФУНКЦИИ ДЛЯ РАБОТЫ С ПРОДУКТАМИ ==============

// Заполнение выпадающих списков
function populateSelects() {
    console.log('Заполнение select-ов...');

    const productSelect = document.getElementById('productSelect');
    if (productSelect) {
        productSelect.innerHTML = '<option value="">Выберите изделие</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.name;
            option.textContent = product.name;
            productSelect.appendChild(option);
        });
        
        // ДОБАВЛЯЕМ СЛУШАТЕЛЬ НА ВЫБОР ИЗДЕЛИЯ
        productSelect.addEventListener('change', updateComponentsList);
    }

    const bracketSelect = document.getElementById('bracketSelect');
    if (bracketSelect) {
        bracketSelect.innerHTML = '<option value="">Выберите кронштейн</option>';

        const absentOption = document.createElement('option');
        absentOption.value = "отсутствует";
        absentOption.textContent = "🚫 отсутствует";
        bracketSelect.appendChild(absentOption);

        brackets.forEach(bracket => {
            const option = document.createElement('option');
            option.value = bracket.name;
            option.textContent = bracket.name;
            bracketSelect.appendChild(option);
        });
    }

    const lyreSelect = document.getElementById('lyreSelect');
    if (lyreSelect) {
        lyreSelect.innerHTML = '<option value="">Выберите лиру</option>';

        const absentOption = document.createElement('option');
        absentOption.value = "отсутствует";
        absentOption.textContent = "🚫 отсутствует";
        lyreSelect.appendChild(absentOption);

        lyres.forEach(lyre => {
            const option = document.createElement('option');
            option.value = lyre.name;
            option.textContent = lyre.name;
            lyreSelect.appendChild(option);
        });
    }
}

// Загрузка размеров для выбранного изделия
async function loadProductSizes() {
    console.log('loadProductSizes вызвана');
    const productName = document.getElementById('productSelect').value;
    const product = products.find(p => p.name === productName);
    const sizeSelect = document.getElementById('sizeSelect');

    if (!sizeSelect) return;

    sizeSelect.innerHTML = '<option value="">Загрузка размеров...</option>';
    sizeSelect.disabled = true;

    setTimeout(() => {
        sizeSelect.innerHTML = '<option value="">Выберите размер</option>';

        if (product && product.sizes) {
            product.sizes.forEach(size => {
                const option = document.createElement('option');
                option.value = size;
                option.textContent = size;
                sizeSelect.appendChild(option);
            });
        } else {
            sizeSelect.innerHTML = '<option value="">Нет доступных размеров</option>';
        }

        sizeSelect.disabled = false;
    }, 100);
}

// ============== БАЗА ДАННЫХ ОПЕРАЦИЙ ==============
// Загружается из отдельного файла task-operations.js
const operationsDB = window.TASK_OPERATIONS || {};

// ============== ФУНКЦИЯ getOperationNames ==============
function getOperationNames(productName, siteKey) {
    const siteOps = operationsDB[siteKey] || {};

    if (siteOps[productName]) {
        return siteOps[productName];
    }

    for (let key in siteOps) {
        if (productName.includes(key)) {
            return siteOps[key];
        }
    }

    return [];
}

// ============== ФУНКЦИЯ getOperationCount ==============
function getOperationCount(productName, siteKey) {
    const siteOps = operationsDB[siteKey] || {};
    const operations = siteOps[productName] || [];
    
    // Считаем только не-х
    return operations.filter(op => op && op !== 'х' && op !== 'x').length;
}

// ============== ФУНКЦИЯ createSiteRow ==============
function createSiteRow(name, order, siteKey) {
    if (!order.items || order.items.length === 0) {
        return '<div>Нет изделий</div>';
    }

    const item = order.items[0];
    
    // ПОЛУЧАЕМ РЕАЛЬНЫЕ ОПЕРАЦИИ (БЕЗ "х")
    const operations = getOperationNames(item.product, siteKey);
    
    // ЕСЛИ НЕТ ОПЕРАЦИЙ - ПОКАЗЫВАЕМ КРАСНЫЙ КВАДРАТИК
    if (operations.length === 0) {
        return `
            <div class="site-item">
                <span class="site-name">${name}</span>
                <div class="squares">
                    <div class="square red" title="Нет операций на этом участке"></div>
                </div>
                <span style="color: #a0a0a0; font-size: 12px; margin: 0 10px;">0/0</span>
                <button class="btn btn-sm btn-primary" onclick="addExtraTask(${order.id}, '${siteKey}')">➕</button>
            </div>
        `;
    }

    // ЕСЛИ ЕСТЬ ОПЕРАЦИИ - ПОКАЗЫВАЕМ КВАДРАТИКИ
    let squares = '';
    let completedCount = 0;

    for (let i = 0; i < operations.length; i++) {
        const taskId = `${order.id}_${siteKey}_0_${i}`;
        
        // ПОЛУЧАЕМ СТАТУС ИЗ ЗАКАЗА
        let status = '';
        if (order.tasks && order.tasks[taskId]) {
            status = order.tasks[taskId];
            if (status === 'orange' || status === 'green') {
                if (status === 'green') completedCount++;
            }
        }

        const operationName = operations[i];
        console.log(`Квадратик ${taskId}: статус "${status}"`);

        squares += `<div class="square ${status}" data-task="${taskId}" title="${operationName}"></div>`;
    }

    if (order.extraTasks) {
        order.extraTasks.forEach((task, index) => {
            if (task.site === siteKey) {
                const taskId = `${order.id}_extra_${index}`;
                
                let status = '';
                if (order.tasks && order.tasks[taskId]) {
                    status = order.tasks[taskId];
                    if (status === 'green') completedCount++;
                }

                squares += `<div class="square ${status} extra-square" data-task="${taskId}" title="${task.title} (доп.)"></div>`;
            }
        });
    }

    const totalOperations = operations.length + (order.extraTasks?.filter(t => t.site === siteKey).length || 0);

    return `
        <div class="site-item">
            <span class="site-name">${name}</span>
            <div class="squares">
                ${squares}
            </div>
            <span style="color: #a0a0a0; font-size: 12px; margin: 0 10px;">${completedCount}/${totalOperations}</span>
            <button class="btn btn-sm btn-primary" onclick="addExtraTask(${order.id}, '${siteKey}')">➕</button>
        </div>
    `;
}

// ============== ФУНКЦИИ ДЛЯ РАБОТЫ С ЗАКАЗАМИ ==============

async function showMaterialsReport(orderId) {
    console.log('showMaterialsReport вызвана', orderId);
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        alert('Заказ не найден');
        return;
    }

    if (!window.materialsReport) {
        alert('Отчет по материалам не доступен');
        return;
    }

    try {
        const modal = document.getElementById('materialsModal');
        const reportDiv = document.getElementById('materialsReport');

        if (!modal || !reportDiv) {
            alert('Модальное окно не найдено');
            return;
        }

        reportDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Загрузка отчета...</p></div>';
        modal.style.display = 'block';

        const reportHTML = await window.materialsReport.generateReport(order);
        reportDiv.innerHTML = reportHTML;

    } catch (error) {
        console.error('Ошибка генерации отчета:', error);
        alert('Ошибка при загрузке отчета по материалам');
    }
}

// ============== ИСПРАВЛЕННАЯ ФУНКЦИЯ УДАЛЕНИЯ ЗАКАЗА ==============
function deleteOrder(orderId) {
    console.log('deleteOrder вызвана', orderId);
    
    if (!confirm('Удалить заказ? Все связанные задачи на участках также будут удалены.')) {
        return;
    }

    // Находим удаляемый заказ
    const deletedOrder = orders.find(o => o.id === orderId);
    
    // Удаляем заказ из списка
    orders = orders.filter(o => o.id !== orderId);
    saveOrdersToStorage(orders);
    
    // Удаляем задачи этого заказа со всех участков
    if (deletedOrder) {
        deleteOrderTasksFromAllSites(deletedOrder);
    }
    
    loadOrders();
    updateStatistics();
    
    alert('✅ Заказ и связанные задачи удалены');
}

// ============== УДАЛЕНИЕ ЗАДАЧ ЗАКАЗА СО ВСЕХ УЧАСТКОВ ==============
function deleteOrderTasksFromAllSites(order) {
    console.log('🔍 Удаление задач заказа', order.id, 'со всех участков');
    
    const sites = ['tokarniy', 'slesarniy', 'frezerniy', 'lazerno', 'polimerniy'];
    const dates = getAllRelevantDates();
    let totalDeleted = 0;
    
    sites.forEach(site => {
        dates.forEach(date => {
            const historyKey = `tasks_${site}_${date}`;
            try {
                const tasksJson = localStorage.getItem(historyKey);
                if (tasksJson) {
                    let tasks = JSON.parse(tasksJson);
                    const beforeCount = tasks.length;
                    
                    // Оставляем только задачи НЕ из этого заказа
                    const filteredTasks = tasks.filter(task => {
                        const taskOrderId = task.orderId || (task.id ? task.id.split('_')[0] : null);
                        return String(taskOrderId) !== String(order.id);
                    });
                    
                    if (filteredTasks.length !== beforeCount) {
                        const deleted = beforeCount - filteredTasks.length;
                        totalDeleted += deleted;
                        localStorage.setItem(historyKey, JSON.stringify(filteredTasks));
                        console.log(`  ✅ ${site} на ${date}: удалено ${deleted} задач`);
                    }
                }
            } catch (e) {
                console.error(`❌ Ошибка при очистке ${historyKey}:`, e);
            }
        });
    });
    
    console.log(`✅ Всего удалено задач: ${totalDeleted}`);
}

// ============== ПОЛУЧЕНИЕ ВСЕХ АКТУАЛЬНЫХ ДАТ ==============
function getAllRelevantDates() {
    const dates = [];
    const today = new Date();
    
    for (let i = -30; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        dates.push(`${year}-${month}-${day}`);
    }
    
    return dates;
}

function addExtraTask(orderId, siteKey) {
    console.log('addExtraTask вызвана', orderId, siteKey);
    const taskName = prompt('Введите название дополнительной задачи:');
    if (!taskName) return;

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (!order.extraTasks) order.extraTasks = [];

    order.extraTasks.push({
        title: taskName,
        site: siteKey,
        createdAt: new Date().toISOString()
    });

    saveOrdersToStorage(orders);
    loadOrders();
}

function exportOrders() {
    console.log('exportOrders вызвана');

    try {
        const ordersToExport = orders || [];

        if (ordersToExport.length === 0) {
            alert('Нет заказов для экспорта');
            return;
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            orders: ordersToExport
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const date = new Date();
        const fileName = `masterx_orders_${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();

        console.log(`✅ Экспортировано ${ordersToExport.length} заказов`);
        alert(`✅ Экспортировано ${ordersToExport.length} заказов`);

    } catch (error) {
        console.error('❌ Ошибка экспорта:', error);
        alert('Ошибка при экспорте заказов');
    }
}

function closeMaterialsModal() {
    console.log('closeMaterialsModal вызвана');
    const modal = document.getElementById('materialsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ============== ОСНОВНАЯ ФУНКЦИЯ ЗАГРУЗКИ ==============
async function loadAllData() {
    try {
        console.log('loadAllData: начало загрузки');

        products = await loadProducts() || [];
        brackets = await loadBrackets() || [];
        lyres = await loadLyres() || [];
        orders = loadOrdersFromStorage() || [];
        await loadComponents();

        console.log('✅ Продукты загружены:', products.length);
        console.log('✅ Кронштейны загружены:', brackets.length);
        console.log('✅ Лиры загружены:', lyres.length);
        console.log('✅ Комплектующие загружены:', Object.keys(window.componentsData).length);
        console.log('✅ Заказы загружены:', orders.length);

        syncTasksFromHistory();

        populateSelects();
        loadOrders();
        updateStatistics();

        if (typeof MaterialsReport !== 'undefined') {
            window.materialsReport = new MaterialsReport();
            window.materialsReport.materialsDB.brackets = brackets;
            window.materialsReport.materialsDB.lyres = lyres;

            window.materialsReport.loadMaterialsData()
                .then(() => {
                    console.log('✅ Отчет по материалам инициализирован');
                })
                .catch(err => {
                    console.error('❌ Ошибка инициализации отчета:', err);
                });
        }

        window.addEventListener('storage', function(e) {
            if (e.key === 'masterx_orders') {
                console.log('🔄 Изменение в localStorage (orders)');
                orders = JSON.parse(e.newValue || '[]');
                loadOrders();
                updateStatistics();
            }
            if (e.key && e.key.startsWith('tasks_')) {
                console.log('🔄 Изменение в localStorage (tasks)');
                syncTasksFromHistory();
            }
            if (e.key === 'taskStatusChanged' && e.newValue) {
                try {
                    const data = JSON.parse(e.newValue);
                    console.log('🔥 Получено из localStorage:', data);
                    
                    // Игнорируем статус pending (начальное состояние)
                    if (data.status === 'pending') return;
                    
                    // Находим базовый taskId (обрезаем последний индекс)
                    const baseTaskId = data.taskId.substring(0, data.taskId.lastIndexOf('_'));
                    console.log('🔄 Ищем квадратик с taskId:', baseTaskId);
                    
                    const square = document.querySelector(`[data-task="${baseTaskId}"]`);
                    if (square) {
                        // Удаляем старые классы
                        square.classList.remove('orange', 'green');
                        
                        // Добавляем новый класс
                        if (data.status === 'in_progress') {
                            square.classList.add('orange');
                            console.log('✅ Квадратик стал оранжевым');
                        } else if (data.status === 'completed') {
                            square.classList.add('green');
                            console.log('✅ Квадратик стал зеленым');
                        }
                    } else {
                        console.log('❌ Квадратик не найден для taskId:', baseTaskId);
                    }
                } catch (error) {
                    console.error('Ошибка обработки storage:', error);
                }
            }
        });

        window.addEventListener('taskStatusChanged', function(e) {
            console.log('🔄 Статус задачи изменён:', e.detail);
            updateTaskStatus(e.detail.taskId, e.detail.status);
        });

        console.log('✅ loadAllData завершена');

    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
    }
}

// ============== ИНИЦИАЛИЗАЦИЯ ==============
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📅 DOM загружен, начинаем инициализацию...');
    await loadAllData();
});

// ============== ОБРАБОТЧИК ФОРМЫ ==============
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const product = document.getElementById('productSelect').value;
            const size = document.getElementById('sizeSelect').value;

            if (!product || !size) {
                alert('Выберите изделие и размер!');
                return;
            }

            // СБОР КОМПЛЕКТУЮЩИХ
            const components = collectComponents();

            const order = {
                id: Date.now(),
                date: document.getElementById('orderDate').value,
                number: document.getElementById('orderNumber').value,
                items: [{
                    product: product,
                    size: size,
                    quantity: parseInt(document.getElementById('quantity').value) || 1,
                    bracket: {
                        type: document.getElementById('bracketSelect').value || 'отсутствует',
                        quantity: parseInt(document.getElementById('bracketQuantity').value) || 0
                    },
                    lyre: {
                        type: document.getElementById('lyreSelect').value || 'отсутствует',
                        quantity: parseInt(document.getElementById('lyreQuantity').value) || 0
                    },
                    ral: document.getElementById('ralInput').value || '',
                    texture: document.getElementById('textureSelect').value || '',
                    additional: document.getElementById('additionalDetails').value || ''
                }],
                components: components,
                status: 'active',
                tasks: {},
                extraTasks: []
            };

            orders.push(order);
            saveOrdersToStorage(orders);
            
            // ✅ СОЗДАЁМ ЗАДАЧИ НА ВСЕХ УЧАСТКАХ НА ВЫБРАННУЮ ДАТУ
            createTasksForOrder(order);
            
            loadOrders();
            updateStatistics();
            closeOrderModal();
            
            const formattedDate = new Date(order.date).toLocaleDateString('ru-RU');
            alert(`✅ Заказ №${order.number} успешно создан на ${formattedDate}!`);
        });
    }
});

// ============== ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ==============
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.loadProductSizes = loadProductSizes;
window.exportOrders = exportOrders;
window.showMaterialsReport = showMaterialsReport;
window.deleteOrder = deleteOrder;
window.addExtraTask = addExtraTask;
window.closeMaterialsModal = closeMaterialsModal;
window.syncTasksFromHistory = syncTasksFromHistory;
window.createTasksForOrder = createTasksForOrder; // Экспортируем новую функцию

console.log('📤 Экспорт функций в глобальную область...');
console.log('✅ Функции экспортированы:', Object.keys(window).filter(key => 
    typeof window[key] === 'function' && 
    ['openOrderModal', 'closeOrderModal', 'loadProductSizes', 'exportOrders', 
     'showMaterialsReport', 'deleteOrder', 'addExtraTask', 'closeMaterialsModal', 
     'syncTasksFromHistory', 'createTasksForOrder'].includes(key)
));
console.log('✅ app.js полностью загружен');

/// ============== СИНХРОНИЗАЦИЯ ЦВЕТОВ КВАДРАТИКОВ ==============
window.addEventListener('taskStatusChanged', function(e) {
    const { taskId, status } = e.detail;
    console.log('🔄 Статус задачи изменен:', taskId, status);
    
    // 1. Обновляем статус в заказе
    updateTaskStatus(taskId, status);
    
    // 2. Ищем и обновляем цвет квадратика
    let squares = document.querySelectorAll(`[data-task="${taskId}"]`);
    
    // Если не нашли, пробуем обрезать последний индекс
    if (squares.length === 0) {
        const baseTaskId = taskId.substring(0, taskId.lastIndexOf('_'));
        console.log('🔄 Пробуем базовый taskId:', baseTaskId);
        squares = document.querySelectorAll(`[data-task="${baseTaskId}"]`);
    }
    
    squares.forEach(square => {
        console.log('✅ Найден квадратик, меняем цвет на:', status);
        
        // Удаляем старые классы цветов
        square.classList.remove('orange', 'green');
        
        if (status === 'completed') {
            square.classList.add('green');
            square.title = 'Завершено';
        } else if (status === 'in_progress') {
            square.classList.add('orange');
            square.title = 'В работе';
        } else {
            square.title = 'Ожидает';
        }
    });
});


// ============== КОМПЛЕКТУЮЩИЕ ==============

// Обновление списка комплектующих при выборе изделия
function updateComponentsList() {
    const productName = document.getElementById('productSelect').value;
    const container = document.getElementById('componentsContainer');
    
    if (!container) return;
    container.innerHTML = '';
    
    if (!productName) return;
    
    const components = window.componentsData[productName] || [];
    if (components.length === 0) return;
    
    // Заголовок
    const title = document.createElement('div');
    title.style.cssText = 'margin-bottom: 12px; color: #ff3b3b; font-size: 14px; font-weight: 600; border-left: 3px solid #ff3b3b; padding-left: 10px;';
    title.innerHTML = '🔧 КОМПЛЕКТУЮЩИЕ ДЕТАЛИ:';
    container.appendChild(title);
    
    // Описание
    const desc = document.createElement('div');
    desc.style.cssText = 'margin-bottom: 12px; color: #a0a0a0; font-size: 12px; padding-left: 10px;';
    desc.innerHTML = 'Введите количество на 1 изделие:';
    container.appendChild(desc);
    
    // Список деталей
    components.forEach(comp => {
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #15191f; border-radius: 6px; border: 1px solid #2a2f38; margin-bottom: 8px;';
        row.innerHTML = `
            <span style="font-size: 13px; font-weight: 500;">${comp.name}</span>
            <div>
                <input type="number" 
                       class="component-qty"
                       data-name="${comp.name}"
                       data-material="${comp.material}"
                       value="0" 
                       min="0" 
                       style="width: 80px; padding: 6px; background: #1e232b; border: 1px solid #2a2f38; border-radius: 4px; color: #fff; text-align: center;">
                <span style="color: #a0a0a0; margin-left: 5px;">шт/изд</span>
            </div>
        `;
        container.appendChild(row);
    });
}

// Сбор комплектующих из формы
function collectComponents() {
    const components = [];
    document.querySelectorAll('.component-qty').forEach(input => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            components.push({
                name: input.dataset.name,
                material: input.dataset.material,
                quantityPerProduct: qty
            });
        }
    });
    return components;
}

// Экспортируем функции в глобальную область
window.updateComponentsList = updateComponentsList;
window.collectComponents = collectComponents;

console.log('✅ Функции комплектующих загружены');
