document.addEventListener('DOMContentLoaded', function() {
    initStandardsToggle();
    initMeetingsToggle();
});

function initStandardsToggle() {
    const toggleBtn = document.getElementById('standards-toggle');
    const standardsItems = document.querySelector('.standards-list__items');
    const datesList = document.querySelector('.standards-list__dates');

    if (!toggleBtn || !standardsItems || !datesList) return;

    toggleBtn.addEventListener('click', function() {
        standardsItems.classList.toggle('expanded');
        datesList.classList.toggle('expanded');
        toggleBtn.classList.toggle('active');

        const toggleText = toggleBtn.querySelector('.doc-section__toggle-text');
        if (toggleText) {
            toggleText.textContent = toggleBtn.classList.contains('active') ? 'см. меньше' : 'см. больше';
        }
    });
}

function initMeetingsToggle() {
    const toggleBtn = document.getElementById('meetings-toggle');
    const meetingsContent = document.getElementById('meetings-content');
    const hiddenMeetings = document.getElementById('hidden-meetings');

    if (!toggleBtn || !meetingsContent || !hiddenMeetings) return;

    toggleBtn.addEventListener('click', function() {
        meetingsContent.classList.toggle('expanded');
        hiddenMeetings.classList.toggle('expanded');
        toggleBtn.classList.toggle('active');

        const toggleText = toggleBtn.querySelector('.doc-section__toggle-text');
        if (toggleText) {
            toggleText.textContent = toggleBtn.classList.contains('active') ? 'см. меньше' : 'см. больше';
        }
    });
}
