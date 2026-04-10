// ============== ИМПОРТ ИЗ 1С ==============

let parsedImportItems = [];
let selectedConfigs = {};

// Список версий изделий (из вашей системы)
const PRODUCT_VERSIONS = [
    'XGRAY v.1', 'XGRAY v.2', 'XLUMO', 'XLUMO 1-6', 'XLUMO Двунаправленный', 'XLUMO PROV',
    'XVISION', 'XGLOW', 'XGLOW mini', 'XLINE', 'XSMART', 'XSMART MINI', 'XSTRONG', 'XFOCUS',
    'XGIRO', 'XWHITE', 'XSLOPE', 'XSPOT', 'XDISK', 'XPOINT OVHD',
    'XEYES 130*90 1', 'XEYES 130*90 2', 'XEYES 130*90 3', 'XEYES 130*90 4',
    'XEYES 130*120 1', 'XEYES 130*120 2', 'XEYES 130*120 3', 'XEYES 130*120 4',
    'XEYES mini-1', 'XMODULE-2x2', 'XMODULE-6x2', 'XROLL-lite P', 'XROLL-lite K',
    'XPIXEL BIN v.1', 'XPIXEL BIN v.2', 'XPIXEL BIN v.3', 'XPIXEL OVHD',
    'XRAY 1', 'XRAY 3', 'XRAY 3-2', 'XRAY 3-GRP', 'XRAY 6', 'XRAY 6 RGBW',
    'XRAY 6-2 проходной', 'XRAY 6-2 оконечный', 'XRAY 6-T2 BT 180', 'XRAY 6-T2 BT 200 шторка',
    'XRAY 6-T2 BT 220', 'XRAY 6-T2 BT 220 Шторка х2', 'XRAY 6-T2 BT 240 Шторка', 'XRAY 6-T2 BT 240 Шторка х2',
    'XRAY 6-T2 BZ 180', 'XRAY 6-T2 BZ 200 Шторка', 'XRAY 6-T2 BZ 220', 'XRAY 6-T2 BZ 220 Шторка х2',
    'XRAY 6-T2 BZ 240 Шторка', 'XRAY 6-T2 BZ 240 Шторка х2', 'XRAY 6T Накладной', 'XRAY 6T BT 120',
    'XRAY 6T BT 140 Шторка', 'XRAY 6T BZ 120', 'XRAY 6T BZ 140 Шторка', 'XRAY 6T RGBW BT 150',
    'XRAY 9', 'XRAY 9S', 'XRAY 12S', 'XRAY 18', 'XRAY 18S', 'XRAY 36', 'XRAY 36S',
    'ACENTO 3T', 'ACENTO 4'
];

// ============== ПАРСИНГ HTML ==============
function parse1SReport(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const rows = doc.querySelectorAll('tr');
    
    const items = [];
    let isDataRow = false;
    
    // Извлекаем название объекта
    let groupName = '';
    for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
            const text = cells[0]?.innerText || '';
            if (text.includes('Табель на объект')) {
                groupName = text.replace('Табель на объект -', '').trim();
                break;
            }
        }
    }
    
    for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 6) continue;
        
        // Ищем строку с заголовком
        const headerText = cells[1]?.innerText || '';
        if (headerText === 'Номенклатура') {
            isDataRow = true;
            continue;
        }
        
        if (!isDataRow) continue;
        
        const name = cells[1]?.innerText?.trim();
        const quantity = parseInt(cells[2]?.innerText?.trim().replace(/\s/g, '')) || 0;
        let ral = cells[4]?.innerText?.trim();
        let texture = cells[5]?.innerText?.trim();
        
        if (!name || name === '' || quantity === 0) continue;
        if (name.includes('Составил') || name.includes('Проверил') || name.includes('Принял')) continue;
        if (name.includes('Итого') || name.includes('Всего')) continue;
        
        // Обработка RAL
        if (!ral || ral === '' || ral === '<SPAN></SPAN>') {
            ral = null;
        } else {
            ral = ral.replace(/\s/g, '');
        }
        
        // Обработка текстуры
        if (!texture || texture === '' || texture === '<SPAN></SPAN>') {
            texture = null;
        }
        
        // Извлекаем размер
        const sizeMatch = name.match(/(\d+)/);
        const size = sizeMatch ? sizeMatch[1] : null;
        
        // Определяем тип изделия
        let itemType = 'product';
        
        if (name.includes('Кронштейн')) {
            itemType = 'bracket';
        } else if (name.includes('Лира')) {
            itemType = 'lyre';
        } else if (name.includes('Комплект') || name.includes('коннектор') || name.includes('заглушек')) {
            itemType = 'component';
        }
        
        items.push({
            id: items.length,
            originalName: name,
            itemType: itemType,
            size: size,
            quantity: quantity,
            ral: ral,
            texture: texture
        });
    }
    
    return { groupName: groupName, items: items };
}

// ============== ОТОБРАЖЕНИЕ ИНТЕРФЕЙСА ==============
function renderImportItems(items) {
    const container = document.getElementById('importItemsList');
    if (!container) return;
    
    let html = '';
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        html += `
            <div class="import-item" data-item-index="${i}" style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
                    <div>
                        <strong style="font-size: 16px; color: #dc2626;">📦 ${escapeHtml(item.originalName)}</strong>
                        <div style="font-size: 13px; color: #64748b; margin-top: 5px;">
                            Кол-во: <strong>${item.quantity} шт</strong>
                            ${item.ral ? ` | RAL: <strong>${item.ral}</strong>` : ''}
                            ${item.texture ? ` | Текстура: <strong>${item.texture}</strong>` : ''}
                            ${item.size ? ` | Размер: <strong>${item.size}</strong>` : ''}
                        </div>
                    </div>
                </div>
        `;
        
        if (item.itemType === 'product') {
            html += `
                <div class="form-group" style="margin-bottom: 0;">
                    <label style="font-size: 12px; color: #f97316;">🎯 Версия изделия:</label>
                    <select class="version-select" data-index="${i}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <option value="">-- Выберите версию --</option>
                        ${PRODUCT_VERSIONS.map(v => `<option value="${v}">${v}</option>`).join('')}
                    </select>
                </div>
            `;
        } else if (item.itemType === 'bracket') {
            html += `
                <div class="form-group" style="margin-bottom: 0;">
                    <label style="font-size: 12px; color: #f97316;">🔧 Тип кронштейна:</label>
                    <select class="version-select" data-index="${i}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <option value="">-- Выберите тип --</option>
                        <option value="Кронштейн Y-700">Кронштейн Y-700</option>
                        <option value="Кронштейн LU-15">Кронштейн LU-15</option>
                        <option value="Кронштейн PU-10">Кронштейн PU-10</option>
                        <option value="Кронштейн NP-100-2">Кронштейн NP-100-2</option>
                    </select>
                </div>
            `;
        } else if (item.itemType === 'lyre') {
            html += `
                <div class="form-group" style="margin-bottom: 0;">
                    <label style="font-size: 12px; color: #f97316;">🎸 Тип лиры:</label>
                    <select class="version-select" data-index="${i}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <option value="">-- Выберите тип --</option>
                        <option value="Лира Y-700">Лира Y-700</option>
                        <option value="Лира XSMART">Лира XSMART</option>
                        <option value="Лира XVISION">Лира XVISION</option>
                        <option value="Лира XGLOW">Лира XGLOW</option>
                    </select>
                </div>
            `;
        } else {
            html += `
                <div class="form-group" style="margin-bottom: 0;">
                    <label style="font-size: 12px; color: #f97316;">🔧 Тип:</label>
                    <select class="version-select" data-index="${i}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <option value="component">Комплектующая (без операций)</option>
                    </select>
                </div>
            `;
        }
        
        html += `</div>`;
    }
    
    container.innerHTML = html;
    
    // Сохраняем выбранные значения
    document.querySelectorAll('.version-select').forEach(select => {
        select.addEventListener('change', function() {
            const index = parseInt(this.dataset.index);
            const value = this.value;
            if (value) {
                selectedConfigs[index] = value;
            } else {
                delete selectedConfigs[index];
            }
        });
    });
}

// ============== АНАЛИЗ ФАЙЛА ==============
async function analyzeImportFile() {
    const fileInput = document.getElementById('importFileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Выберите файл');
        return;
    }
    
    const text = await file.text();
    const result = parse1SReport(text);
    
    if (result.items.length === 0) {
        alert('Не найдено данных для импорта');
        return;
    }
    
    parsedImportItems = result.items;
    selectedConfigs = {};
    
    if (result.groupName) {
        const groupNameInput = document.getElementById('importGroupName');
        if (groupNameInput) groupNameInput.value = result.groupName;
    }
    
    renderImportItems(parsedImportItems);
    const previewContainer = document.getElementById('importPreviewContainer');
    const confirmBtn = document.getElementById('confirmImportBtn');
    if (previewContainer) previewContainer.style.display = 'block';
    if (confirmBtn) confirmBtn.style.display = 'block';
}

// ============== СОЗДАНИЕ ГРУППЫ ==============
async function confirmImport() {
    // Проверяем, что все изделия имеют выбранную версию
    const missingConfigs = [];
    for (let i = 0; i < parsedImportItems.length; i++) {
        const item = parsedImportItems[i];
        if (item.itemType !== 'component' && !selectedConfigs[i]) {
            missingConfigs.push(item.originalName);
        }
    }
    
    if (missingConfigs.length > 0) {
        alert(`Выберите конфигурацию для следующих изделий:\n${missingConfigs.join('\n')}`);
        return;
    }
    
    const groupNameInput = document.getElementById('importGroupName');
    const groupName = groupNameInput ? groupNameInput.value.trim() : '';
    if (!groupName) {
        alert('Введите название группы');
        return;
    }
    
    const progressDiv = document.getElementById('importProgress');
    const confirmBtn = document.getElementById('confirmImportBtn');
    if (progressDiv) progressDiv.style.display = 'block';
    if (confirmBtn) confirmBtn.disabled = true;
    
    try {
        // Получаем существующие заказы
        const orders = window.loadOrdersFromStorage ? window.loadOrdersFromStorage() : [];
        
        // Формируем items для группы
        const items = [];
        for (let i = 0; i < parsedImportItems.length; i++) {
            const item = parsedImportItems[i];
            const selectedValue = selectedConfigs[i];
            
            let productName = '';
            let isComponent = false;
            
            if (selectedValue === 'component') {
                productName = item.originalName;
                isComponent = true;
            } else {
                productName = selectedValue;
                isComponent = false;
            }
            
            items.push({
                product: productName,
                size: {
                    name: item.size || 'Стандартный',
                    quantity: item.quantity
                },
                brackets: [],
                lyres: [],
                details: [],
                ral: item.ral || '',
                texture: item.texture || '',
                isComponent: isComponent
            });
        }
        
        // Создаём новую группу
        const newOrder = {
            id: Date.now(),
            groupName: groupName,
            date: new Date().toISOString().split('T')[0],
            number: generateOrderNumber(),
            items: items,
            status: 'active',
            tasks: {},
            extraTasks: [],
            siteFiles: {}
        };
        
        orders.push(newOrder);
        if (window.saveOrdersToStorage) window.saveOrdersToStorage(orders);
        
        // Создаём задачи для заказа
        if (window.createTasksForOrder) {
            window.createTasksForOrder(newOrder);
        }
        
        closeImportModal();
        
        // Обновляем отображение
        if (window.renderOrdersList) window.renderOrdersList();
        if (window.updateStatistics) window.updateStatistics();
        
        alert(`✅ Группа "${groupName}" успешно создана!\n📦 Добавлено изделий: ${parsedImportItems.length}`);
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при создании группы: ' + error.message);
    } finally {
        if (progressDiv) progressDiv.style.display = 'none';
        if (confirmBtn) confirmBtn.disabled = false;
    }
}

function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}.${month}.${year}`;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============== ОТКРЫТИЕ/ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА ==============
function openImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.style.display = 'block';
        const fileInput = document.getElementById('importFileInput');
        const groupNameInput = document.getElementById('importGroupName');
        const previewContainer = document.getElementById('importPreviewContainer');
        const confirmBtn = document.getElementById('confirmImportBtn');
        
        if (fileInput) fileInput.value = '';
        if (groupNameInput) groupNameInput.value = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (confirmBtn) confirmBtn.style.display = 'none';
        
        parsedImportItems = [];
        selectedConfigs = {};
    }
}

function closeImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) modal.style.display = 'none';
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyzeImportBtn');
    if (analyzeBtn) {
        analyzeBtn.onclick = analyzeImportFile;
    }
});

// Экспорт в глобальную область
window.openImportModal = openImportModal;
window.closeImportModal = closeImportModal;
window.analyzeImportFile = analyzeImportFile;
window.confirmImport = confirmImport;