document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("forgotPasswordForm");
    const messageBox = document.getElementById("messageBox");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();

        if (!email) {
            showMessage("Email is required.", "error");
            return;
        }

        if (!Utils.isValidEmail(email)) {
            showMessage("Invalid email format.", "error");
            return;
        }

        try {
            const response = await API.forgotPassword({ email });
            showMessage("If this email exists, a reset link was sent.", "success");
        } catch (err) {
            console.error(err);
            showMessage("Request failed.", "error");
        }
    });

    function showMessage(text, type) {
        messageBox.textContent = text;
        messageBox.className = `message-box ${type}`;
        messageBox.classList.remove("hidden");
    }
});
