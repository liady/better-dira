async function fetchOne(lottery, project) {
  const resp = await fetch(
    `https://www.dira.moch.gov.il/api/Invoker?method=LotteryResult&param=%3FlotteryNumber%3D${lottery}%26firstApplicantIdentityNumber%3D%26secondApplicantIdentityNumber%3D%26LoginId%3D%26`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9,he;q=0.8",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "sec-ch-ua":
          '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
      },
      referrer: `https://www.dira.moch.gov.il/${project}/${lottery}/ProjectInfo`,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }
  );
  const j = await resp.json();
  return [lottery, j.MyLotteryResult.LocalHousing];
}

const d = [
  { num: "2013", project: "47984" },
  { num: "2015", project: "61647" },
  { num: "1997", project: "50085" },
  { num: "1999", project: "62799" },
  { num: "1991", project: "51220" },
  { num: "2016", project: "51219" },
  { num: "1993", project: "46398" },
  { num: "2017", project: "52550" },
  { num: "2018", project: "47291" },
  { num: "1995", project: "48968" },
  { num: "1994", project: "44813" },
  { num: "2000", project: "48175" },
];

async function i() {
  const y = await Promise.all(
    d.map((q) => {
      return fetchOne(q.num, q.project);
    })
  );
  return Object.fromEntries(y);
}
