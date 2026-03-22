// js/materials-report.js - ПОЛНЫЙ ОТЧЕТ ПО МАТЕРИАЛАМ

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
            productSpecs: {},
            paint: {}
        };
        this.profilesArea = {};
        this.rodsByProduct = {};
        this.materialsNorm = {};
        this.paintingRules = {};
        this.paintConfig = {};
        this.normsLoaded = false;
    }
    
    async loadAllData() {
        console.log('📦 Загрузка всех данных...');
        
        try {
            const normsRes = await fetch('data/norms.json');
            const norms = await normsRes.json();
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
                productSpecs: norms.productSpecs || {},
                paint: norms.paint || {}
            };
            
            const profilesRes = await fetch('data/profilesArea.json');
            if (profilesRes.ok) {
                const profilesData = await profilesRes.json();
                this.profilesArea = profilesData.products || {};
            }
            
            const rodsRes = await fetch('data/rodsByProduct.json');
            if (rodsRes.ok) {
                const rodsData = await rodsRes.json();
                this.rodsByProduct = rodsData.products || {};
            }
            
            const normsNormRes = await fetch('data/materialsNorm.json');
            if (normsNormRes.ok) {
                const normsNormData = await normsNormRes.json();
                this.materialsNorm = normsNormData.products || {};
            }
            
            const rulesRes = await fetch('data/paintingRules.json');
            if (rulesRes.ok) {
                const rulesData = await rulesRes.json();
                this.paintingRules = rulesData.products || {};
            }
            
            const paintRes = await fetch('data/paintCalculation.json');
            if (paintRes.ok) {
                this.paintConfig = await paintRes.json();
            } else {
                this.paintConfig = {
                    lossCoefficients: { flat: 1.10, pipe: 1.30, profile: 1.20 },
                    paintConsumption: { default: 0.165, RAL: {} },
                    roundTo: 0.5
                };
            }
            
            this.normsLoaded = true;
            console.log('✅ Все данные загружены');
            
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
            this.loadFallbackData();
        }
    }
    
    loadFallbackData() {
        console.warn('⚠️ Используются резервные данные');
        this.paintConfig = {
            lossCoefficients: { flat: 1.10, pipe: 1.30, profile: 1.20 },
            paintConsumption: { default: 0.165, RAL: {} },
            roundTo: 0.5
        };
    }
    
    getPaintConsumption(ral) {
        if (!ral) return this.paintConfig.paintConsumption?.default || 0.165;
        const normalizedRal = ral.trim().toUpperCase();
        return this.paintConfig.paintConsumption?.RAL?.[normalizedRal] || 
               this.paintConfig.paintConsumption?.default || 0.165;
    }
    
    shouldPaint(productName, detailType, detailName) {
    // Получаем материал детали
    let material = '';
    
    if (detailType === 'body') {
        const bodyNorm = this.materialsNorm[productName]?.body;
        if (bodyNorm) {
            const found = bodyNorm.find(m => m.material === detailName);
            material = found?.material || '';
        }
    } else if (detailType === 'component') {
        const compNorm = this.materialsNorm[productName]?.components?.[detailName];
        material = compNorm?.material || '';
    } else if (detailType === 'profile') {
        // Профили могут быть из разных материалов, пока пропускаем
        material = '';
    }
    
    // Исключения: ПВХ и поликарбонат НЕ КРАСЯТСЯ
    if (material === 'ПВХ' || material === 'Поликарбонат') {
        return false;
    }
    
    // Остальная логика
    const productRules = this.paintingRules[productName];
    if (!productRules) return false;
    
    if (detailType === 'body') return productRules.body === true;
    if (detailType === 'component') return productRules.components?.[detailName] === true;
    if (detailType === 'profile') return productRules.profiles?.[detailName] === true;
    if (detailType === 'rod') return productRules.rods?.[detailName] === true;
    
    return false;
}
    
    calculateSheetMaterials(order) {
    const productName = order.items[0]?.product || '';
    const productQty = order.items[0]?.quantity || 1;
    const materials = [];
    
    const addMaterial = (materialName, thickness, area) => {
        const existing = materials.find(m => m.material === materialName && m.thickness === thickness);
        if (existing) {
            existing.area += area;
        } else {
            materials.push({
                material: materialName,
                thickness: thickness,
                area: area,
                unit: 'м²'
            });
        }
    };
    
    // КОРПУС — НЕ ДОБАВЛЯЕМ
    
    // 1. КОМПЛЕКТУЮЩИЕ
    const components = order.components || [];
    const componentNorms = this.materialsNorm[productName]?.components || {};
    
    components.forEach(comp => {
        const norm = componentNorms[comp.name];
        if (norm) {
            const area = norm.area * comp.quantityPerProduct * productQty;
            addMaterial(norm.material, norm.thickness, area);
        }
    });
    
    const item = order.items[0];
    
    // 2. КРОНШТЕЙНЫ
    if (item.bracket && item.bracket.type !== 'отсутствует' && item.bracket.quantity > 0) {
        const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket.type);
        if (bracket) {
            const area = bracket.area * item.bracket.quantity;
            let materialName = 'Сталь';
            if (bracket.name.includes('B(T)') || bracket.name.includes('BZ') || bracket.name.includes('AISI')) {
                materialName = 'Нержавеющая сталь AISI 430';
            }
            addMaterial(materialName, bracket.thickness, area);
        }
    }
    
    // 3. ЛИРЫ
    if (item.lyre && item.lyre.type !== 'отсутствует' && item.lyre.quantity > 0) {
        const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre.type);
        if (lyre) {
            const area = lyre.area * item.lyre.quantity;
            addMaterial('Нержавеющая сталь AISI 430', lyre.thickness, area);
        }
    }
    
    return materials;
}
    
    calculateProfiles(order) {
        const productName = order.items[0]?.product || '';
        const productSize = order.items[0]?.size || '';
        const productQty = order.items[0]?.quantity || 1;
        const profiles = [];
        
        const productSpecs = this.materialsDB.productSpecs?.[productName]?.[productSize];
        
        if (productSpecs) {
            for (const [profileName, spec] of Object.entries(productSpecs)) {
                if (spec.value) {
                    profiles.push({
                        name: profileName,
                        length: spec.value * productQty,
                        unit: 'мм'
                    });
                }
            }
        }
        
        return profiles;
    }
    
    calculatePaint(order) {
    const productName = order.items[0]?.product || '';
    const productSize = order.items[0]?.size || '';
    const productQty = order.items[0]?.quantity || 1;
    const ral = order.items[0]?.ral || '';
    
    const consumptionPerM2 = this.getPaintConsumption(ral);
    const lossCoeff = this.paintConfig.lossCoefficients || { flat: 1.10, pipe: 1.30, profile: 1.20 };
    
    let flatArea = 0;
    let profileArea = 0;
    let pipeArea = 0;
    const paintItems = [];
    
    // 1. КОРПУС (body) — по правилам paintingRules
    const bodyNorm = this.materialsNorm[productName]?.body;
    if (bodyNorm) {
        bodyNorm.forEach(material => {
            if (this.shouldPaint(productName, 'body', material.material)) {
                const area = material.area * productQty;
                flatArea += area;
                paintItems.push({
                    name: `Корпус (${material.material})`,
                    type: 'flat',
                    area: area,
                    consumption: area * consumptionPerM2
                });
            }
        });
    }
    
    // 2. КОМПЛЕКТУЮЩИЕ (components) — по правилам paintingRules
    const components = order.components || [];
    const componentNorms = this.materialsNorm[productName]?.components || {};
    
    components.forEach(comp => {
        const norm = componentNorms[comp.name];
        if (norm && this.shouldPaint(productName, 'component', comp.name)) {
            const area = norm.area * comp.quantityPerProduct * productQty;
            flatArea += area;
            paintItems.push({
                name: comp.name,
                type: 'flat',
                area: area,
                consumption: area * consumptionPerM2
            });
        }
    });
    
    const item = order.items[0];
    
    // 3. КРОНШТЕЙНЫ — ВСЕГДА КРАСЯТСЯ (без проверки shouldPaint)
    if (item.bracket && item.bracket.type !== 'отсутствует' && item.bracket.quantity > 0) {
        const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket.type);
        if (bracket) {
            const area = bracket.area * item.bracket.quantity;  // НЕ умножаем на productQty
            flatArea += area;
            paintItems.push({
                name: `Кронштейн ${item.bracket.type}`,
                type: 'flat',
                area: area,
                consumption: area * consumptionPerM2
            });
        }
    }
    
    // 4. ЛИРЫ — ВСЕГДА КРАСЯТСЯ (без проверки shouldPaint)
    if (item.lyre && item.lyre.type !== 'отсутствует' && item.lyre.quantity > 0) {
        const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre.type);
        if (lyre) {
            const area = lyre.area * item.lyre.quantity;  // НЕ умножаем на productQty
            flatArea += area;
            paintItems.push({
                name: `Лира ${item.lyre.type}`,
                type: 'flat',
                area: area,
                consumption: area * consumptionPerM2
            });
        }
    }
    
    // 5. ПРОФИЛИ — по правилам paintingRules
    const profileData = this.profilesArea[productName]?.sizes?.[productSize];
    if (profileData) {
        for (const [profileName, areaPerUnit] of Object.entries(profileData)) {
            if (this.shouldPaint(productName, 'profile', profileName)) {
                const area = areaPerUnit * productQty;
                profileArea += area;
                paintItems.push({
                    name: profileName,
                    type: 'profile',
                    area: area,
                    consumption: area * consumptionPerM2
                });
            }
        }
    }
    
    // 6. ПРУТКИ — по правилам paintingRules
    const rodsData = this.rodsByProduct[productName]?.rods || [];
    rodsData.forEach(rod => {
        if (this.shouldPaint(productName, 'rod', rod.name)) {
            const area = rod.area * productQty;
            pipeArea += area;
            paintItems.push({
                name: rod.name,
                type: 'pipe',
                area: area,
                consumption: area * consumptionPerM2
            });
        }
    });
    
    const totalArea = flatArea + profileArea + pipeArea;
    const totalPureConsumption = totalArea * consumptionPerM2;
    
    const flatWithLoss = flatArea * consumptionPerM2 * lossCoeff.flat;
    const profileWithLoss = profileArea * consumptionPerM2 * lossCoeff.profile;
    const pipeWithLoss = pipeArea * consumptionPerM2 * lossCoeff.pipe;
    const totalWithLoss = flatWithLoss + profileWithLoss + pipeWithLoss;
    
    const roundTo = this.paintConfig.roundTo || 0.5;
    const recommendedOrder = Math.ceil(totalWithLoss / roundTo) * roundTo;
    
    return {
        items: paintItems,
        totalArea: totalArea,
        pureConsumption: totalPureConsumption,
        consumptionWithLoss: totalWithLoss,
        recommendedOrder: recommendedOrder,
        consumptionPerM2: consumptionPerM2,
        ral: ral || 'Не указан',
        lossCoefficients: lossCoeff
    };
}
    
    async generateReport(order) {
        await this.loadAllData();
        return this.generateReportHTML(order);
    }
    
    async generateReportHTML(order) {
        const sheetMaterials = this.calculateSheetMaterials(order);
        const profiles = this.calculateProfiles(order);
        const paint = this.calculatePaint(order);
        
        const fmt = (val, dec = 4) => {
            if (val === undefined || val === null) return '0';
            return Number(val).toFixed(dec);
        };
        
        // Группируем листовые материалы
        const groupedMaterials = {};
        sheetMaterials.forEach(mat => {
            const key = `${mat.material}_${mat.thickness}`;
            if (!groupedMaterials[key]) {
                groupedMaterials[key] = {
                    material: mat.material,
                    thickness: mat.thickness,
                    area: 0
                };
            }
            groupedMaterials[key].area += mat.area;
        });
        
        // Группируем профили
        const groupedProfiles = {};
        profiles.forEach(prof => {
            if (!groupedProfiles[prof.name]) {
                groupedProfiles[prof.name] = 0;
            }
            groupedProfiles[prof.name] += prof.length;
        });
        
        let html = `
            <div class="materials-report">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>📊 Отчет по материалам для заказа №${order.number}</h3>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.print()" class="btn btn-primary">🖨️ Печать</button>
                        <button onclick="closeMaterialsModal()" class="btn btn-secondary">✖ Закрыть</button>
                    </div>
                </div>
                
                <p style="color: #a0a0a0; margin-bottom: 20px;">
                    Дата: ${order.date ? new Date(order.date).toLocaleDateString('ru-RU') : 'Не указана'}
                </p>
                
                <h4>📦 Состав заказа:</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background: #2a2f38;">
                            <th style="padding: 10px; text-align: left;">Изделие</th>
                            <th style="padding: 10px; text-align: left;">Размер</th>
                            <th style="padding: 10px; text-align: left;">Кол-во</th>
                            <th style="padding: 10px; text-align: left;">RAL</th>
                            <th style="padding: 10px; text-align: left;">Текстура</th>
                           </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr style="border-bottom: 1px solid #2a2f38;">
                                <td style="padding: 8px;"><strong>${item.product}</strong></td>
                                <td style="padding: 8px;">${item.size}</td>
                                <td style="padding: 8px;">${item.quantity} шт</td>
                                <td style="padding: 8px;">${item.ral || '-'}</td>
                                <td style="padding: 8px;">${item.texture || '-'}</td>
                              </tr>
                        `).join('')}
                    </tbody>
                  </table>
        `;
        
        // Листовые материалы
        if (Object.keys(groupedMaterials).length > 0) {
            html += `
                <h4 style="margin-top: 30px;">📄 ЛИСТОВЫЕ МАТЕРИАЛЫ</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #2a2f38;">
                            <th style="padding: 10px; text-align: left;">Материал</th>
                            <th style="padding: 10px; text-align: left;">Толщина</th>
                            <th style="padding: 10px; text-align: right;">Площадь (м²)</th>
                          </tr>
                    </thead>
                    <tbody>
                        ${Object.values(groupedMaterials).map(mat => `
                            <tr style="border-bottom: 1px solid #2a2f38;">
                                <td style="padding: 8px;">${mat.material}</td>
                                <td style="padding: 8px;">${mat.thickness}</td>
                                <td style="padding: 8px; text-align: right; color: #4cd964;">${fmt(mat.area, 4)}</td>
                              </tr>
                        `).join('')}
                    </tbody>
                  </table>
            `;
        }
        
        // Профили
        if (Object.keys(groupedProfiles).length > 0) {
            html += `
                <h4 style="margin-top: 30px;">📐 ПРОФИЛИ</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #2a2f38;">
                            <th style="padding: 10px; text-align: left;">Наименование</th>
                            <th style="padding: 10px; text-align: right;">Длина (мм)</th>
                          </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(groupedProfiles).map(([name, length]) => `
                            <tr style="border-bottom: 1px solid #2a2f38;">
                                <td style="padding: 8px;">${name}</td>
                                <td style="padding: 8px; text-align: right; color: #4cd964;">${Math.round(length).toLocaleString()}</td>
                              </tr>
                        `).join('')}
                    </tbody>
                  </table>
            `;
        }
        
        // Краска
        if (paint && paint.items.length > 0) {
            html += `
                <h4 style="margin-top: 30px;">🎨 ПОРОШКОВАЯ КРАСКА (${paint.ral})</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="background: #2a2f38;">
                            <th style="padding: 10px; text-align: left;">Показатель</th>
                            <th style="padding: 10px; text-align: right;">Значение</th>
                          </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #2a2f38;">
                            <td style="padding: 8px;">Площадь окраски</td>
                            <td style="padding: 8px; text-align: right; color: #4cd964;">${fmt(paint.totalArea, 4)} м²</td>
                          </tr>
                        <tr style="border-bottom: 1px solid #2a2f38;">
                            <td style="padding: 8px;">Чистый расход краски</td>
                            <td style="padding: 8px; text-align: right; color: #4cd964;">${fmt(paint.pureConsumption, 3)} кг</td>
                          </tr>
                    </tbody>
                  </table>
                
                <div style="margin-top: 15px; padding: 12px; background: #1e232b; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0;"><strong>📌 С учетом технологических потерь:</strong></p>
                    <ul style="margin: 0; padding-left: 20px; color: #a0a0a0;">
                        <li>Плоские детали: +${Math.round((paint.lossCoefficients.flat - 1) * 100)}%</li>
                        <li>Профили: +${Math.round((paint.lossCoefficients.profile - 1) * 100)}%</li>
                        <li>Трубы: +${Math.round((paint.lossCoefficients.pipe - 1) * 100)}%</li>
                    </ul>
                    <p style="margin: 10px 0 0 0; font-weight: 600; color: #ff9800;">
                        💰 Рекомендуемый заказ краски: <strong>${paint.recommendedOrder} кг</strong>
                    </p>
                </div>
            `;
        }
        
        if (Object.keys(groupedMaterials).length === 0 && Object.keys(groupedProfiles).length === 0 && (!paint || paint.items.length === 0)) {
            html += `
                <div style="text-align: center; padding: 40px; color: #a0a0a0;">
                    <p>📭 Нет данных по материалам для этого заказа</p>
                </div>
            `;
        }
        
        html += `</div>`;
        return html;
    }
}

window.MaterialsReport = MaterialsReport;
