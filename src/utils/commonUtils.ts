import {
  EnrichedLotteryDataType,
  GovILData,
  LotteryDataType,
  PriceIndexDataType,
  RaffleMetadata,
} from "../types/types";

const currencyFormatter = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("he-IL", {
  style: "decimal",
  maximumFractionDigits: 0,
});

const percentageFormatter = new Intl.NumberFormat("he-IL", {
  style: "percent",
  maximumFractionDigits: 2,
});

export function formatPercentage(value: number) {
  return percentageFormatter.format(value);
}

export function formatRelativePercentage(value: number) {
  if (value === 1) {
    return "ודאי";
  }
  if (value) {
    const outOf = Math.ceil(1 / value);
    return `1 מתוך ${outOf}`;
  } else {
    return "אין סיכוי";
  }
}

export function formatCurrency(number: number) {
  return currencyFormatter.format(number);
}

export function formatNumber(number: number) {
  return numberFormatter.format(number);
}

export function averageByField(
  arr: Array<any>,
  fieldName: string,
  { round }: { round?: boolean } = {}
): number {
  const result = arr.length
    ? arr.reduce((acc: number, cur) => {
        return acc + ((cur[fieldName] || 0) as number);
      }, 0) / arr.length
    : 0;
  return round ? Math.round(result) : result;
}

export function sumByField(arr: Array<any>, fieldName: string) {
  return arr.reduce((acc: number, cur) => acc + (cur[fieldName] || 0), 0);
}

export function groupByField<T extends Record<K, string>, K extends string>(
  arr: Array<T>,
  fieldName: K
) {
  return arr.reduce((acc: Record<string, Array<T>>, cur) => {
    const key = cur[fieldName];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(cur);
    return acc;
  }, {});
}

export function toShortDateString(longDateString: string, withYear = true) {
  const d = new Date(longDateString);
  const dateAsDayMonthYearString = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: withYear ? "numeric" : undefined,
  });
  return dateAsDayMonthYearString;
}

export function groupAsObjectByField<
  T extends Record<K, string | number>,
  K extends string
>(array: Array<T>, field: K) {
  const obj: Record<string, T> = {};
  array.forEach((item) => {
    const key = item[field] as string;
    obj[key] = item;
  });
  return obj;
}

export function getCurrentRaffleQueryParam() {
  const params = new URLSearchParams(window.location.search);
  const raffleParam = params.get("raffle");
  return raffleParam;
}

export function isRaffleDone(raffleMetadata: RaffleMetadata) {
  const raffleEndDate = new Date(`${raffleMetadata.endDate} 23:59`);
  return raffleEndDate < new Date();
}

export function raffleHasntStarted(raffleMetadata: RaffleMetadata) {
  const raffleStartDate = new Date(`${raffleMetadata.startDate} 00:00`);
  return raffleStartDate > new Date();
}

export function reloadWithRaffleParam(raffleCode: string) {
  const params = new URLSearchParams(window.location.search);
  if (raffleCode) {
    params.set("raffle", raffleCode);
  } else {
    params.delete("raffle");
  }
  const paramsString = params.toString();
  if (paramsString) {
    window.location.search = paramsString;
  } else {
    window.location.href = window.location.href.split("?")[0];
  }
}

export function getRaffleDatesAsString(raffleMetadata: RaffleMetadata) {
  const [startDate, endDate] = [
    toShortDateString(raffleMetadata.startDate, false),
    toShortDateString(raffleMetadata.endDate, false),
  ];
  return `${endDate} - ${startDate}`;
}

export function getCurrentPriceIndex(priceIndicesData: PriceIndexDataType) {
  const latest = Object.entries(priceIndicesData)[0];
  console.log(`Latest price index used: ${latest[0]} of ${latest[1]}`);
  return parseFloat(latest[1]);
}

// export async function fetchAllRaffleData(): Promise<LotteryDataType[]> {
//   const result = await fetch(
//     "https://www.dira.moch.gov.il/api/Invoker?method=Projects&param=%3FfirstApplicantIdentityNumber%3D%26secondApplicantIdentityNumber%3D%26ProjectStatus%3D4%26Entitlement%3D1%26PageNumber%3D1%26PageSize%3D500%26IsInit%3Dfalse%26",
//     {
//       headers: {
//         accept: "application/json, text/plain, */*",
//         "accept-language": "en-US,en;q=0.9,he;q=0.8",
//         "cache-control": "no-cache",
//         pragma: "no-cache",
//         "sec-ch-ua":
//           '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
//         "sec-ch-ua-mobile": "?0",
//         "sec-ch-ua-platform": '"Windows"',
//         "sec-fetch-dest": "empty",
//       },
//       referrer: "https://www.dira.moch.gov.il/ProjectsList",
//       referrerPolicy: "strict-origin-when-cross-origin",
//       body: null,
//       method: "GET",
//     }
//   );
//   const json = await result.json();
//   return json.ProjectItems;
// }
export async function fetchAllRaffleData(): Promise<LotteryDataType[]> {
  const result = await fetch("/.netlify/functions/raffleData", {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9,he;q=0.8",
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
    body: null,
    method: "GET",
  });
  const json = (await result.json()) as { b64Encoded: string };
  return JSON.parse(decodeFromBase64(json.b64Encoded)) as LotteryDataType[];
}

function decodeFromBase64(str: string) {
  return atob(str);
}

export async function getDataFromGovIL(endDate: string) {
  const filters = encodeURIComponent(
    JSON.stringify({ LotteryEndSignupDate: endDate })
  );
  const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=7c8255d0-49ef-49db-8904-4cf917586031&limit=1000&filters=${filters}`;
  const result = await fetch(url);
  const json = (await result.json()) as GovILData;
  const records = json.result.records || [];
  const mappedRecords = records.map((record) => [
    record.LotteryId,
    {
      _registrants: record.Subscribers,
      _localRegistrants: record.SubscribersBenyMakom,
    },
  ]);
  return Object.fromEntries(mappedRecords);
}

const hrefs = {
  למשתכן: "https://go.gov.il/munach-mishtaken",
  מטרה: "https://go.gov.il/munach-matara",
  מופחת: "https://go.gov.il/munach-mufchat",
};
const responsibilities = Object.keys(hrefs);
export function getResponsibility(
  responsibilityDescription: string = "",
  processName: string = ""
): {
  href: string;
  text: string;
} {
  let text = responsibilities.find((r) =>
    responsibilityDescription.includes(r)
  ) as keyof typeof hrefs;
  if (!text) {
    text = responsibilities.find((r) =>
      processName.includes(r)
    ) as keyof typeof hrefs;
  }
  const href = text ? hrefs[text] : "";
  return { href, text };
}

export function isMatara(row: EnrichedLotteryDataType) {
  const responsibility = getResponsibility(
    row.ResponsibilityDescription,
    row.ProcessName
  );
  return responsibility.text === "מטרה";
}
