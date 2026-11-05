
/* =========================================
   FITUR KLASIFIKASI NELAYAN
   MODE DEMO - BELUM MENGGUNAKAN DECISION TREE
========================================= */

// Mengambil elemen-elemen HTML yang digunakan pada halaman klasifikasi
const classificationForm = document.getElementById("classificationForm");

const resultPlaceholder = document.getElementById("resultPlaceholder");
const resultContent = document.getElementById("resultContent");

// Mengambil elemen untuk menampilkan hasil klasifikasi
const productionLevel = document.getElementById("productionLevel");
const conclusionText = document.getElementById("conclusionText");
const suggestionText = document.getElementById("suggestionText");


/* =========================================
   1. FITUR KLASIFIKASI NELAYAN
========================================= */

// Memeriksa apakah form klasifikasi tersedia pada halaman
if (classificationForm) {

    // Menjalankan proses ketika tombol klasifikasikan ditekan
    classificationForm.addEventListener("submit", function (event) {

        // Mencegah halaman dimuat ulang ketika form dikirim
        event.preventDefault();

        // Mengambil nilai dari setiap pilihan pada form
        const jenisIkan = document.getElementById("jenisIkan").value;
        const alatTangkap = document.getElementById("alatTangkap").value;
        const wilayah = document.getElementById("wilayah").value;
        const musim = document.getElementById("musim").value;


        /* -----------------------------------------
           HASIL SIMULASI SEMENTARA
           BELUM MENGGUNAKAN ALGORITMA DECISION TREE
        ----------------------------------------- */

        // Menentukan hasil demo secara manual
        const hasilDemo = "Tinggi";

        // Menampilkan tingkat produksi pada halaman
        productionLevel.textContent = hasilDemo;

        // Menampilkan kesimpulan berdasarkan data yang dimasukkan
        conclusionText.textContent =
            `Berdasarkan data yang dimasukkan, ikan ${jenisIkan} ` +
            `yang ditangkap menggunakan ${alatTangkap} di wilayah ` +
            `${wilayah} pada musim ${musim} ditampilkan sebagai ` +
            `contoh hasil klasifikasi ${hasilDemo.toLowerCase()}. ` +
            `Hasil ini masih berupa simulasi tampilan.`;

        // Menampilkan saran kepada nelayan
        suggestionText.textContent =
            "Nelayan disarankan untuk mempertahankan penggunaan " +
            "alat tangkap yang sesuai, memeriksa prakiraan cuaca " +
            "sebelum melaut, dan tetap mematuhi aturan penangkapan ikan.";

        // Menyembunyikan tampilan awal sebelum klasifikasi
        resultPlaceholder.hidden = true;

        // Menampilkan bagian hasil klasifikasi
        resultContent.hidden = false;

        // Memperbarui ikon Lucide setelah hasil ditampilkan
        lucide.createIcons();

    });


    /* =========================================
       2. FITUR RESET FORM KLASIFIKASI
    ========================================= */

    // Menjalankan fungsi ketika tombol reset ditekan
    classificationForm.addEventListener("reset", function () {

        // Menyembunyikan hasil klasifikasi
        resultContent.hidden = true;

        // Menampilkan kembali tampilan awal
        resultPlaceholder.hidden = false;

    });

}


/* =========================================
   FITUR RIWAYAT KLASIFIKASI NELAYAN
   MODE DEMO - MENGGUNAKAN DATA DUMMY
========================================= */

// Mengambil elemen-elemen HTML pada halaman riwayat
const historyTableBody = document.getElementById("historyTableBody");
const historySearch = document.getElementById("historySearch");
const dateFilter = document.getElementById("dateFilter");
const pageNumbers = document.getElementById("pageNumbers");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");


/* =========================================
   3. DATA RIWAYAT KLASIFIKASI
========================================= */

// Memeriksa apakah elemen utama halaman riwayat tersedia
if (historyTableBody && historySearch && dateFilter) {

    // Menyimpan data dummy riwayat klasifikasi
    const historyData = [
        { date: "2025-05-12", time: "10:23", fish: "Cakalang", gear: "Jaring", region: "Kota Ternate", season: "Kemarau", result: "Tinggi" },
        { date: "2025-05-10", time: "14:17", fish: "Layang", gear: "Bagan", region: "Halmahera Selatan", season: "Pancaroba", result: "Sedang" },
        { date: "2025-05-08", time: "09:05", fish: "Tuna", gear: "Pancing", region: "Kepulauan Sula", season: "Hujan", result: "Rendah" },
        { date: "2025-05-05", time: "16:42", fish: "Tongkol", gear: "Jaring", region: "Pulau Morotai", season: "Kemarau", result: "Tinggi" },
        { date: "2025-05-03", time: "11:30", fish: "Selar", gear: "Bagan", region: "Halmahera Utara", season: "Pancaroba", result: "Sedang" },
        { date: "2025-05-01", time: "13:12", fish: "Cakalang", gear: "Pancing", region: "Kota Ternate", season: "Hujan", result: "Rendah" },
        { date: "2025-04-28", time: "08:50", fish: "Layang", gear: "Jaring", region: "Halmahera Selatan", season: "Kemarau", result: "Tinggi" },
        { date: "2025-04-25", time: "10:15", fish: "Tuna", gear: "Pancing", region: "Pulau Morotai", season: "Pancaroba", result: "Sedang" },
        { date: "2025-04-22", time: "15:20", fish: "Tongkol", gear: "Bagan", region: "Kota Ternate", season: "Hujan", result: "Rendah" },
        { date: "2025-04-20", time: "09:40", fish: "Selar", gear: "Jaring", region: "Halmahera Utara", season: "Kemarau", result: "Tinggi" },

        { date: "2025-05-15", time: "08:30", fish: "Tuna", gear: "Pancing", region: "Kota Ternate", season: "Kemarau", result: "Tinggi" },
        { date: "2025-05-14", time: "11:45", fish: "Cakalang", gear: "Jaring", region: "Pulau Morotai", season: "Pancaroba", result: "Sedang" },
        { date: "2025-05-13", time: "13:25", fish: "Layang", gear: "Bagan", region: "Halmahera Utara", season: "Hujan", result: "Rendah" },
        { date: "2025-05-11", time: "07:50", fish: "Tongkol", gear: "Pancing", region: "Kepulauan Sula", season: "Kemarau", result: "Tinggi" },
        { date: "2025-05-09", time: "12:10", fish: "Selar", gear: "Jaring", region: "Halmahera Selatan", season: "Pancaroba", result: "Sedang" },
        { date: "2025-04-30", time: "14:00", fish: "Cakalang", gear: "Bagan", region: "Kota Ternate", season: "Hujan", result: "Rendah" },
        { date: "2025-04-27", time: "10:45", fish: "Tuna", gear: "Jaring", region: "Pulau Morotai", season: "Kemarau", result: "Tinggi" },
        { date: "2025-04-24", time: "09:20", fish: "Layang", gear: "Pancing", region: "Kepulauan Sula", season: "Pancaroba", result: "Sedang" },
        { date: "2025-04-21", time: "16:15", fish: "Tongkol", gear: "Bagan", region: "Halmahera Utara", season: "Hujan", result: "Rendah" },
        { date: "2025-04-18", time: "08:35", fish: "Selar", gear: "Jaring", region: "Halmahera Selatan", season: "Kemarau", result: "Tinggi" },

        { date: "2025-05-18", time: "09:10", fish: "Cakalang", gear: "Pancing", region: "Kota Ternate", season: "Kemarau", result: "Tinggi" },
        { date: "2025-05-17", time: "12:30", fish: "Layang", gear: "Jaring", region: "Halmahera Utara", season: "Pancaroba", result: "Sedang" },
        { date: "2025-05-16", time: "15:45", fish: "Tuna", gear: "Bagan", region: "Pulau Morotai", season: "Hujan", result: "Rendah" },
        { date: "2025-05-06", time: "10:20", fish: "Tongkol", gear: "Pancing", region: "Kepulauan Sula", season: "Kemarau", result: "Tinggi" },
        { date: "2025-05-04", time: "13:40", fish: "Selar", gear: "Bagan", region: "Halmahera Selatan", season: "Pancaroba", result: "Sedang" },
        { date: "2025-04-29", time: "07:55", fish: "Cakalang", gear: "Jaring", region: "Kota Ternate", season: "Hujan", result: "Rendah" },
        { date: "2025-04-26", time: "11:15", fish: "Layang", gear: "Pancing", region: "Halmahera Utara", season: "Kemarau", result: "Tinggi" },
        { date: "2025-04-23", time: "14:35", fish: "Tuna", gear: "Bagan", region: "Kepulauan Sula", season: "Pancaroba", result: "Sedang" },
        { date: "2025-04-19", time: "09:50", fish: "Tongkol", gear: "Jaring", region: "Pulau Morotai", season: "Hujan", result: "Rendah" },
        { date: "2025-04-15", time: "16:25", fish: "Selar", gear: "Pancing", region: "Halmahera Selatan", season: "Kemarau", result: "Tinggi" }
    ];


    /* =========================================
       4. PENGATURAN PAGINATION
    ========================================= */

    // Menentukan jumlah baris data yang ditampilkan setiap halaman
    const rowsPerPage = 10;

    // Menentukan halaman yang sedang aktif
    let currentPage = 1;


    /* =========================================
       5. FORMAT TANGGAL
    ========================================= */

    // Mengubah format tanggal dari YYYY-MM-DD menjadi format Indonesia
    function formatDate(date) {

        const [year, month, day] = date.split("-");

        // Daftar nama bulan dalam bahasa Indonesia
        const months = [
            "Januari", "Februari", "Maret", "April",
            "Mei", "Juni", "Juli", "Agustus",
            "September", "Oktober", "November", "Desember"
        ];

        // Mengembalikan tanggal dengan format yang lebih mudah dibaca
        return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
    }


    /* =========================================
       6. MENAMPILKAN DATA RIWAYAT
    ========================================= */

    // Mengambil, memfilter, dan menampilkan data riwayat ke dalam tabel
    function renderHistory() {

        // Mengambil kata kunci pencarian dan tanggal yang dipilih
        const keyword = historySearch.value.toLowerCase().trim();
        const selectedDate = dateFilter.value;

        // Menyaring data berdasarkan kata kunci dan tanggal
        const filteredData = historyData.filter(item => {

            // Menggabungkan beberapa informasi untuk keperluan pencarian
            const searchable = `
                ${item.fish}
                ${item.gear}
                ${item.region}
                ${item.season}
            `.toLowerCase();

            // Memeriksa kecocokan kata kunci dan tanggal
            const matchesSearch = searchable.includes(keyword);
            const matchesDate = selectedDate === "all" || item.date.startsWith(selectedDate);

            return matchesSearch && matchesDate;
        });

        // Menghitung jumlah halaman berdasarkan data yang ditemukan
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);

        // Menyesuaikan halaman aktif jika jumlah halaman berubah
        currentPage = Math.min(currentPage, Math.max(totalPages, 1));

        // Menentukan posisi awal dan mengambil data untuk halaman aktif
        const start = (currentPage - 1) * rowsPerPage;
        const pageData = filteredData.slice(start, start + rowsPerPage);

        // Mengosongkan isi tabel sebelum menampilkan data terbaru
        historyTableBody.innerHTML = "";

        // Memeriksa apakah data yang ditemukan kosong
        if (pageData.length === 0) {

            // Menampilkan pesan ketika tidak ada data yang sesuai
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="padding:30px; text-align:center;">
                        Tidak ada data riwayat ditemukan.
                    </td>
                </tr>
            `;

        } else {

            // Menampilkan setiap data riwayat ke dalam baris tabel
            pageData.forEach((item, index) => {

                // Menentukan kelas badge berdasarkan hasil klasifikasi
                const badgeClass = item.result === "Tinggi" ? "high"
                    : item.result === "Sedang" ? "medium" : "low";

                // Membuat elemen baris tabel baru
                const row = document.createElement("tr");

                // Mengisi baris tabel dengan informasi riwayat klasifikasi
                row.innerHTML = `
                    <td>${start + index + 1}</td>
                    <td>${formatDate(item.date)},<br>${item.time}</td>
                    <td>${item.fish}</td>
                    <td>${item.gear}</td>
                    <td>${item.region}</td>
                    <td>${item.season}</td>
                    <td><span class="history-badge ${badgeClass}">${item.result}</span></td>
                    <td>
                        <a href="detail-prediksi.html" class="history-detail-button">Detail</a>
                    </td>
                `;

                // Memasukkan baris ke dalam tabel
                historyTableBody.appendChild(row);
            });
        }

        // Memperbarui tombol dan nomor halaman pagination
        renderPagination(totalPages);
    }


    /* =========================================
       7. FITUR PAGINATION
    ========================================= */

    // Menampilkan nomor halaman dan mengatur tombol navigasi
    function renderPagination(totalPages) {

        // Mengosongkan nomor halaman sebelum diperbarui
        pageNumbers.innerHTML = "";

        // Membuat tombol untuk setiap nomor halaman
        for (let page = 1; page <= totalPages; page++) {

            const button = document.createElement("button");

            // Mengatur atribut dan tampilan tombol halaman
            button.type = "button";
            button.className = "page-button";
            button.textContent = page;

            // Memberikan penanda pada halaman yang sedang aktif
            if (page === currentPage) {
                button.classList.add("active");
                button.setAttribute("aria-current", "page");
            }

            // Mengubah halaman ketika nomor halaman diklik
            button.addEventListener("click", function () {
                currentPage = page;
                renderHistory();
            });

            // Memasukkan tombol halaman ke dalam elemen pagination
            pageNumbers.appendChild(button);
        }

        // Menonaktifkan tombol sebelumnya jika berada di halaman pertama
        prevPage.disabled = currentPage === 1;

        // Menonaktifkan tombol berikutnya jika berada di halaman terakhir
        nextPage.disabled = currentPage === totalPages || totalPages === 0;
    }


    /* =========================================
       8. EVENT NAVIGASI HALAMAN
    ========================================= */

    // Berpindah ke halaman sebelumnya
    prevPage.addEventListener("click", function () {

        if (currentPage > 1) {
            currentPage--;
            renderHistory();
        }
    });

    // Berpindah ke halaman berikutnya
    nextPage.addEventListener("click", function () {

        currentPage++;
        renderHistory();
    });


    /* =========================================
       9. EVENT PENCARIAN DAN FILTER TANGGAL
    ========================================= */

    // Memperbarui riwayat ketika pengguna mengetik kata kunci
    historySearch.addEventListener("input", function () {

        // Mengembalikan halaman ke halaman pertama
        currentPage = 1;
        renderHistory();
    });

    // Memperbarui riwayat ketika pengguna mengubah filter tanggal
    dateFilter.addEventListener("change", function () {

        // Mengembalikan halaman ke halaman pertama
        currentPage = 1;
        renderHistory();
    });


    /* =========================================
       10. TAMPILAN AWAL RIWAYAT
    ========================================= */

    // Menampilkan data riwayat ketika halaman pertama kali dibuka
    renderHistory();
}
