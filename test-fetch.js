console.log("Global fetch type:", typeof fetch);
console.log("global.fetch type:", typeof global.fetch);
console.log("globalThis.fetch type:", typeof globalThis.fetch);

try {
    fetch("https://www.google.com").then(res => {
        console.log("Fetch worked! Status:", res.status);
    }).catch(err => {
        console.error("Fetch failed:", err);
    });
} catch (e) {
    console.error("Fetch call threw:", e);
}
