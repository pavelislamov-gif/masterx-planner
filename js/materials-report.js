// Отчет по материалам
class MaterialsReport {
    constructor() {
        this.materialsDB = {
            brackets: [],
            lyres: [],
            aluminum: [],
            steel: [],
            pvc: [],
            polycarbonate: [],
            stainless: []
        };
    }
    
    async loadMaterialsData() {
        console.log('Загрузка данных о материалах...');
        
        // Загружаем данные из JS (НЕ из CSV)
        this.materialsDB.brackets = await loadBrackets();
        this.materialsDB.lyres = await loadLyres();
        this.materialsDB.aluminum = this.getAluminumData();
        this.materialsDB.steel = this.getSteelData();
        this.materialsDB.pvc = this.getPVCData();
        this.materialsDB.polycarbonate = this.getPolycarbonateData();
        this.materialsDB.stainless = this.getStainlessData();
        
        console.log('Данные о материалах загружены');
    }
    
    getAluminumData() {
        return [
            { product: 'XGRAY v.1', thickness: '2мм', weight: 0.0032, material: 'Алюминий' },
            { product: 'XGRAY v.2', thickness: '2мм', weight: 0.0032, material: 'Алюминий' },
            { product: 'XSMART mini', thickness: '2мм', weight: 0.005, material: 'Алюминий' },
            { product: 'XLUMO', thickness: '2мм', weight: 0.006, material: 'Алюминий' },
            { product: 'XGIRO', thickness: '2мм', weight: 0.002, material: 'Алюминий' },
            { product: 'XLINE', thickness: '4мм', weight: 0.008, material: 'Алюминий' },
            { product: 'XYELLOW', thickness: '2мм', weight: 0.004, material: 'Алюминий' },
            { product: 'XSTRONG', thickness: '2мм', weight: 0.0012, material: 'Алюминий' }
        ];
    }
    
    getSteelData() {
        return [
            { product: 'XRAY 6', thickness: '0.5мм', weight: 0.0022, material: 'Сталь' },
            { product: 'XRAY 9S', thickness: '0.5мм', weight: 0.0083, material: 'Сталь' },
            { product: 'XRAY 12S', thickness: '0.5мм', weight: 0.01, material: 'Сталь' },
            { product: 'XRAY 18', thickness: '0.5мм', weight: 0.01, material: 'Сталь' },
            { product: 'XRAY 36', thickness: '0.5мм', weight: 0.02, material: 'Сталь' }
        ];
    }
    
    getPVCData() {
        return [
            { product: 'XBAR-SW', thickness: '3мм', weight: 0.0005, material: 'ПВХ' },
            { product: 'XFOCUS', thickness: '3мм', weight: 0.003, material: 'ПВХ' },
            { product: 'XGIRO', thickness: '3мм', weight: 0.0004, material: 'ПВХ' },
            { product: 'XLITE', thickness: '3мм', weight: 0.0005, material: 'ПВХ' },
            { product: 'XLUMO', thickness: '3мм', weight: 0.003, material: 'ПВХ' },
            { product: 'XSMART', thickness: '3мм', weight: 0.003, material: 'ПВХ' },
            { product: 'XSMART mini', thickness: '3мм', weight: 0.0007, material: 'ПВХ' }
        ];
    }
    
    getPolycarbonateData() {
        return [
            { product: 'XRAY 3', thickness: '6мм', weight: 0.0016, material: 'Поликарбонат' },
            { product: 'XRAY 9', thickness: '6мм', weight: 0.0076, material: 'Поликарбонат' },
            { product: 'XEYES 130*90 1', thickness: '3мм', weight: 0.001, material: 'Поликарбонат' },
            { product: 'XEYES 130*90 2', thickness: '3мм', weight: 0.002, material: 'Поликарбонат' },
            { product: 'XEYES 130*90 3', thickness: '3мм', weight: 0.003, material: 'Поликарбонат' },
            { product: 'XEYES 130*90 4', thickness: '3мм', weight: 0.004, material: 'Поликарбонат' }
        ];
    }
    
    getStainlessData() {
        return [
            { product: 'XGRAY v.1', thickness: '1мм', weight: 0.0002, material: 'Нержавейка' },
            { product: 'XGRAY v.2', thickness: '1мм', weight: 0.0002, material: 'Нержавейка' },
            { product: 'XYELLOW', thickness: '1мм', weight: 0.0002, material: 'Нержавейка' },
            { product: 'XSLOPE', thickness: '1мм', weight: 0.0002, material: 'Нержавейка' }
        ];
    }
    
    calculateMaterials(order) {
        const materials = [];
        
        order.items.forEach(item => {
            // Кронштейны
            const bracketMaterial = this.calculateBracketMaterial(item);
            if (bracketMaterial) materials.push(bracketMaterial);
            
            // Лиры
            const lyreMaterial = this.calculateLyreMaterial(item);
            if (lyreMaterial) materials.push(lyreMaterial);
            
            // Алюминий
            const aluminumMaterial = this.calculateAluminumMaterial(item);
            if (aluminumMaterial) materials.push(aluminumMaterial);
            
            // Сталь
            const steelMaterial = this.calculateSteelMaterial(item);
            if (steelMaterial) materials.push(steelMaterial);
            
            // ПВХ
            const pvcMaterial = this.calculatePVCMaterial(item);
            if (pvcMaterial) materials.push(pvcMaterial);
            
            // Поликарбонат
            const polycarbonateMaterial = this.calculatePolycarbonateMaterial(item);
            if (polycarbonateMaterial) materials.push(polycarbonateMaterial);
            
            // Нержавейка
            const stainlessMaterial = this.calculateStainlessMaterial(item);
            if (stainlessMaterial) materials.push(stainlessMaterial);
        });
        
        return this.aggregateMaterials(materials);
    }
    
    calculateBracketMaterial(item) {
        const bracket = this.materialsDB.brackets.find(b => 
            b.name.toLowerCase() === item.bracket?.toLowerCase()
        );
        
        if (bracket && bracket.weight) {
            return {
                name: `Кронштейн ${item.bracket}`,
                material: bracket.material,
                thickness: '2мм',
                unitWeight: bracket.weight,
                quantity: item.quantity,
                totalWeight: bracket.weight * item.quantity
            };
        }
        return null;
    }
    
    calculateLyreMaterial(item) {
        const lyre = this.materialsDB.lyres.find(l => 
            l.name.toLowerCase() === item.lyre?.toLowerCase()
        );
        
        if (lyre && lyre.weight) {
            return {
                name: `Лира ${item.lyre}`,
                material: lyre.material,
                thickness: '1.5мм',
                unitWeight: lyre.weight,
                quantity: item.quantity,
                totalWeight: lyre.weight * item.quantity
            };
        }
        return null;
    }
    
    calculateAluminumMaterial(item) {
        const aluminum = this.materialsDB.aluminum.find(a => 
            a.product.toLowerCase() === item.product?.toLowerCase()
        );
        
        if (aluminum && aluminum.weight) {
            return {
                name: `Алюминий ${aluminum.thickness}`,
                material: 'Алюминий',
                thickness: aluminum.thickness,
                unitWeight: aluminum.weight,
                quantity: item.quantity,
                totalWeight: aluminum.weight * item.quantity
            };
        }
        return null;
    }
    
    calculateSteelMaterial(item) {
        const steel = this.materialsDB.steel.find(s => 
            s.product.toLowerCase() === item.product?.toLowerCase()
        );
        
        if (steel && steel.weight) {
            return {
                name: `Сталь ${steel.thickness}`,
                material: 'Сталь',
                thickness: steel.thickness,
                unitWeight: steel.weight,
                quantity: item.quantity,
                totalWeight: steel.weight * item.quantity
            };
        }
        return null;
    }
    
    calculatePVCMaterial(item) {
        const pvc = this.materialsDB.pvc.find(p => 
            p.product.toLowerCase() === item.product?.toLowerCase()
        );
        
        if (pvc && pvc.weight) {
            return {
                name: `ПВХ ${pvc.thickness}`,
                material: 'ПВХ',
                thickness: pvc.thickness,
                unitWeight: pvc.weight,
                quantity: item.quantity,
                totalWeight: pvc.weight * item.quantity
            };
        }
        return null;
    }
    
    calculatePolycarbonateMaterial(item) {
        const polycarbonate = this.materialsDB.polycarbonate.find(p => 
            p.product.toLowerCase() === item.product?.toLowerCase()
        );
        
        if (polycarbonate && polycarbonate.weight) {
            return {
                name: `Поликарбонат ${polycarbonate.thickness}`,
                material: 'Поликарбонат',
                thickness: polycarbonate.thickness,
                unitWeight: polycarbonate.weight,
                quantity: item.quantity,
                totalWeight: polycarbonate.weight * item.quantity
            };
        }
        return null;
    }
    
    calculateStainlessMaterial(item) {
        const stainless = this.materialsDB.stainless.find(s => 
            s.product.toLowerCase() === item.product?.toLowerCase()
        );
        
        if (stainless && stainless.weight) {
            return {
                name: `Нержавейка ${stainless.thickness}`,
                material: 'Нержавейка',
                thickness: stainless.thickness,
                unitWeight: stainless.weight,
                quantity: item.quantity,
                totalWeight: stainless.weight * item.quantity
            };
        }
        return null;
    }
    
    aggregateMaterials(materials) {
        const aggregated = {};
        
        materials.forEach(m => {
            const key = `${m.material}_${m.name}`;
            if (!aggregated[key]) {
                aggregated[key] = {
                    material: m.material,
                    name: m.name,
                    thickness: m.thickness,
                    totalWeight: 0,
                    items: []
                };
            }
            aggregated[key].totalWeight += m.totalWeight;
            aggregated[key].items.push(m);
        });
        
        return Object.values(aggregated);
    }
    
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
        
        let html = `
            <div class="materials-report">
                <h3>📊 Отчет по материалам для заказа №${order.number}</h3>
                <p style="color: #666; margin-bottom: 20px;">
                    Дата: ${new Date(order.date).toLocaleDateString('ru-RU')}
                </p>
                <table class="materials-table">
                    <thead>
                        <tr>
                            <th>Материал</th>
                            <th>Наименование</th>
                            <th>Толщина</th>
                            <th>Вес на ед. (кг)</th>
                            <th>Кол-во</th>
                            <th>Общий вес (кг)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let totalAllWeight = 0;
        
        materials.forEach(material => {
            material.items.forEach(item => {
                totalAllWeight += item.totalWeight;
                html += `
                    <tr>
                        <td><strong>${item.material}</strong></td>
                        <td>${item.name}</td>
                        <td>${item.thickness || '-'}</td>
                        <td>${item.unitWeight.toFixed(4)}</td>
                        <td>${item.quantity}</td>
                        <td>${item.totalWeight.toFixed(4)}</td>
                    </tr>
                `;
            });
        });
        
        html += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="5"><strong>ИТОГО:</strong></td>
                            <td><strong>${totalAllWeight.toFixed(4)} кг</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
        
        return html;
    }
}
