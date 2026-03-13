// Отчет по материалам
class MaterialsReport {
    constructor() {
        this.materialsDB = {
            brackets: [],
            lyres: [],
            productSpecs: {}
        };
    }
    
    async loadMaterialsData() {
        console.log('Загрузка данных о материалах...');
        
        // Загружаем кронштейны и лиры
        this.materialsDB.brackets = await loadBrackets();
        this.materialsDB.lyres = await loadLyres();
        
        // Загружаем все спецификации продуктов
        this.materialsDB.productSpecs = this.loadAllProductSpecs();
        
        console.log('Данные о материалах загружены');
    }
    
    // Загрузка всех спецификаций из техкарт
    loadAllProductSpecs() {
        return {
            // XGRAY v.1 - Тех карта XGRAY v.1.csv
            'XGRAY v.1': {
                '116': {
                    'Профиль МП 1928 XGRAY': { value: 117, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 113, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '216': {
                    'Профиль МП 1928 XGRAY': { value: 217, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 213, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '316': {
                    'Профиль МП 1928 XGRAY': { value: 317, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 313, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '416': {
                    'Профиль МП 1928 XGRAY': { value: 417, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 413, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '516': {
                    'Профиль МП 1928 XGRAY': { value: 517, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 513, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '612': {
                    'Профиль МП 1928 XGRAY': { value: 613, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 609, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '712': {
                    'Профиль МП 1928 XGRAY': { value: 713, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 709, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '812': {
                    'Профиль МП 1928 XGRAY': { value: 813, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 809, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '912': {
                    'Профиль МП 1928 XGRAY': { value: 913, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 909, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 012': {
                    'Профиль МП 1928 XGRAY': { value: 1013, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1009, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 108': {
                    'Профиль МП 1928 XGRAY': { value: 1109, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1105, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 208': {
                    'Профиль МП 1928 XGRAY': { value: 1209, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1205, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 308': {
                    'Профиль МП 1928 XGRAY': { value: 1309, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1305, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 408': {
                    'Профиль МП 1928 XGRAY': { value: 1409, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1405, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 508': {
                    'Профиль МП 1928 XGRAY': { value: 1509, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1505, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                }
            },
            
            // XGRAY v.2 - Тех карта XGRAY v.2.csv
            'XGRAY v.2': {
                '116': {
                    'Профиль МП 1928 XGRAY': { value: 117, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 113, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '216': {
                    'Профиль МП 1928 XGRAY': { value: 217, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 213, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '316': {
                    'Профиль МП 1928 XGRAY': { value: 317, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 313, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '416': {
                    'Профиль МП 1928 XGRAY': { value: 417, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 413, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '516': {
                    'Профиль МП 1928 XGRAY': { value: 517, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 513, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '612': {
                    'Профиль МП 1928 XGRAY': { value: 613, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 609, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '712': {
                    'Профиль МП 1928 XGRAY': { value: 713, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 709, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '812': {
                    'Профиль МП 1928 XGRAY': { value: 813, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 809, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '912': {
                    'Профиль МП 1928 XGRAY': { value: 913, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 909, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 012': {
                    'Профиль МП 1928 XGRAY': { value: 1013, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1009, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 108': {
                    'Профиль МП 1928 XGRAY': { value: 1109, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1105, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 208': {
                    'Профиль МП 1928 XGRAY': { value: 1209, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1205, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 308': {
                    'Профиль МП 1928 XGRAY': { value: 1309, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1305, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 408': {
                    'Профиль МП 1928 XGRAY': { value: 1409, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1405, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 508': {
                    'Профиль МП 1928 XGRAY': { value: 1509, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1505, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                }
            },
            
            // XYELLOW - Тех карта XYELLOW.csv
            'XYELLOW': {
                '116': {
                    'Профиль СЧ 4515 XYELLOW': { value: 117, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 113, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '216': {
                    'Профиль СЧ 4515 XYELLOW': { value: 217, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 213, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '316': {
                    'Профиль СЧ 4515 XYELLOW': { value: 317, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 313, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '416': {
                    'Профиль СЧ 4515 XYELLOW': { value: 417, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 413, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '516': {
                    'Профиль СЧ 4515 XYELLOW': { value: 517, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 513, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '612': {
                    'Профиль СЧ 4515 XYELLOW': { value: 613, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 609, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '712': {
                    'Профиль СЧ 4515 XYELLOW': { value: 713, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 709, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '812': {
                    'Профиль СЧ 4515 XYELLOW': { value: 813, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 809, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '912': {
                    'Профиль СЧ 4515 XYELLOW': { value: 913, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 909, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 012': {
                    'Профиль СЧ 4515 XYELLOW': { value: 1013, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1009, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 108': {
                    'Профиль СЧ 4515 XYELLOW': { value: 1109, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1105, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 208': {
                    'Профиль СЧ 4515 XYELLOW': { value: 1209, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1205, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 308': {
                    'Профиль СЧ 4515 XYELLOW': { value: 1309, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1305, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 408': {
                    'Профиль СЧ 4515 XYELLOW': { value: 1409, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1405, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 508': {
                    'Профиль СЧ 4515 XYELLOW': { value: 1509, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1505, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                }
            }
        };
    }
    
    // Расчет материалов для заказа (только AISI с группировкой по толщине)
    calculateMaterials(order) {
        // Объект для группировки AISI по толщине
        const aisiByThickness = {
            '1мм': { total: 0, items: [] },
            '1.5мм': { total: 0, items: [] },
            '2мм': { total: 0, items: [] },
            '3мм': { total: 0, items: [] }
        };
        
        // Массив для других материалов (не AISI)
        const otherMaterials = [];
        
        order.items.forEach(item => {
            const quantity = item.quantity || 1;
            const productName = item.product;
            const size = item.size;
            
            console.log(`Расчет AISI материалов для ${productName} размер ${size}, кол-во ${quantity}`);
            
            // 1. Обрабатываем кронштейн (AISI)
            if (item.bracket && item.bracket !== 'отсутствует') {
                const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket);
                if (bracket) {
                    const thickness = bracket.thickness || '2мм';
                    const weight = bracket.weight || 0;
                    const totalWeight = weight * quantity;
                    
                    if (aisiByThickness[thickness]) {
                        aisiByThickness[thickness].total += totalWeight;
                        aisiByThickness[thickness].items.push({
                            name: `Кронштейн ${item.bracket}`,
                            thickness: thickness,
                            weight: weight,
                            quantity: quantity,
                            totalWeight: totalWeight
                        });
                    }
                }
            }
            
            // 2. Обрабатываем лиру (AISI)
            if (item.lyre && item.lyre !== 'отсутствует') {
                const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre);
                if (lyre) {
                    const thickness = lyre.thickness || '1.5мм';
                    const weight = lyre.weight || 0;
                    const totalWeight = weight * quantity;
                    
                    if (aisiByThickness[thickness]) {
                        aisiByThickness[thickness].total += totalWeight;
                        aisiByThickness[thickness].items.push({
                            name: `Лира ${item.lyre}`,
                            thickness: thickness,
                            weight: weight,
                            quantity: quantity,
                            totalWeight: totalWeight
                        });
                    }
                }
            }
            
            // 3. Обрабатываем детали из техкарты изделия
            const productSpec = this.materialsDB.productSpecs[productName];
            if (productSpec && productSpec[size]) {
                const spec = productSpec[size];
                
                Object.entries(spec).forEach(([key, data]) => {
                    // Проверяем, что это AISI 430
                    if (data.material === 'AISI 430') {
                        const thickness = data.thickness || '2мм';
                        // Переводим мм в кг (условно, нужно уточнить коэффициент)
                        // Пока используем значение как есть
                        const totalValue = data.value * quantity;
                        
                        if (aisiByThickness[thickness]) {
                            aisiByThickness[thickness].total += totalValue;
                            aisiByThickness[thickness].items.push({
                                name: `${key} (${productName})`,
                                thickness: thickness,
                                value: data.value,
                                unit: data.unit,
                                quantity: quantity,
                                totalValue: totalValue
                            });
                        }
                    } else {
                        // Не AISI материалы
                        otherMaterials.push({
                            name: `${key} (${productName})`,
                            material: data.material || 'Другой',
                            thickness: data.thickness,
                            value: data.value,
                            unit: data.unit || 'мм',
                            quantity: quantity,
                            totalValue: data.value * quantity
                        });
                    }
                });
            }
        });
        
        // Формируем результат: только сгруппированные AISI материалы
        const result = [];
        
        Object.entries(aisiByThickness).forEach(([thickness, data]) => {
            if (data.total > 0) {
                result.push({
                    thickness: thickness,
                    totalWeight: data.total,
                    items: data.items,
                    quantity: order.items.reduce((sum, item) => sum + item.quantity, 0)
                });
            }
        });
        
        return {
            aisi: result,
            other: otherMaterials
        };
    }
    
    // Формирование HTML отчета
    async generateReportHTML(order) {
        const materials = this.calculateMaterials(order);
        
        let html = `
            <div class="materials-report">
                <h3>📊 Отчет по материалам для заказа №${order.number}</h3>
                <p style="color: #666; margin-bottom: 20px;">
                    Дата: ${new Date(order.date).toLocaleDateString('ru-RU')}
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
                                <td>${item.bracket === 'отсутствует' ? '🚫' : item.bracket}</td>
                                <td>${item.lyre === 'отсутствует' ? '🚫' : item.lyre}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <h4>🔩 AISI 430 материалы (сгруппированы по толщине):</h4>
        `;
        
        if (materials.aisi.length === 0) {
            html += `<p style="color: #999;">Нет AISI материалов в заказе</p>`;
        } else {
            materials.aisi.forEach(group => {
                html += `
                    <div style="margin-bottom: 20px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                        <h5 style="margin-bottom: 10px;">Толщина ${group.thickness}</h5>
                        <table class="materials-table">
                            <thead>
                                <tr>
                                    <th>Наименование</th>
                                    <th>Расход на ед. (кг)</th>
                                    <th>Кол-во</th>
                                    <th>Общий вес (кг)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${group.items.map(item => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>${(item.weight || item.value || 0).toFixed(4)}</td>
                                        <td>${item.quantity}</td>
                                        <td>${(item.totalWeight || item.totalValue || 0).toFixed(4)}</td>
                                    </tr>
                                `).join('')}
                                <tr style="font-weight: bold; background: #e8f4f8;">
                                    <td colspan="3">ИТОГО AISI ${group.thickness}:</td>
                                    <td>${group.totalWeight.toFixed(4)} кг</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            });
            
            // Общий итог по всем AISI
            const totalAISI = materials.aisi.reduce((sum, g) => sum + g.totalWeight, 0);
            html += `
                <div style="margin-top: 20px; padding: 15px; background: #d4edda; border-radius: 5px;">
                    <h4 style="margin-bottom: 10px;">📋 Общий расход AISI 430:</h4>
                    <ul style="list-style: none; padding: 0;">
                        ${materials.aisi.map(g => `
                            <li style="margin-bottom: 5px;">
                                <strong>Толщина ${g.thickness}:</strong> ${g.totalWeight.toFixed(4)} кг
                            </li>
                        `).join('')}
                        <li style="margin-top: 10px; font-size: 1.2em; font-weight: bold;">
                            ВСЕГО AISI 430: ${totalAISI.toFixed(4)} кг
                        </li>
                    </ul>
                </div>
            `;
        }
        
        // Другие материалы (если есть)
        if (materials.other && materials.other.length > 0) {
            html += `
                <h4 style="margin-top: 30px;">📦 Прочие материалы:</h4>
                <table class="materials-table">
                    <thead>
                        <tr>
                            <th>Материал</th>
                            <th>Наименование</th>
                            <th>Толщина</th>
                            <th>Расход на ед.</th>
                            <th>Ед.</th>
                            <th>Кол-во</th>
                            <th>Общий расход</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${materials.other.map(item => `
                            <tr>
                                <td>${item.material}</td>
                                <td>${item.name}</td>
                                <td>${item.thickness || '-'}</td>
                                <td>${item.value.toFixed(3)}</td>
                                <td>${item.unit}</td>
                                <td>${item.quantity}</td>
                                <td>${item.totalValue.toFixed(3)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
        
        html += `</div>`;
        return html;
    }
}
