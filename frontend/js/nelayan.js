
/* =========================================
   FITUR KLASIFIKASI NELAYAN
   MENGGUNAKAN ALGORITMA DECISION TREE
========================================= */

// Mengambil elemen-elemen pada halaman klasifikasi
const classificationForm = document.getElementById("classificationForm");
const resultPlaceholder = document.getElementById("resultPlaceholder");
const resultContent = document.getElementById("resultContent");

const productionLevel = document.getElementById("productionLevel");
const conclusionText = document.getElementById("conclusionText");
const suggestionText = document.getElementById("suggestionText");

// Menjalankan proses klasifikasi ketika form dikirim
if (classificationForm) {

    classificationForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const classifyButton = classificationForm.querySelector(
            'button[type="submit"]'
        );

        const originalButtonText = classifyButton.innerHTML;

        // Mengambil nilai dari empat atribut klasifikasi
        const data = {
            jenis_ikan: document.getElementById("jenisIkan").value,
            alat_tangkap: document.getElementById("alatTangkap").value,
            wilayah: document.getElementById("wilayah").value,
            musim: document.getElementById("musim").value
        };

        // Mengubah tombol menjadi kondisi loading
        classifyButton.disabled = true;
        classifyButton.innerHTML = `
            <i data-lucide="loader-circle" class="loading-icon"></i>
            Memproses...
        `;

        lucide.createIcons();

        try {
            // Mengirim data klasifikasi ke backend PHP
            const response = await fetch("/SIPIKA/backend/prediction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // Memeriksa apakah proses prediksi berhasil
            if (!response.ok || result.status !== "success") {
                throw new Error(
                    result.message || result.detail || "Prediksi gagal dilakukan."
                );
            }

            const hasilKlasifikasi = result.hasil_klasifikasi;
            const tingkatKepercayaan = result.tingkat_kepercayaan;

            // Mengubah warna tampilan berdasarkan hasil klasifikasi
            const productionResult = document.querySelector(".production-result");

            productionResult.classList.remove("high", "medium", "low");

            if (hasilKlasifikasi === "Tinggi") {
                productionResult.classList.add("high");
            } else if (hasilKlasifikasi === "Sedang") {
                productionResult.classList.add("medium");
            } else if (hasilKlasifikasi === "Rendah") {
                productionResult.classList.add("low");
            }

            // Riwayat prediksi sudah otomatis disimpan ke database MySQL
            // melalui PredictionController.php

            // Menampilkan hasil prediksi Decision Tree
            productionLevel.textContent = hasilKlasifikasi;

            const kesimpulan = {
                "Tinggi": `Berdasarkan data yang dimasukkan, ikan ${data.jenis_ikan}
                yang ditangkap menggunakan ${data.alat_tangkap} di wilayah ${data.wilayah}
                pada musim ${data.musim} diprediksi memiliki tingkat produksi TINGGI.
                Hasil ini menunjukkan potensi produksi tangkapan yang relatif besar
                dengan tingkat kepercayaan ${tingkatKepercayaan}%.`,

                "Sedang": `Berdasarkan data yang dimasukkan, ikan ${data.jenis_ikan}
                yang ditangkap menggunakan ${data.alat_tangkap} di wilayah ${data.wilayah}
                pada musim ${data.musim} diprediksi memiliki tingkat produksi SEDANG.
                Hasil ini menunjukkan potensi produksi tangkapan yang berada pada
                tingkat menengah dengan tingkat kepercayaan ${tingkatKepercayaan}%.`,

                "Rendah": `Berdasarkan data yang dimasukkan, ikan ${data.jenis_ikan}
                yang ditangkap menggunakan ${data.alat_tangkap} di wilayah ${data.wilayah}
                pada musim ${data.musim} diprediksi memiliki tingkat produksi RENDAH.
                Hasil ini menunjukkan potensi produksi tangkapan yang relatif kecil
                dengan tingkat kepercayaan ${tingkatKepercayaan}%.`
            };

            const saran = {
                "Tinggi": "Pertahankan strategi penangkapan yang digunakan. Tetap perhatikan kondisi cuaca, keselamatan saat melaut, serta ketentuan pengelolaan sumber daya perikanan.",

                "Sedang": "Evaluasi waktu dan lokasi penangkapan serta perhatikan kondisi cuaca dan ketersediaan ikan. Nelayan juga dapat mempertimbangkan penggunaan alat tangkap yang sesuai.",

                "Rendah": "Pertimbangkan untuk mengevaluasi lokasi dan waktu penangkapan. Perhatikan informasi cuaca dan kondisi perairan sebelum melaut serta hindari penangkapan secara berlebihan."
            };

            conclusionText.textContent = kesimpulan[hasilKlasifikasi];
            suggestionText.textContent = saran[hasilKlasifikasi];

            // Memperlihatkan hasil klasifikasi
            resultPlaceholder.hidden = true;
            resultContent.hidden = false;

            lucide.createIcons();

        } catch (error) {
            alert("Terjadi kesalahan: " + error.message);

        } finally {
            // Mengembalikan tombol ke kondisi awal
            classifyButton.disabled = false;
            classifyButton.innerHTML = originalButtonText;

            lucide.createIcons();
        }
    });

    // Mengatur ulang tampilan ketika tombol reset ditekan
    classificationForm.addEventListener("reset", function () {
        resultContent.hidden = true;
        resultPlaceholder.hidden = false;

        // Menghapus warna hasil klasifikasi sebelumnya
        const productionResult = document.querySelector(".production-result");

        productionResult.classList.remove("high", "medium", "low");
    });
}


/* =========================================
   FITUR RIWAYAT KLASIFIKASI NELAYAN
   TERINTEGRASI DENGAN DATABASE MYSQL
========================================= */

// Mengambil elemen-elemen HTML pada halaman riwayat
const historyTableBody = document.getElementById("historyTableBody");
const historySearch = document.getElementById("historySearch");
const dateFilter = document.getElementById("dateFilter");
const pageNumbers = document.getElementById("pageNumbers");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");

// Menjalankan fitur hanya pada halaman Riwayat
if (historyTableBody && historySearch && dateFilter) {

    // Menyimpan data riwayat dari database
    let historyData = [];

    // Pengaturan pagination
    const rowsPerPage = 10;
    let currentPage = 1;

    // Mengubah tanggal database menjadi format YYYY-MM-DD
    function getHistoryDate(dateTime) {
        return dateTime ? dateTime.split(" ")[0] : "";
    }

    // Mengubah format tanggal menjadi format Indonesia
    function formatDate(date) {
        if (!date) return "-";

        const [year, month, day] = date.split("-");

        const months = [
            "Januari", "Februari", "Maret", "April",
            "Mei", "Juni", "Juli", "Agustus",
            "September", "Oktober", "November", "Desember"
        ];

        return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
    }

    // Mengambil waktu dari created_at
    function formatTime(dateTime) {
        if (!dateTime) return "-";

        const parts = dateTime.split(" ");
        return parts[1] ? parts[1].substring(0, 5) : "-";
    }

    // Membuat pilihan filter bulan berdasarkan data database
    function populateDateFilter() {

        const months = [
            "Januari", "Februari", "Maret", "April",
            "Mei", "Juni", "Juli", "Agustus",
            "September", "Oktober", "November", "Desember"
        ];

        const uniqueMonths = [
            ...new Set(
                historyData.map(item =>
                    getHistoryDate(item.created_at).slice(0, 7)
                ).filter(Boolean)
            )
        ].sort((a, b) => b.localeCompare(a));

        dateFilter.innerHTML =
            '<option value="all">Semua Tanggal</option>';

        uniqueMonths.forEach(month => {

            const [year, monthNumber] = month.split("-");

            const option = document.createElement("option");
            option.value = month;
            option.textContent =
                `${months[Number(monthNumber) - 1]} ${year}`;

            dateFilter.appendChild(option);
        });
    }

    // Menampilkan data riwayat ke tabel
    function renderHistory() {

        const keyword = historySearch.value.toLowerCase().trim();
        const selectedDate = dateFilter.value;

        // Filter pencarian dan tanggal
        const filteredData = historyData.filter(item => {

            const searchable = `
                ${item.jenis_ikan}
                ${item.alat_tangkap}
                ${item.wilayah}
                ${item.musim}
                ${item.hasil_klasifikasi}
            `.toLowerCase();

            const itemDate = getHistoryDate(item.created_at);

            const matchesSearch = searchable.includes(keyword);

            const matchesDate =
                selectedDate === "all" ||
                itemDate.startsWith(selectedDate);

            return matchesSearch && matchesDate;
        });

        // Menghitung jumlah halaman
        const totalPages = Math.ceil(
            filteredData.length / rowsPerPage
        );

        currentPage = Math.min(
            currentPage,
            Math.max(totalPages, 1)
        );

        const start = (currentPage - 1) * rowsPerPage;

        const pageData = filteredData.slice(
            start,
            start + rowsPerPage
        );

        historyTableBody.innerHTML = "";

        // Jika data tidak ditemukan
        if (pageData.length === 0) {

            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="padding:30px; text-align:center;">
                        Tidak ada data riwayat ditemukan.
                    </td>
                </tr>
            `;

        } else {

            // Menampilkan setiap riwayat prediksi
            pageData.forEach((item, index) => {

                const badgeClass =
                    item.hasil_klasifikasi === "Tinggi" ? "high" :
                        item.hasil_klasifikasi === "Sedang" ? "medium" : "low";

                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${start + index + 1}</td>
                    <td>
                        ${formatDate(getHistoryDate(item.created_at))},
                        <br>${formatTime(item.created_at)}
                    </td>
                    <td>${item.jenis_ikan}</td>
                    <td>${item.alat_tangkap}</td>
                    <td>${item.wilayah}</td>
                    <td>${item.musim}</td>
                    <td>
                        <span class="history-badge ${badgeClass}">
                            ${item.hasil_klasifikasi}
                        </span>
                    </td>
                    <td>
                        <a href="detail-prediksi.html?id=${item.id}"
                           class="history-detail-button">
                            Detail
                        </a>
                    </td>
                `;

                historyTableBody.appendChild(row);
            });
        }

        renderPagination(totalPages);
    }

    // Mengatur tombol pagination
    function renderPagination(totalPages) {

        pageNumbers.innerHTML = "";

        for (let page = 1; page <= totalPages; page++) {

            const button = document.createElement("button");

            button.type = "button";
            button.className = "page-button";
            button.textContent = page;

            if (page === currentPage) {
                button.classList.add("active");
                button.setAttribute("aria-current", "page");
            }

            button.addEventListener("click", function () {
                currentPage = page;
                renderHistory();
            });

            pageNumbers.appendChild(button);
        }

        prevPage.disabled = currentPage === 1;
        nextPage.disabled =
            currentPage === totalPages || totalPages === 0;
    }

    // Navigasi halaman sebelumnya
    prevPage.addEventListener("click", function () {

        if (currentPage > 1) {
            currentPage--;
            renderHistory();
        }
    });

    // Navigasi halaman berikutnya
    nextPage.addEventListener("click", function () {

        currentPage++;
        renderHistory();
    });

    // Pencarian riwayat
    historySearch.addEventListener("input", function () {
        currentPage = 1;
        renderHistory();
    });

    // Filter berdasarkan bulan
    dateFilter.addEventListener("change", function () {
        currentPage = 1;
        renderHistory();
    });

    // Mengambil riwayat dari database MySQL
    async function loadHistory() {

        historyTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="padding:30px; text-align:center;">
                    Memuat data riwayat...
                </td>
            </tr>
        `;

        try {

            const response = await fetch(
                "/SIPIKA/backend/predictions",
                {
                    method: "GET",
                    credentials: "same-origin"
                }
            );

            const result = await response.json();

            if (!response.ok || result.status !== "success") {
                throw new Error(
                    result.message || "Gagal mengambil riwayat prediksi."
                );
            }

            historyData = Array.isArray(result.data)
                ? result.data
                : [];

            populateDateFilter();

            currentPage = 1;
            renderHistory();

        } catch (error) {

            console.error("Kesalahan mengambil riwayat:", error);

            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="padding:30px; text-align:center;">
                        Gagal memuat riwayat prediksi.
                    </td>
                </tr>
            `;
        }
    }

    // Memuat riwayat ketika halaman dibuka
    loadHistory();
}

/* =========================================
   FITUR PROFIL NELAYAN
   TERINTEGRASI DENGAN DATABASE MYSQL
========================================= */

// Mengambil elemen halaman profil
const profileForm = document.getElementById("profileForm");
const fullNameInput = document.getElementById("fullName");
const profileDisplayName = document.getElementById("profileDisplayName");
const profileDisplayFullName = document.getElementById("profileDisplayFullName");
const profileDisplayEmail = document.getElementById("profileDisplayEmail");
const profileEmailInput = document.getElementById("profileEmail");
const cancelProfileButton = document.getElementById("cancelProfileButton");

const profileImage = document.getElementById("profileImage");
const profileCameraButton = document.getElementById("profileCameraButton");
const profileImageInput = document.getElementById("profileImageInput");

// Elemen nama pengguna pada seluruh halaman Nelayan
const accountNames = document.querySelectorAll(".account-name");
const welcomeUserName = document.getElementById("welcomeUserName");

// Menyimpan data profil yang sedang aktif
let currentProfile = null;


// ==========================================
// MEMPERBARUI TAMPILAN NAMA
// ==========================================
function updateProfileName(name) {

    accountNames.forEach(element => {
        element.textContent = `Nelayan: ${name}`;
    });

    if (welcomeUserName) {
        welcomeUserName.textContent = `${name}!`;
    }

    if (profileDisplayName) {
        profileDisplayName.textContent = name;
    }

    if (profileDisplayFullName) {
        profileDisplayFullName.textContent = name;
    }

    if (fullNameInput) {
        fullNameInput.value = name;
    }
}


// ==========================================
// MEMPERBARUI TAMPILAN EMAIL
// ==========================================
function updateProfileEmail(email) {

    if (profileDisplayEmail) {
        profileDisplayEmail.textContent = email || "-";
    }

    if (profileEmailInput) {
        profileEmailInput.value = email || "";
    }
}


// ==========================================
// MENGAMBIL PROFIL DARI DATABASE
// ==========================================
async function loadProfile() {

    try {

        const response = await fetch("/SIPIKA/backend/profile", {
            method: "GET",
            credentials: "same-origin"
        });

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
            console.error("Gagal mengambil profil:", result.message);
            return;
        }

        currentProfile = result.data;

        // Memperbarui nama dan email
        updateProfileName(currentProfile.nama_lengkap || "");
        updateProfileEmail(currentProfile.email || "");

        // Menampilkan foto profil dari server
        if (currentProfile.foto_profil) {

            const photoUrl =
                "/SIPIKA/backend/" +
                currentProfile.foto_profil +
                "?t=" + Date.now();

            // Foto pada halaman Profil
            if (profileImage) {
                profileImage.src = photoUrl;
            }

            // Foto pada header seluruh halaman Nelayan
            document.querySelectorAll(".account-icon").forEach(image => {
                image.src = photoUrl;
                image.alt = "Foto profil Nelayan";
            });
        }

    } catch (error) {
        console.error("Kesalahan mengambil profil:", error);
    }
}


// Mengambil profil ketika halaman dibuka
loadProfile();


// ==========================================
// MENYIMPAN PERUBAHAN NAMA PROFIL
// ==========================================
if (profileForm) {

    profileForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const newName = fullNameInput.value.trim();

        if (!newName) {
            alert("Nama lengkap tidak boleh kosong!");
            return;
        }

        const saveButton = profileForm.querySelector(
            'button[type="submit"]'
        );

        const originalButtonText = saveButton.innerHTML;

        saveButton.disabled = true;
        saveButton.textContent = "Menyimpan...";

        try {

            const response = await fetch("/SIPIKA/backend/profile", {
                method: "PUT",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nama_lengkap: newName
                })
            });

            const result = await response.json();

            if (!response.ok || result.status !== "success") {
                throw new Error(result.message || "Gagal memperbarui profil.");
            }

            // Memperbarui tampilan setelah database berhasil diperbarui
            currentProfile.nama_lengkap = newName;
            updateProfileName(newName);

            alert("Profil berhasil diperbarui!");

        } catch (error) {

            alert("Terjadi kesalahan: " + error.message);

        } finally {

            saveButton.disabled = false;
            saveButton.innerHTML = originalButtonText;

        }
    });


    // Membatalkan perubahan nama
    if (cancelProfileButton) {

        cancelProfileButton.addEventListener("click", function () {

            if (currentProfile) {
                updateProfileName(currentProfile.nama_lengkap || "");
            }

        });
    }
}

// ==========================================
// MEMBUKA PILIHAN FOTO PROFIL
// ==========================================
if (profileCameraButton && profileImageInput) {

    profileCameraButton.addEventListener("click", function () {
        profileImageInput.click();
    });
}


// ==========================================
// MENGUNGGAH FOTO KE SERVER
// ==========================================
if (profileImageInput) {

    profileImageInput.addEventListener("change", async function () {

        const file = this.files[0];

        if (!file) return;

        // Memeriksa ukuran foto
        if (file.size > 5 * 1024 * 1024) {
            alert("Ukuran foto maksimal 5 MB!");
            this.value = "";
            return;
        }

        // Memeriksa format foto
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Format foto harus JPG, PNG, atau WEBP!");
            this.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("foto", file);

        try {

            const response = await fetch("/SIPIKA/backend/profile/photo", {
                method: "POST",
                credentials: "same-origin",
                body: formData
            });

            const result = await response.json();

            if (!response.ok || result.status !== "success") {
                throw new Error(result.message || "Gagal mengunggah foto.");
            }


            // Memperbarui foto profil dari server
            const photoUrl = result.data.foto_profil + "?t=" + Date.now();

            // Memperbarui foto pada halaman Profil
            if (profileImage) {
                profileImage.src = photoUrl;
            }

            // Memperbarui seluruh ikon akun pada header
            document.querySelectorAll(".account-icon").forEach(image => {
                image.src = photoUrl;
                image.alt = "Foto profil Nelayan";
            });

            // Memperbarui data profil aktif
            if (currentProfile) {
                currentProfile.foto_profil =
                    result.data.foto_profil.replace("/SIPIKA/backend/", "");
            }


            alert("Foto profil berhasil diperbarui!");

        } catch (error) {

            alert("Terjadi kesalahan: " + error.message);

        } finally {

            this.value = "";

        }
    });
}


/* =========================================
   FITUR DETAIL PREDIKSI NELAYAN
   TERINTEGRASI DENGAN DATABASE MYSQL
========================================= */

// Mengambil elemen halaman detail
const detailFish = document.getElementById("detailFish");
const detailDate = document.getElementById("detailDate");
const detailRegion = document.getElementById("detailRegion");
const detailGear = document.getElementById("detailGear");
const detailSeason = document.getElementById("detailSeason");

const detailResult = document.getElementById("detailResult");
const detailResultDescription = document.getElementById("detailResultDescription");
const detailConclusion = document.getElementById("detailConclusion");
const detailSuggestion = document.getElementById("detailSuggestion");

// Menjalankan fitur hanya pada halaman Detail Prediksi
if (detailFish) {

    // Mengambil ID prediksi dari URL
    const params = new URLSearchParams(window.location.search);
    const predictionId = params.get("id");

    // Menampilkan data detail dari database
    async function loadPredictionDetail() {

        try {

            // Memeriksa ID prediksi
            if (!predictionId || !/^[0-9]+$/.test(predictionId)) {
                throw new Error("ID prediksi tidak valid.");
            }

            const response = await fetch(
                `/SIPIKA/backend/predictions/${predictionId}`,
                {
                    method: "GET",
                    credentials: "same-origin"
                }
            );

            const result = await response.json();

            if (!response.ok || result.status !== "success") {
                throw new Error(
                    result.message || "Gagal mengambil detail prediksi."
                );
            }

            const item = result.data;

            // Mengambil tanggal dan waktu prediksi
            const dateOnly = item.created_at
                ? item.created_at.split(" ")[0]
                : "";

            const timeOnly = item.created_at
                ? item.created_at.split(" ")[1]?.substring(0, 5) || ""
                : "";

            // Menampilkan informasi prediksi
            detailFish.textContent = item.jenis_ikan || "-";

            detailDate.textContent = dateOnly
                ? `${formatDetailDate(dateOnly)}, ${timeOnly}`
                : "-";

            detailRegion.textContent = item.wilayah || "-";
            detailGear.textContent = item.alat_tangkap || "-";
            detailSeason.textContent = item.musim || "-";

            // Menampilkan hasil klasifikasi
            const classification = item.hasil_klasifikasi || "-";

            detailResult.textContent = classification;

            detailResultDescription.textContent =
                `Tingkat produksi ikan tangkapan diprediksi dalam kategori ${classification.toLowerCase()}.`;

            // Menyiapkan kesimpulan jika belum tersimpan di database
            const conclusionTemplates = {
                "Tinggi":
                    `Berdasarkan data yang dimasukkan, ikan ${item.jenis_ikan} yang ditangkap menggunakan ${item.alat_tangkap} di wilayah ${item.wilayah} pada musim ${item.musim} diprediksi memiliki tingkat produksi TINGGI. Hasil ini menunjukkan potensi produksi tangkapan yang relatif besar.`,

                "Sedang":
                    `Berdasarkan data yang dimasukkan, ikan ${item.jenis_ikan} yang ditangkap menggunakan ${item.alat_tangkap} di wilayah ${item.wilayah} pada musim ${item.musim} diprediksi memiliki tingkat produksi SEDANG. Hasil ini menunjukkan potensi produksi tangkapan yang berada pada tingkat menengah.`,

                "Rendah":
                    `Berdasarkan data yang dimasukkan, ikan ${item.jenis_ikan} yang ditangkap menggunakan ${item.alat_tangkap} di wilayah ${item.wilayah} pada musim ${item.musim} diprediksi memiliki tingkat produksi RENDAH. Hasil ini menunjukkan potensi produksi tangkapan yang relatif kecil.`
            };

            // Menyiapkan saran berdasarkan hasil klasifikasi
            const suggestionTemplates = {
                "Tinggi":
                    "Pertahankan strategi penangkapan yang digunakan. Tetap perhatikan kondisi cuaca, keselamatan saat melaut, serta ketentuan pengelolaan sumber daya perikanan.",

                "Sedang":
                    "Evaluasi waktu dan lokasi penangkapan serta perhatikan kondisi cuaca dan ketersediaan ikan. Nelayan juga dapat mempertimbangkan penggunaan alat tangkap yang sesuai.",

                "Rendah":
                    "Pertimbangkan untuk mengevaluasi lokasi dan waktu penangkapan. Perhatikan informasi cuaca dan kondisi perairan sebelum melaut serta hindari penangkapan secara berlebihan."
            };

            // Mengutamakan kesimpulan dan saran dari database
            detailConclusion.textContent =
                item.kesimpulan || conclusionTemplates[classification] || "Informasi kesimpulan tidak tersedia.";

            detailSuggestion.textContent =
                item.saran || suggestionTemplates[classification] || "Informasi saran tidak tersedia.";

        } catch (error) {

            console.error("Kesalahan mengambil detail prediksi:", error);

            detailFish.textContent = "Data tidak ditemukan";
            detailDate.textContent = "-";
            detailRegion.textContent = "-";
            detailGear.textContent = "-";
            detailSeason.textContent = "-";
            detailResult.textContent = "-";

            detailResultDescription.textContent =
                "Data prediksi tidak ditemukan. Silakan kembali ke halaman riwayat.";

            detailConclusion.textContent =
                error.message;

            detailSuggestion.textContent =
                "Silakan kembali ke halaman riwayat prediksi.";
        }
    }

    // Memuat detail ketika halaman dibuka
    loadPredictionDetail();
}

// Mengubah format tanggal untuk halaman detail
function formatDetailDate(date) {
    const [year, month, day] = date.split("-");

    const months = [
        "Januari", "Februari", "Maret", "April",
        "Mei", "Juni", "Juli", "Agustus",
        "September", "Oktober", "November", "Desember"
    ];

    return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
}

/* =========================================
   FITUR LOGOUT NELAYAN
   MENGAKHIRI SESI PENGGUNA
========================================= */

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", async function (event) {

        event.preventDefault();

        const confirmation = confirm(
            "Apakah Anda yakin ingin keluar dari akun SIPIKA?"
        );

        if (!confirmation) return;

        logoutButton.style.pointerEvents = "none";
        logoutButton.style.opacity = "0.6";

        try {

            const response = await fetch(
                "/SIPIKA/backend/auth/logout",
                {
                    method: "POST",
                    credentials: "same-origin"
                }
            );

            const result = await response.json();

            if (!response.ok || result.status !== "success") {
                throw new Error(
                    result.message || "Logout gagal dilakukan."
                );
            }

            // Mengarahkan pengguna ke halaman login
            window.location.href =
                "/SIPIKA/frontend/pages/auth/login.html";

        } catch (error) {

            alert("Terjadi kesalahan: " + error.message);

            logoutButton.style.pointerEvents = "auto";
            logoutButton.style.opacity = "1";
        }
    });
}
