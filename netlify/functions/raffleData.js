const fetch = require("node-fetch");

let headers = {
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin",
  "Content-Type": "application/json", //optional
};

//This solves the "No ‘Access-Control-Allow-Origin’ header is present on the requested resource."

// headers["Access-Control-Allow-Origin"] = "*";
// headers["Access-Control-Allow-Headers"] = "*";
// headers["Vary"] = "Origin";

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    console.log(headers);
    return { statusCode: "204", headers };
  }
  const raffleData = await fetchAllRaffleData();
  const b64Encoded = encodeStringToBase64(JSON.stringify(raffleData));
  return {
    statusCode: 200,
    body: JSON.stringify({ b64Encoded }),
    headers,
  };
};

function encodeStringToBase64(str) {
  return Buffer.from(str).toString("base64");
}

async function fetchAllRaffleData() {
  const result = await fetch(
    "https://www.dira.moch.gov.il/api/Invoker?method=Projects&param=%3FfirstApplicantIdentityNumber%3D%26secondApplicantIdentityNumber%3D%26ProjectStatus%3D4%26Entitlement%3D1%26PageNumber%3D1%26PageSize%3D500%26IsInit%3Dfalse%26",
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9,he;q=0.8",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "sec-ch-ua":
          '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
      },
      referrer: "https://www.dira.moch.gov.il/ProjectsList",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
    }
  );
  const json = await result.json();
  return json.ProjectItems;
}
