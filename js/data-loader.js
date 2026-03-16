// Загрузка продуктов
async function loadProducts() {
    return [
        { 
            name: 'XRAY 6-T2 BZ 220 Шторка х2', 
            sizes: ['Стандартный']
        },
        { 
            name: 'XGRAY v.1', 
            sizes: ['116', '216', '316', '416', '516', '612', '712', '812', '912', '1012']
        },
        { 
            name: 'XGRAY v.2', 
            sizes: ['116', '216', '316', '416', '516', '612', '712', '812', '912', '1012']
        },
        { 
            name: 'XSMART mini', 
            sizes: ['XSMART mini 1', 'XSMART mini 2', 'XSMART mini 3', 'XSMART mini 4', 'XSMART mini 5', 'XSMART mini 6']
        }
    ];
}

// Загрузка кронштейнов
async function loadBrackets() {
    return [
        { name: 'B(T)-15', thickness: '2мм', area: 0.0164 },
        { name: 'PU-5', thickness: '2мм', area: 0.01 },
        { name: 'LU-5', thickness: '2мм', area: 0.006 },
        { name: 'ACENTO', thickness: '2мм', area: 0.0073 },
        { name: 'XRAY1', thickness: '2мм', area: 0.002 }
    ];
}

// Загрузка лир
async function loadLyres() {
    return [
        { name: '(L-серия) лира', thickness: '1.5мм', area: 0.0024 },
        { name: '(P-серия) лира', thickness: '2мм', area: 0.005 },
        { name: 'Лира XSTRONG', thickness: '1.5мм', area: 0.0034 }
    ];
}

// Загрузка размеров для выбранного изделия
async function loadProductSizes(productName) {
    const products = await loadProducts();
    const product = products.find(p => p.name === productName);
    return product ? product.sizes : ['Стандартный'];
}
