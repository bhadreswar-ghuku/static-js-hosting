(function () {
    // Extract the dynamic key from the script's src attribute
    function getDynamicKey() {
        const scripts = document.getElementsByTagName("script");
        for (let script of scripts) {
            const src = script.getAttribute("src");
            if (src && src.includes("js-script.js")) {
                const urlParams = new URLSearchParams(src.split("?")[1]);
                return urlParams.get("key");
            }
        }
        return null;
    }

    // Get the client IP address (you can replace this with a better method if needed)
    async function getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error("Failed to fetch client IP:", error);
            return null;
        }
    }

    // Fetch configuration from the backend using dynamic key, utm_source, and client IP
    async function fetchConfig(dynamicKey, utmSource, clientIP) {
        if (!dynamicKey) {
            console.error("Dynamic key is missing. Cannot fetch configuration.");
            return null;
        }
        try {
            const response = await fetch(`http://139.59.23.205:8080/api/remarketing/serve?id=${dynamicKey}&utm_source=${utmSource}&ip=${clientIP}`);
            if (!response.ok) {
                console.error("Failed to fetch configuration:", response.statusText);
                return null;
            }
            const config = await response.json();
            console.log("Configuration fetched successfully:", config);
            return config;
        } catch (error) {
            console.error("Error in fetching configuration:", error);
            return null;
        }
    }

    // Main logic
    (async function () {
        try {
            // Get the dynamic key from the script's URL
            const dynamicKey = getDynamicKey();
            if (!dynamicKey) {
                console.error("No dynamic key provided. Script cannot function.");
                return;
            }

            // Extract UTM source from query parameters
            const queryParams = new URLSearchParams(window.location.search);
            const utmSource = queryParams.get("utm_source");

            // Check if the page has already been reloaded
            const alreadyReloaded = queryParams.get("utm_medium_updated");
            if (alreadyReloaded === "true") {
                console.log("Page has already been reloaded with updated UTM medium. Skipping reload.");
                return;
            }

            // Get client IP address
            const clientIP = await getClientIP();

            // Fetch configuration using the dynamic key, utm_source, and client IP
            const config = await fetchConfig(dynamicKey, utmSource, clientIP);
            if (!config || !config.utm_medium) {
                console.log("No valid configuration received. Exiting script.");
                return;
            }

            // Trigger the targeting URL
            const img = new Image();
            img.src = config.target_link;
            img.onload = () => console.log("Targeting URL triggered successfully.");
            img.onerror = () => console.error("Failed to trigger targeting URL.");

            // Reload the page with updated UTM medium
            console.log("Configuration received. Reloading the page with updated UTM medium...");
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('utm_medium', config.utm_medium); // Update utm_medium from config
            urlParams.set('utm_medium_updated', "true"); // Mark the page as reloaded
            window.location.replace(`${window.location.pathname}?${urlParams.toString()}`);
        } catch (error) {
            console.error("Error in retargeting script:", error);
        }
    })();
})();
