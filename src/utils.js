import { LocalRegistrants, Registrants, Registration } from "./Renderers";

const currencyFormatter = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("he-IL", {
  style: "decimal",
  maximumFractionDigits: 0,
});
export function formatCurrency(number) {
  return currencyFormatter.format(number);
}

export function formatNumber(number) {
  return numberFormatter.format(number);
}

export function getCities(data) {
  const citiesMap = new Map();
  data.forEach((lottery) => {
    const { CityCode, CityDescription } = lottery;
    if (!citiesMap.has(CityCode)) {
      citiesMap.set(CityCode, CityDescription);
    }
  });
  return [...citiesMap.entries()];
}

export function enrichData(rawData, localData) {
  return rawData.map((lottery) => {
    const LocalHousing = localData[parseInt(lottery.LotteryNumber)];
    return {
      ...lottery,
      LocalHousing,
    };
  });
}

export function getColumnDefs() {
  return [
    { field: "LotteryNumber", headerName: "הגרלה", minWidth: 85, maxWidth: 85 },
    { field: "ProjectNumber", headerName: "מתחם", minWidth: 85, maxWidth: 85 },
    {
      field: "CityDescription",
      headerName: "עיר",
      minWidth: 120,
      maxWidth: 120,
      filter: "agTextColumnFilter",
    },
    {
      field: "ProjectName",
      headerName: "פרויקט",
      maxWidth: 200,
      resizable: true,
      minWidth: 90,
    },
    {
      field: "ContractorDescription",
      headerName: "קבלן",
      maxWidth: 300,
      resizable: true,
      minWidth: 90,
    },
    {
      field: "PricePerUnit",
      headerName: 'מחיר למ"ר',
      minWidth: 120,
      maxWidth: 120,
      cellRenderer: (params) => formatCurrency(params.data.PricePerUnit),
    },
    {
      field: "GrantSize",
      headerName: "מענק",
      minWidth: 120,
      maxWidth: 120,
      cellRenderer: (params) => formatCurrency(params.data.GrantSize),
    },

    {
      field: "LotteryApparmentsNum",
      headerName: "דירות",
      minWidth: 100,
      maxWidth: 100,
    },
    {
        field: "LocalHousing",
        headerName: "לבני מקום",
        minWidth: 110,
        maxWidth: 110,
      },
    {
      cellRenderer: Registrants,
      headerName: "נרשמו",
      minWidth: 90,
      maxWidth: 90,
      field: "_registrants",
    },
    {
      cellRenderer: LocalRegistrants,
      headerName: "בני מקום",
      minWidth: 110,
      maxWidth: 110,
      field: "_localRegistrants",
    },

    {
      cellRenderer: Registration,
      minWidth: 150,
      maxWidth: 150,
      sortable: false,
      resizable: false,
    },
  ];
}
