const https = require("https");

const personas = [
  { loginId: "superadmin", pass: "SuperAdmin@2026" },
  { loginId: "superadmin", pass: "Admin@123456" },
  { loginId: "seller_anagata", pass: "Seller@2026" },
  { loginId: "seller_anagata", pass: "Seller@123456" },
  { loginId: "seller_picker", pass: "Picker@2026" },
  { loginId: "seller_picker", pass: "Picker@123456" },
  { loginId: "ret_gupta", pass: "Kirana@2026" },
  { loginId: "ret_gupta", pass: "Retailer@123456" },
  { loginId: "agent_rahul", pass: "Agent@2026" },
  { loginId: "agent_rahul", pass: "Agent@123456" }
];

function post(url, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = https.request(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) }
    }, (res) => {
      let body = "";
      res.on("data", c => body += c);
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log("Testing All Demo Personas on Live Production...");
  for (const p of personas) {
    const res = await post("https://api-b2b.anagataitsolutions.in/api/auth/login", {
      loginId: p.loginId,
      password: p.pass
    });
    console.log(`[HTTP ${res.status}] ${p.loginId} with '${p.pass}' -> ${res.data.user ? `SUCCESS (${res.data.user.role})` : `ERROR: ${res.data.error}`}`);
  }

  // Also test 4-digit cashier quick-pin
  const pinRes = await post("https://api-b2b.anagataitsolutions.in/api/auth/cashier-pin-login", {
    pin: "1234",
    retailerId: "ret_gupta_kirana"
  });
  console.log(`[HTTP ${pinRes.status}] Cashier Quick-PIN '1234' -> ${pinRes.data.user ? `SUCCESS (${pinRes.data.user.role})` : `ERROR: ${pinRes.data.error}`}`);
}

run();
