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

        const userName =
            document.getElementById("userName");

        if (userName) {
            userName.textContent = user.name;
        }

    } catch (error) {

        console.error("Unable to load user:", error);

        window.location.replace("/api/auth/login-page");
    }
}


// ============================================================
// LOAD PATIENT
// ============================================================

async function loadPatient() {

    const patientInfo =
        document.getElementById("patientInfo");

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

            throw new Error("Unable to load patient");
        }

        const data = await response.json();

        const patient = data.patient;

        patientInfo.innerHTML = `
            <div class="patient-info">

                <p>
                    <strong>
                        ${escapeHtml(patient.name)}
                    </strong>
                </p>

                <p>
                    Age: ${patient.age} years
                    •
                    Gender: ${escapeHtml(patient.gender)}
                </p>

            </div>
        `;

    } catch (error) {

        console.error(error);

        patientInfo.innerHTML = `
            <p>
                Unable to load patient information.
            </p>
        `;
    }
}


// ============================================================
// ELEMENTS
// ============================================================

const imageInput =
    document.getElementById("fundusImage");

const fileName =
    document.getElementById("fileName");

const imagePreview =
    document.getElementById("imagePreview");

const previewImage =
    document.getElementById("previewImage");

const analyzeButton =
    document.getElementById("analyzeButton");

const saveScreeningButton =
    document.getElementById("saveScreeningButton");

const qualityResult =
    document.getElementById("qualityResult");

const screeningStatus =
    document.getElementById("screeningStatus");

const screeningResult =
    document.getElementById("screeningResult");


// ============================================================
// CURRENT AI RESULT
// ============================================================

let currentScreeningResult = null;


// ============================================================
// IMAGE SELECTION
// ============================================================

imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];


    // Reset previous state

    qualityResult.style.display = "none";

    screeningStatus.style.display = "none";

    screeningResult.style.display = "none";

    analyzeButton.disabled = true;


    if (saveScreeningButton) {

        saveScreeningButton.disabled = true;

        saveScreeningButton.textContent =
            "Save Screening";
    }


    currentScreeningResult = null;


    if (!file) {

        fileName.textContent =
            "No image selected";

        imagePreview.style.display =
            "none";

        return;
    }


    // ========================================================
    // CHECK FILE TYPE
    // ========================================================

    if (!file.type.startsWith("image/")) {

        alert("Please select a valid image.");

        imageInput.value = "";

        imagePreview.style.display =
            "none";

        return;
    }


    // ========================================================
    // SHOW FILE NAME
    // ========================================================

    fileName.textContent =
        file.name;


    // ========================================================
    // CREATE IMAGE URL
    // ========================================================

    const imageURL =
        URL.createObjectURL(file);


    // ========================================================
    // IMAGE LOAD SUCCESS
    // ========================================================

    previewImage.onload = function () {

        console.log(
            "Image dimensions:",
            previewImage.naturalWidth,
            "x",
            previewImage.naturalHeight
        );


        imagePreview.style.display =
            "block";


        checkImageQuality(previewImage);


        URL.revokeObjectURL(imageURL);
    };


    // ========================================================
    // IMAGE LOAD ERROR
    // ========================================================

    previewImage.onerror = function () {

        console.error(
            "Unable to load selected image."
        );

        alert(
            "Unable to read this image. Please select another image."
        );

        imageInput.value = "";

        imagePreview.style.display =
            "none";

        URL.revokeObjectURL(imageURL);
    };


    previewImage.src =
        imageURL;

});


// ============================================================
// IMAGE QUALITY CHECK
// ============================================================

function checkImageQuality(image) {

    qualityResult.style.display =
        "block";

    qualityResult.className =
        "screening-status";

    qualityResult.textContent =
        "Checking image quality...";


    const width =
        image.naturalWidth;

    const height =
        image.naturalHeight;


    console.log(
        "Quality check dimensions:",
        width,
        "x",
        height
    );


    // ========================================================
    // RESOLUTION CHECK
    // ========================================================

    if (width < 300 || height < 300) {

        showPoorQuality(
            `Image resolution is too low (${width} × ${height}). ` +
            "Please upload a higher-quality fundus image."
        );

        return;
    }


    // ========================================================
    // CREATE CANVAS
    // ========================================================

    const canvas =
        document.createElement("canvas");

    const ctx =
        canvas.getContext("2d");


    if (!ctx) {

        showPoorQuality(
            "Unable to analyze image quality."
        );

        return;
    }


    // ========================================================
    // RESIZE IMAGE FOR ANALYSIS
    // ========================================================

    const maxSize = 400;

    const scale =
        Math.min(
            maxSize / width,
            maxSize / height,
            1
        );


    canvas.width =
        Math.max(
            1,
            Math.round(width * scale)
        );

    canvas.height =
        Math.max(
            1,
            Math.round(height * scale)
        );


    // ========================================================
    // DRAW IMAGE
    // ========================================================

    ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ========================================================
    // GET PIXEL DATA
    // ========================================================

    let imageData;

    try {

        imageData =
            ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );

    } catch (error) {

        console.error(
            "Unable to read image pixels:",
            error
        );

        showPoorQuality(
            "Unable to analyze this image."
        );

        return;
    }


    const pixels =
        imageData.data;

    const pixelCount =
        pixels.length / 4;


    // ========================================================
    // BRIGHTNESS / CONTRAST
    // ========================================================

    let brightnessSum = 0;

    let brightnessSquaredSum = 0;


    for (
        let i = 0;
        i < pixels.length;
        i += 4
    ) {

        const r =
            pixels[i];

        const g =
            pixels[i + 1];

        const b =
            pixels[i + 2];


        const brightness =
            0.299 * r +
            0.587 * g +
            0.114 * b;


        brightnessSum +=
            brightness;

        brightnessSquaredSum +=
            brightness * brightness;
    }


    const averageBrightness =
        brightnessSum / pixelCount;


    const variance =
        (
            brightnessSquaredSum /
            pixelCount
        )
        -
        (
            averageBrightness *
            averageBrightness
        );


    const contrast =
        Math.sqrt(
            Math.max(
                variance,
                0
            )
        );


    console.log(
        "Image quality values:",
        {
            width: width,
            height: height,
            brightness: averageBrightness,
            contrast: contrast
        }
    );


    // ========================================================
    // BRIGHTNESS CHECK
    // ========================================================

    if (
        averageBrightness < 35 ||
        averageBrightness > 225
    ) {

        showPoorQuality(
            "Image brightness is not suitable. " +
            "Please capture another fundus image."
        );

        return;
    }


    // ========================================================
    // CONTRAST CHECK
    // ========================================================

    if (contrast < 20) {

        showBorderlineQuality(
            "Image contrast is low. " +
            "Enhancement may be required before analysis."
        );

        return;
    }


    // ========================================================
    // GOOD QUALITY
    // ========================================================

    showGoodQuality(
        `Image quality is good (${width} × ${height}).`
    );
}


// ============================================================
// GOOD QUALITY
// ============================================================

function showGoodQuality(message) {

    qualityResult.className =
        "screening-status quality-good";

    qualityResult.textContent =
        "✓ " + message;

    analyzeButton.disabled =
        false;
}


// ============================================================
// BORDERLINE QUALITY
// ============================================================

function showBorderlineQuality(message) {

    qualityResult.className =
        "screening-status quality-borderline";

    qualityResult.textContent =
        "⚠ " + message;


    // Prototype:
    // Allow analysis without enhancement.

    analyzeButton.disabled =
        false;
}


// ============================================================
// POOR QUALITY
// ============================================================

function showPoorQuality(message) {

    qualityResult.className =
        "screening-status quality-poor";

    qualityResult.textContent =
        "✕ " + message;

    analyzeButton.disabled =
        true;
}


// ============================================================
// ANALYZE IMAGE
// ============================================================

analyzeButton.addEventListener(
    "click",
    function () {

        const file =
            imageInput.files[0];


        if (!file) {
            return;
        }


        screeningResult.style.display =
            "none";


        screeningStatus.style.display =
            "block";

        screeningStatus.className =
            "screening-status";

        screeningStatus.textContent =
            "Analyzing image...";


        analyzeButton.disabled =
            true;


        // ====================================================
        // TEMPORARY MOCK AI RESULT
        // ====================================================
        //
        // This will later be replaced by the actual
        // DR classification model.
        //

        setTimeout(function () {

            // -----------------------------------------------
            // MOCK MODEL OUTPUT
            // -----------------------------------------------

            const grade = 2;

            const confidence = 91;

            const referable = grade >= 2;


            const explanation =
                "The AI model classified this image as " +
                `DR Grade ${grade}. ` +
                "The prediction indicates findings that may " +
                "require further evaluation by an ophthalmologist.";


            // -----------------------------------------------
            // STORE RESULT
            // -----------------------------------------------

            currentScreeningResult = {
                grade: grade,
                confidence: confidence,
                referable: referable,
                explanation: explanation,
                modelVersion: "DR-Mock-v1"
            };


            // -----------------------------------------------
            // ANALYSIS STATUS
            // -----------------------------------------------

            screeningStatus.textContent =
                "Analysis completed.";


            // -----------------------------------------------
            // SHOW RESULT
            // -----------------------------------------------

            screeningResult.style.display =
                "block";


            // -----------------------------------------------
            // DR GRADE
            // -----------------------------------------------

            document.getElementById(
                "resultGrade"
            ).textContent =
                `DR Grade: ${grade}`;


            // -----------------------------------------------
            // CONFIDENCE
            // -----------------------------------------------

            document.getElementById(
                "resultConfidence"
            ).textContent =
                `${confidence}%`;


            // -----------------------------------------------
            // REFERRAL STATUS
            // -----------------------------------------------

            document.getElementById(
                "resultReferral"
            ).textContent =
                referable
                    ? "Referable — Ophthalmologist review recommended"
                    : "Non-referable — Routine screening";


            // -----------------------------------------------
            // EXPLANATION
            // -----------------------------------------------

            document.getElementById(
                "resultExplanation"
            ).textContent =
                explanation;


            // -----------------------------------------------
            // ENABLE BUTTON
            // -----------------------------------------------

            analyzeButton.disabled =
                false;


            if (saveScreeningButton) {

                saveScreeningButton.disabled =
                    false;
            }

        }, 1500);
    }
);


// ============================================================
// SAVE SCREENING
// ============================================================

async function saveScreening() {

    const file =
        imageInput.files[0];


    if (!file) {

        alert(
            "Please select a fundus image first."
        );

        return;
    }


    if (!currentScreeningResult) {

        alert(
            "Please analyze the image before saving."
        );

        return;
    }


    if (!saveScreeningButton) {
        return;
    }


    saveScreeningButton.disabled =
        true;

    saveScreeningButton.textContent =
        "Saving...";


    const formData =
        new FormData();


    formData.append(
        "patient_id",
        patientId
    );

    formData.append(
        "image",
        file
    );

    formData.append(
        "dr_grade",
        currentScreeningResult.grade
    );

    formData.append(
        "confidence",
        currentScreeningResult.confidence
    );

    formData.append(
        "referable",
        currentScreeningResult.referable
            ? "true"
            : "false"
    );

    formData.append(
        "explanation",
        currentScreeningResult.explanation
    );

    formData.append(
        "model_version",
        currentScreeningResult.modelVersion
    );


    try {

        const response =
            await fetch(
                "/api/screenings",
                {
                    method: "POST",
                    credentials: "same-origin",
                    body: formData
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            if (response.status === 401) {

                window.location.replace(
                    "/api/auth/login-page"
                );

                return;
            }

            throw new Error(
                data.error ||
                "Unable to save screening"
            );
        }


        alert(
            "Screening saved successfully."
        );


        window.location.replace(
            `/health-worker/patients/${encodeURIComponent(patientId)}`
        );


    } catch (error) {

        console.error(
            "Unable to save screening:",
            error
        );

        alert(
            error.message
        );


        saveScreeningButton.disabled =
            false;

        saveScreeningButton.textContent =
            "Save Screening";
    }
}


// ============================================================
// SAVE SCREENING BUTTON
// ============================================================

if (saveScreeningButton) {

    saveScreeningButton.addEventListener(
        "click",
        saveScreening
    );
}


// ============================================================
// BACK BUTTON
// ============================================================

document
    .getElementById("backButton")
    .addEventListener(
        "click",
        function () {

            window.location.replace(
                `/health-worker/patients/${encodeURIComponent(patientId)}`
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

    }
);