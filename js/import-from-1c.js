// ============== ИМПОРТ ИЗ 1С ==============
// Парсинг HTML, выбор версий, подстановка деталей, автозаполнение длин профилей
// Умножение количества деталей: ×2 для всех, кроме левой/правой заглушек (×1)
// Кронштейны и лиры - единый выбор по толщине (кронштейн может стать лирой и наоборот)

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

// Единый список выбора по толщине (для кронштейнов и лир)
// При парсинге кронштейна или лиры показывается этот список
const THICKNESS_OPTIONS = [
    { thickness: '1,2мм', productName: 'Лира AISI 1,2мм', type: 'lyre' },
    { thickness: '1,5мм', productName: 'Кронштейн AISI 1,5мм', type: 'bracket' },
    { thickness: '1,5мм', productName: 'Лира AISI 1,5мм', type: 'lyre' },
    { thickness: '2мм', productName: 'Кронштейн AISI 2мм', type: 'bracket' },
    { thickness: '2мм', productName: 'Лира AISI 2мм', type: 'lyre' },
    { thickness: '3мм', productName: 'Кронштейн AISI 3мм', type: 'bracket' }
];

// Исключения для левой/правой заглушек (не умножаем на 2)
const EXCEPTIONS = ['левая', 'правая', 'Заглушка левая', 'Заглушка правая', 'левой', 'правой'];

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
                        lengthMm: 0,
                        baseQuantity: 1
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

// Форматирование значения с ? для отсутствующих данных
function formatValue(value, unit = '') {
    if (!value || value === '' || value === null || value === 0) {
        return '<span style="color: #dc2626; font-weight: bold;">?</span>';
    }
    return `${value}${unit ? ' ' + unit : ''}`;
}

// Группировка изделий по RAL
function groupItemsByRal(items) {
    const grouped = {};
    for (const item of items) {
        const ralKey = item.ral || '?';
        if (!grouped[ralKey]) {
            grouped[ralKey] = [];
        }
        grouped[ralKey].push(item);
    }
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
        if (a === '?') return 1;
        if (b === '?') return -1;
        const aNum = parseInt(a);
        const bNum = parseInt(b);
        if (isNaN(aNum)) return 1;
        if (isNaN(bNum)) return -1;
        return aNum - bNum;
    });
    return { grouped, sortedKeys };
}

// Получение списка размеров для продукта
function getSizesForProduct(productName) {
    if (window.productsList) {
        const product = window.productsList.find(p => p.name === productName);
        if (product && product.sizes) {
            return product.sizes;
        }
    }
    
    const defaultSizes = {
        'XGRAY v.1': ['116', '216', '316', '416', '516', '612', '712', '812', '912', '1012', '1108', '1208', '1308', '1408', '1508'],
        'XGRAY v.2': ['116', '216', '316', '416', '516', '612', '712', '812', '912', '1012', '1108', '1208', '1308', '1408', '1508'],
        'XLUMO': ['125', '250', '300', '375', '500', '600', '625', '700', '750', '800', '875', '900', '1000', '1100', '1125', '1200', '1250', '1300', '1375', '1400', '1500'],
        'XLUMO 1-6': ['XLUMO-1', 'XLUMO-2', 'XLUMO-3', 'XLUMO-4', 'XLUMO-5', 'XLUMO-6'],
        'XLUMO Двунаправленный': ['XLUMOx2-1', 'XLUMOx2-2', 'XLUMOx2-3', 'XLUMOx2-4', 'XLUMOx2-5', 'XLUMOx2-6'],
        'XLUMO PROV': ['125', '250', '375', '500', '625', '750', '875', '1000', '1125', '1250', '1375', '1500'],
        'XSMART': ['XSMART-2', 'XSMART-3', 'XSMART-4', 'XSMART-5', 'XSMART-6', '500', '1000', '1500'],
        'XSMART MINI': ['XSMART mini 1', 'XSMART mini 2', 'XSMART mini 3', 'XSMART mini 4', 'XSMART mini 5', 'XSMART mini 6'],
        'XGLOW': ['510', '1000', '1490'],
        'XGLOW mini': ['125', '250', '375', '500', '510', '625', '750', '875', '1000', '1125', '1250', '1375', '1490', '1500'],
        'XVISION': ['110', '125', '210', '250', '310', '375', '410', '500', '510', '600', '625', '700', '750', '800', '875', '900', '1000', '1125', '1250', '1375', '1500'],
        'XLINE': ['106', '206', '306', '406', '506', '600', '700', '800', '900', '1000', '1094', '1194', '1294', '1394', '1494'],
        'XGIRO': ['130', '220', '310', '410', '510', '600', '700', '800', '900', '1000'],
        'XLITE': ['125', '250', '375', '500', '625', '750', '875', '1000', '1125', '1250', '1375', '1500'],
        'XSTRONG': ['XSTRONG-10', 'XSTRONG-20', 'XSTRONG-30', 'XSTRONG-20PW', 'XSTRONG-30PW', 'XSTRONG-40PW'],
        'XROLL-lite P': ['205', '305', '405', '505', '600', '700', '800', '900', '1000', '1100', '1200', '1300', '1400', '1496'],
        'XROLL-lite K': ['205', '305', '405', '505', '600', '700', '800', '900', '1000', '1100', '1200', '1300', '1400', '1496'],
        'XYELLOW': ['116', '216', '316', '416', '516', '612', '712', '812', '912', '1012', '1108', '1208', '1308', '1408', '1508'],
        'XBAR-SW': ['1000', '1500']
    };
    
    return defaultSizes[productName] || ['Стандартный'];
}

// Отображение интерфейса выбора версий и деталей
function renderImportItems(items) {
    const container = document.getElementById('importItemsList');
    if (!container) return;
    
    const { grouped, sortedKeys } = groupItemsByRal(items);
    let html = '';
    
    for (const ralKey of sortedKeys) {
        const groupItems = grouped[ralKey];
        const ralDisplay = ralKey === '?' ? '<span style="color: #dc2626;">не указан (?)</span>' : ralKey;
        
        html += `
            <div style="margin-bottom: 20px;">
                <div style="background: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin-bottom: 10px; font-weight: bold;">
                    🎨 RAL: ${ralDisplay}
                </div>
        `;
        
        for (let i = 0; i < groupItems.length; i++) {
            const item = groupItems[i];
            const originalIndex = parsedImportItems.findIndex(x => x.id === item.id);
            
            const quantityDisplay = formatValue(item.quantity, 'шт');
            const ralDisplayInline = item.ral ? item.ral : '<span style="color: #dc2626; font-weight: bold;">?</span>';
            const textureDisplay = item.texture ? item.texture : '<span style="color: #dc2626; font-weight: bold;">?</span>';
            
            html += `
                <div class="import-item" data-item-index="${originalIndex}" style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
                        <div>
                            <strong style="font-size: 16px; color: #dc2626;">📦 ${escapeHtml(item.originalName)}</strong>
                            <div style="font-size: 13px; color: #64748b; margin-top: 5px;">
                                Кол-во: <strong>${quantityDisplay}</strong>
                                | RAL: <strong>${ralDisplayInline}</strong>
                                | Текстура: <strong>${textureDisplay}</strong>
                            </div>
                        </div>
                    </div>
            `;
            
            if (item.type === 'product') {
                const versions = PRODUCT_VERSIONS[item.keyword] || [item.keyword];
                
                html += `
                    <div class="form-group">
                        <label style="font-size: 12px; color: #f97316;">🎯 Версия изделия:</label>
                        <select class="version-select" data-index="${originalIndex}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                            <option value="">-- Выберите версию --</option>
                            ${versions.map(v => `<option value="${v}">${v}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="margin-top: 10px;">
                        <label style="font-size: 12px; color: #f97316;">📏 Размер изделия:</label>
                        <select class="size-select" data-index="${originalIndex}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;" disabled>
                            <option value="">-- Сначала выберите версию --</option>
                        </select>
                    </div>
                    <div class="details-container" id="details-${originalIndex}" style="display: none; margin-top: 15px; padding-top: 10px; border-top: 1px solid #e2e8f0;"></div>
                `;
            } else {
                // Для кронштейнов и лир - единый список выбора по толщине
                html += `
                    <div class="form-group">
                        <label style="font-size: 12px; color: #f97316;">${item.type === 'bracket' ? '🔧' : '🎸'} Выберите тип по толщине:</label>
                        <select class="thickness-select" data-index="${originalIndex}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                            <option value="">-- Выберите толщину --</option>
                            ${THICKNESS_OPTIONS.map(opt => `<option value="${opt.thickness}" data-product="${opt.productName}" data-item-type="${opt.type}">${opt.thickness} (${opt.productName})</option>`).join('')}
                        </select>
                    </div>
                `;
            }
            
            html += `</div>`;
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
            const sizeSelect = document.querySelector(`.size-select[data-index="${index}"]`);
            
            if (value && item.type === 'product') {
                selectedVersions[index] = value;
                const sizes = getSizesForProduct(value);
                if (sizeSelect) {
                    sizeSelect.disabled = false;
                    sizeSelect.innerHTML = '<option value="">-- Выберите размер --</option>';
                    sizes.forEach(size => {
                        sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
                    });
                }
            } else {
                delete selectedVersions[index];
                if (sizeSelect) {
                    sizeSelect.disabled = true;
                    sizeSelect.innerHTML = '<option value="">-- Сначала выберите версию --</option>';
                }
                const detailsContainer = document.getElementById(`details-${index}`);
                if (detailsContainer) detailsContainer.style.display = 'none';
            }
        });
    });
    
    // Обработчики для выбора размера
    document.querySelectorAll('.size-select').forEach(select => {
        select.addEventListener('change', function() {
            const index = parseInt(this.dataset.index);
            const size = this.value;
            const productName = selectedVersions[index];
            const item = parsedImportItems[index];
            
            if (size && productName) {
                parsedImportItems[index].selectedSize = size;
                loadAndRenderDetails(index, productName, item.quantity, size);
            }
        });
    });
    
    // Обработчики для выбора толщины (кронштейны и лиры)
    document.querySelectorAll('.thickness-select').forEach(select => {
        select.addEventListener('change', function() {
            const index = parseInt(this.dataset.index);
            const selectedOption = this.options[this.selectedIndex];
            const productName = selectedOption.getAttribute('data-product');
            const itemType = selectedOption.getAttribute('data-item-type');
            
            if (productName) {
                selectedVersions[index] = productName;
                console.log(`Выбран: ${productName} (${itemType})`);
            } else {
                delete selectedVersions[index];
            }
        });
    });
}

// Загрузка и отображение деталей
function loadAndRenderDetails(index, productName, itemQuantity, selectedSize = null) {
    const item = parsedImportItems[index];
    const size = selectedSize || item.selectedSize || item.size;
    
    console.log(`loadAndRenderDetails: product=${productName}, size=${size}, quantity=${itemQuantity}`);
    
    let profileLengths = {};
    if (window.getProfileLengths) {
        profileLengths = window.getProfileLengths(productName, size);
        console.log('📏 Длины профилей:', profileLengths);
    }
    
    const details = getDetailsFromTechCard(productName);
    
    // Фильтруем детали - убираем кронштейны и лиры из деталей
    const allThicknessProducts = THICKNESS_OPTIONS.map(opt => opt.productName);
    const filteredDetails = details.filter(d => {
        return !allThicknessProducts.includes(d.name);
    });
    
    detailsData[index] = filteredDetails.map(d => {
        let lengthMm = 0;
        let quantity = 0;
        
        const isException = EXCEPTIONS.some(exception => 
            d.name.toLowerCase().includes(exception.toLowerCase())
        );
        
        if (isException) {
            // Левая/правая заглушки: количество = количество изделий (×1)
            quantity = itemQuantity;
        } else {
            // Все остальные детали: количество = количество изделий × 2
            quantity = itemQuantity * 2;
        }
        
        // Для профилей и прутков подставляем длину из карты и умножаем на количество
        if ((d.type === 'profile' || d.type === 'bar') && profileLengths[d.name]) {
            lengthMm = profileLengths[d.name] * itemQuantity;
        }
        
        return {
            ...d,
            quantity: quantity,
            lengthMm: lengthMm
        };
    });
    
    const container = document.getElementById(`details-${index}`);
    if (!container) return;
    
    const profiles = detailsData[index].filter(d => d.type === 'profile');
    const bars = detailsData[index].filter(d => d.type === 'bar');
    const regularDetails = detailsData[index].filter(d => d.type === 'detail');
    
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
    
    document.querySelectorAll('.detail-length').forEach(input => {
        input.addEventListener('change', function() {
            const itemIdx = parseInt(this.dataset.itemIdx);
            const detailIdx = parseInt(this.dataset.detailIdx);
            if (detailsData[itemIdx] && detailsData[itemIdx][detailIdx]) {
                detailsData[itemIdx][detailIdx].lengthMm = parseInt(this.value) || 0;
            }
        });
    });
    
    document.querySelectorAll('.detail-qty').forEach(input => {
        input.addEventListener('change', function() {
            const itemIdx = parseInt(this.dataset.itemIdx);
            const detailIdx = parseInt(this.dataset.detailIdx);
            if (detailsData[itemIdx] && detailsData[itemIdx][detailIdx]) {
                detailsData[itemIdx][detailIdx].quantity = parseInt(this.value) || 0;
            }
        });
    });
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
}

// Создание группы
async function confirmImport() {
    const missingConfigs = [];
    for (let i = 0; i < parsedImportItems.length; i++) {
        if (!selectedVersions[i]) {
            missingConfigs.push(parsedImportItems[i].originalName);
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
                    name: item.selectedSize || item.size || 'Стандартный',
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

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Открытие/закрытие модального окна
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

window.openImportModal = openImportModal;
window.closeImportModal = closeImportModal;
window.analyzeImportFile = analyzeImportFile;
window.confirmImport = confirmImport;
