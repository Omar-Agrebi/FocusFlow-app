document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("resetPasswordForm");
    const messageBox = document.getElementById("messageBox");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    // Get token from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    // Check if token exists
    if (!token) {
        showMessage("Invalid or missing reset token. Please request a new password reset link.", "error");
        form.querySelector('button[type="submit"]').disabled = true;
        return;
    }

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        // Validation
        if (!newPassword || !confirmPassword) {
            showMessage("Both password fields are required.", "error");
            return;
        }

        if (newPassword.length < 8) {
            showMessage("Password must be at least 8 characters long.", "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage("Passwords do not match.", "error");
            return;
        }

        // Disable submit button during request
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';

        try {
            const response = await API.resetPassword(token, newPassword);
            showMessage("Password reset successful! Redirecting to login...", "success");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } catch (err) {
            console.error(err);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;

            const errorMessage = err.message || "Failed to reset password. The link may be expired or invalid.";
            showMessage(errorMessage, "error");
        }
    });

    function showMessage(text, type) {
        messageBox.textContent = text;
        messageBox.className = `message-box ${type}`;
        messageBox.classList.remove("hidden");
    }
});
