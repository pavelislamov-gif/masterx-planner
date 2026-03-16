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
    console.warn('⚠️ materials-report.js: MaterialsReport НЕ загружен! Отчет по материалам будет недоступен');
}

// Проверка наличия глобальных функций, которые будут объявлены позже
console.log('⏳ Функции app.js будут объявлены далее...');
console.log('='.repeat(50));

// Инициализация
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📅 DOM загружен, начинаем инициализацию...');
    await loadAllData();
});

// Загрузка всех данных
async function loadAllData() {
    try {
        console.log('📦 Загрузка продуктов...');
        products = await loadProducts() || [];
        
        console.log('📦 Загрузка кронштейнов...');
        brackets = await loadBrackets() || [];
        
        console.log('📦 Загрузка лир...');
        lyres = await loadLyres() || [];
        
        console.log('📦 Загрузка заказов...');
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
            console.log('📊 Инициализация отчета по материалам...');
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
                console.log('🔄 Обновление из другой вкладки');
                orders = JSON.parse(e.newValue || '[]');
                loadOrders();
                updateStatistics();
            }
        });
        
        // Слушаем события от участков
        window.addEventListener('taskStatusChanged', function(e) {
            console.log('🔄 Статус задачи изменён:', e.detail);
            updateTaskStatus(e.detail.taskId, e.detail.status);
        });
        
        console.log('🎉 Инициализация завершена!');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
    }
}

// Обновление статуса задачи
function updateTaskStatus(taskId, status) {
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

// Открытие модального окна
function openOrderModal() {
    console.log('📝 Открытие модального окна создания заказа');
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
    console.log('📝 Закрытие модального окна');
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'none';
        const form = document.getElementById('orderForm');
        if (form) form.reset();
    }
}

// Обработка формы заказа
document.getElementById('orderForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('📝 Создание нового заказа');
    
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

// ... (весь остальной код вашего app.js - getOperationCount, createSiteRow, loadOrders, и т.д.) ...

// ============== ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ==============
console.log('📤 Экспорт функций в глобальную область...');

window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.loadProductSizes = loadProductSizes;
window.exportOrders = exportOrders;
window.showMaterialsReport = showMaterialsReport;
window.deleteOrder = deleteOrder;
window.addExtraTask = addExtraTask;
window.closeMaterialsModal = closeMaterialsModal;

console.log('✅ Функции экспортированы:', Object.keys(window).filter(key => 
    typeof window[key] === 'function' && 
    ['openOrderModal', 'closeOrderModal', 'loadProductSizes', 'exportOrders', 
     'showMaterialsReport', 'deleteOrder', 'addExtraTask', 'closeMaterialsModal'].includes(key)
));

console.log('='.repeat(50));
console.log('🎉 app.js полностью загружен и готов к работе!');
console.log('='.repeat(50));
