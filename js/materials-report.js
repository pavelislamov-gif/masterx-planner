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
            
            // Прутки (в мм)
            rods: [],
            
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
        
        // Загружаем прутки
        this.materialsDB.rods = this.loadRodData();
        
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
    
    // ============== ПРУТКИ (в мм) ==============
    
    loadRodData() {
        return [
            { product: 'XDISK', rodType: 'Пруток Шестигранник Ал 25мм', value: 27, unit: 'мм' },
            { product: 'XDISK', rodType: 'Пруток 75мм Д16Т', value: 25, unit: 'мм' },
            { product: 'XDISK', rodType: 'Пруток 100мм Д16Т', value: 70, unit: 'мм' },
            { product: 'ACENTO 3T', rodType: 'Пруток 70мм Д16Т', value: 35, unit: 'мм' },
            { product: 'ACENTO 3T', rodType: 'СЧ 4435 труба', value: 95, unit: 'мм' },
            { product: 'ACENTO 4', rodType: 'Пруток 100мм Д16Т', value: 112, unit: 'мм' },
            { product: 'XPIXEL BIN v.1', rodType: 'Пруток 100мм Д16Т', value: 34, unit: 'мм' },
            { product: 'XPIXEL BIN v.1', rodType: 'Пруток 130мм Д16Т', value: 20, unit: 'мм' },
            { product: 'XPIXEL BIN v.2', rodType: 'Пруток 100мм Д16Т', value: 34, unit: 'мм' },
            { product: 'XPIXEL BIN v.2', rodType: 'Пруток 130мм Д16Т', value: 20, unit: 'мм' },
            { product: 'XPIXEL BIN v.3', rodType: 'Пруток 110мм Д16Т', value: 40, unit: 'мм' },
            { product: 'XPIXEL OVHD', rodType: 'Пруток 50мм Д16Т', value: 20, unit: 'мм' },
            { product: 'XPOINT OVHD', rodType: 'Пруток 25мм Д16Т', value: 22, unit: 'мм' },
            { product: 'XRAY 1', rodType: 'Пруток 50мм Д16Т', value: 80, unit: 'мм' },
            { product: 'XRAY 12S', rodType: 'Пруток 150мм Д16Т', value: 70, unit: 'мм' },
            { product: 'XRAY 18', rodType: 'Пруток 150мм Д16Т', value: 120, unit: 'мм' },
            { product: 'XRAY 18S', rodType: 'Пруток 150мм Д16Т', value: 75, unit: 'мм' },
            { product: 'XRAY 3', rodType: 'Пруток 58мм Д16Т', value: 110, unit: 'мм' },
            { product: 'XRAY 3-GRP', rodType: 'Пруток 40мм Д16Т', value: 10, unit: 'мм' },
            { product: 'XRAY 3-GRP', rodType: 'Пруток 48мм Д16Т', value: 72, unit: 'мм' },
            { product: 'XRAY 6', rodType: 'Пруток 85мм Д16Т', value: 105, unit: 'мм' },
            { product: 'XRAY 6 RGBW', rodType: 'Пруток 85мм Д16Т', value: 105, unit: 'мм' },
            { product: 'XRAY 6-2 оконечный', rodType: 'Пруток 85мм Д16Т', value: 130, unit: 'мм' },
            { product: 'XRAY 6-2 проходной', rodType: 'Пруток 85мм Д16Т', value: 130, unit: 'мм' },
            { product: 'XRAY 6-T2 BT 180', rodType: 'СЧ 4435 труба', value: 183, unit: 'мм' },
            { product: 'XRAY 6-T2 BT 200', rodType: 'СЧ 4435 труба', value: 203, unit: 'мм' },
            { product: 'XRAY 6-T2 BT 220', rodType: 'СЧ 4435 труба', value: 223, unit: 'мм' },
            { product: 'XRAY 6-T2 BT 220 Шторка х2', rodType: 'СЧ 4435 труба', value: 223, unit: 'мм' },
            { product: 'XRAY 6-T2 BT 240 Шторка', rodType: 'СЧ 4435 труба', value: 243, unit: 'мм' },
            { product: 'XRAY 6-T2 BZ 240 Шторка х2', rodType: 'СЧ 4435 труба', value: 243, unit: 'мм' },
            { product: 'XRAY 6-T2 BZ 180', rodType: 'СЧ 4435 труба', value: 183, unit: 'мм' },
            { product: 'XRAY 6-T2 BZ 200 Шторка', rodType: 'СЧ 4435 труба', value: 203, unit: 'мм' },
            { product: 'XRAY 6-T2 BZ 220', rodType: 'СЧ 4435 труба', value: 223, unit: 'мм' },
            { product: 'XRAY 6-T2 BZ 220 Шторка х2', rodType: 'СЧ 4435 труба', value: 223, unit: 'мм' },
            { product: 'XRAY 6-T2 BZ 240 Шторка', rodType: 'СЧ 4435 труба', value: 243, unit: 'мм' },
            { product: 'XRAY 6-T2 BZ 240 Шторка х2', rodType: 'СЧ 4435 труба', value: 243, unit: 'мм' },
            { product: 'XRAY 6T Накладной', rodType: 'Пруток 90мм Д16Т', value: 34, unit: 'мм' },
            { product: 'XRAY 6T BZ 120', rodType: 'СЧ 4435 труба', value: 123, unit: 'мм' },
            { product: 'XRAY 6T BT 140 Шторка', rodType: 'СЧ 4435 труба', value: 143, unit: 'мм' },
            { product: 'XRAY 6T RGBW BT 150', rodType: 'СЧ 4435 труба', value: 153, unit: 'мм' },
            { product: 'XRAY 9', rodType: 'Пруток 120мм Д16Т', value: 100, unit: 'мм' },
            { product: 'XRAY 9S', rodType: 'Пруток 120мм Д16Т', value: 65, unit: 'мм' },
            { product: 'XSLOPE', rodType: 'Пруток 70мм Д16Т', value: 80, unit: 'мм' },
            { product: 'XSPOT', rodType: 'Пруток 55мм Д16Т', value: 87, unit: 'мм' },
            { product: 'XRAY 3-2', rodType: 'Пруток 58мм Д16Т', value: 152, unit: 'мм' }
        ];
    }
    
    // ============== ПРОФИЛИ ИЗ ТЕХКАРТ (в мм) ==============
    
    loadAllProductSpecs() {
        return {
            // XGRAY v.1
            'XGRAY v.1': {
                '116': {
                    'Профиль МП 1928 XGRAY': { value: 117, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 113, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '216': {
                    'Профиль МП 1928 XGRAY': { value: 217, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 213, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '316': {
                    'Профиль МП 1928 XGRAY': { value: 317, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 313, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '416': {
                    'Профиль МП 1928 XGRAY': { value: 417, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 413, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '516': {
                    'Профиль МП 1928 XGRAY': { value: 517, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 513, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '612': {
                    'Профиль МП 1928 XGRAY': { value: 613, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 609, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '712': {
                    'Профиль МП 1928 XGRAY': { value: 713, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 709, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '812': {
                    'Профиль МП 1928 XGRAY': { value: 813, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 809, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '912': {
                    'Профиль МП 1928 XGRAY': { value: 913, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 909, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '1 012': {
                    'Профиль МП 1928 XGRAY': { value: 1013, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1009, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм' }
                },
                '1 108': {
                    'Профиль МП 1928 XGRAY': { value: 1109, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1105, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм' }
                },
                '1 208': {
                    'Профиль МП 1928 XGRAY': { value: 1209, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1205, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм' }
                },
                '1 308': {
                    'Профиль МП 1928 XGRAY': { value: 1309, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1305, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм' }
                },
                '1 408': {
                    'Профиль МП 1928 XGRAY': { value: 1409, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1405, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм' }
                },
                '1 508': {
                    'Профиль МП 1928 XGRAY': { value: 1509, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1505, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм' }
                }
            },
            
            // XGRAY v.2
            'XGRAY v.2': {
                '116': {
                    'Профиль МП 1928 XGRAY': { value: 117, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 113, unit: 'мм' }
                },
                '216': {
                    'Профиль МП 1928 XGRAY': { value: 217, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 213, unit: 'мм' }
                },
                '316': {
                    'Профиль МП 1928 XGRAY': { value: 317, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 313, unit: 'мм' }
                },
                '416': {
                    'Профиль МП 1928 XGRAY': { value: 417, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 413, unit: 'мм' }
                },
                '516': {
                    'Профиль МП 1928 XGRAY': { value: 517, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 513, unit: 'мм' }
                },
                '612': {
                    'Профиль МП 1928 XGRAY': { value: 613, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 609, unit: 'мм' }
                },
                '712': {
                    'Профиль МП 1928 XGRAY': { value: 713, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 709, unit: 'мм' }
                },
                '812': {
                    'Профиль МП 1928 XGRAY': { value: 813, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 809, unit: 'мм' }
                },
                '912': {
                    'Профиль МП 1928 XGRAY': { value: 913, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 909, unit: 'мм' }
                },
                '1 012': {
                    'Профиль МП 1928 XGRAY': { value: 1013, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1009, unit: 'мм' }
                },
                '1 108': {
                    'Профиль МП 1928 XGRAY': { value: 1109, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1105, unit: 'мм' }
                },
                '1 208': {
                    'Профиль МП 1928 XGRAY': { value: 1209, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1205, unit: 'мм' }
                },
                '1 308': {
                    'Профиль МП 1928 XGRAY': { value: 1309, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1305, unit: 'мм' }
                },
                '1 408': {
                    'Профиль МП 1928 XGRAY': { value: 1409, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1405, unit: 'мм' }
                },
                '1 508': {
                    'Профиль МП 1928 XGRAY': { value: 1509, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1505, unit: 'мм' }
                }
            },
            
            // XSMART mini
            'XSMART mini': {
                'XSMART mini 1': { 'Профиль НП 455015': { value: 71, unit: 'мм' } },
                'XSMART mini 2': { 'Профиль НП 455015': { value: 91, unit: 'мм' } },
                'XSMART mini 3': { 'Профиль НП 455015': { value: 131, unit: 'мм' } },
                'XSMART mini 4': { 'Профиль НП 455015': { value: 171, unit: 'мм' } },
                'XSMART mini 5': { 'Профиль НП 455015': { value: 206, unit: 'мм' } },
                'XSMART mini 6': { 'Профиль НП 455015': { value: 246, unit: 'мм' } }
            },
            
            // XLUMO Двунаправленный
            'XLUMO Двунаправленный': {
                'XLUMOx2-1': { 'Профиль НПС 3362': { value: 71, unit: 'мм' } },
                'XLUMOx2-2': { 'Профиль НПС 3362': { value: 108, unit: 'мм' } },
                'XLUMOx2-3': { 'Профиль НПС 3362': { value: 148, unit: 'мм' } },
                'XLUMOx2-4': { 'Профиль НПС 3362': { value: 188, unit: 'мм' } },
                'XLUMOx2-5': { 'Профиль НПС 3362': { value: 223, unit: 'мм' } },
                'XLUMOx2-6': { 'Профиль НПС 3362': { value: 263, unit: 'мм' } }
            },
            
            // XSMART
            'XSMART': {
                'XSMART-2': {
                    'КП 453785': { value: 91, unit: 'мм' },
                    'КП 453784': { value: 82, unit: 'мм' }
                },
                'XSMART-3': {
                    'КП 453785': { value: 131, unit: 'мм' },
                    'КП 453784': { value: 122, unit: 'мм' }
                },
                'XSMART-4': {
                    'КП 453785': { value: 171, unit: 'мм' },
                    'КП 453784': { value: 162, unit: 'мм' }
                },
                'XSMART-5': {
                    'КП 453785': { value: 206, unit: 'мм' },
                    'КП 453784': { value: 197, unit: 'мм' }
                },
                'XSMART-6': {
                    'КП 453785': { value: 246, unit: 'мм' },
                    'КП 453784': { value: 237, unit: 'мм' }
                },
                '500': {
                    'КП 453785': { value: 500, unit: 'мм' },
                    'КП 453784': { value: 500, unit: 'мм' }
                },
                '1000': {
                    'КП 453785': { value: 1000, unit: 'мм' },
                    'КП 453784': { value: 1000, unit: 'мм' }
                },
                '1500': {
                    'КП 453785': { value: 1500, unit: 'мм' },
                    'КП 453784': { value: 1500, unit: 'мм' }
                }
            },
            
            // XLUMO 1-6
            'XLUMO 1-6': {
                'XLUMO-1': { 'Профиль НПС 2967 (XLUMO)': { value: 71, unit: 'мм' } },
                'XLUMO-2': { 'Профиль НПС 2967 (XLUMO)': { value: 108, unit: 'мм' } },
                'XLUMO-3': { 'Профиль НПС 2967 (XLUMO)': { value: 148, unit: 'мм' } },
                'XLUMO-4': { 'Профиль НПС 2967 (XLUMO)': { value: 188, unit: 'мм' } },
                'XLUMO-5': { 'Профиль НПС 2967 (XLUMO)': { value: 223, unit: 'мм' } },
                'XLUMO-6': { 'Профиль НПС 2967 (XLUMO)': { value: 263, unit: 'мм' } }
            },
            
            // XGIRO
            'XGIRO': {
                '130': { 'Профиль МП 0923-081': { value: 130, unit: 'мм' } },
                '220': { 'Профиль МП 0923-081': { value: 220, unit: 'мм' } },
                '310': { 'Профиль МП 0923-081': { value: 310, unit: 'мм' } },
                '410': { 'Профиль МП 0923-081': { value: 410, unit: 'мм' } },
                '510': { 'Профиль МП 0923-081': { value: 510, unit: 'мм' } },
                '600': { 'Профиль МП 0923-081': { value: 600, unit: 'мм' } },
                '700': { 'Профиль МП 0923-081': { value: 700, unit: 'мм' } },
                '800': { 'Профиль МП 0923-081': { value: 800, unit: 'мм' } },
                '900': { 'Профиль МП 0923-081': { value: 900, unit: 'мм' } },
                '1000': { 'Профиль МП 0923-081': { value: 1000, unit: 'мм' } }
            },
            
            // XVISION
            'XVISION': {
                '110': { 'КП 453849': { value: 103, unit: 'мм' } },
                '125': { 'КП 453849': { value: 118, unit: 'мм' } },
                '210': { 'КП 453849': { value: 203, unit: 'мм' } },
                '250': { 'КП 453849': { value: 243, unit: 'мм' } },
                '310': { 'КП 453849': { value: 303, unit: 'мм' } },
                '375': { 'КП 453849': { value: 368, unit: 'мм' } },
                '410': { 'КП 453849': { value: 403, unit: 'мм' } },
                '500': { 'КП 453849': { value: 493, unit: 'мм' } },
                '510': { 'КП 453849': { value: 503, unit: 'мм' } },
                '600': { 'КП 453849': { value: 593, unit: 'мм' } },
                '625': { 'КП 453849': { value: 618, unit: 'мм' } },
                '700': { 'КП 453849': { value: 693, unit: 'мм' } },
                '750': { 'КП 453849': { value: 743, unit: 'мм' } },
                '800': { 'КП 453849': { value: 793, unit: 'мм' } },
                '875': { 'КП 453849': { value: 868, unit: 'мм' } },
                '900': { 'КП 453849': { value: 893, unit: 'мм' } },
                '1000': { 'КП 453849': { value: 993, unit: 'мм' } },
                '1125': { 'КП 453849': { value: 1138, unit: 'мм' } },
                '1250': { 'КП 453849': { value: 1243, unit: 'мм' } },
                '1375': { 'КП 453849': { value: 1368, unit: 'мм' } },
                '1500': { 'КП 453849': { value: 1493, unit: 'мм' } }
            },
            
            // XBAR-SW
            'XBAR-SW': {
                '1000': { 'КП 453054': { value: 998, unit: 'мм' } },
                '1500': { 'КП 453054': { value: 1498, unit: 'мм' } }
            },
            
            // XLITE
            'XLITE': {
                '125': { 'Профиль НПС 2966': { value: 125, unit: 'мм' } },
                '250': { 'Профиль НПС 2966': { value: 250, unit: 'мм' } },
                '375': { 'Профиль НПС 2966': { value: 375, unit: 'мм' } },
                '500': { 'Профиль НПС 2966': { value: 500, unit: 'мм' } },
                '625': { 'Профиль НПС 2966': { value: 625, unit: 'мм' } },
                '750': { 'Профиль НПС 2966': { value: 750, unit: 'мм' } },
                '875': { 'Профиль НПС 2966': { value: 875, unit: 'мм' } },
                '1000': { 'Профиль НПС 2966': { value: 1000, unit: 'мм' } },
                '1125': { 'Профиль НПС 2966': { value: 1125, unit: 'мм' } },
                '1250': { 'Профиль НПС 2966': { value: 1250, unit: 'мм' } },
                '1375': { 'Профиль НПС 2966': { value: 1375, unit: 'мм' } },
                '1500': { 'Профиль НПС 2966': { value: 1500, unit: 'мм' } }
            },
            
            // XROLL-lite P
            'XROLL-lite P': {
                '205': {
                    'Профиль поликарбонатный XROLL-lite': { value: 208, unit: 'мм' },
                    'Профиль НПС 3007': { value: 210, unit: 'мм' }
                },
                '305': {
                    'Профиль поликарбонатный XROLL-lite': { value: 308, unit: 'мм' },
                    'Профиль НПС 3007': { value: 310, unit: 'мм' }
                },
                '405': {
                    'Профиль поликарбонатный XROLL-lite': { value: 408, unit: 'мм' },
                    'Профиль НПС 3007': { value: 410, unit: 'мм' }
                },
                '505': {
                    'Профиль поликарбонатный XROLL-lite': { value: 508, unit: 'мм' },
                    'Профиль НПС 3007': { value: 510, unit: 'мм' }
                },
                '600': {
                    'Профиль поликарбонатный XROLL-lite': { value: 603, unit: 'мм' },
                    'Профиль НПС 3007': { value: 605, unit: 'мм' }
                },
                '700': {
                    'Профиль поликарбонатный XROLL-lite': { value: 703, unit: 'мм' },
                    'Профиль НПС 3007': { value: 705, unit: 'мм' }
                },
                '800': {
                    'Профиль поликарбонатный XROLL-lite': { value: 803, unit: 'мм' },
                    'Профиль НПС 3007': { value: 805, unit: 'мм' }
                },
                '900': {
                    'Профиль поликарбонатный XROLL-lite': { value: 903, unit: 'мм' },
                    'Профиль НПС 3007': { value: 905, unit: 'мм' }
                },
                '1000': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1003, unit: 'мм' },
                    'Профиль НПС 3007': { value: 1005, unit: 'мм' }
                },
                '1100': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1103, unit: 'мм' },
                    'Профиль НПС 3007': { value: 1105, unit: 'мм' }
                },
                '1200': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1203, unit: 'мм' },
                    'Профиль НПС 3007': { value: 1205, unit: 'мм' }
                },
                '1300': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1303, unit: 'мм' },
                    'Профиль НПС 3007': { value: 1305, unit: 'мм' }
                },
                '1400': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1403, unit: 'мм' },
                    'Профиль НПС 3007': { value: 1405, unit: 'мм' }
                },
                '1496': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1499, unit: 'мм' },
                    'Профиль НПС 3007': { value: 1501, unit: 'мм' }
                }
            },
            
            // XROLL-lite K
            'XROLL-lite K': {
                '205': {
                    'Профиль поликарбонатный XROLL-lite': { value: 208, unit: 'мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм' }
                },
                '305': {
                    'Профиль поликарбонатный XROLL-lite': { value: 308, unit: 'мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм' }
                },
                '405': {
                    'Профиль поликарбонатный XROLL-lite': { value: 408, unit: 'мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм' }
                },
                '505': {
                    'Профиль поликарбонатный XROLL-lite': { value: 508, unit: 'мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм' }
                },
                '600': {
                    'Профиль поликарбонатный XROLL-lite': { value: 603, unit: 'мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм' }
                },
                '700': {
                    'Профиль поликарбонатный XROLL-lite': { value: 703, unit: 'мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм' }
                },
                '800': {
                    'Профиль поликарбонатный XROLL-lite': { value: 803, unit: 'мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм' }
                },
                '900': {
                    'Профиль поликарбонатный XROLL-lite': { value: 903, unit: 'мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм' }
                },
                '1000': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1003, unit: 'мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм' }
                },
                '1100': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1103, unit: 'мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм' }
                },
                '1200': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1203, unit: 'мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм' }
                },
                '1300': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1303, unit: 'мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм' }
                },
                '1400': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1403, unit: 'мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм' }
                },
                '1496': {
                    'Профиль поликарбонатный XROLL-lite': { value: 1499, unit: 'мм' },
                    'Профиль НПС 3007': { value: 90, unit: 'мм' }
                }
            },
            
            // XLUMO
            'XLUMO': {
                '125': { 'Профиль НПС 2967 (XLUMO)': { value: 125, unit: 'мм' } },
                '250': { 'Профиль НПС 2967 (XLUMO)': { value: 250, unit: 'мм' } },
                '375': { 'Профиль НПС 2967 (XLUMO)': { value: 375, unit: 'мм' } },
                '625': { 'Профиль НПС 2967 (XLUMO)': { value: 625, unit: 'мм' } },
                '750': { 'Профиль НПС 2967 (XLUMO)': { value: 750, unit: 'мм' } },
                '875': { 'Профиль НПС 2967 (XLUMO)': { value: 875, unit: 'мм' } },
                '1125': { 'Профиль НПС 2967 (XLUMO)': { value: 1125, unit: 'мм' } },
                '1250': { 'Профиль НПС 2967 (XLUMO)': { value: 1250, unit: 'мм' } },
                '1375': { 'Профиль НПС 2967 (XLUMO)': { value: 1375, unit: 'мм' } },
                '1500': { 'Профиль НПС 2967 (XLUMO)': { value: 1500, unit: 'мм' } }
            },
            
            // XLUMO PROV
            'XLUMO PROV': {
                '125': { 'Профиль НПС 2967 (XLUMO)': { value: 125, unit: 'мм' } },
                '250': { 'Профиль НПС 2967 (XLUMO)': { value: 250, unit: 'мм' } },
                '375': { 'Профиль НПС 2967 (XLUMO)': { value: 375, unit: 'мм' } },
                '500': { 'Профиль НПС 2967 (XLUMO)': { value: 500, unit: 'мм' } },
                '625': { 'Профиль НПС 2967 (XLUMO)': { value: 625, unit: 'мм' } },
                '750': { 'Профиль НПС 2967 (XLUMO)': { value: 750, unit: 'мм' } },
                '875': { 'Профиль НПС 2967 (XLUMO)': { value: 875, unit: 'мм' } },
                '1000': { 'Профиль НПС 2967 (XLUMO)': { value: 1000, unit: 'мм' } },
                '1125': { 'Профиль НПС 2967 (XLUMO)': { value: 1125, unit: 'мм' } },
                '1250': { 'Профиль НПС 2967 (XLUMO)': { value: 1250, unit: 'мм' } },
                '1375': { 'Профиль НПС 2967 (XLUMO)': { value: 1375, unit: 'мм' } },
                '1500': { 'Профиль НПС 2967 (XLUMO)': { value: 1500, unit: 'мм' } }
            },
            
            // XSTRONG
            'XSTRONG': {
                'XSTRONG-10': { 'ТПК 004S': { value: 204, unit: 'мм' } },
                'XSTRONG-20': { 'ТПК 004S': { value: 344, unit: 'мм' } },
                'XSTRONG-30': { 'ТПК 004S': { value: 444, unit: 'мм' } },
                'XSTRONG-20PW': { 'ТПК 004S': { value: 394, unit: 'мм' } },
                'XSTRONG-30PW': { 'ТПК 004S': { value: 544, unit: 'мм' } },
                'XSTRONG-40PW': { 'ТПК 004S': { value: 744, unit: 'мм' } }
            },
            
            // XYELLOW
            'XYELLOW': {
                '116': {
                    'Профиль СЧ 4515 XYELLOW': { value: 117, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 113, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '216': {
                    'Профиль СЧ 4515 XYELLOW': { value: 217, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 213, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '316': {
                    'Профиль СЧ 4515 XYELLOW': { value: 317, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 313, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '416': {
                    'Профиль СЧ 4515 XYELLOW': { value: 417, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 413, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '516': {
                    'Профиль СЧ 4515 XYELLOW': { value: 517, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 513, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '612': {
                    'Профиль СЧ 4515 XYELLOW': { value: 613, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 609, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '712': {
                    'Профиль СЧ 4515 XYELLOW': { value: 713, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 709, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '812': {
                    'Профиль СЧ 4515 XYELLOW': { value: 813, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 809, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '912': {
                    'Профиль СЧ 4515 XYELLOW': { value: 913, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 909, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 90, unit: 'мм' }
                },
                '1 012': {
                    'Профиль СЧ 4515 XYELLOW': { value: 1013, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1009, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм' }
                },
                '1 108': {
                    'Профиль СЧ 4515 XYELLOW': { value: 1109, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1105, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм' }
                },
                '1 208': {
                    'Профиль СЧ 4515 XYELLOW': { value: 1209, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1205, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм' }
                },
                '1 308': {
                    'Профиль СЧ 4515 XYELLOW': { value: 1309, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1305, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм' }
                },
                '1 408': {
                    'Профиль СЧ 4515 XYELLOW': { value: 1409, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1405, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм' }
                },
                '1 508': {
                    'Профиль СЧ 4515 XYELLOW': { value: 1509, unit: 'мм' },
                    'Модуль НПС 2999 (XGRAY/XYELLOW)': { value: 1505, unit: 'мм' },
                    'Профиль СЧ 4446 Планка': { value: 135, unit: 'мм' }
                }
            },
            
            // XLINE
            'XLINE': {
                '106': {
                    'Профиль КП 453434': { value: 103, unit: 'мм' },
                    'Рассеиватель XLINE': { value: 104, unit: 'мм' },
                    'Профиль КП 453436': { value: 97, unit: 'мм' }
                },
                '206': {
                    'Профиль КП 453434': { value: 203, unit: 'мм' },
                    'Рассеиватель XLINE': { value: 204, unit: 'мм' },
                    'Профиль КП 453436': { value: 197, unit: 'мм' }
                },
                '306': {
                    'Профиль КП 453434': { value: 303, unit: 'мм' },
                    'Рассеиватель XLINE': { value: 304, unit: 'мм' },
                    'Профиль КП 453436': { value: 297, unit: 'мм' }
                },
                '406': {
                    'Профиль КП 453434': { value: 403, unit: 'мм' },
                    'Рассеиватель XLINE': { value: 404, unit: 'мм' },
                    'Профиль КП 453436': { value: 397, unit: 'мм' }
                },
                '506': {
                    'Профиль КП 453434': { value: 503, unit: 'мм' },
                    'Рассеиватель XLINE': { value: 504, unit: 'мм' },
                    'Профиль КП 453436': { value: 497, unit: 'мм' }
                },
                '600': {
                    'Профиль КП 453434': { value: 597, unit: 'мм' },
                    'Рассеиватель XLINE': { value: 598, unit: 'мм' },
                    'Профиль КП 453436': { value: 591, unit: 'мм' }
                },
                '700': {
                    'Профиль КП 453434': { value: 697, unit: 'мм' },
                    'Рассеиватель XLINE': { value: 698, unit: 'мм' },
                    'Профиль КП 453436': { value: 691, unit: 'мм' }
                },
                '800': {
                    'Профиль КП 453434': { value: 797, unit: 'мм' },
                    'Рассеиватель XLINE': { value: 798, unit: 'мм' },
                    'Профиль КП 453436': { value: 791, unit: 'мм' }
                },
                '900': {
                    'Профиль КП 453434': { value: 897, unit: 'мм' },
                    'Рассеиватель XLINE': { value: 898, unit: 'мм' },
                    'Профиль КП 453436': { value: 891, unit: 'мм' }
                },
                '1 000': {
                    'Профиль КП 453434': { value: 997, unit: 'мм' },
                    'Рассеиватель XLINE': { value: 998, unit: 'мм' },
                    'Профиль КП 453436': { value: 991, unit: 'мм' }
                },
                '1 094': {
                    'Профиль КП 453434': { value: 1091, unit: 'мм' },
                    'Рассеиватель XLINE': { value: 1092, unit: 'мм' },
                    'Профиль КП 453436': { value: 1085, unit: 'мм' }
                },
                '1 194': {
                    'Профиль КП 453434': { value: 1191, unit: 'мм' },
                    'Рассеиватель XLINE': { value: 1192, unit: 'мм' },
                    'Профиль КП 453436': { value: 1185, unit: 'мм' }
                },
                '1 294': {
                    'Профиль КП 453434': { value: 1291, unit: 'мм' },
                    'Рассеиватель XLINE': { value: 1292, unit: 'мм' },
                    'Профиль КП 453436': { value: 1285, unit: 'мм' }
                },
                '1 394': {
                    'Профиль КП 453434': { value: 1391, unit: 'мм' },
                    'Рассеиватель XLINE': { value: 1392, unit: 'мм' },
                    'Профиль КП 453436': { value: 1385, unit: 'мм' }
                },
                '1 494': {
                    'Профиль КП 453434': { value: 1491, unit: 'мм' },
                    'Рассеиватель XLINE': { value: 1492, unit: 'мм' },
                    'Профиль КП 453436': { value: 1485, unit: 'мм' }
                }
            },
            
            // XGLOW mini
            'XGLOW mini': {
                '125': {
                    'Профиль НПС 2993': { value: 115, unit: 'мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм' }
                },
                '250': {
                    'Профиль НПС 2993': { value: 240, unit: 'мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм' }
                },
                '375': {
                    'Профиль НПС 2993': { value: 365, unit: 'мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм' }
                },
                '500': {
                    'Профиль НПС 2993': { value: 490, unit: 'мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм' }
                },
                '510': {
                    'Профиль НПС 2993': { value: 495, unit: 'мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм' }
                },
                '625': {
                    'Профиль НПС 2993': { value: 615, unit: 'мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм' }
                },
                '750': {
                    'Профиль НПС 2993': { value: 740, unit: 'мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм' }
                },
                '875': {
                    'Профиль НПС 2993': { value: 865, unit: 'мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм' }
                },
                '1 000': {
                    'Профиль НПС 2993': { value: 985, unit: 'мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм' }
                },
                '1 125': {
                    'Профиль НПС 2993': { value: 1115, unit: 'мм' },
                    'Профиль НПС 2994': { value: 60, unit: 'мм' }
                },
                '1 250': {
                    'Профиль НПС 2993': { value: 1240, unit: 'мм' },
                    'Профиль НПС 2994': { value: 60, unit: 'мм' }
                },
                '1 375': {
                    'Профиль НПС 2993': { value: 1365, unit: 'мм' },
                    'Профиль НПС 2994': { value: 60, unit: 'мм' }
                },
                '1 490': {
                    'Профиль НПС 2993': { value: 1475, unit: 'мм' },
                    'Профиль НПС 2994': { value: 60, unit: 'мм' }
                },
                '1 500': {
                    'Профиль НПС 2993': { value: 1490, unit: 'мм' },
                    'Профиль НПС 2994': { value: 60, unit: 'мм' }
                }
            },
            
            // XGLOW
            'XGLOW': {
                '510': {
                    'Профиль НПС 2997': { value: 500, unit: 'мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм' }
                },
                '1 000': {
                    'Профиль НПС 2997': { value: 990, unit: 'мм' },
                    'Профиль НПС 2994': { value: 40, unit: 'мм' }
                },
                '1 490': {
                    'Профиль НПС 2997': { value: 1480, unit: 'мм' },
                    'Профиль НПС 2994': { value: 60, unit: 'мм' }
                }
            }
        };
    }
    
    // ============== РАСЧЕТ МАТЕРИАЛОВ ==============
    
    calculateMaterials(order) {
        const sheetMaterials = []; // листовые материалы (м²)
        const profiles = []; // профили (мм)
        const rods = []; // прутки (мм)
        
        order.items.forEach(item => {
            const quantity = item.quantity || 1;
            const productName = item.product;
            const size = item.size;
            
            console.log(`Расчет материалов для ${productName} размер ${size}, кол-во ${quantity}`);
            
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
                        areaPerUnit: bracket.area || bracket.weight,
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
                        areaPerUnit: lyre.area || lyre.weight,
                        quantity: quantity,
                        totalArea: (lyre.area || lyre.weight) * quantity
                    });
                }
            }
            
            // 4. Прутки
            const rodMatches = this.materialsDB.rods.filter(r => r.product === productName);
            rodMatches.forEach(rod => {
                rods.push({
                    name: rod.rodType,
                    valuePerUnit: rod.value,
                    unit: rod.unit || 'мм',
                    quantity: quantity,
                    totalValue: rod.value * quantity
                });
            });
            
            // 5. Профили из техкарты изделия
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
            } else {
                console.warn(`Не найдены спецификации для ${productName} размер ${size}`);
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
    
    // ============== ФОРМИРОВАНИЕ ОТЧЕТА ==============
    
    async generateReportHTML(order) {
        const { sheetMaterials, profiles, rods } = this.calculateMaterials(order);
        
        if (sheetMaterials.length === 0 && profiles.length === 0 && rods.length === 0) {
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
                            <th style="padding: 8px; text-align: left;">RAL</th>
                            <th style="padding: 8px; text-align: left;">Текстура</th>
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
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.ral || '-'}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.texture || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
        `;
        
        // Листовые материалы (м²)
        if (sheetMaterials.length > 0) {
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
            
            sheetMaterials.forEach(item => {
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
        
        // Прутки (мм)
        if (rods.length > 0) {
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
            
            rods.forEach(rod => {
                html += `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rod.name}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${rod.valuePerUnit}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${rod.quantity}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${rod.totalValue}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        }
        
        html += `</div>`;
        return html;
    }
}
