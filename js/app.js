// Глобальные переменные
let products = [];
let brackets = [];
let lyres = [];
let orders = [];
let materialsReport = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    showLoading();
    try {
        await loadAllData();
        loadOrders();
        populateSelects();
        updateStatistics();
        setupEventListeners();
    } catch (error) {
        showError('Ошибка загрузки данных: ' + error.message);
    } finally {
        hideLoading();
    }
});

// Показать загрузку
function showLoading() {
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        font-size: 18px;
    `;
    loader.innerHTML = 'Загрузка данных... ⏳';
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) loader.remove();
}

function showError(message) {
    alert('❌ ' + message);
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Поиск
    document.getElementById('searchInput').addEventListener('input', function(e) {
        filterOrders(e.target.value, document.getElementById('statusFilter').value);
    });

    // Фильтр по статусу
    document.getElementById('statusFilter').addEventListener('change', function(e) {
        filterOrders(document.getElementById('searchInput').value, e.target.value);
    });

    // Синхронизация между вкладками
    window.addEventListener('storage', function(e) {
        if (e.key === 'masterx_orders') {
            orders = JSON.parse(e.newValue || '[]');
            loadOrders();
            updateStatistics();
        }
    });

    // Слушаем изменения статусов задач из цехов
    window.addEventListener('taskStatusChanged', function(e) {
        updateSiteSquare(e.detail.taskId, e.detail.status);
    });
}

// Загрузка всех данных
async function loadAllData() {
    try {
        // Загружаем продукты
        products = await loadProducts();
        console.log('Загружено продуктов:', products.length);

        // Загружаем кронштейны
        brackets = await loadBrackets();
        console.log('Загружено кронштейнов:', brackets.length);

        // Загружаем лиры
        lyres = await loadLyres();
        console.log('Загружено лир:', lyres.length);

        // Загружаем заказы
        orders = loadOrdersFromStorage();
        
        // Инициализируем отчет по материалам
        materialsReport = new MaterialsReport();
        await materialsReport.loadMaterialsData();
        
        console.log('Все данные успешно загружены');
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        throw error;
    }
}

// Заполнение выпадающих списков
function populateSelects() {
    const productSelect = document.getElementById('productSelect');
    productSelect.innerHTML = '<option value="">Выберите изделие</option>';
    
    // Сортируем продукты по алфавиту
    products.sort((a, b) => a.name.localeCompare(b.name));
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.name;
        option.textContent = product.name;
        productSelect.appendChild(option);
    });
    
    // Кронштейны
    const bracketSelect = document.getElementById('bracketSelect');
    bracketSelect.innerHTML = '<option value="">Выберите кронштейн</option>';
    
    brackets.sort((a, b) => a.name.localeCompare(b.name));
    brackets.forEach(bracket => {
        const option = document.createElement('option');
        option.value = bracket.name;
        option.textContent = bracket.name;
        bracketSelect.appendChild(option);
    });
    
    // Лиры
    const lyreSelect = document.getElementById('lyreSelect');
    lyreSelect.innerHTML = '<option value="">Выберите лиру</option>';
    
    lyres.sort((a, b) => a.name.localeCompare(b.name));
    lyres.forEach(lyre => {
        const option = document.createElement('option');
        option.value = lyre.name;
        option.textContent = lyre.name;
        lyreSelect.appendChild(option);
    });
}

// Загрузка размеров для выбранного изделия
async function loadProductSizes() {
    const productName = document.getElementById('productSelect').value;
    const product = products.find(p => p.name === productName);
    const sizeSelect = document.getElementById('sizeSelect');
    
    sizeSelect.innerHTML = '<option value="">Загрузка размеров...</option>';
    sizeSelect.disabled = true;
    
    try {
        let sizes = [];
        if (product && product.file) {
            sizes = await loadProductSizesFromCSV(product.file);
        }
        
        sizeSelect.innerHTML = '<option value="">Выберите размер</option>';
        
        if (sizes && sizes.length > 0) {
            sizes.forEach(size => {
                const option = document.createElement('option');
                option.value = size;
                option.textContent = size;
                sizeSelect.appendChild(option);
            });
        } else {
            sizeSelect.innerHTML = '<option value="">Нет доступных размеров</option>';
        }
    } catch (error) {
        console.error('Ошибка загрузки размеров:', error);
        sizeSelect.innerHTML = '<option value="">Ошибка загрузки размеров</option>';
    } finally {
        sizeSelect.disabled = false;
    }
}

// Открытие модального окна
function openOrderModal() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'block';
    
    // Устанавливаем сегодняшнюю дату
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('orderDate').value = today;
    
    // Генерируем номер заказа
    const orderNumber = generateOrderNumber();
    document.getElementById('orderNumber').value = orderNumber;
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

// Закрытие модального окна
function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    document.getElementById('orderForm').reset();
}

// Обработка формы заказа
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const order = {
        id: Date.now(),
        date: document.getElementById('orderDate').value,
        number: document.getElementById('orderNumber').value,
        items: [{
            product: document.getElementById('productSelect').value,
            size: document.getElementById('sizeSelect').value,
            quantity: parseInt(document.getElementById('quantity').value),
            bracket: document.getElementById('bracketSelect').value,
            lyre: document.getElementById('lyreSelect').value,
            additional: document.getElementById('additionalDetails').value
        }],
        status: 'active',
        createdAt: new Date().toISOString(),
        completedAt: null,
        tasks: {} // Для хранения статусов задач
    };
    
    orders.push(order);
    saveOrdersToStorage(orders);
    loadOrders();
    updateStatistics();
    closeOrderModal();
    
    showNotification('Заказ успешно создан!', 'success');
});

// Показать уведомление
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Загрузка и отображение заказов
function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 10px;">
                <p style="font-size: 18px; color: #666;">📭 Нет заказов</p>
                <p style="color: #999;">Нажмите "+ Новый заказ" чтобы создать первый заказ</p>
            </div>
        `;
        return;
    }
    
    // Сортируем по дате (сначала новые)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersList.appendChild(orderCard);
    });
}

// Создание карточки заказа
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.dataset.orderId = order.id;
    
    const header = document.createElement('div');
    header.className = 'order-header';
    
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const completedTasks = countCompletedTasks(order);
    const totalTasks = countTotalTasks(order);
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 20px;">
            <h3>📦 Заказ №${order.number} от ${formatDate(order.date)}</h3>
            <span style="background: ${getStatusColor(order.status)}; color: white; padding: 3px 10px; border-radius: 15px; font-size: 12px;">
                ${order.status === 'active' ? 'В работе' : 'Завершен'}
            </span>
            <span style="background: #e9ecef; padding: 3px 10px; border-radius: 15px; font-size: 12px;">
                Деталей: ${totalItems} шт
            </span>
            <span style="background: #e9ecef; padding: 3px 10px; border-radius: 15px; font-size: 12px;">
                Прогресс: ${progress}%
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
    
    // Прогресс-бар
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        width: 100%;
        height: 6px;
        background: #e9ecef;
        border-radius: 3px;
        margin: 10px 0;
        overflow: hidden;
    `;
    progressBar.innerHTML = `<div style="width: ${progress}%; height: 100%; background: #28a745; transition: width 0.3s;"></div>`;
    content.appendChild(progressBar);
    
    // Таблица с позициями
    const itemsTable = document.createElement('table');
    itemsTable.className = 'items-table';
    itemsTable.innerHTML = `
        <thead>
            <tr>
                <th>Изделие</th>
                <th>Размер</th>
                <th>Кол-во</th>
                <th>Кронштейн</th>
                <th>Лира</th>
                <th>Доп. детали</th>
            </tr>
        </thead>
        <tbody>
            ${order.items.map(item => `
                <tr>
                    <td><strong>${item.product}</strong></td>
                    <td>${item.size}</td>
                    <td>${item.quantity} шт</td>
                    <td>${item.bracket}</td>
                    <td>${item.lyre}</td>
                    <td>${item.additional || '-'}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    content.appendChild(itemsTable);
    
    // Участки
    const sitesSection = document.createElement('div');
    sitesSection.className = 'sites-section';
    sitesSection.innerHTML = `
        <h4 style="margin-bottom: 15px;">🏭 Производственные участки</h4>
        <div class="sites-grid">
            ${createSiteBlock('Токарный', order, 'tokarniy')}
            ${createSiteBlock('Слесарный', order, 'slesarniy')}
            ${createSiteBlock('Фрезерный', order, 'frezerniy')}
            ${createSiteBlock('Лазерно-гибочный', order, 'lazerno')}
            ${createSiteBlock('Полимерный', order, 'polimerniy')}
        </div>
    `;
    content.appendChild(sitesSection);
    
    header.addEventListener('click', function(e) {
        if (!e.target.classList.contains('btn')) {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        }
    });
    
    card.appendChild(header);
    card.appendChild(content);
    
    return card;
}

// Создание блока участка
function createSiteBlock(siteName, order, siteKey) {
    const operations = getOperationsForProduct(order.items[0].product, siteKey);
    const squares = [];
    
    for (let i = 0; i < operations.length; i++) {
        const taskId = `${order.id}_${order.items[0].product}_${siteKey}_${i}`;
        const status = getTaskStatus(order, taskId);
        squares.push(`<div class="square ${status}"></div>`);
    }
    
    return `
        <div class="site-item">
            <div class="site-name">${siteName}</div>
            <div class="squares">
                ${squares.join('') || '<div class="square"></div>'}
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">
                ${operations.length} операций
            </div>
        </div>
    `;
}

// Получение статуса задачи
function getTaskStatus(order, taskId) {
    return order.tasks && order.tasks[taskId] ? order.tasks[taskId] : '';
}

// Подсчет завершенных задач
function countCompletedTasks(order) {
    if (!order.tasks) return 0;
    return Object.values(order.tasks).filter(status => status === 'green').length;
}

// Подсчет всех задач
function countTotalTasks(order) {
    const operations = getOperationsForProduct(order.items[0].product, 'all');
    return operations.length * order.items.reduce((sum, item) => sum + item.quantity, 0);
}

// Получение цвета статуса
function getStatusColor(status) {
    return status === 'active' ? '#007bff' : '#28a745';
}

// Обновление квадратика
function updateSiteSquare(taskId, status) {
    const square = document.querySelector(`[data-task-id="${taskId}"] .square`);
    if (square) {
        square.className = `square ${status}`;
    }
    
    // Обновляем статус в заказе
    const [orderId] = taskId.split('_');
    const order = orders.find(o => o.id == orderId);
    if (order) {
        if (!order.tasks) order.tasks = {};
        order.tasks[taskId] = status;
        saveOrdersToStorage(orders);
        updateStatistics();
    }
}

// Показать отчет по материалам
async function showMaterialsReport(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('materialsModal');
    const reportDiv = document.getElementById('materialsReport');
    
    reportDiv.innerHTML = '<div style="text-align: center; padding: 20px;">⏳ Загрузка отчета...</div>';
    modal.style.display = 'block';
    
    try {
        const reportHTML = await materialsReport.generateReportHTML(order);
        reportDiv.innerHTML = reportHTML;
    } catch (error) {
        reportDiv.innerHTML = `<div style="color: red; padding: 20px;">❌ Ошибка загрузки отчета: ${error.message}</div>`;
    }
}

function closeMaterialsModal() {
    document.getElementById('materialsModal').style.display = 'none';
}

// Фильтрация заказов
function filterOrders(searchText, statusFilter) {
    const cards = document.querySelectorAll('.order-card');
    searchText = searchText.toLowerCase();
    
    cards.forEach(card => {
        const orderId = card.dataset.orderId;
        const order = orders.find(o => o.id == orderId);
        if (!order) return;
        
        let show = true;
        
        // Поиск по тексту
        if (searchText) {
            const searchable = `${order.number} ${order.items.map(i => i.product).join(' ')}`.toLowerCase();
            show = searchable.includes(searchText);
        }
        
        // Фильтр по статусу
        if (show && statusFilter !== 'all') {
            show = order.status === statusFilter;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

// Экспорт заказов в CSV
function exportOrders() {
    let csv = 'Номер заказа,Дата,Изделие,Размер,Количество,Кронштейн,Лира,Доп.детали,Статус\n';
    
    orders.forEach(order => {
        order.items.forEach(item => {
            csv += `"${order.number}","${order.date}","${item.product}","${item.size}",${item.quantity},"${item.bracket}","${item.lyre}","${item.additional || ''}","${order.status}"\n`;
        });
    });
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Обновление статистики
function updateStatistics() {
    document.getElementById('totalOrders').textContent = orders.length;
    
    const totalItems = orders.reduce((sum, order) => 
        sum + order.items.reduce((s, item) => s + item.quantity, 0), 0);
    document.getElementById('totalItems').textContent = totalItems;
    
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
    
    document.getElementById('activeTasks').textContent = activeTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
}

// Вспомогательные функции
function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function deleteOrder(orderId) {
    if (confirm('Вы уверены, что хотите удалить заказ? Это действие нельзя отменить.')) {
        orders = orders.filter(o => o.id !== orderId);
        saveOrdersToStorage(orders);
        loadOrders();
        updateStatistics();
        showNotification('Заказ удален', 'info');
    }
}

// Получение операций для изделия
function getOperationsForProduct(productName, site) {
    const operationsDB = {
        'XGRAY v.1': {
            'tokarniy': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
            'slesarniy': ['Нарезка резьбы', 'Голтовка', 'УВ корпуса'],
            'frezerniy': ['Фрезеровка профиля'],
            'lazerno': ['Раскрой', 'Гибка'],
            'polimerniy': ['Заглушка AL', 'Обработка'],
            'all': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса', 'Нарезка резьбы', 'Голтовка', 'УВ корпуса', 'Фрезеровка профиля', 'Раскрой', 'Гибка', 'Заглушка AL', 'Обработка']
        },
        'XSMART mini': {
            'tokarniy': ['Заготовка', 'Точение'],
            'slesarniy': ['Сборка'],
            'frezerniy': ['Фрезеровка'],
            'lazerno': ['Раскрой'],
            'polimerniy': ['Заглушка'],
            'all': ['Заготовка', 'Точение', 'Сборка', 'Фрезеровка', 'Раскрой', 'Заглушка']
        }
    };
    
    if (site === 'all') {
        return operationsDB[productName]?.all || [];
    }
    
    return operationsDB[productName]?.[site] || ['Нет операций'];
}

// Закрытие модальных окон при клике вне их
window.onclick = function(event) {
    const orderModal = document.getElementById('orderModal');
    const materialsModal = document.getElementById('materialsModal');
    
    if (event.target === orderModal) {
        closeOrderModal();
    }
    if (event.target === materialsModal) {
        closeMaterialsModal();
    }
};

// Добавляем анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .square.orange {
        background: #ffc107;
        border-color: #ffc107;
        animation: pulse 1s infinite;
    }
    
    .square.green {
        background: #28a745;
        border-color: #28a745;
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }
    
    .order-card {
        transition: all 0.3s ease;
    }
    
    .order-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
`;

document.head.appendChild(style);