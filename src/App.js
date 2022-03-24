import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import rawData from "./data.json";
import localData from "./localData.json";
import {
  calculateChances,
  enrichData,
  fetchAllSubscribers,
  getCities,
  groupRowsByCity,
  nonGroupedColumnDefs,
  groupedColumnDefs,
} from "./utils";
import "./App.css";
import Switch from "@mui/material/Switch";
import { AgGridReact } from "ag-grid-react";
import RingLoader from "react-spinners/RingLoader";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

import Dropdown from "./Dropdown";

export const RowDataContext = React.createContext();

const data = enrichData(rawData, localData);

const App = () => {
  useEffect(() => {
    console.log("Developed by Liad Yosef");
    console.log("https://www.linkedin.com/in/liadyosef/");
  }, []);
  const [rowData, setRowData] = useState(data);
  const [fetching, setFetching] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [grouped, setGrouped] = useState(false);
  const citiesEntries = useMemo(() => getCities(data), []);

  const groupedRowData = useMemo(() => {
    return groupRowsByCity(rowData);
  }, [rowData]);

  const fetchAll = useCallback(async () => {
    if (fetching) {
      return;
    }
    setFetching(true);
    const allSubscribers = await fetchAllSubscribers(data);
    setRowData(
      calculateChances(
        rowData.map((row) => ({
          ...row,
          ...allSubscribers[row.LotteryNumber],
        }))
      )
    );
    setFetching(false);
    setRefreshed(true);
  }, [fetching, rowData, setRefreshed]);

  window.fetchAll = fetchAll;

  const toggleGroup = useCallback((event) => {
    setGrouped(event.target.checked);
  }, []);

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

  const defaultColDef = {
    sortable: true,
  };

  const gridRef = useRef();
  const autoSizeAll = useCallback(() => {
    // const allColumnIds = [];
    // gridRef.current.columnApi.getAllColumns().forEach((column) => {
    //   allColumnIds.push(column.getId());
    // });
    // gridRef.current.columnApi.autoSizeColumns(allColumnIds, false);
    gridRef.current.api.sizeColumnsToFit();
  }, [gridRef]);

  useEffect(() => {
    window.addEventListener("resize", autoSizeAll);
  }, [autoSizeAll]);

  const filterByCityCode = useCallback(
    (cityCode) => {
      const city = citiesEntries.find(([code]) => code === cityCode);
      if (city?.[1]) {
        gridRef.current.api.setFilterModel({
          CityDescription: {
            type: "equals",
            filter: city[1],
          },
        });
      } else {
        gridRef.current.api.setFilterModel(null);
      }
    },
    [citiesEntries, gridRef]
  );

  return (
    <div className="container">
      <label className="title">רשימת הגרלות דירה בהנחה - 20/3-29/3</label>
      <div className="content">
        <div className="dropdown-container" dir="rtl">
          <Dropdown
            cityEntries={citiesEntries}
            onCityChange={filterByCityCode}
          />
          <a
            className="map"
            href="https://www.arcgis.com/apps/webappviewer/index.html?id=40c996fd924c46f6815e77a9eef81362"
            target="_blank"
            rel="noopener noreferrer"
          >
            מפת ההגרלות
          </a>
          <div className={`refreshAllContainer ${fetching ? "fetching" : ""}`}>
            {fetching ? <RingLoader size={18} /> : null}
            <button
              className={`refreshAll ${fetching ? "fetching-button" : ""} ${
                refreshed ? "fetching-button-refreshed" : ""
              }`}
              onClick={fetchAll}
            >
              לחצו לרענן את כל הנתונים (כ10 שניות)
            </button>
          </div>
        </div>
        <div className="table-container">
          <div
            className="ag-theme-alpine"
            style={{ width: "100%", height: "100%" }}
          >
            <RowDataContext.Provider
              value={{ rowData, updateForLotteryNumber, grouped, fetchAll }}
            >
              <AgGridReact
                suppressCellSelection={true}
                rowHeight={50}
                headerHeight={50}
                // domLayout="autoHeight"
                defaultColDef={defaultColDef}
                enableRtl={true}
                rowData={grouped ? groupedRowData : rowData}
                columnDefs={grouped ? groupedColumnDefs : nonGroupedColumnDefs}
                ref={gridRef}
                onFirstDataRendered={autoSizeAll}
                onRowDataChanged={autoSizeAll}
              ></AgGridReact>
            </RowDataContext.Provider>
          </div>
        </div>
        <div className="selectorContainer">
          <label>קבץ לפי עיר</label>
          <Switch onChange={toggleGroup} checked={grouped} />
          <label>הצג לפי הגרלה</label>
        </div>
      </div>

      <a
        className="subtitleHref"
        href="https://twitter.com/liadyosef/status/1506203345375145987"
        target="_blank"
        rel="noopener noreferrer"
      >
        <label className="subtitle" onClick={fetchAll}>
          אתר זה אינו אתר רשמי של משרד הבינוי והשיכון או מנהל מקרקעי ישראל
        </label>
      </a>
    </div>
  );
};

export default App;
