import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import populationData from "./data/population.json";
import priceIndexData from "./data/priceIndex.json";
import { enrichData, getCities, isSmallScreen } from "./utils/logic";
import "./Main.css";
import ReplayIcon from "@mui/icons-material/Replay";
import Switch from "@mui/material/Switch";
import { AgGridReact } from "ag-grid-react";
import RingLoader from "react-spinners/RingLoader";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

import Dropdown from "./CitySelectDropdown";
import { getColumnDefinitions } from "./utils/columnDefinitions";
import { LotteryDataType } from "./types/types";
import { useRowData } from "./utils/useRowData";
import { getCurrentRaffleData } from "./data/raffles";
import { isRaffleDone, raffleHasntStarted } from "./utils/commonUtils";
import RaffleSelectDropdown from "./RaffleSelectDropdown";

const { data: rawData, metadata, localData } = getCurrentRaffleData();

export interface IRowDataContext {
  grouped?: boolean;
  updateForLotteryNumber?: (
    lotteryNumber: string,
    data: LotteryDataType
  ) => void;
  fetchAll?: () => void;
  open: boolean;
  done: boolean;
  notOpenYet: boolean;
  percentAsRelative?: boolean;
  togglePercentAsRelative?: () => void;
  rowData?: LotteryDataType[];
}

const data = enrichData(rawData, localData, populationData, priceIndexData);

const done = isRaffleDone(metadata);
const notOpenYet = raffleHasntStarted(metadata);
const open = !done && !notOpenYet;

export const RowDataContext = React.createContext<IRowDataContext>({
  done,
  notOpenYet,
  open,
});

const Main = () => {
  const [percentAsRelative, setPercentAsRelative] = useState(false);
  const togglePercentAsRelative = () =>
    setPercentAsRelative(!percentAsRelative);
  const {
    rowData,
    groupedRowData,
    fetchAll,
    fetchFromGovIL,
    fetching,
    updateForLotteryNumber,
    refreshed,
  } = useRowData(data, open, metadata.endDate, metadata.endDateForGovIl);

  useEffect(() => {
    console.log("Developed by Liad Yosef");
    console.log("https://www.linkedin.com/in/liadyosef/");
    // if (open) {
    fetchFromGovIL();
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [grouped, setGrouped] = useState(false);
  const [adjustToIndex, setAdjustToIndex] = useState(true);

  const [smallScreen, setSmallScreen] = useState(isSmallScreen());

  const citiesEntries = useMemo(() => getCities(data), []);

  const toggleGroup = useCallback((event) => {
    if (event?.target?.checked) {
      setGrouped(event.target.checked);
    } else {
      setGrouped((prev) => !prev);
    }
  }, []);

  const toggleAdjustToIndex = useCallback((event) => {
    if (event?.target?.checked) {
      setAdjustToIndex(event.target.checked);
    } else {
      setAdjustToIndex((prev) => !prev);
    }
  }, []);

  const defaultColDef = {
    sortable: true,
  };

  const gridRef = useRef<any>();
  const autoSizeAll = useCallback(() => {
    gridRef?.current?.api.sizeColumnsToFit();
  }, [gridRef]);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setSmallScreen(isSmallScreen());
      autoSizeAll();
    });
  }, [autoSizeAll]);

  const filterByCityCode = useCallback(
    (cityCode) => {
      const city = citiesEntries.find(([code]) => code === cityCode);
      if (city?.[1]) {
        gridRef?.current?.api.setFilterModel({
          CityDescription: {
            type: "equals",
            filter: city[1],
          },
        });
      } else {
        gridRef?.current?.api.setFilterModel(null);
      }
    },
    [citiesEntries, gridRef]
  );

  return (
    <div
      className={`container ${smallScreen ? "small-screen" : ""} ${
        grouped ? "is-grouped" : ""
      }`}
    >
      <label className="title">
        ?????????? ???????????? ???????? ?????????? <RaffleSelectDropdown />
      </label>
      <div className="content">
        <div className="dropdown-container" dir="rtl">
          <Dropdown
            cityEntries={citiesEntries}
            onCityChange={filterByCityCode}
          />
          {!smallScreen && (
            <a
              className="map"
              href="https://www.arcgis.com/apps/webappviewer/index.html?id=40c996fd924c46f6815e77a9eef81362"
              target="_blank"
              rel="noopener noreferrer"
            >
              ?????? ??????????????
            </a>
          )}
          {smallScreen ? (
            <div
              className={`refreshAllContainer ${fetching ? "fetching" : ""}`}
            >
              {fetching ? (
                <RingLoader size={16} />
              ) : open ? (
                <button
                  className={`refreshAll ${fetching ? "fetching-button" : ""} ${
                    refreshed ? "fetching-button-refreshed" : ""
                  }`}
                  onClick={fetchAll}
                >
                  <ReplayIcon className="fetchIcon" />
                </button>
              ) : null}
            </div>
          ) : (
            <div
              className={`refreshAllContainer ${fetching ? "fetching" : ""}`}
            >
              {fetching ? <RingLoader size={18} /> : null}
              {!open ? (
                done ? (
                  <span>???????????? ???????????? ??????????????</span>
                ) : (
                  <span>???????????? ???????????? ?????? ??????????</span>
                )
              ) : (
                <button
                  className={`refreshAll ${fetching ? "fetching-button" : ""} ${
                    refreshed ? "fetching-button-refreshed" : ""
                  }`}
                  onClick={fetchAll}
                >
                  ???????? ?????? ???????????? ?????????????? (??5 ??????????)
                </button>
              )}
            </div>
          )}
          <div className="selectorsContainer">
            <div className="adjustPriceContainer">
              <label
                className="adjutPrice"
                onClick={toggleAdjustToIndex}
                title="?????????? ???????? ?????????????? ???????? ?????????? ???????? ?????? ????????"
              >
                ???????? ????????
              </label>
              <Switch onChange={toggleAdjustToIndex} checked={adjustToIndex} />
            </div>
            <div className="groupingContainer">
              <label
                className="groupBy--city"
                onClick={toggleGroup}
                title="?????? ?????????? ???? ?????????????? ?????????????? ?????? ??????"
              >
                {smallScreen ? "?????? ??????" : "?????? ?????? ??????"}
              </label>
              <Switch onChange={toggleGroup} checked={grouped} />
            </div>
          </div>
        </div>
        {grouped && (
          <div className="importantNote">
            <label>
              ?????? ?????????????? ???????????? ?????????? ???????????? - ?????????? ???? ?????????? ?????? ?????????????? ??????????
              ???????? ???????????? ?????????? ???????????????????? ???????? ???????????? ????????
            </label>
          </div>
        )}
        <div className="table-container">
          <div
            className="ag-theme-alpine"
            style={{ width: "100%", height: "100%" }}
          >
            <RowDataContext.Provider
              value={{
                rowData,
                updateForLotteryNumber,
                grouped,
                fetchAll,
                open,
                done,
                notOpenYet,
                percentAsRelative,
                togglePercentAsRelative,
              }}
            >
              <AgGridReact
                suppressCellSelection={true}
                rowHeight={50}
                headerHeight={50}
                // domLayout="autoHeight"
                defaultColDef={defaultColDef}
                enableRtl={true}
                rowData={grouped ? groupedRowData : rowData}
                columnDefs={getColumnDefinitions(
                  grouped,
                  smallScreen,
                  adjustToIndex
                )}
                ref={gridRef}
                onFirstDataRendered={autoSizeAll}
                onRowDataChanged={autoSizeAll}
                onFilterChanged={autoSizeAll}
              ></AgGridReact>
            </RowDataContext.Provider>
          </div>
        </div>
      </div>

      <div className="footer">
        <a
          className="subtitleHref"
          href="https://twitter.com/liadyosef/status/1506203345375145987"
          target="_blank"
          rel="noopener noreferrer"
        >
          <label className="subtitle" onClick={fetchAll}>
            ?????? ???? ???????? ?????? ???????? ???? ???????? ???????????? ?????????????? ???? ???????? ???????????? ??????????
          </label>
        </a>
        {!smallScreen && (
          <div className="details">
            <a
              href="https://twitter.com/liadyosef"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>????????????: </span>
              <img
                className="twitterLink"
                src="./twitter.png"
                alt="liadyosef"
              />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
