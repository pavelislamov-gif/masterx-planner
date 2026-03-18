// js/site-page.js - Управление страницами участков

import { loadOrdersFromStorage } from './storage.js';

// Текущий участок определяется из HTML
const currentSite = document.querySelector('.site-page')?.dataset?.site || 'unknown';

// Глобальный экземпляр TaskManager
let taskManager;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    console.log('site-page.js загружен, участок:', currentSite);

    // Загружаем кастомные операции для участка
    const customOps = await loadCustomOperations(currentSite);

    // Создаем экземпляр TaskManager
    taskManager = new TaskManager(currentSite, customOps);

    // Загружаем данные на сегодня
    taskManager.today();

    // Находим контейнер для задач (если его нет, создаем)
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

// Эти функции будут доступны глобально
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
    // Здесь будет функция экспорта в Excel
    alert('Экспорт в Excel будет доступен позже');
};

// Обновление отображения даты
function updateDateDisplay() {
    const dateDisplay = document.getElementById('currentDateDisplay');
    if (dateDisplay) {
        dateDisplay.textContent = formatDateDisplay(taskManager.currentDate);
    }
}

// Загрузка кастомных операций для участка
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
    // Кнопка "Вчера"
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
    
    // Кнопка "Сегодня"
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
    
    // Кнопка "Завтра"
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
    
    // Если кнопки найдены по ID, добавляем класс active на сегодня
    if (todayBtn) {
        todayBtn.classList.add('active');
    }
}

// Подсветка активной кнопки
function updateActiveButton(clickedBtn) {
    // Убираем active у всех
    document.querySelectorAll('.nav-btn, .yesterday-btn, .today-btn, .tomorrow-btn, [data-action]').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Добавляем active нажатой кнопке
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
}

// ============== СОЗДАНИЕ КОНТЕЙНЕРА ДЛЯ ЗАДАЧ ==============

function ensureTasksContainer() {
    // Проверяем, есть ли контейнер для задач
    let tasksContainer = document.getElementById('tasksContainer');

    // Если нет - создаем
    if (!tasksContainer) {
        const main = document.querySelector('main') || document.body;
        tasksContainer = document.createElement('div');
        tasksContainer.id = 'tasksContainer';
        tasksContainer.style.cssText = `
            margin-top: 20px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        main.appendChild(tasksContainer);
    }
}

// ============== ОТОБРАЖЕНИЕ ЗАДАЧ ==============

function displayTasks() {
    const tasksContainer = document.getElementById('tasksContainer');
    if (!tasksContainer) return;

    // Обновляем заголовок с датой
    updatePageTitle();
    
    if (!taskManager.tasks || taskManager.tasks.length === 0) {
        tasksContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">📋</div>
                <p style="color: #999; font-size: 1.2rem;">
                    Нет задач на ${formatDateDisplay(taskManager.currentDate)}
                </p>
                <p style="color: #bbb; font-size: 0.95rem; margin-top: 10px;">
                    Выберите другой день или создайте новую задачу
                    Выберите другой день с помощью кнопок выше
                </p>
            </div>
        `;
        return;
    }

    // Считаем статистику
    const stats = getStats();

    let html = `
        <div class="tasks-header" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f0f0;
        ">
            <h3 style="margin: 0; color: #333;">
                Задачи на ${formatDateDisplay(taskManager.currentDate)}
            </h3>
            <div class="stats" style="color: #666; font-size: 0.95rem;">
                <span style="margin-right: 15px;">📊 Всего: <strong>${stats.total}</strong></span>
                <span style="margin-right: 15px; color: #ff9800;">⚡ В работе: <strong>${stats.inProgress}</strong></span>
                <span style="color: #4caf50;">✅ Завершено: <strong>${stats.completed}</strong></span>
            </div>
        </div>
        <div class="tasks-list"></div>
    `;

    tasksContainer.innerHTML = html;

    const tasksList = tasksContainer.querySelector('.tasks-list');

    taskManager.tasks.forEach(task => {
        const progress = task.totalQuantity ? 
            Math.round((task.completedQuantity / task.totalQuantity) * 100) : 0;

        tasksList.innerHTML += `
            <div class="task-card" data-task-id="${task.id}" style="
                background: white;
                border: 1px solid #eee;
                border-left: 4px solid ${getStatusColor(task.status)};
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 12px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                transition: all 0.2s;
            ">
                <div style="display: flex; justify-content: space-between;">
                    <div style="flex: 1;">
                        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                            <span style="
                                background: #f5f5f5;
                                padding: 4px 10px;
                                border-radius: 16px;
                                font-size: 0.8rem;
                                color: #666;
                            ">
                                Заказ ${task.orderNumber || 'б/н'}
                            </span>
                            <h4 style="margin: 0; color: #333;">${task.product || 'Изделие'}</h4>
                        </div>
                        
                        <p style="margin: 5px 0; color: #555;">
                            <strong>Операция:</strong> ${task.operation}
                        </p>
                        
                        ${task.description ? `
                            <p style="margin: 5px 0; color: #777; font-size: 0.9rem;">
                                ${task.description}
                            </p>
                        ` : ''}
                        
                        <div style="margin: 12px 0;">
                            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 4px;">
                                <span>Прогресс</span>
                                <span>${task.completedQuantity || 0} / ${task.totalQuantity || 1}</span>
                            </div>
                            <div style="
                                width: 100%;
                                height: 6px;
                                background: #f0f0f0;
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
            <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">Исполнители:</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${task.executors.map(exec => `
                    <span style="
                        background: ${exec.status === 'completed' ? '#e8f5e9' : '#f5f5f5'};
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 0.85rem;
                        border: 1px solid ${exec.status === 'completed' ? '#c8e6c9' : '#e0e0e0'};
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

// ============== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==============
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

    let prefix = '';
    if (dateStr === todayStr) {
        return 'сегодня';
        prefix = 'Сегодня, ';
    } else if (dateStr === tomorrowStr) {
        return 'завтра';
        prefix = 'Завтра, ';
    } else if (dateStr === yesterdayStr) {
        return 'вчера';
    } else {
        const options = { day: 'numeric', month: 'long' };
        return date.toLocaleDateString('ru-RU', options);
        prefix = 'Вчера, ';
    }
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return prefix + date.toLocaleDateString('ru-RU', options);
}

function getSiteName(site) {
    const names = {
        'frezerniy': 'Фрезерный',
        'tokarniy': 'Токарный',
        'slesarniy': 'Слесарный',
        'lazerno-gibochniy': 'Лазерно-гибочный',
        'polimerniy': 'Полимерный'
    };
    return names[site] || site;
}
// ============== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==============

function getStatusColor(status) {
    switch(status) {
        case 'completed': return '#4caf50';
        case 'in_progress': return '#ff9800';
        default: return '#9e9e9e';
    }
}

function getStatusBackground(status) {
    switch(status) {
        case 'completed': return '#e8f5e9';
        case 'in_progress': return '#fff3e0';
        default: return '#f5f5f5';
    }
}

function getStatusTextColor(status) {
    switch(status) {
        case 'completed': return '#2e7d32';
        case 'in_progress': return '#e65100';
        default: return '#757575';
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
