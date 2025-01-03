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

    // Get the client IP address
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

    // Fetch configuration from the backend
    async function fetchConfig(dynamicKey, utmMedium, clientIP) {
        if (!dynamicKey) {
            console.error("Dynamic key is missing. Cannot fetch configuration.");
            return null;
        }
        try {
            const response = await fetch(`https://config.chatboardhq.com/api/remarketing/serve?id=${dynamicKey}&utm_medium=${utmMedium}&ip=${clientIP}`);
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

    // Trigger the targeting URL
    function triggerTargetingURL(targetingURL) {
        const img = new Image();
        img.src = targetingURL;
        img.onload = () => console.log("Targeting URL triggered successfully.");
        img.onerror = () => console.error("Failed to trigger targeting URL.");
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
            const utmMedium = queryParams.get("utm_medium");

            // Check if the target_link has already been triggered in this session
            if (sessionStorage.getItem("target_link_triggered") === "true") {
                console.log("Targeting URL has already been triggered in this session. Skipping.");
                return;
            }

            // Get client IP address
            const clientIP = await getClientIP();

            // Fetch configuration using the dynamic key, utm_source, and client IP
            const config = await fetchConfig(dynamicKey, utmMedium, clientIP);
            if (!config) {
                console.log("No valid configuration received. Exiting script.");
                return;
            }
            const interval = (config.interval || 10) * 1000;
            // Wait for the specified interval
            console.log(`Waiting for ${interval / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, interval));

            // Mark the targeting URL as triggered in sessionStorage
            sessionStorage.setItem("target_link_triggered", "true");
            if (config.target_link) {
                // Redirect to the target_link
                console.log("Redirecting to target_link...");
                window.location.href = config.target_link;
            } else {
                // Reload the page with updated UTM source
                console.log("Reloading the page with updated UTM source...");
                queryParams.set('utm_source', config.utm_source);
                window.location.replace(`${window.location.pathname}?${queryParams.toString()}`);
            }
        } catch (error) {
            console.error("Error in retargeting script:", error);
        }
    })();
})();
