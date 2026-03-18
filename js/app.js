// ============== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==============
let allProducts = [];
let allBrackets = [];
let allLyres = [];
let currentOrderId = null;
let materialsReport = null;

// ============== ЗАГРУЗКА ДАННЫХ ==============
async function loadAllData() {
    console.log('loadAllData: начало загрузки');
    
    try {
        // Загружаем продукты
        allProducts = await loadProducts();
        console.log('✅ Продукты загружены:', allProducts.length);
        
        // Загружаем кронштейны
        allBrackets = await loadBrackets();
        console.log('✅ Кронштейны загружены:', allBrackets.length);
        
        // Загружаем лиры
        allLyres = await loadLyres();
        console.log('✅ Лиры загружены:', allLyres.length);
        
        // Загружаем заказы
        loadOrders();
        
        // Синхронизируем задачи с заказами
        if (typeof syncTasksFromHistory === 'function') {
            syncTasksFromHistory();
        }
        
        // Заполняем выпадающие списки
        populateSelects();
        
        // Инициализируем отчет по материалам
        if (typeof MaterialsReport !== 'undefined') {
            materialsReport = new MaterialsReport();
            console.log('✅ Отчет по материалам инициализирован');
        }
        
        console.log('✅ loadAllData завершена');
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
    }
}

// ============== ЗАГРУЗКА ЗАКАЗОВ ==============
function loadOrders() {
    console.log('loadOrders вызвана');
    
    const orders = loadOrdersFromStorage() || [];
    const tbody = document.getElementById('ordersTableBody');
    
    if (!tbody) return;
    
    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    📭 Нет активных заказов
                </td>
            </tr>
        `;
        updateStatistics();
        return;
    }
    
    let html = '';
    orders.forEach(order => {
        const orderDate = order.date ? new Date(order.date).toLocaleDateString('ru-RU') : '—';
        const deadline = order.deadline ? new Date(order.deadline).toLocaleDateString('ru-RU') : '—';
        
        html += `
            <tr data-order-id="${order.id}" style="cursor: pointer;" onclick="openOrderModal(${order.id})">
                <td>${order.number || '—'}</td>
                <td>${order.customer || '—'}</td>
                <td>${orderDate}</td>
                <td>${deadline}</td>
                <td>
                    <span class="status-badge status-${order.status || 'new'}">
                        ${getStatusText(order.status)}
                    </span>
                </td>
                <td>${order.items?.length || 0}</td>
                <td>${order.totalQuantity || 0}</td>
                <td>
                    <button class="btn-icon" onclick="event.stopPropagation(); addExtraTask(${order.id})" title="Доп. задача">➕</button>
                    <button class="btn-icon" onclick="event.stopPropagation(); deleteOrder(${order.id})" title="Удалить">🗑️</button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    updateStatistics();
}

// ============== СТАТИСТИКА ==============
function updateStatistics() {
    console.log('updateStatistics вызвана');
    
    const orders = loadOrdersFromStorage() || [];
    
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => o.status === 'active' || o.status === 'new').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalItems = orders.reduce((sum, o) => sum + (o.totalQuantity || 0), 0);
    
    const totalOrdersEl = document.getElementById('totalOrders');
    const activeOrdersEl = document.getElementById('activeOrders');
    const completedOrdersEl = document.getElementById('completedOrders');
    const totalItemsEl = document.getElementById('totalItems');
    
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (activeOrdersEl) activeOrdersEl.textContent = activeOrders;
    if (completedOrdersEl) completedOrdersEl.textContent = completedOrders;
    if (totalItemsEl) totalItemsEl.textContent = totalItems;
}

function getStatusText(status) {
    const statuses = {
        'new': 'Новый',
        'active': 'В работе',
        'completed': 'Завершён',
        'delayed': 'Просрочен'
    };
    return statuses[status] || status || 'Новый';
}

// ============== ЗАПОЛНЕНИЕ SELECT-ОВ ==============
function populateSelects() {
    console.log('Заполнение select-ов...');
    
    // Заполнение продуктов
    const productSelect = document.getElementById('productSelect');
    if (productSelect && allProducts.length) {
        productSelect.innerHTML = '<option value="">Выберите продукт</option>' +
            allProducts.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
    }
    
    // Заполнение кронштейнов
    const bracketSelect = document.getElementById('bracketSelect');
    if (bracketSelect && allBrackets.length) {
        bracketSelect.innerHTML = '<option value="">Выберите кронштейн</option>' +
            allBrackets.map(b => `<option value="${b.name}">${b.name}</option>`).join('');
    }
    
    // Заполнение лир
    const lyreSelect = document.getElementById('lyreSelect');
    if (lyreSelect && allLyres.length) {
        lyreSelect.innerHTML = '<option value="">Выберите лиру</option>' +
            allLyres.map(l => `<option value="${l.name}">${l.name}</option>`).join('');
    }
}

// ============== ЗАГРУЗКА РАЗМЕРОВ ПРОДУКТА ==============
function loadProductSizes() {
    const type = document.getElementById('productType')?.value;
    const productName = document.getElementById('productSelect')?.value;
    const bracketName = document.getElementById('bracketSelect')?.value;
    const lyreName = document.getElementById('lyreSelect')?.value;
    
    let sizes = [];
    
    if (type === 'product' && productName) {
        const product = allProducts.find(p => p.name === productName);
        sizes = product?.sizes || [];
    } else if (type === 'bracket' && bracketName) {
        const bracket = allBrackets.find(b => b.name === bracketName);
        sizes = bracket?.sizes || [];
    } else if (type === 'lyre' && lyreName) {
        const lyre = allLyres.find(l => l.name === lyreName);
        sizes = lyre?.sizes || [];
    }
    
    const sizeSelect = document.getElementById('sizeSelect');
    if (sizeSelect) {
        sizeSelect.innerHTML = '<option value="">Выберите размер</option>' +
            sizes.map(s => `<option value="${s}">${s}</option>`).join('');
    }
}

// ============== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА ЗАКАЗА ==============
function openOrderModal(orderId = null) {
    console.log('openOrderModal:', orderId);
    
    currentOrderId = orderId;
    const modal = document.getElementById('orderModal');
    
    if (!modal) {
        console.error('❌ Модальное окно orderModal не найдено!');
        return;
    }
    
    const title = document.getElementById('modalTitle');
    if (title) {
        title.textContent = orderId ? 'Редактирование заказа' : 'Новый заказ';
    } else {
        console.warn('⚠️ Элемент modalTitle не найден');
    }
    
    if (orderId) {
        loadOrderData(orderId);
    } else {
        clearOrderForm();
    }
    
    modal.style.display = 'block';
}

// ============== ЗАГРУЗКА ДАННЫХ ЗАКАЗА ==============
function loadOrderData(orderId) {
    const orders = loadOrdersFromStorage() || [];
    const order = orders.find(o => o.id == orderId);
    
    if (!order) return;
    
    const numberInput = document.getElementById('orderNumber');
    const customerInput = document.getElementById('orderCustomer');
    const dateInput = document.getElementById('orderDate');
    const deadlineInput = document.getElementById('orderDeadline');
    const statusSelect = document.getElementById('orderStatus');
    const notesInput = document.getElementById('orderNotes');
    
    if (numberInput) numberInput.value = order.number || '';
    if (customerInput) customerInput.value = order.customer || '';
    if (dateInput) dateInput.value = order.date || '';
    if (deadlineInput) deadlineInput.value = order.deadline || '';
    if (statusSelect) statusSelect.value = order.status || 'new';
    if (notesInput) notesInput.value = order.notes || '';
    
    // Загрузка позиций
    const itemsContainer = document.getElementById('orderItems');
    if (itemsContainer && itemsContainer.innerHTML) {
        itemsContainer.innerHTML = '';
        if (order.items && order.items.length) {
            order.items.forEach((item, index) => {
                addOrderItem(item, index);
            });
        } else {
            addOrderItem();
        }
    }
}

function clearOrderForm() {
    const numberInput = document.getElementById('orderNumber');
    const customerInput = document.getElementById('orderCustomer');
    const dateInput = document.getElementById('orderDate');
    const deadlineInput = document.getElementById('orderDeadline');
    const statusSelect = document.getElementById('orderStatus');
    const notesInput = document.getElementById('orderNotes');
    const itemsContainer = document.getElementById('orderItems');
    
    if (numberInput) numberInput.value = '';
    if (customerInput) customerInput.value = '';
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    if (deadlineInput) deadlineInput.value = '';
    if (statusSelect) statusSelect.value = 'new';
    if (notesInput) notesInput.value = '';
    if (itemsContainer) {
        itemsContainer.innerHTML = '';
        addOrderItem();
    }
}

function addOrderItem(item = null) {
    const container = document.getElementById('orderItems');
    if (!container) return;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item';
    itemDiv.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px;';
    
    itemDiv.innerHTML = `
        <select class="item-type" style="width: 120px; padding: 5px;">
            <option value="product" ${item?.type === 'product' ? 'selected' : ''}>Продукт</option>
            <option value="bracket" ${item?.type === 'bracket' ? 'selected' : ''}>Кронштейн</option>
            <option value="lyre" ${item?.type === 'lyre' ? 'selected' : ''}>Лира</option>
        </select>
        <input type="text" class="item-name" placeholder="Название" value="${item?.product || ''}" style="flex: 2; padding: 5px;">
        <input type="text" class="item-size" placeholder="Размер" value="${item?.size || ''}" style="flex: 1; padding: 5px;">
        <input type="number" class="item-quantity" placeholder="Кол-во" value="${item?.quantity || 1}" style="width: 80px; padding: 5px;">
        <button type="button" onclick="this.parentElement.remove()" style="background: none; border: none; color: #ff3b3b; cursor: pointer; font-size: 18px;">✕</button>
    `;
    container.appendChild(itemDiv);
}

// ============== СОХРАНЕНИЕ ЗАКАЗА ==============
function saveOrder() {
    const numberInput = document.getElementById('orderNumber');
    const customerInput = document.getElementById('orderCustomer');
    const dateInput = document.getElementById('orderDate');
    const deadlineInput = document.getElementById('orderDeadline');
    const statusSelect = document.getElementById('orderStatus');
    const notesInput = document.getElementById('orderNotes');
    
    const orderData = {
        id: currentOrderId || Date.now(),
        number: numberInput ? numberInput.value : '',
        customer: customerInput ? customerInput.value : '',
        date: dateInput ? dateInput.value : new Date().toISOString().split('T')[0],
        deadline: deadlineInput ? deadlineInput.value : '',
        status: statusSelect ? statusSelect.value : 'new',
        notes: notesInput ? notesInput.value : '',
        items: [],
        totalQuantity: 0
    };
    
    // Собираем позиции
    document.querySelectorAll('.order-item').forEach(itemDiv => {
        const type = itemDiv.querySelector('.item-type')?.value;
        const name = itemDiv.querySelector('.item-name')?.value;
        const size = itemDiv.querySelector('.item-size')?.value;
        const quantity = parseInt(itemDiv.querySelector('.item-quantity')?.value) || 1;
        
        if (name) {
            orderData.items.push({
                type,
                product: name,
                size,
                quantity
            });
            orderData.totalQuantity += quantity;
        }
    });
    
    let orders = loadOrdersFromStorage() || [];
    
    if (currentOrderId) {
        // Редактирование
        const index = orders.findIndex(o => o.id == currentOrderId);
        if (index !== -1) {
            orders[index] = orderData;
        }
    } else {
        // Новый заказ
        orders.push(orderData);
    }
    
    saveOrdersToStorage(orders);
    closeOrderModal();
    loadOrders();
    alert('✅ Заказ сохранен');
}

// ============== УДАЛЕНИЕ ЗАКАЗА (С СИНХРОНИЗАЦИЕЙ) ==============
function deleteOrder(orderId) {
    if (!confirm('Удалить заказ? Все связанные задачи на участках также будут удалены.')) {
        return;
    }
    
    console.log('🗑️ Удаление заказа:', orderId);
    
    // Загружаем текущие заказы
    let orders = loadOrdersFromStorage() || [];
    
    // Находим удаляемый заказ
    const deletedOrder = orders.find(o => o.id == orderId);
    
    // Удаляем заказ из списка
    orders = orders.filter(o => o.id != orderId);
    
    // Сохраняем обновленный список заказов
    saveOrdersToStorage(orders);
    
    // Удаляем задачи этого заказа со всех участков и дат
    if (deletedOrder) {
        deleteOrderTasksFromAllSites(deletedOrder);
    }
    
    // Перезагружаем отображение
    loadOrders();
    updateStatistics();
    
    // Уведомляем другие вкладки
    localStorage.setItem('orders_updated', Date.now());
    
    alert('✅ Заказ и связанные задачи удалены');
}

// ============== УДАЛЕНИЕ ЗАДАЧ ЗАКАЗА СО ВСЕХ УЧАСТКОВ ==============
function deleteOrderTasksFromAllSites(order) {
    console.log('🔍 Удаление задач заказа', order.id, 'со всех участков');
    
    // Список всех участков
    const sites = ['tokarniy', 'slesarniy', 'frezerniy', 'lazerno-gibochniy', 'polimerniy'];
    
    // Получаем все актуальные даты
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
                    
                    // Фильтруем - оставляем только задачи НЕ из этого заказа
                    const filteredTasks = tasks.filter(task => {
                        const taskOrderId = task.orderId || (task.id ? task.id.split('_')[0] : null);
                        return String(taskOrderId) !== String(order.id);
                    });
                    
                    if (filteredTasks.length !== beforeCount) {
                        const deleted = beforeCount - filteredTasks.length;
                        totalDeleted += deleted;
                        console.log(`  ✅ ${site} на ${date}: удалено ${deleted} задач`);
                        
                        localStorage.setItem(historyKey, JSON.stringify(filteredTasks));
                        notifySitePage(site, date);
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

// ============== УВЕДОМЛЕНИЕ СТРАНИЦЫ УЧАСТКА ==============
function notifySitePage(site, date) {
    const event = new CustomEvent('taskHistoryChanged', {
        detail: { 
            siteType: site, 
            date: date,
            timestamp: Date.now()
        }
    });
    window.dispatchEvent(event);
    
    localStorage.setItem(`tasks_updated_${site}_${date}`, Date.now());
}

// ============== СИНХРОНИЗАЦИЯ ЗАДАЧ С ЗАКАЗАМИ ==============
function syncTasksFromHistory() {
    console.log('🔄 Синхронизация задач с актуальными заказами...');
    
    const orders = loadOrdersFromStorage() || [];
    const activeOrderIds = orders.map(o => String(o.id));
    
    const sites = ['tokarniy', 'slesarniy', 'frezerniy', 'lazerno-gibochniy', 'polimerniy'];
    const dates = getAllRelevantDates();
    
    let totalCleaned = 0;
    
    sites.forEach(site => {
        dates.forEach(date => {
            const historyKey = `tasks_${site}_${date}`;
            try {
                const tasksJson = localStorage.getItem(historyKey);
                if (tasksJson) {
                    let tasks = JSON.parse(tasksJson);
                    const beforeCount = tasks.length;
                    
                    const filteredTasks = tasks.filter(task => {
                        if (task.isExtra) return true;
                        
                        const taskOrderId = task.orderId || (task.id ? task.id.split('_')[0] : null);
                        return activeOrderIds.includes(String(taskOrderId));
                    });
                    
                    if (filteredTasks.length !== beforeCount) {
                        localStorage.setItem(historyKey, JSON.stringify(filteredTasks));
                        totalCleaned += (beforeCount - filteredTasks.length);
                        console.log(`  Очищено ${beforeCount - filteredTasks.length} задач в ${site} на ${date}`);
                    }
                }
            } catch (e) {
                // Игнорируем ошибки
            }
        });
    });
    
    if (totalCleaned > 0) {
        console.log(`✅ Синхронизация завершена, удалено задач без заказов: ${totalCleaned}`);
    } else {
        console.log('✅ Синхронизация завершена, задач без заказов не найдено');
    }
    
    return totalCleaned;
}

// ============== ДОПОЛНИТЕЛЬНЫЕ ЗАДАЧИ ==============
function addExtraTask(orderId) {
    const extraTask = prompt('Введите название дополнительной задачи:');
    if (!extraTask) return;
    
    let orders = loadOrdersFromStorage() || [];
    const orderIndex = orders.findIndex(o => o.id == orderId);
    
    if (orderIndex === -1) return;
    
    if (!orders[orderIndex].extraTasks) {
        orders[orderIndex].extraTasks = [];
    }
    
    orders[orderIndex].extraTasks.push({
        title: extraTask,
        site: 'slesarniy',
        description: ''
    });
    
    saveOrdersToStorage(orders);
    alert('✅ Дополнительная задача добавлена');
}

// ============== ЭКСПОРТ В EXCEL ==============
function exportOrders() {
    const orders = loadOrdersFromStorage() || [];
    
    if (orders.length === 0) {
        alert('Нет заказов для экспорта');
        return;
    }
    
    // Создаем CSV
    let csv = 'Номер,Заказчик,Дата,Срок,Статус,Позиций,Количество\n';
    
    orders.forEach(order => {
        csv += `"${order.number || ''}",` +
               `"${order.customer || ''}",` +
               `"${order.date || ''}",` +
               `"${order.deadline || ''}",` +
               `"${getStatusText(order.status)}",` +
               `${order.items?.length || 0},` +
               `${order.totalQuantity || 0}\n`;
    });
    
    // Скачиваем файл
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// ============== ОТЧЕТ ПО МАТЕРИАЛАМ ==============
function showMaterialsReport() {
    if (materialsReport) {
        materialsReport.showReport();
    } else {
        alert('Отчет по материалам не инициализирован');
    }
}

function closeMaterialsModal() {
    const modal = document.getElementById('materialsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ============== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ==============
document.addEventListener('DOMContentLoaded', function() {
    console.log('📅 DOM загружен, начинаем инициализацию...');
    
    // Загружаем все данные
    loadAllData();
    
    // Добавляем обработчик для формы заказа
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveOrder();
        });
    }
    
    // Слушаем изменения в localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'orders_updated') {
            console.log('Обнаружено обновление заказов в другой вкладке');
            loadOrders();
        }
    });
});

// ============== ПРОВЕРКА ЗАВИСИМОСТЕЙ ==============
console.log('🔍 ПРОВЕРКА ЗАВИСИМОСТЕЙ app.js:');
console.log('==================================================');

// Проверка storage.js
if (typeof loadOrdersFromStorage === 'function') {
    console.log('✅ storage.js: loadOrdersFromStorage загружена');
} else {
    console.log('❌ storage.js: loadOrdersFromStorage НЕ загружена');
}

if (typeof saveOrdersToStorage === 'function') {
    console.log('✅ storage.js: saveOrdersToStorage загружена');
}

// Проверка data-loader.js
if (typeof loadProducts === 'function') {
    console.log('✅ data-loader.js: loadProducts загружена');
}
if (typeof loadBrackets === 'function') {
    console.log('✅ data-loader.js: loadBrackets загружена');
}
if (typeof loadLyres === 'function') {
    console.log('✅ data-loader.js: loadLyres загружена');
}

// Проверка materials-report.js
if (typeof MaterialsReport !== 'undefined') {
    console.log('✅ materials-report.js: MaterialsReport загружен');
}

console.log('⏳ Функции app.js будут объявлены далее...');
console.log('==================================================');

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

// Проверяем, что функции экспортированы
const exportedFunctions = ['openOrderModal', 'closeOrderModal', 'loadProductSizes', 'exportOrders', 
    'showMaterialsReport', 'deleteOrder', 'addExtraTask', 'closeMaterialsModal', 'syncTasksFromHistory'];
    
const availableFunctions = exportedFunctions.filter(name => typeof window[name] === 'function');
console.log('✅ Функции экспортированы:', availableFunctions);
console.log('✅ app.js полностью загружен');
