// Перехват ошибок для отладки
window.addEventListener('error', function(e) {
    console.error('❌ Поймана ошибка:', e.error);
    console.error('Стек вызовов:', e.error.stack);
    alert('Ошибка: ' + e.error.message + '\n\nСмотри консоль (F12) для деталей');
});

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

// Загрузка всех данных
async function loadAllData() {
    try {
        console.log('=== НАЧАЛО ЗАГРУЗКИ ДАННЫХ ===');
        
        // Загружаем ВСЕ данные параллельно
        const [productsData, bracketsData, lyresData] = await Promise.all([
            loadProducts(),
            loadBrackets(),
            loadLyres()
        ]);
        
        products = productsData || [];
        brackets = bracketsData || [];
        lyres = lyresData || [];
        
        console.log('✅ Продукты загружены:', products.length);
        console.log('✅ Кронштейны загружены:', brackets.length);
        console.log('✅ Лиры загружены:', lyres.length);
        
        // Загружаем заказы
        orders = loadOrdersFromStorage() || [];
        console.log('✅ Заказы загружены:', orders.length);
        
        // Заполняем выпадающие списки
        console.log('Заполняем select-ы...');
        populateSelects();
        
        // Загружаем заказы на страницу
        loadOrders();
        
        // Обновляем статистику
        updateStatistics();
        
        // Инициализируем отчет по материалам
        if (typeof MaterialsReport !== 'undefined') {
            materialsReport = new MaterialsReport();
            // Передаем загруженные данные
            materialsReport.materialsDB.brackets = brackets;
            materialsReport.materialsDB.lyres = lyres;
            await materialsReport.loadMaterialsData();
        }
        
        setupEventListeners();
        
        console.log('=== ВСЕ ДАННЫЕ УСПЕШНО ЗАГРУЖЕНЫ ===');
    } catch (error) {
        console.error('❌ ОШИБКА загрузки данных:', error);
        showError('Ошибка загрузки данных: ' + error.message);
    }
}

// Заполнение выпадающих списков
function populateSelects() {
    console.log('=== ЗАПОЛНЕНИЕ SELECT-ОВ ===');
    
    // Заполняем изделия
    const productSelect = document.getElementById('productSelect');
    if (productSelect) {
        productSelect.innerHTML = '<option value="">Выберите изделие</option>';
        
        if (products && products.length > 0) {
            products.sort((a, b) => a.name.localeCompare(b.name));
            products.forEach(product => {
                if (product && product.name) {
                    const option = document.createElement('option');
                    option.value = product.name;
                    option.textContent = product.name;
                    productSelect.appendChild(option);
                }
            });
            console.log('✅ Изделий добавлено:', products.length);
        }
    }
    
    // Заполняем кронштейны с опцией "отсутствует"
    const bracketSelect = document.getElementById('bracketSelect');
    if (bracketSelect) {
        bracketSelect.innerHTML = '<option value="">Выберите кронштейн</option>';
        
        // Добавляем опцию "отсутствует"
        const absentOption = document.createElement('option');
        absentOption.value = "отсутствует";
        absentOption.textContent = "🚫 отсутствует";
        bracketSelect.appendChild(absentOption);
        
        if (brackets && brackets.length > 0) {
            brackets.sort((a, b) => a.name.localeCompare(b.name));
            brackets.forEach(bracket => {
                if (bracket && bracket.name) {
                    const option = document.createElement('option');
                    option.value = bracket.name;
                    option.textContent = bracket.name;
                    bracketSelect.appendChild(option);
                }
            });
            console.log('✅ Кронштейнов добавлено:', brackets.length + 1);
        }
    }
    
    // Заполняем лиры с опцией "отсутствует"
    const lyreSelect = document.getElementById('lyreSelect');
    if (lyreSelect) {
        lyreSelect.innerHTML = '<option value="">Выберите лиру</option>';
        
        // Добавляем опцию "отсутствует"
        const absentOption = document.createElement('option');
        absentOption.value = "отсутствует";
        absentOption.textContent = "🚫 отсутствует";
        lyreSelect.appendChild(absentOption);
        
        if (lyres && lyres.length > 0) {
            lyres.sort((a, b) => a.name.localeCompare(b.name));
            lyres.forEach(lyre => {
                if (lyre && lyre.name) {
                    const option = document.createElement('option');
                    option.value = lyre.name;
                    option.textContent = lyre.name;
                    lyreSelect.appendChild(option);
                }
            });
            console.log('✅ Лир добавлено:', lyres.length + 1);
        }
    }
    
    console.log('=== ЗАПОЛНЕНИЕ SELECT-ОВ ЗАВЕРШЕНО ===');
}

// Загрузка размеров для выбранного изделия
async function loadProductSizes() {
    const productName = document.getElementById('productSelect').value;
    console.log('Выбран продукт:', productName);
    
    const product = products.find(p => p.name === productName);
    
    const sizeSelect = document.getElementById('sizeSelect');
    
    sizeSelect.innerHTML = '<option value="">Загрузка размеров...</option>';
    sizeSelect.disabled = true;
    
    setTimeout(() => {
        sizeSelect.innerHTML = '<option value="">Выберите размер</option>';
        
        if (product && product.sizes && product.sizes.length > 0) {
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

// Настройка обработчиков событий
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterOrders(e.target.value, document.getElementById('statusFilter').value);
        });
    }

    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function(e) {
            filterOrders(document.getElementById('searchInput').value, e.target.value);
        });
    }

    window.addEventListener('storage', function(e) {
        if (e.key === 'masterx_orders') {
            orders = JSON.parse(e.newValue || '[]');
            loadOrders();
            updateStatistics();
        }
    });
}

// Открытие модального окна для создания нового заказа
function openOrderModal() {
    // Сбрасываем форму
    document.getElementById('orderForm').reset();
    
    // Устанавливаем сегодняшнюю дату
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('orderDate').value = today;
    
    // Генерируем номер заказа
    const orderNumber = generateOrderNumber();
    document.getElementById('orderNumber').value = orderNumber;
    
    // Устанавливаем значения по умолчанию для количества
    document.getElementById('bracketQuantity').value = 1;
    document.getElementById('lyreQuantity').value = 1;
    
    // Устанавливаем обработчик на создание
    const form = document.getElementById('orderForm');
    form.onsubmit = createOrderHandler;
    
    // Открываем модальное окно
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Обработчик создания нового заказа
async function createOrderHandler(e) {
    e.preventDefault();
    
    const bracket = document.getElementById('bracketSelect').value;
    const bracketQuantity = parseInt(document.getElementById('bracketQuantity').value) || 0;
    const lyre = document.getElementById('lyreSelect').value;
    const lyreQuantity = parseInt(document.getElementById('lyreQuantity').value) || 0;
    const ral = document.getElementById('ralInput').value.trim();
    const texture = document.getElementById('textureSelect').value;
    
    console.log('Создание заказа с:', { bracket, bracketQuantity, lyre, lyreQuantity, ral, texture });
    
    const order = {
        id: Date.now(),
        date: document.getElementById('orderDate').value,
        number: document.getElementById('orderNumber').value,
        items: [{
            product: document.getElementById('productSelect').value,
            size: document.getElementById('sizeSelect').value,
            quantity: parseInt(document.getElementById('quantity').value) || 1,
            bracket: {
                type: bracket,
                quantity: bracketQuantity
            },
            lyre: {
                type: lyre,
                quantity: lyreQuantity
            },
            ral: ral || null,
            texture: texture || null,
            additional: document.getElementById('additionalDetails').value || ''
        }],
        status: 'active',
        createdAt: new Date().toISOString(),
        completedAt: null,
        tasks: {}
    };
    
    orders.push(order);
    saveOrdersToStorage(orders);
    loadOrders();
    updateStatistics();
    closeOrderModal();
    
    showNotification('Заказ успешно создан!', 'success');
}

// Открыть модальное окно редактирования заказа
function editOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Заполняем форму данными заказа
    document.getElementById('orderDate').value = order.date;
    document.getElementById('orderNumber').value = order.number;

    // Выбираем изделие
    const productSelect = document.getElementById('productSelect');
    productSelect.value = order.items[0].product;
    loadProductSizes(); // загружаем размеры

    // Небольшая задержка, чтобы размеры успели загрузиться
    setTimeout(() => {
        document.getElementById('sizeSelect').value = order.items[0].size;
    }, 200);

    document.getElementById('quantity').value = order.items[0].quantity;
    
    // Заполняем кронштейн и его количество
    if (order.items[0].bracket) {
        document.getElementById('bracketSelect').value = order.items[0].bracket.type || '';
        document.getElementById('bracketQuantity').value = order.items[0].bracket.quantity || 0;
    } else {
        document.getElementById('bracketSelect').value = '';
        document.getElementById('bracketQuantity').value = 0;
    }
    
    // Заполняем лиру и её количество
    if (order.items[0].lyre) {
        document.getElementById('lyreSelect').value = order.items[0].lyre.type || '';
        document.getElementById('lyreQuantity').value = order.items[0].lyre.quantity || 0;
    } else {
        document.getElementById('lyreSelect').value = '';
        document.getElementById('lyreQuantity').value = 0;
    }
    
    document.getElementById('ralInput').value = order.items[0].ral || '';
    document.getElementById('textureSelect').value = order.items[0].texture || '';
    document.getElementById('additionalDetails').value = order.items[0].additional || '';

    // Открываем модальное окно
    const modal = document.getElementById('orderModal');
    modal.style.display = 'block';

    // Меняем обработчик отправки формы на редактирование
    const form = document.getElementById('orderForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        saveEditedOrder(orderId);
    };
}

// Сохранить изменения в заказе
function saveEditedOrder(orderId) {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    const bracket = document.getElementById('bracketSelect').value;
    const bracketQuantity = parseInt(document.getElementById('bracketQuantity').value) || 0;
    const lyre = document.getElementById('lyreSelect').value;
    const lyreQuantity = parseInt(document.getElementById('lyreQuantity').value) || 0;
    const ral = document.getElementById('ralInput').value.trim();
    const texture = document.getElementById('textureSelect').value;

    const updatedOrder = {
        id: orderId,
        date: document.getElementById('orderDate').value,
        number: document.getElementById('orderNumber').value,
        items: [{
            product: document.getElementById('productSelect').value,
            size: document.getElementById('sizeSelect').value,
            quantity: parseInt(document.getElementById('quantity').value) || 1,
            bracket: {
                type: bracket,
                quantity: bracketQuantity
            },
            lyre: {
                type: lyre,
                quantity: lyreQuantity
            },
            ral: ral || null,
            texture: texture || null,
            additional: document.getElementById('additionalDetails').value || ''
        }],
        status: orders[orderIndex].status,
        createdAt: orders[orderIndex].createdAt,
        completedAt: orders[orderIndex].completedAt,
        tasks: orders[orderIndex].tasks || {}
    };

    orders[orderIndex] = updatedOrder;
    saveOrdersToStorage(orders);
    loadOrders();
    updateStatistics();
    closeOrderModal();

    showNotification('Заказ обновлён', 'success');
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
    console.log('loadOrders вызвана, заказов:', orders.length);
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) {
        console.error('ordersList не найден');
        return;
    }
    
    ordersList.innerHTML = '';
    
    if (!orders || orders.length === 0) {
        ordersList.innerHTML = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 10px;">
                <p style="font-size: 18px; color: #666;">📭 Нет заказов</p>
                <p style="color: #999;">Нажмите "+ Новый заказ" чтобы создать первый заказ</p>
            </div>
        `;
        return;
    }
    
    // Сортируем по дате (сначала новые)
    const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersList.appendChild(orderCard);
    });
    
    console.log('Отображено заказов:', sortedOrders.length);
}

// Создание карточки заказа
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.dataset.orderId = order.id;
    
    const header = document.createElement('div');
    header.className = 'order-header';
    
    // Проверяем, что order.items существует
    const items = order.items || [];
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const completedTasks = countCompletedTasks(order);
    const totalTasks = countTotalTasks(order);
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
            <h3>📦 Заказ №${order.number || 'Без номера'} от ${formatDate(order.date)}</h3>
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
            <button class="btn btn-warning" onclick="event.stopPropagation(); editOrder(${order.id})">✏️ Ред.</button>
            <button class="btn btn-danger" onclick="event.stopPropagation(); deleteOrder(${order.id})">🗑️ Удалить</button>
        </div>
    `;
    
    const content = document.createElement('div');
    content.className = 'order-content';
    content.style.display = 'none';
    
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
    
    // Проверяем, есть ли элементы для отображения
    let tableRows = '';
    if (items.length > 0) {
        tableRows = items.map(item => {
            // Защита от undefined
            const product = item.product || '-';
            const size = item.size || '-';
            const quantity = item.quantity || 0;
            
            // Формируем информацию о кронштейне
            let bracketInfo = '-';
            if (item.bracket) {
                if (item.bracket.type === 'отсутствует' || !item.bracket.type) {
                    bracketInfo = '🚫 отсутствует';
                } else {
                    bracketInfo = `${item.bracket.type} (${item.bracket.quantity || 1} шт)`;
                }
            }
            
            // Формируем информацию о лире
            let lyreInfo = '-';
            if (item.lyre) {
                if (item.lyre.type === 'отсутствует' || !item.lyre.type) {
                    lyreInfo = '🚫 отсутствует';
                } else {
                    lyreInfo = `${item.lyre.type} (${item.lyre.quantity || 1} шт)`;
                }
            }
            
            const ralInfo = item.ral || '-';
            const textureInfo = item.texture || '-';
            const additional = item.additional || '-';
            
            return `
                <tr>
                    <td><strong>${product}</strong></td>
                    <td>${size}</td>
                    <td>${quantity} шт</td>
                    <td>${bracketInfo}</td>
                    <td>${lyreInfo}</td>
                    <td>${ralInfo}</td>
                    <td>${textureInfo}</td>
                    <td>${additional}</td>
                </tr>
            `;
        }).join('');
    } else {
        tableRows = `
            <tr>
                <td colspan="8" style="text-align: center; color: #999;">Нет данных о деталях</td>
            </tr>
        `;
    }
    
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
                <th>RAL</th>
                <th>Текстура</th>
                <th>Доп. детали</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    `;
    content.appendChild(itemsTable);
    
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
    if (!order.items || !order.items[0]) {
        return `<div class="site-item"><div class="site-name">${siteName}</div><div class="squares"><div class="square"></div></div></div>`;
    }
    
    const operations = getOperationsForProduct(order.items[0].product, siteKey) || [];
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
    if (!order || !order.items || !order.items[0]) return 0;
    const operations = getOperationsForProduct(order.items[0].product, 'all') || [];
    const totalItems = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    return operations.length * totalItems;
}

// Получение цвета статуса
function getStatusColor(status) {
    return status === 'active' ? '#007bff' : '#28a745';
}

// Показать отчет по материалам
async function showMaterialsReport(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('materialsModal');
    const reportDiv = document.getElementById('materialsReport');
    
    if (!modal || !reportDiv) return;
    
    reportDiv.innerHTML = '<div style="text-align: center; padding: 20px;">⏳ Загрузка отчета...</div>';
    modal.style.display = 'block';
    
    try {
        if (materialsReport) {
            // Обновляем данные в отчете
            materialsReport.materialsDB.brackets = brackets;
            materialsReport.materialsDB.lyres = lyres;
            
            const reportHTML = await materialsReport.generateReportHTML(order);
            reportDiv.innerHTML = reportHTML;
        } else {
            reportDiv.innerHTML = '<div style="color: red; padding: 20px;">❌ Отчет по материалам не инициализирован</div>';
        }
    } catch (error) {
        console.error('Ошибка отчета:', error);
        reportDiv.innerHTML = `<div style="color: red; padding: 20px;">❌ Ошибка загрузки отчета: ${error.message}</div>`;
    }
}

function closeMaterialsModal() {
    document.getElementById('materialsModal').style.display = 'none';
}

// Фильтрация заказов
function filterOrders(searchText, statusFilter) {
    console.log('Фильтр:', statusFilter, 'Поиск:', searchText);
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
            // Приводим статусы к одному виду
            const orderStatus = order.status || 'active';
            show = orderStatus === statusFilter;
            console.log(`Заказ ${order.number}: статус="${orderStatus}", фильтр="${statusFilter}", показывать=${show}`);
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

// Экспорт заказов в CSV
function exportOrders() {
    let csv = 'Номер заказа,Дата,Изделие,Размер,Количество,Кронштейн,Кол-во кронштейнов,Лира,Кол-во лир,RAL,Текстура,Доп.детали,Статус\n';
    
    orders.forEach(order => {
        order.items.forEach(item => {
            const bracketType = item.bracket && item.bracket.type !== 'отсутствует' ? item.bracket.type : '';
            const bracketQty = item.bracket && item.bracket.type !== 'отсутствует' ? (item.bracket.quantity || 1) : 0;
            const lyreType = item.lyre && item.lyre.type !== 'отсутствует' ? item.lyre.type : '';
            const lyreQty = item.lyre && item.lyre.type !== 'отсутствует' ? (item.lyre.quantity || 1) : 0;
            const ralCode = item.ral || '';
            const texture = item.texture || '';
            
            csv += `"${order.number}","${order.date}","${item.product}","${item.size}",${item.quantity},"${bracketType}",${bracketQty},"${lyreType}",${lyreQty},"${ralCode}","${texture}","${item.additional || ''}","${order.status}"\n`;
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
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalItemsEl = document.getElementById('totalItems');
    const activeTasksEl = document.getElementById('activeTasks');
    const completedTasksEl = document.getElementById('completedTasks');
    
    if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
    
    const totalItems = orders.reduce((sum, order) => 
        sum + (order.items ? order.items.reduce((s, item) => s + (item.quantity || 0), 0) : 0), 0);
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

// Вспомогательные функции
function formatDate(dateString) {
    if (!dateString) return 'Дата не указана';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

// Удаление заказа с подтверждением
function deleteOrder(orderId) {
    console.log('Попытка удалить заказ с ID:', orderId);
    
    // Первое подтверждение
    const firstConfirm = confirm('Вы уверены, что хотите удалить этот заказ?');
    
    if (!firstConfirm) {
        showNotification('Удаление отменено', 'info');
        return;
    }
    
    // Находим заказ для отображения информации
    const orderToDelete = orders.find(o => o.id === orderId);
    
    if (!orderToDelete) {
        showNotification('Заказ не найден', 'error');
        return;
    }
    
    // Второе подтверждение с деталями заказа
    const itemInfo = orderToDelete.items.map(item => {
        let info = `${item.product} (${item.size}) - ${item.quantity} шт`;
        
        if (item.bracket && item.bracket.type && item.bracket.type !== 'отсутствует') {
            info += `, кронштейн: ${item.bracket.type} (${item.bracket.quantity || 1} шт)`;
        }
        
        if (item.lyre && item.lyre.type && item.lyre.type !== 'отсутствует') {
            info += `, лира: ${item.lyre.type} (${item.lyre.quantity || 1} шт)`;
        }
        
        if (item.ral) {
            info += `, RAL: ${item.ral}`;
        }
        
        if (item.texture) {
            info += `, ${item.texture}`;
        }
        
        return info;
    }).join('\n');
    
    const secondConfirm = confirm(
        `⚠️ ВНИМАНИЕ! Это действие нельзя отменить.\n\n` +
        `Заказ №${orderToDelete.number}\n` +
        `Детали:\n${itemInfo}\n\n` +
        `Вы точно хотите удалить этот заказ?`
    );
    
    if (!secondConfirm) {
        showNotification('Удаление отменено', 'info');
        return;
    }
    
    // Выполняем удаление
    try {
        // Фильтруем массив заказов
        const newOrders = orders.filter(o => o.id !== orderId);
        
        console.log('Было заказов:', orders.length);
        console.log('Стало заказов:', newOrders.length);
        
        // Обновляем глобальный массив
        orders = newOrders;
        
        // Сохраняем в localStorage
        saveOrdersToStorage(orders);
        
        // Принудительно перезагружаем отображение
        loadOrders();
        
        // Обновляем статистику
        updateStatistics();
        
        showNotification('✅ Заказ успешно удален', 'success');
    } catch (error) {
        console.error('Ошибка при удалении:', error);
        showNotification('❌ Ошибка при удалении заказа', 'error');
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
    
    .btn-warning {
        background: #ffc107;
        color: #000;
    }
    
    .btn-warning:hover {
        background: #e0a800;
    }
`;

document.head.appendChild(style);

// ============================================
// Глобальные функции для вызова из HTML
// ============================================
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.closeMaterialsModal = closeMaterialsModal;
window.loadProductSizes = loadProductSizes;
window.exportOrders = exportOrders;
window.showMaterialsReport = showMaterialsReport;
window.deleteOrder = deleteOrder;
window.editOrder = editOrder;
