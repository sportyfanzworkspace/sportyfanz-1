// Redirect to login if not authenticated
document.addEventListener("DOMContentLoaded", async function () {
    const token = sessionStorage.getItem("token");
    console.log("Token:", token); // ✅ Check if token is stored

    if (!token) {
        console.log("No token found, redirecting...");
        window.location.href = "login.html"; 
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/admin-dashboard", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            console.log("Invalid token or unauthorized access. Redirecting...");
            sessionStorage.removeItem("token");
            window.location.href = "login.html"; 
            return;
        }

        const data = await response.json();
        console.log("Dashboard Response:", data); // ✅ Log the server response
        document.getElementById("dashboard-message").textContent = data.message;
    } catch (error) {
        console.error("Error fetching dashboard:", error);
        window.location.href = "login.html"; 
    }
});
