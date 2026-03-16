async generateReportHTML(order) {
    const data = this.calculateMaterials(order);
    
    console.log('=== ДАННЫЕ ДЛЯ ОТЧЕТА ===', data);
    
    if (data.otherSheets.length === 0 && data.profiles.length === 0 && data.rods.length === 0 &&
        data.aisi.products.length === 0 && data.aisi.brackets.length === 0 && data.aisi.lyres.length === 0) {
        return `
            <div class="materials-report">
                <h3>📊 Отчет по материалам для заказа №${order.number || 'Без номера'}</h3>
                <p style="color: #666; text-align: center; padding: 20px;">
                    Нет данных о материалах для данного заказа
                </p>
            </div>
        `;
    }
    
    const fmt = (val, dec = 4) => {
        if (val === undefined || val === null) return '0';
        return Number(val).toFixed(dec);
    };
    
    let html = `
        <div class="materials-report">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>📊 Отчет по материалам для заказа №${order.number || 'Без номера'}</h3>
                <button onclick="window.print()" class="btn btn-primary" style="padding: 8px 15px;">
                    🖨️ Печать
                </button>
            </div>
            <p style="color: #666; margin-bottom: 20px;">
                Дата: ${order.date ? new Date(order.date).toLocaleDateString('ru-RU') : 'Не указана'}
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
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product || '-'}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.size || '-'}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity || 0}</td>
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
    
    // ===========================================
    // AISI ИЗ КРОНШТЕЙНОВ (исправленный блок)
    // ===========================================
    if (data.aisi.brackets.length > 0) {
        html += `<h4 style="margin-top: 30px;">🔩 Кронштейны из AISI 430</h4>`;
        
        data.aisi.brackets.forEach(group => {
            html += `
                <table class="materials-table" style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="padding: 8px; text-align: left;">Кронштейн</th>
                            <th style="padding: 8px; text-align: center;">Материал</th>
                            <th style="padding: 8px; text-align: center;">Толщина</th>
                            <th style="padding: 8px; text-align: right;">Расход на 1 шт (м²)</th>
                            <th style="padding: 8px; text-align: right;">Кол-во</th>
                            <th style="padding: 8px; text-align: right;">Общий расход (м²)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${group.items.map(item => `
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name.replace('Кронштейн ', '')}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">AISI 430</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${group.thickness}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(item.unit)}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.qty}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        });
    }
    
    // ===========================================
    // AISI ИЗ ЛИР
    // ===========================================
    if (data.aisi.lyres.length > 0) {
        html += `<h4 style="margin-top: 30px;">🔩 Лиры из AISI 430</h4>`;
        
        data.aisi.lyres.forEach(group => {
            html += `
                <table class="materials-table" style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="padding: 8px; text-align: left;">Лира</th>
                            <th style="padding: 8px; text-align: center;">Материал</th>
                            <th style="padding: 8px; text-align: center;">Толщина</th>
                            <th style="padding: 8px; text-align: right;">Расход на 1 шт (м²)</th>
                            <th style="padding: 8px; text-align: right;">Кол-во</th>
                            <th style="padding: 8px; text-align: right;">Общий расход (м²)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${group.items.map(item => `
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name.replace('Лира ', '')}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">AISI 430</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${group.thickness}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(item.unit)}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.qty}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        });
    }
    
    // ===========================================
    // AISI ИЗ ИЗДЕЛИЙ
    // ===========================================
    if (data.aisi.products.length > 0) {
        html += `<h4 style="margin-top: 30px;">🔩 Детали из AISI 430 (в составе изделий)</h4>`;
        
        data.aisi.products.forEach(group => {
            html += `
                <table class="materials-table" style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="padding: 8px; text-align: left;">Деталь</th>
                            <th style="padding: 8px; text-align: center;">Материал</th>
                            <th style="padding: 8px; text-align: center;">Толщина</th>
                            <th style="padding: 8px; text-align: right;">Расход на 1 шт (м²)</th>
                            <th style="padding: 8px; text-align: right;">Кол-во</th>
                            <th style="padding: 8px; text-align: right;">Общий расход (м²)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${group.items.map(item => `
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">AISI 430</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${group.thickness}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(item.unit)}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.qty}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        });
    }
    
    // ===========================================
    // ПРОЧИЕ ЛИСТОВЫЕ МАТЕРИАЛЫ
    // ===========================================
    if (data.otherSheets.length > 0) {
        html += `
            <h4 style="margin-top: 30px;">📋 Прочие листовые материалы (расход в м²)</h4>
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
        
        data.otherSheets.forEach(item => {
            html += `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.thickness || '—'}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(item.unit)}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.qty}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(item.total)}</td>
                </tr>
            `;
        });
        
        html += `</tbody></table>`;
    }
    
    // ===========================================
    // ПРОФИЛИ
    // ===========================================
    if (data.profiles.length > 0) {
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
        
        data.profiles.forEach(profile => {
            html += `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${profile.name}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(profile.unit, 0)}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${profile.qty}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(profile.total, 0)}</td>
                </tr>
            `;
        });
        
        html += `</tbody></table>`;
    }
    
    // ===========================================
    // ПРУТКИ
    // ===========================================
    if (data.rods.length > 0) {
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
        
        data.rods.forEach(rod => {
            html += `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rod.name}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(rod.unit, 0)}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${rod.qty}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${fmt(rod.total, 0)}</td>
                </tr>
            `;
        });
        
        html += `</tbody></table>`;
    }
    
    html += `</div>`;
    return html;
}
