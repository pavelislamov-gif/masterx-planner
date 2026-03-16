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

// Загрузка всех данных
async function loadAllData() {
    try {
        products = await loadProducts() || [];
        brackets = await loadBrackets() || [];
        lyres = await loadLyres() || [];
        orders = loadOrdersFromStorage() || [];
        
        console.log('Продукты загружены:', products.length);
        console.log('Первый продукт:', products[0]);
        console.log('Кронштейны загружены:', brackets.length);
        console.log('Лир загружены:', lyres.length);
        
        populateSelects();
        loadOrders();
        updateStatistics();
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

// Заполнение выпадающих списков
function populateSelects() {
    console.log('Заполнение select-ов...');
    
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
        console.log('Изделий добавлено:', products.length);
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
        console.log('Кронштейнов добавлено:', brackets.length + 1);
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
        console.log('Лир добавлено:', lyres.length + 1);
    }
}

// Загрузка размеров для выбранного изделия
async function loadProductSizes() {
    const productName = document.getElementById('productSelect').value;
    console.log('Выбран продукт:', productName);
    
    const product = products.find(p => p.name === productName);
    const sizeSelect = document.getElementById('sizeSelect');
    
    sizeSelect.innerHTML = '<option value="">Загрузка размеров...</option>';
    sizeSelect.disabled = true;
    
    // Небольшая задержка для имитации загрузки
    setTimeout(() => {
        sizeSelect.innerHTML = '<option value="">Выберите размер</option>';
        
        if (product && product.sizes) {
            product.sizes.forEach(size => {
                const option = document.createElement('option');
                option.value = size;
                option.textContent = size;
                sizeSelect.appendChild(option);
            });
            console.log('Размеров загружено:', product.sizes.length);
        } else {
            sizeSelect.innerHTML = '<option value="">Нет доступных размеров</option>';
        }
        
        sizeSelect.disabled = false;
    }, 100);
}

// Открытие модального окна
function openOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('orderNumber').value = generateOrderNumber();
        document.getElementById('bracketQuantity').value = 1;
        document.getElementById('lyreQuantity').value = 1;
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
    
    // Проверка обязательных полей
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
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${createSiteRow('🔧 Токарный', order, 'tokarniy')}
                    ${createSiteRow('🔨 Слесарный', order, 'slesarniy')}
                    ${createSiteRow('⚙️ Фрезерный', order, 'frezerniy')}
                    ${createSiteRow('✨ Лазерно-гибочный', order, 'lazerno')}
                    ${createSiteRow('🧪 Полимерный', order, 'polimerniy')}
                </div>
            </div>
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

// Создание строки участка
function createSiteRow(name, order, siteKey) {
    return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #1a1e24; border-radius: 5px; border: 1px solid #2a2f38;">
            <span style="color: #fff; min-width: 120px;">${name}</span>
            <div style="display: flex; gap: 5px;">
                <div class="square"></div>
                <div class="square"></div>
                <div class="square"></div>
            </div>
            <span style="color: #a0a0a0; font-size: 12px;">0/3</span>
            <button class="btn btn-sm btn-primary" onclick="addExtraTask(${order.id}, '${siteKey}')">➕</button>
        </div>
    `;
}

// Вспомогательные функции
function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function updateStatistics() {
    document.getElementById('totalOrders').textContent = orders.length;
    const totalItems = orders.reduce((sum, order) => sum + order.items[0].quantity, 0);
    document.getElementById('totalItems').textContent = totalItems;
}

// Заглушки для функций
function showMaterialsReport(orderId) {
    alert('Отчет по материалам будет позже');
}

function deleteOrder(orderId) {
    if (confirm('Удалить заказ?')) {
        orders = orders.filter(o => o.id !== orderId);
        saveOrdersToStorage(orders);
        loadOrders();
        updateStatistics();
    }
}

function addExtraTask(orderId, siteKey) {
    alert(`Добавить задачу на участок ${siteKey}`);
}

function exportOrders() {
    alert('Экспорт заказов');
}

function closeMaterialsModal() {
    document.getElementById('materialsModal').style.display = 'none';
}

// Глобальные функции
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.loadProductSizes = loadProductSizes;
window.exportOrders = exportOrders;
window.showMaterialsReport = showMaterialsReport;
window.deleteOrder = deleteOrder;
window.addExtraTask = addExtraTask;
window.closeMaterialsModal = closeMaterialsModal;
