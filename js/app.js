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
                    </tr>
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

// ============== ФУНКЦИЯ getOperationCount (ПОЛНАЯ ВЕРСИЯ) ==============
function getOperationCount(productName, siteKey) {
    // Операции для токарного участка
    const tokarniyOps = {
    'XRAY 1': 7,
    'XRAY 3': 7,
    'XRAY 3-2': 10,
    'XRAY 3-GRP': 6,
    'XRAY 6': 7,
    'XRAY 6 RGBW': 9,
    'XRAY 6-2 проходной': 9,
    'XRAY 6-2 оконечный': 9,
    'XRAY 6-T2 BT 180': 3,
    'XRAY 6-T2 BT 200': 3,
    'XRAY 6-T2 BT 220': 3,
    'XRAY 6-T2 BT 220 Шторка х2': 3,
    'XRAY 6-T2 BT 240 Шторка': 3,
    'XRAY 6-T2 BZ 180': 3,
    'XRAY 6-T2 BZ 200 Шторка': 3,
    'XRAY 6-T2 BZ 220': 4,
    'XRAY 6-T2 BZ 220 Шторка х2': 3,
    'XRAY 6-T2 BZ 240 Шторка': 3,
    'XRAY 6T Накладной': 6,
    'XRAY 6T BT 120': 3,
    'XRAY 6T BT 140 Шторка': 3,
    'XRAY 6T BZ 120': 4,
    'XRAY 6T BZ 140 Шторка': 3,
    'XRAY 6T RGBW BT 150': 3,
    'XRAY 9': 10,
    'XRAY 9S': 3,
    'XRAY 12S': 3,
    'XRAY 18': 10,
    'XRAY 18S': 3,
    'XSLOPE': 6,
    'XPIXEL BIN v.1': 3,
    'XPIXEL BIN v.2': 5,
    'XPIXEL BIN v.3': 5,
    'XPIXEL OVHD': 3,
    'XDISK': 12,
    'XPOINT OVHD': 2,
    'XSPOT': 6,
    'ACENTO 3T': 5,
    'ACENTO 4': 3
    'ACENTO 4': 3
    // Остальные изделия не указываем - они вернут 1 по умолчанию
};

    // Операции для слесарного участка
    const slesarniyOps = {
        'XRAY 1': 4,
        'XRAY 3': 5,
        'XRAY 3-2': 4,
        'XRAY 3-GRP': 3,
        'XRAY 6': 5,
        'XRAY 6 RGBW': 5,
        'XRAY 6-2 проходной': 5,
        'XRAY 6-2 оконечный': 5,
        'XRAY 6-T2 BT 180': 7,
        'XRAY 6-T2 BT 200': 8,
        'XRAY 6-T2 BT 220': 7,
        'XRAY 6-T2 BT 220 Шторка х2': 8,
        'XRAY 6-T2 BT 240 Шторка': 8,
        'XRAY 6-T2 BZ 180': 7,
        'XRAY 6-T2 BZ 200 Шторка': 8,
        'XRAY 6-T2 BZ 220': 7,
        'XRAY 6-T2 BZ 220 Шторка х2': 8,
        'XRAY 6-T2 BZ 240 Шторка': 8,
        'XRAY 6T Накладной': 6,
        'XRAY 6T BT 120': 8,
        'XRAY 6T BT 140 Шторка': 9,
        'XRAY 6T BZ 120': 8,
        'XRAY 6T BZ 140 Шторка': 9,
        'XRAY 6T RGBW BT 150': 8,
        'XRAY 9': 5,
        'XRAY 9S': 5,
        'XRAY 12S': 5,
        'XRAY 18': 5,
        'XRAY 18S': 5,
        'XRAY 36': 5,
        'XRAY 36S': 5,
        'XSLOPE': 6,
        'XPIXEL BIN v.1': 3,
        'XPIXEL BIN v.2': 2,
        'XPIXEL BIN v.3': 4,
        'XPIXEL OVHD': 1,
        'XDISK': 5,
        'XPOINT OVHD': 1,
        'XSPOT': 3,
        'ACENTO 3T': 6,
        'ACENTO 4': 6,
        'XROLL-lite P': 8,
        'XROLL-lite K': 8,
        'XWHITE': 10,
        'XEYES 130*90 1': 6,
        'XEYES 130*90 2': 6,
        'XEYES 130*90 3': 6,
        'XEYES 130*90 4': 6,
        'XEYES 130*120 1': 6,
        'XEYES 130*120 2': 6,
        'XEYES 130*120 3': 6,
        'XEYES 130*120 4': 6,
        'XEYES mini-1': 8,
        'XGIRO': 7,
        'XGLOW': 8,
        'XGLOW mini': 8,
        'XGRAY v.1': 10,
        'XLITE': 9,
        'XSMART': 9,
        'XSMART mini': 9,
        'XSTRONG': 7,
        'XLUMO': 9,
        'XLUMO 1-6': 9,
        'XLUMO Двунаправленный': 8,
        'XLUMO PROV': 10,
        'XVISION': 3,
        'XBAR-SW': 7,
        'XMODULE-2x2': 2,
        'XMODULE-6x2': 3,
        'XFOCUS': 7,
        'XYELLOW': 8,
        'XGRAY v.2': 7,
        'XLINE': 9
    };

    // Операции для фрезерного участка
    const frezerniyOps = {
        'XRAY 1': 1,
        'XRAY 3': 1,
        'XRAY 3-2': 1,
        'XRAY 3-GRP': 0,
        'XRAY 6': 0,
        'XRAY 6 RGBW': 0,
        'XRAY 6-2 проходной': 1,
        'XRAY 6-2 оконечный': 1,
        'XRAY 6-T2 BT 180': 0,
        'XRAY 6-T2 BT 200': 0,
        'XRAY 6-T2 BT 220': 0,
        'XRAY 6-T2 BT 220 Шторка х2': 0,
        'XRAY 6-T2 BT 240 Шторка': 0,
        'XRAY 6-T2 BZ 180': 0,
        'XRAY 6-T2 BZ 200 Шторка': 0,
        'XRAY 6-T2 BZ 220': 0,
        'XRAY 6-T2 BZ 220 Шторка х2': 0,
        'XRAY 6-T2 BZ 240 Шторка': 0,
        'XRAY 6T Накладной': 0,
        'XRAY 6T BT 120': 0,
        'XRAY 6T BT 140 Шторка': 0,
        'XRAY 6T BZ 120': 0,
        'XRAY 6T BZ 140 Шторка': 0,
        'XRAY 6T RGBW BT 150': 0,
        'XRAY 9': 1,
        'XRAY 9S': 0,
        'XRAY 12S': 0,
        'XRAY 18': 1,
        'XRAY 18S': 0,
        'XRAY 36': 1,
        'XRAY 36S': 0,
        'XSLOPE': 0,
        'XPIXEL BIN v.1': 1,
        'XPIXEL BIN v.2': 1,
        'XPIXEL BIN v.3': 1,
        'XPIXEL OVHD': 0,
        'XDISK': 1,
        'XPOINT OVHD': 0,
        'XSPOT': 0,
        'ACENTO 3T': 0,
        'ACENTO 4': 0,
        'XROLL-lite P': 1,
        'XROLL-lite K': 1,
        'XWHITE': 1,
        'XEYES 130*90 1': 1,
        'XEYES 130*90 2': 1,
        'XEYES 130*90 3': 1,
        'XEYES 130*90 4': 1,
        'XEYES 130*120 1': 1,
        'XEYES 130*120 2': 1,
        'XEYES 130*120 3': 1,
        'XEYES 130*120 4': 1,
        'XEYES mini-1': 0,
        'XGIRO': 2,
        'XGLOW': 2,
        'XGLOW mini': 0,
        'XGRAY v.1': 2,
        'XLITE': 2,
        'XSMART': 2,
        'XSMART mini': 2,
        'XSTRONG': 1,
        'XLUMO': 5,
        'XLUMO 1-6': 4,
        'XLUMO Двунаправленный': 3,
        'XLUMO PROV': 3,
        'XVISION': 0,
        'XBAR-SW': 1,
        'XMODULE-2x2': 0,
        'XMODULE-6x2': 0,
        'XFOCUS': 1,
        'XYELLOW': 1,
        'XGRAY v.2': 2,
        'XLINE': 1
    };

    // Операции для лазерно-гибочного участка
    const lazernoOps = {
        'XRAY 1': 2,
        'XRAY 3': 2,
        'XRAY 3-2': 2,
        'XRAY 3-GRP': 2,
        'XRAY 6': 3,
        'XRAY 6 RGBW': 3,
        'XRAY 6-2 проходной': 2,
        'XRAY 6-2 оконечный': 2,
        'XRAY 6-T2 BT 180': 4,
        'XRAY 6-T2 BT 200': 4,
        'XRAY 6-T2 BT 220': 4,
        'XRAY 6-T2 BT 220 Шторка х2': 4,
        'XRAY 6-T2 BT 240 Шторка': 4,
        'XRAY 6-T2 BZ 180': 4,
        'XRAY 6-T2 BZ 200 Шторка': 4,
        'XRAY 6-T2 BZ 220': 4,
        'XRAY 6-T2 BZ 220 Шторка х2': 4,
        'XRAY 6-T2 BZ 240 Шторка': 4,
        'XRAY 6T Накладной': 3,
        'XRAY 6T BT 120': 5,
        'XRAY 6T BT 140 Шторка': 5,
        'XRAY 6T BZ 120': 5,
        'XRAY 6T BZ 140 Шторка': 5,
        'XRAY 6T RGBW BT 150': 5,
        'XRAY 9': 2,
        'XRAY 9S': 4,
        'XRAY 12S': 4,
        'XRAY 18': 3,
        'XRAY 18S': 4,
        'XRAY 36': 3,
        'XRAY 36S': 4,
        'XSLOPE': 4,
        'XPIXEL BIN v.3': 2,
        'XPIXEL OVHD': 1,
        'XSPOT': 2,
        'ACENTO 3T': 4,
        'ACENTO 4': 4,
        'XROLL-lite K': 2,
        'XEYES 130*90 1': 3,
        'XEYES 130*90 2': 3,
        'XEYES 130*90 3': 3,
        'XEYES 130*90 4': 3,
        'XEYES 130*120 1': 3,
        'XEYES 130*120 2': 3,
        'XEYES 130*120 3': 3,
        'XEYES 130*120 4': 3,
        'XEYES mini-1': 5,
        'XGIRO': 4,
        'XGLOW': 2,
        'XGLOW mini': 2,
        'XGRAY v.1': 1,
        'XLITE': 4,
        'XSMART': 4,
        'XSMART mini': 5,
        'XSTRONG': 5,
        'XLUMO': 5,
        'XLUMO 1-6': 4,
        'XLUMO Двунаправленный': 4,
        'XLUMO PROV': 5,
        'XVISION': 4,
        'XBAR-SW': 5,
        'XMODULE-2x2': 2,
        'XMODULE-6x2': 1,
        'XFOCUS': 5,
        'XYELLOW': 1,
        'XGRAY v.2': 5,
        'XLINE': 0
    };

    // Операции для полимерного участка
    const polimerniyOps = {
        'XRAY 1': 2,
        'XRAY 3': 2,
        'XRAY 3-2': 2,
        'XRAY 3-GRP': 2,
        'XRAY 6': 3,
        'XRAY 6 RGBW': 3,
        'XRAY 6-2 проходной': 2,
        'XRAY 6-2 оконечный': 2,
        'XRAY 6-T2 BT 180': 2,
        'XRAY 6-T2 BT 200': 2,
        'XRAY 6-T2 BT 220': 2,
        'XRAY 6-T2 BT 220 Шторка х2': 2,
        'XRAY 6-T2 BT 240 Шторка': 2,
        'XRAY 6-T2 BZ 180': 2,
        'XRAY 6-T2 BZ 200 Шторка': 2,
        'XRAY 6-T2 BZ 220': 2,
        'XRAY 6-T2 BZ 220 Шторка х2': 2,
        'XRAY 6-T2 BZ 240 Шторка': 2,
        'XRAY 6T Накладной': 4,
        'XRAY 6T BT 120': 4,
        'XRAY 6T BT 140 Шторка': 4,
        'XRAY 6T BZ 120': 4,
        'XRAY 6T BZ 140 Шторка': 4,
        'XRAY 6T RGBW BT 150': 4,
        'XRAY 9': 4,
        'XRAY 9S': 3,
        'XRAY 12S': 3,
        'XRAY 18': 5,
        'XRAY 18S': 3,
        'XRAY 36': 5,
        'XRAY 36S': 3,
        'XSLOPE': 3,
        'XPIXEL BIN v.1': 2,
        'XPIXEL BIN v.2': 2,
        'XPIXEL BIN v.3': 3,
        'XPIXEL OVHD': 2,
        'XDISK': 3,
        'XPOINT OVHD': 1,
        'XSPOT': 2,
        'ACENTO 3T': 3,
        'ACENTO 4': 3,
        'XROLL-lite P': 2,
        'XROLL-lite K': 2,
        'XWHITE': 3,
        'XEYES 130*90 1': 2,
        'XEYES 130*90 2': 2,
        'XEYES 130*90 3': 2,
        'XEYES 130*90 4': 2,
        'XEYES 130*120 1': 2,
        'XEYES 130*120 2': 2,
        'XEYES 130*120 3': 2,
        'XEYES 130*120 4': 2,
        'XEYES mini-1': 4,
        'XGIRO': 4,
        'XGLOW': 5,
        'XGLOW mini': 3,
        'XGRAY v.1': 4,
        'XLITE': 4,
        'XSMART': 5,
        'XSMART mini': 4,
        'XSTRONG': 3,
        'XLUMO': 4,
        'XLUMO 1-6': 4,
        'XLUMO Двунаправленный': 4,
        'XLUMO PROV': 4,
        'XVISION': 1,
        'XBAR-SW': 4,
        'XMODULE-2x2': 1,
        'XMODULE-6x2': 0,
        'XFOCUS': 3,
        'XYELLOW': 3,
        'XGRAY v.2': 5,
        'XLINE': 2
    };

    // Выбираем нужный объект в зависимости от участка
    let siteOperations;
    switch(siteKey) {
        case 'tokarniy':
            siteOperations = tokarniyOps;
            break;
        case 'slesarniy':
            siteOperations = slesarniyOps;
            break;
        case 'frezerniy':
            siteOperations = frezerniyOps;
            break;
        case 'lazerno':
            siteOperations = lazernoOps;
            break;
        case 'polimerniy':
            siteOperations = polimerniyOps;
            break;
        default:
            return 1;
    }

    // Возвращаем количество операций или 1 по умолчанию
    return siteOperations[productName] !== undefined ? siteOperations[productName] : 1;
}

// ============== ФУНКЦИЯ createSiteRow ==============
function createSiteRow(name, order, siteKey) {
    if (!order.items || order.items.length === 0) {
        return '<div>Нет изделий</div>';
    }

    const item = order.items[0];
    const operationCount = getOperationCount(item.product, siteKey);
    const operations = getOperationNames(item.product, siteKey);

    let squares = '';
    let completedCount = 0;

    for (let i = 0; i < operationCount; i++) {
        const taskId = `${order.id}_${siteKey}_${i}`;
        const status = order.tasks && order.tasks[taskId] ? order.tasks[taskId] : '';

        if (status === 'green') completedCount++;

        const operationName = (operations && operations[i]) ? operations[i] : `Операция ${i+1}`;

        squares += `<div class="square ${status}" data-task="${taskId}" title="${operationName}"></div>`;
    }

    if (order.extraTasks) {
        order.extraTasks.forEach((task, index) => {
            if (task.site === siteKey) {
                const taskId = `${order.id}_extra_${index}`;
                const status = order.tasks && order.tasks[taskId] ? order.tasks[taskId] : '';

                if (status === 'green') completedCount++;

                squares += `<div class="square ${status} extra-square" data-task="${taskId}" title="${task.title} (доп.)"></div>`;
            }
        });
    }

    const totalOperations = operationCount + (order.extraTasks?.filter(t => t.site === siteKey).length || 0);

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

function deleteOrder(orderId) {
    console.log('deleteOrder вызвана', orderId);
    if (confirm('Удалить заказ?')) {
        orders = orders.filter(o => o.id !== orderId);
        saveOrdersToStorage(orders);
        loadOrders();
        updateStatistics();
    }
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

        console.log('✅ Продукты загружены:', products.length);
        console.log('✅ Кронштейны загружены:', brackets.length);
        console.log('✅ Лиры загружены:', lyres.length);
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
                status: 'active',
                tasks: {},
                extraTasks: []
            };

            orders.push(order);
            saveOrdersToStorage(orders);
            loadOrders();
            updateStatistics();
            closeOrderModal();
            alert('✅ Заказ успешно создан!');
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

console.log('📤 Экспорт функций в глобальную область...');
console.log('✅ Функции экспортированы:', Object.keys(window).filter(key => 
    typeof window[key] === 'function' && 
    ['openOrderModal', 'closeOrderModal', 'loadProductSizes', 'exportOrders', 
     'showMaterialsReport', 'deleteOrder', 'addExtraTask', 'closeMaterialsModal', 'syncTasksFromHistory'].includes(key)
));
console.log('✅ app.js полностью загружен');
