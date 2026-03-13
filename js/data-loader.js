// Загрузка всех данных из CSV файлов

// Основная функция загрузки продуктов
async function loadProducts() {
    console.log('Загрузка списка продуктов...');
    
    // ПОЛНЫЙ список продуктов с размерами из CSV файлов
    const products = [
        // XGRAY v.1 - размеры из файла ClusterX - Тех карта XGRAY v.1.csv
        { 
            name: 'XGRAY v.1', 
            sizes: ['116', '216', '316', '416', '516', '612', '712', '812', '912', '1 012', '1 108', '1 208', '1 308', '1 408', '1 508']
        },
        // XGRAY v.2 - размеры из файла ClusterX - Тех карта XGRAY v.2.csv
        { 
            name: 'XGRAY v.2', 
            sizes: ['116', '216', '316', '416', '516', '612', '712', '812', '912', '1 012', '1 108', '1 208', '1 308', '1 408', '1 508']
        },
        // XSMART mini - размеры из файла ClusterX - Тех карта XSMART mini.csv
        { 
            name: 'XSMART mini', 
            sizes: ['XSMART mini 1', 'XSMART mini 2', 'XSMART mini 3', 'XSMART mini 4', 'XSMART mini 5', 'XSMART mini 6']
        },
        // XLUMO Двунаправленный - размеры из файла ClusterX - Тех карта XLUMO Двунаправленный.csv
        { 
            name: 'XLUMO Двунаправленный', 
            sizes: ['XLUMOx2-1', 'XLUMOx2-2', 'XLUMOx2-3', 'XLUMOx2-4', 'XLUMOx2-5', 'XLUMOx2-6']
        },
        // XSMART - размеры из файла ClusterX - Тех карта XSMART.csv
        { 
            name: 'XSMART', 
            sizes: ['XSMART-2', 'XSMART-3', 'XSMART-4', 'XSMART-5', 'XSMART-6', '500', '1000', '1500']
        },
        // XLUMO 1-6 - размеры из файла ClusterX - Тех карта XLUMO 1-6.csv
        { 
            name: 'XLUMO 1-6', 
            sizes: ['XLUMO-1', 'XLUMO-2', 'XLUMO-3', 'XLUMO-4', 'XLUMO-5', 'XLUMO-6']
        },
        // XGIRO - размеры из файла ClusterX - Тех карта XGIRO.csv
        { 
            name: 'XGIRO', 
            sizes: ['130', '220', '310', '410', '510', '600', '700', '800', '900', '1000']
        },
        // XVISION - размеры из файла ClusterX - Тех карта XVISION.csv
        { 
            name: 'XVISION', 
            sizes: ['110', '125', '210', '250', '310', '375', '410', '500', '510', '600', '625', '700', '750', '800', '875', '900', '1000', '1125', '1250', '1375', '1500']
        },
        // XBAR-SW - размеры из файла ClusterX - Тех карта XBAR-SW.csv
        { 
            name: 'XBAR-SW', 
            sizes: ['1000', '1500']
        },
        // XLITE - размеры из файла ClusterX - Тех карта XLITE.csv
        { 
            name: 'XLITE', 
            sizes: ['125', '250', '375', '500', '625', '750', '875', '1000', '1125', '1250', '1375', '1500']
        },
        // XROLL-lite P - размеры из файла ClusterX - Тех карта XROLL-lite P.csv
        { 
            name: 'XROLL-lite P', 
            sizes: ['205', '305', '405', '505', '600', '700', '800', '900', '1000', '1100', '1200', '1300', '1400', '1496']
        },
        // XROLL-lite K - размеры из файла ClusterX - Тех карта XROLL-lite K.csv
        { 
            name: 'XROLL-lite K', 
            sizes: ['205', '305', '405', '505', '600', '700', '800', '900', '1000', '1100', '1200', '1300', '1400', '1496']
        },
        // XLUMO - размеры из файла ClusterX - Тех карта XLUMO.csv
        { 
            name: 'XLUMO', 
            sizes: ['125', '250', '375', '625', '750', '875', '1125', '1250', '1375', '1500']
        },
        // XLUMO PROV - размеры из файла ClusterX - Тех карта XLUMO PROV.csv
        { 
            name: 'XLUMO PROV', 
            sizes: ['125', '250', '375', '500', '625', '750', '875', '1000', '1125', '1250', '1375', '1500']
        },
        // XSTRONG - размеры из файла ClusterX - Тех карта XSTRONG.csv
        { 
            name: 'XSTRONG', 
            sizes: ['XSTRONG-10', 'XSTRONG-20', 'XSTRONG-30', 'XSTRONG-20PW', 'XSTRONG-30PW', 'XSTRONG-40PW']
        },
        // XYELLOW - размеры из файла ClusterX - Тех карта XYELLOW.csv
        { 
            name: 'XYELLOW', 
            sizes: ['116', '216', '316', '416', '516', '612', '712', '812', '912', '1 012', '1 108', '1 208', '1 308', '1 408', '1 508']
        },
        // XLINE - размеры из файла ClusterX - Тех карта XLINE.csv
        { 
            name: 'XLINE', 
            sizes: ['106', '206', '306', '406', '506', '600', '700', '800', '900', '1 000', '1 094', '1 194', '1 294', '1 394', '1 494']
        },
        // XGLOW mini - размеры из файла ClusterX - Тех карта XGLOW mini.csv
        { 
            name: 'XGLOW mini', 
            sizes: ['125', '250', '375', '500', '510', '625', '750', '875', '1 000', '1 125', '1 250', '1 375', '1 490', '1 500']
        },
        // XGLOW - размеры из файла ClusterX - Тех карта XGLOW.csv
        { 
            name: 'XGLOW', 
            sizes: ['510', '1 000', '1 490']
        },
        // XEYES 130*90 1
        { 
            name: 'XEYES 130*90 1', 
            sizes: ['Стандартный']
        },
        // XEYES 130*90 2
        { 
            name: 'XEYES 130*90 2', 
            sizes: ['Стандартный']
        },
        // XEYES 130*90 3
        { 
            name: 'XEYES 130*90 3', 
            sizes: ['Стандартный']
        },
        // XEYES 130*90 4
        { 
            name: 'XEYES 130*90 4', 
            sizes: ['Стандартный']
        },
        // XEYES 130*120 1
        { 
            name: 'XEYES 130*120 1', 
            sizes: ['Стандартный']
        },
        // XEYES 130*120 2
        { 
            name: 'XEYES 130*120 2', 
            sizes: ['Стандартный']
        },
        // XEYES 130*120 3
        { 
            name: 'XEYES 130*120 3', 
            sizes: ['Стандартный']
        },
        // XEYES 130*120 4
        { 
            name: 'XEYES 130*120 4', 
            sizes: ['Стандартный']
        },
        // XEYES mini-1
        { 
            name: 'XEYES mini-1', 
            sizes: ['Стандартный']
        },
        // XFOCUS
        { 
            name: 'XFOCUS', 
            sizes: ['Стандартный']
        },
        // XMODULE-2x2
        { 
            name: 'XMODULE-2x2', 
            sizes: ['Стандартный']
        },
        // XMODULE-6x2
        { 
            name: 'XMODULE-6x2', 
            sizes: ['Стандартный']
        },
        // XPIXEL BIN v.1
        { 
            name: 'XPIXEL BIN v.1', 
            sizes: ['Стандартный']
        },
        // XPIXEL BIN v.2
        { 
            name: 'XPIXEL BIN v.2', 
            sizes: ['Стандартный']
        },
        // XPIXEL BIN v.3
        { 
            name: 'XPIXEL BIN v.3', 
            sizes: ['Стандартный']
        },
        // XPIXEL OVHD
        { 
            name: 'XPIXEL OVHD', 
            sizes: ['Стандартный']
        },
        // XPOINT OVHD
        { 
            name: 'XPOINT OVHD', 
            sizes: ['Стандартный']
        },
        // XRAY 1
        { 
            name: 'XRAY 1', 
            sizes: ['Стандартный']
        },
        // XRAY 3
        { 
            name: 'XRAY 3', 
            sizes: ['Стандартный']
        },
        // XRAY 3-2
        { 
            name: 'XRAY 3-2', 
            sizes: ['Стандартный']
        },
        // XRAY 3-GRP
        { 
            name: 'XRAY 3-GRP', 
            sizes: ['Стандартный']
        },
        // XRAY 6
        { 
            name: 'XRAY 6', 
            sizes: ['Стандартный']
        },
        // XRAY 6 RGBW
        { 
            name: 'XRAY 6 RGBW', 
            sizes: ['Стандартный']
        },
        // XRAY 6-2 оконечный
        { 
            name: 'XRAY 6-2 оконечный', 
            sizes: ['Стандартный']
        },
        // XRAY 6-2 проходной
        { 
            name: 'XRAY 6-2 проходной', 
            sizes: ['Стандартный']
        },
        // XRAY 6-T2 BT 180
        { 
            name: 'XRAY 6-T2 BT 180', 
            sizes: ['Стандартный']
        },
        // XRAY 6-T2 BT 200
        { 
            name: 'XRAY 6-T2 BT 200', 
            sizes: ['Стандартный']
        },
        // XRAY 6-T2 BT 220
        { 
            name: 'XRAY 6-T2 BT 220', 
            sizes: ['Стандартный']
        },
        // XRAY 6-T2 BT 220 Шторка х2
        { 
            name: 'XRAY 6-T2 BT 220 Шторка х2', 
            sizes: ['Стандартный']
        },
        // XRAY 6-T2 BT 240 Шторка
        { 
            name: 'XRAY 6-T2 BT 240 Шторка', 
            sizes: ['Стандартный']
        },
        // XRAY 6-T2 BZ 180
        { 
            name: 'XRAY 6-T2 BZ 180', 
            sizes: ['Стандартный']
        },
        // XRAY 6-T2 BZ 200 Шторка
        { 
            name: 'XRAY 6-T2 BZ 200 Шторка', 
            sizes: ['Стандартный']
        },
        // XRAY 6-T2 BZ 220
        { 
            name: 'XRAY 6-T2 BZ 220', 
            sizes: ['Стандартный']
        },
        // XRAY 6-T2 BZ 220 Шторка х2
        { 
            name: 'XRAY 6-T2 BZ 220 Шторка х2', 
            sizes: ['Стандартный']
        },
        // XRAY 6-T2 BZ 240 Шторка
        { 
            name: 'XRAY 6-T2 BZ 240 Шторка', 
            sizes: ['Стандартный']
        },
        // XRAY 6-T2 BZ 240 Шторка х2
        { 
            name: 'XRAY 6-T2 BZ 240 Шторка х2', 
            sizes: ['Стандартный']
        },
        // XRAY 6T Накладной
        { 
            name: 'XRAY 6T Накладной', 
            sizes: ['Стандартный']
        },
        // XRAY 6T BZ 120
        { 
            name: 'XRAY 6T BZ 120', 
            sizes: ['Стандартный']
        },
        // XRAY 6T BT 140 Шторка
        { 
            name: 'XRAY 6T BT 140 Шторка', 
            sizes: ['Стандартный']
        },
        // XRAY 6T RGBW BT 150
        { 
            name: 'XRAY 6T RGBW BT 150', 
            sizes: ['Стандартный']
        },
        // XRAY 9
        { 
            name: 'XRAY 9', 
            sizes: ['Стандартный']
        },
        // XRAY 9S
        { 
            name: 'XRAY 9S', 
            sizes: ['Стандартный']
        },
        // XRAY 12S
        { 
            name: 'XRAY 12S', 
            sizes: ['Стандартный']
        },
        // XRAY 18
        { 
            name: 'XRAY 18', 
            sizes: ['Стандартный']
        },
        // XRAY 18S
        { 
            name: 'XRAY 18S', 
            sizes: ['Стандартный']
        },
        // XRAY 36
        { 
            name: 'XRAY 36', 
            sizes: ['Стандартный']
        },
        // XRAY 36S
        { 
            name: 'XRAY 36S', 
            sizes: ['Стандартный']
        },
        // XSLOPE
        { 
            name: 'XSLOPE', 
            sizes: ['Стандартный']
        },
        // XSPOT
        { 
            name: 'XSPOT', 
            sizes: ['Стандартный']
        },
        // XWHITE
        { 
            name: 'XWHITE', 
            sizes: ['Стандартный']
        },
        // ACENTO 3T
        { 
            name: 'ACENTO 3T', 
            sizes: ['Стандартный']
        },
        // ACENTO 4
        { 
            name: 'ACENTO 4', 
            sizes: ['Стандартный']
        },
        // XDISK
        { 
            name: 'XDISK', 
            sizes: ['Стандартный']
        }
    ];
    
    console.log('Загружено продуктов:', products.length);
    console.log('Пример:', products[0]); // Проверка первого продукта
    return products;
}

// Загрузка размеров для выбранного изделия
async function loadProductSizes(productName) {
    const products = await loadProducts();
    const product = products.find(p => p.name === productName);
    return product ? product.sizes : ['Стандартный'];
}

// Загрузка кронштейнов
async function loadBrackets() {
    console.log('Загрузка кронштейнов...');
    
    // Полный список кронштейнов из файла ClusterX - Тех карта Кронштейны.csv
    return [
        { name: 'PU-5', material: 'AISI 430', weight: 0.01 },
        { name: 'PU-6', material: 'AISI 430', weight: 0.0104 },
        { name: 'PU-7', material: 'AISI 430', weight: 0.0108 },
        { name: 'PU-8', material: 'AISI 430', weight: 0.0112 },
        { name: 'PU-10', material: 'AISI 430', weight: 0.0122 },
        { name: 'PU-12', material: 'AISI 430', weight: 0.0146 },
        { name: 'PU-15', material: 'AISI 430', weight: 0.0164 },
        { name: 'PU-20', material: 'AISI 430', weight: 0.0192 },
        { name: 'PU-21', material: 'AISI 430', weight: 0.0202 },
        { name: 'PU-25', material: 'AISI 430', weight: 0.0228 },
        { name: 'PU-26', material: 'AISI 430', weight: 0.0236 },
        { name: 'PU-38', material: 'AISI 430', weight: 0.0294 },
        { name: 'PG-10', material: 'AISI 430', weight: 0.014 },
        { name: 'PG-15', material: 'AISI 430', weight: 0.0168 },
        { name: 'PG-20', material: 'AISI 430', weight: 0.0196 },
        { name: 'LU-5', material: 'AISI 430', weight: 0.006 },
        { name: 'LU-6', material: 'AISI 430', weight: 0.0064 },
        { name: 'LU-7', material: 'AISI 430', weight: 0.007 },
        { name: 'LU-10', material: 'AISI 430', weight: 0.0084 },
        { name: 'LU-15', material: 'AISI 430', weight: 0.0108 },
        { name: 'LU-20', material: 'AISI 430', weight: 0.0132 },
        { name: 'LU-30', material: 'AISI 430', weight: 0.0178 },
        { name: 'A-6', material: 'AISI 430', weight: 0.0075 },
        { name: 'A-10', material: 'AISI 430', weight: 0.0101 },
        { name: 'A-12', material: 'AISI 430', weight: 0.0115 },
        { name: 'A-15', material: 'AISI 430', weight: 0.0133 },
        { name: 'A-20', material: 'AISI 430', weight: 0.0165 },
        { name: 'A-25', material: 'AISI 430', weight: 0.0197 },
        { name: 'ACENTO', material: 'AISI 430', weight: 0.0073 },
        { name: 'B-7', material: 'AISI 430', weight: 0.0105 },
        { name: 'B-10', material: 'AISI 430', weight: 0.0127 },
        { name: 'B-15', material: 'AISI 430', weight: 0.0163 },
        { name: 'B-20', material: 'AISI 430', weight: 0.0199 },
        { name: 'B-25', material: 'AISI 430', weight: 0.0235 },
        { name: 'B(T)-7', material: 'AISI 430', weight: 0.0106 },
        { name: 'B(T)-10', material: 'AISI 430', weight: 0.0128 },
        { name: 'B(T)-15', material: 'AISI 430', weight: 0.0164 },
        { name: 'B(T)-20', material: 'AISI 430', weight: 0.02 },
        { name: 'B(T)-25', material: 'AISI 430', weight: 0.0236 },
        { name: 'B(Z)-9', material: 'AISI 430', weight: 0.0033 },
        { name: 'B(Z)-10', material: 'AISI 430', weight: 0.0033 },
        { name: 'B(Z)-Спец', material: 'AISI 430', weight: 0.0083 },
        { name: 'B(Z)-15', material: 'AISI 430', weight: 0.0033 },
        { name: 'C-11', material: 'AISI 430', weight: 0.0151 },
        { name: 'C-15', material: 'AISI 430', weight: 0.018 },
        { name: 'C-20', material: 'AISI 430', weight: 0.0216 },
        { name: 'C-25', material: 'AISI 430', weight: 0.0252 },
        { name: 'C-28', material: 'AISI 430', weight: 0.0273 },
        { name: 'D-15', material: 'AISI 430', weight: 0.0191 },
        { name: 'D-20', material: 'AISI 430', weight: 0.0227 },
        { name: 'D-25', material: 'AISI 430', weight: 0.0263 },
        { name: 'D-30', material: 'AISI 430', weight: 0.0299 },
        { name: 'F-15', material: 'AISI 430', weight: 0.0184 },
        { name: 'F-20', material: 'AISI 430', weight: 0.022 },
        { name: 'F-25', material: 'AISI 430', weight: 0.0255 },
        { name: 'G-15', material: 'AISI 430', weight: 0.0269 },
        { name: 'XOPTIC', material: 'AISI 430', weight: 0.0076 },
        { name: 'M-10', material: 'AISI 430', weight: 0.0051 },
        { name: 'M-15', material: 'AISI 430', weight: 0.0061 },
        { name: 'M-20', material: 'AISI 430', weight: 0.0071 },
        { name: 'NL-50', material: 'AISI 430', weight: 0.0031 },
        { name: 'NL-150', material: 'AISI 430', weight: 0.0043 },
        { name: 'NL-200', material: 'AISI 430', weight: 0.0067 },
        { name: 'NL-200-2', material: 'AISI 430', weight: 0.0073 },
        { name: 'NP-150-2', material: 'AISI 430', weight: 0.0104 },
        { name: 'P-5', material: 'AISI 430', weight: 0.0055 },
        { name: 'P-6', material: 'AISI 430', weight: 0.0059 },
        { name: 'P-10', material: 'AISI 430', weight: 0.0072 },
        { name: 'P-15', material: 'AISI 430', weight: 0.009 },
        { name: 'P-20', material: 'AISI 430', weight: 0.0107 },
        { name: 'P-100-2(v2)', material: 'AISI 430', weight: 0.0082 },
        { name: 'PZ-6', material: 'AISI 430', weight: 0.0054 },
        { name: 'PZ-9', material: 'AISI 430', weight: 0.0081 },
        { name: 'PZ-15', material: 'AISI 430', weight: 0.0137 },
        { name: 'XRAY1', material: 'AISI 430', weight: 0.002 },
        { name: 'O-7', material: 'AISI 430', weight: 0.0042 },
        { name: 'O-10', material: 'AISI 430', weight: 0.0057 },
        { name: 'O-15', material: 'AISI 430', weight: 0.0137 },
        { name: 'XSMART-1 П5.5', material: 'AISI 430', weight: 0.0044 },
        { name: 'XSMART-2 П5.5', material: 'AISI 430', weight: 0.0049 },
        { name: 'XEYES mini', material: 'AISI 430', weight: 0.037 },
        { name: 'XPIXEL', material: 'AISI 430', weight: 0.0056 }
    ];
}

// Загрузка лир
async function loadLyres() {
    console.log('Загрузка лир...');
    
    // Полный список лир из файла ClusterX - Тех карта Лиры.csv
    return [
        { name: '(L-серия) лира', material: 'AISI 430', weight: 0.0024 },
        { name: '(P-серия) лира', material: 'AISI 430', weight: 0.005 },
        { name: '(P-серия) лира XGIRO', material: 'AISI 430', weight: 0.0028 },
        { name: 'Лира XOPTIC-1 (К)', material: 'AISI 430', weight: 0.0037 },
        { name: 'Лира PZ-6', material: 'AISI 430', weight: 0.0076 },
        { name: 'Лира PZ-9', material: 'AISI 430', weight: 0.0088 },
        { name: 'Лира PZ-15', material: 'AISI 430', weight: 0.0112 },
        { name: 'Лира Q', material: 'AISI 430', weight: 0.0038 },
        { name: 'Лира O', material: 'AISI 430', weight: 0.0037 },
        { name: 'Лира XSTRONG', material: 'AISI 430', weight: 0.0034 },
        { name: 'Лира П-5.5 спец. XSMART-1', material: 'AISI 430', weight: 0.0029 },
        { name: 'Лира П-5.5 спец. XSMART-2', material: 'AISI 430', weight: 0.0033 }
    ];
}