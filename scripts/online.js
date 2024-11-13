// ------------------ URL API GLOBAL -----------------
const BASE_API_URL = 'https://script.google.com/macros/s/AKfycbwjX0LlvlFL8J3adpszyIB-U8FLsYX8nnD7zIhoHbjDk7AvjT5ND2jHZLzcFIfFd4GKdg/exec';

// ------------------ GET data -----------------
function PerbaruiSantri() {
    // Menggunakan URL API dengan action DataSantri
    const url = `${BASE_API_URL}?action=DataSantri`;

    // Mengambil data dari API menggunakan fetch
    fetch(url)
        .then(response => response.json())  // Mengonversi response menjadi JSON
        .then(data => {
            console.log("Data diterima dari Google Sheet:", data);

            // Mengecek apakah data "Santri" tersedia di dalam response
            if (data && data.Santri) {
                // Memanggil fungsi untuk memperbarui IndexedDB dengan data "Santri"
                PerbaruiObjectStore("Santri", data.Santri);
            } else {
                console.error("Data 'Santri' tidak ditemukan di dalam response.");
            }
        })
        .catch(error => {
            console.error("Terjadi kesalahan saat mengambil data dari Google Sheet:", error);
        });
}

function PerbaruiIndexedDB() {
    // Menggunakan URL API dengan action DapatkanSemuaData
    const url = `${BASE_API_URL}?action=DapatkanSemuaData`;

    // Membuat elemen loading secara dinamis
    const loadingInfo = document.createElement('div');
    loadingInfo.id = 'loadingInfo';
    loadingInfo.classList.add('loading-overlay');
    loadingInfo.textContent = "Memperbarui Data...";

    // Tambahkan elemen ke dalam body
    document.body.appendChild(loadingInfo);

    // Mengambil data dari API menggunakan fetch
    fetch(url)
        .then(response => response.json())  // Mengonversi response menjadi JSON
        .then(data => {
            console.log("Data diterima:", data);  // Log untuk memeriksa data yang diterima

            // Perbarui setiap object store di IndexedDB dengan data yang diterima
            for (const [sheetName, sheetData] of Object.entries(data)) {
                PerbaruiObjectStore(sheetName, sheetData);
            }

            // Ubah teks menjadi "Selesai Diperbarui"
            loadingInfo.textContent = "Selesai Diperbarui";

            // Setelah 2 detik, hapus elemen loading dari body
            setTimeout(() => {
                document.body.removeChild(loadingInfo);
            }, 2000);
        })
        .catch(error => {
            console.error("Terjadi kesalahan saat mengambil data:", error);

            // Mengubah teks menjadi "Gagal Memperbarui Data" jika terjadi kesalahan
            loadingInfo.textContent = "Gagal Memperbarui Data";

            // Setelah 2 detik, hapus elemen loading dari body
            setTimeout(() => {
                document.body.removeChild(loadingInfo);
            }, 2000);
        });
}








// Fungsi untuk mengirimkan data ke server menggunakan POST dengan fetch
async function postJSON(header) {
    antrianCount++;
    updateAntrianCounter();

    // Link Santri Baru
    const url = "https://script.google.com/macros/s/AKfycbwjX0LlvlFL8J3adpszyIB-U8FLsYX8nnD7zIhoHbjDk7AvjT5ND2jHZLzcFIfFd4GKdg/exec";

    // Simpan data ke localStorage
    const queueItem = { id: Date.now(), header };
    saveToLocalStorage(queueItem);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: header
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response:", data);

        // Jika berhasil, hapus item dari localStorage
        removeFromLocalStorage(queueItem.id);

    } catch (error) {
        console.error("Gagal mengirim data:", error);
        alert("Terjadi kesalahan saat mengirim data.");
    } finally {
        // Pastikan antrian berkurang setelah respons diterima atau terjadi error
        antrianCount--;
        updateAntrianCounter();
    }
}

// Fungsi untuk menyimpan data ke localStorage
function saveToLocalStorage(item) {
    const queue = JSON.parse(localStorage.getItem("queue")) || [];
    queue.push(item);
    localStorage.setItem("queue", JSON.stringify(queue));
}

// Fungsi untuk menghapus data dari localStorage
function removeFromLocalStorage(id) {
    const queue = JSON.parse(localStorage.getItem("queue")) || [];
    const updatedQueue = queue.filter(item => item.id !== id);
    localStorage.setItem("queue", JSON.stringify(updatedQueue));
}

// Fungsi untuk menampilkan daftar antrian di dalam kontainer
function showQueueList() {
    const queueList = document.getElementById('queueList');
    queueList.innerHTML = ""; // Clear existing list

    const queue = JSON.parse(localStorage.getItem("queue")) || [];
    queue.forEach(item => {
        const listItem = document.createElement("li");
        listItem.textContent = `Data ID: ${item.id}, Header: ${item.header}`;
        queueList.appendChild(listItem);
    });

    document.getElementById("queueContainer").style.display = 'block';
}

// Fungsi untuk update dan menampilkan counter antrian
let antrianCount = 0;
function updateAntrianCounter() {
    const antrianElement = document.getElementById('antrianCounter');
    if (antrianElement) {
        antrianElement.textContent = antrianCount;
        if (antrianCount > 0) {
            antrianElement.style.display = 'block';
            antrianElement.classList.add('queue-anim');
        } else {
            antrianElement.classList.remove('queue-anim');
            setTimeout(() => {
                antrianElement.style.display = 'none';
            }, 500);
        }
    }
}

// Cek dan kirim ulang data dari localStorage jika ada
async function retrySendingQueue() {
    const queue = JSON.parse(localStorage.getItem("queue")) || [];
    if (queue.length > 0) {
        for (const item of queue) {
            let attempts = 0;
            const maxAttempts = 5; // Maksimal 5 kali percobaan
            let success = false;
            while (attempts < maxAttempts && !success) {
                try {
                    await postJSON(item.header);
                    success = true; // Jika berhasil, keluar dari loop
                } catch (error) {
                    attempts++;
                    console.log(`Percobaan ${attempts} gagal, mencoba lagi...`);
                    if (attempts === maxAttempts) {
                        console.error("Gagal mengirim data setelah beberapa percobaan.");
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Tunggu 2 detik sebelum mencoba lagi
                    }
                }
            }
        }
    }
}

// Event listener untuk mengecek status online dan kirim ulang data yang tertunda
window.addEventListener('online', async () => {
    await retrySendingQueue();
});

// Event listener untuk menampilkan daftar antrian saat angka diklik
document.getElementById("antrianCounter").addEventListener("click", showQueueList);

// Event listener untuk menutup kontainer daftar antrian
document.getElementById("closeQueueContainer").addEventListener("click", () => {
    document.getElementById("queueContainer").style.display = 'none';
});
