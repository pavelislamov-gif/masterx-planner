// js/site-page.js - Управление страницами участков

import { loadOrdersFromStorage } from './storage.js';

// Текущий участок определяется из HTML
const currentSite = document.querySelector('.site-page')?.dataset?.site || 'unknown';

// Глобальный экземпляр TaskManager
let taskManager;

// ============== ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ БЕЗОПАСНОГО ВЫВОДА ==============
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    console.log('site-page.js загружен, участок:', currentSite);

    // Загружаем кастомные операции для участка
    const customOps = await loadCustomOperations(currentSite);

    // Создаем экземпляр TaskManager
    taskManager = new TaskManager(currentSite, customOps);

    // Загружаем данные на сегодня
    taskManager.today();

    // Обновляем отображение даты
    updateDateDisplay();
    
    // Создаем контейнер для задач (если его нет)
    ensureTasksContainer();

    // Отображаем задачи
    displayTasks();

    // НАВИГАЦИЯ: добавляем обработчики для существующих кнопок
    setupNavigationButtons();
    
    // Слушаем изменения истории
    window.addEventListener('taskHistoryChanged', function(e) {
        if (e.detail.siteType === currentSite) {
            console.log('Получено уведомление об изменении истории');
            displayTasks();
        }
    });
});

// ============== ФУНКЦИИ ДЛЯ ONCLICK КНОПОК ==============

window.changeDate = function(direction) {
    console.log('changeDate:', direction);
    
    if (direction === 'prev') {
        taskManager.prevDay();
    } else if (direction === 'next') {
        taskManager.nextDay();
    } else if (direction === 'today') {
        taskManager.today();
    }
    
    updateDateDisplay();
    displayTasks();
};

window.exportToExcel = function() {
    console.log('exportToExcel');
    alert('Экспорт в Excel будет доступен позже');
};

function updateDateDisplay() {
    const dateDisplay = document.getElementById('currentDateDisplay');
    if (dateDisplay) {
        dateDisplay.textContent = formatDateDisplay(taskManager.currentDate);
    }
}

async function loadCustomOperations(site) {
    try {
        const response = await fetch('../data/norms.json');
        const data = await response.json();

        const customOps = {};

        if (data.products) {
            Object.values(data.products).forEach(product => {
                if (product.operations) {
                    product.operations.forEach(op => {
                        if (op.site === site) {
                            if (!customOps[product.name]) {
                                customOps[product.name] = [];
                            }
                            customOps[product.name].push(op.operation);
                        }
                    });
                }
            });
        }

        return customOps;
    } catch (error) {
        console.error('Ошибка загрузки операций:', error);
        return {};
    }
}

// ============== НАСТРОЙКА КНОПОК НАВИГАЦИИ ==============

function setupNavigationButtons() {
    const yesterdayBtn = document.getElementById('yesterdayBtn') || 
                         document.querySelector('[data-action="yesterday"]') ||
                         document.querySelector('.yesterday-btn');
    
    if (yesterdayBtn) {
        yesterdayBtn.addEventListener('click', () => {
            console.log('Нажата кнопка Вчера');
            taskManager.prevDay();
            updateActiveButton(yesterdayBtn);
            displayTasks();
        });
    }
    
    const todayBtn = document.getElementById('todayBtn') || 
                     document.querySelector('[data-action="today"]') ||
                     document.querySelector('.today-btn');
    
    if (todayBtn) {
        todayBtn.addEventListener('click', () => {
            console.log('Нажата кнопка Сегодня');
            taskManager.today();
            updateActiveButton(todayBtn);
            displayTasks();
        });
    }
    
    const tomorrowBtn = document.getElementById('tomorrowBtn') || 
                        document.querySelector('[data-action="tomorrow"]') ||
                        document.querySelector('.tomorrow-btn');
    
    if (tomorrowBtn) {
        tomorrowBtn.addEventListener('click', () => {
            console.log('Нажата кнопка Завтра');
            taskManager.nextDay();
            updateActiveButton(tomorrowBtn);
            displayTasks();
        });
    }
    
    if (todayBtn) {
        todayBtn.classList.add('active');
    }
}

function updateActiveButton(clickedBtn) {
    document.querySelectorAll('.nav-btn, .yesterday-btn, .today-btn, .tomorrow-btn, [data-action]').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
}

// ============== СОЗДАНИЕ КОНТЕЙНЕРА ДЛЯ ЗАДАЧ ==============

function ensureTasksContainer() {
    let tasksContainer = document.getElementById('tasksContainer');

    if (!tasksContainer) {
        const main = document.querySelector('main') || document.body;
        tasksContainer = document.createElement('div');
        tasksContainer.id = 'tasksContainer';
        tasksContainer.style.cssText = `
            margin-top: 20px;
            padding: 20px;
            background: #1a1e24;
            border-radius: 8px;
        `;
        main.appendChild(tasksContainer);
    }
}

// ============== ОТОБРАЖЕНИЕ ЗАДАЧ ==============

function displayTasks() {
    const tasksContainer = document.getElementById('tasksContainer');
    if (!tasksContainer) return;

    updatePageTitle();
    
    if (!taskManager.tasks || taskManager.tasks.length === 0) {
        tasksContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">📋</div>
                <p style="color: #a0a0a0; font-size: 1.2rem;">
                    Нет задач на ${formatDateDisplay(taskManager.currentDate)}
                </p>
                <p style="color: #6c757d; font-size: 0.95rem; margin-top: 10px;">
                    Выберите другой день с помощью кнопок выше
                </p>
            </div>
        `;
        return;
    }

    // ========== ПОЛУЧАЕМ ДАННЫЕ ДЛЯ ШАПКИ ИЗ ПЕРВОЙ ЗАДАЧИ ==========
    const firstTask = taskManager.tasks[0];
    const orders = loadOrdersFromStorage() || [];
    const order = orders.find(o => o.id == firstTask.orderId);
    const item = order?.items?.[0];
    
    // Собираем детали для шапки
    const allDetails = [];
    
    // Кронштейны
    if (item?.brackets && item.brackets.length > 0) {
        item.brackets.forEach(b => {
            allDetails.push({ name: `Кронштейн ${b.type}`, quantity: b.quantity });
        });
    }
    
    // Лиры
    if (item?.lyres && item.lyres.length > 0) {
        item.lyres.forEach(l => {
            allDetails.push({ name: `Лира ${l.type}`, quantity: l.quantity });
        });
    }
    
    // Обычные детали
    const regularDetails = (item?.details || []).filter(d => d.type !== 'profile');
    regularDetails.forEach(d => {
        allDetails.push({ name: d.name, quantity: d.quantity });
    });
    
    // Профили
    const profiles = (item?.details || []).filter(d => d.type === 'profile');
    
    // СТАТИСТИКА
    const stats = getStats();

    // ШАПКА С ИНФОРМАЦИЕЙ ОБ ИЗДЕЛИИ (3 колонки)
    const headerHtml = `
        <div style="
            background: #1a1e24;
            border: 1px solid #2a2f38;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
        ">
            <div style="font-size: 18px; font-weight: 600; color: #ff3b3b; margin-bottom: 15px;">
                📦 ${escapeHtml(item?.product || '')}
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 25px;">
                
                <!-- ЛЕВАЯ КОЛОНКА: РАЗМЕР + ПОКРЫТИЕ -->
                <div>
                    <div style="margin-bottom: 12px;">
                        <div style="color: #a0a0a0; font-size: 11px; margin-bottom: 4px;">РАЗМЕР</div>
                        <div><strong>${escapeHtml(item?.size?.name || '-')}</strong> <span style="color: #4cd964;">× ${item?.size?.quantity || 1} шт</span></div>
                    </div>
                    <div>
                        <div style="color: #a0a0a0; font-size: 11px; margin-bottom: 4px;">ПОКРЫТИЕ</div>
                        <div><strong>${escapeHtml(item?.ral || '-')}</strong> / ${escapeHtml(item?.texture || '-')}</div>
                    </div>
                </div>
                
                <!-- ЦЕНТРАЛЬНАЯ КОЛОНКА: ПРОФИЛИ -->
                <div>
                    <div style="color: #a0a0a0; font-size: 11px; margin-bottom: 8px;">ПРОФИЛИ</div>
                    ${profiles.length > 0 ? 
                        profiles.map(p => `
                            <div style="margin-bottom: 8px;">
                                <div>• ${escapeHtml(p.name)}</div>
                                <div style="margin-left: 12px; color: #a0a0a0; font-size: 11px;">
                                    <span style="color: #ff9800;">${p.lengthMm} мм</span> <span style="color: #4cd964;">× ${p.quantity} шт</span>
                                </div>
                            </div>
                        `).join('') : 
                        '<div style="color: #6c757d; font-size: 12px;">— нет —</div>'}
                </div>
                
                <!-- ПРАВАЯ КОЛОНКА: ДЕТАЛИ -->
                <div>
                    <div style="color: #a0a0a0; font-size: 11px; margin-bottom: 8px;">ДЕТАЛИ</div>
                    ${allDetails.length > 0 ? 
                        allDetails.map(d => `
                            <div style="margin-bottom: 4px;">
                                • ${escapeHtml(d.name)} <span style="color: #4cd964;">${d.quantity} шт</span>
                            </div>
                        `).join('') : 
                        '<div style="color: #6c757d; font-size: 12px;">— нет —</div>'}
                </div>
            </div>
        </div>
    `;

    // ОСНОВНОЙ КОНТЕНТ (заголовок задач и список)
    const contentHtml = `
        <div class="tasks-header" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #2a2f38;
        ">
            <h3 style="margin: 0; color: #fff;">
                Задачи на ${formatDateDisplay(taskManager.currentDate)}
            </h3>
            <div class="stats" style="color: #a0a0a0; font-size: 0.95rem;">
                <span style="margin-right: 15px;">📊 Всего: <strong style="color: #fff;">${stats.total}</strong></span>
                <span style="margin-right: 15px; color: #ff9800;">⚡ В работе: <strong>${stats.inProgress}</strong></span>
                <span style="color: #4caf50;">✅ Завершено: <strong>${stats.completed}</strong></span>
            </div>
        </div>
        <div class="tasks-list"></div>
    `;

    // Собираем всё вместе
    tasksContainer.innerHTML = headerHtml + contentHtml;

    const tasksList = tasksContainer.querySelector('.tasks-list');

    // ОТОБРАЖАЕМ ЗАДАЧИ
    taskManager.tasks.forEach(task => {
        const progress = task.totalQuantity ? 
            Math.round((task.completedQuantity / task.totalQuantity) * 100) : 0;

        tasksList.innerHTML += `
            <div class="task-card" data-task-id="${task.id}" style="
                background: #1a1e24;
                border: 1px solid #2a2f38;
                border-left: 4px solid ${getStatusColor(task.status)};
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 12px;
                transition: all 0.2s;
            ">
                <div style="display: flex; justify-content: space-between;">
                    <div style="flex: 1;">
                        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                            <span style="
                                background: #2a2f38;
                                padding: 4px 10px;
                                border-radius: 16px;
                                font-size: 0.8rem;
                                color: #a0a0a0;
                            ">
                                Заказ ${task.orderNumber || 'б/н'}
                            </span>
                            <h4 style="margin: 0; color: #ff3b3b;">${task.product || 'Изделие'}</h4>
                        </div>
                        
                        <p style="margin: 5px 0; color: #a0a0a0;">
                            <strong>Операция:</strong> ${task.operation}
                        </p>
                        
                        ${task.description ? `
                            <p style="margin: 5px 0; color: #777; font-size: 0.9rem;">
                                ${task.description}
                            </p>
                        ` : ''}
                        
                        <div style="margin: 12px 0;">
                            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 4px;">
                                <span style="color: #a0a0a0;">Прогресс</span>
                                <span style="color: #fff;">${task.completedQuantity || 0} / ${task.totalQuantity || 1}</span>
                            </div>
                            <div style="
                                width: 100%;
                                height: 6px;
                                background: #2a2f38;
                                border-radius: 3px;
                                overflow: hidden;
                            ">
                                <div style="
                                    width: ${progress}%;
                                    height: 100%;
                                    background: ${getStatusColor(task.status)};
                                    border-radius: 3px;
                                "></div>
                            </div>
                        </div>
                        
                        ${renderExecutors(task)}
                    </div>
                    
                    <div style="
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 0.85rem;
                        font-weight: 500;
                        background: ${getStatusBackground(task.status)};
                        color: ${getStatusTextColor(task.status)};
                        height: fit-content;
                    ">
                        ${getStatusText(task.status)}
                    </div>
                </div>
            </div>
        `;
    });
}

function renderExecutors(task) {
    if (!task.executors || task.executors.length === 0) {
        return '';
    }

    return `
        <div style="margin-top: 10px;">
            <div style="font-size: 0.85rem; color: #a0a0a0; margin-bottom: 5px;">Исполнители:</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${task.executors.map(exec => `
                    <span style="
                        background: ${exec.status === 'completed' ? '#1a3a1a' : '#2a2f38'};
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 0.85rem;
                        border: 1px solid ${exec.status === 'completed' ? '#2e7d32' : '#3a404b'};
                        color: #fff;
                    ">
                        ${exec.displayName || exec.name}
                        ${task.totalQuantity > 1 ? ` (${exec.quantity || 0})` : ''}
                    </span>
                `).join('')}
            </div>
        </div>
    `;
}

// ============== СТАТИСТИКА ==============

function getStats() {
    const tasks = taskManager.tasks || [];
    return {
        total: tasks.length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length
    };
}

// ============== ОБНОВЛЕНИЕ ЗАГОЛОВКА ==============

function updatePageTitle() {
    const titleElement = document.querySelector('h2') || document.querySelector('.page-title');
    if (titleElement) {
        const siteName = getSiteName(currentSite);
        titleElement.innerHTML = `${siteName} участок — ${formatDateDisplay(taskManager.currentDate)}`;
    }
}

// ============== ФОРМАТИРОВАНИЕ ДАТЫ ==============

function formatDateDisplay(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toDateString();
    const todayStr = today.toDateString();
    const tomorrowStr = tomorrow.toDateString();
    const yesterdayStr = yesterday.toDateString();

    if (dateStr === todayStr) {
        return 'сегодня';
    } else if (dateStr === tomorrowStr) {
        return 'завтра';
    } else if (dateStr === yesterdayStr) {
        return 'вчера';
    } else {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('ru-RU', options);
    }
}

function getSiteName(site) {
    const names = {
        'frezerniy': 'Фрезерный',
        'tokarniy': 'Токарный',
        'slesarniy': 'Слесарный',
        'lazerno': 'Лазерно-гибочный',
        'lazerno-gibochniy': 'Лазерно-гибочный',
        'polimerniy': 'Полимерный'
    };
    return names[site] || site;
}

// ============== ЦВЕТА СТАТУСОВ ==============

function getStatusColor(status) {
    switch(status) {
        case 'completed': return '#4caf50';
        case 'in_progress': return '#ff9800';
        default: return '#6c757d';
    }
}

function getStatusBackground(status) {
    switch(status) {
        case 'completed': return '#1a3a1a';
        case 'in_progress': return '#3a2a1a';
        default: return '#2a2f38';
    }
}

function getStatusTextColor(status) {
    switch(status) {
        case 'completed': return '#4caf50';
        case 'in_progress': return '#ff9800';
        default: return '#a0a0a0';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'completed': return 'Завершено';
        case 'in_progress': return 'В работе';
        default: return 'Ожидает';
    }
}

// Экспортируем
export { taskManager, displayTasks };
