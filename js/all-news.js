document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
    loadFooter();
    initDropdown();
    loadNews();
    initNewsPopups();
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
            renderNews(newsData);

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

let newsData = [];

async function loadNews() {
    try {
        const response = await fetch('js/all-news.json');
        if (!response.ok) {
            throw new Error('Ошибка загрузки новостей');
        }
        newsData = await response.json();
        renderNews(newsData);
    } catch (error) {
        console.error('Ошибка при загрузке новостей:', error);
    }
}

function createNewsCard(news) {
    return `
        <div class="news-card" data-popup="${news.popupId}" style="background-image: url('${news.image}');">
            <div class="news-card__content">
                <h3 class="news-card__title">${news.title}</h3>
                <p class="news-card__date">${news.date}</p>
            </div>
        </div>
    `;
}

function renderNews(newsArray) {
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) return;

    let filteredNews = newsArray;
    if (currentFilter !== 'all') {
        filteredNews = newsArray.filter(function(news) {
            return news.year === currentFilter;
        });
    }

    newsGrid.innerHTML = '';

    filteredNews.forEach(function(news) {
        newsGrid.innerHTML += createNewsCard(news);
    });

    initNewsCardClicks();
}

function initNewsCardClicks() {
    const newsCards = document.querySelectorAll('.news-card');

    newsCards.forEach(function(card) {
        card.addEventListener('click', function() {
            const popupId = this.getAttribute('data-popup');
            const popup = document.getElementById('news-popup-' + popupId.split('-')[1]);
            if (popup) {
                popup.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
}

function initNewsPopups() {
    const newsPopups = document.querySelectorAll('.news-popup');

    // Закрытие по кнопке
    const closeButtons = document.querySelectorAll('.news-popup__close');
    closeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const popupId = button.getAttribute('data-popup-close');
            const popup = document.getElementById('news-popup-' + popupId.split('-')[1]);
            if (popup) {
                popup.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Закрытие по клику вне контента
    newsPopups.forEach(function(popup) {
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                popup.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activePopup = document.querySelector('.news-popup.active');
            if (activePopup) {
                activePopup.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
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
