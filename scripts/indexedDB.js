function PerbaruiObjectStore(sheetName, data) {
    // Membuka database IndexedDB "Istidadiyah"
    let request = indexedDB.open("Istidadiyah");

    request.onupgradeneeded = function(event) {
        let db = event.target.result;
        
        // Membuat object store jika belum ada
        if (!db.objectStoreNames.contains(sheetName)) {
            // Menentukan primary key berdasarkan IDS atau ID
            let primaryKey = data.length > 0 && data[0].hasOwnProperty('IDS') ? 'IDS' : 'ID';
            db.createObjectStore(sheetName, { keyPath: primaryKey });
        }
    };

    request.onsuccess = function(event) {
        let db = event.target.result;

        // Jika object store sudah ada, lakukan transaksi untuk memperbarui data
        if (db.objectStoreNames.contains(sheetName)) {
            let transaction = db.transaction(sheetName, "readwrite");
            let objectStore = transaction.objectStore(sheetName);

            // Menghapus data lama
            let clearRequest = objectStore.clear();

            clearRequest.onsuccess = function() {
                // Menambahkan data baru setelah data lama dihapus
                data.forEach(item => {
                    objectStore.put(item);
                });
                console.log(`Data untuk object store "${sheetName}" telah berhasil diperbarui.`);
            };

            clearRequest.onerror = function(event) {
                console.error(`Terjadi kesalahan saat menghapus isi object store "${sheetName}":`, event.target.error);
            };

        } else {
            // Jika object store tidak ada, tingkatkan versi database dan buat object store baru
            let newVersion = db.version + 1;
            db.close(); // Tutup database sebelum melakukan upgrade versi

            let upgradeRequest = indexedDB.open("Istidadiyah", newVersion);

            upgradeRequest.onupgradeneeded = function(event) {
                let upgradeDb = event.target.result;

                // Menentukan primary key berdasarkan IDS atau ID
                let primaryKey = data.length > 0 && data[0].hasOwnProperty('IDS') ? 'IDS' : 'ID';
                let newObjectStore = upgradeDb.createObjectStore(sheetName, { keyPath: primaryKey });

                newObjectStore.transaction.oncomplete = function() {
                    let transaction = upgradeDb.transaction(sheetName, "readwrite");
                    let objectStore = transaction.objectStore(sheetName);

                    // Memasukkan data baru
                    data.forEach(item => {
                        objectStore.put(item);
                    });
                    console.log(`Object store "${sheetName}" telah berhasil dibuat dan data disimpan.`);
                };
            };

            upgradeRequest.onsuccess = function(event) {
                console.log(`Object store "${sheetName}" telah berhasil diperbarui.`);
            };

            upgradeRequest.onerror = function(event) {
                console.error("Terjadi kesalahan saat memperbarui database untuk membuat object store baru:", event.target.error);
            };
        }
    };

    request.onerror = function(event) {
        console.error("Terjadi kesalahan saat membuka database IndexedDB:", event.target.error);
    };
}



// Fungsi untuk membuka database IndexedDB dan mengambil data dari object store "Santri".
// Setelah data diambil, fungsi callback (misalnya insertDataToTable) akan dijalankan.
function OpenSantri(callback) {
    // Membuka database IndexedDB "Istidadiyah" tanpa menentukan versi
    let request = indexedDB.open("Istidadiyah");

    request.onsuccess = function (event) {
        let db = event.target.result;

        // Membuat transaksi read-only untuk object store "Santri"
        if (db.objectStoreNames.contains("Santri")) {
            let transaction = db.transaction("Santri", "readonly");
            let objectStore = transaction.objectStore("Santri");

            // Mengambil semua data dari object store "Santri"
            let getAllRequest = objectStore.getAll();

            getAllRequest.onsuccess = function () {
                let santriData = getAllRequest.result;

                // Memeriksa apakah data ditemukan
                if (santriData.length > 0) {
                    console.log("Data diambil dari IndexedDB:", santriData);

                    // Memanggil fungsi callback (misalnya insertDataToTable) untuk memasukkan data ke dalam tabel
                    if (typeof callback === "function") {
                        callback(santriData);
                    }
                } else {
                    console.log("Tidak ada data yang ditemukan di IndexedDB.");
                }
            };

            getAllRequest.onerror = function (event) {
                console.error("Terjadi kesalahan saat mengambil data dari IndexedDB:", event.target.error);
            };
        } else {
            console.error("Object store 'Santri' tidak ditemukan di IndexedDB.");
        }
    };

    request.onerror = function (event) {
        console.error("Terjadi kesalahan saat membuka database IndexedDB:", event.target.error);
    };
}
