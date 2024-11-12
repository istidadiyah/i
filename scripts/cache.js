document.addEventListener('DOMContentLoaded', function () {
    const selectGuru = document.getElementById('filterGuru');

    // Load the stored selection if available
    const storedGuru = localStorage.getItem('selectedGuru');
    if (storedGuru) {
        selectGuru.value = storedGuru;
    }

    // Save the selection to localStorage on change
    selectGuru.addEventListener('change', function () {
        localStorage.setItem('selectedGuru', selectGuru.value);
    });
});
