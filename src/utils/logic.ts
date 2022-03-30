import { averageByField, groupByField, sumByField } from "./commonUtils";
import {
  EnrichedLotteryDataType,
  LocalDataType,
  LotteryDataType,
  PopulationDataType,
  RealTimeEnrichedLotteryDataType,
  RealTimeEnrichedLotteryDataTypeCity,
} from "../types/types";

export function getCities(data: LotteryDataType[]) {
  const citiesMap = new Map<number, string>();
  data.forEach((lottery) => {
    const { CityCode, CityDescription } = lottery;
    if (!citiesMap.has(CityCode)) {
      citiesMap.set(CityCode, CityDescription);
    }
  });
  return [...citiesMap.entries()];
}

export function enrichData(
  rawData: LotteryDataType[],
  localData: LocalDataType,
  populationData: PopulationDataType
) {
  const allRows: EnrichedLotteryDataType[] = rawData.map((lottery) => {
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
  const populationSet = new Set<number>();
  allRows.forEach((lottery) => populationSet.add(lottery.totalPopulation));
  const populationArray = [...populationSet];
  populationArray.sort((a, b) => b - a);
  const populationIndexObject = populationArray.reduce(
    (acc: Record<number, number>, population, index) => {
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

interface FetchDataArgs {
  project: string;
  lottery: string;
}

export async function fetchNewData({ project, lottery }: FetchDataArgs) {
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
export function calculateChancesPerRow(
  row: RealTimeEnrichedLotteryDataTypeCity
): RealTimeEnrichedLotteryDataTypeCity;
export function calculateChancesPerRow(
  row: RealTimeEnrichedLotteryDataType
): RealTimeEnrichedLotteryDataType;
export function calculateChancesPerRow(
  row: RealTimeEnrichedLotteryDataType | RealTimeEnrichedLotteryDataTypeCity
): RealTimeEnrichedLotteryDataType | RealTimeEnrichedLotteryDataTypeCity {
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

export function calculateChances(rowData: RealTimeEnrichedLotteryDataType[]) {
  return rowData.map(calculateChancesPerRow);
}

interface IRegistrantsResult {
  _registrants: number;
  _localRegistrants: number;
}

export async function fetchAllSubscribers(
  data: EnrichedLotteryDataType[]
): Promise<Record<string, IRegistrantsResult>> {
  const lotteries = data.map((row) => ({
    project: row.ProjectNumber,
    lottery: row.LotteryNumber,
  }));
  const chunksOfSix = lotteries.reduce(
    (acc: Array<Array<FetchDataArgs>>, cur, i) => {
      if (i % 10 === 0) {
        acc.push([]);
      }
      acc[acc.length - 1].push(cur);
      return acc;
    },
    []
  );
  let res: Array<[string, IRegistrantsResult]> = [];
  for (let i = 0; i < chunksOfSix.length; i++) {
    const lotteries = chunksOfSix[i];
    const result: Array<[string, IRegistrantsResult]> = await Promise.all(
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

export function groupRowsByCity(rowData: RealTimeEnrichedLotteryDataType[]) {
  const grouped = groupByField(rowData, "CityDescription");
  return Object.entries(grouped).map(([key, value]) => {
    const row: RealTimeEnrichedLotteryDataTypeCity = {
      CityDescription: key,
      GrantSize: averageByField(value, "GrantSize"),
      PricePerUnit: averageByField(value, "PricePerUnit"),
      ContractorDescription: "",
      ProjectName: "",
      LotteryApparmentsNum: sumByField(value, "LotteryApparmentsNum"),
      LocalHousing: sumByField(value, "LocalHousing"),
      _registrants: averageByField(value, "_registrants", true),
      _localRegistrants: averageByField(value, "_localRegistrants", true),
      populationIndex: averageByField(value, "populationIndex"),
    };
    return calculateChancesPerRow(row);
  });
}

export function isSmallScreen() {
  return window.innerWidth < 600;
}
