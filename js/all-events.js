document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
    loadFooter();
    initDropdown();
    loadEvents();
});

let currentFilter = 'all';

function initDropdown() {
    const filterButton = document.getElementById('filter-button');
    const filterMenu = document.getElementById('filter-menu');
    const filterItems = document.querySelectorAll('.dropdown__item');

    if (!filterButton || !filterMenu) return;

    filterButton.addEventListener('click', function(e) {
        e.stopPropagation();
        filterButton.classList.toggle('active');
        filterMenu.classList.toggle('active');
    });

    filterItems.forEach(function(item) {
        item.addEventListener('click', function() {
            const filterValue = this.getAttribute('data-filter');
            const filterText = this.textContent;

            filterItems.forEach(function(i) {
                i.classList.remove('active');
            });
            this.classList.add('active');

            const selectedSpan = filterButton.querySelector('.dropdown__selected');
            if (selectedSpan) {
                selectedSpan.textContent = filterText;
            }

            currentFilter = filterValue;
            renderEvents(eventsData);

            filterButton.classList.remove('active');
            filterMenu.classList.remove('active');
        });
    });

    document.addEventListener('click', function(e) {
        if (!filterMenu.contains(e.target)) {
            filterButton.classList.remove('active');
            filterMenu.classList.remove('active');
        }
    });
}

let eventsData = [];

async function loadEvents() {
    try {
        const response = await fetch('js/all-events.json');
        if (!response.ok) {
            throw new Error('Ошибка загрузки мероприятий');
        }
        eventsData = await response.json();
        renderEvents(eventsData);
    } catch (error) {
        console.error('Ошибка при загрузке мероприятий:', error);
    }
}

function createEventsCard(event) {
    return `
        <div class="events-card" data-popup="${event.popupId}">
            <h3 class="events-card__title">${event.title}</h3>
            <div class="events-card__footer">
                <p class="events-card__date">${event.datetime}</p>
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

    let filteredEvents = eventsArray;
    if (currentFilter !== 'all') {
        filteredEvents = eventsArray.filter(function(event) {
            return event.year === currentFilter;
        });
    }

    eventsGrid.innerHTML = '';

    filteredEvents.forEach(function(event) {
        eventsGrid.innerHTML += createEventsCard(event);
    });

    initEventsCardClicks();
}

function initEventsCardClicks() {
    const eventsCards = document.querySelectorAll('.events-card');

    eventsCards.forEach(function(card) {
        card.addEventListener('click', function() {
            const popupId = this.getAttribute('data-popup');
            console.log('Открытие мероприятия:', popupId);
        });
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
