import { PriceIndexDataType, RaffleMetadata } from "../types/types";

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
