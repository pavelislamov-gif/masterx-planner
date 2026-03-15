// ============== РАСЧЕТ МАТЕРИАЛОВ ==============

calculateMaterials(order) {
    // Результаты
    const otherSheetMaterials = []; // не AISI листы
    const profiles = []; // профили (мм)
    const rods = []; // прутки (мм)
    
    // Группировка AISI по источникам
    const aisi = {
        fromProducts: {},   // из изделий
        fromBrackets: {},   // из кронштейнов
        fromLyres: {}       // из лир
    };
    
    order.items.forEach(item => {
        const productQty = item.quantity || 1;
        const productName = item.product;
        const size = item.size;
        
        console.log(`→ ${productName} ${size} × ${productQty} шт`);
        
        // 1. AISI из техкарты изделия
        const spec = this.materialsDB.productSpecs[productName]?.[size];
        if (spec) {
            Object.entries(spec).forEach(([key, data]) => {
                const isAISI = key.includes('AISI') || 
                               key.includes('Нержавейка') || 
                               (data.material && data.material.includes('AISI'));
                
                if (isAISI) {
                    // Определяем толщину
                    let thickness = '2мм';
                    if (key.includes('1мм')) thickness = '1мм';
                    else if (key.includes('1.5мм')) thickness = '1.5мм';
                    else if (key.includes('2мм')) thickness = '2мм';
                    else if (key.includes('3мм')) thickness = '3мм';
                    
                    const value = data.value || 0;
                    const total = value * productQty;
                    
                    const keyName = `AISI 430 ${thickness}`;
                    
                    if (!aisi.fromProducts[keyName]) {
                        aisi.fromProducts[keyName] = {
                            name: keyName,
                            thickness: thickness,
                            total: 0,
                            items: []
                        };
                    }
                    
                    aisi.fromProducts[keyName].total += total;
                    aisi.fromProducts[keyName].items.push({
                        name: `${key} (${productName})`,
                        unit: value,
                        qty: productQty,
                        total: total
                    });
                } else {
                    // Не AISI — в профили
                    profiles.push({
                        name: key,
                        unit: data.value || 0,
                        unitType: data.unit || 'мм',
                        qty: productQty,
                        total: (data.value || 0) * productQty
                    });
                }
            });
        }
        
        // 2. Кронштейн
        if (item.bracket?.type && item.bracket.type !== 'отсутствует' && item.bracket.quantity > 0) {
            const bracket = this.materialsDB.brackets.find(b => b.name === item.bracket.type);
            if (bracket) {
                const thickness = bracket.thickness || '2мм';
                const area = bracket.area || 0;
                const totalQty = item.bracket.quantity * productQty;
                const totalArea = area * totalQty;
                
                const keyName = `AISI 430 ${thickness}`;
                
                if (!aisi.fromBrackets[keyName]) {
                    aisi.fromBrackets[keyName] = {
                        name: keyName,
                        thickness: thickness,
                        total: 0,
                        items: []
                    };
                }
                
                aisi.fromBrackets[keyName].total += totalArea;
                aisi.fromBrackets[keyName].items.push({
                    name: `Кронштейн ${item.bracket.type}`,
                    unit: area,
                    qty: totalQty,
                    total: totalArea
                });
            }
        }
        
        // 3. Лира
        if (item.lyre?.type && item.lyre.type !== 'отсутствует' && item.lyre.quantity > 0) {
            const lyre = this.materialsDB.lyres.find(l => l.name === item.lyre.type);
            if (lyre) {
                const thickness = lyre.thickness || '1.5мм';
                const area = lyre.area || 0;
                const totalQty = item.lyre.quantity * productQty;
                const totalArea = area * totalQty;
                
                const keyName = `AISI 430 ${thickness}`;
                
                if (!aisi.fromLyres[keyName]) {
                    aisi.fromLyres[keyName] = {
                        name: keyName,
                        thickness: thickness,
                        total: 0,
                        items: []
                    };
                }
                
                aisi.fromLyres[keyName].total += totalArea;
                aisi.fromLyres[keyName].items.push({
                    name: `Лира ${item.lyre.type}`,
                    unit: area,
                    qty: totalQty,
                    total: totalArea
                });
            }
        }
        
        // 4. Остальные листовые материалы (не AISI)
        const allSheets = [
            ...this.materialsDB.aluminum,
            ...this.materialsDB.steel,
            ...this.materialsDB.stainless,
            ...this.materialsDB.pvc,
            ...this.materialsDB.polycarbonate,
            ...this.materialsDB.other
        ];
        
        const sheetMatches = allSheets.filter(m => m.product === productName);
        sheetMatches.forEach(m => {
            // Пропускаем AISI
            if (m.material?.includes('AISI') || m.material?.includes('Нержавейка')) return;
            
            otherSheetMaterials.push({
                name: m.material || 'Лист',
                thickness: m.thickness || '—',
                unit: m.area || 0,
                qty: productQty,
                total: (m.area || 0) * productQty
            });
        });
        
        // 5. Прутки
        const rodMatches = this.materialsDB.rods.filter(r => r.product === productName);
        rodMatches.forEach(rod => {
            rods.push({
                name: rod.rodType || 'Пруток',
                unit: rod.value || 0,
                unitType: rod.unit || 'мм',
                qty: productQty,
                total: (rod.value || 0) * productQty
            });
        });
    });
    
    return {
        otherSheets: otherSheetMaterials,
        profiles,
        rods,
        aisi: {
            products: Object.values(aisi.fromProducts),
            brackets: Object.values(aisi.fromBrackets),
            lyres: Object.values(aisi.fromLyres)
        }
    };
}

// ============== ФОРМИРОВАНИЕ ОТЧЕТА ==============

async generateReportHTML(order) {
    const data = this.calculateMaterials(order);
    
    if (!data.otherSheets.length && !data.profiles.length && !data.rods.length &&
        !data.aisi.products.length && !data.aisi.brackets.length && !data.aisi.lyres.length) {
        return `<p>Нет данных</p>`;
    }
    
    let html = `<h3>📊 Отчет №${order.number}</h3>`;
    
    // Функция для форматирования
    const fmt = (val, dec = 4) => (val ?? 0).toFixed(dec);
    
    // AISI из изделий
    if (data.aisi.products.length) {
        html += `<h4>🔩 AISI из изделий</h4>`;
        data.aisi.products.forEach(g => {
            html += `<h5>${g.name}</h5><table><tr><th>Деталь</th><th>м²/шт</th><th>Кол-во</th><th>Всего м²</th></tr>`;
            g.items.forEach(i => html += `<tr><td>${i.name}</td><td>${fmt(i.unit)}</td><td>${i.qty}</td><td>${fmt(i.total)}</td></tr>`);
            html += `<tr><td colspan="3"><strong>Итого</strong></td><td><strong>${fmt(g.total)}</strong></td></tr></table>`;
        });
    }
    
    // AISI из кронштейнов
    if (data.aisi.brackets.length) {
        html += `<h4>🔩 AISI из кронштейнов</h4>`;
        data.aisi.brackets.forEach(g => {
            html += `<h5>${g.name}</h5><table><tr><th>Кронштейн</th><th>м²/шт</th><th>Кол-во</th><th>Всего м²</th></tr>`;
            g.items.forEach(i => html += `<tr><td>${i.name}</td><td>${fmt(i.unit)}</td><td>${i.qty}</td><td>${fmt(i.total)}</td></tr>`);
            html += `<tr><td colspan="3"><strong>Итого</strong></td><td><strong>${fmt(g.total)}</strong></td></tr></table>`;
        });
    }
    
    // AISI из лир
    if (data.aisi.lyres.length) {
        html += `<h4>🔩 AISI из лир</h4>`;
        data.aisi.lyres.forEach(g => {
            html += `<h5>${g.name}</h5><table><tr><th>Лира</th><th>м²/шт</th><th>Кол-во</th><th>Всего м²</th></tr>`;
            g.items.forEach(i => html += `<tr><td>${i.name}</td><td>${fmt(i.unit)}</td><td>${i.qty}</td><td>${fmt(i.total)}</td></tr>`);
            html += `<tr><td colspan="3"><strong>Итого</strong></td><td><strong>${fmt(g.total)}</strong></td></tr></table>`;
        });
    }
    
    // Остальные листы
    if (data.otherSheets.length) {
        html += `<h4>📋 Прочие листы</h4><table><tr><th>Материал</th><th>Толщина</th><th>м²/шт</th><th>Кол-во</th><th>Всего м²</th></tr>`;
        data.otherSheets.forEach(s => html += `<tr><td>${s.name}</td><td>${s.thickness}</td><td>${fmt(s.unit)}</td><td>${s.qty}</td><td>${fmt(s.total)}</td></tr>`);
        html += `</table>`;
    }
    
    // Профили
    if (data.profiles.length) {
        html += `<h4>📏 Профили</h4><table><tr><th>Профиль</th><th>мм/шт</th><th>Кол-во</th><th>Всего мм</th></tr>`;
        data.profiles.forEach(p => html += `<tr><td>${p.name}</td><td>${fmt(p.unit,0)}</td><td>${p.qty}</td><td>${fmt(p.total,0)}</td></tr>`);
        html += `</table>`;
    }
    
    // Прутки
    if (data.rods.length) {
        html += `<h4>🔩 Прутки</h4><table><tr><th>Пруток</th><th>мм/шт</th><th>Кол-во</th><th>Всего мм</th></tr>`;
        data.rods.forEach(r => html += `<tr><td>${r.name}</td><td>${fmt(r.unit,0)}</td><td>${r.qty}</td><td>${fmt(r.total,0)}</td></tr>`);
        html += `</table>`;
    }
    
    return html;
}
