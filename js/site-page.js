// js/site-page.js - Управление страницами участков (БЕЗ EXPORT)

// Текущий участок определяется из HTML
const currentSite = document.querySelector('.site-page')?.dataset?.site || 'unknown';

// Глобальный экземпляр TaskManager
let taskManager;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    console.log('site-page.js загружен, участок:', currentSite);
    
    // Проверяем, загружен ли TaskManager
    if (typeof TaskManager === 'undefined') {
        console.error('❌ TaskManager не загружен! Проверьте подключение task-manager.js');
        showError('Ошибка загрузки модуля задач');
        return;
    }
    
    console.log('✅ TaskManager загружен успешно');
    
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
    
    // Слушаем изменения истории
    window.addEventListener('taskHistoryChanged', function(e) {
        if (e.detail.siteType === currentSite) {
            console.log('Получено уведомление об изменении истории');
            displayTasks();
        }
    });
});

// Функция для отображения ошибки
function showError(message) {
    const container = document.getElementById('tasksContainer') || createErrorContainer();
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #ffebee; border-radius: 8px; margin: 20px;">
                <p style="color: #c62828; font-size: 1.2rem; margin-bottom: 10px;">❌ ${message}</p>
                <p style="color: #666;">Убедитесь, что файл task-manager.js подключен перед site-page.js</p>
                <p style="color: #999; font-size: 0.9rem; margin-top: 15px;">Порядок подключения: storage.js → data-loader.js → task-operations.js → task-manager.js → site-page.js</p>
            </div>
        `;
    }
}

function createErrorContainer() {
    const main = document.querySelector('main') || document.body;
    const container = document.createElement('div');
    container.id = 'tasksContainer';
    main.appendChild(container);
    return container;
}

// ============== ФУНКЦИИ ДЛЯ ONCLICK КНОПОК ==============

// Эти функции будут доступны глобально
window.changeDate = function(direction) {
    console.log('changeDate:', direction);
    
    if (!taskManager) {
        alert('TaskManager не инициализирован');
        return;
    }
    
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
    
    if (!taskManager) {
        alert('Нет данных для экспорта');
        return;
    }
    
    // Простая функция экспорта в CSV
    exportTasksToCSV();
};

// Функция экспорта в CSV
function exportTasksToCSV() {
    if (!taskManager.tasks || taskManager.tasks.length === 0) {
        alert('Нет задач для экспорта');
        return;
    }
    
    // Создаем заголовки CSV
    const headers = ['Заказ', 'Изделие', 'Операция', 'Статус', 'Прогресс', 'Исполнители'];
    
    // Создаем строки данных
    const rows = taskManager.tasks.map(task => [
        task.orderNumber || 'б/н',
        task.product || '',
        task.operation || '',
        getStatusText(task.status),
        `${task.completedQuantity || 0}/${task.totalQuantity || 1}`,
        (task.executors || []).map(e => e.name).join(', ')
    ]);
    
    // Объединяем в CSV
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Скачиваем файл
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_${currentSite}_${formatDateForFilename(taskManager.currentDate)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Вспомогательная функция для имени файла
function formatDateForFilename(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

// Обновление отображения даты
function updateDateDisplay() {
    const dateDisplay = document.getElementById('currentDateDisplay');
    if (dateDisplay && taskManager) {
        dateDisplay.textContent = formatDateDisplay(taskManager.currentDate);
    }
}

// Загрузка кастомных операций для участка
async function loadCustomOperations(site) {
    try {
        const response = await fetch('../data/norms.json');
        if (!response.ok) {
            throw new Error('Файл norms.json не найден');
        }
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
        
        console.log('Загружены кастомные операции:', customOps);
        return customOps;
    } catch (error) {
        console.error('Ошибка загрузки операций:', error);
        return {};
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
    if (!tasksContainer || !taskManager) return;
    
    if (!taskManager.tasks || taskManager.tasks.length === 0) {
        tasksContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">📋</div>
                <p style="color: #999; font-size: 1.2rem;">
                    Нет задач на ${formatDateDisplay(taskManager.currentDate)}
                </p>
                <p style="color: #bbb; font-size: 0.95rem; margin-top: 10px;">
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
        prefix = 'Сегодня, ';
    } else if (dateStr === tomorrowStr) {
        prefix = 'Завтра, ';
    } else if (dateStr === yesterdayStr) {
        prefix = 'Вчера, ';
    }
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return prefix + date.toLocaleDateString('ru-RU', options);
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

console.log('✅ site-page.js загружен (без export)');
