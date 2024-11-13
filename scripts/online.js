function fetchDataFromAppScript() {
    const url = 'https://script.google.com/macros/s/AKfycbwjX0LlvlFL8J3adpszyIB-U8FLsYX8nnD7zIhoHbjDk7AvjT5ND2jHZLzcFIfFd4GKdg/exec?action=DuaData';

    // Mengambil data dari API menggunakan fetch
    fetch(url)
        .then(response => response.json())  // Mengonversi response menjadi JSON
        .then(data => {
            console.log("Data diterima:", data);  // Menambahkan log untuk melihat data

            if (data && data.sheet1Data && data.sheet2Data) {
                // Memanggil fungsi untuk menampilkan data di tabel pertama (static)
                insertDataToTable(data.sheet1Data);
                
                // Memanggil fungsi untuk menampilkan data di tabel kedua (dynamic)
                insertDataToDynamicTable(data.sheet2Data);

                var loadingSpinner = document.getElementById("loadingSpinner");
                loadingSpinner.style.display = "none";
            } else {
                console.error("Data tidak lengkap atau tidak valid.");
            }
        })
        .catch(error => {
            console.error("Terjadi kesalahan saat mengambil data:", error);
        });
}






// Fungsi untuk mengirimkan data ke server menggunakan POST dengan fetch
async function postJSON(header) {
    antrianCount++;
    updateAntrianCounter();

    // Link Santri Baru
    const url = "https://script.google.com/macros/s/AKfycbwjX0LlvlFL8J3adpszyIB-U8FLsYX8nnD7zIhoHbjDk7AvjT5ND2jHZLzcFIfFd4GKdg/exec";

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

        // Tindakan tambahan jika response sukses
        //alert("Data berhasil dikirim!");

    } catch (error) {
        console.error("Gagal mengirim data:", error);
        alert("Terjadi kesalahan saat mengirim data.");
    } finally {
        // Pastikan antrian berkurang setelah respons diterima atau terjadi error
        antrianCount--;
        updateAntrianCounter();
    }
}

let antrianCount = 0;

// Function to update the queue display on screen
function updateAntrianCounter() {
    const antrianElement = document.getElementById('antrianCounter');
    if (antrianElement) {
        // Set the counter text
        antrianElement.textContent = antrianCount;

        // Show or hide the counter based on antrianCount
        if (antrianCount > 0) {
            // If the count is greater than 0, show the counter with animation
            antrianElement.style.display = 'block';
            antrianElement.classList.add('queue-anim');
        } else {
            // If the count is 0, hide the counter with a fade effect
            antrianElement.classList.remove('queue-anim');
            setTimeout(() => {
                antrianElement.style.display = 'none';
            }, 500); // Delay the hiding of the counter to allow for the fade-out animation
        }
    }
}
