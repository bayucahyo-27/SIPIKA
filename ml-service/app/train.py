
import json
import joblib
import pandas as pd

from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


# ==========================================
# KONFIGURASI LOKASI FILE
# ==========================================

# Menentukan lokasi dataset, model, dan hasil evaluasi.
BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = BASE_DIR / "dataset" / "dataset_sipika_final_revisi.csv"
MODEL_DIR = BASE_DIR / "models"

MODEL_PATH = MODEL_DIR / "decision_tree_sipika.joblib"
EVALUATION_PATH = MODEL_DIR / "evaluation.json"

# Empat atribut yang digunakan sebagai input klasifikasi.
FEATURES = [
    "jenis_ikan",
    "alat_tangkap",
    "wilayah",
    "musim"
]

# Kolom target yang akan diprediksi.
TARGET = "tingkat_produksi"

# Membuat folder models jika belum tersedia.
MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ==========================================
# 1. MEMUAT DAN MENYIAPKAN DATASET
# ==========================================

def load_dataset():
    """Membaca dataset dan memisahkan fitur dengan target."""

    # Membaca dataset CSV.
    df = pd.read_csv(DATASET_PATH)

    # Membersihkan nama kolom dan memeriksa kelengkapannya.
    df.columns = df.columns.str.strip()

    required_columns = FEATURES + [TARGET]

    missing_columns = [
        col for col in required_columns
        if col not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Kolom tidak ditemukan: {missing_columns}"
        )

    # Menghapus data kosong agar tidak mengganggu proses training.
    df = df.dropna(subset=required_columns)

    # X berisi atribut input, sedangkan y berisi kelas produksi.
    X = df[FEATURES]
    y = df[TARGET]

    print(f"Jumlah data: {len(df)}")
    print("\nDistribusi kelas:")
    print(y.value_counts())

    return X, y


# ==========================================
# 2. MEMBAGI DATA TRAINING DAN TESTING
# ==========================================

def split_dataset(X, y):
    """Membagi dataset menjadi 80% training dan 20% testing."""

    return train_test_split(
        X,
        y,
        test_size=0.2,       # 20% data digunakan untuk pengujian.
        random_state=42,     # Menjaga hasil pembagian tetap konsisten.
        stratify=y           # Menjaga proporsi setiap kelas.
    )


# ==========================================
# 3. MEMBANGUN MODEL DECISION TREE
# ==========================================

def build_model():
    """Membuat pipeline preprocessing dan algoritma Decision Tree."""

    # Mengubah data kategorikal menjadi format numerik.
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                FEATURES
            )
        ]
    )

    # Menggabungkan preprocessing dengan algoritma Decision Tree.
    model = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "classifier",
                DecisionTreeClassifier(
                    criterion="entropy",  # Menggunakan Entropy untuk pemilihan cabang.
                    max_depth=5,          # Membatasi kedalaman pohon maksimal 5.
                    random_state=42
                )
            )
        ]
    )

    return model


# ==========================================
# 4. MELATIH MODEL
# ==========================================

def train_model(model, X_train, y_train):
    """Melatih model menggunakan data training."""

    # fit() menjalankan proses pembelajaran berdasarkan data training.
    model.fit(X_train, y_train)

    print("\nTraining Decision Tree berhasil!")

    return model


# ==========================================
# 5. MELAKUKAN EVALUASI MODEL
# ==========================================

def evaluate_model(model, X_test, y_test):
    """Mengukur performa model menggunakan data testing."""

    # Membuat prediksi berdasarkan data testing.
    y_pred = model.predict(X_test)

    # Menghitung persentase prediksi yang benar.
    accuracy = accuracy_score(y_test, y_pred)

    # Menghitung precision, recall, dan F1-score.
    report = classification_report(
        y_test,
        y_pred,
        output_dict=True,
        zero_division=0
    )

    # Membandingkan kelas aktual dengan hasil prediksi.
    matrix = confusion_matrix(
        y_test,
        y_pred,
        labels=["Rendah", "Sedang", "Tinggi"]
    )

    print("\n========== HASIL EVALUASI ==========")
    print(f"Akurasi: {accuracy * 100:.2f}%")

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            y_pred,
            zero_division=0
        )
    )

    print("Confusion Matrix:")
    print(matrix)

    return {
        "accuracy": float(accuracy),
        "classification_report": report,
        "confusion_matrix": matrix.tolist()
    }


# ==========================================
# 6. MENYIMPAN MODEL DAN HASIL EVALUASI
# ==========================================

def save_results(model, evaluation, total_data, training_data, testing_data):
    """Menyimpan model terlatih dan hasil evaluasinya."""

    # Menyimpan model agar dapat digunakan kembali untuk prediksi.
    joblib.dump(model, MODEL_PATH)

    evaluation_data = {
        "algorithm": "Decision Tree",
        "criterion": "entropy",
        "max_depth": 5,
        "total_data": total_data,
        "training_data": training_data,
        "testing_data": testing_data,
        **evaluation
    }

    # Menyimpan informasi evaluasi dalam format JSON.
    with open(EVALUATION_PATH, "w", encoding="utf-8") as file:
        json.dump(
            evaluation_data,
            file,
            indent=4,
            ensure_ascii=False
        )

    print("\nModel dan hasil evaluasi berhasil disimpan.")
    print(f"Lokasi model: {MODEL_PATH}")
    print(f"Lokasi evaluasi: {EVALUATION_PATH}")


# ==========================================
# 7. MENJALANKAN SELURUH PROSES TRAINING
# ==========================================

def main():
    """Menjalankan seluruh tahapan training Decision Tree SIPIKA."""

    print("Memulai proses training SIPIKA...")

    # Memuat dataset dan memisahkan fitur dengan target.
    X, y = load_dataset()

    # Membagi data menjadi training dan testing.
    X_train, X_test, y_train, y_test = split_dataset(X, y)

    # Membangun dan melatih model Decision Tree.
    model = build_model()
    model = train_model(model, X_train, y_train)

    # Mengevaluasi hasil prediksi model.
    evaluation = evaluate_model(model, X_test, y_test)

    # Menyimpan model dan hasil evaluasi.
    save_results(
        model,
        evaluation,
        len(X),
        len(X_train),
        len(X_test)
    )

    print("\nProses training SIPIKA selesai!")


if __name__ == "__main__":
    main()
