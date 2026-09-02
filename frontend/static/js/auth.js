// D:\SIH 2026\backend\static\js\auth.js
const API_BASE = "/api/auth";


// ============================================================
// LOGIN
// ============================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const errorElement = document.getElementById("loginError");
        const button = document.getElementById("loginButton");

        errorElement.textContent = "";

        button.disabled = true;
        button.textContent = "Logging in...";

        try {

            const response = await fetch(`${API_BASE}/login`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Login failed"
                );
            }

            /*
             * Flask has created the session on the server.
             * No JWT or localStorage is required.
             */

            redirectByRole(data.user.role);

        } catch (error) {

            errorElement.textContent = error.message;

        } finally {

            button.disabled = false;
            button.textContent = "Login";
        }
    });
}


// ============================================================
// REGISTER
// ============================================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        const errorElement =
            document.getElementById("registerError");

        const successElement =
            document.getElementById("registerSuccess");

        const button =
            document.getElementById("registerButton");

        errorElement.textContent = "";
        successElement.textContent = "";

        button.disabled = true;
        button.textContent = "Creating account...";

        try {

            const response = await fetch(`${API_BASE}/register`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                    role: role
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    "Registration failed"
                );
            }

            successElement.textContent =
                "Account created successfully. Redirecting to login...";

            registerForm.reset();

            setTimeout(() => {

                window.location.href =
                    "/api/auth/login-page";

            }, 1200);

        } catch (error) {

            errorElement.textContent = error.message;

        } finally {

            button.disabled = false;
            button.textContent = "Create Account";
        }
    });
}


// ============================================================
// ROLE REDIRECTION
// ============================================================

function redirectByRole(role) {

    switch (role) {

        case "HEALTH_WORKER":

            window.location.href =
                "/health-worker/dashboard";

            break;

        case "DOCTOR":

            window.location.href =
                "/doctor/dashboard";

            break;

        case "ADMIN":

            window.location.href =
                "/admin/dashboard";

            break;

        default:

            console.error("Unknown user role:", role);

            window.location.href =
                "/api/auth/login-page";
    }
}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    try {

        await fetch(`${API_BASE}/logout`, {
            method: "POST"
        });

    } catch (error) {

        console.error("Logout request failed:", error);

    } finally {

        window.location.replace("/api/auth/login-page");
    }
}