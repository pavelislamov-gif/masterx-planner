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
            
            // XSMART mini - Тех карта XSMART mini.csv
            'XSMART mini': {
                'XSMART mini 1': { 'Профиль НП 455015': { value: 71, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                'XSMART mini 2': { 'Профиль НП 455015': { value: 91, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                'XSMART mini 3': { 'Профиль НП 455015': { value: 131, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                'XSMART mini 4': { 'Профиль НП 455015': { value: 171, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                'XSMART mini 5': { 'Профиль НП 455015': { value: 206, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                'XSMART mini 6': { 'Профиль НП 455015': { value: 246, unit: 'мм', material: 'Алюминий', thickness: '2мм' } }
            },
            
            // XLUMO Двунаправленный - Тех карта XLUMO Двунаправленный.csv
            'XLUMO Двунаправленный': {
                'XLUMOx2-1': { 'Профиль НПС 3362': { value: 71, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                'XLUMOx2-2': { 'Профиль НПС 3362': { value: 108, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                'XLUMOx2-3': { 'Профиль НПС 3362': { value: 148, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                'XLUMOx2-4': { 'Профиль НПС 3362': { value: 188, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                'XLUMOx2-5': { 'Профиль НПС 3362': { value: 223, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                'XLUMOx2-6': { 'Профиль НПС 3362': { value: 263, unit: 'мм', material: 'Алюминий', thickness: '2мм' } }
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
    
    // Расчет материалов для заказа
    calculateMaterials(order) {
        const materials = [];
        const aisiByThickness = {};
        
        order.items.forEach(item => {
            const quantity = item.quantity || 1;
            const productName = item.product;
            const size = item.size;
            
            console.log(`Расчет материалов для ${productName} размер ${size}, кол-во ${quantity}`);
            
            // 1. Кронштейн (AISI, в кг)
            if (item.bracket && item.bracket !== 'отсутствует') {
                const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket);
                if (bracket) {
                    const thickness = bracket.thickness || '2мм';
                    const key = `AISI 430 ${thickness}`;
                    
                    if (!aisiByThickness[key]) {
                        aisiByThickness[key] = {
                            name: key,
                            material: 'AISI 430',
                            thickness: thickness,
                            totalValue: 0,
                            quantity: 0,
                            unit: 'кг',
                            items: []
                        };
                    }
                    
                    const weight = bracket.weight || 0;
                    aisiByThickness[key].totalValue += weight * quantity;
                    aisiByThickness[key].quantity += quantity;
                    aisiByThickness[key].items.push({
                        name: `Кронштейн ${item.bracket}`,
                        value: weight,
                        quantity: quantity,
                        unit: 'кг'
                    });
                }
            }
            
            // 2. Лира (AISI, в кг)
            if (item.lyre && item.lyre !== 'отсутствует') {
                const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre);
                if (lyre) {
                    const thickness = lyre.thickness || '1.5мм';
                    const key = `AISI 430 ${thickness}`;
                    
                    if (!aisiByThickness[key]) {
                        aisiByThickness[key] = {
                            name: key,
                            material: 'AISI 430',
                            thickness: thickness,
                            totalValue: 0,
                            quantity: 0,
                            unit: 'кг',
                            items: []
                        };
                    }
                    
                    const weight = lyre.weight || 0;
                    aisiByThickness[key].totalValue += weight * quantity;
                    aisiByThickness[key].quantity += quantity;
                    aisiByThickness[key].items.push({
                        name: `Лира ${item.lyre}`,
                        value: weight,
                        quantity: quantity,
                        unit: 'кг'
                    });
                }
            }
            
            // 3. Материалы из техкарты изделия
            const productSpec = this.materialsDB.productSpecs[productName];
            if (productSpec && productSpec[size]) {
                const spec = productSpec[size];
                
                Object.entries(spec).forEach(([key, data]) => {
                    // AISI материалы - в кг (группируем по толщине)
                    if (data.material === 'AISI 430') {
                        const thickness = data.thickness || '2мм';
                        const aisiKey = `AISI 430 ${thickness}`;
                        
                        if (!aisiByThickness[aisiKey]) {
                            aisiByThickness[aisiKey] = {
                                name: aisiKey,
                                material: 'AISI 430',
                                thickness: thickness,
                                totalValue: 0,
                                quantity: 0,
                                unit: 'кг',
                                items: []
                            };
                        }
                        
                        // Переводим мм в кг (условно, нужно уточнить коэффициент)
                        // Пока используем значение как есть
                        aisiByThickness[aisiKey].totalValue += data.value * quantity;
                        aisiByThickness[aisiKey].quantity += quantity;
                        aisiByThickness[aisiKey].items.push({
                            name: `${key} (${productName})`,
                            value: data.value,
                            quantity: quantity,
                            unit: 'мм'
                        });
                    } else {
                        // Другие материалы - в мм
                        materials.push({
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
        
        // Добавляем сгруппированные AISI материалы
        Object.values(aisiByThickness).forEach(aisi => {
            materials.push({
                name: aisi.name,
                material: 'AISI 430',
                thickness: aisi.thickness,
                unit: 'кг',
                value: aisi.totalValue / aisi.quantity,
                quantity: aisi.quantity,
                totalValue: aisi.totalValue,
                items: aisi.items
            });
        });
        
        return materials;
    }
    
    // Формирование HTML отчета
    async generateReportHTML(order) {
        const materials = this.calculateMaterials(order);
        
        if (materials.length === 0) {
            return `
                <div class="materials-report">
                    <h3>📊 Отчет по материалам для заказа №${order.number}</h3>
                    <p style="color: #666; text-align: center; padding: 20px;">
                        Нет данных о материалах для данного заказа
                    </p>
                </div>
            `;
        }
        
        // Группируем материалы по типу
        const byType = {};
        materials.forEach(m => {
            if (!byType[m.material]) byType[m.material] = [];
            byType[m.material].push(m);
        });
        
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
        `;
        
        // Таблица для AISI 430 (кг)
        if (byType['AISI 430'] && byType['AISI 430'].length > 0) {
            html += `
                <h4 style="margin-top: 20px;">🔩 AISI 430:</h4>
                <table class="materials-table">
                    <thead>
                        <tr>
                            <th>Толщина</th>
                            <th>Составляющие</th>
                            <th>Расход на ед. (кг)</th>
                            <th>Кол-во изд.</th>
                            <th>Общий вес (кг)</th>
                        </tr>
                    </thead
