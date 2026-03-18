// home.js – адаптированный скрипт для работы с новым дизайном и API

const API_BASE_URL = `http://${window.location.hostname}:8080`;

document.addEventListener('DOMContentLoaded', async () => {
    await loadHeader();
    await loadFooter();
    await loadMainPageTexts(); // <-- Новая функция для загрузки текстов с сервера
    initAboutPopup();
    loadNews();
    loadEvents();
});

// --- Загрузка шапки и подвала ---
async function loadHeader() {
    try {
        const response = await fetch('1header.html');
        if (!response.ok) return;
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const headerContent = doc.querySelector('.main-header');
        if (headerContent) {
            const block = document.getElementById('header-block');
            if (block) block.appendChild(headerContent);
        }
        // Инициализация выпадающих меню, если функции существуют
        if (typeof initHeaderDropdown === 'function') initHeaderDropdown();
        if (typeof initMobileHeader === 'function') initMobileHeader();
    } catch (e) {
        console.warn('Header load failed', e);
    }
}

async function loadFooter() {
    try {
        const response = await fetch('2footer.html');
        if (!response.ok) return;
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const footerContent = doc.querySelector('.footer');
        if (footerContent) {
            const block = document.getElementById('footer-block');
            if (block) block.appendChild(footerContent);
        }
    } catch (e) {
        console.warn('Footer load failed', e);
    }
}

// --- Загрузка текстов для главной страницы ---
async function loadMainPageTexts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/locale/main`);
        if (!response.ok) {
            console.warn('Не удалось загрузить тексты для главной');
            return;
        }
        
        const data = await response.json();
        
        // Заполняем заголовок hero
        const heroTitle = document.querySelector('.hero__title');
        if (heroTitle && data.название) {
            heroTitle.textContent = data.название;
        }
        
        // Заполняем подзаголовок hero
        const heroSubtitle = document.querySelector('.hero__subtitle');
        if (heroSubtitle && data.описание) {
            heroSubtitle.textContent = data.описание;
        }
        
        // Заполняем краткий текст в секции about (первый абзац)
        const aboutText = document.querySelector('.about__text');
        if (aboutText && data.подробнее) {
            aboutText.textContent = data.подробнее;
        }
        
        // Сохраняем полный текст для попапа (используем data-атрибут или глобальную переменную)
        if (data.полное) {
            const aboutPopupText1 = document.querySelector('.about-popup__text--1');
            const aboutPopupText = document.querySelector('.about-popup__text');
            
            // Очищаем статическое содержимое
            if (aboutPopupText1) aboutPopupText1.innerHTML = '';
            if (aboutPopupText) aboutPopupText.innerHTML = '';
            
            // Разбиваем полный текст на абзацы (по двойному переносу строки)
            const paragraphs = data.полное.split('\n\n').filter(p => p.trim() !== '');
            
            // Если есть первый абзац, помещаем его в about-popup__text--1
            if (paragraphs.length > 0 && aboutPopupText1) {
                aboutPopupText1.innerHTML = `<p>${paragraphs[0]}</p>`;
            }
            
            // Остальные абзацы - в about-popup__text
            if (aboutPopupText) {
                for (let i = 1; i < paragraphs.length; i++) {
                    const p = document.createElement('p');
                    p.textContent = paragraphs[i];
                    aboutPopupText.appendChild(p);
                }
            }
        }
    } catch (e) {
        console.error('Ошибка загрузки текстов для главной:', e);
    }
}

// --- Попап «Об ассоциации» (обновлен стиль для корректного отображения) ---
function initAboutPopup() {
    const aboutBtn = document.querySelector('.about__btn');
    const aboutPopup = document.getElementById('about-popup');
    const aboutPopupClose = document.getElementById('about-popup-close');
    
    if (!aboutBtn || !aboutPopup) return;
    
    aboutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        aboutPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    if (aboutPopupClose) {
        aboutPopupClose.addEventListener('click', () => {
            aboutPopup.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    aboutPopup.addEventListener('click', (e) => {
        if (e.target === aboutPopup) {
            aboutPopup.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aboutPopup.classList.contains('active')) {
            aboutPopup.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// --- Новости ---
let newsPopupElement = null;

async function loadNews() {
    const newsList = document.querySelector('.news__list');
    if (!newsList) return;

    const allNewsItems = newsList.querySelectorAll('a.news__item');
    if (!allNewsItems.length) return;

    // Скрываем все карточки сразу
    allNewsItems.forEach(item => item.style.display = 'none');

    try {
        const listResp = await fetch(`${API_BASE_URL}/api/v1/block/новости/order`);
        if (!listResp.ok) {
            console.warn('Не удалось загрузить список новостей');
            return;
        }
        
        const ids = await listResp.json();
        const newsIds = Array.isArray(ids) ? ids : [];
        
        for (let i = 0; i < newsIds.length && i < allNewsItems.length; i++) {
            const id = newsIds[i];
            const item = allNewsItems[i];
            
            const contentData = await fetchNewsContent(id);
            if (!contentData) continue;
            
            updateNewsCard(item, id, contentData);
            item.style.display = 'flex'; // показываем только наполненные
        }
    } catch (e) {
        console.error('Ошибка загрузки новостей:', e);
    }
}

async function fetchNewsContent(id) {
    try {
        const resp = await fetch(
            `${API_BASE_URL}/api/v1/block/новости/content?name=${encodeURIComponent(id)}`
        );
        if (!resp.ok) return null;
        return await resp.json();
    } catch {
        return null;
    }
}

function updateNewsCard(item, id, data) {
    const titleEl = item.querySelector('.news__title');
    if (titleEl && data.header) {
        titleEl.textContent = data.header;
    }
    
    const dateEl = item.querySelector('.news__date');
    if (dateEl && data.date) {
        dateEl.textContent = formatDate(data.date);
    }
    
    // Загружаем миниатюру
    if (data.header) {
        loadNewsImage(id, 'mini').then(url => {
            if (url) {
                item.style.backgroundImage = `url('${url}')`;
            }
        });
    }
    
    // Обработчик клика – открывает динамический попап
    item.onclick = (e) => {
        e.preventDefault();
        openNewsPopup(id, data);
    };
    item.style.cursor = 'pointer';
}

async function loadNewsImage(id, type = 'mini') {
    try {
        const url = `${API_BASE_URL}/api/v1/block/новости/attachment?name=${encodeURIComponent(id)}&attachment=${type}`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch {
        return null;
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const [year, month, day] = dateStr.split('-');
        return `${day}.${month}.${year}`;
    } catch {
        return dateStr;
    }
}

// Создание динамического попапа новости
function createNewsPopup() {
    const popup = document.createElement('div');
    popup.className = 'news-popup';
    popup.id = 'news-popup-dynamic';
    popup.innerHTML = `
        <div class="news-popup__content">
            <button class="news-popup__close" id="news-popup-close-btn">
                <img src="img/cross-icon.svg" alt="Закрыть">
            </button>
            <div class="news-popup__text-wrapper">
                <h3 class="news-popup__title"></h3>
                <p class="news-popup__subtitle"></p>
                <div class="news-popup__section">
                    <!-- Сюда будет вставлен текст новости -->
                    <div class="news-popup__body-content"></div>
                </div>
            </div>
            <div class="news-popup__image">
                <img src="" alt="">
            </div>
        </div>
    `;
    document.body.appendChild(popup);
    return popup;
}

function initNewsPopupHandlers() {
    if (newsPopupElement) {
        const closeBtn = newsPopupElement.querySelector('#news-popup-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeNewsPopup);
        }
        
        newsPopupElement.addEventListener('click', (e) => {
            if (e.target === newsPopupElement) {
                closeNewsPopup();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && newsPopupElement.classList.contains('active')) {
                closeNewsPopup();
            }
        });
    }
}

function closeNewsPopup() {
    if (newsPopupElement) {
        newsPopupElement.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Форматирование текста: замена ссылок и переносов строк
function formatBodyContent(text) {
    if (!text) return '';
    // Заменяем переводы строк на <br>
    let formatted = text.replace(/\n/g, '<br>');
    // Оборачиваем ссылки
    const urlRegex = /(?:https?:\/\/|www\.)[^\s<]+/gi;
    formatted = formatted.replace(urlRegex, (url) => {
        const href = url.startsWith('http') ? url : `https://${url}`;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="news-popup__link">${url}</a>`;
    });
    return formatted;
}

async function openNewsPopup(id, cachedData) {
    if (!newsPopupElement) {
        newsPopupElement = createNewsPopup();
        initNewsPopupHandlers();
    }
    
    let contentData = cachedData;
    if (!contentData || !contentData.body) {
        contentData = await fetchNewsContent(id);
        if (!contentData) return;
    }
    
    const titleEl = newsPopupElement.querySelector('.news-popup__title');
    const subtitleEl = newsPopupElement.querySelector('.news-popup__subtitle');
    const bodyEl = newsPopupElement.querySelector('.news-popup__body-content');
    const imgEl = newsPopupElement.querySelector('.news-popup__image img');
    
    if (titleEl) titleEl.textContent = contentData.header || '';
    
    // Если API возвращает отдельное поле для подзаголовка, можно его использовать
    if (subtitleEl) {
        subtitleEl.textContent = ''; // пока оставляем пустым
    }
    
    if (bodyEl && contentData.body) {
        bodyEl.innerHTML = formatBodyContent(contentData.body);
    }
    
    if (imgEl) {
        const fullUrl = await loadNewsImage(id, 'full');
        if (fullUrl) {
            imgEl.src = fullUrl;
            imgEl.alt = contentData.header || '';
        }
    }
    
    newsPopupElement.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// --- Мероприятия ---
let eventsPopupElement = null;

async function loadEvents() {
    const eventsList = document.querySelector('.events__list');
    if (!eventsList) return;

    const allEventItems = eventsList.querySelectorAll('.events__item');
    if (!allEventItems.length) return;

    try {
        const listResp = await fetch(`${API_BASE_URL}/api/v1/block/мероприятия/order`);
        if (!listResp.ok) return;
        
        const ids = await listResp.json();
        const eventIds = Array.isArray(ids) ? ids : [];
        
        allEventItems.forEach(item => item.style.display = 'none');

        if (!eventIds.length) return;

        for (let i = 0; i < eventIds.length && i < allEventItems.length; i++) {
            const id = eventIds[i];
            const item = allEventItems[i];
            
            const contentData = await fetchEventContent(id);
            if (!contentData) continue;
            
            updateEventCard(item, id, contentData);
            item.style.display = 'flex';
        }
    } catch (e) {
        console.warn('Events loading failed', e);
    }
}

async function fetchEventContent(id) {
    try {
        const resp = await fetch(
            `${API_BASE_URL}/api/v1/block/мероприятия/content?name=${encodeURIComponent(id)}`
        );
        if (!resp.ok) return null;
        return await resp.json();
    } catch {
        return null;
    }
}

function updateEventCard(item, id, data) {
    const titleEl = item.querySelector('.events__title');
    if (titleEl && data.header) {
        titleEl.textContent = data.header;
    }
    
    const dateEl = item.querySelector('.events__date');
    if (dateEl && data.date) {
        dateEl.textContent = formatEventDate(data.date);
    }
    
    item.onclick = (e) => {
        e.preventDefault();
        openEventPopup(id, data);
    };
    item.style.cursor = 'pointer';
}

function formatEventDate(dateStr) {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('T');
        const datePart = parts[0];
        const timePart = parts[1] || '';
        const [year, month, day] = datePart.split('-');
        
        let result = `${day}.${month}.${year}`;
        if (timePart) {
            const [hours, minutes] = timePart.split(':');
            result += ` в ${hours}:${minutes}`;
        }
        return result;
    } catch {
        return dateStr;
    }
}

function createEventPopup() {
    const popup = document.createElement('div');
    popup.className = 'events-popup';
    popup.id = 'events-popup-dynamic';
    popup.innerHTML = `
        <div class="events-popup__content">
            <button class="events-popup__close" id="events-popup-close-btn">
                <img src="img/cross-icon.svg" alt="Закрыть">
            </button>
            <h3 class="events-popup__title"></h3>
            <p class="events-popup__datetime"></p>
            <div class="events-popup__text"></div>
        </div>
    `;
    document.body.appendChild(popup);
    return popup;
}

function initEventsPopupHandlers() {
    if (eventsPopupElement) {
        const closeBtn = eventsPopupElement.querySelector('#events-popup-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeEventsPopup);
        }
        
        eventsPopupElement.addEventListener('click', (e) => {
            if (e.target === eventsPopupElement) {
                closeEventsPopup();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && eventsPopupElement.classList.contains('active')) {
                closeEventsPopup();
            }
        });
    }
}

function closeEventsPopup() {
    if (eventsPopupElement) {
        eventsPopupElement.classList.remove('active');
        document.body.style.overflow = '';
    }
}

async function openEventPopup(id, cachedData) {
    if (!eventsPopupElement) {
        eventsPopupElement = createEventPopup();
        initEventsPopupHandlers();
    }
    
    let contentData = cachedData;
    if (!contentData || !contentData.body) {
        contentData = await fetchEventContent(id);
        if (!contentData) return;
    }
    
    const titleEl = eventsPopupElement.querySelector('.events-popup__title');
    const datetimeEl = eventsPopupElement.querySelector('.events-popup__datetime');
    const bodyEl = eventsPopupElement.querySelector('.events-popup__text');
    
    if (titleEl) titleEl.textContent = contentData.header || '';
    
    if (datetimeEl && contentData.date) {
        datetimeEl.textContent = formatEventDate(contentData.date);
    }
    
    if (bodyEl && contentData.body) {
        // Для мероприятий используем тот же формат с параграфами и ссылками
        bodyEl.innerHTML = formatBodyContent(contentData.body);
    }
    
    eventsPopupElement.classList.add('active');
    document.body.style.overflow = 'hidden';
}