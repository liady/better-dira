import { useEffect, useMemo } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { RealTimeEnrichedLotteryDataType } from "../types/types";
import {
  calculateChances,
  fetchAllSubscribers,
  groupRowsByCity,
} from "./logic";

declare global {
  interface Window {
    saveRafflesDataToFile: () => void;
  }
}

export const useRowData = (initialData: RealTimeEnrichedLotteryDataType[]) => {
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

  const fetchAll = useCallback(async () => {
    if (fetching) {
      return;
    }
    setFetching(true);
    const allSubscribers = await fetchAllSubscribers(initialData);
    const withSubscribers = rowData.map((row) => ({
      ...row,
      ...allSubscribers[row.LotteryNumber],
    }));
    setRowData(calculateChances(withSubscribers));
    setFetching(false);
    setRefreshed(true);
  }, [fetching, rowData, setRefreshed, initialData]);

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
    fetching,
    updateForLotteryNumber,
    refreshed,
  };
};
