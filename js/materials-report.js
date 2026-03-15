// Отчет по материалам
class MaterialsReport {
    constructor() {
        this.materialsDB = {
            // Листовые материалы (в м²)
            aluminum: [],
            steel: [],
            stainless: [],
            pvc: [],
            polycarbonate: [],
            other: [],
            
            // Кронштейны и лиры (в м²)
            brackets: [],
            lyres: [],
            
            // Прутки (в мм)
            rods: [],
            
            // Профили из техкарт изделий (в мм)
            productSpecs: {}
        };
        this.normsLoaded = false;
    }
    
    async loadMaterialsData() {
        console.log('Загрузка данных о материалах...');
        
        try {
            // Загружаем нормы из JSON-файла
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
            // Резервные данные на случай ошибки
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
    // ЭТОТ МЕТОД ДОЛЖЕН БЫТЬ В ФАЙЛЕ!
    
    calculateMaterials(order) {
        const sheetMaterials = []; // листовые материалы (м²)
        const profiles = []; // профили (мм)
        const rods = []; // прутки (мм)
        
        order.items.forEach(item => {
            const productQuantity = item.quantity || 1;
            const productName = item.product;
            const size = item.size;
            
            console.log(`Расчет материалов для ${productName} размер ${size}, кол-во изделий: ${productQuantity}`);
            
            // 1. Листовые материалы
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
                sheetMaterials.push({
                    name: m.material || this.getMaterialType(m),
                    thickness: m.thickness,
                    areaPerUnit: m.area,
                    quantity: productQuantity,
                    totalArea: m.area * productQuantity
                });
            });
            
            // 2. Кронштейн
            if (item.bracket && item.bracket.type && item.bracket.type !== 'отсутствует' && item.bracket.quantity > 0) {
                const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket.type);
                if (bracket) {
                    const bracketTotalQuantity = item.bracket.quantity * productQuantity;
                    sheetMaterials.push({
                        name: `Кронштейн ${item.bracket.type}`,
                        thickness: bracket.thickness || '2мм',
                        areaPerUnit: bracket.area,
                        quantity: bracketTotalQuantity,
                        totalArea: bracket.area * bracketTotalQuantity,
                        perProduct: item.bracket.quantity
                    });
                }
            }
            
            // 3. Лира
            if (item.lyre && item.lyre.type && item.lyre.type !== 'отсутствует' && item.lyre.quantity > 0) {
                const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre.type);
                if (lyre) {
                    const lyreTotalQuantity = item.lyre.quantity * productQuantity;
                    sheetMaterials.push({
                        name: `Лира ${item.lyre.type}`,
                        thickness: lyre.thickness || '1.5мм',
                        areaPerUnit: lyre.area,
                        quantity: lyreTotalQuantity,
                        totalArea: lyre.area * lyreTotalQuantity,
                        perProduct: item.lyre.quantity
                    });
                }
            }
            
            // 4. Прутки
            const rodMatches = this.materialsDB.rods.filter(r => r.product === productName);
            rodMatches.forEach(rod => {
                rods.push({
                    name: rod.rodType,
                    valuePerUnit: rod.value,
                    unit: rod.unit || 'мм',
                    quantity: productQuantity,
                    totalValue: rod.value * productQuantity
                });
            });
            
            // 5. Профили из техкарты
            const productSpec = this.materialsDB.productSpecs[productName];
            if (productSpec && productSpec[size]) {
                const spec = productSpec[size];
                
                Object.entries(spec).forEach(([key, data]) => {
                    profiles.push({
                        name: key,
                        valuePerUnit: data.value,
                        unit: data.unit || 'мм',
                        quantity: productQuantity,
                        totalValue: data.value * productQuantity
                    });
                });
            }
        });
        
        return { sheetMaterials, profiles, rods };
    }
    
    getMaterialType(material) {
        if (this.materialsDB.aluminum.find(a => a.area === material.area)) return 'Алюминий';
        if (this.materialsDB.steel.find(s => s.area === material.area)) return 'Сталь';
        if (this.materialsDB.stainless.find(s => s.area === material.area)) return 'Нержавейка';
        if (this.materialsDB.pvc.find(p => p.area === material.area)) return 'ПВХ';
        if (this.materialsDB.polycarbonate.find(p => p.area === material.area)) return 'Поликарбонат';
        return 'Листовой материал';
    }
    
    // ============== ФОРМИРОВАНИЕ ОТЧЕТА ==============
    
    async generateReportHTML(order) {
        const { sheetMaterials, profiles, rods } = this.calculateMaterials(order);
        
        if (sheetMaterials.length === 0 && profiles.length === 0 && rods.length === 0) {
            return `
                <div class="materials-report">
                    <h3>📊 Отчет по материалам для заказа №${order.number}</h3>
                    <p style="color: #666; text-align: center; padding: 20px;">
                        Нет данных о материалах для данного заказа
                    </p>
                </div>
            `;
        }
        
        let html = `
            <div class="materials-report">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>📊 Отчет по материалам для заказа №${order.number}</h3>
                    <button onclick="window.print()" class="btn btn-primary" style="padding: 8px 15px;">
                        🖨️ Печать
                    </button>
                </div>
                <p style="color: #666; margin-bottom: 20px;">
                    Дата: ${new Date(order.date).toLocaleDateString('ru-RU')}
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
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.size}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
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
        
        // Листовые материалы
        if (sheetMaterials.length > 0) {
            html += `
                <h4 style="margin-top: 30px;">📋 Листовые материалы (расход в м²)</h4>
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
            
            sheetMaterials.forEach(item => {
                html += `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.thickness || '—'}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.areaPerUnit.toFixed(4)}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.quantity}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.totalArea.toFixed(4)}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        }
        
        // Профили
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
                html += `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${profile.name}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${profile.valuePerUnit}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${profile.quantity}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${profile.totalValue}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        }
        
        // Прутки
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
                html += `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rod.name}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${rod.valuePerUnit}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${rod.quantity}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${rod.totalValue}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        }
        
        html += `</div>`;
        return html;
    }
}
