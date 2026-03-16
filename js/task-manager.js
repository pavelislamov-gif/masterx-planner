// Менеджер задач для участков
class TaskManager {
    constructor(siteType) {
        this.siteType = siteType;
        this.currentDate = new Date();
        this.tasks = [];
        this.orders = [];
        this.taskHistory = {};
        this.operationsDB = this.loadOperationsDatabase();
    }
    
    // Загрузить базу операций из техкарт
    loadOperationsDatabase() {
        return {
            'tokarniy': {
                'XRAY 1': ['Заготовка', 'Точение Корпуса', 'Заготовка деталей Крышка', 'Точение деталей Кольцо', 'Фрезеровка Корпуса'],
                'XRAY 3': ['Заготовка', 'Точение Корпуса', 'Заготовка деталей Крышка', 'Точение деталей Кольцо', 'Фрезеровка Корпуса'],
                'XRAY 3-2': ['Заготовка', 'Точение Корпус-1', 'Точение Корпус-2', 'Заготовка деталей Крышка', 'Точение деталей Кольцо', 'Фрезеровка Корпус-1', 'Фрезеровка Корпус-2'],
                'XRAY 3-GRP': ['Заготовка', 'Точение Корпуса', 'Точение Основания платы', 'Фрезеровка Корпуса', 'Фрезеровка Основания платы'],
                'XRAY 6': ['Заготовка', 'Точение Корпуса', 'Заготовка деталей Крышка', 'Точение деталей Кольцо', 'Фрезеровка Корпуса'],
                'XRAY 6 RGBW': ['Заготовка', 'Точение Корпуса', 'Заготовка деталей Крышка', 'Точение деталей Кольцо', 'Фрезеровка Корпуса', 'Фрезеровка Крышки'],
                'XRAY 6-2 проходной': ['Заготовка', 'Точение Корпуса х 2', 'Точение Втулки', 'Точение деталей Кольцо х 2', 'Фрезеровка Корпуса', 'Фрезеровка Втулки'],
                'XRAY 6-2 оконечный': ['Заготовка', 'Точение Корпуса х 2', 'Точение Втулки', 'Точение деталей Кольцо х 2', 'Фрезеровка Корпуса', 'Фрезеровка Втулки'],
                'XRAY 6-T2 BT 180': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BT 200': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BT 220': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BT 220 Шторка x2': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BT 240 Шторка': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BZ 180': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BZ 200 Шторка': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BZ 220': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BZ 220 Шторка x2': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6-T2 BZ 240 Шторка': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6T Накладной': ['Заготовка', 'Точение Корпуса', 'Точение Крепления', 'Фрезеровка Корпуса', 'Фрезеровка крепления'],
                'XRAY 6T BT 120': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6T BT 140 Шторка': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6T BZ 120': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса', 'Фрезеровка Кронштейна'],
                'XRAY 6T BZ 140 Шторка': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 6T RGBW BT 150': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 9': ['Заготовка', 'Точение Корпуса', 'Заготовка деталей Крышка', 'Точение деталей Кольцо', 'Фрезеровка Корпуса', 'Фрезеровка детали Кольцо', 'Фрезеровка детали Крышка'],
                'XRAY 9S': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 12S': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XRAY 18': ['Заготовка', 'Точение Корпуса', 'Заготовка деталей Крышка', 'Точение деталей Кольцо', 'Фрезеровка Корпуса', 'Фрезеровка детали Кольцо', 'Фрезеровка детали Крышка'],
                'XRAY 18S': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XSLOPE': ['Заготовка', 'Точение Корпуса', 'Точение Модуля', 'Фрезеровка Корпуса', 'Фрезеровка Модуля'],
                'XPIXEL BIN v.1': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XPIXEL BIN v.2': ['Заготовка', 'Точение Корпуса', 'Точение Фланца', 'Фрезеровка Корпуса'],
                'XPIXEL BIN v.3': ['Заготовка', 'Точение Корпуса', 'Точение деталей Кольцо', 'Фрезеровка Корпуса'],
                'XPIXEL OVHD': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XDISK': ['Заготовка', 'Точение Корпуса', 'Точение деталей Крышка', 'Точение деталей Кронштейн', 'Точение деталей Стойка', 'Фрезеровка Корпуса', 'Фрезеровка Кронштейн', 'Фрезеровка Стойки'],
                'XPOINT OVHD': ['Заготовка', 'Точение Корпуса'],
                'XSPOT': ['Заготовка', 'Точение Корпуса', 'Точение Основания платы', 'Фрезеровка Корпуса', 'Фрезеровка Основания платы'],
                'ACENTO 3T': ['Заготовка', 'Точение Корпуса', 'Точение Втулки', 'Фрезеровка Корпуса'],
                'ACENTO 4': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XGRAY v.1': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XGRAY v.2': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
                'XSMART mini': ['Заготовка', 'Точение']
            },
            'slesarniy': {
                'XRAY 1': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Крышка+V', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XRAY 3': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Крышка+V', 'Голтовка Кронштейна', 'РТИ', 'УВ корпуса'],
                'XRAY 3-2': ['Нарезка резьбы Корпус+V', 'Голтовка Кронштейна', 'РТИ', 'УВ корпуса'],
                'XRAY 3-GRP': ['Нарезка резьбы Корпус+V', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XRAY 6': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Крышка+V', 'Голтовка Кронштейна', 'РТИ', 'УВ корпуса'],
                'XRAY 6 RGBW': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Крышка+V', 'Голтовка Кронштейна', 'РТИ', 'УВ корпуса'],
                'XRAY 6-2 проходной': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Втулка+V', 'Голтовка Кронштейна', 'РТИ', 'УВ корпуса'],
                'XRAY 6-2 оконечный': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Втулка+V', 'Голтовка Кронштейна', 'РТИ', 'УВ корпуса'],
                'XRAY 6-T2 BT 180': ['Нарезка резьбы Корпус+V', 'Установка Резьбовых заклепок 4*16', 'Нарезка резьбы Основание платы+V', 'Обработка Корпуса', 'Обработка Основания платы', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XRAY 6-T2 BT 200': ['Нарезка резьбы Корпус+V', 'Установка Резьбовых заклепок 4*16', 'Нарезка резьбы Основание платы+V', 'Торцовка Корпуса под шторку', 'Обработка Корпуса', 'Обработка Основания платы', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XRAY 6-T2 BT 220': ['Нарезка резьбы Корпус+V', 'Установка Резьбовых заклепок 4*16', 'Нарезка резьбы Основание платы+V', 'Обработка Корпуса', 'Обработка Основания платы', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XRAY 6-T2 BT 220 Шторка x2': ['Нарезка резьбы Корпус+V', 'Установка Резьбовых заклепок 4*16', 'Нарезка резьбы Основание платы+V', 'Торцовка Корпуса под шторку', 'Обработка Корпуса', 'Обработка Основания платы', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XRAY 6-T2 BT 240 Шторка': ['Нарезка резьбы Корпус+V', 'Установка Резьбовых заклепок 4*16', 'Нарезка резьбы Основание платы+V', 'Торцовка Корпуса под шторку', 'Обработка Корпуса', 'Обработка Основания платы', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XRAY 6T Накладной': ['Нарезка резьбы Крышка+V', 'Нарезка резьбы Крепление', 'Нарезка резьбы Основание платы+V', 'Обработка Корпуса', 'Обработка Основания платы', 'УВ корпуса'],
                'XRAY 9': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Крышка+V', 'Кольцо V', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XRAY 9S': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Основание платы+V', 'Обработка Основания платы', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XRAY 12S': ['Нарезка резьбы Корпус+V', 'Нарезка резьбы Основание платы+V', 'Обработка Основания платы', 'Голтовка Кронштейна', 'УВ корпуса'],
                'XGRAY v.1': ['Нарезка резьбы', 'Голтовка', 'УВ корпуса'],
                'XGRAY v.2': ['Нарезка резьбы', 'Голтовка', 'УВ корпуса'],
                'XSMART mini': ['Сборка']
            },
            'frezerniy': {
                'XRAY 1': ['Поликарбонат Прозрачный 6мм'],
                'XRAY 3': ['Поликарбонат Прозрачный 6мм'],
                'XRAY 3-2': ['Поликарбонат Прозрачный 6мм х 2'],
                'XRAY 6-2 проходной': ['Поликарбонат Прозрачный 3мм х 2'],
                'XRAY 6-2 оконечный': ['Поликарбонат Прозрачный 3мм х 2'],
                'XRAY 9': ['Поликарбонат Прозрачный 6мм'],
                'XRAY 18': ['Поликарбонат Прозрачный 6мм'],
                'XRAY 36': ['Поликарбонат Прозрачный 6мм'],
                'XPIXEL BIN v.1': ['Plexiglas Опал 30% 2мм'],
                'XPIXEL BIN v.2': ['Plexiglas Опал 30% 2мм'],
                'XPIXEL BIN v.3': ['Plexiglas Опал 30% 2мм'],
                'XDISK': ['ПВХ 10мм'],
                'XROLL-lite P': ['Заглушка AL 3мм'],
                'XROLL-lite K': ['Заглушка AL 3мм'],
                'XWHITE': ['Заглушка AL 3мм'],
                'XEYES 130*90 1': ['Поликарбонат Прозрачный 3мм'],
                'XEYES 130*90 2': ['Поликарбонат Прозрачный 3мм'],
                'XEYES 130*90 3': ['Поликарбонат Прозрачный 3мм'],
                'XEYES 130*90 4': ['Поликарбонат Прозрачный 3мм'],
                'XEYES 130*120 1': ['Поликарбонат Прозрачный 3мм'],
                'XEYES 130*120 2': ['Поликарбонат Прозрачный 3мм'],
                'XEYES 130*120 3': ['Поликарбонат Прозрачный 3мм'],
                'XEYES 130*120 4': ['Поликарбонат Прозрачный 3мм'],
                'XGIRO': ['Заглушка AL 3мм', 'Вставка ПВХ 3мм'],
                'XGLOW': ['Заглушка AL 3мм Левая', 'Заглушка AL 3мм Правая'],
                'XGRAY v.1': ['Заглушка AL 3мм Левая', 'Заглушка AL 3мм Правая'],
                'XGRAY v.2': ['Заглушка AL 3мм Левая', 'Заглушка AL 3мм Правая'],
                'XLITE': ['Вставка ПВХ 3мм', 'Заглушка AL 3мм'],
                'XSMART': ['Вставка ПВХ 3мм', 'Заглушка AL 3мм'],
                'XSMART MINI': ['Вставка ПВХ 3мм', 'Заглушка AL 3мм'],
                'XSTRONG': ['Вставка ПВХ 3мм'],
                'XBAR-SW': ['Вставка ПВХ 3мм'],
                'XFOCUS': ['Вставка ПВХ 3мм'],
                'XYELLOW': ['Заглушка AL 3мм'],
                'XLINE': ['Заглушка AL 4мм']
            },
            'lazerno': {
                'XRAY 1': ['Раскрой XRAY 1 Кронштейн', 'Гибка XRAY 1 Кронштейн'],
                'XRAY 3': ['Раскрой Кронштейн A', 'Гибка Кронштейн A'],
                'XRAY 3-2': ['Раскрой Кронштейн A', 'Гибка Кронштейн A'],
                'XRAY 3-GRP': ['Раскрой XRAY 1 Кронштейн', 'Гибка XRAY 1 Кронштейн'],
                'XRAY 6': ['Раскрой Фоновая заглушка', 'Раскрой Кронштейн B', 'Гибка Кронштейн B'],
                'XRAY 6 RGBW': ['Раскрой Фоновая заглушка', 'Раскрой Кронштейн B', 'Гибка Кронштейн B'],
                'XRAY 6-2 проходной': ['Раскрой Кронштейн B', 'Гибка Кронштейн B'],
                'XRAY 6-2 оконечный': ['Раскрой Кронштейн B', 'Гибка Кронштейн B'],
                'XRAY 6-T2 BT 180': ['Раскрой Основания платы', 'Раскрой Фоновая заглушка', 'Раскрой Кронштейн BT', 'Гибка Кронштейн BT'],
                'XRAY 6-T2 BT 200': ['Раскрой Основания платы', 'Раскрой Фоновая заглушка', 'Раскрой Кронштейн BT', 'Гибка Кронштейн BT'],
                'XRAY 6-T2 BT 220': ['Раскрой Основания платы', 'Раскрой Фоновая заглушка', 'Раскрой Кронштейн BT', 'Гибка Кронштейн BT'],
                'XRAY 6-T2 BT 220 Шторка x2': ['Раскрой Основания платы', 'Раскрой Фоновая заглушка', 'Раскрой Кронштейн BT', 'Гибка Кронштейн BT'],
                'XRAY 6-T2 BT 240 Шторка': ['Раскрой Основания платы', 'Раскрой Фоновая заглушка', 'Раскрой Кронштейн BT', 'Гибка Кронштейн BT'],
                'XRAY 6T Накладной': ['Раскрой Задняя крышка', 'Раскрой Основания платы', 'Раскрой Фоновая заглушка'],
                'XRAY 9': ['Раскрой Кронштейн C', 'Гибка Кронштейн C'],
                'XRAY 9S': ['Раскрой Задняя крышка', 'Раскрой Основания платы', 'Раскрой Кронштейн C', 'Гибка Кронштейн C'],
                'XRAY 12S': ['Раскрой Задняя крышка', 'Раскрой Основания платы', 'Раскрой Кронштейн F', 'Гибка Кронштейн F'],
                'XRAY 18': ['Раскрой Фоновая заглушка', 'Раскрой Кронштейн D', 'Гибка Кронштейн D'],
                'XRAY 18S': ['Раскрой Основания платы', 'Раскрой Фоновая заглушка', 'Раскрой Кронштейн D', 'Гибка Кронштейн D'],
                'XRAY 36': ['Раскрой Фоновая заглушка', 'Раскрой Кронштейн G', 'Гибка Кронштейн G'],
                'XRAY 36S': ['Раскрой Основания платы', 'Раскрой Фоновая заглушка', 'Раскрой Кронштейн G', 'Гибка Кронштейн G'],
                'XGRAY v.1': ['Раскрой Заглушка модуля'],
                'XGRAY v.2': ['Раскрой Заглушка модуля', 'Раскрой Кронштейна P Лира выносная', 'Раскрой Кронштейн LU или PU', 'Гибка Кронштейна P Лира выносная', 'Гибка Кронштейн LU или PU'],
                'XSMART mini': ['Раскрой Вставка XSMART mini', 'Раскрой Кронштейн P Лира', 'Раскрой Кронштейн LU или PU', 'Гибка Кронштейн P Лира', 'Гибка Кронштейн LU или PU'],
                'XLITE': ['Раскрой Лира (Q-серия) Универсальная', 'Раскрой Кронштейн LU или PU', 'Гибка Лира (Q-серия) Универсальная', 'Гибка Кронштейн LU или PU']
            },
            'polimerniy': {
                'XRAY 1': ['Корпус в сборе', 'Кронштейн'],
                'XRAY 3': ['Корпус в сборе', 'Кронштейн'],
                'XRAY 3-2': ['Корпус в сборе', 'Кронштейн'],
                'XRAY 3-GRP': ['Корпус', 'Кронштейн'],
                'XRAY 6': ['Корпус', 'Кронштейн', 'Фоновая Заглушка'],
                'XRAY 6 RGBW': ['Корпус', 'Кронштейн', 'Фоновая Заглушка'],
                'XRAY 6-2 проходной': ['Корпус в сборе', 'Кронштейн'],
                'XRAY 6-2 оконечный': ['Корпус в сборе', 'Кронштейн'],
                'XRAY 6-T2 BT 180': ['Корпус', 'Фоновая заглушка'],
                'XRAY 6-T2 BT 200': ['Корпус', 'Фоновая заглушка'],
                'XRAY 6-T2 BT 220': ['Корпус', 'Фоновая заглушка'],
                'XRAY 6-T2 BT 220 Шторка x2': ['Корпус', 'Фоновая заглушка'],
                'XRAY 6-T2 BT 240 Шторка': ['Корпус', 'Фоновая заглушка'],
                'XRAY 6T Накладной': ['Корпус', 'Крепление', 'Задняя крышка', 'Фоновая заглушка'],
                'XRAY 9': ['Корпус', 'Кольцо', 'Задняя крышка', 'Кронштейн'],
                'XRAY 9S': ['Корпус', 'Фоновая заглушка', 'Кронштейн'],
                'XRAY 12S': ['Корпус', 'Фоновая заглушка', 'Кронштейн'],
                'XRAY 18': ['Корпус', 'Фоновая заглушка', 'Кольцо', 'Задняя крышка', 'Кронштейн'],
                'XRAY 18S': ['Корпус', 'Фоновая заглушка', 'Кронштейн'],
                'XGRAY v.1': ['Профиль', 'Заглушка Левая', 'Заглушка Правая', 'Кронштейн AL'],
                'XGRAY v.2': ['Профиль', 'Заглушка Левая', 'Заглушка Правая', 'Лира', 'Кронштейн'],
                'XSMART mini': ['Профиль', 'Заглушка', 'Лира', 'Кронштейн']
            }
        };
    }
    
    // Получить операции для изделия на текущем участке
    getOperationsForProduct(productName) {
        const siteOps = this.operationsDB[this.siteType];
        if (!siteOps) return [];
        
        if (siteOps[productName]) {
            return siteOps[productName];
        }
        
        for (let key in siteOps) {
            if (productName.includes(key) || key.includes(productName)) {
                return siteOps[key];
            }
        }
        
        return [];
    }
    
    // Загрузить заказы и задачи
    loadData() {
        this.orders = loadOrdersFromStorage() || [];
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    // Загрузить историю задач для конкретной даты
    loadHistoryForDate(date) {
        const dateStr = this.formatDate(date);
        const savedHistory = localStorage.getItem(`tasks_${this.siteType}_${dateStr}`);
        
        if (savedHistory) {
            this.taskHistory[dateStr] = JSON.parse(savedHistory);
            this.tasks = this.taskHistory[dateStr] || [];
        } else {
            this.tasks = this.generateTasks();
            this.saveHistoryForDate(date);
        }
        
        return this.tasks;
    }
    
    // Сохранить историю задач для даты
    saveHistoryForDate(date) {
        const dateStr = this.formatDate(date);
        this.taskHistory[dateStr] = this.tasks;
        localStorage.setItem(`tasks_${this.siteType}_${dateStr}`, JSON.stringify(this.tasks));
    }
    
    // Сгенерировать задачи для участка из заказов
    generateTasks() {
        const tasks = [];
        const dateStr = this.formatDate(this.currentDate);
        
        this.orders.forEach(order => {
            if (order.status !== 'active') return;
            
            order.items.forEach(item => {
                const productName = item.product;
                const operations = this.getOperationsForProduct(productName);
                
                operations.forEach((op, index) => {
                    const taskId = `${order.id}_${productName}_${this.siteType}_${index}`;
                    const existingTask = this.taskHistory[dateStr]?.find(t => t.id === taskId);
                    
                    if (existingTask) {
                        tasks.push(existingTask);
                    } else {
                        tasks.push({
                            id: taskId,
                            orderId: order.id,
                            orderNumber: order.number,
                            product: productName,
                            size: item.size || 'Стандартный',
                            totalQuantity: item.quantity || 1,
                            completedQuantity: 0,
                            operation: op,
                            operationIndex: index,
                            status: 'pending',
                            executors: [],
                            date: dateStr,
                            isExtra: false
                        });
                    }
                });
            });
            
            if (order.extraTasks && order.extraTasks.length > 0) {
                order.extraTasks.forEach((extraTask, index) => {
                    if (extraTask.site !== this.siteType) return;
                    
                    const taskId = `${order.id}_extra_${index}`;
                    const existingTask = this.taskHistory[dateStr]?.find(t => t.id === taskId);
                    
                    if (existingTask) {
                        tasks.push(existingTask);
                    } else {
                        tasks.push({
                            id: taskId,
                            orderId: order.id,
                            orderNumber: order.number,
                            product: extraTask.title,
                            description: extraTask.description,
                            totalQuantity: 1,
                            completedQuantity: 0,
                            operation: extraTask.title,
                            status: 'pending',
                            executors: [],
                            date: dateStr,
                            isExtra: true
                        });
                    }
                });
            }
        });
        
        return tasks;
    }
    
    // Обновить статус задачи
    updateTaskStatus(taskId, status) {
        const dateStr = this.formatDate(this.currentDate);
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) return false;
        
        this.tasks[taskIndex].status = status;
        this.saveHistoryForDate(this.currentDate);
        this.updateOrderTaskStatus(taskId, status);
        this.notifyOtherTabs(taskId, status);
        
        return true;
    }
    
    // Обновить статус в заказе (для квадратиков в планировщике)
    updateOrderTaskStatus(taskId, status) {
        const [orderId] = taskId.split('_');
        const orderIndex = this.orders.findIndex(o => o.id == orderId);
        
        if (orderIndex === -1) return;
        
        if (!this.orders[orderIndex].tasks) {
            this.orders[orderIndex].tasks = {};
        }
        
        let squareStatus = '';
        if (status === 'in_progress') squareStatus = 'orange';
        if (status === 'completed') squareStatus = 'green';
        
        this.orders[orderIndex].tasks[taskId] = squareStatus;
        saveOrdersToStorage(this.orders);
    }
    
    // Добавить исполнителя
    addExecutor(taskId, executorName) {
        const dateStr = this.formatDate(this.currentDate);
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) return false;
        
        if (!this.tasks[taskIndex].executors) {
            this.tasks[taskIndex].executors = [];
        }
        
        this.tasks[taskIndex].executors.push({
            name: executorName,
            quantity: 0,
            status: 'pending',
            addedAt: new Date().toISOString()
        });
        
        this.saveHistoryForDate(this.currentDate);
        return true;
    }
    
    // Обновить количество и статус исполнителя
    updateExecutorQuantity(taskId, executorName, quantity) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        
        const executor = this.tasks[taskIndex].executors?.find(e => e.name === executorName);
        if (!executor) return false;
        
        executor.quantity = quantity;
        
        const totalCompleted = this.tasks[taskIndex].executors.reduce((sum, e) => sum + (e.quantity || 0), 0);
        this.tasks[taskIndex].completedQuantity = totalCompleted;
        
        if (executor.quantity >= this.tasks[taskIndex].totalQuantity) {
            executor.status = 'completed';
        }
        
        this.saveHistoryForDate(this.currentDate);
        
        const squareStatus = totalCompleted > 0 ? 'in_progress' : 'pending';
        this.updateOrderTaskStatus(taskId, squareStatus);
        
        return true;
    }
    
    // Обновить статус исполнителя
    updateExecutorStatus(taskId, executorName, status) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        
        const executor = this.tasks[taskIndex].executors?.find(e => e.name === executorName);
        if (!executor) return false;
        
        executor.status = status;
        
        this.saveHistoryForDate(this.currentDate);
        
        if (status === 'in_progress' && this.tasks[taskIndex].status !== 'completed') {
            this.updateTaskStatus(taskId, 'in_progress');
        }
        
        return true;
    }
    
    // Завершить задачу
    completeTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        
        this.tasks[taskIndex].status = 'completed';
        this.tasks[taskIndex].completedQuantity = this.tasks[taskIndex].totalQuantity;
        
        if (this.tasks[taskIndex].executors) {
            this.tasks[taskIndex].executors.forEach(e => {
                e.status = 'completed';
                e.quantity = this.tasks[taskIndex].totalQuantity;
            });
        }
        
        this.saveHistoryForDate(this.currentDate);
        this.updateOrderTaskStatus(taskId, 'completed');
        
        return true;
    }
    
    // Установить дату
    setDate(date) {
        this.currentDate = new Date(date);
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    prevDay() {
        this.currentDate.setDate(this.currentDate.getDate() - 1);
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    nextDay() {
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    today() {
        this.currentDate = new Date();
        this.loadHistoryForDate(this.currentDate);
        return this.tasks;
    }
    
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    notifyOtherTabs(taskId, status) {
        const event = new CustomEvent('taskStatusChanged', {
            detail: { taskId, status }
        });
        window.dispatchEvent(event);
    }
}
