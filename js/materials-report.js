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
            this.loadFallbackData();
        }
    }
    
    loadFallbackData() {
        console.warn('⚠️ Используются резервные данные');
        
        // Алюминий
        this.materialsDB.aluminum = [
            { product: 'XGRAY v.1', thickness: '3мм', area: 0.0032 },
            { product: 'XGRAY v.2', thickness: '3мм', area: 0.0032 },
            { product: 'ACENTO 3T', thickness: '3мм', area: 0.0033 },
            { product: 'ACENTO 4', thickness: '4мм', area: 0.0064 }
        ];
        
        // Сталь
        this.materialsDB.steel = [
            { product: 'ACENTO 3T', thickness: '0.5мм', area: 0.0033 },
            { product: 'ACENTO 4', thickness: '0.5мм', area: 0.0064 }
        ];
        
        // Нержавейка
        this.materialsDB.stainless = [
            { product: 'XGRAY v.1', thickness: '1мм', area: 0.0002 },
            { product: 'XGRAY v.2', thickness: '1мм', area: 0.0002 }
        ];
        
        // Кронштейны
        this.materialsDB.brackets = [
            { name: 'B(T)-15', thickness: '2мм', area: 0.0164 },
            { name: 'PU-5', thickness: '2мм', area: 0.01 }
        ];
        
        // Лиры
        this.materialsDB.lyres = [
            { name: '(L-серия) лира', thickness: '1.5мм', area: 0.0024 }
        ];
    }
    
    // Расчет материалов для заказа
    calculateMaterials(order) {
        const sheetMaterials = [];
        const profiles = [];
        const rods = [];
        
        order.items.forEach(item => {
            const productQty = item.quantity || 1;
            const productName = item.product;
            
            // 1. Листовые материалы (алюминий, сталь и т.д.)
            const allSheets = [
                ...this.materialsDB.aluminum,
                ...this.materialsDB.steel,
                ...this.materialsDB.stainless,
                ...this.materialsDB.pvc,
                ...this.materialsDB.polycarbonate,
                ...this.materialsDB.other
            ];
            
            const sheetMatches = allSheets.filter(m => m.product === productName);
            sheetMatches.forEach(m => {
                sheetMaterials.push({
                    name: m.material || this.getMaterialType(m),
                    thickness: m.thickness || '—',
                    areaPerUnit: m.area || 0,
                    quantity: productQty,
                    totalArea: (m.area || 0) * productQty
                });
            });
            
            // 2. Кронштейн
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
                        totalArea: area * totalQty
                    });
                }
            }
            
            // 3. Лира
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
                        totalArea: area * totalQty
                    });
                }
            }
            
            // 4. Профили из техкарты (здесь можно добавить специфичные для изделия)
            // Например, для XRAY 6-T2 BZ 220
            if (productName.includes('XRAY 6-T2')) {
                profiles.push({
                    name: 'СЧ 4435 труба',
                    lengthPerUnit: 223,
                    quantity: productQty,
                    totalLength: 223 * productQty
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
    
    // Формирование HTML отчета
    async generateReportHTML(order) {
        const { sheetMaterials, profiles, rods } = this.calculateMaterials(order);
        
        if (sheetMaterials.length === 0 && profiles.length === 0 && rods.length === 0) {
            return `
                <div class="materials-report">
                    <h3>📊 Отчет по материалам для заказа №${order.number}</h3>
                    <p style="color: #a0a0a0; text-align: center; padding: 20px;">
                        Нет данных о материалах для данного заказа
                    </p>
                </div>
            `;
        }
        
        const fmt = (val, dec = 4) => {
            if (val === undefined || val === null) return '0';
            return Number(val).toFixed(dec);
        };
        
        let html = `
            <div class="materials-report">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>📊 Отчет по материалам для заказа №${order.number}</h3>
                    <button onclick="window.print()" class="btn btn-primary" style="padding: 8px 15px;">
                        🖨️ Печать
                    </button>
                </div>
                <p style="color: #a0a0a0; margin-bottom: 20px;">
                    Дата: ${order.date ? new Date(order.date).toLocaleDateString('ru-RU') : 'Не указана'}
                </p>
                
                <h4>📦 Состав заказа:</h4>
                <table class="items-table" style="margin-bottom: 20px;">
                    <thead>
                        <tr>
                            <th>Изделие</th>
                            <th>Размер</th>
                            <th>Кол-во</th>
                            <th>Кронштейн</th>
                            <th>Лира</th>
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
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
        `;
        
        // Листовые материалы
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
            `;
            
            sheetMaterials.forEach(item => {
                html += `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.thickness}</td>
                        <td style="text-align: right;">${fmt(item.areaPerUnit)}</td>
                        <td style="text-align: right;">${item.quantity}</td>
                        <td style="text-align: right;">${fmt(item.totalArea)}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        }
        
        // Профили
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
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            profiles.forEach(profile => {
                html += `
                    <tr>
                        <td>${profile.name}</td>
                        <td style="text-align: right;">${profile.lengthPerUnit}</td>
                        <td style="text-align: right;">${profile.quantity}</td>
                        <td style="text-align: right;">${profile.totalLength}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        }
        
        html += `</div>`;
        return html;
    }
}
