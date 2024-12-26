(function () {
    // Extract the dynamic key from the script's src attribute
    function getDynamicKey() {
        const scripts = document.getElementsByTagName("script");
        for (let script of scripts) {
            const src = script.getAttribute("src");
            if (src && src.includes("retargeting-pixel-script.js")) {
                const urlParams = new URLSearchParams(src.split("?")[1]);
                return urlParams.get("key");
            }
        }
        return null;
    }

    // Fetch configuration from the backend
    async function fetchConfig(dynamicKey) {
        if (!dynamicKey) {
            console.error("Dynamic key is missing. Cannot fetch configuration.");
            return null;
        }
        const response = await fetch(`http://139.59.23.205:8080/api/remarketing/serve?id=6769453e634551021c7bbe9a`);
        if (!response.ok) {
            console.error("Failed to fetch configuration:", response.statusText);
            return null;
        }
        console.log("Configuration fetched successfully.", response.json());
        return response.json();
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

            // Fetch configuration using the dynamic key
            const config = await fetchConfig(dynamicKey);
            if (!config) return;

            // Extract UTM source from query parameters
            const queryParams = new URLSearchParams(window.location.search);
            const utmSource = queryParams.get("utm_source");

            // Check if UTM source matches the configuration
            if (utmSource === config.utm_source) {
                console.log("UTM source matched. Reloading the page with the targeting URL...");
                // Reload the page with the targeting URL
                window.location.href = config.targeting_url;
                return;
            }

            // Trigger the targeting URL if no reload occurs
            const img = new Image();
            img.src = config.targeting_url;
            img.onload = () => console.log("Targeting URL triggered successfully.");
            img.onerror = () => console.error("Failed to trigger targeting URL.");
        } catch (error) {
            console.error("Error in retargeting script:", error);
        }
    })();
})();
