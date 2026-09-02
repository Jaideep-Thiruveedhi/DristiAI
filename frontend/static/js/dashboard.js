// D:\SIH 2026\backend\static\js\dashboard.js


// ============================================================
// DISPLAY USER
// ============================================================

async function loadCurrentUser() {

    try {

        const response = await fetch(
            "/api/auth/me",
            {
                method: "GET",
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
            "Unable to verify current user:",
            error
        );


        window.location.replace(
            "/api/auth/login-page"
        );


        return null;
    }
}



// ============================================================
// LOAD DASHBOARD DATA
// ============================================================

async function loadDashboardData() {

    try {

        const response = await fetch(
            "/api/dashboard/health-worker",
            {
                method: "GET",
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


            throw new Error(
                "Unable to load dashboard data"
            );
        }


        const data =
            await response.json();


        // ----------------------------------------------------
        // UPDATE STATISTICS
        // ----------------------------------------------------

        updateStatistics(
            data.statistics
        );


        // ----------------------------------------------------
        // UPDATE RECENT SCREENINGS
        // ----------------------------------------------------

        displayRecentScreenings(
            data.recent_screenings || []
        );


        // ----------------------------------------------------
        // UPDATE SYNC STATUS
        // ----------------------------------------------------

        updateSyncStatus(
            data.statistics
        );


    } catch (error) {

        console.error(
            "Unable to load dashboard data:",
            error
        );


        showDashboardError();
    }
}



// ============================================================
// UPDATE DASHBOARD STATISTICS
// ============================================================

function updateStatistics(
    statistics
) {

    const patientCount =
        document.getElementById(
            "patientCount"
        );


    const screeningCount =
        document.getElementById(
            "screeningCount"
        );


    const pendingSyncCount =
        document.getElementById(
            "pendingSyncCount"
        );


    if (patientCount) {

        patientCount.textContent =
            statistics?.patients ?? 0;
    }


    if (screeningCount) {

        screeningCount.textContent =
            statistics?.screenings ?? 0;
    }


    if (pendingSyncCount) {

        pendingSyncCount.textContent =
            statistics?.pending_sync ?? 0;
    }
}



// ============================================================
// DISPLAY RECENT SCREENINGS
// ============================================================

function displayRecentScreenings(
    screenings
) {

    const container =
        document.getElementById(
            "recentScreenings"
        );


    if (!container) {
        return;
    }


    // --------------------------------------------------------
    // NO SCREENINGS
    // --------------------------------------------------------

    if (screenings.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    No screenings yet
                </h3>

                <p>
                    Completed screenings will appear here.
                </p>

            </div>

        `;

        return;
    }


    // --------------------------------------------------------
    // SCREENING LIST
    // --------------------------------------------------------

    container.innerHTML = `

        <div class="dashboard-screening-list">

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


                    const status =
                        referable
                            ? "Referable"
                            : "Non-referable";


                    const statusClass =
                        referable
                            ? "screening-status-referable"
                            : "screening-status-non-referable";


                    return `

                        <div
                            class="dashboard-screening-item"
                            role="button"
                            tabindex="0"
                            onclick="openScreeningReport(
                                '${escapeAttribute(
                                    screening.patient_id
                                )}',
                                ${screening.id}
                            )"
                            onkeydown="handleScreeningKey(
                                event,
                                '${escapeAttribute(
                                    screening.patient_id
                                )}',
                                ${screening.id}
                            )"
                        >

                            <div
                                class="dashboard-screening-main"
                            >

                                <div
                                    class="dashboard-screening-title"
                                >

                                    <strong>
                                        ${escapeHtml(
                                            screening.patient_name
                                        )}
                                    </strong>

                                    <span>
                                        ${escapeHtml(
                                            date
                                        )}
                                    </span>

                                </div>


                                <div
                                    class="dashboard-screening-meta"
                                >

                                    <span>
                                        Grade:

                                        <strong>
                                            ${escapeHtml(
                                                grade
                                            )}
                                        </strong>
                                    </span>


                                    <span>
                                        Confidence:

                                        <strong>
                                            ${escapeHtml(
                                                confidence
                                            )}
                                        </strong>
                                    </span>


                                    <span
                                        class="
                                            screening-status
                                            ${statusClass}
                                        "
                                    >
                                        ${status}
                                    </span>

                                </div>

                            </div>


                            <div
                                class="dashboard-screening-arrow"
                            >
                                →
                            </div>

                        </div>

                    `;

                }
            ).join("")}

        </div>

    `;
}



// ============================================================
// OPEN SCREENING REPORT
// ============================================================

function openScreeningReport(
    patientIdValue,
    screeningId
) {

    if (
        !patientIdValue ||
        !screeningId
    ) {

        return;
    }


    window.location.href =
        `/health-worker/patients/${encodeURIComponent(
            patientIdValue
        )}/screening/${screeningId}`;
}



// ============================================================
// KEYBOARD ACCESS FOR SCREENING
// ============================================================

function handleScreeningKey(
    event,
    patientIdValue,
    screeningId
) {

    if (
        event.key === "Enter" ||
        event.key === " "
    ) {

        event.preventDefault();


        openScreeningReport(
            patientIdValue,
            screeningId
        );
    }
}



// ============================================================
// UPDATE SYNC STATUS
// ============================================================

function updateSyncStatus(
    statistics
) {

    const syncStatus =
        document.getElementById(
            "syncStatus"
        );


    const syncDot =
        document.getElementById(
            "syncDot"
        );


    if (!syncStatus) {
        return;
    }


    const pending =
        statistics?.pending_sync ?? 0;


    if (pending === 0) {

        syncStatus.textContent =
            "Online · All data synced";


        if (syncDot) {

            syncDot.style.background =
                "#16a34a";
        }

    } else {

        syncStatus.textContent =
            `${pending} item(s) pending sync`;


        if (syncDot) {

            syncDot.style.background =
                "#f59e0b";
        }
    }
}



// ============================================================
// DASHBOARD ERROR
// ============================================================

function showDashboardError() {

    const patientCount =
        document.getElementById(
            "patientCount"
        );


    const screeningCount =
        document.getElementById(
            "screeningCount"
        );


    const pendingSyncCount =
        document.getElementById(
            "pendingSyncCount"
        );


    if (patientCount) {

        patientCount.textContent =
            "—";
    }


    if (screeningCount) {

        screeningCount.textContent =
            "—";
    }


    if (pendingSyncCount) {

        pendingSyncCount.textContent =
            "—";
    }


    const recentScreenings =
        document.getElementById(
            "recentScreenings"
        );


    if (recentScreenings) {

        recentScreenings.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to load dashboard
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;
    }


    const syncStatus =
        document.getElementById(
            "syncStatus"
        );


    if (syncStatus) {

        syncStatus.textContent =
            "Unable to check sync status";
    }
}



// ============================================================
// NEW SCREENING
// ============================================================

document
    .getElementById(
        "newScreeningButton"
    )
    .addEventListener(
        "click",
        function () {

            window.location.href =
                "/health-worker/patients";

        }
    );



// ============================================================
// VIEW ALL SCREENINGS
// ============================================================

document
    .getElementById(
        "viewAllScreeningsButton"
    )
    .addEventListener(
        "click",
        function () {

            window.location.href =
                "/health-worker/patients";

        }
    );



// ============================================================
// VIEW PATIENTS
// ============================================================

document
    .getElementById(
        "viewPatientsButton"
    )
    .addEventListener(
        "click",
        function () {

            window.location.href =
                "/health-worker/patients";

        }
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
// ATTRIBUTE ESCAPE
// ============================================================

function escapeAttribute(value) {

    return String(
        value ?? ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            "&quot;"
        );
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

    } catch (error) {

        console.error(
            "Logout request failed:",
            error
        );

    } finally {

        window.location.replace(
            "/api/auth/login-page"
        );
    }
}



// ============================================================
// INITIALIZE DASHBOARD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        // Load logged-in user
        await loadCurrentUser();


        // Load dashboard statistics
        // and recent screenings
        await loadDashboardData();

    }
);