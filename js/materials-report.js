// Отчет по материалам
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
            
            this.materialsDB.aluminum = norms.aluminum || [];
            this.materialsDB.steel = norms.steel || [];
            this.materialsDB.stainless = norms.stainless || [];
            this.materialsDB.pvc = norms.pvc || [];
            this.materialsDB.polycarbonate = norms.polycarbonate || [];
            this.materialsDB.other = norms.other || [];
            this.materialsDB.brackets = norms.brackets || [];
            this.materialsDB.lyres = norms.lyres || [];
            this.materialsDB.rods = norms.rods || [];
            this.materialsDB.productSpecs = norms.productSpecs || {};
            
            this.normsLoaded = true;
            console.log('✅ Нормы загружены из JSON');
        } catch (error) {
            console.error('❌ Ошибка загрузки norms.json:', error);
            this.loadFallbackData();
        }
    }
    
    loadFallbackData() {
        console.warn('⚠️ Используются резервные данные');
        this.materialsDB.aluminum = [
            { product: 'XGRAY v.1', thickness: '3мм', area: 0.0032 }
        ];
    }
    
    // ============== РАСЧЕТ МАТЕРИАЛОВ ==============
    
    calculateMaterials(order) {
        // Разные категории материалов
        const otherSheetMaterials = []; // листовые материалы (кроме AISI)
        const profiles = [];
        const rods = [];
        
        // Для группировки AISI по источникам
        const aisiFromProducts = {}; // AISI из техкарт изделий
        const aisiFromBrackets = {}; // AISI из кронштейнов
        const aisiFromLyres = {};    // AISI из лир
        
        order.items.forEach(item => {
            const productQuantity = item.quantity || 1;
            const productName = item.product;
            const size = item.size;
            
            console.log(`Расчет материалов для ${productName} размер ${size}, кол-во изделий: ${productQuantity}`);
            
            // ===========================================
            // 1. AISI ИЗ ТЕХКАРТЫ ИЗДЕЛИЯ
            // ===========================================
            const productSpec = this.materialsDB.productSpecs[productName];
            if (productSpec && productSpec[size]) {
                const spec = productSpec[size];
                
                Object.entries(spec).forEach(([key, data]) => {
                    // Проверяем, относится ли материал к AISI
                    const isAISI = key.includes('AISI') || 
                                   key.includes('Нержавейка') || 
                                   (data.material && data.material.includes('AISI'));
                    
                    if (isAISI) {
                        // Определяем толщину
                        let thickness = '2мм'; // по умолчанию
                        if (data.thickness) {
                            thickness = data.thickness;
                        } else if (key.includes('1мм')) {
                            thickness = '1мм';
                        } else if (key.includes('1.5мм')) {
                            thickness = '1.5мм';
                        } else if (key.includes('2мм')) {
                            thickness = '2мм';
                        } else if (key.includes('3мм')) {
                            thickness = '3мм';
                        }
                        
                        const value = data.value || 0;
                        const totalValue = value * productQuantity;
                        
                        const key_thickness = `AISI 430 ${thickness}`;
                        
                        if (!aisiFromProducts[key_thickness]) {
                            aisiFromProducts[key_thickness] = {
                                name: key_thickness,
                                thickness: thickness,
                                totalArea: 0,
                                details: []
                            };
                        }
                        
                        aisiFromProducts[key_thickness].totalArea += totalValue;
                        aisiFromProducts[key_thickness].details.push({
                            name: `${key} (${productName})`,
                            valuePerUnit: value,
                            quantity: productQuantity,
                            totalValue: totalValue
                        });
                    } else {
                        // Не AISI материалы
                        const value = data.value || 0;
                        profiles.push({
                            name: key,
                            valuePerUnit: value,
                            unit: data.unit || 'мм',
                            quantity: productQuantity,
                            totalValue: value * productQuantity
                        });
                    }
                });
            }
            
            // ===========================================
            // 2. AISI ИЗ КРОНШТЕЙНОВ
            // ===========================================
            if (item.bracket && item.bracket.type && item.bracket.type !== 'отсутствует' && item.bracket.quantity > 0) {
                const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket.type);
                if (bracket) {
                    const area = bracket.area || 0;
                    const thickness = bracket.thickness || '2мм';
                    const totalQuantity = item.bracket.quantity * productQuantity;
                    
                    const key = `AISI 430 ${thickness}`;
                    
                    if (!aisiFromBrackets[key]) {
                        aisiFromBrackets[key] = {
                            name: key,
                            thickness: thickness,
                            totalArea: 0,
                            details: []
                        };
                    }
                    
                    aisiFromBrackets[key].totalArea += area * totalQuantity;
                    aisiFromBrackets[key].details.push({
                        name: `Кронштейн ${item.bracket.type}`,
                        areaPerUnit: area,
                        quantity: totalQuantity,
                        totalArea: area * totalQuantity
                    });
                }
            }
            
            // ===========================================
            // 3. AISI ИЗ ЛИР
            // ===========================================
            if (item.lyre && item.lyre.type && item.lyre.type !== 'отсутствует' && item.lyre.quantity > 0) {
                const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre.type);
                if (lyre) {
                    const area = lyre.area || 0;
                    const thickness = lyre.thickness || '1.5мм';
                    const totalQuantity = item.lyre.quantity * productQuantity;
                    
                    const key = `AISI 430 ${thickness}`;
                    
                    if (!aisiFromLyres[key]) {
                        aisiFromLyres[key] = {
                            name: key,
                            thickness: thickness,
                            totalArea: 0,
                            details: []
                        };
                    }
                    
                    aisiFromLyres[key].totalArea += area * totalQuantity;
                    aisiFromLyres[key].details.push({
                        name: `Лира ${item.lyre.type}`,
                        areaPerUnit: area,
                        quantity: totalQuantity,
                        totalArea: area * totalQuantity
                    });
                }
            }
            
            // ===========================================
            // 4. ЛИСТОВЫЕ МАТЕРИАЛЫ (не AISI)
            // ===========================================
            const allSheetMaterials = [
                ...this.materialsDB.aluminum,
                ...this.materialsDB.steel,
                ...this.materialsDB.stainless,
                ...this.materialsDB.pvc,
                ...this.materialsDB.polycarbonate,
                ...this.materialsDB.other
            ];
            
            const sheetMatches = allSheetMaterials.filter(m => m.product === productName);
            sheetMatches.forEach(m => {
                // Пропускаем AISI
                if (m.material && m.material.includes('AISI')) return;
                if (m.material && m.material.includes('Нержавейка')) return;
                
                const area = m.area || 0;
                otherSheetMaterials.push({
                    name: m.material || this.getMaterialType(m) || 'Неизвестный материал',
                    thickness: m.thickness || '—',
                    areaPerUnit: area,
                    quantity: productQuantity,
                    totalArea: area * productQuantity
                });
            });
            
            // ===========================================
            // 5. ПРУТКИ
            // ===========================================
            const rodMatches = this.materialsDB.rods.filter(r => r.product === productName);
            rodMatches.forEach(rod => {
                const value = rod.value || 0;
                rods.push({
                    name: rod.rodType || 'Пруток',
                    valuePerUnit: value,
                    unit: rod.unit || 'мм',
                    quantity: productQuantity,
                    totalValue: value * productQuantity
                });
            });
        });
        
        // Преобразуем объекты в массивы
        const aisiProducts = Object.values(aisiFromProducts);
        const aisiBrackets = Object.values(aisiFromBrackets);
        const aisiLyres = Object.values(aisiFromLyres);
        
        return { 
            otherSheetMaterials, 
            profiles, 
            rods, 
            aisiProducts,
            aisiBrackets,
            aisiLyres
        };
    }
    
    getMaterialType(material) {
        if (!material) return 'Неизвестный';
        if (this.materialsDB.aluminum.find(a => a.area === material.area)) return 'Алюминий';
        if (this.materialsDB.steel.find(s => s.area === material.area)) return 'Сталь';
        if (this.materialsDB.stainless.find(s => s.area === material.area)) return 'Нержавейка';
        if (this.materialsDB.pvc.find(p => p.area === material.area)) return 'ПВХ';
        if (this.materialsDB.polycarbonate.find(p => p.area === material.area)) return 'Поликарбонат';
        return 'Листовой материал';
    }
    
    // ============== ФОРМИРОВАНИЕ ОТЧЕТА ==============
    
    formatNumber(value, decimals = 4) {
        if (value === undefined || value === null) return '0';
        return Number(value).toFixed(decimals);
    }
    
    async generateReportHTML(order) {
        const { otherSheetMaterials, profiles, rods, aisiProducts, aisiBrackets, aisiLyres } = this.calculateMaterials(order);
        
        // Отладка
        console.log('=== ОТЛАДКА ОТЧЕТА ===');
        console.log('otherSheetMaterials:', otherSheetMaterials);
        console.log('profiles:', profiles);
        console.log('rods:', rods);
        console.log('aisiProducts:', aisiProducts);
        console.log('aisiBrackets:', aisiBrackets);
        console.log('aisiLyres:', aisiLyres);
        
        if (otherSheetMaterials.length === 0 && profiles.length === 0 && rods.length === 0 && 
            aisiProducts.length === 0 && aisiBrackets.length === 0 && aisiLyres.length === 0) {
            return `
                <div class="materials-report">
                    <h3>📊 Отчет по материалам для заказа №${order.number || 'Без номера'}</h3>
                    <p style="color: #666; text-align: center; padding: 20px;">
                        Нет данных о материалах для данного заказа
                    </p>
                </div>
            `;
        }
        
        let html = `
            <div class="materials-report">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>📊 Отчет по материалам для заказа №${order.number || 'Без номера'}</h3>
                    <button onclick="window.print()" class="btn btn-primary" style="padding: 8px 15px;">
                        🖨️ Печать
                    </button>
                </div>
                <p style="color: #666; margin-bottom: 20px;">
                    Дата: ${order.date ? new Date(order.date).toLocaleDateString('ru-RU') : 'Не указана'}
                </p>
                
                <h4>📦 Состав заказа:</h4>
                <table class="items-table" style="margin-bottom: 20px; width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="padding: 8px; text-align: left;">Изделие</th>
                            <th style="padding: 8px; text-align: left;">Размер</th>
                            <th style="padding: 8px; text-align: left;">Кол-во</th>
                            <th style="padding: 8px; text-align: left;">Кронштейн</th>
                            <th style="padding: 8px; text-align: left;">Лира</th>
                            <th style="padding: 8px; text-align: left;">RAL</th>
                            <th style="padding: 8px; text-align: left;">Текстура</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => {
                            const bracketInfo = item.bracket && item.bracket.type && item.bracket.type !== 'отсутствует' 
                                ? `${item.bracket.type} (${item.bracket.quantity || 1} шт/изд)` 
                                : '🚫 отсутствует';
                            
                            const lyreInfo = item.lyre && item.lyre.type && item.lyre.type !== 'отсутствует' 
                                ? `${item.lyre.type} (${item.lyre.quantity || 1} шт/изд)` 
                                : '🚫 отсутствует';
                            
                            return `
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product || '-'}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.size || '-'}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity || 0}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bracketInfo}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${lyreInfo}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.ral || '-'}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.texture || '-'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
        `;
        
        // ===========================================
        // AISI ИЗ ТЕХКАРТ ИЗДЕЛИЙ
        // ===========================================
        if (aisiProducts.length > 0) {
            html += `
                <h4 style="margin-top: 30px;">🔩 AISI 430 из изделий (расход в м²)</h4>
            `;
            
            aisiProducts.forEach(group => {
                html += `
                    <div style="margin-bottom: 20px;">
                        <h5 style="margin-bottom: 10px;">${group.name}</h5>
                        <table class="materials-table" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f0f0f0;">
                                    <th style="padding: 8px; text-align: left;">Деталь</th>
                                    <th style="padding: 8px; text-align: right;">Расход на 1 шт (м²)</th>
                                    <th style="padding: 8px; text-align: right;">Кол-во</th>
                                    <th style="padding: 8px; text-align: right;">Общий расход (м²)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${group.details.map(detail => {
                                    const valuePerUnit = detail.valuePerUnit || detail.areaPerUnit || 0;
                                    const quantity = detail.quantity || 0;
                                    const totalValue = detail.totalValue || detail.totalArea || 0;
                                    
                                    return `
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${detail.name}</td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatNumber(valuePerUnit)}</td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${quantity}</td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatNumber(totalValue)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                                <tr style="font-weight: bold; background: #e8f4f8;">
                                    <td colspan="3" style="padding: 8px; text-align: right;">ИТОГО ${group.name}:</td>
                                    <td style="padding: 8px; text-align: right;">${this.formatNumber(group.totalArea)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            });
        }
        
        // ===========================================
        // AISI ИЗ КРОНШТЕЙНОВ
        // ===========================================
        if (aisiBrackets.length > 0) {
            html += `
                <h4 style="margin-top: 30px;">🔩 AISI 430 из кронштейнов (расход в м²)</h4>
            `;
            
            aisiBrackets.forEach(group => {
                html += `
                    <div style="margin-bottom: 20px;">
                        <h5 style="margin-bottom: 10px;">${group.name}</h5>
                        <table class="materials-table" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f0f0f0;">
                                    <th style="padding: 8px; text-align: left;">Кронштейн</th>
                                    <th style="padding: 8px; text-align: right;">Расход на 1 шт (м²)</th>
                                    <th style="padding: 8px; text-align: right;">Кол-во</th>
                                    <th style="padding: 8px; text-align: right;">Общий расход (м²)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${group.details.map(detail => {
                                    return `
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${detail.name}</td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatNumber(detail.areaPerUnit)}</td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${detail.quantity}</td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatNumber(detail.totalArea)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                                <tr style="font-weight: bold; background: #e8f4f8;">
                                    <td colspan="3" style="padding: 8px; text-align: right;">ИТОГО ${group.name}:</td>
                                    <td style="padding: 8px; text-align: right;">${this.formatNumber(group.totalArea)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            });
        }
        
        // ===========================================
        // AISI ИЗ ЛИР
        // ===========================================
        if (aisiLyres.length > 0) {
            html += `
                <h4 style="margin-top: 30px;">🔩 AISI 430 из лир (расход в м²)</h4>
            `;
            
            aisiLyres.forEach(group => {
                html += `
                    <div style="margin-bottom: 20px;">
                        <h5 style="margin-bottom: 10px;">${group.name}</h5>
                        <table class="materials-table" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f0f0f0;">
                                    <th style="padding: 8px; text-align: left;">Лира</th>
                                    <th style="padding: 8px; text-align: right;">Расход на 1 шт (м²)</th>
                                    <th style="padding: 8px; text-align: right;">Кол-во</th>
                                    <th style="padding: 8px; text-align: right;">Общий расход (м²)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${group.details.map(detail => {
                                    return `
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${detail.name}</td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatNumber(detail.areaPerUnit)}</td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${detail.quantity}</td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatNumber(detail.totalArea)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                                <tr style="font-weight: bold; background: #e8f4f8;">
                                    <td colspan="3" style="padding: 8px; text-align: right;">ИТОГО ${group.name}:</td>
                                    <td style="padding: 8px; text-align: right;">${this.formatNumber(group.totalArea)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            });
        }
        
        // ===========================================
        // ПРОЧИЕ ЛИСТОВЫЕ МАТЕРИАЛЫ
        // ===========================================
        if (otherSheetMaterials.length > 0) {
            html += `
                <h4 style="margin-top: 30px;">📋 Прочие листовые материалы (расход в м²)</h4>
                <table class="materials-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="padding: 8px; text-align: left;">Материал</th>
                            <th style="padding: 8px; text-align: left;">Толщина</th>
                            <th style="padding: 8px; text-align: right;">Расход на 1 шт (м²)</th>
                            <th style="padding: 8px; text-align: right;">Кол-во</th>
                            <th style="padding: 8px; text-align: right;">Общий расход (м²)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            otherSheetMaterials.forEach(item => {
                html += `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name || 'Неизвестный'}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.thickness || '—'}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatNumber(item.areaPerUnit)}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.quantity || 0}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatNumber(item.totalArea)}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        }
        
        // ===========================================
        // ПРОФИЛИ
        // ===========================================
        if (profiles.length > 0) {
            html += `
                <h4 style="margin-top: 30px;">📏 Профили (расход в мм)</h4>
                <table class="materials-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="padding: 8px; text-align: left;">Профиль</th>
                            <th style="padding: 8px; text-align: right;">Расход на 1 шт (мм)</th>
                            <th style="padding: 8px; text-align: right;">Кол-во</th>
                            <th style="padding: 8px; text-align: right;">Общий расход (мм)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            profiles.forEach(profile => {
                const valuePerUnit = (profile && profile.valuePerUnit !== undefined && profile.valuePerUnit !== null) ? profile.valuePerUnit : 0;
                const totalValue = (profile && profile.totalValue !== undefined && profile.totalValue !== null) ? profile.totalValue : 0;
                const quantity = (profile && profile.quantity !== undefined && profile.quantity !== null) ? profile.quantity : 0;
                const name = (profile && profile.name) ? profile.name : 'Неизвестный профиль';
                
                html += `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${name}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatNumber(valuePerUnit, 0)}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${quantity}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatNumber(totalValue, 0)}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        }
        
        // ===========================================
        // ПРУТКИ
        // ===========================================
        if (rods.length > 0) {
            html += `
                <h4 style="margin-top: 30px;">🔩 Прутки (расход в мм)</h4>
                <table class="materials-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="padding: 8px; text-align: left;">Тип прутка</th>
                            <th style="padding: 8px; text-align: right;">Расход на 1 шт (мм)</th>
                            <th style="padding: 8px; text-align: right;">Кол-во</th>
                            <th style="padding: 8px; text-align: right;">Общий расход (мм)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            rods.forEach(rod => {
                const valuePerUnit = (rod && rod.valuePerUnit !== undefined && rod.valuePerUnit !== null) ? rod.valuePerUnit : 0;
                const totalValue = (rod && rod.totalValue !== undefined && rod.totalValue !== null) ? rod.totalValue : 0;
                const quantity = (rod && rod.quantity !== undefined && rod.quantity !== null) ? rod.quantity : 0;
                const name = (rod && rod.name) ? rod.name : 'Неизвестный пруток';
                
                html += `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${name}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatNumber(valuePerUnit, 0)}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${quantity}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatNumber(totalValue, 0)}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        }
        
        html += `</div>`;
        return html;
    }
}
