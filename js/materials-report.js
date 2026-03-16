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
        
        const existingBrackets = this.materialsDB.brackets.length > 0 ? [...this.materialsDB.brackets] : null;
        const existingLyres = this.materialsDB.lyres.length > 0 ? [...this.materialsDB.lyres] : null;
        
        console.log('📦 Существующие кронштейны:', existingBrackets?.length || 0);
        
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
            this.materialsDB.rods = norms.rods || [];
            this.materialsDB.productSpecs = norms.productSpecs || {};
            
            this.materialsDB.brackets = existingBrackets || norms.brackets || [];
            this.materialsDB.lyres = existingLyres || norms.lyres || [];
            
            this.normsLoaded = true;
            console.log('✅ Нормы загружены из JSON');
            console.log('📦 Кронштейнов в БД:', this.materialsDB.brackets.length);
            
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
        this.materialsDB.brackets = [
            { name: 'B(T)-15', thickness: '2мм', area: 0.0164 }
        ];
    }
    
    calculateMaterials(order) {
        const otherSheetMaterials = [];
        const profiles = [];
        const rods = [];
        
        const aisi = {
            fromProducts: {},
            fromBrackets: {},
            fromLyres: {}
        };
        
        if (!order || !order.items) {
            return {
                otherSheets: [],
                profiles: [],
                rods: [],
                aisi: {
                    products: [],
                    brackets: [],
                    lyres: []
                }
            };
        }
        
        order.items.forEach(item => {
            const productQty = item.quantity || 1;
            const productName = item.product;
            const size = item.size;
            
            const spec = this.materialsDB.productSpecs[productName]?.[size];
            if (spec) {
                Object.entries(spec).forEach(([key, data]) => {
                    profiles.push({
                        name: key,
                        unit: data.value || 0,
                        unitType: 'мм',
                        qty: productQty,
                        total: (data.value || 0) * productQty
                    });
                });
            }
            
            if (item.bracket?.type && item.bracket.type !== 'отсутствует' && item.bracket.quantity > 0) {
                const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket.type);
                if (bracket) {
                    const thickness = bracket.thickness || '2мм';
                    const area = bracket.area || bracket.weight || 0;
                    const totalQty = item.bracket.quantity * productQty;
                    const totalArea = area * totalQty;
                    
                    const keyName = `AISI 430 ${thickness}`;
                    
                    if (!aisi.fromBrackets[keyName]) {
                        aisi.fromBrackets[keyName] = {
                            name: keyName,
                            thickness: thickness,
                            total: 0,
                            items: []
                        };
                    }
                    
                    aisi.fromBrackets[keyName].total += totalArea;
                    aisi.fromBrackets[keyName].items.push({
                        name: `Кронштейн ${item.bracket.type}`,
                        unit: area,
                        qty: totalQty,
                        total: totalArea
                    });
                }
            }
            
            if (item.lyre?.type && item.lyre.type !== 'отсутствует' && item.lyre.quantity > 0) {
                const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre.type);
                if (lyre) {
                    const thickness = lyre.thickness || '1.5мм';
                    const area = lyre.area || lyre.weight || 0;
                    const totalQty = item.lyre.quantity * productQty;
                    const totalArea = area * totalQty;
                    
                    const keyName = `AISI 430 ${thickness}`;
                    
                    if (!aisi.fromLyres[keyName]) {
                        aisi.fromLyres[keyName] = {
                            name: keyName,
                            thickness: thickness,
                            total: 0,
                            items: []
                        };
                    }
                    
                    aisi.fromLyres[keyName].total += totalArea;
                    aisi.fromLyres[keyName].items.push({
                        name: `Лира ${item.lyre.type}`,
                        unit: area,
                        qty: totalQty,
                        total: totalArea
                    });
                }
            }
            
            const aluMatch = this.materialsDB.aluminum.find(m => m.product === productName);
            if (aluMatch) {
                otherSheetMaterials.push({
                    name: 'Алюминий',
                    thickness: aluMatch.thickness || '—',
                    unit: aluMatch.area || 0,
                    qty: productQty,
                    total: (aluMatch.area || 0) * productQty
                });
            }
            
            const steelMatch = this.materialsDB.steel.find(m => m.product === productName);
            if (steelMatch) {
                otherSheetMaterials.push({
                    name: 'Сталь',
                    thickness: steelMatch.thickness || '—',
                    unit: steelMatch.area || 0,
                    qty: productQty,
                    total: (steelMatch.area || 0) * productQty
                });
            }
            
            const stainlessMatch = this.materialsDB.stainless.find(m => m.product === productName);
            if (stainlessMatch) {
                const thickness = stainlessMatch.thickness || '1мм';
                const area = stainlessMatch.area || 0;
                const totalArea = area * productQty;
                
                const keyName = `AISI 430 ${thickness}`;
                
                if (!aisi.fromProducts[keyName]) {
                    aisi.fromProducts[keyName] = {
                        name: keyName,
                        thickness: thickness,
                        total: 0,
                        items: []
                    };
                }
                
                aisi.fromProducts[keyName].total += totalArea;
                aisi.fromProducts[keyName].items.push({
                    name: `Нержавейка (изделие)`,
                    unit: area,
                    qty: productQty,
                    total: totalArea
                });
            }
            
            const pvcMatch = this.materialsDB.pvc.find(m => m.product === productName);
            if (pvcMatch) {
                otherSheetMaterials.push({
                    name: 'ПВХ',
                    thickness: pvcMatch.thickness || '—',
                    unit: pvcMatch.area || 0,
                    qty: productQty,
                    total: (pvcMatch.area || 0) * productQty
                });
            }
            
            const polyMatch = this.materialsDB.polycarbonate.find(m => m.product === productName);
            if (polyMatch) {
                otherSheetMaterials.push({
                    name: polyMatch.material || 'Поликарбонат',
                    thickness: polyMatch.thickness || '—',
                    unit: polyMatch.area || 0,
                    qty: productQty,
                    total: (polyMatch.area || 0) * productQty
                });
            }
            
            const otherMatch = this.materialsDB.other.find(m => m.product === productName);
            if (otherMatch) {
                otherSheetMaterials.push({
                    name: otherMatch.material || 'Другой материал',
                    thickness: otherMatch.thickness || '—',
                    unit: otherMatch.area || 0,
                    qty: productQty,
                    total: (otherMatch.area || 0) * productQty
                });
            }
            
            const rodMatches = this.materialsDB.rods.filter(r => r.product === productName);
            rodMatches.forEach(rod => {
                rods.push({
                    name: rod.rodType || 'Пруток',
                    unit: rod.value || 0,
                    unitType: rod.unit || 'мм',
                    qty: productQty,
                    total: (rod.value || 0) * productQty
                });
            });
        });
        
        return {
            otherSheets: otherSheetMaterials,
            profiles: profiles,
            rods: rods,
            aisi: {
                products: Object.values(aisi.fromProducts),
                brackets: Object.values(aisi.fromBrackets),
                lyres: Object.values(aisi.fromLyres)
            }
        };
    }
    
    async generateReportHTML(order) {
        const data = this.calculateMaterials(order);
        
        if (data.otherSheets.length === 0 && data.profiles.length === 0 && data.rods.length === 0 &&
            data.aisi.products.length === 0 && data.aisi.brackets.length === 0 && data.aisi.lyres.length === 0) {
            return `
                <div class="materials-report">
                    <h3>📊 Отчет по материалам для заказа №${order.number || 'Без номера'}</h3>
                    <p style="color: #666; text-align: center; padding: 20px;">
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
        
        if (data.aisi.brackets.length > 0) {
            html += `<h4 style="margin-top: 30px;">🔩 Кронштейны из AISI 430</h4>`;
            
            data.aisi.brackets.forEach(group => {
                html += `
                    <table class="materials-table" style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                        <thead>
                            <tr style="background: #f0f0f0;">
                                <th style="padding: 8px; text-align: left;">Кронштейн</th>
                                <th style="padding: 8px; text-align: center;">Материал</th>
                                <th style="padding: 8px; text-align: center;">Толщина</th>
                                <th style="padding: 8px; text-align: right;">Расход на 1 шт (м²)</th>
                                <th style="padding: 8px; text-align: right;">Кол-во</th>
                                <th style="padding: 8px; text-align: right;">Общий расход (м²)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${group.items.map(item => `
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name.replace('Кронштейн ', '')}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">AISI 430</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${group.thickness}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(item.unit)}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.qty}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(item.total)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            });
        }
        
        if (data.otherSheets.length > 0) {
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
            
            data.otherSheets.forEach(item => {
                html += `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.thickness || '—'}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(item.unit)}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.qty}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(item.total)}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        }
        
        if (data.profiles.length > 0) {
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
            
            data.profiles.forEach(profile => {
                html += `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${profile.name}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(profile.unit, 0)}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${profile.qty}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(profile.total, 0)}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        }
        
        if (data.rods.length > 0) {
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
            
            data.rods.forEach(rod => {
                html += `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rod.name}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(rod.unit, 0)}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${rod.qty}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(rod.total, 0)}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        }
        
        html += `</div>`;
        return html;
    }
}
