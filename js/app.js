// Перехват ошибок для отладки
window.addEventListener('error', function(e) {
    console.error('❌ Поймана ошибка:', e.error);
    console.error('Стек вызовов:', e.error.stack);
    alert('Ошибка: ' + e.error.message + '\n\nСмотри консоль (F12) для деталей');
});

// Глобальные переменные
let products = [];
let brackets = [];
let lyres = [];
let ralColors = [];
let orders = [];
let materialsReport = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    showLoading();
    try {
        await loadAllData();
    } catch (error) {
        showError('Ошибка загрузки данных: ' + error.message);
    } finally {
        hideLoading();
    }
});

// Показать загрузку
function showLoading() {
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        font-size: 18px;
    `;
    loader.innerHTML = 'Загрузка данных... ⏳';
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) loader.remove();
}

function showError(message) {
    alert('❌ ' + message);
}

// Загрузка всех данных
async function loadAllData() {
    try {
        console.log('=== НАЧАЛО ЗАГРУЗКИ ДАННЫХ ===');
        
        // Загружаем ВСЕ данные параллельно
        const [productsData, bracketsData, lyresData, ralData] = await Promise.all([
            loadProducts(),
            loadBrackets(),
            loadLyres(),
            loadRALColors()
        ]);
        
        products = productsData || [];
        brackets = bracketsData || [];
        lyres = lyresData || [];
        ralColors = ralData || [];
        
        console.log('✅ Продукты загружены:', products.length);
        console.log('✅ Кронштейны загружены:', brackets.length);
        console.log('✅ Лиры загружены:', lyres.length);
        console.log('✅ Цвета RAL загружены:', ralColors.length);
        
        // Загружаем заказы
        orders = loadOrdersFromStorage() || [];
        console.log('✅ Заказы загружены:', orders.length);
        
        // Заполняем выпадающие списки
        console.log('Заполняем select-ы...');
        populateSelects();
        populateRALSelect();
        
        // Загружаем заказы на страницу
        loadOrders();
        
        // Обновляем статистику
        updateStatistics();
        
        // Инициализируем отчет по материалам
        if (typeof MaterialsReport !== 'undefined') {
            materialsReport = new MaterialsReport();
            // Передаем загруженные данные
            materialsReport.materialsDB.brackets = brackets;
            materialsReport.materialsDB.lyres = lyres;
            await materialsReport.loadMaterialsData();
        }
        
        setupEventListeners();
        
        console.log('=== ВСЕ ДАННЫЕ УСПЕШНО ЗАГРУЖЕНЫ ===');
    } catch (error) {
        console.error('❌ ОШИБКА загрузки данных:', error);
        showError('Ошибка загрузки данных: ' + error.message);
    }
}

// Загрузка цветов RAL
async function loadRALColors() {
    // Данные из ClusterX - RAL_База.csv (сокращенная версия)
    return [
        { code: "RAL 1001", name: "Бежевый", hex: "#C2B078" },
        { code: "RAL 1002", name: "Песочный", hex: "#C6A664" },
        { code: "RAL 1003", name: "Сигнальный жёлтый", hex: "#E5BE01" },
        { code: "RAL 1004", name: "Золотисто-жёлтый", hex: "#CDA434" },
        { code: "RAL 1005", name: "Медово-жёлтый", hex: "#A98307" },
        { code: "RAL 1006", name: "Янтарно-жёлтый", hex: "#E4A010" },
        { code: "RAL 1007", name: "Нарциссово-жёлтый", hex: "#DC9D00" },
        { code: "RAL 1011", name: "Коричнево-бежевый", hex: "#8A6642" },
        { code: "RAL 1012", name: "Лимонно-жёлтый", hex: "#C7B446" },
        { code: "RAL 1013", name: "Жемчужно-белый", hex: "#EAE6CA" },
        { code: "RAL 1014", name: "Слоновая кость", hex: "#E1CC4F" },
        { code: "RAL 1015", name: "Светлая слоновая кость", hex: "#E6D690" },
        { code: "RAL 1016", name: "Серно-жёлтый", hex: "#F4F400" },
        { code: "RAL 1017", name: "Шафраново-жёлтый", hex: "#F6B600" },
        { code: "RAL 1018", name: "Цинково-жёлтый", hex: "#FDD700" },
        { code: "RAL 1019", name: "Серо-бежевый", hex: "#A38C15" },
        { code: "RAL 1020", name: "Оливково-жёлтый", hex: "#999950" },
        { code: "RAL 1021", name: "Рапсово-жёлтый", hex: "#F3DA0B" },
        { code: "RAL 1023", name: "Транспортно-жёлтый", hex: "#F7B500" },
        { code: "RAL 1024", name: "Охра жёлтая", hex: "#BA8F4C" },
        { code: "RAL 1026", name: "Люминесцентный жёлтый", hex: "#FFFF00" },
        { code: "RAL 1027", name: "Карри", hex: "#A77F0E" },
        { code: "RAL 1028", name: "Дынно-жёлтый", hex: "#FF9E00" },
        { code: "RAL 1032", name: "Бросающийся в глаза жёлтый", hex: "#D1B400" },
        { code: "RAL 1033", name: "Георгиново-жёлтый", hex: "#F2A900" },
        { code: "RAL 1034", name: "Пастельно-жёлтый", hex: "#F4C430" },
        { code: "RAL 1035", name: "Жемчужно-бежевый", hex: "#6A5F31" },
        { code: "RAL 1036", name: "Жемчужно-золотой", hex: "#705335" },
        { code: "RAL 1037", name: "Солнечно-жёлтый", hex: "#F39F18" },
        { code: "RAL 2000", name: "Жёлто-оранжевый", hex: "#DA6E00" },
        { code: "RAL 2001", name: "Красно-оранжевый", hex: "#BA481B" },
        { code: "RAL 2002", name: "Киноварно-красный", hex: "#BF3922" },
        { code: "RAL 2003", name: "Пастельно-оранжевый", hex: "#F67828" },
        { code: "RAL 2004", name: "Чисто-оранжевый", hex: "#E25303" },
        { code: "RAL 2005", name: "Люминесцентный оранжевый", hex: "#FF4D06" },
        { code: "RAL 2007", name: "Ярко-оранжевый", hex: "#FFB200" },
        { code: "RAL 2008", name: "Красно-оранжевый", hex: "#F75E25" },
        { code: "RAL 2009", name: "Транспортно-оранжевый", hex: "#F54021" },
        { code: "RAL 2010", name: "Сигнально-оранжевый", hex: "#D84B20" },
        { code: "RAL 2011", name: "Глубокий оранжевый", hex: "#EC7C26" },
        { code: "RAL 2012", name: "Лососево-оранжевый", hex: "#E55137" },
        { code: "RAL 2013", name: "Перламутрово-оранжевый", hex: "#C35831" },
        { code: "RAL 3000", name: "Огненно-красный", hex: "#A2231D" },
        { code: "RAL 3001", name: "Сигнальный красный", hex: "#A0342C" },
        { code: "RAL 3002", name: "Карминно-красный", hex: "#A12312" },
        { code: "RAL 3003", name: "Рубиново-красный", hex: "#8D1D2C" },
        { code: "RAL 3004", name: "Пурпурно-красный", hex: "#701F29" },
        { code: "RAL 3005", name: "Винно-красный", hex: "#5E2129" },
        { code: "RAL 3007", name: "Чёрно-красный", hex: "#412227" },
        { code: "RAL 3009", name: "Оксидно-красный", hex: "#642424" },
        { code: "RAL 3011", name: "Красно-коричневый", hex: "#781F19" },
        { code: "RAL 3012", name: "Бежево-красный", hex: "#C1876B" },
        { code: "RAL 3013", name: "Томатно-красный", hex: "#A12312" },
        { code: "RAL 3014", name: "Розово-красный", hex: "#D36E70" },
        { code: "RAL 3015", name: "Светло-розовый", hex: "#EA899A" },
        { code: "RAL 3016", name: "Кораллово-красный", hex: "#B32821" },
        { code: "RAL 3017", name: "Розовый", hex: "#E63244" },
        { code: "RAL 3018", name: "Землянично-красный", hex: "#D53032" },
        { code: "RAL 3020", name: "Транспортно-красный", hex: "#CC0605" },
        { code: "RAL 3022", name: "Лососево-красный", hex: "#D95030" },
        { code: "RAL 3024", name: "Люминесцентный красный", hex: "#F80000" },
        { code: "RAL 3026", name: "Ярко-красный", hex: "#FE0000" },
        { code: "RAL 3027", name: "Малиново-красный", hex: "#C51D34" },
        { code: "RAL 3028", name: "Чисто-красный", hex: "#CB3234" },
        { code: "RAL 3031", name: "Ориент-красный", hex: "#A02C2D" },
        { code: "RAL 3032", name: "Жемчужно-тёмно-красный", hex: "#B32428" },
        { code: "RAL 3033", name: "Жемчужно-светло-красный", hex: "#A52019" },
        { code: "RAL 4001", name: "Красно-лиловый", hex: "#816183" },
        { code: "RAL 4002", name: "Красно-фиолетовый", hex: "#8D3C4B" },
        { code: "RAL 4003", name: "Вересковый", hex: "#C4618C" },
        { code: "RAL 4004", name: "Бордово-фиолетовый", hex: "#651E38" },
        { code: "RAL 4005", name: "Сине-лиловый", hex: "#76689A" },
        { code: "RAL 4006", name: "Транспортно-пурпурный", hex: "#903373" },
        { code: "RAL 4007", name: "Пурпурно-фиолетовый", hex: "#47243C" },
        { code: "RAL 4008", name: "Сигнально-фиолетовый", hex: "#844C82" },
        { code: "RAL 4009", name: "Пастельно-фиолетовый", hex: "#9D8692" },
        { code: "RAL 4010", name: "Жемчужно-розовый", hex: "#BB4077" },
        { code: "RAL 4011", name: "Жемчужно-тёмно-фиолетовый", hex: "#6B6880" },
        { code: "RAL 4012", name: "Жемчужно-светло-фиолетовый", hex: "#6D647B" },
        { code: "RAL 5000", name: "Фиолетово-синий", hex: "#314F6F" },
        { code: "RAL 5001", name: "Зелёно-синий", hex: "#0F3052" },
        { code: "RAL 5002", name: "Ультрамариновый", hex: "#00387B" },
        { code: "RAL 5003", name: "Сапфирово-синий", hex: "#1F3855" },
        { code: "RAL 5004", name: "Чёрно-синий", hex: "#191E28" },
        { code: "RAL 5005", name: "Сигнально-синий", hex: "#005387" },
        { code: "RAL 5007", name: "Бриллиантово-синий", hex: "#376B8C" },
        { code: "RAL 5008", name: "Серо-синий", hex: "#2B3A44" },
        { code: "RAL 5009", name: "Лазурно-синий", hex: "#225F78" },
        { code: "RAL 5010", name: "Горечавково-синий", hex: "#004F7C" },
        { code: "RAL 5011", name: "Стально-синий", hex: "#1A2B3C" },
        { code: "RAL 5012", name: "Голубой", hex: "#0089B6" },
        { code: "RAL 5013", name: "Кобальтово-синий", hex: "#193153" },
        { code: "RAL 5014", name: "Голубино-синий", hex: "#637D96" },
        { code: "RAL 5015", name: "Небесно-синий", hex: "#007BC1" },
        { code: "RAL 5017", name: "Транспортно-синий", hex: "#005B8C" },
        { code: "RAL 5018", name: "Бирюзово-синий", hex: "#058B8C" },
        { code: "RAL 5019", name: "Капри-синий", hex: "#005E83" },
        { code: "RAL 5020", name: "Океанско-синий", hex: "#1D334A" },
        { code: "RAL 5021", name: "Водяной", hex: "#007577" },
        { code: "RAL 5022", name: "Ночной синий", hex: "#222D5A" },
        { code: "RAL 5023", name: "Дистанционно-синий", hex: "#42698C" },
        { code: "RAL 5024", name: "Пастельно-синий", hex: "#6093AC" },
        { code: "RAL 5025", name: "Генцианово-синий", hex: "#21697C" },
        { code: "RAL 5026", name: "Жемчужно-синий", hex: "#0F3052" },
        { code: "RAL 6000", name: "Патиновый", hex: "#327662" },
        { code: "RAL 6001", name: "Изумрудно-зелёный", hex: "#287233" },
        { code: "RAL 6002", name: "Лиственно-зелёный", hex: "#2D572C" },
        { code: "RAL 6003", name: "Оливково-зелёный", hex: "#424632" },
        { code: "RAL 6004", name: "Сине-зелёный", hex: "#1F3A3D" },
        { code: "RAL 6005", name: "Мохово-зелёный", hex: "#0F4336" },
        { code: "RAL 6006", name: "Серо-оливковый", hex: "#3E3B32" },
        { code: "RAL 6007", name: "Бутылочно-зелёный", hex: "#2F4538" },
        { code: "RAL 6008", name: "Коричнево-зелёный", hex: "#483C32" },
        { code: "RAL 6009", name: "Пихтово-зелёный", hex: "#31372B" },
        { code: "RAL 6010", name: "Травянисто-зелёный", hex: "#35682D" },
        { code: "RAL 6011", name: "Резедово-зелёный", hex: "#587246" },
        { code: "RAL 6012", name: "Чёрно-зелёный", hex: "#343B29" },
        { code: "RAL 6013", name: "Тростниково-зелёный", hex: "#6C7156" },
        { code: "RAL 6014", name: "Жёлто-оливковый", hex: "#47402E" },
        { code: "RAL 6015", name: "Чёрно-оливковый", hex: "#3B3C36" },
        { code: "RAL 6016", name: "Бирюзово-зелёный", hex: "#1E5945" },
        { code: "RAL 6017", name: "Майско-зелёный", hex: "#4C9141" },
        { code: "RAL 6018", name: "Жёлто-зелёный", hex: "#57A639" },
        { code: "RAL 6019", name: "Бело-зелёный", hex: "#BDECB6" },
        { code: "RAL 6020", name: "Хромово-зелёный", hex: "#2E3A23" },
        { code: "RAL 6021", name: "Бледно-зелёный", hex: "#89AC76" },
        { code: "RAL 6022", name: "Коричнево-оливковый", hex: "#25221B" },
        { code: "RAL 6024", name: "Транспортно-зелёный", hex: "#308446" },
        { code: "RAL 6025", name: "Папоротниково-зелёный", hex: "#3D642D" },
        { code: "RAL 6026", name: "Опалово-зелёный", hex: "#015D52" },
        { code: "RAL 6027", name: "Светло-зелёный", hex: "#84C3BE" },
        { code: "RAL 6028", name: "Сосново-зелёный", hex: "#2C5545" },
        { code: "RAL 6029", name: "Мятно-зелёный", hex: "#20603D" },
        { code: "RAL 6032", name: "Сигнально-зелёный", hex: "#317F43" },
        { code: "RAL 6033", name: "Мятно-бирюзовый", hex: "#497E76" },
        { code: "RAL 6034", name: "Пастельно-бирюзовый", hex: "#7FB5B5" },
        { code: "RAL 6035", name: "Жемчужно-зелёный", hex: "#1C542D" },
        { code: "RAL 6036", name: "Жемчужно-тёмно-зелёный", hex: "#193737" },
        { code: "RAL 6037", name: "Чисто-зелёный", hex: "#008F39" },
        { code: "RAL 6038", name: "Люминесцентный зелёный", hex: "#00BB2D" },
        { code: "RAL 7000", name: "Серебристо-серый", hex: "#78858B" },
        { code: "RAL 7001", name: "Серебристый", hex: "#8A9597" },
        { code: "RAL 7002", name: "Оливково-серый", hex: "#817F68" },
        { code: "RAL 7003", name: "Мохово-серый", hex: "#7A7B6D" },
        { code: "RAL 7004", name: "Сигнальный серый", hex: "#9EA0A1" },
        { code: "RAL 7005", name: "Мышино-серый", hex: "#6B716F" },
        { code: "RAL 7006", name: "Бежево-серый", hex: "#756F61" },
        { code: "RAL 7008", name: "Хаки", hex: "#746643" },
        { code: "RAL 7009", name: "Зеленовато-серый", hex: "#5B6259" },
        { code: "RAL 7010", name: "Палаточно-серый", hex: "#575D57" },
        { code: "RAL 7011", name: "Железно-серый", hex: "#555D61" },
        { code: "RAL 7012", name: "Базальтово-серый", hex: "#596163" },
        { code: "RAL 7013", name: "Коричневато-серый", hex: "#555548" },
        { code: "RAL 7015", name: "Сланцево-серый", hex: "#51565C" },
        { code: "RAL 7016", name: "Антрацитово-серый", hex: "#383E42" },
        { code: "RAL 7021", name: "Чёрно-серый", hex: "#2E3234" },
        { code: "RAL 7022", name: "Умбра", hex: "#4B4D46" },
        { code: "RAL 7023", name: "Бетонно-серый", hex: "#818479" },
        { code: "RAL 7024", name: "Графитово-серый", hex: "#474A51" },
        { code: "RAL 7026", name: "Гранитово-серый", hex: "#374447" },
        { code: "RAL 7030", name: "Каменно-серый", hex: "#928E85" },
        { code: "RAL 7031", name: "Сине-серый", hex: "#5B686D" },
        { code: "RAL 7032", name: "Галечно-серый", hex: "#B5B8B1" },
        { code: "RAL 7033", name: "Цементно-серый", hex: "#7F8274" },
        { code: "RAL 7034", name: "Жёлто-серый", hex: "#92886F" },
        { code: "RAL 7035", name: "Светло-серый", hex: "#CBD0CC" },
        { code: "RAL 7036", name: "Платиново-серый", hex: "#9A9697" },
        { code: "RAL 7037", name: "Пыльно-серый", hex: "#7C7F7E" },
        { code: "RAL 7038", name: "Агатово-серый", hex: "#B4B8B0" },
        { code: "RAL 7039", name: "Кварцевый", hex: "#6B695F" },
        { code: "RAL 7040", name: "Оконно-серый", hex: "#9DA3A6" },
        { code: "RAL 7042", name: "Транспортно-серый", hex: "#8F9695" },
        { code: "RAL 7043", name: "Транспортно-серый B", hex: "#4E5452" },
        { code: "RAL 7044", name: "Шёлково-серый", hex: "#BDBDB2" },
        { code: "RAL 7045", name: "Теле-серый 1", hex: "#91969A" },
        { code: "RAL 7046", name: "Теле-серый 2", hex: "#82898F" },
        { code: "RAL 7047", name: "Теле-серый 4", hex: "#CFD0CF" },
        { code: "RAL 7048", name: "Жемчужно-серый", hex: "#888175" },
        { code: "RAL 8000", name: "Зеленовато-коричневый", hex: "#826C34" },
        { code: "RAL 8001", name: "Охра", hex: "#955F20" },
        { code: "RAL 8002", name: "Сигнально-коричневый", hex: "#6C3B2A" },
        { code: "RAL 8003", name: "Глинисто-коричневый", hex: "#734222" },
        { code: "RAL 8004", name: "Медно-коричневый", hex: "#8E402A" },
        { code: "RAL 8007", name: "Оленье-коричневый", hex: "#59351F" },
        { code: "RAL 8008", name: "Оливково-коричневый", hex: "#6F4F28" },
        { code: "RAL 8011", name: "Орехово-коричневый", hex: "#5B3A29" },
        { code: "RAL 8012", name: "Красно-коричневый", hex: "#592321" },
        { code: "RAL 8014", name: "Сепия", hex: "#382C1E" },
        { code: "RAL 8015", name: "Каштаново-коричневый", hex: "#633A34" },
        { code: "RAL 8016", name: "Махагон", hex: "#4C2F27" },
        { code: "RAL 8017", name: "Шоколадно-коричневый", hex: "#45322E" },
        { code: "RAL 8019", name: "Серо-коричневый", hex: "#403A3A" },
        { code: "RAL 8022", name: "Чёрно-коричневый", hex: "#212121" },
        { code: "RAL 8023", name: "Оранжево-коричневый", hex: "#A65E2E" },
        { code: "RAL 8024", name: "Бежево-коричневый", hex: "#79553C" },
        { code: "RAL 8025", name: "Бледно-коричневый", hex: "#755C48" },
        { code: "RAL 8028", name: "Терракотовый", hex: "#4E3B31" },
        { code: "RAL 8029", name: "Жемчужно-медный", hex: "#763C28" },
        { code: "RAL 9001", name: "Кремово-белый", hex: "#FDF4E3" },
        { code: "RAL 9002", name: "Бежево-серый", hex: "#E7EBDA" },
        { code: "RAL 9003", name: "Сигнальный белый", hex: "#F4F4F4" },
        { code: "RAL 9004", name: "Сигнальный чёрный", hex: "#282828" },
        { code: "RAL 9005", name: "Чёрный", hex: "#0A0A0A" },
        { code: "RAL 9006", name: "Бело-алюминиевый", hex: "#A5A5A5" },
        { code: "RAL 9007", name: "Серо-алюминиевый", hex: "#8F8F8F" },
        { code: "RAL 9010", name: "Чисто-белый", hex: "#FFFFFF" },
        { code: "RAL 9011", name: "Графитово-чёрный", hex: "#1C1C1C" },
        { code: "RAL 9016", name: "Транспортно-белый", hex: "#F6F6F6" },
        { code: "RAL 9017", name: "Транспортно-чёрный", hex: "#1E1E1E" },
        { code: "RAL 9018", name: "Папирусно-белый", hex: "#D7D7D7" },
        { code: "RAL 9022", name: "Светло-серый", hex: "#9C9C9C" },
        { code: "RAL 9023", name: "Тёмно-серый", hex: "#828282" }
    ];
}

// Заполнение выпадающего списка RAL
function populateRALSelect() {
    const ralSelect = document.getElementById('ralSelect');
    if (!ralSelect) return;
    
    ralSelect.innerHTML = '<option value="">Выберите цвет RAL</option>';
    
    ralColors.forEach(color => {
        const option = document.createElement('option');
        option.value = color.code;
        option.textContent = `${color.code} - ${color.name}`;
        option.setAttribute('data-hex', color.hex);
        ralSelect.appendChild(option);
    });
    
    // Добавляем предпросмотр цвета
    ralSelect.addEventListener('change', function(e) {
        const preview = document.getElementById('ralPreview');
        const selected = ralSelect.options[ralSelect.selectedIndex];
        const hex = selected.getAttribute('data-hex');
        
        if (hex && preview) {
            preview.style.backgroundColor = hex;
            preview.style.display = 'inline-block';
        } else if (preview) {
            preview.style.display = 'none';
        }
    });
}

// Заполнение выпадающих списков
function populateSelects() {
    console.log('=== ЗАПОЛНЕНИЕ SELECT-ОВ ===');
    
    // Заполняем изделия
    const productSelect = document.getElementById('productSelect');
    if (productSelect) {
        productSelect.innerHTML = '<option value="">Выберите изделие</option>';
        
        if (products && products.length > 0) {
            products.sort((a, b) => a.name.localeCompare(b.name));
            products.forEach(product => {
                if (product && product.name) {
                    const option = document.createElement('option');
                    option.value = product.name;
                    option.textContent = product.name;
                    productSelect.appendChild(option);
                }
            });
            console.log('✅ Изделий добавлено:', products.length);
        }
    }
    
    // Заполняем кронштейны с опцией "отсутствует"
    const bracketSelect = document.getElementById('bracketSelect');
    if (bracketSelect) {
        bracketSelect.innerHTML = '<option value="">Выберите кронштейн</option>';
        
        // Добавляем опцию "отсутствует"
        const absentOption = document.createElement('option');
        absentOption.value = "отсутствует";
        absentOption.textContent = "🚫 отсутствует";
        bracketSelect.appendChild(absentOption);
        
        if (brackets && brackets.length > 0) {
            brackets.sort((a, b) => a.name.localeCompare(b.name));
            brackets.forEach(bracket => {
                if (bracket && bracket.name) {
                    const option = document.createElement('option');
                    option.value = bracket.name;
                    option.textContent = bracket.name;
                    bracketSelect.appendChild(option);
                }
            });
            console.log('✅ Кронштейнов добавлено:', brackets.length + 1);
        }
    }
    
    // Заполняем лиры с опцией "отсутствует"
    const lyreSelect = document.getElementById('lyreSelect');
    if (lyreSelect) {
        lyreSelect.innerHTML = '<option value="">Выберите лиру</option>';
        
        // Добавляем опцию "отсутствует"
        const absentOption = document.createElement('option');
        absentOption.value = "отсутствует";
        absentOption.textContent = "🚫 отсутствует";
        lyreSelect.appendChild(absentOption);
        
        if (lyres && lyres.length > 0) {
            lyres.sort((a, b) => a.name.localeCompare(b.name));
            lyres.forEach(lyre => {
                if (lyre && lyre.name) {
                    const option = document.createElement('option');
                    option.value = lyre.name;
                    option.textContent = lyre.name;
                    lyreSelect.appendChild(option);
                }
            });
            console.log('✅ Лир добавлено:', lyres.length + 1);
        }
    }
    
    console.log('=== ЗАПОЛНЕНИЕ SELECT-ОВ ЗАВЕРШЕНО ===');
}

// Загрузка размеров для выбранного изделия
async function loadProductSizes() {
    const productName = document.getElementById('productSelect').value;
    console.log('Выбран продукт:', productName);
    
    const product = products.find(p => p.name === productName);
    
    const sizeSelect = document.getElementById('sizeSelect');
    
    sizeSelect.innerHTML = '<option value="">Загрузка размеров...</option>';
    sizeSelect.disabled = true;
    
    setTimeout(() => {
        sizeSelect.innerHTML = '<option value="">Выберите размер</option>';
        
        if (product && product.sizes && product.sizes.length > 0) {
            product.sizes.forEach(size => {
                const option = document.createElement('option');
                option.value = size;
                option.textContent = size;
                sizeSelect.appendChild(option);
            });
        } else {
            sizeSelect.innerHTML = '<option value="">Нет доступных размеров</option>';
        }
        
        sizeSelect.disabled = false;
    }, 100);
}

// Настройка обработчиков событий
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterOrders(e.target.value, document.getElementById('statusFilter').value);
        });
    }

    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function(e) {
            filterOrders(document.getElementById('searchInput').value, e.target.value);
        });
    }

    window.addEventListener('storage', function(e) {
        if (e.key === 'masterx_orders') {
            orders = JSON.parse(e.newValue || '[]');
            loadOrders();
            updateStatistics();
        }
    });
}

// Открытие модального окна для создания нового заказа
function openOrderModal() {
    // Сбрасываем форму
    document.getElementById('orderForm').reset();
    document.getElementById('ralPreview').style.display = 'none';
    
    // Устанавливаем сегодняшнюю дату
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('orderDate').value = today;
    
    // Генерируем номер заказа
    const orderNumber = generateOrderNumber();
    document.getElementById('orderNumber').value = orderNumber;
    
    // Устанавливаем обработчик на создание
    const form = document.getElementById('orderForm');
    form.onsubmit = createOrderHandler;
    
    // Открываем модальное окно
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Обработчик создания нового заказа
async function createOrderHandler(e) {
    e.preventDefault();
    
    const bracket = document.getElementById('bracketSelect').value;
    const lyre = document.getElementById('lyreSelect').value;
    const ral = document.getElementById('ralSelect').value;
    const texture = document.getElementById('textureSelect').value;
    
    console.log('Создание заказа с:', { bracket, lyre, ral, texture });
    
    // Находим выбранный цвет RAL
    const selectedRal = ralColors.find(c => c.code === ral);
    
    const order = {
        id: Date.now(),
        date: document.getElementById('orderDate').value,
        number: document.getElementById('orderNumber').value,
        items: [{
            product: document.getElementById('productSelect').value,
            size: document.getElementById('sizeSelect').value,
            quantity: parseInt(document.getElementById('quantity').value) || 1,
            bracket: bracket,
            lyre: lyre,
            ral: selectedRal ? {
                code: selectedRal.code,
                name: selectedRal.name,
                hex: selectedRal.hex
            } : null,
            texture: texture || null,
            additional: document.getElementById('additionalDetails').value || ''
        }],
        status: 'active',
        createdAt: new Date().toISOString(),
        completedAt: null,
        tasks: {}
    };
    
    orders.push(order);
    saveOrdersToStorage(orders);
    loadOrders();
    updateStatistics();
    closeOrderModal();
    
    showNotification('Заказ успешно создан!', 'success');
}

// Открыть модальное окно редактирования заказа
function editOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Заполняем форму данными заказа
    document.getElementById('orderDate').value = order.date;
    document.getElementById('orderNumber').value = order.number;

    // Выбираем изделие
    const productSelect = document.getElementById('productSelect');
    productSelect.value = order.items[0].product;
    loadProductSizes(); // загружаем размеры

    // Небольшая задержка, чтобы размеры успели загрузиться
    setTimeout(() => {
        document.getElementById('sizeSelect').value = order.items[0].size;
    }, 200);

    document.getElementById('quantity').value = order.items[0].quantity;
    document.getElementById('bracketSelect').value = order.items[0].bracket;
    document.getElementById('lyreSelect').value = order.items[0].lyre;
    
    // Заполняем RAL и текстуру
    if (order.items[0].ral) {
        document.getElementById('ralSelect').value = order.items[0].ral.code;
        // Показываем предпросмотр цвета
        const preview = document.getElementById('ralPreview');
        preview.style.backgroundColor = order.items[0].ral.hex;
        preview.style.display = 'inline-block';
    }
    
    document.getElementById('textureSelect').value = order.items[0].texture || '';
    document.getElementById('additionalDetails').value = order.items[0].additional || '';

    // Открываем модальное окно
    const modal = document.getElementById('orderModal');
    modal.style.display = 'block';

    // Меняем обработчик отправки формы на редактирование
    const form = document.getElementById('orderForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        saveEditedOrder(orderId);
    };
}

// Сохранить изменения в заказе
function saveEditedOrder(orderId) {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    const bracket = document.getElementById('bracketSelect').value;
    const lyre = document.getElementById('lyreSelect').value;
    const ral = document.getElementById('ralSelect').value;
    const texture = document.getElementById('textureSelect').value;
    
    // Находим выбранный цвет RAL
    const selectedRal = ralColors.find(c => c.code === ral);

    const updatedOrder = {
        id: orderId,
        date: document.getElementById('orderDate').value,
        number: document.getElementById('orderNumber').value,
        items: [{
            product: document.getElementById('productSelect').value,
            size: document.getElementById('sizeSelect').value,
            quantity: parseInt(document.getElementById('quantity').value) || 1,
            bracket: bracket,
            lyre: lyre,
            ral: selectedRal ? {
                code: selectedRal.code,
                name: selectedRal.name,
                hex: selectedRal.hex
            } : null,
            texture: texture || null,
            additional: document.getElementById('additionalDetails').value || ''
        }],
        status: orders[orderIndex].status,
        createdAt: orders[orderIndex].createdAt,
        completedAt: orders[orderIndex].completedAt,
        tasks: orders[orderIndex].tasks || {}
    };

    orders[orderIndex] = updatedOrder;
    saveOrdersToStorage(orders);
    loadOrders();
    updateStatistics();
    closeOrderModal();

    showNotification('Заказ обновлён', 'success');
}

// Генерация номера заказа
function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const count = (orders.length + 1).toString().padStart(3, '0');
    
    return `З-${year}${month}${day}-${count}`;
}

// Закрытие модального окна
function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    document.getElementById('orderForm').reset();
    document.getElementById('ralPreview').style.display = 'none';
}

// Показать уведомление
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Загрузка и отображение заказов
function loadOrders() {
    console.log('loadOrders вызвана, заказов:', orders.length);
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) {
        console.error('ordersList не найден');
        return;
    }
    
    ordersList.innerHTML = '';
    
    if (!orders || orders.length === 0) {
        ordersList.innerHTML = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 10px;">
                <p style="font-size: 18px; color: #666;">📭 Нет заказов</p>
                <p style="color: #999;">Нажмите "+ Новый заказ" чтобы создать первый заказ</p>
            </div>
        `;
        return;
    }
    
    // Сортируем по дате (сначала новые)
    const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersList.appendChild(orderCard);
    });
    
    console.log('Отображено заказов:', sortedOrders.length);
}

// Создание карточки заказа
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.dataset.orderId = order.id;
    
    const header = document.createElement('div');
    header.className = 'order-header';
    
    // Проверяем, что order.items существует
    const items = order.items || [];
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const completedTasks = countCompletedTasks(order);
    const totalTasks = countTotalTasks(order);
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
            <h3>📦 Заказ №${order.number || 'Без номера'} от ${formatDate(order.date)}</h3>
            <span style="background: ${getStatusColor(order.status)}; color: white; padding: 3px 10px; border-radius: 15px; font-size: 12px;">
                ${order.status === 'active' ? 'В работе' : 'Завершен'}
            </span>
            <span style="background: #e9ecef; padding: 3px 10px; border-radius: 15px; font-size: 12px;">
                Деталей: ${totalItems} шт
            </span>
            <span style="background: #e9ecef; padding: 3px 10px; border-radius: 15px; font-size: 12px;">
                Прогресс: ${progress}%
            </span>
        </div>
        <div style="display: flex; gap: 10px;">
            <button class="btn btn-info" onclick="event.stopPropagation(); showMaterialsReport(${order.id})">📊 Материалы</button>
            <button class="btn btn-warning" onclick="event.stopPropagation(); editOrder(${order.id})">✏️ Ред.</button>
            <button class="btn btn-danger" onclick="event.stopPropagation(); deleteOrder(${order.id})">🗑️ Удалить</button>
        </div>
    `;
    
    const content = document.createElement('div');
    content.className = 'order-content';
    content.style.display = 'none';
    
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        width: 100%;
        height: 6px;
        background: #e9ecef;
        border-radius: 3px;
        margin: 10px 0;
        overflow: hidden;
    `;
    progressBar.innerHTML = `<div style="width: ${progress}%; height: 100%; background: #28a745; transition: width 0.3s;"></div>`;
    content.appendChild(progressBar);
    
    // Проверяем, есть ли элементы для отображения
    let tableRows = '';
    if (items.length > 0) {
        tableRows = items.map(item => {
            // Защита от undefined
            const product = item.product || '-';
            const size = item.size || '-';
            const quantity = item.quantity || 0;
            const bracket = item.bracket === 'отсутствует' ? '🚫 отсутствует' : (item.bracket || '-');
            const lyre = item.lyre === 'отсутствует' ? '🚫 отсутствует' : (item.lyre || '-');
            
            // Добавляем RAL и текстуру
            const ralInfo = item.ral ? 
                `<span style="display: inline-block; width: 12px; height: 12px; background: ${item.ral.hex}; border-radius: 3px; margin-right: 5px;"></span> ${item.ral.code}` : 
                '-';
            
            const textureInfo = item.texture || '-';
            
            const additional = item.additional || '-';
            
            return `
                <tr>
                    <td><strong>${product}</strong></td>
                    <td>${size}</td>
                    <td>${quantity} шт</td>
                    <td>${bracket}</td>
                    <td>${lyre}</td>
                    <td>${ralInfo}</td>
                    <td>${textureInfo}</td>
                    <td>${additional}</td>
                </tr>
            `;
        }).join('');
    } else {
        tableRows = `
            <tr>
                <td colspan="8" style="text-align: center; color: #999;">Нет данных о деталях</td>
            </tr>
        `;
    }
    
    const itemsTable = document.createElement('table');
    itemsTable.className = 'items-table';
    itemsTable.innerHTML = `
        <thead>
            <tr>
                <th>Изделие</th>
                <th>Размер</th>
                <th>Кол-во</th>
                <th>Кронштейн</th>
                <th>Лира</th>
                <th>RAL</th>
                <th>Текстура</th>
                <th>Доп. детали</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    `;
    content.appendChild(itemsTable);
    
    const sitesSection = document.createElement('div');
    sitesSection.className = 'sites-section';
    sitesSection.innerHTML = `
        <h4 style="margin-bottom: 15px;">🏭 Производственные участки</h4>
        <div class="sites-grid">
            ${createSiteBlock('Токарный', order, 'tokarniy')}
            ${createSiteBlock('Слесарный', order, 'slesarniy')}
            ${createSiteBlock('Фрезерный', order, 'frezerniy')}
            ${createSiteBlock('Лазерно-гибочный', order, 'lazerno')}
            ${createSiteBlock('Полимерный', order, 'polimerniy')}
        </div>
    `;
    content.appendChild(sitesSection);
    
    header.addEventListener('click', function(e) {
        if (!e.target.classList.contains('btn')) {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        }
    });
    
    card.appendChild(header);
    card.appendChild(content);
    
    return card;
}

// Создание блока участка
function createSiteBlock(siteName, order, siteKey) {
    if (!order.items || !order.items[0]) {
        return `<div class="site-item"><div class="site-name">${siteName}</div><div class="squares"><div class="square"></div></div></div>`;
    }
    
    const operations = getOperationsForProduct(order.items[0].product, siteKey) || [];
    const squares = [];
    
    for (let i = 0; i < operations.length; i++) {
        const taskId = `${order.id}_${order.items[0].product}_${siteKey}_${i}`;
        const status = getTaskStatus(order, taskId);
        squares.push(`<div class="square ${status}"></div>`);
    }
    
    return `
        <div class="site-item">
            <div class="site-name">${siteName}</div>
            <div class="squares">
                ${squares.join('') || '<div class="square"></div>'}
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">
                ${operations.length} операций
            </div>
        </div>
    `;
}

// Получение статуса задачи
function getTaskStatus(order, taskId) {
    return order.tasks && order.tasks[taskId] ? order.tasks[taskId] : '';
}

// Подсчет завершенных задач
function countCompletedTasks(order) {
    if (!order.tasks) return 0;
    return Object.values(order.tasks).filter(status => status === 'green').length;
}

// Подсчет всех задач
function countTotalTasks(order) {
    if (!order || !order.items || !order.items[0]) return 0;
    const operations = getOperationsForProduct(order.items[0].product, 'all') || [];
    const totalItems = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    return operations.length * totalItems;
}

// Получение цвета статуса
function getStatusColor(status) {
    return status === 'active' ? '#007bff' : '#28a745';
}

// Показать отчет по материалам
async function showMaterialsReport(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('materialsModal');
    const reportDiv = document.getElementById('materialsReport');
    
    if (!modal || !reportDiv) return;
    
    reportDiv.innerHTML = '<div style="text-align: center; padding: 20px;">⏳ Загрузка отчета...</div>';
    modal.style.display = 'block';
    
    try {
        if (materialsReport) {
            // Обновляем данные в отчете
            materialsReport.materialsDB.brackets = brackets;
            materialsReport.materialsDB.lyres = lyres;
            
            const reportHTML = await materialsReport.generateReportHTML(order);
            reportDiv.innerHTML = reportHTML;
        } else {
            reportDiv.innerHTML = '<div style="color: red; padding: 20px;">❌ Отчет по материалам не инициализирован</div>';
        }
    } catch (error) {
        console.error('Ошибка отчета:', error);
        reportDiv.innerHTML = `<div style="color: red; padding: 20px;">❌ Ошибка загрузки отчета: ${error.message}</div>`;
    }
}

function closeMaterialsModal() {
    document.getElementById('materialsModal').style.display = 'none';
}

// Фильтрация заказов
function filterOrders(searchText, statusFilter) {
    console.log('Фильтр:', statusFilter, 'Поиск:', searchText);
    const cards = document.querySelectorAll('.order-card');
    searchText = searchText.toLowerCase();
    
    cards.forEach(card => {
        const orderId = card.dataset.orderId;
        const order = orders.find(o => o.id == orderId);
        if (!order) return;
        
        let show = true;
        
        // Поиск по тексту
        if (searchText) {
            const searchable = `${order.number} ${order.items.map(i => i.product).join(' ')}`.toLowerCase();
            show = searchable.includes(searchText);
        }
        
        // Фильтр по статусу
        if (show && statusFilter !== 'all') {
            // Приводим статусы к одному виду
            const orderStatus = order.status || 'active';
            show = orderStatus === statusFilter;
            console.log(`Заказ ${order.number}: статус="${orderStatus}", фильтр="${statusFilter}", показывать=${show}`);
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

// Экспорт заказов в CSV
function exportOrders() {
    let csv = 'Номер заказа,Дата,Изделие,Размер,Количество,Кронштейн,Лира,RAL,Текстура,Доп.детали,Статус\n';
    
    orders.forEach(order => {
        order.items.forEach(item => {
            const ralCode = item.ral ? item.ral.code : '';
            const texture = item.texture || '';
            csv += `"${order.number}","${order.date}","${item.product}","${item.size}",${item.quantity},"${item.bracket}","${item.lyre}","${ralCode}","${texture}","${item.additional || ''}","${order.status}"\n`;
        });
    });
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Обновление статистики
function updateStatistics() {
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalItemsEl = document.getElementById('totalItems');
    const activeTasksEl = document.getElementById('activeTasks');
    const completedTasksEl = document.getElementById('completedTasks');
    
    if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
    
    const totalItems = orders.reduce((sum, order) => 
        sum + (order.items ? order.items.reduce((s, item) => s + (item.quantity || 0), 0) : 0), 0);
    if (totalItemsEl) totalItemsEl.textContent = totalItems;
    
    let activeTasks = 0;
    let completedTasks = 0;
    
    orders.forEach(order => {
        if (order.tasks) {
            Object.values(order.tasks).forEach(status => {
                if (status === 'orange') activeTasks++;
                if (status === 'green') completedTasks++;
            });
        }
    });
    
    if (activeTasksEl) activeTasksEl.textContent = activeTasks;
    if (completedTasksEl) completedTasksEl.textContent = completedTasks;
}

// Вспомогательные функции
function formatDate(dateString) {
    if (!dateString) return 'Дата не указана';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

// Удаление заказа с подтверждением
function deleteOrder(orderId) {
    console.log('Попытка удалить заказ с ID:', orderId);
    
    // Первое подтверждение
    const firstConfirm = confirm('Вы уверены, что хотите удалить этот заказ?');
    
    if (!firstConfirm) {
        showNotification('Удаление отменено', 'info');
        return;
    }
    
    // Находим заказ для отображения информации
    const orderToDelete = orders.find(o => o.id === orderId);
    
    if (!orderToDelete) {
        showNotification('Заказ не найден', 'error');
        return;
    }
    
    // Второе подтверждение с деталями заказа
    const itemInfo = orderToDelete.items.map(item => 
        `${item.product} (${item.size}) - ${item.quantity} шт` +
        (item.ral ? `, RAL: ${item.ral.code}` : '') +
        (item.texture ? `, ${item.texture}` : '')
    ).join('\n');
    
    const secondConfirm = confirm(
        `⚠️ ВНИМАНИЕ! Это действие нельзя отменить.\n\n` +
        `Заказ №${orderToDelete.number}\n` +
        `Детали:\n${itemInfo}\n\n` +
        `Вы точно хотите удалить этот заказ?`
    );
    
    if (!secondConfirm) {
        showNotification('Удаление отменено', 'info');
        return;
    }
    
    // Выполняем удаление
    try {
        // Фильтруем массив заказов
        const newOrders = orders.filter(o => o.id !== orderId);
        
        console.log('Было заказов:', orders.length);
        console.log('Стало заказов:', newOrders.length);
        
        // Обновляем глобальный массив
        orders = newOrders;
        
        // Сохраняем в localStorage
        saveOrdersToStorage(orders);
        
        // Принудительно перезагружаем отображение
        loadOrders();
        
        // Обновляем статистику
        updateStatistics();
        
        showNotification('✅ Заказ успешно удален', 'success');
    } catch (error) {
        console.error('Ошибка при удалении:', error);
        showNotification('❌ Ошибка при удалении заказа', 'error');
    }
}

// Получение операций для изделия
function getOperationsForProduct(productName, site) {
    const operationsDB = {
        'XGRAY v.1': {
            'tokarniy': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса'],
            'slesarniy': ['Нарезка резьбы', 'Голтовка', 'УВ корпуса'],
            'frezerniy': ['Фрезеровка профиля'],
            'lazerno': ['Раскрой', 'Гибка'],
            'polimerniy': ['Заглушка AL', 'Обработка'],
            'all': ['Заготовка', 'Точение Корпуса', 'Фрезеровка Корпуса', 'Нарезка резьбы', 'Голтовка', 'УВ корпуса', 'Фрезеровка профиля', 'Раскрой', 'Гибка', 'Заглушка AL', 'Обработка']
        },
        'XSMART mini': {
            'tokarniy': ['Заготовка', 'Точение'],
            'slesarniy': ['Сборка'],
            'frezerniy': ['Фрезеровка'],
            'lazerno': ['Раскрой'],
            'polimerniy': ['Заглушка'],
            'all': ['Заготовка', 'Точение', 'Сборка', 'Фрезеровка', 'Раскрой', 'Заглушка']
        }
    };
    
    if (site === 'all') {
        return operationsDB[productName]?.all || [];
    }
    
    return operationsDB[productName]?.[site] || ['Нет операций'];
}

// Закрытие модальных окон при клике вне их
window.onclick = function(event) {
    const orderModal = document.getElementById('orderModal');
    const materialsModal = document.getElementById('materialsModal');
    
    if (event.target === orderModal) {
        closeOrderModal();
    }
    if (event.target === materialsModal) {
        closeMaterialsModal();
    }
};

// Добавляем анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .square.orange {
        background: #ffc107;
        border-color: #ffc107;
        animation: pulse 1s infinite;
    }
    
    .square.green {
        background: #28a745;
        border-color: #28a745;
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }
    
    .order-card {
        transition: all 0.3s ease;
    }
    
    .order-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    
    .btn-warning {
        background: #ffc107;
        color: #000;
    }
    
    .btn-warning:hover {
        background: #e0a800;
    }
`;

document.head.appendChild(style);

// ============================================
// Глобальные функции для вызова из HTML
// ============================================
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.closeMaterialsModal = closeMaterialsModal;
window.loadProductSizes = loadProductSizes;
window.exportOrders = exportOrders;
window.showMaterialsReport = showMaterialsReport;
window.deleteOrder = deleteOrder;
window.editOrder = editOrder;
