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
            // 1. Загрузка hardwareNorms.json (кронштейны и лиры)
            const hardwareRes = await fetch('data/hardwareNorms.json');
            if (hardwareRes.ok) {
                const hardwareData = await hardwareRes.json();
                this.materialsDB.brackets = hardwareData.brackets || [];
                this.materialsDB.lyres = hardwareData.lyres || [];
                console.log('✅ Загружены кронштейны и лиры');
            }
            
            // 2. Загрузка norms.json
            const normsRes = await fetch('data/norms.json');
            const norms = await normsRes.json();
            this.materialsDB = {
                ...this.materialsDB,
                aluminum: norms.aluminum || [],
                steel: norms.steel || [],
                stainless: norms.stainless || [],
                pvc: norms.pvc || [],
                polycarbonate: norms.polycarbonate || [],
                other: norms.other || [],
                rods: norms.rods || [],
                productSpecs: norms.productSpecs || {},
                paint: norms.paint || {}
            };
            
            // 3. Загрузка profilesArea.json
            const profilesRes = await fetch('data/profilesArea.json');
            if (profilesRes.ok) {
                const profilesData = await profilesRes.json();
                this.profilesArea = profilesData.products || {};
                console.log('✅ Загружены площади профилей');
            }
            
            // 4. Загрузка rodsByProduct.json
            const rodsRes = await fetch('data/rodsByProduct.json');
            if (rodsRes.ok) {
                const rodsData = await rodsRes.json();
                this.rodsByProduct = rodsData.products || {};
                console.log('✅ Загружены прутки');
            }
            
            // 5. Загрузка materialsNorm.json (корпус и комплектующие)
            const normsNormRes = await fetch('data/materialsNorm.json');
            if (normsNormRes.ok) {
                const normsNormData = await normsNormRes.json();
                this.materialsNorm = normsNormData.products || {};
                console.log('✅ Загружены нормы материалов');
            }
            
            // 6. Загрузка paintingRules.json (правила покраски)
            const rulesRes = await fetch('data/paintingRules.json');
            if (rulesRes.ok) {
                const rulesData = await rulesRes.json();
                this.paintingRules = rulesData.products || {};
                console.log('✅ Загружены правила покраски');
            }
            
            // 7. Загрузка paintCalculation.json (настройки краски)
            const paintRes = await fetch('data/paintCalculation.json');
            if (paintRes.ok) {
                this.paintConfig = await paintRes.json();
                console.log('✅ Загружены настройки краски');
            } else {
                this.paintConfig = {
                    lossCoefficients: { flat: 1.10, pipe: 1.30, profile: 1.20, sheet: 2.0 },
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
            lossCoefficients: { flat: 1.10, pipe: 1.30, profile: 1.20, sheet: 2.0 },
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
    
    // НОВОЕ: обновлённый метод shouldPaint с приоритетом техкарты
    shouldPaint(productName, detailType, detailName) {
        const productRules = this.paintingRules[productName];
        
        // Если нет правил для изделия — по умолчанию НЕ красим
        if (!productRules) return false;
        
        if (detailType === 'body') {
            return productRules.body === true;
        }
        
        if (detailType === 'component') {
            // Проверяем точное совпадение
            if (productRules.components?.[detailName] !== undefined) {
                return productRules.components[detailName] === true;
            }
            // Для компонентов с ПВХ/Поликарбонат/РТИ — НЕ красим
            if (detailName.includes('ПВХ') || detailName.includes('Поликарбонат') || detailName.includes('РТИ')) {
                return false;
            }
            return false;
        }
        
        if (detailType === 'profile') {
            if (productRules.profiles?.[detailName] !== undefined) {
                return productRules.profiles[detailName] === true;
            }
            // Исключения: Модуль НПС 2999 не красится
            if (detailName === 'Модуль НПС 2999') return false;
            return true; // по умолчанию профили красятся
        }
        
        if (detailType === 'rod') {
            if (productRules.rods?.[detailName] !== undefined) {
                return productRules.rods[detailName] === true;
            }
            // Исключения — НЕ красятся
            const noPaintRods = ['Пруток 40мм Д16Т', 'Пруток 70мм Д16Т', 'Пруток Шестигранник Ал 25мм'];
            if (noPaintRods.includes(detailName)) return false;
            return true; // по умолчанию прутки красятся
        }
        
        return false;
    }
    
    // НОВОЕ: метод для проверки покраски листовых материалов
    shouldPaintSheetMaterial(materialName, productName) {
        const productRules = this.paintingRules[productName];
        
        // Поликарбонат, ПВХ, Полистирол — НЕ КРАСЯТСЯ
        const noPaintMaterials = ['Поликарбонат', 'ПВХ', 'Полистирол'];
        for (const noPaint of noPaintMaterials) {
            if (materialName.includes(noPaint)) return false;
        }
        
        // Для Алюминия и Стали проверяем по paintingRules
        if (materialName.includes('Алюминий 2мм')) {
            return productRules?.components?.['Алюминий 2мм'] === true;
        }
        if (materialName.includes('Алюминий 3мм')) {
            return productRules?.components?.['Алюминий 3мм'] === true;
        }
        if (materialName.includes('Алюминий 4мм')) {
            return productRules?.components?.['Алюминий 4мм'] === true;
        }
        if (materialName.includes('Алюминий 8мм')) {
            return productRules?.components?.['Алюминий 8мм'] === true;
        }
        if (materialName.includes('Сталь 0.5мм')) {
            return productRules?.components?.['Сталь 0.5мм'] === true;
        }
        if (materialName.includes('Нержавеющая')) {
            return productRules?.components?.['Нержавеющая сталь AISI 430 1мм'] === true;
        }
        
        // Для остальных материалов (алюминий без указания толщины)
        if (materialName.includes('Алюминий') && !materialName.includes('Нержавеющая')) {
            return productRules?.body === true;
        }
        
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
        
        // 1. АЛЮМИНИЙ
        const aluminumNorm = this.materialsDB.aluminum.find(a => a.product === productName);
        if (aluminumNorm) {
            const area = aluminumNorm.area * productQty;
            const materialName = `Алюминий ${aluminumNorm.thickness}`;
            addMaterial(materialName, aluminumNorm.thickness, area);
        }
        
        // 2. СТАЛЬ
        const steelNorm = this.materialsDB.steel.find(s => s.product === productName);
        if (steelNorm) {
            const area = steelNorm.area * productQty;
            const materialName = `Сталь ${steelNorm.thickness}`;
            addMaterial(materialName, steelNorm.thickness, area);
        }
        
        // 3. НЕРЖАВЕЮЩАЯ СТАЛЬ
        const stainlessNorm = this.materialsDB.stainless.find(s => s.product === productName);
        if (stainlessNorm) {
            const area = stainlessNorm.area * productQty;
            const materialName = `Нержавеющая сталь AISI 430 ${stainlessNorm.thickness}`;
            addMaterial(materialName, stainlessNorm.thickness, area);
        }
        
        // 4. ПВХ
        const pvcNorm = this.materialsDB.pvc.find(p => p.product === productName);
        if (pvcNorm) {
            const area = pvcNorm.area * productQty;
            const materialName = `ПВХ ${pvcNorm.thickness}`;
            addMaterial(materialName, pvcNorm.thickness, area);
        }
        
        // 5. ПОЛИКАРБОНАТ
        const polycarbonateNorm = this.materialsDB.polycarbonate.find(p => p.product === productName);
        if (polycarbonateNorm) {
            const area = polycarbonateNorm.area * productQty;
            const materialName = `Поликарбонат ${polycarbonateNorm.thickness}`;
            addMaterial(materialName, polycarbonateNorm.thickness, area);
        }
        
        // 6. ПРОЧЕЕ
        const otherNorm = this.materialsDB.other.find(o => o.product === productName);
        if (otherNorm) {
            const area = otherNorm.area * productQty;
            const materialName = otherNorm.material ? `${otherNorm.material} ${otherNorm.thickness}` : `Прочее ${otherNorm.thickness}`;
            addMaterial(materialName, otherNorm.thickness, area);
        }
        
        const item = order.items[0];
        
        // 7. КРОНШТЕЙНЫ — из hardwareNorms.json
        if (item.bracket && item.bracket.type !== 'отсутствует' && item.bracket.quantity > 0) {
            const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket.type);
            if (bracket) {
                const area = bracket.area * item.bracket.quantity;
                const materialName = `Нержавеющая сталь AISI 430 ${bracket.thickness}`;
                addMaterial(materialName, bracket.thickness, area);
            }
        }
        
        // 8. ЛИРЫ — из hardwareNorms.json
        if (item.lyre && item.lyre.type !== 'отсутствует' && item.lyre.quantity > 0) {
            const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre.type);
            if (lyre) {
                const area = lyre.area * item.lyre.quantity;
                const materialName = `Нержавеющая сталь AISI 430 ${lyre.thickness}`;
                addMaterial(materialName, lyre.thickness, area);
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
                if (spec && spec.value) {
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
    
    calculateRodsLength(order) {
        const productName = order.items[0]?.product || '';
        const productQty = order.items[0]?.quantity || 1;
        const rods = [];
        
        // НОВОЕ: используем rodsByProduct вместо materialsDB.rods
        const rodsData = this.rodsByProduct[productName]?.rods || [];
        
        rodsData.forEach(rod => {
            rods.push({
                name: rod.name,
                diameter: rod.diameter,
                length: rod.length * productQty,
                area: rod.area * productQty,
                unit: 'мм'
            });
        });
        
        return rods;
    }
    
    // НОВОЕ: полностью переработанный метод calculatePaint
    calculatePaint(order) {
        const productName = order.items[0]?.product || '';
        const productSize = order.items[0]?.size || '';
        const productQty = order.items[0]?.quantity || 1;
        const ral = order.items[0]?.ral || '';
        
        const consumptionPerM2 = this.getPaintConsumption(ral);
        const lossCoeff = this.paintConfig.lossCoefficients || { flat: 1.10, pipe: 1.30, profile: 1.20, sheet: 2.0 };
        
        let flatArea = 0;
        let profileArea = 0;
        let pipeArea = 0;
        const paintItems = [];
        
        // ========== 1. ЛИСТОВЫЕ МАТЕРИАЛЫ ==========
        const sheetMaterials = this.calculateSheetMaterials(order);
        
        for (const material of sheetMaterials) {
            if (this.shouldPaintSheetMaterial(material.material, productName) && material.area > 0) {
                const areaWithLoss = material.area * lossCoeff.sheet;
                flatArea += areaWithLoss;
                paintItems.push({
                    name: `${material.material} (лист)`,
                    type: 'sheet',
                    area: material.area,
                    areaWithLoss: areaWithLoss,
                    consumption: areaWithLoss * consumptionPerM2
                });
            }
        }
        
        // ========== 2. КОРПУС (body) ==========
        const bodyNorm = this.materialsNorm[productName]?.body;
        if (bodyNorm) {
            bodyNorm.forEach(material => {
                if (this.shouldPaint(productName, 'body', '')) {
                    const area = material.area * productQty * lossCoeff.sheet;
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
        
        // ========== 3. КОМПЛЕКТУЮЩИЕ ==========
        const components = order.components || [];
        
        components.forEach(comp => {
            let norm = null;
            const materialType = comp.material;
            
            if (materialType === 'aluminum') {
                norm = this.materialsDB.aluminum.find(a => a.product === productName);
            } else if (materialType === 'steel') {
                norm = this.materialsDB.steel.find(s => s.product === productName);
            } else if (materialType === 'stainless') {
                norm = this.materialsDB.stainless.find(s => s.product === productName);
            } else if (materialType === 'pvc') {
                norm = this.materialsDB.pvc.find(p => p.product === productName);
            } else if (materialType === 'polycarbonate') {
                norm = this.materialsDB.polycarbonate.find(p => p.product === productName);
            } else if (materialType === 'other') {
                norm = this.materialsDB.other.find(o => o.product === productName);
            }
            
            if (norm && this.shouldPaint(productName, 'component', comp.name)) {
                const area = norm.area * comp.quantityPerProduct * productQty * lossCoeff.sheet;
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
        
        // ========== 4. КРОНШТЕЙНЫ — ВСЕГДА КРАСЯТСЯ ==========
        if (item.bracket && item.bracket.type !== 'отсутствует' && item.bracket.quantity > 0) {
            const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket.type);
            if (bracket) {
                const area = bracket.area * item.bracket.quantity * lossCoeff.flat;
                flatArea += area;
                paintItems.push({
                    name: `Кронштейн ${item.bracket.type}`,
                    type: 'flat',
                    area: area,
                    consumption: area * consumptionPerM2
                });
            }
        }
        
        // ========== 5. ЛИРЫ — ВСЕГДА КРАСЯТСЯ ==========
        if (item.lyre && item.lyre.type !== 'отсутствует' && item.lyre.quantity > 0) {
            const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre.type);
            if (lyre) {
                const area = lyre.area * item.lyre.quantity * lossCoeff.flat;
                flatArea += area;
                paintItems.push({
                    name: `Лира ${item.lyre.type}`,
                    type: 'flat',
                    area: area,
                    consumption: area * consumptionPerM2
                });
            }
        }
        
        // ========== 6. ПРОФИЛИ ==========
        const profileData = this.profilesArea[productName]?.sizes?.[productSize];
        if (profileData) {
            for (const [profileName, areaPerUnit] of Object.entries(profileData)) {
                if (this.shouldPaint(productName, 'profile', profileName)) {
                    const area = areaPerUnit * productQty * lossCoeff.profile;
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
        
        // ========== 7. ПРУТКИ ==========
        const rodsData = this.rodsByProduct[productName]?.rods || [];
        rodsData.forEach(rod => {
            if (this.shouldPaint(productName, 'rod', rod.name)) {
                const area = rod.area * productQty * lossCoeff.pipe;
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
        
        const roundTo = this.paintConfig.roundTo || 0.5;
        const recommendedOrder = Math.ceil(totalPureConsumption / roundTo) * roundTo;
        
        return {
            items: paintItems,
            totalArea: totalArea,
            pureConsumption: totalPureConsumption,
            consumptionWithLoss: totalPureConsumption,
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
        const rods = this.calculateRodsLength(order);
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
        
        // Группируем прутки
        const groupedRods = {};
        rods.forEach(rod => {
            if (!groupedRods[rod.name]) {
                groupedRods[rod.name] = {
                    length: 0,
                    diameter: rod.diameter
                };
            }
            groupedRods[rod.name].length += rod.length;
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
        
        // Прутки
        if (Object.keys(groupedRods).length > 0) {
            html += `
                <h4 style="margin-top: 30px;">⚙️ ПРУТКИ</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #2a2f38;">
                            <th style="padding: 10px; text-align: left;">Наименование</th>
                            <th style="padding: 10px; text-align: left;">Диаметр</th>
                            <th style="padding: 10px; text-align: right;">Длина (мм)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(groupedRods).map(([name, data]) => `
                            <tr style="border-bottom: 1px solid #2a2f38;">
                                <td style="padding: 8px;">${name}</td>
                                <td style="padding: 8px;">${data.diameter}</td>
                                <td style="padding: 8px; text-align: right; color: #4cd964;">${Math.round(data.length).toLocaleString()}</td>
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
        
        if (Object.keys(groupedMaterials).length === 0 && Object.keys(groupedProfiles).length === 0 && Object.keys(groupedRods).length === 0 && (!paint || paint.items.length === 0)) {
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
