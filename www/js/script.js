const checkToken = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch("https://oauth.j4d.dev/api/account/me",
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
    if (!response.ok) {
        console.error(`Invalid HTTP Status: ${response.status}`);
        return;
    }
    return await response.json();
};

const login = async () => {
    const email = document.getElementById("inputEmail").value;
    const password = document.getElementById("inputPassword").value;

    const response = await fetch("https://oauth.j4d.dev/api/account/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
    if (!response.ok) {
        console.error(`Invalid HTTP Status: ${response.status}`);
        return false;
    }
    const data = await response.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    console.log("Logged in");
    return true;
};

const refreshToken = async () => {
    const token = localStorage.getItem("refreshToken");

    const response = await fetch("https://oauth.j4d.dev/api/account/refresh-token",
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
    if (!response.ok) {
        console.error(`Invalid HTTP Status: ${response.status}`);
        return false;
    }
    const data = await response.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    console.log("Refreshed token");
    return true;
};

const reloadToken = async () => {
    let data = await checkToken();
    if (!data) {
        const success = await refreshToken();
        if (success === true) {
            data = await checkToken();
        }
    }
    if (!data) {
        console.log("Loaded without token");
        return;
    }
    console.log(`Loaded with token for subject: ${data.subject}`);
};

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("form");

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const success = await login();
        if (success === true) {
            console.log("Login succeeded");
        } else {
            console.log("Login failed");
        }
    });

    setInterval(() => {
        reloadToken().then(() => {
            console.log("Successfully reloaded token");
        }).catch(reason => {
            console.error("Failed to reload token", reason);
        });
    }, 60000);

    reloadToken().then(() => {
        console.log("Successfully reloaded token on load");
    }).catch(reason => {
        console.error("Failed to reload token on load", reason);
    });
});
