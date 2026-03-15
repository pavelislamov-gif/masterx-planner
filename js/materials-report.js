// Отчет по материалам
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
            productSpecs: {}
        };
        this.normsLoaded = false;
    }
    
    async loadMaterialsData() {
        console.log('Загрузка данных о материалах...');
        
        try {
            // Загружаем нормы из JSON-файла
            const response = await fetch('data/norms.json');
            if (!response.ok) {
                throw new Error('Не удалось загрузить norms.json');
            }
            const norms = await response.json();
            
            this.materialsDB.aluminum = norms.aluminum || [];
            this.materialsDB.steel = norms.steel || [];
            this.materialsDB.stainless = norms.stainless || [];
            this.materialsDB.pvc = norms.pvc || [];
            this.materialsDB.polycarbonate = norms.polycarbonate || [];
            this.materialsDB.other = norms.other || [];
            this.materialsDB.brackets = norms.brackets || [];
            this.materialsDB.lyres = norms.lyres || [];
            this.materialsDB.rods = norms.rods || [];
            this.materialsDB.productSpecs = norms.productSpecs || {};
            
            this.normsLoaded = true;
            console.log('✅ Нормы загружены из JSON');
        } catch (error) {
            console.error('❌ Ошибка загрузки norms.json:', error);
            // Резервные данные на случай ошибки
            this.loadFallbackData();
        }
    }
    
    loadFallbackData() {
        console.warn('⚠️ Используются резервные данные');
        // Здесь можно добавить минимальные резервные данные
        this.materialsDB.aluminum = [
            { product: 'XGRAY v.1', thickness: '3мм', area: 0.0032 }
        ];
    }
    
    // ... (все методы calculateMaterials, getMaterialType и т.д. остаются без изменений)
    // ... (они уже были в предыдущей версии)
    
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
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>📊 Отчет по материалам для заказа №${order.number}</h3>
                    <button onclick="window.print()" class="btn btn-primary" style="padding: 8px 15px;">
                        🖨️ Печать
                    </button>
                </div>
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
                        ${order.items.map(item => {
                            const bracketInfo = item.bracket && item.bracket.type && item.bracket.type !== 'отсутствует' 
                                ? `${item.bracket.type} (${item.bracket.quantity || 1} шт/изд)` 
                                : '🚫 отсутствует';
                            
                            const lyreInfo = item.lyre && item.lyre.type && item.lyre.type !== 'отсутствует' 
                                ? `${item.lyre.type} (${item.lyre.quantity || 1} шт/изд)` 
                                : '🚫 отсутствует';
                            
                            return `
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.size}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bracketInfo}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${lyreInfo}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.ral || '-'}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.texture || '-'}</td>
                                </tr>
                            `;
                        }).join('')}
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
