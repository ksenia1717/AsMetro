document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
    loadFooter();
    loadMetro();
    loadPredpriyatiya();
});

async function loadMetro() {
    try {
        const response = await fetch('js/metro.json');
        if (!response.ok) {
            throw new Error('Ошибка загрузки метрополитенов');
        }
        const metroData = await response.json();
        renderMetro(metroData);
    } catch (error) {
        console.error('Ошибка при загрузке метрополитенов:', error);
    }
}

async function loadPredpriyatiya() {
    try {
        const response = await fetch('js/predpriyatiya.json');
        if (!response.ok) {
            throw new Error('Ошибка загрузки предприятий');
        }
        const predpriyatiyaData = await response.json();
        renderPredpriyatiya(predpriyatiyaData);
    } catch (error) {
        console.error('Ошибка при загрузке предприятий:', error);
    }
}

function createMetroCard(metro) {
    return `
        <a href="${metro.url}" class="metro-item">
            <div class="metro-item__image">
                <img src="${metro.image}" alt="${metro.name}">
            </div>
            <p class="metro-item__name">${metro.name}</p>
        </a>
    `;
}

function createPredpriyatiyaCard(predpriyatiye) {
    return `
        <a href="${predpriyatiye.url}" class="predpriyatiya-item">
            <div class="predpriyatiya-item__image">
                <img src="${predpriyatiye.image}" alt="${predpriyatiye.name}">
            </div>
            <p class="predpriyatiya-item__name">${predpriyatiye.name}</p>
        </a>
    `;
}

function renderMetro(metroArray) {
    const metroGrid = document.getElementById('metro-grid');
    if (!metroGrid) return;

    metroGrid.innerHTML = '';
    metroArray.forEach(function(metro) {
        metroGrid.innerHTML += createMetroCard(metro);
    });
}

function renderPredpriyatiya(predpriyatiyaArray) {
    const predpriyatiyaGrid = document.getElementById('predpriyatiya-grid');
    if (!predpriyatiyaGrid) return;

    predpriyatiyaGrid.innerHTML = '';
    predpriyatiyaArray.forEach(function(predpriyatiye) {
        predpriyatiyaGrid.innerHTML += createPredpriyatiyaCard(predpriyatiye);
    });
}

async function loadHeader() {
    try {
        const response = await fetch('1header.html');
        if (!response.ok) {
            throw new Error('Ошибка загрузки header');
        }
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const headerContent = doc.querySelector('.main-header');

        if (headerContent) {
            const headerBlock = document.getElementById('header-block');
            if (headerBlock) {
                headerBlock.appendChild(headerContent);
            }
        }

        if (typeof initHeaderDropdown === 'function') {
            initHeaderDropdown();
        }

        if (typeof initMobileHeader === 'function') {
            initMobileHeader();
        }
    } catch (error) {
        console.error('Ошибка при загрузке header:', error);
    }
}

async function loadFooter() {
    try {
        const response = await fetch('2footer.html');
        if (!response.ok) {
            throw new Error('Ошибка загрузки footer');
        }
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const footerContent = doc.querySelector('.footer');

        if (footerContent) {
            const footerBlock = document.getElementById('footer-block');
            if (footerBlock) {
                footerBlock.appendChild(footerContent);
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке footer:', error);
    }
}
