function showPage(pageId) {
    const pages = document.querySelectorAll(".page");

    pages.forEach(function (page) {
        page.classList.remove("active-page");
    });

    document.getElementById(pageId).classList.add("active-page");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function openModal(id) {
    document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

window.addEventListener("click", function (event) {
    const modals = document.querySelectorAll(".modal");

    modals.forEach(function (modal) {
        if (event.target === modal && modal.id !== "riskModal") {
            modal.style.display = "none";
        }
    });
});

document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();

    alert("Account created UI works. Later we will connect Gmail auth, API key, payment, and database.");

    closeModal("signupModal");
});

document.getElementById("signinForm").addEventListener("submit", function (e) {
    e.preventDefault();

    closeModal("signinModal");
    openModal("riskModal");
});

function acceptRiskMessage() {
    const checkbox = document.getElementById("riskAccept");

    if (!checkbox.checked) {
        alert("You must accept the risk message before continuing.");
        return;
    }

    closeModal("riskModal");
    showPage("homePage");

    alert("Welcome to MooseTVS dashboard area. Later this will open the real customer dashboard.");
}