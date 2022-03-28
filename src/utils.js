import {
  Chances,
  LocalChances,
  LocalRegistrants,
  Registrants,
  Registration,
} from "./Renderers";

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

export function enrichData(rawData, localData, populationData) {
  const allRows = rawData.map((lottery) => {
    const LocalHousing = localData[parseInt(lottery.LotteryNumber)];
    const { totalPopulation: totalPopulationStr = "0" } =
      populationData["" + lottery.CityCode] || {};
    const totalPopulation = parseInt(totalPopulationStr.replace(/,/g, ""));
    return {
      ...lottery,
      LocalHousing,
      totalPopulation,
    };
  });
  const populationSet = new Set();
  allRows.forEach((lottery) => populationSet.add(lottery.totalPopulation));
  const populationArray = [...populationSet];
  populationArray.sort((a, b) => b - a);
  const populationIndexObject = populationArray.reduce(
    (acc, population, index) => {
      acc[population] = index + 1;
      return acc;
    },
    {}
  );
  allRows.forEach((lottery) => {
    lottery.populationIndex = populationIndexObject[lottery.totalPopulation];
  });
  return allRows;
}

export async function fetchNewData({ project, lottery }) {
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
  const { TotalLocalSubscribers, TotalSubscribers } =
    json.ProjectItems[0].LotteryStageSummery;
  return {
    TotalLocalSubscribers,
    TotalSubscribers,
  };
}

export function calculateChancesPerRow(row) {
  const {
    LotteryApparmentsNum,
    LocalHousing,
    _localRegistrants = 0,
    _registrants = 0,
  } = row;

  const localHanded = Math.min(LocalHousing, _localRegistrants);

  const chancesForALocalToGetLocalHousing = _localRegistrants
    ? Math.min(localHanded / _localRegistrants, 1)
    : 0;

  const chancesForNonLocalToGetNonLocalHousing = _registrants
    ? Math.min(
        (LotteryApparmentsNum - localHanded) / (_registrants - localHanded),
        1
      )
    : 0;

  const localChances =
    chancesForALocalToGetLocalHousing +
    (1 - chancesForALocalToGetLocalHousing) *
      chancesForNonLocalToGetNonLocalHousing;

  return {
    ...row,
    localChances,
    chances: chancesForNonLocalToGetNonLocalHousing,
  };
}

export function calculateChances(rowData) {
  return rowData.map(calculateChancesPerRow);
}

export async function fetchAllSubscribers(data) {
  const lotteries = data.map((row) => ({
    project: row.ProjectNumber,
    lottery: row.LotteryNumber,
  }));
  const chunksOfSix = lotteries.reduce((acc, cur, i) => {
    if (i % 10 === 0) {
      acc.push([]);
    }
    acc[acc.length - 1].push(cur);
    return acc;
  }, []);
  let res = [];
  for (let i = 0; i < chunksOfSix.length; i++) {
    const lotteries = chunksOfSix[i];
    const result = await Promise.all(
      lotteries.map(async ({ project, lottery }) => {
        const subscribers = await fetchNewData({ project, lottery });
        return [
          lottery,
          {
            _registrants: subscribers.TotalSubscribers,
            _localRegistrants: subscribers.TotalLocalSubscribers,
          },
        ];
      })
    );
    res = res.concat(result);
  }
  return Object.fromEntries(res);
}

export const nonGroupedColumnDefs = [
  // { field: "populationIndex", headerName: "סדר", minWidth: 95, maxWidth: 95 },
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
    headerName: "סיכוי לחיצוני",
    minWidth: 105,
    maxWidth: 105,
    field: "chances",
    cellRenderer: Chances,
  },
  {
    headerName: "סיכוי לבן-מקום",
    minWidth: 120,
    maxWidth: 120,
    field: "localChances",
    cellRenderer: LocalChances,
  },
  {
    cellRenderer: Registration,
    minWidth: 150,
    maxWidth: 150,
    sortable: false,
    resizable: false,
  },
];

export const groupedColumnDefs = [
  {
    field: "populationIndex",
    headerName: "סדר הגרלה",
    minWidth: 135,
    maxWidth: 135,
  },
  {
    field: "CityDescription",
    headerName: "עיר",
    minWidth: 120,
    // maxWidth: 120,
    filter: "agTextColumnFilter",
  },
  {
    cellRenderer: Registrants,
    headerName: "ממוצע נרשמים",
    minWidth: 160,
    // maxWidth: 160,
    field: "_registrants",
  },
  {
    cellRenderer: LocalRegistrants,
    headerName: "ממוצע בני מקום",
    minWidth: 170,
    // maxWidth: 170,
    field: "_localRegistrants",
  },
  {
    headerName: "סיכוי משוער לחיצוני",
    minWidth: 145,
    // maxWidth: 145,
    field: "chances",
    cellRenderer: Chances,
  },
  {
    headerName: "סיכוי משוער לבן-מקום",
    minWidth: 150,
    // maxWidth: 150,
    field: "localChances",
    cellRenderer: LocalChances,
  },
  {
    field: "LotteryApparmentsNum",
    headerName: 'סה"כ דירות',
    minWidth: 120,
    // maxWidth: 120,
  },
  {
    field: "LocalHousing",
    headerName: 'סה"כ לבני מקום',
    minWidth: 160,
    // maxWidth: 160,
  },
  {
    field: "PricePerUnit",
    headerName: 'מחיר ממוצע למ"ר',
    minWidth: 170,
    // maxWidth: 170,
    cellRenderer: (params) => formatCurrency(params.data.PricePerUnit),
  },
  {
    field: "GrantSize",
    headerName: "מענק ממוצע",
    minWidth: 140,
    // maxWidth: 140,
    cellRenderer: (params) => formatCurrency(params.data.GrantSize),
  },
];

export function groupRowsByCity(rowData) {
  const grouped = rowData.reduce((acc, cur) => {
    const city = cur.CityDescription;
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(cur);
    return acc;
  }, {});
  return Object.entries(grouped).map(([key, value]) => {
    const row = {
      CityDescription: key,
      GrantSize:
        value.reduce((acc, cur) => acc + cur.GrantSize, 0) / value.length,
      PricePerUnit:
        value.reduce((acc, cur) => acc + cur.PricePerUnit, 0) / value.length,
      ContractorDescription: "",
      ProjectName: "",
      LotteryApparmentsNum: value.reduce(
        (acc, cur) => acc + cur.LotteryApparmentsNum,
        0
      ),
      LocalHousing: value.reduce((acc, cur) => acc + cur.LocalHousing, 0),
      _registrants: value?.length
        ? Math.round(
            value.reduce((acc, cur) => acc + cur._registrants, 0) / value.length
          )
        : 0,
      _localRegistrants: value?.length
        ? Math.round(
            value.reduce((acc, cur) => acc + cur._localRegistrants, 0) /
              value.length
          )
        : 0,
      populationIndex:
        value.reduce((acc, cur) => acc + cur.populationIndex, 0) / value.length,
    };
    return calculateChancesPerRow(row);
  });
}

export function isSmallScreen() {
  return window.innerWidth < 600;
}
