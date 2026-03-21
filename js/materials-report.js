async generateReportHTML(order) {
    const sheetMaterials = this.calculateSheetMaterials(order);
    const profiles = this.calculateProfiles(order);
    const rods = this.calculateRods(order);
    const paint = this.calculatePaint(order);
    
    const fmt = (val, dec = 4) => {
        if (val === undefined || val === null) return '0';
        return Number(val).toFixed(dec);
    };
    
    let html = `
        <div class="materials-report">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>📊 Отчет по материалам для заказа №${order.number}</h3>
                <div style="display: flex; gap: 10px;">
                    <button onclick="window.print()" class="btn btn-primary">🖨️ Печать</button>
                    <button onclick="closeMaterialsModal()" class="btn btn-secondary">✖ Закрыть</button>
                </div>
            </div>
            
            <p style="color: #a0a0a0; margin-bottom: 20px;">
                Дата: ${order.date ? new Date(order.date).toLocaleDateString('ru-RU') : 'Не указана'}
            </p>
            
            <h4>📦 Состав заказа:</h4>
            <table class="items-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                     <tr style="background: #2a2f38;">
                        <th style="padding: 10px; text-align: left;">Изделие</th>
                        <th style="padding: 10px; text-align: left;">Размер</th>
                        <th style="padding: 10px; text-align: left;">Кол-во</th>
                        <th style="padding: 10px; text-align: left;">Кронштейн</th>
                        <th style="padding: 10px; text-align: left;">Лира</th>
                        <th style="padding: 10px; text-align: left;">RAL</th>
                        <th style="padding: 10px; text-align: left;">Текстура</th>
                      </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                         <tr style="border-bottom: 1px solid #2a2f38;">
                             <td style="padding: 8px;"><strong>${item.product}</strong></td>
                             <td style="padding: 8px;">${item.size}</td>
                             <td style="padding: 8px;">${item.quantity}</td>
                             <td style="padding: 8px;">${item.bracket.type} (${item.bracket.quantity} шт)</td>
                             <td style="padding: 8px;">${item.lyre.type} (${item.lyre.quantity} шт)</td>
                             <td style="padding: 8px;">${item.ral || '-'}</td>
                             <td style="padding: 8px;">${item.texture || '-'}</td>
                          </tr>
                    `).join('')}
                </tbody>
              </table>
    `;
    
    // БЛОК ЛИСТОВЫХ МАТЕРИАЛОВ (м²) - БЕЗ ОБЩЕГО ИТОГА
    if (sheetMaterials.length > 0) {
        html += `
            <h4 style="margin-top: 30px;">📄 ЛИСТОВЫЕ МАТЕРИАЛЫ</h4>
            <table class="materials-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                     <tr style="background: #2a2f38;">
                        <th style="padding: 10px; text-align: left;">Материал</th>
                        <th style="padding: 10px; text-align: left;">Толщина</th>
                        <th style="padding: 10px; text-align: right;">Площадь (м²)</th>
                      </tr>
                </thead>
                <tbody>
                    ${sheetMaterials.map(mat => `
                         <tr style="border-bottom: 1px solid #2a2f38;">
                             <td style="padding: 8px;">${mat.material}</td>
                             <td style="padding: 8px;">${mat.thickness}</td>
                             <td style="padding: 8px; text-align: right; color: #4cd964;">${fmt(mat.area, 4)}</td>
                          </tr>
                    `).join('')}
                </tbody>
              </table>
        `;
    }
    
    // БЛОК ПРОФИЛЕЙ (длина в мм) - БЕЗ ОБЩЕГО ИТОГА
    if (profiles.length > 0) {
        html += `
            <h4 style="margin-top: 30px;">📐 ПРОФИЛИ</h4>
            <table class="materials-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                     <tr style="background: #2a2f38;">
                        <th style="padding: 10px; text-align: left;">Наименование</th>
                        <th style="padding: 10px; text-align: right;">Длина (мм)</th>
                      </tr>
                </thead>
                <tbody>
                    ${profiles.map(prof => `
                         <tr style="border-bottom: 1px solid #2a2f38;">
                             <td style="padding: 8px;">${prof.name}</td>
                             <td style="padding: 8px; text-align: right; color: #4cd964;">${prof.length.toFixed(0)}</td>
                          </tr>
                    `).join('')}
                </tbody>
              </table>
        `;
    }
    
    // БЛОК ПРУТКОВ (длина в мм) - БЕЗ ОБЩЕГО ИТОГА
    if (rods.length > 0) {
        html += `
            <h4 style="margin-top: 30px;">⚙️ ПРУТКИ</h4>
            <table class="materials-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                     <tr style="background: #2a2f38;">
                        <th style="padding: 10px; text-align: left;">Наименование</th>
                        <th style="padding: 10px; text-align: left;">Диаметр</th>
                        <th style="padding: 10px; text-align: right;">Длина (мм)</th>
                      </tr>
                </thead>
                <tbody>
                    ${rods.map(rod => `
                         <tr style="border-bottom: 1px solid #2a2f38;">
                             <td style="padding: 8px;">${rod.name}</td>
                             <td style="padding: 8px;">${rod.diameter}</td>
                             <td style="padding: 8px; text-align: right; color: #4cd964;">${rod.length.toFixed(0)}</td>
                          </tr>
                    `).join('')}
                </tbody>
              </table>
        `;
    }
    
    // БЛОК КРАСКИ (кг) - С ОБЩИМ ИТОГОМ
    if (paint && paint.items.length > 0) {
        html += `
            <h4 style="margin-top: 30px;">🎨 ПОРОШКОВАЯ КРАСКА (${paint.ral})</h4>
            <table class="materials-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                     <tr style="background: #2a2f38;">
                        <th style="padding: 10px; text-align: left;">Деталь</th>
                        <th style="padding: 10px; text-align: left;">Тип</th>
                        <th style="padding: 10px; text-align: right;">Площадь (м²)</th>
                        <th style="padding: 10px; text-align: right;">Расход (кг)</th>
                      </tr>
                </thead>
                <tbody>
                    ${paint.items.map(item => {
                        const typeIcon = item.type === 'pipe' ? '🔴 Труба' : 
                                        (item.type === 'profile' ? '📐 Профиль' : '⬜ Плоская');
                        return `
                             <tr style="border-bottom: 1px solid #2a2f38;">
                                 <td style="padding: 8px;">${item.name}</td>
                                 <td style="padding: 8px;">${typeIcon}</td>
                                 <td style="padding: 8px; text-align: right;">${fmt(item.area, 4)}</td>
                                 <td style="padding: 8px; text-align: right; color: #4cd964;">${fmt(item.consumption, 3)}</td>
                              </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr style="background: #1e232b;">
                        <td colspan="2" style="padding: 10px; text-align: right;"><strong>ИТОГО (чистый расход):</strong></td>
                        <td style="padding: 10px; text-align: right;"><strong>${fmt(paint.totalArea, 4)}</strong> м²</td>
                        <td style="padding: 10px; text-align: right; color: #4cd964;"><strong>${fmt(paint.pureConsumption, 3)}</strong> кг</td>
                      </tr>
                </tfoot>
              </table>
             
             <div style="margin-top: 15px; padding: 12px; background: #1e232b; border-radius: 8px;">
                <p style="margin: 0 0 8px 0;"><strong>📌 С учетом технологических потерь:</strong></p>
                <ul style="margin: 0; padding-left: 20px; color: #a0a0a0;">
                    <li>Плоские детали: +${Math.round((paint.lossCoefficients.flat - 1) * 100)}%</li>
                    <li>Профили: +${Math.round((paint.lossCoefficients.profile - 1) * 100)}%</li>
                    <li>Трубы: +${Math.round((paint.lossCoefficients.pipe - 1) * 100)}%</li>
                </ul>
                <p style="margin: 10px 0 0 0; font-weight: 600; color: #ff9800;">
                    💰 Рекомендуемый заказ краски: <strong>${paint.recommendedOrder} кг</strong>
                </p>
             </div>
        `;
    }
    
    if (sheetMaterials.length === 0 && profiles.length === 0 && rods.length === 0 && (!paint || paint.items.length === 0)) {
        html += `
            <div style="text-align: center; padding: 40px; color: #a0a0a0;">
                <p>📭 Нет данных по материалам для этого заказа</p>
                <p style="font-size: 12px;">Возможно, для выбранного изделия не настроены нормы материалов</p>
            </div>
        `;
    }
    
    html += `</div>`;
    return html;
}
