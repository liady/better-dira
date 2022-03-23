import { Registration } from "./Renderers";

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

export function formatPercentage(value) {
  return percentageFormatter.format(value);
}

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

export async function fetchRegistrantsData({ project, lottery }) {
  const resp = await fetch(
    `https://www.dira.moch.gov.il/api/Invoker?method=Projects&param=%3FfirstApplicantIdentityNumber%3D%26secondApplicantIdentityNumber%3D%26PageNumber%3D1%26PageSize%3D12%26ProjectNumber%3D${project}%26LotteryNumber%3D${lottery}%26`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9,he;q=0.8",
        "sec-ch-ua":
          '" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
      },
      body: null,
      method: "GET",
    }
  );
  const json = await resp.json();
  const { TotalLocalSubscribers, TotalSubscribers } = json.ProjectItems[0].LotteryStageSummery;
  return {
    _registrants: TotalSubscribers,
    _localRegistrants: TotalLocalSubscribers,
  };
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

export function calculateChance(row) {
  const {
    LotteryApparmentsNum,
    LocalHousing,
    _localRegistrants,
    _registrants,
  } = row.data;

  if (_localRegistrants == null || _registrants == null) {
    return null;
  }

  const localHanded = Math.min(LocalHousing, _localRegistrants);

  const chancesForNonLocalToGetNonLocalHousing = _registrants
    ? Math.min((LotteryApparmentsNum - localHanded) / (_registrants - localHanded), 1): 0;

  return chancesForNonLocalToGetNonLocalHousing;
}

export function calculateLocalChance(row) {
  const {
    LotteryApparmentsNum,
    LocalHousing,
    _localRegistrants,
    _registrants,
  } = row.data;

  if (_localRegistrants == null || _registrants == null) {
    return null;
  }

  const localHanded = Math.min(LocalHousing, _localRegistrants);

  const chancesForALocalToGetLocalHousing = _localRegistrants
    ? Math.min(localHanded / _localRegistrants, 1): 0;

    const chancesForNonLocalToGetNonLocalHousing = _registrants
    ? Math.min((LotteryApparmentsNum - localHanded) / (_registrants - localHanded), 1): 0;

  const localChances = chancesForALocalToGetLocalHousing + (1 - chancesForALocalToGetLocalHousing) *
    chancesForNonLocalToGetNonLocalHousing;

  return localChances;
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
      headerName: "נרשמו",
      minWidth: 90,
      maxWidth: 90,
      field: "_registrants",
    },
    {
      headerName: "בני מקום",
      minWidth: 110,
      maxWidth: 110,
      field: "_localRegistrants",
    },
    {
      headerName: "סיכוי לחיצוני",
      minWidth: 105,
      maxWidth: 105,
      field: "chances",
      valueGetter: calculateChance,
      valueFormatter: ({value}) => value ? formatPercentage(value) : "",
    },
    {
      headerName: "סיכוי לבן-מקום",
      minWidth: 120,
      maxWidth: 120,
      field: "localChances",
      valueGetter: calculateLocalChance,
      valueFormatter: ({value}) => value ? formatPercentage(value) : "",
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
