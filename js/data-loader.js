// ============== ЗАГРУЗКА СПИСКА ПРОДУКТОВ ==============

async function loadProducts() {
    console.log('Загрузка списка продуктов...');
    
    const products = [
        // XGRAY v.1
        { name: 'XGRAY v.1', sizes: ['116', '216', '316', '416', '516', '612', '712', '812', '912', '1012', '1108', '1208', '1308', '1408', '1508'] },
        
        // XGRAY v.2
        { name: 'XGRAY v.2', sizes: ['116', '216', '316', '416', '516', '612', '712', '812', '912', '1012', '1108', '1208', '1308', '1408', '1508'] },
        
        // XSMART MINI
        { name: 'XSMART MINI', sizes: ['XSMART mini 1', 'XSMART mini 2', 'XSMART mini 3', 'XSMART mini 4', 'XSMART mini 5', 'XSMART mini 6'] },
        
        // XLUMO Двунаправленный
        { name: 'XLUMO Двунаправленный', sizes: ['XLUMOx2-1', 'XLUMOx2-2', 'XLUMOx2-3', 'XLUMOx2-4', 'XLUMOx2-5', 'XLUMOx2-6'] },
        
        // XSMART
        { name: 'XSMART', sizes: ['XSMART-2', 'XSMART-3', 'XSMART-4', 'XSMART-5', 'XSMART-6', '500', '1000', '1500'] },
        
        // XLUMO 1-6
        { name: 'XLUMO 1-6', sizes: ['XLUMO-1', 'XLUMO-2', 'XLUMO-3', 'XLUMO-4', 'XLUMO-5', 'XLUMO-6'] },
        
        // XLUMO
        { name: 'XLUMO', sizes: ['125', '250', '300', '375', '500', '600', '625', '700', '750', '800', '875', '900', '1000', '1100', '1125', '1200', '1250', '1300', '1375', '1400', '1500'] },
        
        // XLUMO PROV
        { name: 'XLUMO PROV', sizes: ['125', '250', '375', '500', '625', '750', '875', '1000', '1125', '1250', '1375', '1500'] },
        
        // XGIRO
        { name: 'XGIRO', sizes: ['130', '220', '310', '410', '510', '600', '700', '800', '900', '1000'] },
        
        // XVISION
        { name: 'XVISION', sizes: ['110', '125', '210', '250', '310', '375', '410', '500', '510', '600', '625', '700', '750', '800', '875', '900', '1000', '1125', '1250', '1375', '1500'] },
        
        // XBAR-SW
        { name: 'XBAR-SW', sizes: ['1000', '1500'] },
        
        // XLITE
        { name: 'XLITE', sizes: ['125', '250', '375', '500', '625', '750', '875', '1000', '1125', '1250', '1375', '1500'] },
        
        // XROLL-lite P
        { name: 'XROLL-lite P', sizes: ['205', '305', '405', '505', '600', '700', '800', '900', '1000', '1100', '1200', '1300', '1400', '1496'] },
        
        // XROLL-lite K
        { name: 'XROLL-lite K', sizes: ['205', '305', '405', '505', '600', '700', '800', '900', '1000', '1100', '1200', '1300', '1400', '1496'] },
        
        // XGLOW
        { name: 'XGLOW', sizes: ['510', '1000', '1490'] },
        
        // XGLOW mini
        { name: 'XGLOW mini', sizes: ['125', '250', '375', '500', '510', '625', '750', '875', '1000', '1125', '1250', '1375', '1490', '1500'] },
        
        // XLINE
        { name: 'XLINE', sizes: ['106', '206', '306', '406', '506', '600', '700', '800', '900', '1000', '1094', '1194', '1294', '1394', '1494'] },
        
        // XSTRONG
        { name: 'XSTRONG', sizes: ['XSTRONG-10', 'XSTRONG-20', 'XSTRONG-30', 'XSTRONG-20PW', 'XSTRONG-30PW', 'XSTRONG-40PW'] },
        
        // XYELLOW
        { name: 'XYELLOW', sizes: ['116', '216', '316', '416', '516', '612', '712', '812', '912', '1012', '1108', '1208', '1308', '1408', '1508'] },
        
        // XEYES 130*90 1-4
        { name: 'XEYES 130*90 1', sizes: ['Стандартный'] },
        { name: 'XEYES 130*90 2', sizes: ['Стандартный'] },
        { name: 'XEYES 130*90 3', sizes: ['Стандартный'] },
        { name: 'XEYES 130*90 4', sizes: ['Стандартный'] },
        
        // XEYES 130*120 1-4
        { name: 'XEYES 130*120 1', sizes: ['Стандартный'] },
        { name: 'XEYES 130*120 2', sizes: ['Стандартный'] },
        { name: 'XEYES 130*120 3', sizes: ['Стандартный'] },
        { name: 'XEYES 130*120 4', sizes: ['Стандартный'] },
        
        // XEYES mini-1
        { name: 'XEYES mini-1', sizes: ['Стандартный'] },
        
        // XFOCUS
        { name: 'XFOCUS', sizes: ['Стандартный'] },
        
        // XMODULE-2x2
        { name: 'XMODULE-2x2', sizes: ['Стандартный'] },
        
        // XMODULE-6x2
        { name: 'XMODULE-6x2', sizes: ['Стандартный'] },
        
        // XPIXEL BIN v.1-3
        { name: 'XPIXEL BIN v.1', sizes: ['Стандартный'] },
        { name: 'XPIXEL BIN v.2', sizes: ['Стандартный'] },
        { name: 'XPIXEL BIN v.3', sizes: ['Стандартный'] },
        
        // XPIXEL OVHD
        { name: 'XPIXEL OVHD', sizes: ['Стандартный'] },
        
        // XPOINT OVHD
        { name: 'XPOINT OVHD', sizes: ['Стандартный'] },
        
        // XRAY серия
        { name: 'XRAY 1', sizes: ['Стандартный'] },
        { name: 'XRAY 3', sizes: ['Стандартный'] },
        { name: 'XRAY 3-2', sizes: ['Стандартный'] },
        { name: 'XRAY 3-GRP', sizes: ['Стандартный'] },
        { name: 'XRAY 6', sizes: ['Стандартный'] },
        { name: 'XRAY 6 RGBW', sizes: ['Стандартный'] },
        { name: 'XRAY 6-2 проходной', sizes: ['Стандартный'] },
        { name: 'XRAY 6-2 оконечный', sizes: ['Стандартный'] },
        { name: 'XRAY 6-T2 BT 180', sizes: ['Стандартный'] },
        { name: 'XRAY 6-T2 BT 200 шторка', sizes: ['Стандартный'] },
        { name: 'XRAY 6-T2 BT 220', sizes: ['Стандартный'] },
        { name: 'XRAY 6-T2 BT 220 Шторка х2', sizes: ['Стандартный'] },
        { name: 'XRAY 6-T2 BT 240 Шторка', sizes: ['Стандартный'] },
        { name: 'XRAY 6-T2 BT 240 Шторка х2', sizes: ['Стандартный'] },
        { name: 'XRAY 6-T2 BZ 180', sizes: ['Стандартный'] },
        { name: 'XRAY 6-T2 BZ 200 Шторка', sizes: ['Стандартный'] },
        { name: 'XRAY 6-T2 BZ 220', sizes: ['Стандартный'] },
        { name: 'XRAY 6-T2 BZ 220 Шторка х2', sizes: ['Стандартный'] },
        { name: 'XRAY 6-T2 BZ 240 Шторка', sizes: ['Стандартный'] },
        { name: 'XRAY 6-T2 BZ 240 Шторка х2', sizes: ['Стандартный'] },
        { name: 'XRAY 6T Накладной', sizes: ['Стандартный'] },
        { name: 'XRAY 6T BT 120', sizes: ['Стандартный'] },
        { name: 'XRAY 6T BT 140 Шторка', sizes: ['Стандартный'] },
        { name: 'XRAY 6T BZ 120', sizes: ['Стандартный'] },
        { name: 'XRAY 6T BZ 140 Шторка', sizes: ['Стандартный'] },
        { name: 'XRAY 6T RGBW BT 150', sizes: ['Стандартный'] },
        { name: 'XRAY 9', sizes: ['Стандартный'] },
        { name: 'XRAY 9S', sizes: ['Стандартный'] },
        { name: 'XRAY 12S', sizes: ['Стандартный'] },
        { name: 'XRAY 18', sizes: ['Стандартный'] },
        { name: 'XRAY 18S', sizes: ['Стандартный'] },
        { name: 'XRAY 36', sizes: ['Стандартный'] },
        { name: 'XRAY 36S', sizes: ['Стандартный'] },
        
        // XSLOPE, XSPOT, XWHITE
        { name: 'XSLOPE', sizes: ['Стандартный'] },
        { name: 'XSPOT', sizes: ['Стандартный'] },
        { name: 'XWHITE', sizes: ['Стандартный'] },
        
        // ACENTO
        { name: 'ACENTO 3T', sizes: ['Стандартный'] },
        { name: 'ACENTO 4', sizes: ['Стандартный'] },
        
        // XDISK
        { name: 'XDISK', sizes: ['Стандартный'] }
    ];
    
    console.log('Загружено продуктов:', products.length);
    return products;
}

// Загрузка размеров для выбранного изделия
async function loadProductSizes(productName) {
    const products = await loadProducts();
    const product = products.find(p => p.name === productName);
    return product ? product.sizes : ['Стандартный'];
}
