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

        document.getElementById("userName").textContent =
            user.name;

    } catch (error) {
        console.error(error);
        window.location.replace("/api/auth/login-page");
    }
}


// ============================================================
// CREATE PATIENT
// ============================================================

const patientForm =
    document.getElementById("patientForm");

patientForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const errorElement =
        document.getElementById("patientError");

    const button =
        document.getElementById("savePatientButton");

    errorElement.textContent = "";

    const name =
        document.getElementById("name").value.trim();

    const age =
        document.getElementById("age").value;

    const gender =
        document.getElementById("gender").value;

    const mobile =
        document.getElementById("mobile").value.trim();


    button.disabled = true;
    button.textContent = "Saving...";


    try {

        const response = await fetch("/api/patients", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "same-origin",

            body: JSON.stringify({
                name: name,
                age: age,
                gender: gender,
                mobile_number: mobile
            })
        });


        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.error || "Unable to create patient"
            );
        }


        alert(
            `Patient created successfully.\n\nPatient ID: ${data.patient.patient_id}`
        );


        // Replace current form page in browser history.
        // This prevents Back from returning to the submitted form.
        window.location.replace("/health-worker/patients");


    } catch (error) {

        console.error(error);

        errorElement.textContent =
            error.message;

    } finally {

        button.disabled = false;
        button.textContent = "Save Patient";

    }
});


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
// PREVENT RESTORING SUBMITTED FORM FROM BFCACHE
// ============================================================

window.addEventListener("pageshow", function (event) {

    if (event.persisted) {
        window.location.reload();
    }

});


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    loadCurrentUser
);