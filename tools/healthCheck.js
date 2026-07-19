const https = require("https");
const { URL } = require("url");

async function checkWebsiteHealth(targetUrl) {
  const start = Date.now();

  const response = await fetch(targetUrl, { method: "GET" });
  const responseTime = Date.now() - start;

  const result = {
    url: targetUrl,
    status: response.status,
    ok: response.ok,
    responseTimeMs: responseTime,
    sslValid: null,
    sslExpiresAt: null,
  };

  const parsed = new URL(targetUrl);
  if (parsed.protocol === "https:") {
    try {
      const certInfo = await getCertInfo(parsed.hostname);
      result.sslValid = true;
      result.sslExpiresAt = certInfo.valid_to;
    } catch (err) {
      result.sslValid = false;
    }
  }

  return result;
}

function getCertInfo(hostname) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { host: hostname, port: 443, method: "GET", rejectUnauthorized: false },
      (res) => {
        const cert = res.socket.getPeerCertificate();
        if (cert && cert.valid_to) {
          resolve(cert);
        } else {
          reject(new Error("No certificate found"));
        }
        res.destroy();
      }
    );
    req.on("error", reject);
    req.end();
  });
}

module.exports = { checkWebsiteHealth };