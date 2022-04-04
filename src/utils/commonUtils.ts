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
) {
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

export function toShortDateString(longDateString: string) {
  const d = new Date(longDateString);
  const dateAsDayMonthYearString = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  return dateAsDayMonthYearString;
}
