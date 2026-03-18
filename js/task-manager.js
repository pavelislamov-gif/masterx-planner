// Хранилище задач
let tasks = [];
let currentFilterDate = new Date().toISOString().split('T')[0]; // Сегодня по умолчанию

// Загрузка задач из localStorage
export function loadTasks() {
    const savedTasks = localStorage.getItem('production_tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        // Тестовые данные
        tasks = [
            {
                id: 1,
                title: 'Изготовление вала',
                description: 'Вал приводной, чертеж 123',
                site: 'tokarniy',
                status: 'in-progress',
                date: '2026-03-18', // Сегодня
                deadline: '2026-03-18',
                assignee: 'Петров'
            },
            {
                id: 2,
                title: 'Фрезеровка корпуса',
                description: 'Корпус редуктора',
                site: 'frezerniy',
                status: 'new',
                date: '2026-03-18', // Сегодня
                deadline: '2026-03-19',
                assignee: 'Сидоров'
            },
            {
                id: 3,
                title: 'Гибка листа',
                description: 'Лист 3мм, чертеж 456',
                site: 'lazerno-gibochniy',
                status: 'pending',
                date: '2026-03-19', // Завтра
                deadline: '2026-03-20',
                assignee: 'Иванов'
            },
            {
                id: 4,
                title: 'Полировка деталей',
                description: 'Комплект деталей',
                site: 'polimerniy',
                status: 'new',
                date: '2026-03-20', // Послезавтра
                deadline: '2026-03-21',
                assignee: 'Козлов'
            }
        ];
        saveTasks();
    }
    return tasks;
}

// Сохранение задач
export function saveTasks() {
    localStorage.setItem('production_tasks', JSON.stringify(tasks));
}

// Получение задач для конкретного участка и даты
export function getTasksBySiteAndDate(site, date = currentFilterDate) {
    return tasks.filter(task => 
        task.site === site && task.date === date
    );
}

// Получение задач на сегодня для участка
export function getTodayTasksBySite(site) {
    const today = new Date().toISOString().split('T')[0];
    return getTasksBySiteAndDate(site, today);
}

// Получение задач на выбранную дату
export function getTasksByDate(date) {
    return tasks.filter(task => task.date === date);
}

// Установка текущей даты фильтрации
export function setFilterDate(date) {
    currentFilterDate = date;
    return currentFilterDate;
}

// Получение текущей даты фильтрации
export function getCurrentFilterDate() {
    return currentFilterDate;
}

// Добавление задачи
export function addTask(task) {
    task.id = Date.now();
    task.date = task.date || new Date().toISOString().split('T')[0]; // Дата выполнения задачи
    tasks.push(task);
    saveTasks();
    return task;
}

// Обновление задачи
export function updateTask(updatedTask) {
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
        tasks[index] = updatedTask;
        saveTasks();
        return true;
    }
    return false;
}

// Удаление задачи
export function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
}

// Получение статистики по задачам на дату
export function getTasksStats(date = currentFilterDate) {
    const tasksOnDate = tasks.filter(task => task.date === date);
    
    return {
        total: tasksOnDate.length,
        active: tasksOnDate.filter(t => t.status !== 'completed').length,
        completed: tasksOnDate.filter(t => t.status === 'completed').length,
        bySite: {
            tokarniy: tasksOnDate.filter(t => t.site === 'tokarniy').length,
            frezerniy: tasksOnDate.filter(t => t.site === 'frezerniy').length,
            'lazerno-gibochniy': tasksOnDate.filter(t => t.site === 'lazerno-gibochniy').length,
            polimerniy: tasksOnDate.filter(t => t.site === 'polimerniy').length,
            slesarniy: tasksOnDate.filter(t => t.site === 'slesarniy').length
        }
    };
}
