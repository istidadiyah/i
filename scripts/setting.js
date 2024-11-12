// Ketika halaman dimuat, terapkan tema yang disimpan di Local Storage
document.addEventListener('DOMContentLoaded', function () {
    const savedTheme = localStorage.getItem('theme') || 'light'; // Default ke 'light' jika tidak ada yang disimpan
    const themeStylesheet = document.getElementById('themeStylesheet');
    themeStylesheet.href = savedTheme === 'dark' ? '../styles/tema/dark.css' : '../styles/tema/light.css';
});

// Fungsi untuk mengganti tema dan menyimpannya ke Local Storage
function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    const themeStylesheet = document.getElementById('themeStylesheet');
    themeStylesheet.href = currentTheme === 'dark' ? '../styles/tema/dark.css' : '../styles/tema/light.css';
}
