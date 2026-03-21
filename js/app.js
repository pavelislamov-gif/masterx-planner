// Глобальные переменные
let products = [];
let brackets = [];
let lyres = [];
let orders = [];
let materialsReport = null;

// ============== ФИЛЬТРАЦИЯ ЗАКАЗОВ ПО ДАТЕ ==============
// Используем window для хранения текущей даты фильтра, чтобы избежать конфликта
if (typeof window.currentFilterDate === 'undefined') {
    window.currentFilterDate = new Date().toISOString().split('T')[0];
}

// Функция фильтрации заказов по дате
function filterOrdersByDate(action) {
    const today = new Date();
    let newDate = new Date(window.currentFilterDate);
    
    switch(action) {
        case 'prev':
            newDate.setDate(newDate.getDate() - 1);
            break;
        case 'next':
            newDate.setDate(newDate.getDate() + 1);
            break;
        case 'today':
            newDate = new Date();
            break;
        default:
            return;
    }
    
    window.currentFilterDate = newDate.toISOString().split('T')[0];
    updateFilterDateDisplay();
    loadOrders();
    updateStatistics();
}

// Обновление отображения текущей даты фильтра
function updateFilterDateDisplay() {
    const displaySpan = document.getElementById('currentFilterDate');
    if (displaySpan) {
        const date = new Date(window.currentFilterDate);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const isToday = window.currentFilterDate === new Date().toISOString().split('T')[0];
        const prefix = isToday ? '📅 Сегодня, ' : '📅 ';
        displaySpan.textContent = `${prefix}${date.toLocaleDateString('ru-RU', options)}`;
    }
}

// Форматирование даты для отображения
function formatDateForDisplay(dateString) {
    if (!dateString) return 'Дата не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
}

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
        
        if (newTasks.length > 0) {
            const updatedTasks = [...existingTasks, ...newTasks];
            localStorage.setItem(storageKey, JSON.stringify(updatedTasks));
            console.log(`✅ ${siteKey}: добавлено ${newTasks.length} задач на ${orderDate}`);
        }
    });
    
    console.log(`🎉 Задачи для заказа №${order.number} созданы!`);
}

// ============== ФУНКЦИИ ДЛЯ РАБОТЫ С ЗАКАЗАМИ ==============
// Загрузка и отображение заказов с фильтрацией по дате
function loadOrders() {
    console.log('loadOrders вызвана, фильтр даты:', window.currentFilterDate);
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    // Фильтруем заказы по выбранной дате
    const filteredOrders = orders.filter(order => order.date === window.currentFilterDate);
    
    console.log(`📅 Заказов на ${window.currentFilterDate}: ${filteredOrders.length} из ${orders.length} всего`);

    ordersList.innerHTML = '';

    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Нет заказов на ${formatDateForDisplay(window.currentFilterDate)}</div></div>`;
        return;
    }

    filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredOrders.forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';
        card.dataset.orderId = order.id;

        const header = document.createElement('div');
        header.className = 'order-header';

        const item = order.items[0];
        
        // Формируем строку с краткой информацией для шапки
        const shortInfo = [];
        shortInfo.push(`📦 ${item.product}`);
        shortInfo.push(`📏 ${item.size}`);
        shortInfo.push(`🔢 ${item.quantity} шт`);
        
        // Добавляем кронштейн если не отсутствует
        if (item.bracket.type !== 'отсутствует') {
            shortInfo.push(`🔧 ${item.bracket.type} (${item.bracket.quantity} шт)`);
        }
        
        // Добавляем лиру если не отсутствует
        if (item.lyre.type !== 'отсутствует') {
            shortInfo.push(`🎸 ${item.lyre.type} (${item.lyre.quantity} шт)`);
        }
        
        // Добавляем RAL если есть
        if (item.ral) {
            shortInfo.push(`🎨 ${item.ral}`);
        }
        
        // Добавляем текстуру если есть
        if (item.texture) {
            shortInfo.push(`🧵 ${item.texture}`);
        }
        
        header.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                        <h3 style="margin: 0;">📦 Заказ №${order.number}</h3>
                        <span style="background: #ff3b3b; color: white; padding: 3px 10px; border-radius: 15px; font-size: 12px;">В работе</span>
                        <span style="background: #2a2f38; padding: 3px 10px; border-radius: 15px; font-size: 12px; color: #fff;">
                            Деталей: ${item.quantity} шт
                        </span>
                        <span style="background: #1e232b; padding: 3px 10px; border-radius: 15px; font-size: 12px; color: #ff9800;">
                            📅 ${formatDateForDisplay(order.date)}
                        </span>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-info" onclick="event.stopPropagation(); showMaterialsReport(${order.id})">📊 Материалы</button>
                        <button class="btn btn-danger" onclick="event.stopPropagation(); deleteOrder(${order.id})">🗑️ Удалить</button>
                    </div>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 15px; font-size: 12px; color: #a0a0a0; padding-top: 5px; border-top: 1px solid #2a2f38;">
                    ${shortInfo.map(info => `<span>${info}</span>`).join('')}
                </div>
            </div>
        `;

        const content = document.createElement('div');
        content.className = 'order-content';
        content.style.display = 'none';

        // ИСПРАВЛЕНО: убраны все дублирования в таблице
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
                        <td><strong>${item.product}</strong>${item.product}
                        <td>${item.size}${item.size}
                        <td>${item.quantity} шт${item.quantity}
                        <td>${item.bracket.type} (${item.bracket.quantity} шт)${item.bracket.type}
                        <td>${item.lyre.type} (${item.lyre.quantity} шт)${item.lyre.type}
                        <td>${item.ral || '-'}${item.ral}
                        <td>${item.texture || '-'}${item.texture}
                    </tr>
                </tbody>
            }</table>
            
            <div class="sites-section">
                <h4 style="margin-bottom: 15px;">🏭 Производственные участки</h4>
                <div class="sites-grid">
                    ${createSiteRow(' Токарный', order, 'tokarniy')}
                    ${createSiteRow(' Слесарный', order, 'slesarniy')}
                    ${createSiteRow(' Фрезерный', order, 'frezerniy')}
                    ${createSiteRow(' Лазерно-гибочный', order, 'lazerno')}
                    ${createSiteRow(' Полимерный', order, 'polimerniy')}
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

// Обновление статистики только для заказов на текущую дату фильтра
function updateStatistics() {
    console.log('updateStatistics вызвана');
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalItemsEl = document.getElementById('totalItems');
    const activeTasksEl = document.getElementById('activeTasks');
    const completedTasksEl = document.getElementById('completedTasks');

    // Фильтруем заказы по текущей дате
    const filteredOrders = orders.filter(order => order.date === window.currentFilterDate);
    
    if (totalOrdersEl) totalOrdersEl.textContent = filteredOrders.length;

    const totalItems = filteredOrders.reduce((sum, order) => sum + (order.items[0]?.quantity || 0), 0);
    if (totalItemsEl) totalItemsEl.textContent = totalItems;

    let activeTasks = 0;
    let completedTasks = 0;

    filteredOrders.forEach(order => {
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
const operationsDB = window.TASK_OPERATIONS || {};

// ============== ФУНКЦИЯ getOperationNames ==============
function getOperationNames(productName, siteKey) {
    const siteOps = operationsDB[siteKey] || {};
    if (siteOps[productName]) return siteOps[productName];
    for (let key in siteOps) {
        if (productName.includes(key)) return siteOps[key];
    }
    return [];
}

// ============== ФУНКЦИЯ createSiteRow ==============
function createSiteRow(name, order, siteKey) {
    if (!order.items || order.items.length === 0) return '<div>Нет изделий</div>';

    const item = order.items[0];
    const operations = getOperationNames(item.product, siteKey);
    
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

    let squares = '';
    let completedCount = 0;

    for (let i = 0; i < operations.length; i++) {
        const taskId = `${order.id}_${siteKey}_0_${i}`;
        let status = '';
        if (order.tasks && order.tasks[taskId]) {
            status = order.tasks[taskId];
            if (status === 'green') completedCount++;
        }
        squares += `<div class="square ${status}" data-task="${taskId}" title="${operations[i]}"></div>`;
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
            <div class="squares">${squares}</div>
            <span style="color: #a0a0a0; font-size: 12px; margin: 0 10px;">${completedCount}/${totalOperations}</span>
            <button class="btn btn-sm btn-primary" onclick="addExtraTask(${order.id}, '${siteKey}')">➕</button>
        </div>
    `;
}

// ============== ФУНКЦИИ ДЛЯ РАБОТЫ С ЗАКАЗАМИ ==============

async function showMaterialsReport(orderId) {
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

function deleteOrder(orderId) {
    if (!confirm('Удалить заказ? Все связанные задачи на участках также будут удалены.')) return;
    const deletedOrder = orders.find(o => o.id === orderId);
    orders = orders.filter(o => o.id !== orderId);
    saveOrdersToStorage(orders);
    if (deletedOrder) deleteOrderTasksFromAllSites(deletedOrder);
    loadOrders();
    updateStatistics();
    alert('✅ Заказ и связанные задачи удалены');
}

function deleteOrderTasksFromAllSites(order) {
    const sites = ['tokarniy', 'slesarniy', 'frezerniy', 'lazerno', 'polimerniy'];
    const dates = getAllRelevantDates();
    sites.forEach(site => {
        dates.forEach(date => {
            const historyKey = `tasks_${site}_${date}`;
            try {
                const tasksJson = localStorage.getItem(historyKey);
                if (tasksJson) {
                    let tasks = JSON.parse(tasksJson);
                    const filteredTasks = tasks.filter(task => {
                        const taskOrderId = task.orderId || (task.id ? task.id.split('_')[0] : null);
                        return String(taskOrderId) !== String(order.id);
                    });
                    if (filteredTasks.length !== tasks.length) {
                        localStorage.setItem(historyKey, JSON.stringify(filteredTasks));
                    }
                }
            } catch (e) {}
        });
    });
}

function getAllRelevantDates() {
    const dates = [];
    const today = new Date();
    for (let i = -30; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
}

function addExtraTask(orderId, siteKey) {
    const taskName = prompt('Введите название дополнительной задачи:');
    if (!taskName) return;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (!order.extraTasks) order.extraTasks = [];
    order.extraTasks.push({ title: taskName, site: siteKey, createdAt: new Date().toISOString() });
    saveOrdersToStorage(orders);
    loadOrders();
}

function exportOrders() {
    try {
        if (orders.length === 0) {
            alert('Нет заказов для экспорта');
            return;
        }
        const exportData = { exportDate: new Date().toISOString(), version: '1.0', orders: orders };
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const date = new Date();
        const fileName = `masterx_orders_${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();
        alert(`✅ Экспортировано ${orders.length} заказов`);
    } catch (error) {
        console.error('❌ Ошибка экспорта:', error);
        alert('Ошибка при экспорте заказов');
    }
}

function closeMaterialsModal() {
    const modal = document.getElementById('materialsModal');
    if (modal) modal.style.display = 'none';
}

// ============== ОСНОВНАЯ ФУНКЦИЯ ЗАГРУЗКИ ==============
async function loadAllData() {
    try {
        products = await loadProducts() || [];
        brackets = await loadBrackets() || [];
        lyres = await loadLyres() || [];
        orders = loadOrdersFromStorage() || [];
        await loadComponents();

        syncTasksFromHistory();
        populateSelects();
        updateFilterDateDisplay();
        loadOrders();
        updateStatistics();

        if (typeof MaterialsReport !== 'undefined') {
            window.materialsReport = new MaterialsReport();
            window.materialsReport.materialsDB.brackets = brackets;
            window.materialsReport.materialsDB.lyres = lyres;
            window.materialsReport.loadMaterialsData().catch(err => console.error('❌ Ошибка инициализации отчета:', err));
        }

        window.addEventListener('storage', function(e) {
            if (e.key === 'masterx_orders') {
                orders = JSON.parse(e.newValue || '[]');
                loadOrders();
                updateStatistics();
            }
            if (e.key && e.key.startsWith('tasks_')) syncTasksFromHistory();
        });

        window.addEventListener('taskStatusChanged', function(e) {
            updateTaskStatus(e.detail.taskId, e.detail.status);
        });

    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
    }
}

// ============== ИНИЦИАЛИЗАЦИЯ ==============
document.addEventListener('DOMContentLoaded', async function() {
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
            createTasksForOrder(order);
            window.currentFilterDate = order.date;
            updateFilterDateDisplay();
            loadOrders();
            updateStatistics();
            closeOrderModal();
            alert(`✅ Заказ №${order.number} успешно создан на ${formatDateForDisplay(order.date)}!`);
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
window.createTasksForOrder = createTasksForOrder;
window.filterOrdersByDate = filterOrdersByDate;
window.updateFilterDateDisplay = updateFilterDateDisplay;

// ============== КОМПЛЕКТУЮЩИЕ ==============

function updateComponentsList() {
    const productName = document.getElementById('productSelect').value;
    const container = document.getElementById('componentsContainer');
    if (!container) return;
    container.innerHTML = '';
    if (!productName) return;
    const components = window.componentsData[productName] || [];
    if (components.length === 0) return;
    const title = document.createElement('div');
    title.style.cssText = 'margin-bottom: 12px; color: #ff3b3b; font-size: 14px; font-weight: 600; border-left: 3px solid #ff3b3b; padding-left: 10px;';
    title.innerHTML = '🔧 КОМПЛЕКТУЮЩИЕ ДЕТАЛИ:';
    container.appendChild(title);
    const desc = document.createElement('div');
    desc.style.cssText = 'margin-bottom: 12px; color: #a0a0a0; font-size: 12px; padding-left: 10px;';
    desc.innerHTML = 'Введите количество на 1 изделие:';
    container.appendChild(desc);
    components.forEach(comp => {
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #15191f; border-radius: 6px; border: 1px solid #2a2f38; margin-bottom: 8px;';
        row.innerHTML = `
            <span style="font-size: 13px; font-weight: 500;">${comp.name}</span>
            <div>
                <input type="number" class="component-qty" data-name="${comp.name}" data-material="${comp.material}" value="0" min="0" style="width: 80px; padding: 6px; background: #1e232b; border: 1px solid #2a2f38; border-radius: 4px; color: #fff; text-align: center;">
                <span style="color: #a0a0a0; margin-left: 5px;">шт/изд</span>
            </div>
        `;
        container.appendChild(row);
    });
}

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

window.updateComponentsList = updateComponentsList;
window.collectComponents = collectComponents;

console.log('✅ app.js полностью загружен');
