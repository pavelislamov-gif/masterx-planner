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
        
        // Заполняем выпадающие списки
        populateSelects();
        
        console.log('✅ loadAllData завершена');
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
    }
}

// ============== ЗАПОЛНЕНИЕ ВЫПАДАЮЩИХ СПИСКОВ ==============
function populateSelects() {
    console.log('Заполнение выпадающих списков...');
    
    // Заполнение изделий
    const productSelect = document.getElementById('productSelect');
    if (productSelect) {
        if (allProducts && allProducts.length) {
            productSelect.innerHTML = '<option value="">Выберите изделие</option>';
            allProducts.forEach(p => {
                const option = document.createElement('option');
                option.value = p.name;
                option.textContent = p.name;
                productSelect.appendChild(option);
            });
            console.log(`✅ Загружено ${allProducts.length} изделий`);
        }
    }
    
    // Заполнение кронштейнов
    const bracketSelect = document.getElementById('bracketSelect');
    if (bracketSelect) {
        if (allBrackets && allBrackets.length) {
            bracketSelect.innerHTML = '<option value="">Выберите кронштейн</option>';
            allBrackets.forEach(b => {
                const option = document.createElement('option');
                option.value = b.name;
                option.textContent = b.name;
                bracketSelect.appendChild(option);
            });
            console.log(`✅ Загружено ${allBrackets.length} кронштейнов`);
        }
    }
    
    // Заполнение лир
    const lyreSelect = document.getElementById('lyreSelect');
    if (lyreSelect) {
        if (allLyres && allLyres.length) {
            lyreSelect.innerHTML = '<option value="">Выберите лиру</option>';
            allLyres.forEach(l => {
                const option = document.createElement('option');
                option.value = l.name;
                option.textContent = l.name;
                lyreSelect.appendChild(option);
            });
            console.log(`✅ Загружено ${allLyres.length} лир`);
        }
    }
}

// ============== ЗАГРУЗКА РАЗМЕРОВ ПРИ ВЫБОРЕ ИЗДЕЛИЯ ==============
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'productSelect') {
        console.log('Выбрано изделие:', e.target.value);
        
        const productName = e.target.value;
        const sizeSelect = document.getElementById('productSizeSelect');
        
        if (!sizeSelect) {
            console.error('❌ sizeSelect не найден');
            return;
        }
        
        if (!productName) {
            sizeSelect.innerHTML = '<option value="">Сначала выберите изделие</option>';
            return;
        }
        
        const product = allProducts.find(p => p.name === productName);
        console.log('Найден продукт:', product);
        
        if (product && product.sizes && product.sizes.length > 0) {
            sizeSelect.innerHTML = '<option value="">Выберите размер</option>';
            
            product.sizes.forEach(size => {
                const option = document.createElement('option');
                option.value = size;
                option.textContent = size;
                sizeSelect.appendChild(option);
            });
            
            console.log(`✅ Загружено ${product.sizes.length} размеров`);
        } else {
            sizeSelect.innerHTML = '<option value="">Нет доступных размеров</option>';
        }
    }
});

// ============== ЗАГРУЗКА ЗАКАЗОВ ==============
function loadOrders() {
    console.log('loadOrders вызвана');
    
    const orders = loadOrdersFromStorage() || [];
    const tbody = document.getElementById('ordersTableBody');
    
    if (!tbody) {
        console.log('⚠️ ordersTableBody не найден');
        return;
    }
    
    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="13" style="text-align: center; padding: 40px;">
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
        
        html += `
            <tr data-order-id="${order.id}" style="cursor: pointer;" onclick="openOrderModal(${order.id})">
                <td>${order.id || '—'}</td>
                <td>${order.customer || '—'}</td>
                <td>${orderDate}</td>
                <td>${order.product || '—'}</td>
                <td>${order.productSize || '—'}</td>
                <td>${order.productQuantity || 0}</td>
                <td>${order.bracket || '—'}</td>
                <td>${order.bracketQuantity || 0}</td>
                <td>${order.lyre || '—'}</td>
                <td>${order.lyreQuantity || 0}</td>
                <td>${order.ral || '—'}</td>
                <td>${order.texture || '—'}</td>
                <td>
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
    const orders = loadOrdersFromStorage() || [];
    
    const totalOrders = orders.length;
    const totalItems = orders.reduce((sum, o) => {
        return sum + (o.productQuantity || 0) + (o.bracketQuantity || 0) + (o.lyreQuantity || 0);
    }, 0);
    
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalItemsEl = document.getElementById('totalItems');
    
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (totalItemsEl) totalItemsEl.textContent = totalItems;
}

// ============== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА ==============
function openOrderModal(orderId = null) {
    console.log('openOrderModal:', orderId);
    
    currentOrderId = orderId;
    const modal = document.getElementById('orderModal');
    
    if (!modal) {
        console.error('❌ Модальное окно не найдено');
        return;
    }
    
    const title = document.getElementById('modalTitle');
    if (title) {
        title.textContent = orderId ? 'Редактирование заказа' : 'Новый заказ';
    }
    
    // Заполняем списки при открытии
    populateSelects();
    
    if (orderId) {
        loadOrderData(orderId);
    } else {
        clearOrderForm();
    }
    
    modal.style.display = 'block';
}

// ============== ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА ==============
function closeOrderModal() {
    console.log('closeOrderModal');
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentOrderId = null;
}

// ============== ЗАГРУЗКА ДАННЫХ ЗАКАЗА ==============
function loadOrderData(orderId) {
    const orders = loadOrdersFromStorage() || [];
    const order = orders.find(o => o.id == orderId);
    
    if (!order) return;
    
    document.getElementById('orderDate').value = order.date || '';
    document.getElementById('orderCustomer').value = order.customer || '';
    
    // Изделие
    document.getElementById('productSelect').value = order.product || '';
    if (order.product) {
        // Триггерим загрузку размеров
        const event = new Event('change', { bubbles: true });
        document.getElementById('productSelect').dispatchEvent(event);
        
        setTimeout(() => {
            document.getElementById('productSizeSelect').value = order.productSize || '';
        }, 200);
    }
    document.getElementById('productQuantity').value = order.productQuantity || 0;
    
    // Кронштейн
    document.getElementById('bracketSelect').value = order.bracket || '';
    document.getElementById('bracketQuantity').value = order.bracketQuantity || 0;
    
    // Лира
    document.getElementById('lyreSelect').value = order.lyre || '';
    document.getElementById('lyreQuantity').value = order.lyreQuantity || 0;
    
    // Дополнительно
    document.getElementById('ralValue').value = order.ral || '';
    document.getElementById('textureValue').value = order.texture || '';
    document.getElementById('orderNotes').value = order.notes || '';
}

// ============== ОЧИСТКА ФОРМЫ ==============
function clearOrderForm() {
    document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('orderCustomer').value = '';
    
    // Изделие
    document.getElementById('productSelect').value = '';
    document.getElementById('productSizeSelect').innerHTML = '<option value="">Сначала выберите изделие</option>';
    document.getElementById('productQuantity').value = 1;
    
    // Кронштейн
    document.getElementById('bracketSelect').value = '';
    document.getElementById('bracketQuantity').value = 0;
    
    // Лира
    document.getElementById('lyreSelect').value = '';
    document.getElementById('lyreQuantity').value = 0;
    
    // Дополнительно
    document.getElementById('ralValue').value = '';
    document.getElementById('textureValue').value = '';
    document.getElementById('orderNotes').value = '';
}

// ============== СОХРАНЕНИЕ ЗАКАЗА ==============
function saveOrder() {
    console.log('saveOrder вызвана');
    
    // Проверяем обязательные поля
    const customer = document.getElementById('orderCustomer')?.value;
    if (!customer) {
        alert('⚠️ Введите заказчика');
        return;
    }
    
    const orderData = {
        id: currentOrderId || Date.now(), // Если новый заказ - создаем ID из timestamp
        number: 'ЗАКАЗ-' + (currentOrderId || Date.now()), // Генерируем номер заказа
        date: document.getElementById('orderDate')?.value || new Date().toISOString().split('T')[0],
        customer: customer,
        
        // Изделие
        product: document.getElementById('productSelect')?.value || '',
        productSize: document.getElementById('productSizeSelect')?.value || '',
        productQuantity: parseInt(document.getElementById('productQuantity')?.value) || 0,
        
        // Кронштейн
        bracket: document.getElementById('bracketSelect')?.value || '',
        bracketQuantity: parseInt(document.getElementById('bracketQuantity')?.value) || 0,
        
        // Лира
        lyre: document.getElementById('lyreSelect')?.value || '',
        lyreQuantity: parseInt(document.getElementById('lyreQuantity')?.value) || 0,
        
        // Дополнительно
        ral: document.getElementById('ralValue')?.value || '',
        texture: document.getElementById('textureValue')?.value || '',
        notes: document.getElementById('orderNotes')?.value || '',
        
        // Для совместимости
        items: [],
        totalQuantity: 0
    };
    
    // Подсчитываем общее количество
    orderData.totalQuantity = orderData.productQuantity + orderData.bracketQuantity + orderData.lyreQuantity;
    
    console.log('Сохраняем заказ:', orderData);
    
    // Получаем существующие заказы
    let orders = loadOrdersFromStorage() || [];
    
    if (currentOrderId) {
        // Редактирование существующего заказа
        const index = orders.findIndex(o => o.id == currentOrderId);
        if (index !== -1) {
            orders[index] = orderData;
            console.log('Заказ обновлен');
        }
    } else {
        // Новый заказ
        orders.push(orderData);
        console.log('Новый заказ добавлен');
    }
    
    // Сохраняем в localStorage
    saveOrdersToStorage(orders);
    
    // Обновляем таблицу
    loadOrders();
    
    // Закрываем модальное окно
    closeOrderModal();
    
    alert('✅ Заказ успешно сохранен');
}

// ============== УДАЛЕНИЕ ЗАКАЗА ==============
function deleteOrder(orderId) {
    if (!confirm('Удалить заказ?')) return;
    
    let orders = loadOrdersFromStorage() || [];
    orders = orders.filter(o => o.id != orderId);
    saveOrdersToStorage(orders);
    
    loadOrders();
    updateStatistics();
    alert('✅ Заказ удален');
}

// ============== ЭКСПОРТ В CSV ==============
function exportOrders() {
    const orders = loadOrdersFromStorage() || [];
    
    if (orders.length === 0) {
        alert('Нет заказов для экспорта');
        return;
    }
    
    let csv = 'ID,Дата,Заказчик,Изделие,Размер,Кол-во,Кронштейн,Кол-во,Лира,Кол-во,RAL,Текстура,Примечание\n';
    
    orders.forEach(o => {
        csv += `"${o.id}","${o.date}","${o.customer}","${o.product}","${o.productSize}",${o.productQuantity},"${o.bracket}",${o.bracketQuantity},"${o.lyre}",${o.lyreQuantity},"${o.ral}","${o.texture}","${o.notes}"\n`;
    });
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// ============== ДОПОЛНИТЕЛЬНЫЕ ОБРАБОТЧИКИ ==============
// Добавляем обработчик отправки формы
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveOrder();
        });
        console.log('✅ Обработчик формы добавлен');
    }
});

// Добавляем кнопку сохранения если её нет в форме
setTimeout(function() {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent && !document.querySelector('button[type="submit"]')) {
        const saveBtn = document.createElement('button');
        saveBtn.type = 'submit';
        saveBtn.textContent = 'Сохранить заказ';
        saveBtn.style.cssText = 'background: #ff3b3b; color: white; padding: 10px 25px; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;';
        
        const form = document.getElementById('orderForm');
        if (form) {
            form.appendChild(saveBtn);
        }
    }
}, 500);

// ============== ИНИЦИАЛИЗАЦИЯ ==============
document.addEventListener('DOMContentLoaded', function() {
    console.log('📅 DOM загружен, начинаем инициализацию...');
    loadAllData();
});

// ============== ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ==============
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.saveOrder = saveOrder;
window.deleteOrder = deleteOrder;
window.exportOrders = exportOrders;

console.log('✅ app.js полностью загружен');
