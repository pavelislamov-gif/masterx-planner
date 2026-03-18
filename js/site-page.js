import { 
    loadTasks, 
    getTasksBySiteAndDate,
    getCurrentFilterDate,
    setFilterDate,
    addTask,
    updateTask,
    deleteTask 
} from './task-manager.js';

// Текущий участок
const currentSite = document.querySelector('.site-page').dataset.site;

// Элементы управления датой
let currentDate = getCurrentFilterDate();

// Инициализация страницы участка
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    createDateSelector();
    loadTasksForSite();
    setupEventListeners();
});

// Создание селектора даты
function createDateSelector() {
    const header = document.querySelector('.page-header');
    
    const dateSelector = document.createElement('div');
    dateSelector.className = 'date-selector';
    dateSelector.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center;">
            <label style="color: #666;">Дата:</label>
            <input type="date" id="taskDateFilter" value="${currentDate}" style="padding: 5px; border-radius: 4px; border: 1px solid #ddd;">
            <button class="btn btn-secondary" id="todayDateBtn">Сегодня</button>
            <button class="btn btn-secondary" id="tomorrowDateBtn">Завтра</button>
        </div>
    `;
    
    header.appendChild(dateSelector);
    
    // Обработчики для кнопок дат
    document.getElementById('taskDateFilter').addEventListener('change', function(e) {
        currentDate = e.target.value;
        setFilterDate(currentDate);
        loadTasksForSite();
    });
    
    document.getElementById('todayDateBtn').addEventListener('click', function() {
        currentDate = new Date().toISOString().split('T')[0];
        document.getElementById('taskDateFilter').value = currentDate;
        setFilterDate(currentDate);
        loadTasksForSite();
    });
    
    document.getElementById('tomorrowDateBtn').addEventListener('click', function() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        currentDate = tomorrow.toISOString().split('T')[0];
        document.getElementById('taskDateFilter').value = currentDate;
        setFilterDate(currentDate);
        loadTasksForSite();
    });
}

// Загрузка задач для участка на выбранную дату
function loadTasksForSite() {
    const tasks = getTasksBySiteAndDate(currentSite, currentDate);
    displayTasks(tasks);
    updateTasksCount(tasks.length);
}

// Отображение задач
function displayTasks(tasks) {
    const container = document.getElementById('tasksContainer');
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #f9f9f9; border-radius: 8px;">
                <p style="color: #999; font-size: 1.1rem;">Нет задач на ${formatDate(currentDate)}</p>
                <button class="btn btn-primary" id="addFirstTaskBtn" style="margin-top: 15px;">+ Создать задачу</button>
            </div>
        `;
        
        document.getElementById('addFirstTaskBtn')?.addEventListener('click', () => {
            document.getElementById('addTaskBtn').click();
        });
        return;
    }
    
    let html = '';
    tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    tasks.forEach(task => {
        const statusClass = getStatusClass(task.status);
        const deadlineClass = isDeadlineClose(task.deadline) ? 'deadline-close' : '';
        
        html += `
            <div class="task-item ${task.status}" data-task-id="${task.id}">
                <div class="task-info">
                    <h4>${task.title}</h4>
                    <p>${task.description || 'Нет описания'}</p>
                    ${task.deadline ? `<p class="deadline ${deadlineClass}">Срок: ${formatDate(task.deadline)}</p>` : ''}
                </div>
                <div class="task-meta">
                    <span class="task-status ${statusClass}">${getStatusText(task.status)}</span>
                    ${task.assignee ? `<span class="task-assignee">👤 ${task.assignee}</span>` : ''}
                    <div class="task-actions">
                        <button class="btn-icon edit-task" title="Редактировать">✏️</button>
                        <button class="btn-icon delete-task" title="Удалить">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Добавление обработчиков для кнопок
    document.querySelectorAll('.edit-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            editTask(parseInt(taskId));
        });
    });
    
    document.querySelectorAll('.delete-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            deleteTaskHandler(parseInt(taskId));
        });
    });
}

// Обновление счетчика задач
function updateTasksCount(count) {
    const taskCountElement = document.querySelector('.page-header h2');
    if (taskCountElement) {
        taskCountElement.innerHTML = `Задачи ${currentSite === 'frezerniy' ? 'фрезерного' : 
            currentSite === 'tokarniy' ? 'токарного' : 
            currentSite === 'slesarniy' ? 'слесарного' :
            currentSite === 'polimerniy' ? 'полимерного' : 'лазерно-гибочного'} участка на ${formatDate(currentDate)} (${count})`;
    }
}

// Вспомогательные функции
function getStatusClass(status) {
    switch(status) {
        case 'new': return 'status-new';
        case 'in-progress': return 'status-in-progress';
        case 'completed': return 'status-completed';
        default: return 'status-new';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'new': return 'Новая';
        case 'in-progress': return 'В работе';
        case 'completed': return 'Завершена';
        default: return 'Новая';
    }
}

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function isDeadlineClose(deadline) {
    if (!deadline) return false;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays >= 0;
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Поиск
    document.getElementById('searchInput')?.addEventListener('input', function(e) {
        filterTasks(e.target.value);
    });
    
    // Фильтр по статусу
    document.getElementById('statusFilter')?.addEventListener('change', function(e) {
        filterByStatus(e.target.value);
    });
    
    // Сортировка
    document.getElementById('sortBy')?.addEventListener('change', function(e) {
        sortTasks(e.target.value);
    });
}

// Фильтрация задач
function filterTasks(searchText) {
    const allTasks = getTasksBySiteAndDate(currentSite, currentDate);
    const filtered = allTasks.filter(task => 
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchText.toLowerCase()))
    );
    displayTasks(filtered);
}

function filterByStatus(status) {
    const allTasks = getTasksBySiteAndDate(currentSite, currentDate);
    const filtered = status === 'all' ? allTasks : allTasks.filter(task => task.status === status);
    displayTasks(filtered);
}

function sortTasks(sortBy) {
    const allTasks = getTasksBySiteAndDate(currentSite, currentDate);
    let sorted = [...allTasks];
    
    switch(sortBy) {
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
            break;
        case 'date-asc':
            sorted.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            break;
        case 'status':
            sorted.sort((a, b) => a.status.localeCompare(b.status));
            break;
    }
    
    displayTasks(sorted);
}

// Редактирование задачи
function editTask(taskId) {
    const tasks = getTasksBySiteAndDate(currentSite, currentDate);
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskDeadline').value = task.deadline || '';
        document.getElementById('taskAssignee').value = task.assignee || '';
        document.getElementById('modalTitle').textContent = 'Редактирование задачи';
        
        document.getElementById('taskModal').style.display = 'block';
    }
}

// Удаление задачи
function deleteTaskHandler(taskId) {
    if (confirm('Удалить задачу?')) {
        deleteTask(taskId);
        loadTasksForSite();
    }
}

// Сохранение задачи из формы
export function saveTaskFromForm(formData) {
    const taskId = formData.get('taskId');
    
    const task = {
        id: taskId ? parseInt(taskId) : Date.now(),
        title: formData.get('title'),
        description: formData.get('description'),
        site: currentSite,
        status: formData.get('status'),
        date: currentDate, // Важно: дата выполнения = выбранная дата
        deadline: formData.get('deadline'),
        assignee: formData.get('assignee')
    };
    
    if (taskId) {
        updateTask(task);
    } else {
        addTask(task);
    }
    
    loadTasksForSite();
}