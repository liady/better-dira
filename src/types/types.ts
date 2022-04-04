export type LotteryDataType = {
  LotteryNumber: string;
  ProjectNumber: string;
  CityCode: number;
  CityDescription: string;
  ProjectName: string;
  ContractorDescription: string;
  HousingUnits: number;
  TargetHousingUnits: number;
  PricePerUnit: number;
  NeighborhoodName: string;
  GrantSize: number;
  LotteryApparmentsNum: number;
  LocalNumber: number;
  PermitStatus: string;
  //   LotteryStageSummery: {
  //     $id: "8";
  //     TotalSubscribers: 2815;
  //     TotalLocalSubscribers: 379;
  //     Stages: [
  //       {
  //         $id: "9";
  //         TotalSubscribers: 2815;
  //         LocalSubscribers: 379;
  //         SeriesTypeOfStage: "חסרי דיור";
  //       }
  //     ];
  //   };
  IsPreferenceForHandicapped: boolean;
  HousingUnitsForHandicapped: number;
};

export type EnrichedLotteryDataType = LotteryDataType & {
  LocalHousing: number;
  totalPopulation: number;
  populationIndex?: number;
};

export type RealTimeEnrichedLotteryDataType = EnrichedLotteryDataType & {
  _registrants?: number;
  _localRegistrants?: number;
  chances?: number;
  localChances?: number;
};

export type RealTimeEnrichedCityDataType = {
  CityDescription: string;
  GrantSize: number;
  PricePerUnit: number;
  ContractorDescription: "";
  ProjectName: "";
  LotteryApparmentsNum: number;
  LocalHousing: number;
  _registrants: number;
  _localRegistrants: number;
  populationIndex: number;
};

export type RealTimeEnrichedData =
  | RealTimeEnrichedLotteryDataType
  | RealTimeEnrichedCityDataType;

export type CalculationDataType = {
  LotteryApparmentsNum: number;
  LocalHousing: number;
  _localRegistrants?: number;
  _registrants?: number;
};

export type PopulationDataType = Record<
  string,
  {
    name: string;
    totalPopulation: string;
  }
>;

export type LocalDataType = Record<string, number>;
