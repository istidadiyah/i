// -------------------------------- Fungsi select di dalam form awal --------------------------------------

// Event Listener untuk select Tanggal dan Bulan
document.getElementById('filterTanggal').addEventListener('change', updateAbsensiFromDynamicTable);
document.getElementById('filterBulan').addEventListener('change', updateAbsensiFromDynamicTable);
document.getElementById('filterJam').addEventListener('change', updateAbsensiFromDynamicTable);

function updateAbsensiFromDynamicTable() {
    const selectedTanggal = document.getElementById('filterTanggal').value;
    const selectedBulan = document.getElementById('filterBulan').value;
    const selectedJam = document.getElementById('filterJam').value;

    updateHeaderInfo()

    // Pastikan tanggal dan bulan dipilih
    if (!selectedTanggal || !selectedBulan) {
        // Jika tidak ada yang dipilih, kosongkan semua select di tabel pertama
        document.querySelectorAll('#dataTable tbody select[data-ids]').forEach(selectElement => {
            selectElement.value = ''; // Kosongkan nilai select
        });
        return; // Tidak ada lagi yang perlu dilakukan
    }

    const headerTanggal = `${selectedJam}T${selectedTanggal}`; // Nama header yang sesuai dengan tanggal (contoh: "T2")
    const dynamicBody = document.getElementById('dynamicBody');
    const rows = dynamicBody.querySelectorAll('tr');

    // Buat objek untuk menyimpan nilai berdasarkan IDS pendek
    const updatedValues = {};

    // Iterasi melalui setiap baris tabel dinamis untuk menemukan IDS yang cocok
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');

        // IDS di tabel kedua ada di kolom kedua (index 1)
        const fullIDS = cells[1].textContent.trim(); // Ambil IDS dari tabel kedua
        const idsShort = fullIDS.split('-')[1]; // Ambil IDS pendek (tengah)

        if (fullIDS.endsWith(`-${selectedBulan}`)) {
            // IDS cocok dengan bulan yang dipilih
            const tanggalValue = cells[getColumnIndexByName(globalSheet2Data, headerTanggal)]?.textContent || '';

            // Simpan nilai untuk IDS pendek jika ditemukan
            updatedValues[idsShort] = tanggalValue;
        }
    });

    // Iterasi melalui semua elemen select di tabel pertama dan update jika cocok
    document.querySelectorAll('#dataTable tbody select[data-ids]').forEach(selectElement => {
        const table1IDS = selectElement.getAttribute('data-ids').trim();
        
        if (updatedValues.hasOwnProperty(table1IDS)) {
            // Jika ada nilai yang sesuai untuk IDS ini
            selectElement.value = updatedValues[table1IDS] || ''; // Set nilai sesuai data dari tabel kedua
        } else {
            // Jika tidak ditemukan, kosongkan nilai
            selectElement.value = ''; // Kosongkan select
        }

        // Update warna setiap kali value diubah, baik diisi atau dikosongkan
        updateSelectColor(selectElement);
        
    });
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
        // Set dynamic content
        tanggalInfo.textContent = `Tanggal: ${filterTanggal} ${bulanNames[filterBulan]} (${jamText}) - Tahun Pelajaran 1445-1446`;
    }
}



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





// --------------------------------- Fungsi select di dalam tabel -----------------------------

function updateDynamicTableAfterChange(updatedData) {
    const dynamicBody = document.getElementById('dynamicBody');

    // IDS dari data yang baru diperbarui
    const updatedIDS = updatedData.IDS.trim(); // Trim IDS untuk menghindari masalah whitespace

    // Ambil semua baris di tabel dinamis
    const rows = dynamicBody.querySelectorAll('tr');

    // Cari baris dengan IDS yang sesuai
    let rowToUpdate = null;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('td');

        if (cells.length > 1) { // Pastikan baris memiliki setidaknya dua sel
            const IDSCell = cells[1].textContent.trim();  // Kolom kedua dianggap sebagai kolom IDS

            if (IDSCell === updatedIDS) {
                rowToUpdate = row;
                break;  // Berhenti setelah menemukan baris yang sesuai
            }
        }
    }

    if (rowToUpdate) {
        console.log('IDS ditemukan, memperbarui baris:', updatedIDS);

        // IDS ditemukan, perbarui data baris tersebut
        const cells = rowToUpdate.querySelectorAll('td');

        for (let key in updatedData) {
            if (key !== 'IDS' && key !== 'TanggalUpdate') {
                const columnIndex = getColumnIndexByName(globalSheet2Data, key);
                if (columnIndex !== -1 && columnIndex < cells.length) {
                    cells[columnIndex].textContent = updatedData[key];
                }
            }
        }
    } else {
        console.log('IDS tidak ditemukan, menambahkan baris baru:', updatedIDS);

        // IDS tidak ditemukan, tambahkan baris baru
        const newRow = document.createElement('tr');
        const columns = Object.keys(globalSheet2Data[0]);

        // Membuat sel data berdasarkan kolom yang ada
        columns.forEach(column => {
            const newCell = document.createElement('td');
            newCell.textContent = updatedData[column] || '';  // Menggunakan default kosong jika data tidak ada
            newRow.appendChild(newCell);
        });

        // Menambahkan row baru ke dalam body tabel
        dynamicBody.appendChild(newRow);
    }
}

// Fungsi untuk mendapatkan indeks kolom berdasarkan nama kolom
function getColumnIndexByName(sheet2Data, columnName) {
    const columns = Object.keys(sheet2Data[0]);
    return columns.indexOf(columnName);
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