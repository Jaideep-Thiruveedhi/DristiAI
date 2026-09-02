// D:\SIH 2026\backend\static\js\screening_report.js


// ============================================================
// LOAD CURRENT USER
// ============================================================

async function loadCurrentUser() {

    try {

        const response = await fetch(
            "/api/auth/me",
            {
                credentials: "same-origin"
            }
        );


        if (!response.ok) {

            window.location.replace(
                "/api/auth/login-page"
            );

            return null;
        }


        const user =
            await response.json();


        const userName =
            document.getElementById(
                "userName"
            );


        if (userName) {

            userName.textContent =
                user.name;
        }


        return user;


    } catch (error) {

        console.error(
            "Unable to load user:",
            error
        );


        window.location.replace(
            "/api/auth/login-page"
        );


        return null;
    }
}



// ============================================================
// LOAD SCREENING
// ============================================================

async function loadScreening() {

    try {

        const response =
            await fetch(
                `/api/screenings/${encodeURIComponent(screeningId)}`,
                {
                    credentials: "same-origin"
                }
            );


        if (!response.ok) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                window.location.replace(
                    "/api/auth/login-page"
                );

                return;
            }


            if (response.status === 404) {

                throw new Error(
                    "Screening not found"
                );
            }


            throw new Error(
                "Unable to load screening"
            );
        }


        const data =
            await response.json();


        if (!data.screening) {

            throw new Error(
                "Screening data is unavailable"
            );
        }


        displayPatient(
            data.patient
        );


        displayScreening(
            data.screening
        );


    } catch (error) {

        console.error(
            "Unable to load screening:",
            error
        );


        showReportError(
            error.message
        );
    }
}



// ============================================================
// DISPLAY PATIENT
// ============================================================

function displayPatient(patient) {

    if (!patient) {

        return;
    }


    const patientName =
        document.getElementById(
            "patientName"
        );


    const patientIdElement =
        document.getElementById(
            "patientId"
        );


    const patientAge =
        document.getElementById(
            "patientAge"
        );


    const patientGender =
        document.getElementById(
            "patientGender"
        );


    const patientMobile =
        document.getElementById(
            "patientMobile"
        );


    if (patientName) {

        patientName.textContent =
            patient.name || "—";
    }


    if (patientIdElement) {

        patientIdElement.textContent =
            patient.patient_id || "—";
    }


    if (patientAge) {

        patientAge.textContent =
            patient.age != null
                ? `${patient.age} years`
                : "—";
    }


    if (patientGender) {

        patientGender.textContent =
            patient.gender || "—";
    }


    if (patientMobile) {

        patientMobile.textContent =
            patient.mobile_number ||
            "Not provided";
    }
}



// ============================================================
// DISPLAY SCREENING
// ============================================================

function displayScreening(
    screening
) {

    // --------------------------------------------------------
    // SCREENING DATE
    // --------------------------------------------------------

    const date =
        screening.created_at
            ? new Date(
                screening.created_at
            ).toLocaleString()
            : "Date unavailable";


    const screeningDate =
        document.getElementById(
            "screeningDate"
        );


    if (screeningDate) {

        screeningDate.textContent =
            date;
    }


    // --------------------------------------------------------
    // DR GRADE
    // --------------------------------------------------------

    const drGrade =
        document.getElementById(
            "drGrade"
        );


    if (drGrade) {

        drGrade.textContent =
            screening.dr_grade != null
                ? `Grade ${screening.dr_grade}`
                : "N/A";
    }


    // --------------------------------------------------------
    // CONFIDENCE
    // --------------------------------------------------------

    const confidence =
        document.getElementById(
            "confidence"
        );


    if (confidence) {

        confidence.textContent =
            screening.confidence != null
                ? `${screening.confidence}%`
                : "N/A";
    }


    // --------------------------------------------------------
    // REFERABLE STATUS
    // --------------------------------------------------------

    const referableStatus =
        document.getElementById(
            "referableStatus"
        );


    if (referableStatus) {

        referableStatus.textContent =
            screening.referable
                ? "Referable"
                : "Non-referable";
    }


    // --------------------------------------------------------
    // EXPLANATION
    // --------------------------------------------------------

    const explanation =
        document.getElementById(
            "explanation"
        );


    if (explanation) {

        explanation.textContent =
            screening.explanation ||
            "No explanation available.";
    }


    // --------------------------------------------------------
    // MODEL VERSION
    // --------------------------------------------------------

    const modelVersion =
        document.getElementById(
            "modelVersion"
        );


    if (modelVersion) {

        modelVersion.textContent =
            screening.model_version ||
            "N/A";
    }


    // --------------------------------------------------------
    // FUNDUS IMAGE
    // --------------------------------------------------------

    displayFundusImage(
        screening.image_path
    );
}



// ============================================================
// DISPLAY FUNDUS IMAGE
// ============================================================

function displayFundusImage(
    imagePath
) {

    const imageContainer =
        document.getElementById(
            "fundusImageContainer"
        );


    if (!imageContainer) {

        return;
    }


    if (!imagePath) {

        imageContainer.innerHTML = `

            <div class="report-empty">

                <p>
                    Fundus image unavailable.
                </p>

            </div>

        `;

        return;
    }


    const image =
        document.createElement(
            "img"
        );


    image.src =
        imagePath;


    image.alt =
        "Fundus screening image";


    image.loading =
        "lazy";


    image.addEventListener(
        "error",
        function () {

            imageContainer.innerHTML = `

                <div class="report-empty">

                    <p>
                        Unable to load fundus image.
                    </p>

                </div>

            `;
        }
    );


    imageContainer.innerHTML = "";


    imageContainer.appendChild(
        image
    );
}



// ============================================================
// REPORT ERROR
// ============================================================

function showReportError(
    message
) {

    const report =
        document.getElementById(
            "screeningReport"
        );


    if (!report) {

        alert(message);

        return;
    }


    report.innerHTML = `

        <div class="report-error">

            <h2>
                Unable to Load Screening Report
            </h2>

            <p>
                ${escapeHtml(message)}
            </p>

            <button
                type="button"
                class="secondary-button"
                onclick="goBackToPatient()"
            >
                ← Back to Patient
            </button>

        </div>

    `;
}



// ============================================================
// BACK TO PATIENT
// ============================================================

function goBackToPatient() {

    window.location.replace(
        `/health-worker/patients/${encodeURIComponent(patientId)}`
    );
}


document
    .getElementById(
        "backButton"
    )
    .addEventListener(
        "click",
        goBackToPatient
    );



// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;
}



// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    try {

        await fetch(
            "/api/auth/logout",
            {
                method: "POST",
                credentials: "same-origin"
            }
        );

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
    async function () {

        await loadCurrentUser();

        await loadScreening();

    }
);