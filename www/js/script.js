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
