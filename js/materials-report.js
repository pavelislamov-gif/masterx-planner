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
            
            // XSMART - Тех карта XSMART.csv
            'XSMART': {
                'XSMART-2': {
                    'КП 453785': { value: 91, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'КП 453784': { value: 82, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                'XSMART-3': {
                    'КП 453785': { value: 131, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'КП 453784': { value: 122, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                'XSMART-4': {
                    'КП 453785': { value: 171, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'КП 453784': { value: 162, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                'XSMART-5': {
                    'КП 453785': { value: 206, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'КП 453784': { value: 197, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                'XSMART-6': {
                    'КП 453785': { value: 246, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'КП 453784': { value: 237, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '500': {
                    'КП 453785': { value: 500, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'КП 453784': { value: 500, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1000': {
                    'КП 453785': { value: 1000, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'КП 453784': { value: 1000, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1500': {
                    'КП 453785': { value: 1500, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'КП 453784': { value: 1500, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                }
            },
            
            // XLUMO 1-6 - Тех карта XLUMO 1-6.csv
            'XLUMO 1-6': {
                'XLUMO-1': { 'Профиль НПС 2967 (XLUMO)': { value: 71, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                'XLUMO-2': { 'Профиль НПС 2967 (XLUMO)': { value: 108, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                'XLUMO-3': { 'Профиль НПС 2967 (XLUMO)': { value: 148, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                'XLUMO-4': { 'Профиль НПС 2967 (XLUMO)': { value: 188, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                'XLUMO-5': { 'Профиль НПС 2967 (XLUMO)': { value: 223, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                'XLUMO-6': { 'Профиль НПС 2967 (XLUMO)': { value: 263, unit: 'мм', material: 'Алюминий', thickness: '2мм' } }
            },
            
            // XGIRO - Тех карта XGIRO.csv
            'XGIRO': {
                '130': { 'Профиль МП 0923-081': { value: 130, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '220': { 'Профиль МП 0923-081': { value: 220, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '310': { 'Профиль МП 0923-081': { value: 310, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '410': { 'Профиль МП 0923-081': { value: 410, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '510': { 'Профиль МП 0923-081': { value: 510, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '600': { 'Профиль МП 0923-081': { value: 600, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '700': { 'Профиль МП 0923-081': { value: 700, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '800': { 'Профиль МП 0923-081': { value: 800, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '900': { 'Профиль МП 0923-081': { value: 900, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '1000': { 'Профиль МП 0923-081': { value: 1000, unit: 'мм', material: 'Алюминий', thickness: '2мм' } }
            },
            
            // XVISION - Тех карта XVISION.csv
            'XVISION': {
                '110': { 'КП 453849': { value: 103, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '125': { 'КП 453849': { value: 118, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '210': { 'КП 453849': { value: 203, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '250': { 'КП 453849': { value: 243, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '310': { 'КП 453849': { value: 303, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '375': { 'КП 453849': { value: 368, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '410': { 'КП 453849': { value: 403, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '500': { 'КП 453849': { value: 493, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '510': { 'КП 453849': { value: 503, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '600': { 'КП 453849': { value: 593, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '625': { 'КП 453849': { value: 618, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '700': { 'КП 453849': { value: 693, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '750': { 'КП 453849': { value: 743, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '800': { 'КП 453849': { value: 793, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '875': { 'КП 453849': { value: 868, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '900': { 'КП 453849': { value: 893, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '1000': { 'КП 453849': { value: 993, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '1125': { 'КП 453849': { value: 1138, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '1250': { 'КП 453849': { value: 1243, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '1375': { 'КП 453849': { value: 1368, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '1500': { 'КП 453849': { value: 1493, unit: 'мм', material: 'AISI 430', thickness: '2мм' } }
            },
            
            // XBAR-SW - Тех карта XBAR-SW.csv
            'XBAR-SW': {
                '1000': { 'КП 453054': { value: 998, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                '1500': { 'КП 453054': { value: 1498, unit: 'мм', material: 'AISI 430', thickness: '2мм' } }
            },
            
            // XLITE - Тех карта XLITE.csv
            'XLITE': {
                '125': { 'Профиль НПС 2966': { value: 125, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '250': { 'Профиль НПС 2966': { value: 250, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '375': { 'Профиль НПС 2966': { value: 375, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '500': { 'Профиль НПС 2966': { value: 500, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '625': { 'Профиль НПС 2966': { value: 625, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '750': { 'Профиль НПС 2966': { value: 750, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '875': { 'Профиль НПС 2966': { value: 875, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '1000': { 'Профиль НПС 2966': { value: 1000, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '1125': { 'Профиль НПС 2966': { value: 1125, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '1250': { 'Профиль НПС 2966': { value: 1250, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '1375': { 'Профиль НПС 2966': { value: 1375, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '1500': { 'Профиль НПС 2966': { value: 1500, unit: 'мм', material: 'Алюминий', thickness: '2мм' } }
            },
            
            // XROLL-lite P - Тех карта XROLL-lite P.csv
            'XROLL-lite P': {
                '205': {
                    'Профиль поликарбонатный XROLL-lite': { value: 208, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 210, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '305': {
                    'Профиль поликарбонатный XROLL-lite': { value: 308, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 310, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '405': {
                    'Профиль поликарбонатный XROLL-lite': { value: 408, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 410, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '505': {
                    'Профиль поликарбонатный XROLL-lite': { value: 508, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 510, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '600': {
                    'Профиль поликарбонатный XROLL-lite': { value: 603, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 605, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '700': {
                    'Профиль поликарбонатный XROLL-lite': { value: 703, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 705, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '800': {
                    'Профиль поликарбонатный XROLL-lite': { value: 803, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 805, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '900': {
                    'Профиль поликарбонатный XROLL-lite': { value: 903, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 905, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1000': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1003, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 1005, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1100': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1103, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 1105, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1200': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1203, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 1205, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1300': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1303, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 1305, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1400': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1403, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 1405, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1496': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1499, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 1501, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                }
            },
            
            // XROLL-lite K - Тех карта XROLL-lite K.csv
            'XROLL-lite K': {
                '205': {
                    'Профиль поликарбонатный XROLL-lite': { value: 208, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '305': {
                    'Профиль поликарбонатный XROLL-lite': { value: 308, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '405': {
                    'Профиль поликарбонатный XROLL-lite': { value: 408, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '505': {
                    'Профиль поликарбонатный XROLL-lite': { value: 508, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '600': {
                    'Профиль поликарбонатный XROLL-lite': { value: 603, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '700': {
                    'Профиль поликарбонатный XROLL-lite': { value: 703, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '800': {
                    'Профиль поликарбонатный XROLL-lite': { value: 803, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '900': {
                    'Профиль поликарбонатный XROLL-lite': { value: 903, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1000': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1003, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1100': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1103, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1200': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1203, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1300': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1303, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1400': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1403, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1496': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1499, unit: 'мм', material: 'Поликарбонат', thickness: '3мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                }
            },
            
            // XLUMO - Тех карта XLUMO.csv
            'XLUMO': {
                '125': { 'Профиль НПС 2967 (XLUMO)': { value: 125, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '250': { 'Профиль НПС 2967 (XLUMO)': { value: 250, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '375': { 'Профиль НПС 2967 (XLUMO)': { value: 375, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '625': { 'Профиль НПС 2967 (XLUMO)': { value: 625, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '750': { 'Профиль НПС 2967 (XLUMO)': { value: 750, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '875': { 'Профиль НПС 2967 (XLUMO)': { value: 875, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '1125': { 'Профиль НПС 2967 (XLUMO)': { value: 1125, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '1250': { 'Профиль НПС 2967 (XLUMO)': { value: 1250, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '1375': { 'Профиль НПС 2967 (XLUMO)': { value: 1375, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '1500': { 'Профиль НПС 2967 (XLUMO)': { value: 1500, unit: 'мм', material: 'Алюминий', thickness: '2мм' } }
            },
            
            // XLUMO PROV - Тех карта XLUMO PROV.csv
            'XLUMO PROV': {
                '125': { 'Профиль НПС 2967 (XLUMO)': { value: 125, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '250': { 'Профиль НПС 2967 (XLUMO)': { value: 250, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '375': { 'Профиль НПС 2967 (XLUMO)': { value: 375, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '500': { 'Профиль НПС 2967 (XLUMO)': { value: 500, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '625': { 'Профиль НПС 2967 (XLUMO)': { value: 625, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '750': { 'Профиль НПС 2967 (XLUMO)': { value: 750, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '875': { 'Профиль НПС 2967 (XLUMO)': { value: 875, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '1000': { 'Профиль НПС 2967 (XLUMO)': { value: 1000, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '1125': { 'Профиль НПС 2967 (XLUMO)': { value: 1125, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '1250': { 'Профиль НПС 2967 (XLUMO)': { value: 1250, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '1375': { 'Профиль НПС 2967 (XLUMO)': { value: 1375, unit: 'мм', material: 'Алюминий', thickness: '2мм' } },
                '1500': { 'Профиль НПС 2967 (XLUMO)': { value: 1500, unit: 'мм', material: 'Алюминий', thickness: '2мм' } }
            },
            
            // XSTRONG - Тех карта XSTRONG.csv
            'XSTRONG': {
                'XSTRONG-10': { 'ТПК 004S': { value: 204, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                'XSTRONG-20': { 'ТПК 004S': { value: 344, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                'XSTRONG-30': { 'ТПК 004S': { value: 444, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                'XSTRONG-20PW': { 'ТПК 004S': { value: 394, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                'XSTRONG-30PW': { 'ТПК 004S': { value: 544, unit: 'мм', material: 'AISI 430', thickness: '2мм' } },
                'XSTRONG-40PW': { 'ТПК 004S': { value: 744, unit: 'мм', material: 'AISI 430', thickness: '2мм' } }
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
            },
            
            // XLINE - Тех карта XLINE.csv
            'XLINE': {
                '106': {
                    'Профиль КП 453434': { value: 103, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Рассеиватель XLINE': { value: 104, unit: 'мм', material: 'Поликарбонат', thickness: '2мм' },
                    'Профиль КП 453436': { value: 97, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '206': {
                    'Профиль КП 453434': { value: 203, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Рассеиватель XLINE': { value: 204, unit: 'мм', material: 'Поликарбонат', thickness: '2мм' },
                    'Профиль КП 453436': { value: 197, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '306': {
                    'Профиль КП 453434': { value: 303, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Рассеиватель XLINE': { value: 304, unit: 'мм', material: 'Поликарбонат', thickness: '2мм' },
                    'Профиль КП 453436': { value: 297, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '406': {
                    'Профиль КП 453434': { value: 403, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Рассеиватель XLINE': { value: 404, unit: 'мм', material: 'Поликарбонат', thickness: '2мм' },
                    'Профиль КП 453436': { value: 397, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '506': {
                    'Профиль КП 453434': { value: 503, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Рассеиватель XLINE': { value: 504, unit: 'мм', material: 'Поликарбонат', thickness: '2мм' },
                    'Профиль КП 453436': { value: 497, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '600': {
                    'Профиль КП 453434': { value: 597, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Рассеиватель XLINE': { value: 598, unit: 'мм', material: 'Поликарбонат', thickness: '2мм' },
                    'Профиль КП 453436': { value: 591, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '700': {
                    'Профиль КП 453434': { value: 697, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Рассеиватель XLINE': { value: 698, unit: 'мм', material: 'Поликарбонат', thickness: '2мм' },
                    'Профиль КП 453436': { value: 691, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '800': {
                    'Профиль КП 453434': { value: 797, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Рассеиватель XLINE': { value: 798, unit: 'мм', material: 'Поликарбонат', thickness: '2мм' },
                    'Профиль КП 453436': { value: 791, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '900': {
                    'Профиль КП 453434': { value: 897, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Рассеиватель XLINE': { value: 898, unit: 'мм', material: 'Поликарбонат', thickness: '2мм' },
                    'Профиль КП 453436': { value: 891, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 000': {
                    'Профиль КП 453434': { value: 997, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Рассеиватель XLINE': { value: 998, unit: 'мм', material: 'Поликарбонат', thickness: '2мм' },
                    'Профиль КП 453436': { value: 991, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 094': {
                    'Профиль КП 453434': { value: 1091, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Рассеиватель XLINE': { value: 1092, unit: 'мм', material: 'Поликарбонат', thickness: '2мм' },
                    'Профиль КП 453436': { value: 1085, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 194': {
                    'Профиль КП 453434': { value: 1191, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Рассеиватель XLINE': { value: 1192, unit: 'мм', material: 'Поликарбонат', thickness: '2мм' },
                    'Профиль КП 453436': { value: 1185, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 294': {
                    'Профиль КП 453434': { value: 1291, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Рассеиватель XLINE': { value: 1292, unit: 'мм', material: 'Поликарбонат', thickness: '2мм' },
                    'Профиль КП 453436': { value: 1285, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 394': {
                    'Профиль КП 453434': { value: 1391, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Рассеиватель XLINE': { value: 1392, unit: 'мм', material: 'Поликарбонат', thickness: '2мм' },
                    'Профиль КП 453436': { value: 1385, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 494': {
                    'Профиль КП 453434': { value: 1491, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Рассеиватель XLINE': { value: 1492, unit: 'мм', material: 'Поликарбонат', thickness: '2мм' },
                    'Профиль КП 453436': { value: 1485, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                }
            },
            
            // XGLOW mini - Тех карта XGLOW mini.csv
            'XGLOW mini': {
                '125': {
                    'Профиль НПС 2993': { value: 115, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '250': {
                    'Профиль НПС 2993': { value: 240, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '375': {
                    'Профиль НПС 2993': { value: 365, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '500': {
                    'Профиль НПС 2993': { value: 490, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '510': {
                    'Профиль НПС 2993': { value: 495, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '625': {
                    'Профиль НПС 2993': { value: 615, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '750': {
                    'Профиль НПС 2993': { value: 740, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '875': {
                    'Профиль НПС 2993': { value: 865, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 000': {
                    'Профиль НПС 2993': { value: 985, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 125': {
                    'Профиль НПС 2993': { value: 1115, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 60, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 250': {
                    'Профиль НПС 2993': { value: 1240, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 60, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 375': {
                    'Профиль НПС 2993': { value: 1365, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 60, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 490': {
                    'Профиль НПС 2993': { value: 1475, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 60, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 500': {
                    'Профиль НПС 2993': { value: 1490, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 60, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                }
            },
            
            // XGLOW - Тех карта XGLOW.csv
            'XGLOW': {
                '510': {
                    'Профиль НПС 2997': { value: 500, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 000': {
                    'Профиль НПС 2997': { value: 990, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                },
                '1 490': {
                    'Профиль НПС 2997': { value: 1480, unit: 'мм', material: 'AISI 430', thickness: '2мм' },
                    'Профиль НПС 2994': { value: 60, unit: 'мм', material: 'AISI 430', thickness: '2мм' }
                }
            }
        };
    }
    
    // Расчет материалов для заказа
    calculateMaterials(order) {
        const materials = [];
        
        order.items.forEach(item => {
            const quantity = item.quantity || 1;
            const productName = item.product;
            const size = item.size;
            
            console.log(`Расчет материалов для ${productName} размер ${size}, кол-во ${quantity}`);
            
            // 1. Кронштейн
            if (item.bracket && item.bracket !== 'отсутствует') {
                const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket);
                if (bracket) {
                    materials.push({
                        name: `Кронштейн ${item.bracket}`,
                        material: bracket.material || 'AISI 430',
                        thickness: bracket.thickness || '2мм',
                        unitValue: bracket.weight || 0,
                        unit: 'кг',
                        quantity: quantity,
                        totalValue: (bracket.weight || 0) * quantity
                    });
                }
            }
            
            // 2. Лира
            if (item.lyre && item.lyre !== 'отсутствует') {
                const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre);
                if (lyre) {
                    materials.push({
                        name: `Лира ${item.lyre}`,
                        material: lyre.material || 'AISI 430',
                        thickness: lyre.thickness || '1.5мм',
                        unitValue: lyre.weight || 0,
                        unit: 'кг',
                        quantity: quantity,
                        totalValue: (lyre.weight || 0) * quantity
                    });
                }
            }
            
            // 3. Материалы из техкарты изделия
            const productSpec = this.materialsDB.productSpecs[productName];
            if (productSpec && productSpec[size]) {
                const spec = productSpec[size];
                
                Object.entries(spec).forEach(([key, data]) => {
                    materials.push({
                        name: `${key} (${productName})`,
                        material: data.material || 'Комплектующие',
                        thickness: data.thickness,
                        unitValue: data.value,
                        unit: data.unit || 'мм',
                        quantity: quantity,
                        totalValue: data.value * quantity
                    });
                });
            }
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
        
        // Для каждого типа материала своя таблица
        Object.entries(byType).forEach(([materialType, items]) => {
            html += `
                <h4 style="margin-top: 20px;">${materialType}:</h4>
                <table class="materials-table">
                    <thead>
                        <tr>
                            <th>Наименование</th>
                            <th>Толщина</th>
                            <th>Расход на ед.</th>
                            <th>Ед.</th>
                            <th>Кол-во изд.</th>
                            <th>Общий расход</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            items.forEach(item => {
                html += `
                    <tr>
                        <td><strong>${item.name}</strong></td>
                        <td>${item.thickness || '-'}</td>
                        <td>${item.unitValue.toFixed(3)}</td>
                        <td>${item.unit}</td>
                        <td>${item.quantity}</td>
                        <td>${item.totalValue.toFixed(3)}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        });
        
        html += `</div>`;
        return html;
    }
}
