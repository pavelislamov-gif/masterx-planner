// Глобальные переменные
let products = [];
let brackets = [];
let lyres = [];
let orders = [];
let materialsReport = null;

// ============== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (ДОЛЖНЫ БЫТЬ ПЕРВЫМИ) ==============

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
    document.getElementById('totalOrders').textContent = orders.length;
    const totalItems = orders.reduce((sum, order) => sum + (order.items[0]?.quantity || 0), 0);
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

// Обновление статуса задачи
function updateTaskStatus(taskId, status) {
    console.log('updateTaskStatus вызвана', taskId, status);
    const [orderId] = taskId.split('_');
    const order = orders.find(o => o.id == orderId);
    
    if (!order) return;
    
    if (!order.tasks) order.tasks = {};
    
    let squareStatus = '';
    if (status === 'in_progress') squareStatus = 'orange';
    if (status === 'completed') squareStatus = 'green';
    
    order.tasks[taskId] = squareStatus;
    saveOrdersToStorage(orders);
    loadOrders();
}

// ============== ФУНКЦИИ ДЛЯ МОДАЛЬНОГО ОКНА ==============

// Открытие модального окна
function openOrderModal() {
    console.log('openOrderModal вызвана');
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('orderNumber').value = generateOrderNumber();
        document.getElementById('bracketQuantity').value = 1;
        document.getElementById('lyreQuantity').value = 1;
    } else {
        console.error('❌ Модальное окно не найдено!');
    }
}

// Закрытие модального окна
function closeOrderModal() {
    console.log('closeOrderModal вызвана');
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
    console.log('populateSelects вызвана');
    
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

// ============== ФУНКЦИЯ getOperationCount ==============
function getOperationCount(productName, siteKey) {
    const operations = {
        // XRAY 6-T2 серия
        'XRAY 6-T2 BT 180': { 'tokarniy': 3, 'slesarniy': 7, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BT 200': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BT 220': { 'tokarniy': 3, 'slesarniy': 7, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BT 220 Шторка х2': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BT 240 Шторка': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BZ 180': { 'tokarniy': 3, 'slesarniy': 7, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BZ 200 Шторка': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BZ 220': { 'tokarniy': 4, 'slesarniy': 7, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BZ 220 Шторка х2': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BZ 240 Шторка': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BZ 240 Шторка х2': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        
        // XGRAY
        'XGRAY v.1': { 'tokarniy': 3, 'slesarniy': 3, 'frezerniy': 2, 'lazerno': 1, 'polimerniy': 4 },
        'XGRAY v.2': { 'tokarniy': 3, 'slesarniy': 3, 'frezerniy': 2, 'lazerno': 5, 'polimerniy': 5 },
        
        // XSMART
        'XSMART mini': { 'tokarniy': 2, 'slesarniy': 1, 'frezerniy': 2, 'lazerno': 5, 'polimerniy': 4 },
        'XSMART': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 2, 'lazerno': 4, 'polimerniy': 5 },
        
        // XLUMO
        'XLUMO': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 5, 'lazerno': 5, 'polimerniy': 4 },
        'XLUMO 1-6': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 4, 'lazerno': 4, 'polimerniy': 4 },
        'XLUMO Двунаправленный': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 3, 'lazerno': 4, 'polimerniy': 4 },
        'XLUMO PROV': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 3, 'lazerno': 5, 'polimerniy': 4 },
        
        // XGIRO
        'XGIRO': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 2, 'lazerno': 4, 'polimerniy': 4 },
        
        // XVISION
        'XVISION': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 1 },
        
        // XBAR-SW
        'XBAR-SW': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 5, 'polimerniy': 4 },
        
        // XLITE
        'XLITE': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 2, 'lazerno': 4, 'polimerniy': 4 },
        
        // XROLL
        'XROLL-lite P': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 0, 'polimerniy': 2 },
        'XROLL-lite K': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 2 },
        
        // XSTRONG
        'XSTRONG': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 5, 'polimerniy': 3 },
        
        // XYELLOW
        'XYELLOW': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 1, 'polimerniy': 3 },
        
        // XLINE
        'XLINE': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 0, 'polimerniy': 2 },
        
        // XGLOW
        'XGLOW mini': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 0, 'lazerno': 2, 'polimerniy': 3 },
        'XGLOW': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 0, 'lazerno': 2, 'polimerniy': 5 },
        
        // XRAY другие
        'XRAY 1': { 'tokarniy': 5, 'slesarniy': 4, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 2 },
        'XRAY 3': { 'tokarniy': 5, 'slesarniy': 5, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 2 },
        'XRAY 3-2': { 'tokarniy': 7, 'slesarniy': 4, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 2 },
        'XRAY 3-GRP': { 'tokarniy': 5, 'slesarniy': 3, 'frezerniy': 0, 'lazerno': 2, 'polimerniy': 2 },
        'XRAY 6': { 'tokarniy': 5, 'slesarniy': 5, 'frezerniy': 0, 'lazerno': 3, 'polimerniy': 3 },
        'XRAY 6 RGBW': { 'tokarniy': 6, 'slesarniy': 5, 'frezerniy': 0, 'lazerno': 3, 'polimerniy': 3 },
        'XRAY 6-2 проходной': { 'tokarniy': 6, 'slesarniy': 5, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 2 },
        'XRAY 6-2 оконечный': { 'tokarniy': 6, 'slesarniy': 5, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 2 },
        'XRAY 6T Накладной': { 'tokarniy': 5, 'slesarniy': 6, 'frezerniy': 0, 'lazerno': 3, 'polimerniy': 4 },
        'XRAY 6T BZ 120': { 'tokarniy': 4, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 5, 'polimerniy': 4 },
        'XRAY 6T BT 140 Шторка': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 5, 'polimerniy': 4 },
        'XRAY 6T RGBW BT 150': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 5, 'polimerniy': 4 },
        'XRAY 9': { 'tokarniy': 7, 'slesarniy': 5, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 4 },
        'XRAY 9S': { 'tokarniy': 3, 'slesarniy': 5, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 3 },
        'XRAY 12S': { 'tokarniy': 3, 'slesarniy': 5, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 3 },
        'XRAY 18': { 'tokarniy': 7, 'slesarniy': 5, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 5 },
        'XRAY 18S': { 'tokarniy': 3, 'slesarniy': 5, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 3 },
        'XRAY 36': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 5 },
        'XRAY 36S': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 3 },
        
        // XSLOPE
        'XSLOPE': { 'tokarniy': 5, 'slesarniy': 6, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 3 },
        
        // XPIXEL
        'XPIXEL BIN v.1': { 'tokarniy': 3, 'slesarniy': 3, 'frezerniy': 1, 'lazerno': 0, 'polimerniy': 2 },
        'XPIXEL BIN v.2': { 'tokarniy': 4, 'slesarniy': 2, 'frezerniy': 1, 'lazerno': 0, 'polimerniy': 2 },
        'XPIXEL BIN v.3': { 'tokarniy': 4, 'slesarniy': 4, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 3 },
        'XPIXEL OVHD': { 'tokarniy': 3, 'slesarniy': 1, 'frezerniy': 0, 'lazerno': 1, 'polimerniy': 2 },
        
        // XPOINT
        'XPOINT OVHD': { 'tokarniy': 2, 'slesarniy': 1, 'frezerniy': 0, 'lazerno': 0, 'polimerniy': 1 },
        
        // XSPOT
        'XSPOT': { 'tokarniy': 5, 'slesarniy': 3, 'frezerniy': 0, 'lazerno': 2, 'polimerniy': 2 },
        
        // XWHITE
        'XWHITE': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 0, 'polimerniy': 3 },
        
        // XDISK
        'XDISK': { 'tokarniy': 8, 'slesarniy': 5, 'frezerniy': 1, 'lazerno': 0, 'polimerniy': 3 },
        
        // ACENTO
        'ACENTO 3T': { 'tokarniy': 4, 'slesarniy': 6, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 3 },
        'ACENTO 4': { 'tokarniy': 3, 'slesarniy': 6, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 3 },
        
        // XEYES
        'XEYES 130*90 1': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES 130*90 2': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES 130*90 3': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES 130*90 4': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES 130*120 1': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES 130*120 2': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES 130*120 3': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES 130*120 4': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES mini-1': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 0, 'lazerno': 5, 'polimerniy': 4 },
        
        // XFOCUS
        'XFOCUS': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 5, 'polimerniy': 3 },
        
        // XMODULE
        'XMODULE-2x2': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 0, 'lazerno': 2, 'polimerniy': 1 },
        'XMODULE-6x2': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 0, 'lazerno': 1, 'polimerniy': 0 }
    };
    
    // Пробуем найти точное совпадение
    if (operations[productName] && operations[productName][siteKey] !== undefined) {
        return operations[productName][siteKey];
    }
    
    // Пробуем найти частичное совпадение
    for (let key in operations) {
        if (productName.includes(key) || key.includes(productName)) {
            if (operations[key] && operations[key][siteKey] !== undefined) {
                return operations[key][siteKey];
            }
        }
    }
    
    return 1; // По умолчанию
}

// ============== ФУНКЦИЯ createSiteRow ==============
function createSiteRow(name, order, siteKey) {
    if (!order.items || order.items.length === 0) {
        return '<div>Нет изделий</div>';
    }
    
    const item = order.items[0];
    const operationCount = getOperationCount(item.product, siteKey);
    
    let squares = '';
    let completedCount = 0;
    
    for (let i = 0; i < operationCount; i++) {
        const taskId = `${order.id}_${item.product}_${siteKey}_${i}`;
        const status = order.tasks && order.tasks[taskId] ? order.tasks[taskId] : '';
        
        if (status === 'green') completedCount++;
        
        squares += `<div class="square ${status}" data-task="${taskId}" title="Операция ${i+1}"></div>`;
    }
    
    // Дополнительные задачи
    if (order.extraTasks) {
        order.extraTasks.forEach((task, index) => {
            if (task.site === siteKey) {
                const taskId = `${order.id}_extra_${index}`;
                const status = order.tasks && order.tasks[taskId] ? order.tasks[taskId] : '';
                
                if (status === 'green') completedCount++;
                
                squares += `<div class="square ${status} extra-square" data-task="${taskId}" title="${task.title}"></div>`;
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

// ============== ФУНКЦИИ ДЛЯ РАБОТЫ С ЗАКАЗАМИ (действия) ==============

// Показать отчет по материалам
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

// Удаление заказа
function deleteOrder(orderId) {
    console.log('deleteOrder вызвана', orderId);
    if (confirm('Удалить заказ?')) {
        orders = orders.filter(o => o.id !== orderId);
        saveOrdersToStorage(orders);
        loadOrders();
        updateStatistics();
    }
}

// Добавление дополнительной задачи
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

// Экспорт заказов
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

// Закрытие модального окна материалов
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
        
        populateSelects();
        loadOrders();
        updateStatistics();
        
        // Инициализация отчета по материалам
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
        
        // Слушаем изменения из других вкладок
        window.addEventListener('storage', function(e) {
            if (e.key === 'masterx_orders') {
                orders = JSON.parse(e.newValue || '[]');
                loadOrders();
                updateStatistics();
            }
        });
        
        // Слушаем события от участков
        window.addEventListener('taskStatusChanged', function(e) {
            console.log('Статус задачи изменён:', e.detail);
            updateTaskStatus(e.detail.taskId, e.detail.status);
        });
        
        console.log('✅ loadAllData завершена');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
    }
}

// ============== ИНИЦИАЛИЗАЦИЯ ==============
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Страница загружена, начинаем инициализацию...');
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

console.log('✅ app.js загружен');
