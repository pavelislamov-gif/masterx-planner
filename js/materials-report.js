// js/materials-report.js - ОТЧЕТ ПО МАТЕРИАЛАМ (с поддержкой размеров)

class MaterialsReport {
    constructor() {
        this.materialsDB = {
            aluminum: [],
            steel: [],
            stainless: [],
            pvc: [],
            polycarbonate: [],
            other: [],
            brackets: [],
            lyres: [],
            rods: [],
            productSpecs: {}
        };
        this.normsLoaded = false;
    }
    
    async loadMaterialsData() {
        console.log('Загрузка данных о материалах...');
        
        try {
            const response = await fetch('data/norms.json');
            if (!response.ok) {
                throw new Error('Не удалось загрузить norms.json');
            }
            const norms = await response.json();
            
            this.materialsDB = {
                aluminum: norms.aluminum || [],
                steel: norms.steel || [],
                stainless: norms.stainless || [],
                pvc: norms.pvc || [],
                polycarbonate: norms.polycarbonate || [],
                other: norms.other || [],
                brackets: norms.brackets || [],
                lyres: norms.lyres || [],
                rods: norms.rods || [],
                productSpecs: norms.productSpecs || {}
            };
            
            this.normsLoaded = true;
            console.log('✅ Нормы загружены из JSON');
        } catch (error) {
            console.error('❌ Ошибка загрузки norms.json:', error);
            this.loadFallbackData();
        }
    }
    
    loadFallbackData() {
        console.warn('⚠️ Используются резервные данные');
        // ... резервные данные ...
    }
    
    // Расчет материалов для заказа
    calculateMaterials(order) {
        if (!order || !order.items || !Array.isArray(order.items)) {
            console.warn('Некорректный заказ:', order);
            return { 
                sheetMaterials: [], 
                profiles: [], 
                rods: [],
                productSpecs: []
            };
        }
        
        const sheetMaterials = [];
        const profiles = [];
        const rods = [];
        const productSpecs = [];
        
        order.items.forEach(item => {
            if (!item) return;
            
            const productQty = parseInt(item.quantity) || 1;
            const productName = item.product || '';
            const productSize = item.size || 'Стандартный';
            
            console.log(`📦 Обработка изделия: ${productName}, размер: ${productSize}, кол-во: ${productQty}`);
            
            // ============== 1. ЛИСТОВЫЕ МАТЕРИАЛЫ ==============
            const allSheets = [
                ...this.materialsDB.aluminum.map(m => ({ ...m, materialType: 'Алюминий' })),
                ...this.materialsDB.steel.map(m => ({ ...m, materialType: 'Сталь' })),
                ...this.materialsDB.stainless.map(m => ({ ...m, materialType: 'Нержавейка' })),
                ...this.materialsDB.pvc.map(m => ({ ...m, materialType: 'ПВХ' })),
                ...this.materialsDB.polycarbonate.map(m => ({ ...m, materialType: 'Поликарбонат' })),
                ...this.materialsDB.other.map(m => ({ ...m, materialType: m.material || 'Прочее' }))
            ];
            
            // Ищем материалы для этого продукта (не зависят от размера)
            const sheetMatches = allSheets.filter(m => m.product === productName);
            
            // Группируем по материалу и толщине
            const groupedSheets = {};
            sheetMatches.forEach(m => {
                const key = `${m.materialType}_${m.thickness}`;
                if (!groupedSheets[key]) {
                    groupedSheets[key] = {
                        name: m.materialType,
                        thickness: m.thickness || '—',
                        areaPerUnit: m.area || 0,
                        quantity: 0,
                        totalArea: 0,
                        products: []
                    };
                }
                groupedSheets[key].quantity += productQty;
                groupedSheets[key].totalArea += (m.area || 0) * productQty;
                groupedSheets[key].products.push(productName);
            });
            
            Object.values(groupedSheets).forEach(item => {
                sheetMaterials.push(item);
            });
            
            // ============== 2. КРОНШТЕЙНЫ ==============
            if (item.bracket && item.bracket.type && item.bracket.type !== 'отсутствует' && item.bracket.quantity > 0) {
                const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket.type);
                if (bracket) {
                    const area = bracket.area || 0;
                    const totalQty = item.bracket.quantity * productQty;
                    
                    sheetMaterials.push({
                        name: `Кронштейн ${item.bracket.type}`,
                        thickness: bracket.thickness || '2мм',
                        areaPerUnit: area,
                        quantity: totalQty,
                        totalArea: area * totalQty,
                        products: [productName]
                    });
                }
            }
            
            // ============== 3. ЛИРЫ ==============
            if (item.lyre && item.lyre.type && item.lyre.type !== 'отсутствует' && item.lyre.quantity > 0) {
                const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre.type);
                if (lyre) {
                    const area = lyre.area || 0;
                    const totalQty = item.lyre.quantity * productQty;
                    
                    sheetMaterials.push({
                        name: `Лира ${item.lyre.type}`,
                        thickness: lyre.thickness || '1.5мм',
                        areaPerUnit: area,
                        quantity: totalQty,
                        totalArea: area * totalQty,
                        products: [productName]
                    });
                }
            }
            
            // ============== 4. ПРУТКИ (RODS) ==============
            const rodMatches = this.materialsDB.rods.filter(r => r.product === productName);
            rodMatches.forEach(rod => {
                const existingRod = rods.find(r => r.rodType === rod.rodType);
                if (existingRod) {
                    existingRod.totalValue += (rod.value || 0) * productQty;
                    existingRod.quantity += productQty;
                } else {
                    rods.push({
                        rodType: rod.rodType || 'Пруток',
                        valuePerUnit: rod.value || 0,
                        unit: rod.unit || 'мм',
                        quantity: productQty,
                        totalValue: (rod.value || 0) * productQty
                    });
                }
            });
            
            // ============== 5. СПЕЦИФИКАЦИИ ПРОДУКТА (ПРОФИЛИ) - ЗАВИСЯТ ОТ РАЗМЕРА ==============
            const productSpec = this.materialsDB.productSpecs[productName];
            
            if (productSpec) {
                console.log(`📋 Найдены спецификации для ${productName}`);
                
                // Ищем точное совпадение размера
                let sizeSpec = null;
                let matchedSize = null;
                
                // Пробуем найти точное совпадение
                if (productSpec[productSize]) {
                    sizeSpec = productSpec[productSize];
                    matchedSize = productSize;
                    console.log(`✅ Точное совпадение размера: ${productSize}`);
                } else {
                    // Пробуем найти частичное совпадение (убираем пробелы, приводим к одному формату)
                    const normalizedSize = productSize.replace(/\s+/g, ' ').trim();
                    
                    for (let size in productSpec) {
                        const normalizedKey = size.replace(/\s+/g, ' ').trim();
                        if (normalizedKey === normalizedSize) {
                            sizeSpec = productSpec[size];
                            matchedSize = size;
                            console.log(`✅ Найдено совпадение после нормализации: ${size}`);
                            break;
                        }
                    }
                    
                    // Если всё ещё не нашли, пробуем contains
                    if (!sizeSpec) {
                        for (let size in productSpec) {
                            if (productSize.includes(size) || size.includes(productSize)) {
                                sizeSpec = productSpec[size];
                                matchedSize = size;
                                console.log(`✅ Частичное совпадение: ${size}`);
                                break;
                            }
                        }
                    }
                }
                
                if (sizeSpec) {
                    console.log(`📊 Спецификация для размера ${matchedSize}:`, sizeSpec);
                    
                    Object.entries(sizeSpec).forEach(([profileName, profileData]) => {
                        // Проверяем, что profileData - объект с value
                        const value = profileData.value || profileData;
                        const unit = profileData.unit || 'мм';
                        
                        const existingProfile = profiles.find(p => p.name === profileName);
                        if (existingProfile) {
                            existingProfile.totalLength += (value || 0) * productQty;
                            existingProfile.quantity += productQty;
                        } else {
                            profiles.push({
                                name: profileName,
                                lengthPerUnit: value || 0,
                                unit: unit,
                                quantity: productQty,
                                totalLength: (value || 0) * productQty
                            });
                        }
                    });
                    
                    productSpecs.push({
                        product: productName,
                        size: productSize,
                        matchedSize: matchedSize,
                        specs: sizeSpec
                    });
                } else {
                    console.warn(`⚠️ Размер ${productSize} не найден в спецификациях для ${productName}`);
                }
            } else {
                console.warn(`⚠️ Нет спецификаций для продукта ${productName}`);
            }
        });
        
        // Группируем одинаковые листовые материалы
        const finalSheetMaterials = this.groupSheetMaterials(sheetMaterials);
        
        return { 
            sheetMaterials: finalSheetMaterials, 
            profiles, 
            rods,
            productSpecs
        };
    }
    
    // Группировка листовых материалов
    groupSheetMaterials(materials) {
        const grouped = {};
        
        materials.forEach(item => {
            const key = `${item.name}_${item.thickness}`;
            if (grouped[key]) {
                grouped[key].quantity += item.quantity;
                grouped[key].totalArea += item.totalArea;
                grouped[key].products = [...new Set([...grouped[key].products, ...item.products])];
            } else {
                grouped[key] = { ...item };
            }
        });
        
        return Object.values(grouped);
    }
    
    // Формирование HTML отчета
    async generateReport(order) {
        return this.generateReportHTML(order);
    }
    
    async generateReportHTML(order) {
        const { sheetMaterials, profiles, rods, productSpecs } = this.calculateMaterials(order);
        
        const fmt = (val, dec = 4) => {
            if (val === undefined || val === null) return '0';
            return Number(val).toFixed(dec);
        };
        
        let html = `
            <div class="materials-report">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>📊 Отчет по материалам для заказа №${order.number}</h3>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.print()" class="btn btn-primary" style="padding: 8px 15px;">
                            🖨️ Печать
                        </button>
                        <button onclick="closeMaterialsModal()" class="btn btn-secondary" style="padding: 8px 15px;">
                            ✖ Закрыть
                        </button>
                    </div>
                </div>
                
                <p style="color: #a0a0a0; margin-bottom: 20px;">
                    Дата: ${order.date ? new Date(order.date).toLocaleDateString('ru-RU') : 'Не указана'}
                </p>
        `;
        
        if (sheetMaterials.length === 0 && profiles.length === 0 && rods.length === 0) {
            html += `
                <p style="color: #a0a0a0; text-align: center; padding: 20px;">
                    Нет данных о материалах для данного заказа
                </p>
            `;
        } else {
            html += `
                <h4>📦 Состав заказа:</h4>
                <table class="items-table" style="margin-bottom: 20px;">
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
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.product}</td>
                                <td>${item.size}</td>
                                <td>${item.quantity}</td>
                                <td>${item.bracket.type} (${item.bracket.quantity} шт)</td>
                                <td>${item.lyre.type} (${item.lyre.quantity} шт)</td>
                                <td>${item.ral || '-'}</td>
                                <td>${item.texture || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            if (sheetMaterials.length > 0) {
                html += `
                    <h4 style="margin-top: 30px;">📋 Листовые материалы (расход в м²)</h4>
                    <table class="materials-table">
                        <thead>
                            <tr>
                                <th>Материал</th>
                                <th>Толщина</th>
                                <th>Расход на 1 шт (м²)</th>
                                <th>Кол-во</th>
                                <th>Общий расход (м²)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sheetMaterials.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.thickness}</td>
                                    <td style="text-align: right;">${fmt(item.areaPerUnit)}</td>
                                    <td style="text-align: right;">${item.quantity}</td>
                                    <td style="text-align: right;">${fmt(item.totalArea)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
            
            if (profiles.length > 0) {
                html += `
                    <h4 style="margin-top: 30px;">📏 Профили (расход в мм)</h4>
                    <table class="materials-table">
                        <thead>
                            <tr>
                                <th>Профиль</th>
                                <th>Расход на 1 шт (мм)</th>
                                <th>Кол-во</th>
                                <th>Общий расход (мм)</th>
                                <th>Общий расход (м)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${profiles.map(profile => `
                                <tr>
                                    <td>${profile.name}</td>
                                    <td style="text-align: right;">${profile.lengthPerUnit}</td>
                                    <td style="text-align: right;">${profile.quantity}</td>
                                    <td style="text-align: right;">${fmt(profile.totalLength, 0)}</td>
                                    <td style="text-align: right;">${(profile.totalLength / 1000).toFixed(3)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
            
            if (rods.length > 0) {
                html += `
                    <h4 style="margin-top: 30px;">🥢 Прутки (расход в мм)</h4>
                    <table class="materials-table">
                        <thead>
                            <tr>
                                <th>Тип прутка</th>
                                <th>Расход на 1 шт (мм)</th>
                                <th>Кол-во</th>
                                <th>Общий расход (мм)</th>
                                <th>Общий расход (м)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rods.map(rod => `
                                <tr>
                                    <td>${rod.rodType}</td>
                                    <td style="text-align: right;">${rod.valuePerUnit}</td>
                                    <td style="text-align: right;">${rod.quantity}</td>
                                    <td style="text-align: right;">${fmt(rod.totalValue, 0)}</td>
                                    <td style="text-align: right;">${(rod.totalValue / 1000).toFixed(3)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
            
            // Добавляем информацию о подобранных размерах для отладки (можно убрать в продакшене)
            if (productSpecs.length > 0 && productSpecs.some(ps => ps.matchedSize)) {
                html += `
                    <div style="margin-top: 20px; padding: 10px; background: #1e232b; border-radius: 5px; font-size: 12px; color: #a0a0a0;">
                        <p><small>✓ Подобраны профили для размеров: ${productSpecs.map(ps => `${ps.product} (${ps.size})`).join(', ')}</small></p>
                    </div>
                `;
            }
        }
        
        html += `</div>`;
        return html;
    }
}

// Делаем класс доступным глобально
window.MaterialsReport = MaterialsReport;
