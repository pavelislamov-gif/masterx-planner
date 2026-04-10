// ============== ИМПОРТ ИЗ 1С С ВАЛИДАЦИЕЙ ==============

let parsedImportItems = [];
let selectedVersions = {};
let detailsData = {};

// Список известных изделий
const KNOWN_PRODUCTS = [
    'XGRAY', 'XLUMO', 'XVISION', 'XGLOW', 'XLINE', 'XSMART', 
    'XSTRONG', 'XFOCUS', 'XGIRO', 'XWHITE', 'XSLOPE', 'XSPOT', 
    'XDISK', 'XPOINT', 'XPIXEL', 'XRAY', 'XEYES', 'XMODULE', 
    'XROLL', 'ACENTO'
];

// Список версий для каждого типа
const PRODUCT_VERSIONS = {
    'XGRAY': ['XGRAY v.1', 'XGRAY v.2'],
    'XLUMO': ['XLUMO', 'XLUMO 1-6', 'XLUMO Двунаправленный', 'XLUMO PROV'],
    'XVISION': ['XVISION'],
    'XGLOW': ['XGLOW', 'XGLOW mini'],
    'XLINE': ['XLINE'],
    'XSMART': ['XSMART', 'XSMART MINI'],
    'XSTRONG': ['XSTRONG'],
    'XFOCUS': ['XFOCUS'],
    'XGIRO': ['XGIRO'],
    'XWHITE': ['XWHITE'],
    'XSLOPE': ['XSLOPE'],
    'XSPOT': ['XSPOT'],
    'XDISK': ['XDISK'],
    'XPOINT': ['XPOINT OVHD'],
    'XPIXEL': ['XPIXEL BIN v.1', 'XPIXEL BIN v.2', 'XPIXEL BIN v.3', 'XPIXEL OVHD'],
    'XRAY': ['XRAY 1', 'XRAY 3', 'XRAY 3-2', 'XRAY 3-GRP', 'XRAY 6', 'XRAY 6 RGBW', 
             'XRAY 6-2 проходной', 'XRAY 6-2 оконечный', 'XRAY 6-T2 BT 180', 'XRAY 6-T2 BT 200 шторка',
             'XRAY 6-T2 BT 220', 'XRAY 6-T2 BT 220 Шторка х2', 'XRAY 6-T2 BT 240 Шторка', 
             'XRAY 6-T2 BT 240 Шторка х2', 'XRAY 6-T2 BZ 180', 'XRAY 6-T2 BZ 200 Шторка',
             'XRAY 6-T2 BZ 220', 'XRAY 6-T2 BZ 220 Шторка х2', 'XRAY 6-T2 BZ 240 Шторка',
             'XRAY 6-T2 BZ 240 Шторка х2', 'XRAY 6T Накладной', 'XRAY 6T BT 120', 
             'XRAY 6T BT 140 Шторка', 'XRAY 6T BZ 120', 'XRAY 6T BZ 140 Шторка', 
             'XRAY 6T RGBW BT 150', 'XRAY 9', 'XRAY 9S', 'XRAY 12S', 'XRAY 18', 
             'XRAY 18S', 'XRAY 36', 'XRAY 36S'],
    'XEYES': ['XEYES 130*90 1', 'XEYES 130*90 2', 'XEYES 130*90 3', 'XEYES 130*90 4',
              'XEYES 130*120 1', 'XEYES 130*120 2', 'XEYES 130*120 3', 'XEYES 130*120 4',
              'XEYES mini-1'],
    'XMODULE': ['XMODULE-2x2', 'XMODULE-6x2'],
    'XROLL': ['XROLL-lite P', 'XROLL-lite K'],
    'ACENTO': ['ACENTO 3T', 'ACENTO 4']
};

// Получение деталей из техкарты
function getDetailsFromTechCard(productName) {
    if (!window.taskOperationsData) return [];
    
    let productOps = window.taskOperationsData[productName];
    if (!productOps) {
        const normalizedInput = productName.toLowerCase();
        for (const [key, value] of Object.entries(window.taskOperationsData)) {
            if (key.toLowerCase() === normalizedInput) {
                productOps = value;
                break;
            }
        }
    }
    
    if (!productOps) return [];
    
    const detailsMap = new Map();
    const sites = ['токарно-фрезерный', 'фрезерный', 'слесарный', 'лазерно-гибочный', 'полимерный'];
    const profileKeywords = ['Профиль', 'НПС', 'МП', 'КП', 'Труба', 'НП', 'ABA', 'ТПК', 'Н2248', 'XROLL'];
    const barKeywords = ['Пруток'];
    
    for (const site of sites) {
        const operations = productOps[site] || [];
        for (const op of operations) {
            const detailName = op.detail;
            if (detailName && detailName.trim() !== '') {
                if (!detailsMap.has(detailName)) {
                    let material = 'алюминий';
                    const nameLower = detailName.toLowerCase();
                    if (nameLower.includes('пвх')) material = 'ПВХ';
                    else if (nameLower.includes('поликарбонат')) material = 'поликарбонат';
                    else if (nameLower.includes('aisi') || nameLower.includes('нержавейка')) material = 'нержавейка';
                    else if (nameLower.includes('сталь')) material = 'сталь';
                    
                    let type = 'detail';
                    for (const keyword of profileKeywords) {
                        if (detailName.includes(keyword)) {
                            type = 'profile';
                            break;
                        }
                    }
                    for (const keyword of barKeywords) {
                        if (detailName.includes(keyword)) {
                            type = 'bar';
                            break;
                        }
                    }
                    
                    detailsMap.set(detailName, {
                        name: detailName,
                        material: material,
                        quantity: 0,
                        type: type,
                        lengthMm: 0
                    });
                }
            }
        }
    }
    
    return Array.from(detailsMap.values());
}

// Определение типа изделия
function detectProductType(name) {
    if (name.includes('Кронштейн')) return { type: 'bracket', keyword: 'Кронштейн' };
    if (name.includes('Лира')) return { type: 'lyre', keyword: 'Лира' };
    for (const product of KNOWN_PRODUCTS) {
        if (name.includes(product)) {
            return { type: 'product', keyword: product };
        }
    }
    return { type: 'unknown', keyword: null };
}

// Парсинг HTML
function parse1SReport(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const rows = doc.querySelectorAll('tr');
    
    const items = [];
    let isDataRow = false;
    
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
        
        const { type, keyword } = detectProductType(name);
        if (type === 'unknown') continue;
        
        if (!ral || ral === '' || ral === '<SPAN></SPAN>') {
            ral = null;
        } else {
            ral = ral.replace(/\s/g, '');
        }
        
        if (!texture || texture === '' || texture === '<SPAN></SPAN>') {
            texture = null;
        }
        
        const sizeMatch = name.match(/(\d+)/);
        const size = sizeMatch ? sizeMatch[1] : null;
        
        items.push({
            id: items.length,
            originalName: name,
            type: type,
            keyword: keyword,
            size: size,
            quantity: quantity,
            ral: ral,
            texture: texture
        });
    }
    
    return { groupName: groupName, items: items };
}

// Валидация данных импорта
function validateImportData() {
    const errors = [];
    const warnings = [];
    
    for (let i = 0; i < parsedImportItems.length; i++) {
        const item = parsedImportItems[i];
        
        // Проверка выбора версии
        if (!selectedVersions[i]) {
            errors.push(`Не выбрана версия для "${item.originalName}"`);
            highlightField(`.version-select[data-index="${i}"]`, true);
        } else {
            highlightField(`.version-select[data-index="${i}"]`, false);
        }
        
        // Проверка деталей
        if (detailsData[i]) {
            for (let d = 0; d < detailsData[i].length; d++) {
                const detail = detailsData[i][d];
                const isLengthRequired = (detail.type === 'profile' || detail.type === 'bar');
                
                if (isLengthRequired && (!detail.lengthMm || detail.lengthMm <= 0)) {
                    errors.push(`Не указана длина для "${detail.name}" в изделии "${item.originalName}"`);
                    highlightField(`.detail-length[data-item-idx="${i}"][data-detail-idx="${d}"]`, true);
                } else if (isLengthRequired) {
                    highlightField(`.detail-length[data-item-idx="${i}"][data-detail-idx="${d}"]`, false);
                }
                
                if (!detail.quantity || detail.quantity <= 0) {
                    errors.push(`Не указано количество для "${detail.name}" в изделии "${item.originalName}"`);
                    highlightField(`.detail-qty[data-item-idx="${i}"][data-detail-idx="${d}"]`, true);
                } else {
                    highlightField(`.detail-qty[data-item-idx="${i}"][data-detail-idx="${d}"]`, false);
                }
            }
        }
    }
    
    // Обновляем блок с предупреждениями
    updateWarningBlock(errors, warnings);
    
    return { isValid: errors.length === 0, errors, warnings };
}

// Подсветка поля
function highlightField(selector, hasError) {
    const field = document.querySelector(selector);
    if (field) {
        if (hasError) {
            field.style.border = '2px solid #dc2626';
            field.style.backgroundColor = '#fee2e2';
            // Добавляем символ ? если его нет
            const parent = field.parentElement;
            if (parent && !parent.querySelector('.error-icon')) {
                const icon = document.createElement('span');
                icon.className = 'error-icon';
                icon.textContent = ' ?';
                icon.style.color = '#dc2626';
                icon.style.fontWeight = 'bold';
                icon.style.marginLeft = '5px';
                parent.appendChild(icon);
            }
        } else {
            field.style.border = '1px solid #e2e8f0';
            field.style.backgroundColor = '#ffffff';
            // Удаляем символ ?
            const parent = field.parentElement;
            if (parent) {
                const icon = parent.querySelector('.error-icon');
                if (icon) icon.remove();
            }
        }
    }
}

// Обновление блока с предупреждениями
function updateWarningBlock(errors, warnings) {
    let warningBlock = document.getElementById('importWarningBlock');
    if (!warningBlock) {
        warningBlock = document.createElement('div');
        warningBlock.id = 'importWarningBlock';
        warningBlock.style.cssText = 'margin-bottom: 20px; padding: 12px; border-radius: 8px;';
        const previewContainer = document.getElementById('importPreviewContainer');
        if (previewContainer && previewContainer.parentNode) {
            previewContainer.parentNode.insertBefore(warningBlock, previewContainer);
        }
    }
    
    if (errors.length > 0) {
        warningBlock.style.background = '#fee2e2';
        warningBlock.style.border = '1px solid #dc2626';
        warningBlock.style.color = '#991b1b';
        warningBlock.innerHTML = `
            <strong>⚠️ ВНИМАНИЕ! Невозможно создать группу:</strong>
            <ul style="margin: 8px 0 0 20px;">
                ${errors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}
            </ul>
        `;
    } else if (warnings.length > 0) {
        warningBlock.style.background = '#fef3c7';
        warningBlock.style.border = '1px solid #f59e0b';
        warningBlock.style.color = '#92400e';
        warningBlock.innerHTML = `
            <strong>⚠️ Рекомендации:</strong>
            <ul style="margin: 8px 0 0 20px;">
                ${warnings.map(w => `<li>${escapeHtml(w)}</li>`).join('')}
            </ul>
        `;
    } else {
        warningBlock.style.display = 'none';
    }
}

// Отображение интерфейса выбора версий и деталей
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
        
        if (item.type === 'product') {
            const versions = PRODUCT_VERSIONS[item.keyword] || [item.keyword];
            html += `
                <div class="form-group">
                    <label style="font-size: 12px; color: #f97316;">🎯 Версия изделия:</label>
                    <select class="version-select" data-index="${i}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <option value="">-- Выберите версию --</option>
                        ${versions.map(v => `<option value="${v}">${v}</option>`).join('')}
                    </select>
                </div>
                <div class="details-container" id="details-${i}" style="display: none; margin-top: 15px; padding-top: 10px; border-top: 1px solid #e2e8f0;"></div>
            `;
        } else {
            html += `
                <div class="form-group">
                    <label style="font-size: 12px; color: #f97316;">🔧 Тип:</label>
                    <select class="version-select" data-index="${i}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <option value="Кронштейн">🔧 Кронштейн</option>
                        <option value="Лира">🎸 Лира</option>
                    </select>
                </div>
            `;
        }
        
        html += `</div>`;
    }
    
    container.innerHTML = html;
    
    // Обработчики для выбора версии
    document.querySelectorAll('.version-select').forEach(select => {
        select.addEventListener('change', function() {
            const index = parseInt(this.dataset.index);
            const value = this.value;
            const item = parsedImportItems[index];
            
            if (value && item.type === 'product') {
                selectedVersions[index] = value;
                loadAndRenderDetails(index, value, item.quantity);
            } else if (value) {
                selectedVersions[index] = value;
            } else {
                delete selectedVersions[index];
                const detailsContainer = document.getElementById(`details-${index}`);
                if (detailsContainer) detailsContainer.style.display = 'none';
            }
            
            // Валидация после каждого изменения
            validateImportData();
            updateConfirmButtonState();
        });
    });
}

// Загрузка и отображение деталей
function loadAndRenderDetails(index, productName, itemQuantity) {
    const details = getDetailsFromTechCard(productName);
    detailsData[index] = details.map(d => ({ ...d, quantity: itemQuantity, lengthMm: 0 }));
    
    const container = document.getElementById(`details-${index}`);
    if (!container) return;
    
    const profiles = details.filter(d => d.type === 'profile');
    const bars = details.filter(d => d.type === 'bar');
    const regularDetails = details.filter(d => d.type === 'detail');
    
    let html = '<div style="margin-top: 10px;">';
    
    if (profiles.length > 0) {
        html += `<div class="components-title" style="color: #f97316; margin: 10px 0 5px 0;">📐 ПРОФИЛИ:</div>`;
        profiles.forEach((profile, idx) => {
            html += `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 6px; background: #f8fafc; border-radius: 6px;">
                    <span style="flex: 2; font-size: 13px;">${escapeHtml(profile.name)}</span>
                    <input type="number" class="detail-length" data-item-idx="${index}" data-detail-idx="${idx}" value="${profile.lengthMm}" placeholder="мм" style="width: 80px; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span>мм</span>
                    <input type="number" class="detail-qty" data-item-idx="${index}" data-detail-idx="${idx}" value="${profile.quantity}" placeholder="кол-во" style="width: 70px; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span>шт</span>
                </div>
            `;
        });
    }
    
    if (bars.length > 0) {
        html += `<div class="components-title" style="color: #f97316; margin: 10px 0 5px 0;">🥖 ПРУТКИ:</div>`;
        bars.forEach((bar, idx) => {
            html += `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 6px; background: #f8fafc; border-radius: 6px;">
                    <span style="flex: 2; font-size: 13px;">${escapeHtml(bar.name)}</span>
                    <input type="number" class="detail-length" data-item-idx="${index}" data-detail-idx="${idx}" value="${bar.lengthMm}" placeholder="мм" style="width: 80px; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span>мм</span>
                    <input type="number" class="detail-qty" data-item-idx="${index}" data-detail-idx="${idx}" value="${bar.quantity}" placeholder="кол-во" style="width: 70px; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span>шт</span>
                </div>
            `;
        });
    }
    
    if (regularDetails.length > 0) {
        html += `<div class="components-title" style="color: #f97316; margin: 10px 0 5px 0;">🔧 ДЕТАЛИ:</div>`;
        regularDetails.forEach((detail, idx) => {
            html += `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 6px; background: #f8fafc; border-radius: 6px;">
                    <span style="flex: 2; font-size: 13px;">${escapeHtml(detail.name)}</span>
                    <input type="number" class="detail-qty" data-item-idx="${index}" data-detail-idx="${idx}" value="${detail.quantity}" placeholder="кол-во" style="width: 100px; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span>шт</span>
                </div>
            `;
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
    container.style.display = 'block';
    
    // Сохраняем изменения в полях
    document.querySelectorAll('.detail-length').forEach(input => {
        input.addEventListener('change', function() {
            const itemIdx = parseInt(this.dataset.itemIdx);
            const detailIdx = parseInt(this.dataset.detailIdx);
            if (detailsData[itemIdx] && detailsData[itemIdx][detailIdx]) {
                detailsData[itemIdx][detailIdx].lengthMm = parseInt(this.value) || 0;
            }
            validateImportData();
            updateConfirmButtonState();
        });
    });
    
    document.querySelectorAll('.detail-qty').forEach(input => {
        input.addEventListener('change', function() {
            const itemIdx = parseInt(this.dataset.itemIdx);
            const detailIdx = parseInt(this.dataset.detailIdx);
            if (detailsData[itemIdx] && detailsData[itemIdx][detailIdx]) {
                detailsData[itemIdx][detailIdx].quantity = parseInt(this.value) || 0;
            }
            validateImportData();
            updateConfirmButtonState();
        });
    });
    
    // Валидация после загрузки
    validateImportData();
    updateConfirmButtonState();
}

// Обновление состояния кнопки "Сформировать группу"
function updateConfirmButtonState() {
    const confirmBtn = document.getElementById('confirmImportBtn');
    const { isValid } = validateImportData();
    
    if (confirmBtn) {
        if (isValid) {
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
            confirmBtn.style.cursor = 'pointer';
        } else {
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
            confirmBtn.style.cursor = 'not-allowed';
        }
    }
}

// Анализ файла
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
        alert('Не найдено известных изделий для импорта');
        return;
    }
    
    parsedImportItems = result.items;
    selectedVersions = {};
    detailsData = {};
    
    if (result.groupName) {
        const groupNameInput = document.getElementById('importGroupName');
        if (groupNameInput) groupNameInput.value = result.groupName;
    }
    
    renderImportItems(parsedImportItems);
    const previewContainer = document.getElementById('importPreviewContainer');
    const confirmBtn = document.getElementById('confirmImportBtn');
    if (previewContainer) previewContainer.style.display = 'block';
    if (confirmBtn) confirmBtn.style.display = 'block';
    
    // Скрываем блок валидации в начале
    const warningBlock = document.getElementById('importWarningBlock');
    if (warningBlock) warningBlock.style.display = 'none';
    
    updateConfirmButtonState();
}

// Создание группы
async function confirmImport() {
    const { isValid, errors } = validateImportData();
    
    if (!isValid) {
        alert(`Невозможно создать группу. Исправьте следующие ошибки:\n${errors.join('\n')}`);
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
        // Подготавливаем tempItemsList
        const tempItemsList = [];
        
        for (let i = 0; i < parsedImportItems.length; i++) {
            const item = parsedImportItems[i];
            const selectedValue = selectedVersions[i];
            const isComponent = (item.type !== 'product');
            
            const details = [];
            if (detailsData[i]) {
                detailsData[i].forEach(detail => {
                    if (detail.quantity > 0) {
                        details.push({
                            name: detail.name,
                            material: detail.material,
                            lengthMm: detail.lengthMm || 0,
                            quantity: detail.quantity,
                            type: detail.type
                        });
                    }
                });
            }
            
            tempItemsList.push({
                product: selectedValue,
                size: {
                    name: item.size || 'Стандартный',
                    quantity: item.quantity
                },
                brackets: [],
                lyres: [],
                details: details,
                ral: item.ral || '',
                texture: item.texture || '',
                isComponent: isComponent
            });
        }
        
        window.tempItemsList = tempItemsList;
        
        const groupNameField = document.getElementById('groupNameInput');
        if (groupNameField) groupNameField.value = groupName;
        
        if (typeof window.createGroupOrder === 'function') {
            window.createGroupOrder();
        } else {
            throw new Error('Функция createGroupOrder не найдена');
        }
        
        closeImportModal();
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при создании группы: ' + error.message);
    } finally {
        if (progressDiv) progressDiv.style.display = 'none';
        if (confirmBtn) confirmBtn.disabled = false;
    }
}

// ============== ВАЛИДАЦИЯ В КАРТОЧКЕ ЗАКАЗА ==============

// Проверка и подсветка проблемных полей в карточке изделия
function validateAndHighlightItem(item, itemElement) {
    const problems = [];
    
    // Проверка деталей
    if (item.details && item.details.length > 0) {
        item.details.forEach((detail, idx) => {
            const isLengthRequired = (detail.type === 'profile' || detail.type === 'bar');
            
            if (isLengthRequired && (!detail.lengthMm || detail.lengthMm <= 0)) {
                problems.push(`Не указана длина для "${detail.name}"`);
                highlightItemField(itemElement, `detail-length-${idx}`, true);
            }
            
            if (!detail.quantity || detail.quantity <= 0) {
                problems.push(`Не указано количество для "${detail.name}"`);
                highlightItemField(itemElement, `detail-qty-${idx}`, true);
            }
        });
    }
    
    // Добавляем индикатор проблемы в карточку
    const problemIndicator = itemElement.querySelector('.problem-indicator');
    if (problems.length > 0) {
        if (!problemIndicator) {
            const header = itemElement.querySelector('.item-header');
            if (header) {
                const indicator = document.createElement('div');
                indicator.className = 'problem-indicator';
                indicator.style.cssText = 'background: #dc2626; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; margin-left: 10px; cursor: pointer;';
                indicator.innerHTML = `⚠️ ${problems.length} проблема`;
                indicator.title = problems.join('\n');
                indicator.onclick = () => openEditModal(item);
                header.appendChild(indicator);
            }
        }
    } else if (problemIndicator) {
        problemIndicator.remove();
    }
    
    return problems;
}

function highlightItemField(itemElement, fieldClass, hasError) {
    const field = itemElement.querySelector(`.${fieldClass}`);
    if (field) {
        if (hasError) {
            field.style.border = '2px solid #dc2626';
            field.style.backgroundColor = '#fee2e2';
        } else {
            field.style.border = '';
            field.style.backgroundColor = '';
        }
    }
}

// Открытие модального окна редактирования изделия
function openEditModal(item) {
    // Сохраняем редактируемое изделие в глобальную переменную
    window.editingItemData = item;
    window.editingItemIndex = null; // Будет установлен при сохранении
    
    // Открываем модальное окно редактирования
    const modal = document.getElementById('editItemModal');
    if (modal) {
        // Заполняем поля данными из item
        document.getElementById('editProductName').value = item.product;
        document.getElementById('editSize').value = item.size?.name || 'Стандартный';
        document.getElementById('editQuantity').value = item.size?.quantity || 0;
        document.getElementById('editRal').value = item.ral || '';
        document.getElementById('editTexture').value = item.texture || '';
        
        // Заполняем детали
        renderEditDetails(item.details || []);
        
        modal.style.display = 'block';
    }
}

function renderEditDetails(details) {
    const container = document.getElementById('editDetailsContainer');
    if (!container) return;
    
    const profiles = details.filter(d => d.type === 'profile');
    const bars = details.filter(d => d.type === 'bar');
    const regularDetails = details.filter(d => d.type === 'detail');
    
    let html = '';
    
    if (profiles.length > 0) {
        html += `<div class="components-title" style="color: #f97316; margin: 10px 0 5px 0;">📐 ПРОФИЛИ:</div>`;
        profiles.forEach((profile, idx) => {
            html += `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 6px; background: #f8fafc; border-radius: 6px;">
                    <span style="flex: 2; font-size: 13px;">${escapeHtml(profile.name)}</span>
                    <input type="number" class="edit-detail-length" data-detail-idx="${idx}" value="${profile.lengthMm || 0}" placeholder="мм" style="width: 80px; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span>мм</span>
                    <input type="number" class="edit-detail-qty" data-detail-idx="${idx}" value="${profile.quantity || 0}" placeholder="кол-во" style="width: 70px; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span>шт</span>
                </div>
            `;
        });
    }
    
    if (bars.length > 0) {
        html += `<div class="components-title" style="color: #f97316; margin: 10px 0 5px 0;">🥖 ПРУТКИ:</div>`;
        bars.forEach((bar, idx) => {
            html += `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 6px; background: #f8fafc; border-radius: 6px;">
                    <span style="flex: 2; font-size: 13px;">${escapeHtml(bar.name)}</span>
                    <input type="number" class="edit-detail-length" data-detail-idx="${idx}" value="${bar.lengthMm || 0}" placeholder="мм" style="width: 80px; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span>мм</span>
                    <input type="number" class="edit-detail-qty" data-detail-idx="${idx}" value="${bar.quantity || 0}" placeholder="кол-во" style="width: 70px; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span>шт</span>
                </div>
            `;
        });
    }
    
    if (regularDetails.length > 0) {
        html += `<div class="components-title" style="color: #f97316; margin: 10px 0 5px 0;">🔧 ДЕТАЛИ:</div>`;
        regularDetails.forEach((detail, idx) => {
            html += `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 6px; background: #f8fafc; border-radius: 6px;">
                    <span style="flex: 2; font-size: 13px;">${escapeHtml(detail.name)}</span>
                    <input type="number" class="edit-detail-qty" data-detail-idx="${idx}" value="${detail.quantity || 0}" placeholder="кол-во" style="width: 100px; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span>шт</span>
                </div>
            `;
        });
    }
    
    container.innerHTML = html;
}

function saveEditedItem() {
    if (!window.editingItemData) return;
    
    // Собираем обновлённые детали
    const updatedDetails = [];
    document.querySelectorAll('.edit-detail-length, .edit-detail-qty').forEach(input => {
        // Логика сбора обновлённых данных
    });
    
    // Обновляем данные в заказе
    // ...
    
    closeEditModal();
    if (window.renderOrdersList) window.renderOrdersList();
}

function closeEditModal() {
    const modal = document.getElementById('editItemModal');
    if (modal) modal.style.display = 'none';
    window.editingItemData = null;
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

// Открытие/закрытие модального окна импорта
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
        selectedVersions = {};
        detailsData = {};
        
        const warningBlock = document.getElementById('importWarningBlock');
        if (warningBlock) warningBlock.style.display = 'none';
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
    
    // Добавляем модальное окно редактирования, если его нет
    if (!document.getElementById('editItemModal')) {
        const editModal = document.createElement('div');
        editModal.id = 'editItemModal';
        editModal.className = 'modal';
        editModal.style.display = 'none';
        editModal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <span class="close" onclick="closeEditModal()">&times;</span>
                <h2 style="color: #dc2626;">✏️ Редактирование изделия</h2>
                <div class="form-group">
                    <label>Изделие:</label>
                    <input type="text" id="editProductName" readonly style="background: #f0f0f0;">
                </div>
                <div class="form-group">
                    <label>Размер:</label>
                    <input type="text" id="editSize" readonly style="background: #f0f0f0;">
                </div>
                <div class="form-group">
                    <label>Количество:</label>
                    <input type="text" id="editQuantity" readonly style="background: #f0f0f0;">
                </div>
                <div class="form-group">
                    <label>RAL:</label>
                    <input type="text" id="editRal">
                </div>
                <div class="form-group">
                    <label>Текстура:</label>
                    <select id="editTexture">
                        <option value="">Выберите</option>
                        <option value="матовая">Матовая</option>
                        <option value="глянцевая">Глянцевая</option>
                        <option value="муар">Муар</option>
                    </select>
                </div>
                <div id="editDetailsContainer"></div>
                <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button class="btn btn-danger" onclick="closeEditModal()">Отмена</button>
                    <button class="btn btn-success" onclick="saveEditedItem()">💾 Сохранить</button>
                </div>
            </div>
        `;
        document.body.appendChild(editModal);
    }
});

window.openImportModal = openImportModal;
window.closeImportModal = closeImportModal;
window.analyzeImportFile = analyzeImportFile;
window.confirmImport = confirmImport;
window.validateAndHighlightItem = validateAndHighlightItem;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveEditedItem = saveEditedItem;
