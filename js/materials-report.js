// js/materials-report.js - ОТЧЕТ ПО МАТЕРИАЛАМ (с разделением стали и нержавейки + расчёт краски)

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
            paint: {
                defaultConsumptionPerM2: 0.165,
                unit: "кг",
                roundTo: 0.5,
                lossCoefficients: {
                    flat: 1.10,
                    pipe: 1.30,
                    profile: 1.20
                },
                ralConsumption: {}
            }
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
                productSpecs: norms.productSpecs || {},
                paint: {
                    defaultConsumptionPerM2: norms.paint?.defaultConsumptionPerM2 || 0.165,
                    unit: norms.paint?.unit || "кг",
                    roundTo: norms.paint?.roundTo || 0.5,
                    lossCoefficients: {
                        flat: norms.paint?.lossCoefficients?.flat || 1.10,
                        pipe: norms.paint?.lossCoefficients?.pipe || 1.30,
                        profile: norms.paint?.lossCoefficients?.profile || 1.20
                    },
                    ralConsumption: norms.paint?.ralConsumption || {}
                }
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
    
    // ============== ПОЛУЧЕНИЕ НОРМЫ РАСХОДА КРАСКИ ПО RAL ==============
    getPaintConsumption(ral) {
        if (!ral) return this.materialsDB.paint.defaultConsumptionPerM2;
        const normalizedRal = ral.trim().toUpperCase();
        return this.materialsDB.paint.ralConsumption[normalizedRal] || this.materialsDB.paint.defaultConsumptionPerM2;
    }
    
    // ============== ОПРЕДЕЛЕНИЕ ТИПА ДЕТАЛИ ==============
    getDetailType(detailName, isRod = false, isProfile = false) {
        if (isRod) return 'pipe';
        if (isProfile) return 'profile';
        return 'flat';
    }
    
    // ============== ПРОВЕРКА, КРАСИТСЯ ЛИ ДЕТАЛЬ (по техкарте) ==============
    shouldPaintComponent(componentName, productName) {
        // XGRAY v.1: заглушки красятся
        if (productName === 'XGRAY v.1') {
            if (componentName.includes('Заглушки Алюминиевые')) return true;
        }
        return false;
    }
    
    shouldPaintProfile(profileName, productName) {
        // XGRAY v.1: профили МП 1928 и СЧ 4446 красятся
        if (productName === 'XGRAY v.1') {
            if (profileName.includes('МП 1928') || profileName.includes('СЧ 4446')) return true;
        }
        return false;
    }
    
    shouldPaintRod(rodName, productName) {
        // Трубы СЧ 4435 красятся
        if (rodName.includes('СЧ 4435') || rodName.includes('труба')) return true;
        return false;
    }
    
    shouldPaintBody(productName) {
        // XRAY серии не красятся
        if (productName && productName.toUpperCase().includes('XRAY')) return false;
        return true;
    }
    
    // ============== РАСЧЁТ ПЛОЩАДИ ПРУТКА ==============
    calculateRodArea(rod, totalLength) {
        // Определяем диаметр из названия прутка
        let diameter = 25; // по умолчанию 25мм
        
        const diameterMatch = rod.rodType.match(/(\d+)/);
        if (diameterMatch) {
            diameter = parseInt(diameterMatch[1]);
        }
        
        const diameterM = diameter / 1000;
        const lengthM = totalLength / 1000;
        
        const area = Math.PI * diameterM * lengthM;
        
        return {
            area: area,
            diameter: diameter,
            length: lengthM
        };
    }
    
    // ============== РАСЧЁТ КРАСКИ ==============
    calculatePaint(order, sheetMaterials, profiles, rods) {
        let flatArea = 0;
        let pipeArea = 0;
        let profileArea = 0;
        
        const paintItems = [];
        const productName = order.items[0]?.product || '';
        const productQty = order.items[0]?.quantity || 1;
        const ral = order.items[0]?.ral || '';
        const consumptionPerM2 = this.getPaintConsumption(ral);
        
        // 1. Комплектующие (заглушки и т.д.)
        if (order.components && order.components.length > 0) {
            order.components.forEach(comp => {
                if (this.shouldPaintComponent(comp.name, productName)) {
                    const materialArea = comp.quantityPerProduct * (comp.areaPerUnit || 0.0032) * productQty;
                    const paintArea = materialArea * 2; // две стороны
                    flatArea += paintArea;
                    paintItems.push({
                        name: comp.name,
                        area: paintArea,
                        type: 'flat',
                        consumption: paintArea * consumptionPerM2
                    });
                }
            });
        }
        
        // 2. Кронштейны и лиры (плоские детали)
        const bracketArea = this.calculateBracketArea(order, productQty);
        if (bracketArea > 0) {
            flatArea += bracketArea;
            paintItems.push({
                name: 'Кронштейны и лиры',
                area: bracketArea,
                type: 'flat',
                consumption: bracketArea * consumptionPerM2
            });
        }
        
        // 3. Корпус (если красится)
        if (this.shouldPaintBody(productName)) {
            // Ищем площадь корпуса в листовых материалах
            let bodyArea = 0;
            sheetMaterials.forEach(sheet => {
                if (sheet.name === 'Алюминий' && sheet.products.includes(productName)) {
                    bodyArea = sheet.totalArea;
                }
            });
            if (bodyArea > 0) {
                const paintArea = bodyArea * 2; // две стороны
                flatArea += paintArea;
                paintItems.push({
                    name: 'Корпус',
                    area: paintArea,
                    type: 'flat',
                    consumption: paintArea * consumptionPerM2
                });
            }
        }
        
        // 4. Профили
        if (profiles && profiles.length > 0) {
            profiles.forEach(profile => {
                if (this.shouldPaintProfile(profile.name, productName)) {
                    const perimeter = 0.2; // 200 мм (сечение 50×50)
                    const lengthM = profile.totalLength / 1000;
                    const paintArea = lengthM * perimeter;
                    profileArea += paintArea;
                    paintItems.push({
                        name: profile.name,
                        area: paintArea,
                        type: 'profile',
                        consumption: paintArea * consumptionPerM2
                    });
                }
            });
        }
        
        // 5. Прутки (трубы)
        if (rods && rods.length > 0) {
            rods.forEach(rod => {
                if (this.shouldPaintRod(rod.rodType, productName)) {
                    const surface = this.calculateRodArea(rod, rod.totalValue);
                    pipeArea += surface.area;
                    paintItems.push({
                        name: rod.rodType,
                        area: surface.area,
                        type: 'pipe',
                        diameter: surface.diameter,
                        length: surface.length,
                        consumption: surface.area * consumptionPerM2
                    });
                }
            });
        }
        
        // Расчёт с учётом коэффициентов потерь
        const flatLoss = this.materialsDB.paint.lossCoefficients.flat;
        const pipeLoss = this.materialsDB.paint.lossCoefficients.pipe;
        const profileLoss = this.materialsDB.paint.lossCoefficients.profile;
        
        const flatPureConsumption = flatArea * consumptionPerM2;
        const pipePureConsumption = pipeArea * consumptionPerM2;
        const profilePureConsumption = profileArea * consumptionPerM2;
        
        const flatConsumption = flatPureConsumption * flatLoss;
        const pipeConsumption = pipePureConsumption * pipeLoss;
        const profileConsumption = profilePureConsumption * profileLoss;
        
        const totalArea = flatArea + pipeArea + profileArea;
        const totalPureConsumption = flatPureConsumption + pipePureConsumption + profilePureConsumption;
        const totalWithLoss = flatConsumption + pipeConsumption + profileConsumption;
        
        const roundTo = this.materialsDB.paint.roundTo;
        const recommendedOrder = Math.ceil(totalWithLoss / roundTo) * roundTo;
        
        return {
            items: paintItems,
            flatArea: flatArea,
            pipeArea: pipeArea,
            profileArea: profileArea,
            totalArea: totalArea,
            flatPureConsumption: flatPureConsumption,
            pipePureConsumption: pipePureConsumption,
            profilePureConsumption: profilePureConsumption,
            pureConsumption: totalPureConsumption,
            consumptionWithLoss: totalWithLoss,
            recommendedOrder: recommendedOrder,
            consumptionPerM2: consumptionPerM2,
            ral: ral || 'Не указан',
            unit: this.materialsDB.paint.unit,
            flatLoss: flatLoss,
            pipeLoss: pipeLoss,
            profileLoss: profileLoss
        };
    }
    
    calculateBracketArea(order, productQty) {
        let totalArea = 0;
        const item = order.items[0];
        
        if (item.bracket && item.bracket.type && item.bracket.type !== 'отсутствует' && item.bracket.quantity > 0) {
            const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket.type);
            if (bracket) {
                const totalQty = item.bracket.quantity;
                const area = bracket.area || 0;
                totalArea += area * totalQty * 2; // две стороны
            }
        }
        
        if (item.lyre && item.lyre.type && item.lyre.type !== 'отсутствует' && item.lyre.quantity > 0) {
            const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre.type);
            if (lyre) {
                const totalQty = item.lyre.quantity;
                const area = lyre.area || 0;
                totalArea += area * totalQty * 2; // две стороны
            }
        }
        
        return totalArea;
    }
    
    calculateMaterials(order) {
        if (!order || !order.items || !Array.isArray(order.items)) {
            console.warn('Некорректный заказ:', order);
            return { 
                sheetMaterials: [], 
                profiles: [], 
                rods: [],
                productSpecs: [],
                paint: null
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
            
            // ============== ЛИСТОВЫЕ МАТЕРИАЛЫ ==============
            // Алюминий
            this.materialsDB.aluminum.forEach(m => {
                if (m.product === productName) {
                    const key = `Алюминий_${m.thickness}`;
                    if (!groupedSheets[key]) {
                        groupedSheets[key] = {
                            name: 'Алюминий',
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
                }
            });
            
            // Обычная сталь (steel)
            this.materialsDB.steel.forEach(m => {
                if (m.product === productName) {
                    const key = `Сталь_${m.thickness}`;
                    if (!groupedSheets[key]) {
                        groupedSheets[key] = {
                            name: 'Сталь',
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
                }
            });
            
            // Нержавеющая сталь AISI 430 (stainless)
            this.materialsDB.stainless.forEach(m => {
                if (m.product === productName) {
                    const key = `Нержавеющая сталь AISI 430_${m.thickness}`;
                    if (!groupedSheets[key]) {
                        groupedSheets[key] = {
                            name: 'Нержавеющая сталь AISI 430',
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
                }
            });
            
            // ПВХ
            this.materialsDB.pvc.forEach(m => {
                if (m.product === productName) {
                    const key = `ПВХ_${m.thickness}`;
                    if (!groupedSheets[key]) {
                        groupedSheets[key] = {
                            name: 'ПВХ',
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
                }
            });
            
            // Поликарбонат
            this.materialsDB.polycarbonate.forEach(m => {
                if (m.product === productName) {
                    const key = `Поликарбонат_${m.thickness}`;
                    if (!groupedSheets[key]) {
                        groupedSheets[key] = {
                            name: 'Поликарбонат',
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
                }
            });
            
            // Прочие материалы (other)
            this.materialsDB.other.forEach(m => {
                if (m.product === productName) {
                    const key = `${m.material || 'Прочее'}_${m.thickness}`;
                    if (!groupedSheets[key]) {
                        groupedSheets[key] = {
                            name: m.material || 'Прочее',
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
                }
            });
            
            // ============== КРОНШТЕЙНЫ ==============
            if (item.bracket && item.bracket.type && item.bracket.type !== 'отсутствует' && item.bracket.quantity > 0) {
                const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket.type);
                if (bracket) {
                    const totalQty = item.bracket.quantity;
                    const area = bracket.area || 0;
                    const materialType = 'Нержавеющая сталь AISI 430';
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
            
            // ============== ЛИРЫ ==============
            if (item.lyre && item.lyre.type && item.lyre.type !== 'отсутствует' && item.lyre.quantity > 0) {
                const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre.type);
                if (lyre) {
                    const totalQty = item.lyre.quantity;
                    const area = lyre.area || 0;
                    const materialType = 'Нержавеющая сталь AISI 430';
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
                const totalValue = (rod.value || 0) * productQty;
                
                if (existingRod) {
                    existingRod.totalValue += totalValue;
                    existingRod.quantity += productQty;
                } else {
                    rods.push({
                        rodType: rod.rodType || 'Пруток',
                        valuePerUnit: rod.value || 0,
                        unit: rod.unit || 'мм',
                        quantity: productQty,
                        totalValue: totalValue
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
                        const totalLength = (value || 0) * productQty;
                        
                        const existingProfile = profiles.find(p => p.name === profileName);
                        if (existingProfile) {
                            existingProfile.totalLength += totalLength;
                            existingProfile.quantity += productQty;
                        } else {
                            profiles.push({
                                name: profileName,
                                lengthPerUnit: value || 0,
                                unit: unit,
                                quantity: productQty,
                                totalLength: totalLength
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
        
        // Расчёт краски
        const paint = this.calculatePaint(order, finalSheetMaterials, profiles, rods);
        
        return { 
            sheetMaterials: finalSheetMaterials, 
            profiles, 
            rods,
            productSpecs,
            paint: paint
        };
    }
    
    calculateComponents(order) {
        const componentsList = [];
        
        if (!order.components || order.components.length === 0) {
            return componentsList;
        }
        
        const productQty = order.items[0]?.quantity || 1;
        
        order.components.forEach(comp => {
            let norm = null;
            
            norm = this.materialsDB.aluminum.find(m => m.product === comp.name);
            if (norm) {
                componentsList.push({
                    name: comp.name,
                    materialType: 'Алюминий',
                    thickness: norm.thickness || '—',
                    areaPerUnit: norm.area || 0,
                    quantityPerProduct: comp.quantityPerProduct,
                    productQty: productQty,
                    totalArea: (comp.quantityPerProduct || 0) * (norm.area || 0) * productQty,
                    areaPerUnitPaint: norm.area || 0
                });
                return;
            }
            
            norm = this.materialsDB.steel.find(m => m.product === comp.name);
            if (norm) {
                componentsList.push({
                    name: comp.name,
                    materialType: 'Сталь',
                    thickness: norm.thickness || '—',
                    areaPerUnit: norm.area || 0,
                    quantityPerProduct: comp.quantityPerProduct,
                    productQty: productQty,
                    totalArea: (comp.quantityPerProduct || 0) * (norm.area || 0) * productQty,
                    areaPerUnitPaint: norm.area || 0
                });
                return;
            }
            
            norm = this.materialsDB.stainless.find(m => m.product === comp.name);
            if (norm) {
                componentsList.push({
                    name: comp.name,
                    materialType: 'Нержавеющая сталь AISI 430',
                    thickness: norm.thickness || '—',
                    areaPerUnit: norm.area || 0,
                    quantityPerProduct: comp.quantityPerProduct,
                    productQty: productQty,
                    totalArea: (comp.quantityPerProduct || 0) * (norm.area || 0) * productQty,
                    areaPerUnitPaint: norm.area || 0
                });
                return;
            }
            
            norm = this.materialsDB.pvc.find(m => m.product === comp.name);
            if (norm) {
                componentsList.push({
                    name: comp.name,
                    materialType: 'ПВХ',
                    thickness: norm.thickness || '—',
                    areaPerUnit: norm.area || 0,
                    quantityPerProduct: comp.quantityPerProduct,
                    productQty: productQty,
                    totalArea: (comp.quantityPerProduct || 0) * (norm.area || 0) * productQty,
                    areaPerUnitPaint: norm.area || 0
                });
                return;
            }
            
            norm = this.materialsDB.polycarbonate.find(m => m.product === comp.name);
            if (norm) {
                componentsList.push({
                    name: comp.name,
                    materialType: 'Поликарбонат',
                    thickness: norm.thickness || '—',
                    areaPerUnit: norm.area || 0,
                    quantityPerProduct: comp.quantityPerProduct,
                    productQty: productQty,
                    totalArea: (comp.quantityPerProduct || 0) * (norm.area || 0) * productQty,
                    areaPerUnitPaint: norm.area || 0
                });
                return;
            }
            
            console.warn(`⚠️ Не найдена норма для комплектующей: ${comp.name}`);
        });
        
        return componentsList;
    }
    
    async generateReport(order) {
        return this.generateReportHTML(order);
    }
    
    async generateReportHTML(order) {
        const { sheetMaterials, profiles, rods, productSpecs, paint } = this.calculateMaterials(order);
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
                         <tr
                            <th>Изделие</th>
                            <th>Размер</th>
                            <th>Кол-во</th>
                            <th>Кронштейн</th>
                            <th>Лира</th>
                            <th>RAL</th>
                            <th>Текстура</th>
                         </tr
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                             <tr
                                 <td<strong>${item.product}</strong></td
                                 <td${item.size}</td
                                 <td${item.quantity}</td
                                 <td${item.bracket.type} (${item.bracket.quantity} шт)</td
                                 <td${item.lyre.type} (${item.lyre.quantity} шт)</td
                                 <td${item.ral || '-'}</td
                                 <td${item.texture || '-'}</td
                             </tr
                        `).join('')}
                    </tbody>
                 </table
            `;
            
            // Листовые материалы
            if (sheetMaterials.length > 0) {
                html += `
                    <h4 style="margin-top: 30px;">📋 Листовые материалы (расход в м²)</h4>
                    <table class="materials-table">
                        <thead>
                             <tr
                                <th>Материал</th>
                                <th>Толщина</th>
                                <th>Расход на 1 шт (м²)</th>
                                <th>Кол-во</th>
                                <th>Общий расход (м²)</th>
                                <th>Применение</th>
                             </tr
                        </thead>
                        <tbody>
                            ${sheetMaterials.map(item => `
                                 <tr
                                     <td<strong>${item.name}</strong></td
                                     <td${item.thickness}</td
                                    <td style="text-align: right;">${fmt(item.areaPerUnit)}</td
                                    <td style="text-align: right;">${item.quantity}</td
                                    <td style="text-align: right; color: #4cd964; font-weight: 600;">${fmt(item.totalArea)}</td
                                    <td style="font-size: 11px; color: #a0a0a0;">${item.products.join(', ')}</td
                                 </tr
                            `).join('')}
                        </tbody>
                    </table
                `;
            }
            
            // Комплектующие
            if (components.length > 0) {
                html += `
                    <h4 style="margin-top: 30px;">🔧 КОМПЛЕКТУЮЩИЕ ДЕТАЛИ</h4>
                    <table class="materials-table">
                        <thead>
                             <tr
                                <th>Деталь</th>
                                <th>Материал</th>
                                <th>Толщина</th>
                                <th>Норма (м²/шт)</th>
                                <th>Кол-во на 1 изд</th>
                                <th>Кол-во изделий</th>
                                <th>Общий расход (м²)</th>
                             </tr
                        </thead>
                        <tbody>
                            ${components.map(comp => `
                                 <tr
                                     <td${comp.name}</td
                                     <td${comp.materialType}</td
                                     <td${comp.thickness}</td
                                    <td style="text-align: right;">${comp.areaPerUnit.toFixed(4)}</td
                                    <td style="text-align: right;">${comp.quantityPerProduct}</td
                                    <td style="text-align: right;">${comp.productQty}</td
                                    <td style="text-align: right;">${comp.totalArea.toFixed(4)}</td
                                 </tr
                            `).join('')}
                        </tbody>
                    </table
                `;
            }
            
            // Профили
            if (profiles.length > 0) {
                html += `
                    <h4 style="margin-top: 30px;">📏 ПРОФИЛИ (расход в мм и метрах)</h4>
                    <table class="materials-table">
                        <thead>
                             <tr
                                <th>Профиль</th>
                                <th>Расход на 1 шт (мм)</th>
                                <th>Кол-во</th>
                                <th>Общий расход (мм)</th>
                                <th>Общий расход (м)</th>
                             </tr
                        </thead>
                        <tbody>
                            ${profiles.map(profile => `
                                 <tr
                                     <td<strong>${profile.name}</strong></td
                                    <td style="text-align: right;">${profile.lengthPerUnit.toFixed(0)}</td
                                    <td style="text-align: right;">${profile.quantity}</td
                                    <td style="text-align: right;">${fmt(profile.totalLength, 0)}</td
                                    <td style="text-align: right; color: #4cd964;">${(profile.totalLength / 1000).toFixed(2)} м</td
                                 </tr
                            `).join('')}
                        </tbody>
                    </table
                `;
            }
            
            // Прутки
            if (rods.length > 0) {
                html += `
                    <h4 style="margin-top: 30px;">🥢 ПРУТКИ (расход в мм и метрах)</h4>
                    <table class="materials-table">
                        <thead>
                             <tr
                                <th>Тип прутка</th>
                                <th>Расход на 1 шт (мм)</th>
                                <th>Кол-во</th>
                                <th>Общий расход (мм)</th>
                                <th>Общий расход (м)</th>
                             </tr
                        </thead>
                        <tbody>
                            ${rods.map(rod => `
                                 <tr
                                     <td${rod.rodType}</td
                                    <td style="text-align: right;">${rod.valuePerUnit}</td
                                    <td style="text-align: right;">${rod.quantity}</td
                                    <td style="text-align: right;">${fmt(rod.totalValue, 0)}</td
                                    <td style="text-align: right; color: #4cd964;">${(rod.totalValue / 1000).toFixed(2)} м</td
                                 </tr
                            `).join('')}
                        </tbody>
                    </table
                `;
            }
            
            // ============== ПОРОШКОВАЯ КРАСКА ==============
            if (paint && paint.items && paint.items.length > 0) {
                html += `
                    <h4 style="margin-top: 30px;">🎨 ПОРОШКОВАЯ КРАСКА (${paint.ral})</h4>
                    <table class="materials-table">
                        <thead>
                             <tr
                                <th>Деталь</th>
                                <th>Тип</th>
                                <th>Площадь (м²)</th>
                                <th>Норма (кг/м²)</th>
                                <th>Расход (кг)</th>
                             </tr
                        </thead>
                        <tbody>
                            ${paint.items.map(item => {
                                let typeIcon = '';
                                if (item.type === 'pipe') typeIcon = '🔴 Труба';
                                else if (item.type === 'profile') typeIcon = '📐 Профиль';
                                else typeIcon = '⬜ Плоская';
                                return `
                                 <tr
                                     <td${item.name}</td
                                    <td${typeIcon}</td
                                    <td style="text-align: right;">${fmt(item.area, 4)}</td
                                    <td style="text-align: right;">${paint.consumptionPerM2}</td
                                    <td style="text-align: right; color: #4cd964;">${fmt(item.consumption, 3)}</td
                                 </tr
                                `;
                            }).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="background: #1e232b;">
                                <td colspan="2" style="text-align: right;"><strong>ИТОГО:</strong></td
                                <td style="text-align: right;"><strong>${fmt(paint.totalArea, 4)}</strong> м²</td
                                <td style="text-align: right;"><strong>${paint.consumptionPerM2}</strong> кг/м²</td
                                <td style="text-align: right; color: #4cd964;"><strong>${fmt(paint.pureConsumption, 3)}</strong> кг</td
                             </tr
                        </tfoot>
                     </table
                     
                     <div style="margin-top: 15px; padding: 12px; background: #1e232b; border-radius: 8px;">
                        <p style="margin: 0 0 8px 0;"><strong>📌 С учетом технологических потерь:</strong></p>
                        <ul style="margin: 0; padding-left: 20px; color: #a0a0a0;">
                            ${paint.flatArea > 0 ? `<li>Плоские детали: +${Math.round((paint.flatLoss - 1) * 100)}% (${fmt(paint.flatPureConsumption * (paint.flatLoss - 1), 3)} кг)</li>` : ''}
                            ${paint.profileArea > 0 ? `<li>Профили: +${Math.round((paint.profileLoss - 1) * 100)}% (${fmt(paint.profilePureConsumption * (paint.profileLoss - 1), 3)} кг)</li>` : ''}
                            ${paint.pipeArea > 0 ? `<li>Трубы: +${Math.round((paint.pipeLoss - 1) * 100)}% (${fmt(paint.pipePureConsumption * (paint.pipeLoss - 1), 3)} кг)</li>` : ''}
                        </ul>
                        <p style="margin: 10px 0 0 0; font-weight: 600; color: #ff9800;">
                            💰 Рекомендуемый заказ краски: <strong>${paint.recommendedOrder} ${paint.unit}</strong>
                            ${paint.recommendedOrder > paint.consumptionWithLoss ? `(с запасом ${Math.round((paint.recommendedOrder / paint.consumptionWithLoss - 1) * 100)}%)` : ''}
                        </p>
                     </div>
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
