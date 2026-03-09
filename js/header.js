document.addEventListener('DOMContentLoaded', function() {
    initHeaderDropdown();
});

function initHeaderDropdown() {
    const mainHeader = document.querySelector('.main-header');
    const dropdowns = document.querySelectorAll('.nav__dropdown');
    const navItems = document.querySelectorAll('.nav__item');

    if (!mainHeader) return;

    function showDropdown(dropdownId) {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });

        if (dropdownId) {
            const targetDropdown = document.getElementById('dropdown-' + dropdownId);
            if (targetDropdown) {
                targetDropdown.classList.add('active');
            }
        }
    }

    navItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const dropdownId = this.getAttribute('data-dropdown');
            showDropdown(dropdownId);
        });
    });

    mainHeader.addEventListener('mouseenter', function() {
        const firstDropdown = dropdowns[0];
        if (firstDropdown) {
            dropdowns.forEach(d => d.classList.remove('active'));
            firstDropdown.classList.add('active');
        }
    });

    mainHeader.addEventListener('mouseleave', function() {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });
}
