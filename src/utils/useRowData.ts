import { useEffect, useMemo } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { RealTimeEnrichedLotteryDataType } from "../types/types";
import { getDataFromGovIL } from "./commonUtils";
import {
  calculateChances,
  fetchAllSubscribers,
  fetchAllSubscribersForActiveRaffle,
  groupRowsByCity,
} from "./logic";

declare global {
  interface Window {
    saveRafflesDataToFile: () => void;
  }
}

export const useRowData = (
  initialData: RealTimeEnrichedLotteryDataType[],
  open: boolean,
  endDate: string
) => {
  const [rowData, setRowData] =
    useState<RealTimeEnrichedLotteryDataType[]>(initialData);
  const [fetching, setFetching] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const groupedRowData = useMemo(() => {
    return groupRowsByCity(rowData);
  }, [rowData]);

  useEffect(() => {
    window.saveRafflesDataToFile = () => {
      function download(content: any, fileName: string, contentType: string) {
        var a = document.createElement("a");
        var file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
      }
      download(
        JSON.stringify({ rowData, groupedRowData }, null, 2),
        `raffles-${new Date().toISOString()}.json`,
        "text/plain"
      );
    };
  }, [groupedRowData, rowData]);

  const fetchAllByStrategy = useCallback(
    async (strategyFn, setRefreshedAfter = true) => {
      if (fetching) {
        return;
      }
      setFetching(true);

      const allSubscribers = await strategyFn();
      const withSubscribers = rowData.map((row) => ({
        ...row,
        ...allSubscribers[row.LotteryNumber],
      }));
      setRowData(calculateChances(withSubscribers));
      setFetching(false);
      if (setRefreshedAfter) {
        setRefreshed(true);
      }
    },
    [fetching, rowData]
  );

  const fetchAll = useCallback(async () => {
    const useNewAPI = open;
    const strategyFn = useNewAPI
      ? fetchAllSubscribersForActiveRaffle
      : () => fetchAllSubscribers(initialData);
    fetchAllByStrategy(strategyFn);
  }, [fetchAllByStrategy, initialData, open]);

  const fetchFromGovIL = useCallback(async () => {
    fetchAllByStrategy(() => getDataFromGovIL(endDate), false);
  }, [endDate, fetchAllByStrategy]);

  const updateForLotteryNumber = useCallback(
    (lotteryNumber, newData) => {
      const newRowData = rowData.map((row) => {
        if (row.LotteryNumber === lotteryNumber) {
          return {
            ...row,
            ...newData,
          };
        }
        return row;
      });
      setRowData(newRowData);
    },
    [rowData]
  );

  return {
    rowData,
    groupedRowData,
    fetchAll,
    fetchFromGovIL,
    fetching,
    updateForLotteryNumber,
    refreshed,
  };
};
