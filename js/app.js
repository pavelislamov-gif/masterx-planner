// Глобальные переменные
let products = [];
let brackets = [];
let lyres = [];
let orders = [];

// Инициализация
document.addEventListener('DOMContentLoaded', async function() {
    await loadAllData();
});

// Загрузка всех данных
async function loadAllData() {
    products = await loadProducts() || [];
    brackets = await loadBrackets() || [];
    lyres = await loadLyres() || [];
    orders = loadOrdersFromStorage() || [];
    
    populateSelects();
    loadOrders();
}

// Заполнение выпадающих списков
function populateSelects() {
    // Заполнение изделий
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
    
    // Заполнение кронштейнов
    const bracketSelect = document.getElementById('bracketSelect');
    if (bracketSelect) {
        bracketSelect.innerHTML = '<option value="">Выберите кронштейн</option>';
        
        // Добавляем опцию "отсутствует"
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
    
    // Заполнение лир
    const lyreSelect = document.getElementById('lyreSelect');
    if (lyreSelect) {
        lyreSelect.innerHTML = '<option value="">Выберите лиру</option>';
        
        // Добавляем опцию "отсутствует"
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
    document.getElementById('orderModal').style.display = 'block';
    document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('orderNumber').value = generateOrderNumber();
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
