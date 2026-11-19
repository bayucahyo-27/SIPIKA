import joblib
import pandas as pd

from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# ==========================================
# KONFIGURASI APLIKASI DAN MODEL
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "decision_tree_sipika.joblib"

app = FastAPI(
    title="SIPIKA Machine Learning API",
    description="API klasifikasi tingkat produksi ikan menggunakan Decision Tree",
    version="1.0.0"
)

# Memuat model yang sudah dilatih sebelumnya
if not MODEL_PATH.exists():
    raise FileNotFoundError(
        "Model Decision Tree belum tersedia. Jalankan train.py terlebih dahulu."
    )

model = joblib.load(MODEL_PATH)


# ==========================================
# 1. FORMAT INPUT PREDIKSI
# ==========================================

class PredictionInput(BaseModel):
    """Mendefinisikan empat atribut yang dibutuhkan untuk prediksi."""

    jenis_ikan: str
    alat_tangkap: str
    wilayah: str
    musim: str


# ==========================================
# 2. ENDPOINT BERANDA API
# ==========================================

@app.get("/")
def home():
    """Menampilkan informasi bahwa API SIPIKA aktif."""

    return {
        "status": "success",
        "message": "Machine Learning API SIPIKA aktif.",
        "algorithm": "Decision Tree"
    }


# ==========================================
# 3. ENDPOINT STATUS MODEL
# ==========================================

@app.get("/health")
def health_check():
    """Memeriksa kesiapan model untuk melakukan prediksi."""

    return {
        "status": "success",
        "model_loaded": model is not None,
        "model": "decision_tree_sipika.joblib"
    }


# ==========================================
# 4. ENDPOINT PREDIKSI
# ==========================================


@app.post("/predict")
def predict(data: PredictionInput):
    """Memprediksi tingkat produksi berdasarkan empat atribut."""

    try:
        # Mengubah input menjadi DataFrame agar sesuai dengan format training
        input_data = pd.DataFrame([{
            "jenis_ikan": data.jenis_ikan,
            "alat_tangkap": data.alat_tangkap,
            "wilayah": data.wilayah,
            "musim": data.musim
        }])

        # Melakukan prediksi dan menghitung probabilitas setiap kelas
        prediction = model.predict(input_data)[0]
        probabilities = model.predict_proba(input_data)[0]

        classifier = model.named_steps["classifier"]
        classes = classifier.classes_

        confidence = max(probabilities) * 100

        return {
            "status": "success",
            "hasil_klasifikasi": str(prediction),
            "tingkat_kepercayaan": round(float(confidence), 2),
            "probabilitas": {
                str(label): round(float(probability) * 100, 2)
                for label, probability in zip(classes, probabilities)
            }
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Terjadi kesalahan saat melakukan prediksi: {str(error)}"
        )
