# DristiAI

DristiAI is a Flask web application for AI-assisted diabetic retinopathy screening. A health worker can register/login, add patients, upload fundus images, run the trained AI model, view the DR grade and confidence, see a Grad-CAM heatmap, and save the screening report.

The project is split into separate backend and frontend folders:

```text
DristiAI-main/
├── backend/
│   ├── app.py
│   ├── best_model.pth
│   ├── inference.py
│   ├── requirements.txt
│   ├── routes/
│   ├── models/
│   ├── utils/
│   └── instance/
├── frontend/
│   ├── templates/
│   └── static/
├── index.html
└── README.md
```

## How The Project Works

The backend is a Flask app. It creates the web server, database tables, login/session handling, API routes, and model prediction route.

The frontend files live in `frontend/templates` and `frontend/static`, but they are served by Flask. Do not open template files directly in the browser, because raw files cannot process Jinja variables like `{{ patient_id }}` or Flask helpers like `url_for(...)`.

The AI model files live beside the Flask entry point:

```text
backend/app.py
backend/best_model.pth
backend/inference.py
```

`backend/app.py` imports the model helpers:

```python
from inference import load_model, predict
```

Then it loads the model once at startup:

```python
model = load_model(os.path.join(BASE_DIR, "best_model.pth"))
```

This is important because loading the model inside a route would reload it on every request and make prediction very slow.

## Main Features

- User registration and login
- Role-based access for admin, doctor, and health worker users
- Patient creation and patient list
- Fundus image upload
- Image quality check in the browser
- AI prediction using `best_model.pth`
- DR grade result from 0 to 4
- AI confidence percentage
- Referable/non-referable screening status
- Grad-CAM AI attention heatmap
- Saved screening report
- Report page with patient details, metrics, explanation, model version, and heatmap

## Install And Run

Open a terminal in the project folder:

```bash
cd /Users/abhishekdutta/Downloads/DristiAI-main
```

Go into the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on macOS/Linux:

```bash
source .venv/bin/activate
```

Install the Flask/backend packages:

```bash
pip install -r requirements.txt
```

Install the AI/model packages:

```bash
pip install torch torchvision pillow "numpy<2" "opencv-python-headless==4.10.0.84" grad-cam
```

Run the Flask app:

```bash
python app.py
```

Open the app in a browser:

```text
http://127.0.0.1:5000
```

## Important Browser Note

Always open the app using:

```text
http://127.0.0.1:5000
```

Do not open files from `frontend/templates` directly. If you open a template directly, the page will look like raw HTML and CSS/JS may not load correctly.

If you want to double-click something, use:

```text
index.html
```

The root `index.html` redirects to the Flask app at `http://127.0.0.1:5000`.

## Login

A default admin user is seeded automatically if no admin exists:

```text
Email: admin@example.com
Password: admin1234
```

You can also register a user from the register page. Health worker users can add patients and create screenings.

## Screening Workflow

1. Start the backend with `python app.py`.
2. Open `http://127.0.0.1:5000`.
3. Login as a health worker.
4. Create or open a patient.
5. Click/start a new screening.
6. Upload a fundus image.
7. Click `Analyze Image`.
8. The frontend sends the image to `/predict`.
9. Flask calls `predict()` from `inference.py` using the already-loaded model.
10. The result shows DR grade, confidence, referral status, explanation, and Grad-CAM heatmap.
11. Click `Save Screening`.
12. The saved report page shows the same AI metrics and heatmap.

Example screening page:

```text
http://127.0.0.1:5000/health-worker/patients/P-000001/screening/new
```

Example report page:

```text
http://127.0.0.1:5000/health-worker/patients/P-000001/screening/1
```

## Important API Routes

Prediction route:

```text
POST /predict
```

Expected form field:

```text
image=<uploaded image file>
```

Example response:

```json
{
  "severity": 2,
  "severity_label": "Moderate",
  "confidence": 0.9134,
  "heatmap_base64": "..."
}
```

Create screening:

```text
POST /api/screenings
```

Get screening report data:

```text
GET /api/screenings/<screening_id>
```

Get patient:

```text
GET /api/patients/<patient_id>
```

## Model Output Meaning

The model predicts one of five diabetic retinopathy grades:

```text
0 = No DR
1 = Mild
2 = Moderate
3 = Severe
4 = Proliferative DR
```

Referable screening is currently calculated as:

```text
DR grade >= 2
```

The Grad-CAM heatmap shows which image regions influenced the model prediction. Red/yellow areas are the strongest attention areas; blue/purple areas are lower-attention areas.

## Key Files

Backend entry point:

```text
backend/app.py
```

Model helper:

```text
backend/inference.py
```

Trained model checkpoint:

```text
backend/best_model.pth
```

Screening backend routes:

```text
backend/routes/screenings.py
```

Patient backend routes:

```text
backend/routes/patients.py
```

Dashboard/page routes:

```text
backend/routes/dashboards.py
```

New screening frontend page:

```text
frontend/templates/health_worker/new_screening.html
```

New screening JavaScript:

```text
frontend/static/js/new_screening.js
```

Screening report page:

```text
frontend/templates/health_worker/screening_report.html
```

Screening report JavaScript:

```text
frontend/static/js/screening_report.js
```

CSS files:

```text
frontend/static/css/
```

Uploaded screening images:

```text
frontend/static/uploads/screenings/
```

SQLite database:

```text
backend/instance/app.db
```

## Troubleshooting

If the page looks like raw HTML, you opened a template file directly. Open this instead:

```text
http://127.0.0.1:5000
```

If CSS is not loading, check that Flask is running and test:

```bash
curl -I http://127.0.0.1:5000/static/css/dashboard.css
```

It should return `200 OK`.

If the model file is missing, make sure this file exists:

```text
backend/best_model.pth
```

If prediction fails because of package issues, reinstall the model dependencies:

```bash
pip install torch torchvision pillow "numpy<2" "opencv-python-headless==4.10.0.84" grad-cam
```

If Flask says port 5000 is already in use, stop the other Flask server or change the port in `backend/app.py`.

## Development Checks

Compile Python files:

```bash
python -m compileall backend
```

Check whether Flask can serve CSS:

```bash
curl -I http://127.0.0.1:5000/static/css/dashboard.css
```

Test prediction with an uploaded image:

```bash
curl -F "image=@frontend/static/uploads/screenings/sample.jpg" http://127.0.0.1:5000/predict
```

Replace `sample.jpg` with a real image path that exists in your project.

## Notes

This app is for AI-assisted screening only. The result does not replace examination, diagnosis, or confirmation by a qualified ophthalmologist.
