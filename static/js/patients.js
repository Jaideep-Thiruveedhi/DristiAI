// ============================================================
// LOAD CURRENT USER
// ============================================================

async function loadCurrentUser() {

    try {

        const response = await fetch("/api/auth/me", {
            credentials: "same-origin"
        });

        if (!response.ok) {
            window.location.replace("/api/auth/login-page");
            return;
        }

        const user = await response.json();

        const userName = document.getElementById("userName");

        if (userName) {
            userName.textContent = user.name;
        }

    } catch (error) {

        console.error("Unable to load user:", error);

        window.location.replace("/api/auth/login-page");
    }
}


// ============================================================
// LOAD PATIENTS
// ============================================================

async function loadPatients(search = "") {

    const patientsList =
        document.getElementById("patientsList");

    patientsList.innerHTML = `
        <div class="empty-state">
            <h3>Loading...</h3>
        </div>
    `;

    try {

        const url = search
            ? `/api/patients?q=${encodeURIComponent(search)}`
            : "/api/patients";

        const response = await fetch(url, {
            credentials: "same-origin"
        });

        if (!response.ok) {

            if (response.status === 401) {
                window.location.replace(
                    "/api/auth/login-page"
                );
                return;
            }

            throw new Error("Unable to load patients");
        }

        const data = await response.json();

        displayPatients(data.patients);

    } catch (error) {

        console.error(error);

        patientsList.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load patients</h3>
                <p>Please try again.</p>
            </div>
        `;
    }
}


// ============================================================
// DISPLAY PATIENTS
// ============================================================

function displayPatients(patients) {

    const patientsList =
        document.getElementById("patientsList");

    if (patients.length === 0) {

        patientsList.innerHTML = `
            <div class="empty-state">
                <h3>No patients found</h3>
                <p>
                    Try another search or add a new patient.
                </p>
            </div>
        `;

        return;
    }


    patientsList.innerHTML = patients.map(patient => {

        return `
            <div class="patient-card">

                <div class="patient-info">

                    <h3>
                        ${escapeHtml(patient.name)}
                    </h3>

                    <p>
                        Patient ID:
                        <strong>
                            ${escapeHtml(patient.patient_id)}
                        </strong>
                    </p>

                    <p>
                        ${patient.age} years
                        •
                        ${escapeHtml(patient.gender)}
                    </p>

                    ${
                        patient.mobile_number
                        ? `
                            <p>
                                ${escapeHtml(
                                    patient.mobile_number
                                )}
                            </p>
                        `
                        : ""
                    }

                </div>

                <button
                    class="secondary-button"
                    onclick="viewPatient('${patient.patient_id}')"
                >
                    View
                </button>

            </div>
        `;

    }).join("");
}


// ============================================================
// SEARCH
// ============================================================

const searchInput =
    document.getElementById("searchInput");

let searchTimeout;

searchInput.addEventListener("input", function () {

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {

        loadPatients(searchInput.value.trim());

    }, 300);
});


// ============================================================
// ADD PATIENT
// ============================================================

document
    .getElementById("addPatientButton")
    .addEventListener("click", function () {

        window.location.href =
            "/health-worker/patients/new";

    });


// ============================================================
// VIEW PATIENT
// ============================================================

function viewPatient(patientId) {

    window.location.href =
        `/health-worker/patients/${encodeURIComponent(patientId)}`;

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    try {

        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin"
        });

    } finally {

        window.location.replace(
            "/api/auth/login-page"
        );
    }
}


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCurrentUser();
        loadPatients();

    }
);