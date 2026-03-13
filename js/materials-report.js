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
            
            // Профили из техкарт изделий (в мм)
            productSpecs: {}
        };
    }
    
    async loadMaterialsData() {
        console.log('Загрузка данных о материалах...');
        
        // Загружаем листовые материалы
        this.materialsDB.aluminum = this.loadAluminumData();
        this.materialsDB.steel = this.loadSteelData();
        this.materialsDB.stainless = this.loadStainlessData();
        this.materialsDB.pvc = this.loadPVCData();
        this.materialsDB.polycarbonate = this.loadPolycarbonateData();
        this.materialsDB.other = this.loadOtherData();
        
        // Загружаем кронштейны и лиры
        this.materialsDB.brackets = await loadBrackets();
        this.materialsDB.lyres = await loadLyres();
        
        // Загружаем все спецификации продуктов (профили в мм)
        this.materialsDB.productSpecs = this.loadAllProductSpecs();
        
        console.log('Данные о материалах загружены');
    }
    
    // ============== ЛИСТОВЫЕ МАТЕРИАЛЫ (в м²) ==============
    
    loadAluminumData() {
        return [
            { product: 'XGRAY v.1', thickness: '3мм', area: 0.0032 },
            { product: 'XGRAY v.2', thickness: '3мм', area: 0.0032 },
            { product: 'ACENTO 3T', thickness: '3мм', area: 0.0033 },
            { product: 'ACENTO 4', thickness: '4мм', area: 0.0064 },
            { product: 'XBAR-SW', thickness: '3мм', area: 0.0001 },
            { product: 'XEYES 130*120 1', thickness: '2мм', area: 0.044 },
            { product: 'XEYES 130*120 2', thickness: '2мм', area: 0.044 },
            { product: 'XEYES mini-1', thickness: '3мм', area: 0.0092 },
            { product: 'XEYES mini-1', thickness: '4мм', area: 0.0044 },
            { product: 'XFOCUS', thickness: '3мм', area: 0.0006 },
            { product: 'XGIRO', thickness: '3мм', area: 0.002 },
            { product: 'XGLOW', thickness: '8мм', area: 0.0007 },
            { product: 'XLITE', thickness: '3мм', area: 0.006 },
            { product: 'XLUMO', thickness: '3мм', area: 0.006 },
            { product: 'XLUMO 1-6', thickness: '3мм', area: 0.006 },
            { product: 'XLUMO Двунаправленный', thickness: '3мм', area: 0.008 },
            { product: 'XLUMO PROV', thickness: '3мм', area: 0.006 },
            { product: 'XMODULE-2x2', thickness: '1.5мм', area: 0.0086 },
            { product: 'XMODULE-2x2', thickness: '3мм', area: 0.0048 },
            { product: 'XMODULE-6x2', thickness: '1.5мм', area: 0.019 },
            { product: 'XPIXEL OVHD', thickness: '1мм', area: 0.0011 },
            { product: 'XRAY 12S', thickness: '4мм', area: 0.0094 },
            { product: 'XRAY 18S', thickness: '4мм', area: 0.012 },
            { product: 'XRAY 36S', thickness: '8мм', area: 0.023 },
            { product: 'XRAY 6-T2 BT 180', thickness: '3мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BT 200', thickness: '3мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BT 220', thickness: '3мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BT 220 Шторка х2', thickness: '3мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BT 240 Шторка', thickness: '3мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BZ 240 Шторка х2', thickness: '3мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BZ 180', thickness: '3мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BZ 200 Шторка', thickness: '3мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BZ 220', thickness: '3мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BZ 220 Шторка х2', thickness: '3мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BZ 240 Шторка', thickness: '3мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BZ 240 Шторка х2', thickness: '3мм', area: 0.0033 },
            { product: 'XRAY 6T Накладной', thickness: '3мм', area: 0.0072 },
            { product: 'XRAY 6T BZ 120', thickness: '3мм', area: 0.0072 },
            { product: 'XRAY 6T BT 140 Шторка', thickness: '3мм', area: 0.0072 },
            { product: 'XRAY 6T RGBW BT 150', thickness: '3мм', area: 0.0072 },
            { product: 'XRAY 9S', thickness: '3мм', area: 0.0069 },
            { product: 'XROLL-lite P', thickness: '3мм', area: 0.0036 },
            { product: 'XROLL-lite K', thickness: '3мм', area: 0.0036 },
            { product: 'XSLOPE', thickness: '4мм', area: 0.0001 },
            { product: 'XSMART', thickness: '3мм', area: 0.01 },
            { product: 'XSMART MINI', thickness: '3мм', area: 0.005 },
            { product: 'XSTRONG', thickness: '3мм', area: 0.0012 },
            { product: 'XYELLOW', thickness: '3мм', area: 0.004 },
            { product: 'XEYES 130*90 1', thickness: '2мм', area: 0.044 },
            { product: 'XEYES 130*90 2', thickness: '2мм', area: 0.044 },
            { product: 'XEYES 130*90 3', thickness: '2мм', area: 0.044 },
            { product: 'XEYES 130*90 4', thickness: '2мм', area: 0.044 },
            { product: 'XEYES 130*120 3', thickness: '2мм', area: 0.044 },
            { product: 'XEYES 130*120 4', thickness: '2мм', area: 0.044 },
            { product: 'XGRAY v.2', thickness: '3мм', area: 0.0032 },
            { product: 'XLINE', thickness: '4мм', area: 0.008 }
        ];
    }
    
    loadSteelData() {
        return [
            { product: 'ACENTO 3T', thickness: '0.5мм', area: 0.0033 },
            { product: 'ACENTO 4', thickness: '0.5мм', area: 0.0064 },
            { product: 'XRAY 12S', thickness: '0.5мм', area: 0.01 },
            { product: 'XRAY 18', thickness: '0.5мм', area: 0.01 },
            { product: 'XRAY 18S', thickness: '0.5мм', area: 0.013 },
            { product: 'XRAY 36', thickness: '0.5мм', area: 0.02 },
            { product: 'XRAY 36S', thickness: '0.5мм', area: 0.02 },
            { product: 'XRAY 6', thickness: '0.5мм', area: 0.0022 },
            { product: 'XRAY 6 RGBW', thickness: '0.5мм', area: 0.0022 },
            { product: 'XRAY 6-T2 BT 180', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BT 200', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BT 220', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BT 220 Шторка х2', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BT 240 Шторка', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BZ 240 Шторка х2', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BZ 180', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BZ 200 Шторка', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BZ 220', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BZ 220 Шторка х2', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BZ 240 Шторка', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 6-T2 BZ 240 Шторка х2', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 6T Накладной', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 6T BZ 120', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 6T BT 140 Шторка', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 6T RGBW BT 150', thickness: '0.5мм', area: 0.0033 },
            { product: 'XRAY 9S', thickness: '0.5мм', area: 0.0083 }
        ];
    }
    
    loadStainlessData() {
        return [
            { product: 'XGRAY v.1', thickness: '1мм', area: 0.0002 },
            { product: 'XGRAY v.2', thickness: '1мм', area: 0.0002 },
            { product: 'XSLOPE', thickness: '1мм', area: 0.0002 },
            { product: 'XYELLOW', thickness: '1мм', area: 0.0002 }
        ];
    }
    
    loadPVCData() {
        return [
            { product: 'XDISK', thickness: '10мм', area: 0.0003 },
            { product: 'XBAR-SW', thickness: '3мм', area: 0.0005 },
            { product: 'XFOCUS', thickness: '3мм', area: 0.003 },
            { product: 'XGIRO', thickness: '3мм', area: 0.0004 },
            { product: 'XLITE', thickness: '3мм', area: 0.0005 },
            { product: 'XLUMO', thickness: '3мм', area: 0.003 },
            { product: 'XLUMO 1-6', thickness: '3мм', area: 0.003 },
            { product: 'XLUMO Двунаправленный', thickness: '3мм', area: 0.0044 },
            { product: 'XLUMO PROV', thickness: '3мм', area: 0.003 },
            { product: 'XSMART', thickness: '3мм', area: 0.003 },
            { product: 'XSMART mini', thickness: '3мм', area: 0.0007 }
        ];
    }
    
    loadPolycarbonateData() {
        return [
            { product: 'XEYES 130*120 1', material: 'Поликарбонат 3мм', thickness: '3мм', area: 0.001 },
            { product: 'XEYES 130*120 2', material: 'Поликарбонат 3мм', thickness: '3мм', area: 0.002 },
            { product: 'XEYES 130*120 3', material: 'Поликарбонат 3мм', thickness: '3мм', area: 0.003 },
            { product: 'XEYES 130*120 4', material: 'Поликарбонат 3мм', thickness: '3мм', area: 0.004 },
            { product: 'XEYES 130*90 1', material: 'Поликарбонат 3мм', thickness: '3мм', area: 0.001 },
            { product: 'XEYES 130*90 2', material: 'Поликарбонат 3мм', thickness: '3мм', area: 0.002 },
            { product: 'XEYES 130*90 3', material: 'Поликарбонат 3мм', thickness: '3мм', area: 0.003 },
            { product: 'XEYES 130*90 4', material: 'Поликарбонат 3мм', thickness: '3мм', area: 0.004 },
            { product: 'XRAY 3', material: 'Поликарбонат 6мм', thickness: '6мм', area: 0.0016 },
            { product: 'XRAY 3-2', material: 'Поликарбонат 6мм', thickness: '6мм', area: 0.0032 },
            { product: 'XRAY 9', material: 'Поликарбонат 6мм', thickness: '6мм', area: 0.0076 }
        ];
    }
    
    loadOtherData() {
        return [
            { product: 'XPIXEL BIN v.1', material: 'Оргстекло опал 30%', thickness: '2мм', area: 0.004 },
            { product: 'XPIXEL BIN v.2', material: 'Оргстекло опал 30%', thickness: '2мм', area: 0.004 },
            { product: 'XPIXEL BIN v.3', material: 'Оргстекло опал 30%', thickness: '2мм', area: 0.004 },
            { product: 'XSPOT', material: 'Полистирол Черный', thickness: '2мм', area: 0.001 }
        ];
    }
    
    // ============== ПРОФИЛИ ИЗ ТЕХКАРТ (в мм) ==============
    
    loadAllProductSpecs() {
        return {
            'XGRAY v.1': {
                '116': {
                    'Профиль МП 1928 XGRAY': { value: 117, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 113, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                }
                // Здесь будут все размеры для XGRAY v.1
            }
            // Здесь будут все остальные изделия
        };
    }
    
    // ============== РАСЧЕТ МАТЕРИАЛОВ ==============
    
    calculateMaterials(order) {
        const sheetMaterials = []; // листовые материалы (м²)
        const profiles = []; // профили (мм)
        
        order.items.forEach(item => {
            const quantity = item.quantity || 1;
            const productName = item.product;
            const size = item.size;
            
            // 1. Листовые материалы (алюминий, сталь, нержавейка, ПВХ, поликарбонат)
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
                    quantity: quantity,
                    totalArea: m.area * quantity
                });
            });
            
            // 2. Кронштейн (если выбран)
            if (item.bracket && item.bracket !== 'отсутствует') {
                const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket);
                if (bracket) {
                    sheetMaterials.push({
                        name: `Кронштейн ${item.bracket}`,
                        thickness: bracket.thickness || '2мм',
                        areaPerUnit: bracket.area || bracket.weight, // предполагаем, что в loadBrackets() уже м²
                        quantity: quantity,
                        totalArea: (bracket.area || bracket.weight) * quantity
                    });
                }
            }
            
            // 3. Лира (если выбрана)
            if (item.lyre && item.lyre !== 'отсутствует') {
                const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre);
                if (lyre) {
                    sheetMaterials.push({
                        name: `Лира ${item.lyre}`,
                        thickness: lyre.thickness || '1.5мм',
                        areaPerUnit: lyre.area || lyre.weight, // предполагаем, что в loadLyres() уже м²
                        quantity: quantity,
                        totalArea: (lyre.area || lyre.weight) * quantity
                    });
                }
            }
            
            // 4. Профили из техкарты изделия
            const productSpec = this.materialsDB.productSpecs[productName];
            if (productSpec && productSpec[size]) {
                const spec = productSpec[size];
                
                Object.entries(spec).forEach(([key, data]) => {
                    profiles.push({
                        name: key,
                        valuePerUnit: data.value,
                        unit: data.unit || 'мм',
                        quantity: quantity,
                        totalValue: data.value * quantity
                    });
                });
            }
        });
        
        return { sheetMaterials, profiles };
    }
    
    getMaterialType(material) {
        if (material.area === this.materialsDB.aluminum.find(a => a.area === material.area)) return 'Алюминий';
        if (material.area === this.materialsDB.steel.find(s => s.area === material.area)) return 'Сталь';
        if (material.area === this.materialsDB.stainless.find(s => s.area === material.area)) return 'Нержавейка';
        if (material.area === this.materialsDB.pvc.find(p => p.area === material.area)) return 'ПВХ';
        if (material.area === this.materialsDB.polycarbonate.find(p => p.area === material.area)) return 'Поликарбонат';
        return 'Листовой материал';
    }
    
    // ============== ФОРМИРОВАНИЕ ОТЧЕТА ==============
    
    async generateReportHTML(order) {
        const { sheetMaterials, profiles } = this.calculateMaterials(order);
        
        if (sheetMaterials.length === 0 && profiles.length === 0) {
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
                <h3>📊 Отчет по материалам для заказа №${order.number}</h3>
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
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.size}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.bracket === 'отсутствует' ? '🚫' : item.bracket}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.lyre === 'отсутствует' ? '🚫' : item.lyre}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
        `;
        
        // Листовые материалы (м²)
        if (sheetMaterials.length > 0) {
            // Группируем по типу материала
            const grouped = {};
            sheetMaterials.forEach(m => {
                const key = `${m.name} ${m.thickness}`;
                if (!grouped[key]) {
                    grouped[key] = {
                        name: m.name,
                        thickness: m.thickness,
                        totalArea: 0,
                        items: []
                    };
                }
                grouped[key].totalArea += m.totalArea;
                grouped[key].items.push(m);
            });
            
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
            
            Object.values(grouped).forEach(group => {
                group.items.forEach(item => {
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
            });
            
            html += `</tbody></table>`;
        }
        
        // Профили (мм)
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
        
        html += `</div>`;
        return html;
    }
}
