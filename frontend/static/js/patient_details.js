// ============================================================
// LOAD CURRENT USER
// ============================================================

async function loadCurrentUser() {

    try {

        const response = await fetch("/api/auth/me", {
            credentials: "same-origin"
        });

        if (!response.ok) {

            window.location.replace(
                "/api/auth/login-page"
            );

            return;
        }

        const user = await response.json();

        const userName =
            document.getElementById("userName");

        if (userName) {
            userName.textContent = user.name;
        }

    } catch (error) {

        console.error(
            "Unable to load user:",
            error
        );

        window.location.replace(
            "/api/auth/login-page"
        );
    }
}


// ============================================================
// LOAD PATIENT DETAILS
// ============================================================

async function loadPatient() {

    const patientDetails =
        document.getElementById("patientDetails");

    try {

        const response = await fetch(
            `/api/patients/${encodeURIComponent(patientId)}`,
            {
                credentials: "same-origin"
            }
        );

        if (!response.ok) {

            if (response.status === 401) {

                window.location.replace(
                    "/api/auth/login-page"
                );

                return;
            }

            if (response.status === 404) {

                throw new Error(
                    "Patient not found"
                );
            }

            throw new Error(
                "Unable to load patient details"
            );
        }

        const data =
            await response.json();

        displayPatient(
            data.patient
        );

    } catch (error) {

        console.error(error);

        patientDetails.innerHTML = `
            <div class="empty-state">

                <h3>
                    Unable to load patient
                </h3>

                <p>
                    ${escapeHtml(error.message)}
                </p>

            </div>
        `;
    }
}


// ============================================================
// DISPLAY PATIENT
// ============================================================

function displayPatient(patient) {

    const patientDetails =
        document.getElementById("patientDetails");

    patientDetails.innerHTML = `

        <div class="patient-card">

            <div class="patient-info">

                <h3>
                    ${escapeHtml(patient.name)}
                </h3>

                <p>
                    Patient ID:

                    <strong>
                        ${escapeHtml(
                            patient.patient_id
                        )}
                    </strong>
                </p>

                <p>
                    Age:
                    ${patient.age} years
                </p>

                <p>
                    Gender:
                    ${escapeHtml(patient.gender)}
                </p>

                ${
                    patient.mobile_number
                    ? `
                        <p>
                            Mobile:
                            ${escapeHtml(
                                patient.mobile_number
                            )}
                        </p>
                    `
                    : `
                        <p>
                            Mobile:
                            Not provided
                        </p>
                    `
                }

            </div>

        </div>
    `;
}


// ============================================================
// LOAD SCREENING HISTORY
// ============================================================

async function loadScreenings() {

    const screeningHistory =
        document.getElementById(
            "screeningHistory"
        );


    if (!screeningHistory) {
        return;
    }


    screeningHistory.innerHTML = `

        <div class="empty-state">

            <h3>
                Loading screening history...
            </h3>

            <p>
                Please wait.
            </p>

        </div>

    `;


    try {

        const response = await fetch(
            `/api/screenings/patient/${encodeURIComponent(patientId)}`,
            {
                credentials: "same-origin"
            }
        );


        if (!response.ok) {

            if (response.status === 401) {

                window.location.replace(
                    "/api/auth/login-page"
                );

                return;
            }


            if (response.status === 404) {

                throw new Error(
                    "Patient not found"
                );
            }


            throw new Error(
                "Unable to load screening history"
            );
        }


        const data =
            await response.json();


        displayScreenings(
            data.screenings || []
        );


    } catch (error) {

        console.error(
            "Unable to load screenings:",
            error
        );


        screeningHistory.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to load screening history
                </h3>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>

        `;
    }
}


// ============================================================
// DISPLAY SCREENING HISTORY
// ============================================================

function displayScreenings(screenings) {

    const screeningHistory =
        document.getElementById(
            "screeningHistory"
        );


    if (!screeningHistory) {
        return;
    }


    // ========================================================
    // NO SCREENINGS
    // ========================================================

    if (screenings.length === 0) {

        screeningHistory.innerHTML = `

            <div class="empty-state">

                <h3>
                    No screenings yet
                </h3>

                <p>
                    Screening results will appear here
                    after the patient is screened.
                </p>

            </div>

        `;

        return;
    }


    // ========================================================
    // SCREENING LIST
    // ========================================================

    screeningHistory.innerHTML = `

        <div class="screening-history-list">

            ${screenings.map(
                function (screening) {

                    const date =
                        screening.created_at
                            ? new Date(
                                screening.created_at
                            ).toLocaleString()
                            : "Date unavailable";


                    const grade =
                        screening.dr_grade != null
                            ? screening.dr_grade
                            : "N/A";


                    const confidence =
                        screening.confidence != null
                            ? `${screening.confidence}%`
                            : "N/A";


                    const referable =
                        screening.referable === true;


                    const statusText =
                        referable
                            ? "Referable"
                            : "Non-referable";


                    const statusClass =
                        referable
                            ? "screening-status-referable"
                            : "screening-status-non-referable";


                    return `

                        <div
                            class="screening-list-item"
                            role="button"
                            tabindex="0"
                            onclick="viewScreeningReport(${screening.id})"
                            onkeydown="handleScreeningKey(event, ${screening.id})"
                        >

                            <!-- SCREENING INFORMATION -->

                            <div class="screening-list-main">

                                <div class="screening-list-title">

                                    <h3>
                                        Screening
                                    </h3>

                                    <span class="screening-date">
                                        ${escapeHtml(date)}
                                    </span>

                                </div>


                                <div class="screening-list-details">


                                    <!-- DR GRADE -->

                                    <div class="screening-detail">

                                        <span class="detail-label">
                                            DR Grade
                                        </span>

                                        <strong>
                                            ${escapeHtml(
                                                grade
                                            )}
                                        </strong>

                                    </div>


                                    <!-- AI CONFIDENCE -->

                                    <div class="screening-detail">

                                        <span class="detail-label">
                                            AI Confidence
                                        </span>

                                        <strong>
                                            ${escapeHtml(
                                                confidence
                                            )}
                                        </strong>

                                    </div>


                                    <!-- STATUS -->

                                    <div class="screening-detail">

                                        <span class="detail-label">
                                            Status
                                        </span>

                                        <span
                                            class="screening-status ${statusClass}"
                                        >
                                            ${statusText}
                                        </span>

                                    </div>

                                </div>

                            </div>


                            <!-- VIEW REPORT -->

                            <div class="screening-list-arrow">

                                <span>
                                    View Report
                                </span>

                                <strong>
                                    →
                                </strong>

                            </div>

                        </div>

                    `;

                }
            ).join("")}

        </div>

    `;
}


// ============================================================
// OPEN FULL SCREENING REPORT
// ============================================================

function viewScreeningReport(screeningId) {

    if (!screeningId) {
        return;
    }


    window.location.href =
        `/health-worker/patients/${encodeURIComponent(patientId)}/screening/${screeningId}`;
}


// ============================================================
// KEYBOARD ACCESS
// ============================================================

function handleScreeningKey(
    event,
    screeningId
) {

    if (
        event.key === "Enter" ||
        event.key === " "
    ) {

        event.preventDefault();

        viewScreeningReport(
            screeningId
        );
    }
}


// ============================================================
// NEW SCREENING
// ============================================================

document
    .getElementById("newScreeningButton")
    .addEventListener(
        "click",
        function () {

            window.location.href =
                `/health-worker/patients/${encodeURIComponent(patientId)}/screening/new`;

        }
    );


// ============================================================
// BACK TO PATIENTS
// ============================================================

document
    .getElementById("backButton")
    .addEventListener(
        "click",
        function () {

            window.location.replace(
                "/health-worker/patients"
            );

        }
    );


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

    const div =
        document.createElement("div");

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
    function () {

        loadCurrentUser();

        loadPatient();

        loadScreenings();

    }
);