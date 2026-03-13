document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
    loadFooter();
    initAboutPopup();
});

function initAboutPopup() {
    const aboutBtn = document.querySelector('.about__btn');
    const aboutPopup = document.getElementById('about-popup');
    const aboutPopupClose = document.getElementById('about-popup-close');

    if (!aboutBtn || !aboutPopup) return;

    aboutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        aboutPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    if (aboutPopupClose) {
        aboutPopupClose.addEventListener('click', function() {
            aboutPopup.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && aboutPopup.classList.contains('active')) {
            aboutPopup.classList.remove('active');
            document.body.style.overflow = '';
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
