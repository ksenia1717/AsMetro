// all-events.js
const API_BASE_URL = `http://${window.location.hostname}:8080`;

document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadFooter();
    initDropdown();
    loadEvents();
});

let currentFilter = 'all';
let eventsData = [];

async function loadHeader() {
    try {
        const response = await fetch('1header.html');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const headerContent = doc.querySelector('.main-header');
        
        if (headerContent) {
            const block = document.getElementById('header-block');
            if (block) block.appendChild(headerContent);
        }
        
        if (typeof initHeaderDropdown === 'function') initHeaderDropdown();
        if (typeof initMobileHeader === 'function') initMobileHeader();
    } catch (error) {
        console.error('Header load failed:', error);
    }
}

async function loadFooter() {
    try {
        const response = await fetch('2footer.html');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const footerContent = doc.querySelector('.footer');
        
        if (footerContent) {
            const block = document.getElementById('footer-block');
            if (block) block.appendChild(footerContent);
        }
    } catch (error) {
        console.error('Footer load failed:', error);
    }
}

function initDropdown() {
    const filterButton = document.getElementById('filter-button');
    const filterMenu = document.getElementById('filter-menu');
    const filterItems = document.querySelectorAll('.dropdown__item');

    if (!filterButton || !filterMenu) return;

    filterButton.addEventListener('click', (event) => {
        event.stopPropagation();
        filterButton.classList.toggle('active');
        filterMenu.classList.toggle('active');
    });

    filterItems.forEach((item) => {
        item.addEventListener('click', () => {
            const filterValue = item.getAttribute('data-filter');
            const filterText = item.textContent;

            filterItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const selectedSpan = filterButton.querySelector('.dropdown__selected');
            if (selectedSpan) selectedSpan.textContent = filterText;

            currentFilter = filterValue;
            renderEvents(eventsData);

            filterButton.classList.remove('active');
            filterMenu.classList.remove('active');
        });
    });

    document.addEventListener('click', (event) => {
        if (!filterMenu.contains(event.target) && !filterButton.contains(event.target)) {
            filterButton.classList.remove('active');
            filterMenu.classList.remove('active');
        }
    });
}

async function loadEvents() {
    const eventsGrid = document.getElementById('events-grid');
    if (!eventsGrid) return;

    try {
        const listResponse = await fetch(`${API_BASE_URL}/api/v1/block/мероприятия/order`);
        
        if (!listResponse.ok) {
            eventsGrid.innerHTML = '<div class="news-grid__error">Ошибка загрузки</div>';
            return;
        }
        
        const ids = await listResponse.json();
        const eventIds = Array.isArray(ids) ? ids : [];
        
        if (!eventIds.length) {
            eventsGrid.innerHTML = '<div class="news-grid__empty">Нет мероприятий</div>';
            return;
        }

        eventsData = [];
        
        for (const id of eventIds) {
            try {
                const contentData = await fetchEventContent(id);
                if (contentData) {
                    eventsData.push({
                        id,
                        title: contentData.header || 'Без названия',
                        datetime: formatEventDate(contentData.date),
                        year: extractYear(contentData.date),
                        body: contentData.body || '',
                        dateRaw: contentData.date
                    });
                }
            } catch (error) {
                console.warn(`Failed to load event ${id}:`, error);
            }
        }

        renderEvents(eventsData);
        
    } catch (error) {
        console.error('Events load failed:', error);
        eventsGrid.innerHTML = '<div class="news-grid__error">Ошибка загрузки</div>';
    }
}

async function fetchEventContent(id) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/block/мероприятия/content?name=${encodeURIComponent(id)}`
        );
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

function formatEventDate(dateStr) {
    if (!dateStr) return '';
    
    try {
        const [datePart, timePart] = dateStr.split('T');
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

function extractYear(dateStr) {
    if (!dateStr) return '';
    
    try {
        return dateStr.split('-')[0];
    } catch {
        return '';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function createEventsCard(event) {
    const datePart = event.datetime.split(' ')[0] || '';
    const [day, month, year] = datePart.split('.');
    const dayMonth = day && month ? `${day}.${month}` : datePart;

    return `
        <div class="events-card" data-event-id="${escapeHtml(event.id)}">
            <div class="events-card__badge">
                <p class="events-card__badge-day">${escapeHtml(dayMonth)}</p>
                <p class="events-card__badge-year">${escapeHtml(year || event.year || '')}</p>
            </div>
            <h3 class="events-card__title">${escapeHtml(event.title)}</h3>
            <div class="events-card__footer">
                <p class="events-card__date">${escapeHtml(event.datetime)}</p>
                <div class="events-card__button">
                    <img src="img/arrow-right (2).svg" alt="→">
                </div>
            </div>
        </div>
    `;
}

function renderEvents(eventsArray) {
    const eventsGrid = document.getElementById('events-grid');
    if (!eventsGrid) return;

    const filteredEvents = currentFilter === 'all' 
        ? eventsArray 
        : eventsArray.filter(event => event.year === currentFilter);

    if (!filteredEvents.length) {
        eventsGrid.innerHTML = '<div class="news-grid__empty">Нет мероприятий за выбранный период</div>';
        return;
    }

    eventsGrid.innerHTML = filteredEvents.map(createEventsCard).join('');
    initEventsCardClicks();
}

function initEventsCardClicks() {
    const eventsCards = document.querySelectorAll('.events-card');
    
    eventsCards.forEach((card) => {
        card.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            const eventId = card.getAttribute('data-event-id');
            const eventData = eventsData.find(e => e.id === eventId);
            
            if (eventData) {
                openEventPopup(eventData);
            }
        });
    });
}

let eventsPopupElement = null;

function createEventPopup() {
    const popup = document.createElement('div');
    popup.className = 'events-popup';
    popup.id = 'event-popup-dynamic';
    popup.setAttribute('aria-hidden', 'true');
    
    popup.innerHTML = `
        <div class="events-popup__content" role="dialog" aria-modal="true" aria-label="Детали мероприятия">
            <button class="events-popup__close" id="event-popup-close-btn" aria-label="Закрыть">
                <img src="img/cross-icon.svg" alt="" aria-hidden="true">
            </button>
            <h3 class="events-popup__title"></h3>
            <p class="events-popup__datetime"></p>
            <div class="events-popup__text"></div>
        </div>
    `;
    
    document.body.appendChild(popup);
    return popup;
}

function initEventPopupHandlers() {
    if (!eventsPopupElement) return;
    
    const closeBtn = eventsPopupElement.querySelector('#event-popup-close-btn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEventPopup);
    }
    
    eventsPopupElement.addEventListener('click', (event) => {
        if (event.target === eventsPopupElement) {
            closeEventPopup();
        }
    });
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && eventsPopupElement?.classList.contains('active')) {
            closeEventPopup();
        }
    });
}

function closeEventPopup() {
    if (!eventsPopupElement) return;
    
    eventsPopupElement.classList.remove('active');
    eventsPopupElement.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function formatBodyContent(text) {
    if (!text) return '';
    
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    const urlRegex = /(?:https?:\/\/|www\.)[^\s<]+/gi;
    
    return paragraphs.map(paragraph => {
        let processed = paragraph.trim();
        processed = processed.replace(urlRegex, (url) => {
            const href = url.startsWith('http') ? url : `https://${url}`;
            return `<a href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`;
        });
        return `<p>${processed}</p>`;
    }).join('');
}

async function openEventPopup(eventData) {
    if (!eventsPopupElement) {
        eventsPopupElement = createEventPopup();
        initEventPopupHandlers();
    }

    let content = eventData;
    
    if (!content.body) {
        const fresh = await fetchEventContent(eventData.id);
        if (fresh) content = fresh;
    }

    const titleElement = eventsPopupElement.querySelector('.events-popup__title');
    const datetimeElement = eventsPopupElement.querySelector('.events-popup__datetime');
    const bodyElement = eventsPopupElement.querySelector('.events-popup__text');

    if (titleElement) {
        titleElement.textContent = content.header || eventData.title || '';
    }
    
    if (datetimeElement) {
        const date = content.date || eventData.dateRaw;
        datetimeElement.textContent = date ? formatEventDate(date) : '';
    }
    
    if (bodyElement && content.body) {
        bodyElement.innerHTML = formatBodyContent(content.body);
    }

    eventsPopupElement.classList.add('active');
    eventsPopupElement.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}