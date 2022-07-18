import { RaffleDataType } from "../../types/types";
import data from "./raffleData.json";
import localData from "./raffleLocalData.json";
import metadata from "./raffleMetaData.json";

const exportData: RaffleDataType = {
  data,
  localData,
  metadata,
};

export default exportData;
