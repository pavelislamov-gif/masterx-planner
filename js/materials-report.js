// js/materials-report.js - ОТЧЕТ ПО МАТЕРИАЛАМ (с группировкой одинаковых материалов)

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
    }
    
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
        
        const groupedSheets = {};
        const profiles = [];
        const rods = [];
        const productSpecs = [];
        
        order.items.forEach(item => {
            if (!item) return;
            
            const productQty = parseInt(item.quantity) || 1;
            const productName = item.product || '';
            const productSize = item.size || 'Стандартный';
            
            const allSheets = [
                ...this.materialsDB.aluminum.map(m => ({ ...m, materialType: 'Алюминий' })),
                ...this.materialsDB.steel.map(m => ({ ...m, materialType: 'Сталь' })),
                ...this.materialsDB.stainless.map(m => ({ ...m, materialType: 'Нержавейка (AISI 430)' })),
                ...this.materialsDB.pvc.map(m => ({ ...m, materialType: 'ПВХ' })),
                ...this.materialsDB.polycarbonate.map(m => ({ ...m, materialType: 'Поликарбонат' })),
                ...this.materialsDB.other.map(m => ({ ...m, materialType: m.material || 'Прочее' }))
            ];
            
            const sheetMatches = allSheets.filter(m => m.product === productName);
            
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
            
            // ============== КРОНШТЕЙНЫ (Нержавейка AISI 430) ==============
            if (item.bracket && item.bracket.type && item.bracket.type !== 'отсутствует' && item.bracket.quantity > 0) {
                const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket.type);
                if (bracket) {
                    const totalQty = item.bracket.quantity * productQty;
                    const area = bracket.area || 0;
                    const materialType = 'Нержавейка (AISI 430)';
                    const thickness = bracket.thickness || '2мм';
                    const key = `${materialType}_${thickness}`;
                    
                    if (!groupedSheets[key]) {
                        groupedSheets[key] = {
                            name: materialType,
                            thickness: thickness,
                            areaPerUnit: area,
                            quantity: 0,
                            totalArea: 0,
                            products: []
                        };
                    }
                    groupedSheets[key].quantity += totalQty;
                    groupedSheets[key].totalArea += area * totalQty;
                    groupedSheets[key].products.push(`Кронштейн ${item.bracket.type}`);
                }
            }
            
            // ============== ЛИРЫ (Нержавейка AISI 430) ==============
            if (item.lyre && item.lyre.type && item.lyre.type !== 'отсутствует' && item.lyre.quantity > 0) {
                const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre.type);
                if (lyre) {
                    const totalQty = item.lyre.quantity * productQty;
                    const area = lyre.area || 0;
                    const materialType = 'Нержавейка (AISI 430)';
                    const thickness = lyre.thickness || '2мм';
                    const key = `${materialType}_${thickness}`;
                    
                    if (!groupedSheets[key]) {
                        groupedSheets[key] = {
                            name: materialType,
                            thickness: thickness,
                            areaPerUnit: area,
                            quantity: 0,
                            totalArea: 0,
                            products: []
                        };
                    }
                    groupedSheets[key].quantity += totalQty;
                    groupedSheets[key].totalArea += area * totalQty;
                    groupedSheets[key].products.push(`Лира ${item.lyre.type}`);
                }
            }
            
            // ============== ПРУТКИ ==============
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
            
            // ============== ПРОФИЛИ ==============
            const productSpec = this.materialsDB.productSpecs[productName];
            
            if (productSpec) {
                let sizeSpec = null;
                let matchedSize = null;
                
                if (productSpec[productSize]) {
                    sizeSpec = productSpec[productSize];
                    matchedSize = productSize;
                } else {
                    const normalizedSize = productSize.replace(/\s+/g, ' ').trim();
                    for (let size in productSpec) {
                        const normalizedKey = size.replace(/\s+/g, ' ').trim();
                        if (normalizedKey === normalizedSize) {
                            sizeSpec = productSpec[size];
                            matchedSize = size;
                            break;
                        }
                    }
                    if (!sizeSpec) {
                        for (let size in productSpec) {
                            if (productSize.includes(size) || size.includes(productSize)) {
                                sizeSpec = productSpec[size];
                                matchedSize = size;
                                break;
                            }
                        }
                    }
                }
                
                if (sizeSpec) {
                    Object.entries(sizeSpec).forEach(([profileName, profileData]) => {
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
                }
            }
        });
        
        const finalSheetMaterials = Object.values(groupedSheets).sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
        
        return { 
            sheetMaterials: finalSheetMaterials, 
            profiles, 
            rods,
            productSpecs
        };
    }
    
    calculateComponents(order) {
        const componentsList = [];
        
        if (!order.components || order.components.length === 0) {
            return componentsList;
        }
        
        const productQty = order.items[0]?.quantity || 1;
        
        const allSheets = [
            ...this.materialsDB.aluminum.map(m => ({ ...m, materialType: 'Алюминий' })),
            ...this.materialsDB.steel.map(m => ({ ...m, materialType: 'Сталь' })),
            ...this.materialsDB.stainless.map(m => ({ ...m, materialType: 'Нержавейка (AISI 430)' })),
            ...this.materialsDB.pvc.map(m => ({ ...m, materialType: 'ПВХ' })),
            ...this.materialsDB.polycarbonate.map(m => ({ ...m, materialType: 'Поликарбонат' })),
            ...this.materialsDB.other.map(m => ({ ...m, materialType: m.material || 'Прочее' }))
        ];
        
        order.components.forEach(comp => {
            const norm = allSheets.find(m => m.product === comp.name);
            
            if (norm) {
                const totalArea = (comp.quantityPerProduct || 0) * (norm.area || 0) * productQty;
                
                componentsList.push({
                    name: comp.name,
                    materialType: norm.materialType,
                    thickness: norm.thickness || '—',
                    areaPerUnit: norm.area || 0,
                    quantityPerProduct: comp.quantityPerProduct,
                    productQty: productQty,
                    totalArea: totalArea
                });
            } else {
                console.warn(`⚠️ Не найдена норма для комплектующей: ${comp.name}`);
            }
        });
        
        return componentsList;
    }
    
    async generateReport(order) {
        return this.generateReportHTML(order);
    }
    
    async generateReportHTML(order) {
        const { sheetMaterials, profiles, rods, productSpecs } = this.calculateMaterials(order);
        const components = this.calculateComponents(order);
        
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
        
        if (sheetMaterials.length === 0 && profiles.length === 0 && rods.length === 0 && components.length === 0) {
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
                                <th>Применение</th>
                             </thead>
                        <tbody>
                            ${sheetMaterials.map(item => `
                                 <tr>
                                    <td><strong>${item.name}</strong></td>
                                    <td>${item.thickness}</td>
                                    <td style="text-align: right;">${fmt(item.areaPerUnit)}</td>
                                    <td style="text-align: right;">${item.quantity}</td>
                                    <td style="text-align: right; color: #4cd964; font-weight: 600;">${fmt(item.totalArea)}</td>
                                    <td style="font-size: 11px; color: #a0a0a0;">${item.products.join(', ')}</td>
                                 </tr>
                            `).join('')}
                        </tbody>
                     </table>
                `;
            }
            
            if (components.length > 0) {
                html += `
                    <h4 style="margin-top: 30px;">🔧 КОМПЛЕКТУЮЩИЕ ДЕТАЛИ</h4>
                    <table class="materials-table">
                        <thead>
                             <tr>
                                <th>Деталь</th>
                                <th>Материал</th>
                                <th>Толщина</th>
                                <th>Норма (м²/шт)</th>
                                <th>Кол-во на 1 изд</th>
                                <th>Кол-во изделий</th>
                                <th>Общий расход (м²)</th>
                             </tr>
                        </thead>
                        <tbody>
                            ${components.map(comp => `
                                 <tr>
                                    <td>${comp.name}</td>
                                    <td>${comp.materialType}</td>
                                    <td>${comp.thickness}</td>
                                    <td style="text-align: right;">${comp.areaPerUnit.toFixed(4)}</td>
                                    <td style="text-align: right;">${comp.quantityPerProduct}</td>
                                    <td style="text-align: right;">${comp.productQty}</td>
                                    <td style="text-align: right;">${comp.totalArea.toFixed(4)}</td>
                                 </tr>
                            `).join('')}
                        </tbody>
                     </table>
                `;
            }
            
            if (profiles.length > 0) {
                html += `
                    <h4 style="margin-top: 30px;">📏 ПРОФИЛИ (расход в мм и метрах)</h4>
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
                                    <td><strong>${profile.name}</strong></td>
                                    <td style="text-align: right;">${profile.lengthPerUnit.toFixed(0)}</td>
                                    <td style="text-align: right;">${profile.quantity}</td>
                                    <td style="text-align: right;">${fmt(profile.totalLength, 0)}</td>
                                    <td style="text-align: right; color: #4cd964;">${(profile.totalLength / 1000).toFixed(2)} м</td>
                                 </tr>
                            `).join('')}
                        </tbody>
                     </table>
                `;
            }
            
            if (rods.length > 0) {
                html += `
                    <h4 style="margin-top: 30px;">🥢 ПРУТКИ (расход в мм и метрах)</h4>
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
                                    <td style="text-align: right; color: #4cd964;">${(rod.totalValue / 1000).toFixed(2)} м</td>
                                 </tr>
                            `).join('')}
                        </tbody>
                     </table>
                `;
            }
            
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

window.MaterialsReport = MaterialsReport;
