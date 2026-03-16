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
        
        orders = loadOrdersFromStorage() || [];
        console.log('✅ Заказы загружены:', orders.length);
        
        populateSelects();
        loadOrders();
        updateStatistics();
        
        if (typeof MaterialsReport !== 'undefined') {
            materialsReport = new MaterialsReport();
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
    
    const bracketSelect = document.getElementById('bracketSelect');
    if (bracketSelect) {
        bracketSelect.innerHTML = '<option value="">Выберите кронштейн</option>';
        
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
    
    const lyreSelect = document.getElementById('lyreSelect');
    if (lyreSelect) {
        lyreSelect.innerHTML = '<option value="">Выберите лиру</option>';
        
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
    document.getElementById('orderForm').reset();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('orderDate').value = today;
    
    const orderNumber = generateOrderNumber();
    document.getElementById('orderNumber').value = orderNumber;
    
    document.getElementById('bracketQuantity').value = 1;
    document.getElementById('lyreQuantity').value = 1;
    
    const form = document.getElementById('orderForm');
    form.onsubmit = createOrderHandler;
    
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
        tasks: {},
        extraTasks: []
    };
    
    orders.push(order);
    saveOrdersToStorage(orders);
    loadOrders();
    updateStatistics();
    closeOrderModal();
    
    showNotification('Заказ успешно создан!', 'success');
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

// ============== ОСНОВНЫЕ ФУНКЦИИ ПЛАНИРОВЩИКА ==============

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
    
    const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersList.appendChild(orderCard);
    });
    
    console.log('Отображено заказов:', sortedOrders.length);
}

// ============== БАЗА ОПЕРАЦИЙ ИЗ ТЕХКАРТ ==============

// Получение количества операций для изделия по участку (из техкарт)
function getSiteOperationsCount(productName, siteKey) {
    const operationsDB = {
        // ТОКАРНЫЙ УЧАСТОК
        'tokarniy': {
            'XRAY 1': 5,
            'XRAY 3': 5,
            'XRAY 3-2': 7,
            'XRAY 3-GRP': 5,
            'XRAY 6': 5,
            'XRAY 6 RGBW': 6,
            'XRAY 6-2 проходной': 6,
            'XRAY 6-2 оконечный': 6,
            'XRAY 6-T2 BT 180': 3,
            'XRAY 6-T2 BT 200': 3,
            'XRAY 6-T2 BT 220': 3,
            'XRAY 6-T2 BT 220 Шторка x2': 3,
            'XRAY 6-T2 BT 240 Шторка': 3,
            'XRAY 6-T2 BZ 180': 3,
            'XRAY 6-T2 BZ 200 Шторка': 3,
            'XRAY 6-T2 BZ 220': 4,
            'XRAY 6-T2 BZ 220 Шторка x2': 3,
            'XRAY 6-T2 BZ 240 Шторка': 3,
            'XRAY 6-T2 BZ 240 Шторка x2': 3,
            'XRAY 6T Накладной': 5,
            'XRAY 6T BT 120': 3,
            'XRAY 6T BT 140 Шторка': 3,
            'XRAY 6T BZ 120': 4,
            'XRAY 6T BZ 140 Шторка': 3,
            'XRAY 6T RGBW BT 150': 3,
            'XRAY 9': 7,
            'XRAY 9S': 3,
            'XRAY 12S': 3,
            'XRAY 18': 7,
            'XRAY 18S': 3,
            'XRAY 36': 0,
            'XRAY 36S': 0,
            'XSLOPE': 5,
            'XPIXEL BIN v.1': 3,
            'XPIXEL BIN v.2': 4,
            'XPIXEL BIN v.3': 4,
            'XPIXEL OVHD': 3,
            'XDISK': 8,
            'XPOINT OVHD': 2,
            'XSPOT': 5,
            'ACENTO 3T': 4,
            'ACENTO 4': 3,
            'XGRAY v.1': 3,
            'XGRAY v.2': 3,
            'XSMART mini': 2
        },
        
        // СЛЕСАРНЫЙ УЧАСТОК
        'slesarniy': {
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
            'XRAY 6-T2 BT 220 Шторка x2': 8,
            'XRAY 6-T2 BT 240 Шторка': 8,
            'XRAY 6-T2 BZ 180': 7,
            'XRAY 6-T2 BZ 200 Шторка': 8,
            'XRAY 6-T2 BZ 220': 7,
            'XRAY 6-T2 BZ 220 Шторка x2': 8,
            'XRAY 6-T2 BZ 240 Шторка': 8,
            'XRAY 6-T2 BZ 240 Шторка x2': 8,
            'XRAY 6T Накладной': 6,
            'XRAY 6T BT 120': 8,
            'XRAY 6T BT 140 Шторка': 8,
            'XRAY 6T BZ 120': 8,
            'XRAY 6T BZ 140 Шторка': 8,
            'XRAY 6T RGBW BT 150': 8,
            'XRAY 9': 5,
            'XRAY 9S': 5,
            'XRAY 12S': 5,
            'XRAY 18': 5,
            'XRAY 18S': 5,
            'XRAY 36': 0,
            'XRAY 36S': 0,
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
            'XGRAY v.1': 3,
            'XGRAY v.2': 3,
            'XSMART mini': 1
        },
        
        // ФРЕЗЕРНЫЙ УЧАСТОК
        'frezerniy': {
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
            'XRAY 6-T2 BT 220 Шторка x2': 0,
            'XRAY 6-T2 BT 240 Шторка': 0,
            'XRAY 6-T2 BZ 180': 0,
            'XRAY 6-T2 BZ 200 Шторка': 0,
            'XRAY 6-T2 BZ 220': 0,
            'XRAY 6-T2 BZ 220 Шторка x2': 0,
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
            'XGRAY v.2': 2,
            'XLITE': 2,
            'XSMART': 2,
            'XSMART MINI': 2,
            'XSTRONG': 1,
            'XLUMO': 5,
            'XLUMO 1-6': 4,
            'XLUMO Двунаправленный': 3,
            'XLUMO PROV': 3,
            'XVISION': 0,
            'XBAR-SW': 1,
            'XFOCUS': 1,
            'XYELLOW': 1,
            'XGRAY v.2': 2,
            'XLINE': 1
        },
        
        // ЛАЗЕРНО-ГИБОЧНЫЙ УЧАСТОК
        'lazerno': {
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
            'XRAY 6-T2 BT 220 Шторка x2': 4,
            'XRAY 6-T2 BT 240 Шторка': 4,
            'XRAY 6-T2 BZ 180': 4,
            'XRAY 6-T2 BZ 200 Шторка': 4,
            'XRAY 6-T2 BZ 220': 4,
            'XRAY 6-T2 BZ 220 Шторка x2': 4,
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
            'XPIXEL BIN v.1': 0,
            'XPIXEL BIN v.2': 0,
            'XPIXEL BIN v.3': 2,
            'XPIXEL OVHD': 1,
            'XDISK': 0,
            'XPOINT OVHD': 0,
            'XSPOT': 2,
            'ACENTO 3T': 4,
            'ACENTO 4': 4,
            'XROLL-lite P': 0,
            'XROLL-lite K': 2,
            'XWHITE': 0,
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
            'XGRAY v.2': 5,
            'XLITE': 4,
            'XSMART': 4,
            'XSMART MINI': 5,
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
        },
        
        // ПОЛИМЕРНЫЙ УЧАСТОК
        'polimerniy': {
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
            'XRAY 6-T2 BT 220 Шторка x2': 2,
            'XRAY 6-T2 BT 240 Шторка': 2,
            'XRAY 6-T2 BZ 180': 2,
            'XRAY 6-T2 BZ 200 Шторка': 2,
            'XRAY 6-T2 BZ 220': 2,
            'XRAY 6-T2 BZ 220 Шторка x2': 2,
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
            'XGRAY v.2': 5,
            'XLITE': 4,
            'XSMART': 5,
            'XSMART MINI': 4,
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
        }
    };
    
    // Пытаемся найти точное совпадение
    if (operationsDB[siteKey] && operationsDB[siteKey][productName] !== undefined) {
        return operationsDB[siteKey][productName];
    }
    
    // Если нет точного совпадения, ищем по частичному
    for (let key in operationsDB[siteKey]) {
        if (productName.includes(key) || key.includes(productName)) {
            return operationsDB[siteKey][key];
        }
    }
    
    return 1; // По умолчанию 1 операция
}

// Создание строки участка с кнопкой добавления задачи
function createSiteRow(siteDisplayName, order, siteKey) {
    if (!order.items || !order.items[0]) {
        return `<div class="site-item"><div class="site-name">${siteDisplayName}</div><div class="squares"><div class="square"></div></div></div>`;
    }
    
    const operationsCount = getSiteOperationsCount(order.items[0].product, siteKey);
    
    let squaresHtml = '';
    let completedCount = 0;
    
    // Основные операции
    for (let i = 0; i < operationsCount; i++) {
        const taskId = `${order.id}_${order.items[0].product}_${siteKey}_${i}`;
        const status = order.tasks && order.tasks[taskId] ? order.tasks[taskId] : '';
        
        if (status === 'green') completedCount++;
        
        squaresHtml += `<div class="square ${status}"></div>`;
    }
    
    // Дополнительные задачи для этого участка
    let extraCount = 0;
    if (order.extraTasks) {
        order.extraTasks.forEach((task, index) => {
            if (task.site === siteKey) {
                extraCount++;
                const taskId = `${order.id}_extra_${index}`;
                const status = order.tasks && order.tasks[taskId] ? order.tasks[taskId] : '';
                
                if (status === 'green') completedCount++;
                
                squaresHtml += `<div class="square ${status} extra-square" title="${task.title}"></div>`;
            }
        });
    }
    
    const totalOperations = operationsCount + extraCount;
    
    return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: white; border-radius: 5px; border: 1px solid #dee2e6;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-weight: bold; min-width: 120px;">${siteDisplayName}</span>
                <div class="squares" style="display: flex; gap: 5px;">
                    ${squaresHtml || '<div class="square"></div>'}
                </div>
                <span style="font-size: 12px; color: #666;">Выполнено: ${completedCount}/${totalOperations}</span>
            </div>
            <button class="btn btn-sm btn-primary" onclick="addExtraTaskToSite(${order.id}, '${siteKey}')" style="padding: 3px 8px; font-size: 12px;">➕</button>
        </div>
    `;
}

// Добавить дополнительную задачу на конкретный участок
function addExtraTaskToSite(orderId, siteKey) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const siteNames = {
        'tokarniy': 'Токарный',
        'slesarniy': 'Слесарный',
        'frezerniy': 'Фрезерный',
        'lazerno': 'Лазерно-гибочный',
        'polimerniy': 'Полимерный'
    };
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.id = 'extraTaskModal';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>➕ Новая дополнительная задача</h3>
            <p>Заказ №${order.number} | Участок: ${siteNames[siteKey]}</p>
            <form id="extraTaskForm">
                <input type="hidden" id="extraTaskSite" value="${siteKey}">
                <div class="form-group">
                    <label>Название задачи:</label>
                    <input type="text" id="extraTaskTitle" required placeholder="Например: Дополнительная обработка">
                </div>
                <div class="form-group">
                    <label>Описание:</label>
                    <textarea id="extraTaskDescription" rows="3" placeholder="Подробное описание задачи..."></textarea>
                </div>
                <button type="submit" class="btn btn-success" style="width: 100%;">✅ Создать задачу</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('extraTaskForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('extraTaskTitle').value;
        const description = document.getElementById('extraTaskDescription').value;
        const site = document.getElementById('extraTaskSite').value;
        
        if (!order.extraTasks) {
            order.extraTasks = [];
        }
        
        order.extraTasks.push({
            title: title,
            description: description,
            site: site,
            createdAt: new Date().toISOString()
        });
        
        saveOrdersToStorage(orders);
        modal.remove();
        loadOrders();
        showNotification('Дополнительная задача создана', 'success');
    });
}

// Создание карточки заказа
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.dataset.orderId = order.id;
    
    const header = document.createElement('div');
    header.className = 'order-header';
    
    const items = order.items || [];
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    // Подсчёт всех задач
    let totalTasks = 0;
    let completedTasks = 0;
    
    if (order.items && order.items[0]) {
        const product = order.items[0].product;
        const sites = ['tokarniy', 'slesarniy', 'frezerniy', 'lazerno', 'polimerniy'];
        
        sites.forEach(site => {
            const operationsCount = getSiteOperationsCount(product, site);
            totalTasks += operationsCount;
            
            for (let i = 0; i < operationsCount; i++) {
                const taskId = `${order.id}_${product}_${site}_${i}`;
                if (order.tasks && order.tasks[taskId] === 'green') completedTasks++;
            }
        });
        
        if (order.extraTasks) {
            totalTasks += order.extraTasks.length;
            order.extraTasks.forEach((task, index) => {
                const taskId = `${order.id}_extra_${index}`;
                if (order.tasks && order.tasks[taskId] === 'green') completedTasks++;
            });
        }
    }
    
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
    
    // Таблица с основными позициями
    let tableRows = '';
    if (items.length > 0) {
        tableRows = items.map(item => {
            const product = item.product || '-';
            const size = item.size || '-';
            const quantity = item.quantity || 0;
            const bracketInfo = item.bracket && item.bracket.type && item.bracket.type !== 'отсутствует' 
                ? `${item.bracket.type} (${item.bracket.quantity || 1} шт/изд)` 
                : '🚫 отсутствует';
            const lyreInfo = item.lyre && item.lyre.type && item.lyre.type !== 'отсутствует' 
                ? `${item.lyre.type} (${item.lyre.quantity || 1} шт/изд)` 
                : '🚫 отсутствует';
            
            return `
                <tr>
                    <td><strong>${product}</strong></td>
                    <td>${size}</td>
                    <td>${quantity} шт</td>
                    <td>${bracketInfo}</td>
                    <td>${lyreInfo}</td>
                    <td>${item.ral || '-'}</td>
                    <td>${item.texture || '-'}</td>
                    <td>${item.additional || '-'}</td>
                </tr>
            `;
        }).join('');
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
    
    // Дополнительные задачи
    if (order.extraTasks && order.extraTasks.length > 0) {
        const extraTasksSection = document.createElement('div');
        extraTasksSection.className = 'extra-tasks-section';
        extraTasksSection.innerHTML = '<h4 style="margin-top: 20px;">📋 Дополнительные задачи</h4>';
        
        const extraTasksTable = document.createElement('table');
        extraTasksTable.className = 'extra-tasks-table';
        extraTasksTable.style.width = '100%';
        extraTasksTable.style.borderCollapse = 'collapse';
        extraTasksTable.style.marginBottom = '15px';
        
        let extraRows = '';
        order.extraTasks.forEach((task, index) => {
            const taskId = `${order.id}_extra_${index}`;
            const taskStatus = order.tasks && order.tasks[taskId] ? order.tasks[taskId] : '';
            
            extraRows += `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                        <strong>${task.title}</strong><br>
                        <small style="color: #666;">${task.description || ''}</small><br>
                        <small style="color: #999;">Участок: ${getSiteName(task.site)}</small>
                    </td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">
                        <div class="squares">
                            <div class="square ${taskStatus}"></div>
                        </div>
                    </td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">
                        <button class="btn btn-sm btn-danger" onclick="deleteExtraTask(${order.id}, ${index})">❌</button>
                    </td>
                </tr>
            `;
        });
        
        extraTasksTable.innerHTML = `
            <thead>
                <tr style="background: #f0f0f0;">
                    <th style="padding: 8px; text-align: left;">Задача</th>
                    <th style="padding: 8px; text-align: center;">Статус</th>
                    <th style="padding: 8px; text-align: center;"></th>
                </tr>
            </thead>
            <tbody>
                ${extraRows}
            </tbody>
        `;
        
        extraTasksSection.appendChild(extraTasksTable);
        content.appendChild(extraTasksSection);
    }
    
    // Участки - в заданном порядке с кнопками
    const sitesSection = document.createElement('div');
    sitesSection.className = 'sites-section';
    sitesSection.innerHTML = `
        <h4 style="margin-bottom: 15px;">🏭 Производственные участки</h4>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            ${createSiteRow('🔧 Токарный', order, 'tokarniy')}
            ${createSiteRow('🔨 Слесарный', order, 'slesarniy')}
            ${createSiteRow('⚙️ Фрезерный', order, 'frezerniy')}
            ${createSiteRow('✨ Лазерно-гибочный', order, 'lazerno')}
            ${createSiteRow('🧪 Полимерный', order, 'polimerniy')}
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

// Получить название участка
function getSiteName(site) {
    const names = {
        'tokarniy': 'Токарный',
        'slesarniy': 'Слесарный',
        'frezerniy': 'Фрезерный',
        'lazerno': 'Лазерно-гибочный',
        'polimerniy': 'Полимерный'
    };
    return names[site] || site;
}

// Удалить дополнительную задачу
function deleteExtraTask(orderId, taskIndex) {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.extraTasks) return;
    
    if (confirm('Удалить эту дополнительную задачу?')) {
        order.extraTasks.splice(taskIndex, 1);
        
        if (order.tasks) {
            Object.keys(order.tasks).forEach(key => {
                if (key.includes(`_extra_${taskIndex}`)) {
                    delete order.tasks[key];
                }
            });
        }
        
        saveOrdersToStorage(orders);
        loadOrders();
        showNotification('Задача удалена', 'info');
    }
}

// Открыть модальное окно редактирования заказа
function editOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('orderDate').value = order.date;
    document.getElementById('orderNumber').value = order.number;

    const productSelect = document.getElementById('productSelect');
    productSelect.value = order.items[0].product;
    loadProductSizes();

    setTimeout(() => {
        document.getElementById('sizeSelect').value = order.items[0].size;
    }, 200);

    document.getElementById('quantity').value = order.items[0].quantity;
    
    if (order.items[0].bracket) {
        document.getElementById('bracketSelect').value = order.items[0].bracket.type || '';
        document.getElementById('bracketQuantity').value = order.items[0].bracket.quantity || 0;
    }
    
    if (order.items[0].lyre) {
        document.getElementById('lyreSelect').value = order.items[0].lyre.type || '';
        document.getElementById('lyreQuantity').value = order.items[0].lyre.quantity || 0;
    }
    
    document.getElementById('ralInput').value = order.items[0].ral || '';
    document.getElementById('textureSelect').value = order.items[0].texture || '';
    document.getElementById('additionalDetails').value = order.items[0].additional || '';

    const modal = document.getElementById('orderModal');
    modal.style.display = 'block';

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
        tasks: orders[orderIndex].tasks || {},
        extraTasks: orders[orderIndex].extraTasks || []
    };

    orders[orderIndex] = updatedOrder;
    saveOrdersToStorage(orders);
    loadOrders();
    updateStatistics();
    closeOrderModal();

    showNotification('Заказ обновлён', 'success');
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
        
        if (searchText) {
            const searchable = `${order.number} ${order.items.map(i => i.product).join(' ')}`.toLowerCase();
            show = searchable.includes(searchText);
        }
        
        if (show && statusFilter !== 'all') {
            const orderStatus = order.status || 'active';
            show = orderStatus === statusFilter;
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

// Удаление заказа
function deleteOrder(orderId) {
    console.log('Попытка удалить заказ с ID:', orderId);
    
    const firstConfirm = confirm('Вы уверены, что хотите удалить этот заказ?');
    
    if (!firstConfirm) {
        showNotification('Удаление отменено', 'info');
        return;
    }
    
    const orderToDelete = orders.find(o => o.id === orderId);
    
    if (!orderToDelete) {
        showNotification('Заказ не найден', 'error');
        return;
    }
    
    const itemInfo = orderToDelete.items.map(item => {
        let info = `${item.product} (${item.size}) - ${item.quantity} шт`;
        
        if (item.bracket && item.bracket.type && item.bracket.type !== 'отсутствует') {
            info += `, кронштейн: ${item.bracket.type} (${item.bracket.quantity || 1} шт)`;
        }
        
        if (item.lyre && item.lyre.type && item.lyre.type !== 'отсутствует') {
            info += `, лира: ${item.lyre.type} (${item.lyre.quantity || 1} шт)`;
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
    
    try {
        const newOrders = orders.filter(o => o.id !== orderId);
        
        orders = newOrders;
        saveOrdersToStorage(orders);
        loadOrders();
        updateStatistics();
        
        showNotification('✅ Заказ успешно удален', 'success');
    } catch (error) {
        console.error('Ошибка при удалении:', error);
        showNotification('❌ Ошибка при удалении заказа', 'error');
    }
}

// Получение цвета статуса
function getStatusColor(status) {
    return status === 'active' ? '#007bff' : '#28a745';
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
    
    .extra-square {
        border-style: dashed;
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
    
    .btn-sm {
        padding: 3px 8px;
        font-size: 12px;
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
window.addExtraTaskToSite = addExtraTaskToSite;
window.deleteExtraTask = deleteExtraTask;
