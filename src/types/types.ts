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
  PriceIndexDate: string | null;
  TotalSubscribers?: number;
  TotalLocalSubscribers?: number;
  ResponsibilityDescription: string;
  ProcessName: string;
  LocalHousing?: number;
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
  HousingUnitsForHandicapped: number | null;
};

export type EnrichedPriceIndexDataType = {
  originalPriceIndex: number | null;
  priceIndexChange: number | null;
  updatedPrice: number;
};

export enum PermitCategoryEnum {
  Unknown,
  NotSubmitted,
  NotSubmittedFor,
  PartiallySubmittedFor,
  Committee,
  Full,
}

export type EnrichedLotteryDataType = LotteryDataType & {
  LocalHousing: number;
  totalPopulation: number;
  populationIndex?: number;
  PermitCategory: PermitCategoryEnum;
} & EnrichedPriceIndexDataType;

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
  updatedPrice: number;
  ProcessName: string;
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

export type PriceIndexDataType = Record<string, string>;

export type LocalDataType = Record<string, number>;

export type RaffleMetadata = {
  title: string;
  startDate: string;
  endDate: string;
  endDateForGovIl: string;
};

export type RaffleDataType = {
  data: (LotteryDataType | RealTimeEnrichedLotteryDataType)[];
  localData: LocalDataType;
  metadata: RaffleMetadata;
  cityFinalData?: Record<
    string,
    {
      CityCode: number;
      CityDescription: string;
      _localRegistrants: number;
      _registrants: number;
    }
  >;
};

export type GovILData = {
  result: {
    records: {
      Subscribers: number;
      SubscribersBenyMakom: number;
      LotteryId: number;
    }[];
  };
};
