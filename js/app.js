// Глобальные переменные
let products = [];
let brackets = [];
let lyres = [];
let orders = [];

// Инициализация
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Страница загружена');
    await loadAllData();
});

// Загрузка заказов с квадратиками
function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<div style="text-align: center; padding: 50px; background: #1a1e24; border-radius: 8px; color: #666;">📭 Нет заказов</div>';
        return;
    }
    
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    orders.forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';
        card.dataset.orderId = order.id;
        
        // Шапка заказа
        const header = document.createElement('div');
        header.className = 'order-header';
        header.innerHTML = `
            <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                <h3>📦 Заказ №${order.number} от ${formatDate(order.date)}</h3>
                <span style="background: #ff3b3b; color: white; padding: 3px 10px; border-radius: 15px; font-size: 12px;">В работе</span>
                <span style="background: #2a2f38; padding: 3px 10px; border-radius: 15px; font-size: 12px; color: #fff;">
                    Деталей: ${order.items[0].quantity} шт
                </span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-info" onclick="event.stopPropagation(); showMaterialsReport(${order.id})">📊 Материалы</button>
                <button class="btn btn-danger" onclick="event.stopPropagation(); deleteOrder(${order.id})">🗑️ Удалить</button>
            </div>
        `;
        
        // Контент (скрыт по умолчанию)
        const content = document.createElement('div');
        content.className = 'order-content';
        content.style.display = 'none';
        
        // Информация о заказе
        const item = order.items[0];
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
                        <td>${item.size || '-'}</td>
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
        `;
        
        // Клик по заголовку для раскрытия
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

// Форматирование даты
function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

// Вспомогательная функция для создания строки участка
function createSiteRow(name, order, siteKey) {
    // Пока просто заглушка
    return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #1a1e24; border-radius: 5px; margin-bottom: 5px;">
            <span style="color: #fff;">${name}</span>
            <div style="display: flex; gap: 5px;">
                <div class="square"></div>
                <div class="square"></div>
                <div class="square"></div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="addExtraTask(${order.id}, '${siteKey}')">➕</button>
        </div>
    `;
}

// Заглушка для отчета по материалам
function showMaterialsReport(orderId) {
    alert('Отчет по материалам будет позже');
}

// Удаление заказа
function deleteOrder(orderId) {
    if (confirm('Удалить заказ?')) {
        orders = orders.filter(o => o.id !== orderId);
        saveOrdersToStorage(orders);
        loadOrders();
    }
}

// Добавление доп. задачи
function addExtraTask(orderId, siteKey) {
    alert(`Добавить задачу на участок ${siteKey}`);
}

// Заполнение выпадающих списков
function populateSelects() {
    // Изделия
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
    
    // Кронштейны
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
    
    // Лиры
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

// Загрузка размеров
async function loadProductSizes() {
    const productName = document.getElementById('productSelect').value;
    const product = products.find(p => p.name === productName);
    const sizeSelect = document.getElementById('sizeSelect');
    
    sizeSelect.innerHTML = '<option value="">Выберите размер</option>';
    if (product && product.sizes) {
        product.sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            sizeSelect.appendChild(option);
        });
    }
}

// Открытие модального окна
function openOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('orderNumber').value = generateOrderNumber();
    }
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
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const order = {
        id: Date.now(),
        date: document.getElementById('orderDate').value,
        number: document.getElementById('orderNumber').value,
        items: [{
            product: document.getElementById('productSelect').value,
            size: document.getElementById('sizeSelect').value,
            quantity: parseInt(document.getElementById('quantity').value) || 1,
            bracket: {
                type: document.getElementById('bracketSelect').value,
                quantity: parseInt(document.getElementById('bracketQuantity').value) || 0
            },
            lyre: {
                type: document.getElementById('lyreSelect').value,
                quantity: parseInt(document.getElementById('lyreQuantity').value) || 0
            },
            ral: document.getElementById('ralInput').value,
            texture: document.getElementById('textureSelect').value,
            additional: document.getElementById('additionalDetails').value
        }],
        status: 'active',
        tasks: {},
        extraTasks: []
    };
    
    orders.push(order);
    saveOrdersToStorage(orders);
    loadOrders();
    closeOrderModal();
    alert('✅ Заказ создан!');
});

// Загрузка заказов
function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<div style="text-align: center; padding: 50px; background: #1a1e24; border-radius: 8px; color: #666;">📭 Нет заказов</div>';
        return;
    }
    
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    orders.forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';
        card.style.cssText = 'background: #1a1e24; border-radius: 8px; margin-bottom: 15px; overflow: hidden;';
        
        const header = document.createElement('div');
        header.style.cssText = 'padding: 15px; background: #232830; border-bottom: 1px solid #2a2f38;';
        header.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="color: #fff; margin: 0;">📦 Заказ №${order.number}</h3>
                <span style="background: #ff3b3b; color: white; padding: 3px 10px; border-radius: 15px; font-size: 12px;">В работе</span>
            </div>
        `;
        
        const content = document.createElement('div');
        content.style.cssText = 'padding: 15px;';
        
        const item = order.items[0];
        content.innerHTML = `
            <p><strong style="color: #fff;">${item.product}</strong> <span style="color: #a0a0a0;">| ${item.size} | ${item.quantity} шт</span></p>
            <p style="color: #a0a0a0; font-size: 13px;">Кронштейн: ${item.bracket.type} (${item.bracket.quantity} шт) | Лира: ${item.lyre.type} (${item.lyre.quantity} шт)</p>
        `;
        
        card.appendChild(header);
        card.appendChild(content);
        ordersList.appendChild(card);
    });
}

// Глобальные функции
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.loadProductSizes = loadProductSizes;
window.exportOrders = function() { alert('Экспорт заказов'); };
window.closeMaterialsModal = function() { document.getElementById('materialsModal').style.display = 'none'; };
