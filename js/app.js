// Получение количества операций для изделия
function getOperationCount(productName, siteKey) {
    const operations = {
        // XRAY 6-T2 серия
        'XRAY 6-T2 BT 180': { 'tokarniy': 3, 'slesarniy': 7, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BT 200': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BT 220': { 'tokarniy': 3, 'slesarniy': 7, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BT 220 Шторка х2': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BT 240 Шторка': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BZ 180': { 'tokarniy': 3, 'slesarniy': 7, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BZ 200 Шторка': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BZ 220': { 'tokarniy': 4, 'slesarniy': 7, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BZ 220 Шторка х2': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BZ 240 Шторка': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        'XRAY 6-T2 BZ 240 Шторка х2': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 2 },
        
        // XGRAY
        'XGRAY v.1': { 'tokarniy': 3, 'slesarniy': 3, 'frezerniy': 2, 'lazerno': 1, 'polimerniy': 4 },
        'XGRAY v.2': { 'tokarniy': 3, 'slesarniy': 3, 'frezerniy': 2, 'lazerno': 5, 'polimerniy': 5 },
        
        // XSMART
        'XSMART mini': { 'tokarniy': 2, 'slesarniy': 1, 'frezerniy': 2, 'lazerno': 5, 'polimerniy': 4 },
        'XSMART': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 2, 'lazerno': 4, 'polimerniy': 5 },
        
        // XLUMO
        'XLUMO': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 5, 'lazerno': 5, 'polimerniy': 4 },
        'XLUMO 1-6': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 4, 'lazerno': 4, 'polimerniy': 4 },
        'XLUMO Двунаправленный': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 3, 'lazerno': 4, 'polimerniy': 4 },
        'XLUMO PROV': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 3, 'lazerno': 5, 'polimerniy': 4 },
        
        // XGIRO
        'XGIRO': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 2, 'lazerno': 4, 'polimerniy': 4 },
        
        // XVISION
        'XVISION': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 1 },
        
        // XBAR-SW
        'XBAR-SW': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 5, 'polimerniy': 4 },
        
        // XLITE
        'XLITE': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 2, 'lazerno': 4, 'polimerniy': 4 },
        
        // XROLL
        'XROLL-lite P': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 0, 'polimerniy': 2 },
        'XROLL-lite K': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 2 },
        
        // XSTRONG
        'XSTRONG': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 5, 'polimerniy': 3 },
        
        // XYELLOW
        'XYELLOW': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 1, 'polimerniy': 3 },
        
        // XLINE
        'XLINE': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 0, 'polimerniy': 2 },
        
        // XGLOW
        'XGLOW mini': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 0, 'lazerno': 2, 'polimerniy': 3 },
        'XGLOW': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 0, 'lazerno': 2, 'polimerniy': 5 },
        
        // XRAY другие
        'XRAY 1': { 'tokarniy': 5, 'slesarniy': 4, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 2 },
        'XRAY 3': { 'tokarniy': 5, 'slesarniy': 5, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 2 },
        'XRAY 3-2': { 'tokarniy': 7, 'slesarniy': 4, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 2 },
        'XRAY 3-GRP': { 'tokarniy': 5, 'slesarniy': 3, 'frezerniy': 0, 'lazerno': 2, 'polimerniy': 2 },
        'XRAY 6': { 'tokarniy': 5, 'slesarniy': 5, 'frezerniy': 0, 'lazerno': 3, 'polimerniy': 3 },
        'XRAY 6 RGBW': { 'tokarniy': 6, 'slesarniy': 5, 'frezerniy': 0, 'lazerno': 3, 'polimerniy': 3 },
        'XRAY 6-2 проходной': { 'tokarniy': 6, 'slesarniy': 5, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 2 },
        'XRAY 6-2 оконечный': { 'tokarniy': 6, 'slesarniy': 5, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 2 },
        'XRAY 6T Накладной': { 'tokarniy': 5, 'slesarniy': 6, 'frezerniy': 0, 'lazerno': 3, 'polimerniy': 4 },
        'XRAY 6T BZ 120': { 'tokarniy': 4, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 5, 'polimerniy': 4 },
        'XRAY 6T BT 140 Шторка': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 5, 'polimerniy': 4 },
        'XRAY 6T RGBW BT 150': { 'tokarniy': 3, 'slesarniy': 8, 'frezerniy': 0, 'lazerno': 5, 'polimerniy': 4 },
        'XRAY 9': { 'tokarniy': 7, 'slesarniy': 5, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 4 },
        'XRAY 9S': { 'tokarniy': 3, 'slesarniy': 5, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 3 },
        'XRAY 12S': { 'tokarniy': 3, 'slesarniy': 5, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 3 },
        'XRAY 18': { 'tokarniy': 7, 'slesarniy': 5, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 5 },
        'XRAY 18S': { 'tokarniy': 3, 'slesarniy': 5, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 3 },
        'XRAY 36': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 5 },
        'XRAY 36S': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 3 },
        
        // XSLOPE
        'XSLOPE': { 'tokarniy': 5, 'slesarniy': 6, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 3 },
        
        // XPIXEL
        'XPIXEL BIN v.1': { 'tokarniy': 3, 'slesarniy': 3, 'frezerniy': 1, 'lazerno': 0, 'polimerniy': 2 },
        'XPIXEL BIN v.2': { 'tokarniy': 4, 'slesarniy': 2, 'frezerniy': 1, 'lazerno': 0, 'polimerniy': 2 },
        'XPIXEL BIN v.3': { 'tokarniy': 4, 'slesarniy': 4, 'frezerniy': 1, 'lazerno': 2, 'polimerniy': 3 },
        'XPIXEL OVHD': { 'tokarniy': 3, 'slesarniy': 1, 'frezerniy': 0, 'lazerno': 1, 'polimerniy': 2 },
        
        // XPOINT
        'XPOINT OVHD': { 'tokarniy': 2, 'slesarniy': 1, 'frezerniy': 0, 'lazerno': 0, 'polimerniy': 1 },
        
        // XSPOT
        'XSPOT': { 'tokarniy': 5, 'slesarniy': 3, 'frezerniy': 0, 'lazerno': 2, 'polimerniy': 2 },
        
        // XWHITE
        'XWHITE': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 0, 'polimerniy': 3 },
        
        // XDISK
        'XDISK': { 'tokarniy': 8, 'slesarniy': 5, 'frezerniy': 1, 'lazerno': 0, 'polimerniy': 3 },
        
        // ACENTO
        'ACENTO 3T': { 'tokarniy': 4, 'slesarniy': 6, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 3 },
        'ACENTO 4': { 'tokarniy': 3, 'slesarniy': 6, 'frezerniy': 0, 'lazerno': 4, 'polimerniy': 3 },
        
        // XEYES
        'XEYES 130*90 1': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES 130*90 2': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES 130*90 3': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES 130*90 4': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES 130*120 1': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES 130*120 2': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES 130*120 3': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES 130*120 4': { 'tokarniy': 0, 'slesarniy': 6, 'frezerniy': 1, 'lazerno': 3, 'polimerniy': 2 },
        'XEYES mini-1': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 0, 'lazerno': 5, 'polimerniy': 4 },
        
        // XFOCUS
        'XFOCUS': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 1, 'lazerno': 5, 'polimerniy': 3 },
        
        // XMODULE
        'XMODULE-2x2': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 0, 'lazerno': 2, 'polimerniy': 1 },
        'XMODULE-6x2': { 'tokarniy': 0, 'slesarniy': 0, 'frezerniy': 0, 'lazerno': 1, 'polimerniy': 0 }
    };
    
    // Пробуем найти точное совпадение
    if (operations[productName] && operations[productName][siteKey] !== undefined) {
        return operations[productName][siteKey];
    }
    
    // Пробуем найти частичное совпадение
    for (let key in operations) {
        if (productName.includes(key) || key.includes(productName)) {
            if (operations[key] && operations[key][siteKey] !== undefined) {
                return operations[key][siteKey];
            }
        }
    }
    
    return 1; // По умолчанию
}
