// -------------------------------- Fungsi select di dalam form awal --------------------------------------
// Fungsi untuk memfilter tabel berdasarkan kelas
function filterTableByKelas() {
    const selectedKelas = document.getElementById('filterKelas').value; // Mengambil kelas yang dipilih
    const rows = document.querySelectorAll('#dataTable tbody tr'); // Mengambil semua baris dalam tabel

    // Menyembunyikan atau menampilkan baris berdasarkan kelas yang dipilih
    rows.forEach(row => {
        const kelasCell = row.cells[1]; // Kelas ada di kolom kedua
        if (selectedKelas === "" || kelasCell.textContent === selectedKelas) {
            row.style.display = ''; // Tampilkan baris jika kelas cocok
        } else {
            row.style.display = 'none'; // Sembunyikan baris jika kelas tidak cocok
        }
    });
}


// Event Listener untuk select Tanggal, Bulan, dan Jam
document.getElementById('filterTanggal').addEventListener('change', updateAbsensiFromIndexedDB);
document.getElementById('filterBulan').addEventListener('change', updateAbsensiFromIndexedDB);
document.getElementById('filterJam').addEventListener('change', updateAbsensiFromIndexedDB);

function updateAbsensiFromIndexedDB() {
    const selectedTanggal = document.getElementById('filterTanggal').value;
    const selectedBulan = document.getElementById('filterBulan').value;
    const selectedJam = document.getElementById('filterJam').value;

    updateHeaderInfo();

    // Pastikan tanggal dan bulan dipilih
    if (!selectedTanggal || !selectedBulan) {
        // Kosongkan semua select di tabel pertama
        document.querySelectorAll('#dataTable tbody select[data-ids]').forEach(selectElement => {
            selectElement.value = ''; // Kosongkan nilai select
            updateSelectColor(selectElement); // Update warna
        });
        return; // Tidak ada lagi yang perlu dilakukan
    }

    // Buka koneksi IndexedDB tanpa versi untuk menggunakan versi terbaru yang tersedia
    const request = indexedDB.open('Istidadiyah');

    // Event untuk upgrade jika versi database berbeda
    request.onupgradeneeded = function (event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('Absen')) {
            db.createObjectStore('Absen', { keyPath: 'IDS' });
        } else {
            console.log('Database upgrade: Object store "Absen" sudah ada. Bisa ditambahkan perubahan jika diperlukan.');
        }
    };

    // Jika pembukaan database berhasil
    request.onsuccess = function (event) {
        const db = event.target.result;

        try {
            const transaction = db.transaction(['Absen'], 'readonly');
            const store = transaction.objectStore('Absen');

            const updatedValues = {};

            // Gunakan cursor untuk iterasi melalui data di dalam store
            const cursorRequest = store.openCursor();

            cursorRequest.onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    const record = cursor.value;

                    // Menggunakan 'IDS' untuk mendapatkan ID pendek
                    const IDS = record.IDS;

                    if (IDS && IDS.includes('-')) {
                        const idsShort = IDS.split('-')[1]; // Ambil IDS pendek (bagian tengah dari IDS)

                        // Cek apakah bulan dan tanggal sesuai dengan pilihan user
                        const bulanNama = getBulanName(selectedBulan);
                        if (record.Bulan === bulanNama) {
                            const headerTanggal = `${selectedJam}T${selectedTanggal}`; // Nama header yang sesuai dengan tanggal
                            const tanggalValue = record[headerTanggal] || '';

                            // Simpan nilai untuk IDS pendek jika ditemukan
                            updatedValues[idsShort] = tanggalValue;
                        } else {
                            //console.warn(`Data tidak cocok untuk bulan: ${bulanNama}, IDS: ${IDS}`);
                        }
                    } else {
                        console.warn('Format IDS tidak valid atau tidak memiliki "-":', IDS);
                    }

                    cursor.continue();
                } else {
                    // Jika tidak ada lagi data dalam cursor, update select di tabel pertama
                    document.querySelectorAll('#dataTable tbody select[data-ids]').forEach(selectElement => {
                        const table1IDS = selectElement.getAttribute('data-ids').trim();

                        if (updatedValues.hasOwnProperty(table1IDS)) {
                            // Jika ada nilai yang sesuai untuk IDS ini
                            selectElement.value = updatedValues[table1IDS] || ''; // Set nilai sesuai data dari IndexedDB
                        } else {
                            // Jika tidak ditemukan, kosongkan nilai
                            selectElement.value = ''; // Kosongkan select
                        }

                        // Update warna setiap kali value diubah, baik diisi atau dikosongkan
                        updateSelectColor(selectElement);
                    });
                }
            };

            cursorRequest.onerror = function (event) {
                console.error('Error while reading cursor:', event.target.error);
                alert('Error occurred while reading data from IndexedDB. Please try again later.');
            };

            transaction.oncomplete = function () {
                console.log('Transaction completed: All selects updated.');
            };

            transaction.onerror = function (event) {
                console.error('Transaction error:', event.target.error);
                alert('Transaction failed. Data retrieval process could not be completed.');
            };
        } catch (error) {
            console.error('Unexpected error:', error);
            alert('An unexpected error occurred while accessing the database. Please refresh the page and try again.');
        }
    };

    // Jika pembukaan database gagal
    request.onerror = function (event) {
        console.error('Database open error:', event.target.error);
        alert('Could not open IndexedDB database. Please check your browser support or contact support.');
    };
}

// Function to update the header dynamically
function updateHeaderInfo() {
    const filterTanggal = document.getElementById('filterTanggal').value;
    const filterBulan = document.getElementById('filterBulan').value;
    const filterJam = document.getElementById('filterJam').value;

    const bulanNames = {
        "01": "Muharram", "02": "Shafar", "03": "Rabi'ul Awwal", "04": "Rabi'ul Akhir",
        "05": "Jumadil Awwal", "06": "Jumadil Akhir", "07": "Rajab", "08": "Sya'ban",
        "09": "Ramadhan", "10": "Syawal", "11": "Dzulqa'dah", "12": "Dzulhijjah"
    };

    const tanggalInfo = document.getElementById('tanggalInfo');
    const jamText = filterJam === 'M' ? 'Malam' : `Jam Ke ${filterJam}`;

    if (filterTanggal && filterBulan) {
        tanggalInfo.textContent = `Tanggal: ${filterTanggal} ${bulanNames[filterBulan]} (${jamText}) - Tahun Pelajaran 1445-1446`;
    }
}





// --------------------------------- Fungsi select di dalam tabel -----------------------------
// Fungsi untuk memperbarui atau menambahkan data di IndexedDB object store "Absen"
function updateAbsen(updatedData) {
    // Membuka database IndexedDB "Istidadiyah"
    let request = indexedDB.open("Istidadiyah");

    request.onsuccess = function (event) {
        let db = event.target.result;

        // Cek apakah object store "Absen" ada
        if (db.objectStoreNames.contains("Absen")) {
            let transaction = db.transaction("Absen", "readwrite");
            let objectStore = transaction.objectStore("Absen");

            // IDS dari data yang baru diperbarui
            const updatedIDS = updatedData.IDS.trim(); // Trim IDS untuk menghindari masalah whitespace

            // Mengambil data berdasarkan IDS
            let getRequest = objectStore.get(updatedIDS);

            getRequest.onsuccess = function () {
                if (getRequest.result) {
                    // Data ditemukan, lakukan pembaruan
                    let dataToUpdate = getRequest.result;
                    Object.assign(dataToUpdate, updatedData); // Menggabungkan data lama dengan data baru
                    objectStore.put(dataToUpdate);
                    console.log('Data Absensi diperbarui di IndexedDB:', updatedIDS);
                } else {
                    // Data tidak ditemukan, tambahkan data baru
                    objectStore.add(updatedData);
                    console.log('Data Absensi baru ditambahkan ke IndexedDB:', updatedIDS);
                }
            };

            getRequest.onerror = function () {
                console.error("Terjadi kesalahan saat mengambil data Absensi dari IndexedDB.");
            };

            transaction.oncomplete = function () {
                console.log("Transaksi untuk update/insert data Absensi selesai.");
            };

            transaction.onerror = function () {
                console.error("Terjadi kesalahan saat transaksi untuk update/insert data Absensi.");
            };
        } else {
            console.warn("Object store 'Absen' tidak ditemukan di IndexedDB. Memperbarui seluruh database...");

            // Jika object store tidak ada, perbarui seluruh database dengan memanggil PerbaruiIndexedDB
            PerbaruiIndexedDB();

            // Ulangi proses update setelah IndexedDB diperbarui
            transaction.oncomplete = function () {
                updateAbsen(updatedData);
            };
        }
    };

    request.onerror = function (event) {
        console.error("Terjadi kesalahan saat membuka database IndexedDB:", event.target.error);
    };
}


function updateSelectColor(selectElement) {
    const value = selectElement.value;

    // Menghapus semua kelas warna sebelumnya
    selectElement.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'bg-light');
    selectElement.style.color = ''; // Reset warna teks ke default
    selectElement.style.fontWeight = ''; // Reset font-weight ke default

    switch (value) {
        case '':
            selectElement.classList.add('bg-light'); // Kosong: Putih
            selectElement.style.color = 'black'; // Teks menjadi hitam
            break;
        case 'H':
            selectElement.classList.add('bg-success'); // Hadir: Hijau
            selectElement.style.color = 'white'; // Teks menjadi putih untuk kontras
            selectElement.style.fontWeight = 'bold'; // Teks menjadi tebal
            break;
        case 'A':
            selectElement.classList.add('bg-danger'); // Alpha: Merah
            selectElement.style.color = 'white'; // Teks menjadi putih untuk kontras
            selectElement.style.fontWeight = 'bold'; // Teks menjadi tebal
            break;
        case 'I':
            selectElement.classList.add('bg-warning'); // Izin: Kuning
            selectElement.style.color = 'black'; // Teks tetap hitam karena latar belakang kuning cerah
            selectElement.style.fontWeight = 'bold'; // Teks menjadi tebal
            break;
        case 'S':
            selectElement.classList.add('bg-info'); // Sakit: Biru
            selectElement.style.color = 'white'; // Teks menjadi putih untuk kontras
            selectElement.style.fontWeight = 'bold'; // Teks menjadi tebal
            break;
        default:
            selectElement.classList.add('bg-light'); // Default: Putih
            selectElement.style.color = 'black'; // Teks menjadi hitam
            break;
    }
}



// Menambahkan Event Listener untuk setiap selectAbsensi
function addChangeColorListener(selectAbsensi) {
    selectAbsensi.addEventListener('change', function () {
        updateSelectColor(selectAbsensi); // Update warna saat value berubah
    });

    // Set warna pada saat pertama kali elemen dibuat, agar sesuai dengan nilai default
    updateSelectColor(selectAbsensi);
}





// --------------------------- Tombol ---------------------

// Toggle the form when the toggle button is clicked
document.getElementById('toggleFormButton').addEventListener('click', function (event) {
    var formFilter = document.getElementById('formfilter');
    if (formFilter.classList.contains('show')) {
        // Hide form if it is currently shown
        formFilter.classList.remove('show');
    } else {
        // Show form if it is currently hidden
        formFilter.classList.add('show');
    }

    // Prevent click from propagating to the document
    event.stopPropagation();
});

// Hide form when clicking outside
document.addEventListener('click', function (event) {
    var formFilter = document.getElementById('formfilter');
    var toggleButton = document.getElementById('toggleFormButton');

    // Check if the form is currently shown, and if the click is outside both the form and toggle button
    if (formFilter.classList.contains('show') &&
        !formFilter.contains(event.target) &&
        event.target !== toggleButton) {
        formFilter.classList.remove('show');
    }
});

// Function to make the form element draggable
function makeElementDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;

    // Set up mouse and touch listeners for the form element only
    element.onmousedown = dragMouseDown;
    element.ontouchstart = dragTouchStart;

    // Function to handle mouse down event
    function dragMouseDown(e) {
        e = e || window.event;

        // Ignore the event if it's triggered from an input, select, or other form control
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        e.preventDefault();
        isDragging = true;

        // Get initial cursor positions
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    // Function to handle touch start event
    function dragTouchStart(e) {
        e = e || window.event;

        // Ignore the event if it's triggered from an input, select, or other form control
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        e.preventDefault();
        isDragging = true;

        // Get initial touch positions
        pos3 = e.touches[0].clientX;
        pos4 = e.touches[0].clientY;
        document.ontouchend = closeDragElement;
        document.ontouchmove = elementDragTouch;
    }

    // Function to handle element dragging with mouse
    function elementDrag(e) {
        if (!isDragging) return;

        e = e || window.event;
        e.preventDefault();

        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        // Set the element's new position
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    // Function to handle element dragging with touch
    function elementDragTouch(e) {
        if (!isDragging) return;

        e = e || window.event;
        e.preventDefault();

        // Calculate the new touch position
        pos1 = pos3 - e.touches[0].clientX;
        pos2 = pos4 - e.touches[0].clientY;
        pos3 = e.touches[0].clientX;
        pos4 = e.touches[0].clientY;

        // Set the element's new position
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    // Function to handle when dragging stops
    function closeDragElement() {
        // Stop moving when mouse button or touch ends
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;
        isDragging = false;
    }
}

// Make the form draggable
makeElementDraggable(document.getElementById("formfilter"));