import data from "./raffleData.json";
import localData from "./raffleLocalData.json";
import metadata from "./raffleMetaData.json";
import cityFinalData from "./byCityGroupedFinalData.json";
import { RaffleDataType } from "../../types/types";

const exportData: RaffleDataType = {
  data,
  localData,
  metadata,
  cityFinalData,
};

export default exportData;
