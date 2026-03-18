// derec.js
const API_BASE_URL = `http://${window.location.hostname}:8080`;

document.addEventListener('DOMContentLoaded', async () => {
    await loadHeader();
    await loadFooter();
    await loadMainTexts(); // Загрузка текстов страницы
    await loadTeamMembers();
});

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

// Загрузка основных текстов страницы
async function loadMainTexts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/locale/derec`);
        if (!response.ok) {
            console.warn('Не удалось загрузить тексты для страницы дирекции');
            return;
        }
        
        const data = await response.json();
        
        // Заголовок hero
        const heroTitle = document.querySelector('.hero__title');
        if (heroTitle && data.название) {
            heroTitle.textContent = data.название;
        }
        
        // Описание в hero
        const heroSubtitle = document.querySelector('.hero__subtitle');
        if (heroSubtitle && data.описание) {
            heroSubtitle.textContent = data.описание;
        }
        
        // Информация о генеральном директоре
        if (data.фио) {
            const nameElement = document.querySelector('.team__main-name');
            if (nameElement) nameElement.textContent = data.фио;
        }
        
        // Заслуги (список с точками)
        if (data.заслуги) {
            const listElement = document.querySelector('.team__main-list:first-of-type');
            if (listElement) {
                const items = data.заслуги.split('\n').filter(item => item.trim() !== '');
                listElement.innerHTML = items.map(item => `<li>${escapeHtml(item.trim())}</li>`).join('');
            }
        }
        
        // Образование (список с точками)
        if (data.образование) {
            const educationSection = document.querySelector('.team__main-section:nth-of-type(1) .team__main-list');
            if (educationSection) {
                const items = data.образование.split('\n').filter(item => item.trim() !== '');
                educationSection.innerHTML = items.map(item => `<li>${escapeHtml(item.trim())}</li>`).join('');
            }
        }
        
        // Опыт работы (текст с абзацами)
        if (data.опыт) {
            const experienceSection = document.querySelector('.team__main-section:nth-of-type(2)');
            if (experienceSection) {
                // Очищаем секцию, оставляя только заголовок
                const title = experienceSection.querySelector('.team__main-section-title');
                experienceSection.innerHTML = '';
                if (title) experienceSection.appendChild(title);
                
                // Разбиваем на абзацы (по двойному переносу)
                const paragraphs = data.опыт.split('\n\n').filter(p => p.trim() !== '');
                paragraphs.forEach(paragraph => {
                    const p = document.createElement('p');
                    p.className = 'team__main-text';
                    p.textContent = paragraph.trim();
                    experienceSection.appendChild(p);
                });
            }
        }
        
        // Факты (список с точками)
        if (data.факты) {
            const factsSection = document.querySelector('.team__main-section:nth-of-type(2) .team__main-list--dots');
            if (factsSection) {
                const items = data.факты.split('\n').filter(item => item.trim() !== '');
                factsSection.innerHTML = items.map(item => `<li>${escapeHtml(item.trim())}</li>`).join('');
            }
        }
        
        // Текст о коллективе (абзацы)
        if (data.коллектив) {
            const teamSection = document.querySelector('.team__main-section:nth-of-type(3)');
            if (teamSection) {
                // Очищаем секцию, оставляя только заголовок
                const title = teamSection.querySelector('.team__main-section-title');
                teamSection.innerHTML = '';
                if (title) teamSection.appendChild(title);
                
                // Разбиваем на абзацы
                const paragraphs = data.коллектив.split('\n\n').filter(p => p.trim() !== '');
                paragraphs.forEach(paragraph => {
                    const p = document.createElement('p');
                    p.className = 'team__main-text';
                    p.textContent = paragraph.trim();
                    teamSection.appendChild(p);
                });
            }
        }
        
        // Цель (текст перед списком задач)
        if (data.цель) {
            const tasksText = document.querySelector('.tasks__text:first-of-type');
            if (tasksText) tasksText.textContent = data.цель;
        }
        
        // Задачи (два списка с точками)
        if (data.задачи) {
            const tasksLists = document.querySelectorAll('.tasks__list');
            
            // Разделяем задачи на две группы (до "Кроме того" и после)
            const allTasks = data.задачи.split('\n').filter(task => task.trim() !== '');
            
            // Ищем индекс, где начинается "Кроме того"
            const кромеТогоIndex = allTasks.findIndex(task => 
                task.toLowerCase().includes('кроме того') || 
                task.toLowerCase().includes('кроме того,')
            );
            
            if (кромеТогоIndex !== -1 && tasksLists.length >= 2) {
                // Первый список (до "Кроме того")
                const firstTasks = allTasks.slice(0, кромеТогоIndex);
                tasksLists[0].innerHTML = firstTasks.map(task => `<li>${escapeHtml(task.trim())}</li>`).join('');
                
                // Второй список (после "Кроме того")
                const secondTasks = allTasks.slice(кромеТогоIndex + 1);
                tasksLists[1].innerHTML = secondTasks.map(task => `<li>${escapeHtml(task.trim())}</li>`).join('');
            } else if (tasksLists.length >= 2) {
                // Если не нашли "Кроме того", просто делим примерно пополам
                const mid = Math.floor(allTasks.length / 2);
                tasksLists[0].innerHTML = allTasks.slice(0, mid).map(task => `<li>${escapeHtml(task.trim())}</li>`).join('');
                tasksLists[1].innerHTML = allTasks.slice(mid).map(task => `<li>${escapeHtml(task.trim())}</li>`).join('');
            }
        }
        
        // Текст "Кроме того, Ассоциация осуществляет:" (если есть в данных)
        if (data.кроме_того) {
            const кромеТогоТекст = document.querySelector('.tasks__content p:nth-of-type(2)');
            if (кромеТогоТекст) кромеТогоТекст.textContent = data.кроме_того;
        }
        
    } catch (error) {
        console.error('Ошибка загрузки текстов для страницы дирекции:', error);
    }
}

async function loadTeamMembers() {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    try {
        const listResponse = await fetch(`${API_BASE_URL}/api/v1/block/команда/order`);
        if (!listResponse.ok) throw new Error(`HTTP ${listResponse.status}`);

        const ids = await listResponse.json();
        if (!Array.isArray(ids) || ids.length === 0) {
            slider.innerHTML = '<div class="slider__empty">Нет сотрудников</div>';
            return;
        }

        slider.innerHTML = '';

        for (const id of ids) {
            let contentData = {};
            let fullname = id;

            try {
                const contentResponse = await fetch(
                    `${API_BASE_URL}/api/v1/block/команда/content?name=${encodeURIComponent(id)}`
                );
                if (contentResponse.ok) {
                    contentData = await contentResponse.json();
                    if (contentData.fullname) fullname = contentData.fullname;
                }
            } catch (error) {
                console.warn(`Content load failed for ${id}:`, error);
            }

            const card = createTeamCard(fullname, contentData, id);
            slider.appendChild(card);

            const img = card.querySelector('.slider__photo-img');
            if (img) loadTeamPhoto(id, img);

            const positionElement = card.querySelector('.slider__position');
            if (positionElement) {
                positionElement.textContent = contentData.post || contentData.position || '';
            }

            const contactElement = card.querySelector('.slider__contact');
            if (contactElement) {
                const phone = contentData.number || contentData.phone || '';
                const email = contentData.email || '';
                
                contactElement.innerHTML = `
                    <li>${escapeHtml(phone)}</li>
                    <li>${escapeHtml(email)}</li>
                `;
            }

            card.addEventListener('click', (event) => {
                event.preventDefault();
                // Здесь можно добавить открытие попапа с детальной информацией о сотруднике
            });
        }
    } catch (error) {
        console.error('Team load failed:', error);
        const slider = document.querySelector('.slider');
        if (slider) {
            slider.innerHTML = '<div class="slider__error">Ошибка загрузки сотрудников</div>';
        }
    }
}

function createTeamCard(fullname, data, id) {
    const cardLink = document.createElement('a');
    cardLink.href = '#';
    cardLink.className = 'slider__link';
    cardLink.dataset.teamId = id;

    const cardItem = document.createElement('div');
    cardItem.className = 'slider__item';

    cardItem.innerHTML = `
        <div class="slider__photo">
            <img src="" alt="${escapeHtml(fullname)}" class="slider__photo-img">
        </div>
        <h3 class="slider__name">${escapeHtml(fullname)}</h3>
        <p class="slider__position">${escapeHtml(data.post || data.position || '')}</p>
        <ul class="slider__contact">
            <li>${escapeHtml(data.number || data.phone || '')}</li>
            <li>${escapeHtml(data.email || '')}</li>
        </ul>
    `;

    cardLink.appendChild(cardItem);
    return cardLink;
}

async function loadTeamPhoto(id, imgElement) {
    if (!imgElement || imgElement.dataset.loaded) return;
    
    imgElement.dataset.loaded = 'true';

    try {
        const url = `${API_BASE_URL}/api/v1/block/команда/attachment?name=${encodeURIComponent(id)}&attachment=photo`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        imgElement.src = imageUrl;
        imgElement.onload = () => URL.revokeObjectURL(imageUrl);
    } catch (error) {
        console.warn(`Photo load failed for ${id}:`, error);
        imgElement.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Crect fill=\'%23e0e0e0\' width=\'200\' height=\'200\'/%3E%3Ctext fill=\'%23999\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' font-size=\'14\'%3EНет фото%3C/text%3E%3C/svg%3E';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}