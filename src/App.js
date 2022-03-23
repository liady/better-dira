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
} from "./utils";
import "./App.css";
import { AgGridReact } from "ag-grid-react";
import RingLoader from "react-spinners/RingLoader";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

import { getColumnDefs } from "./utils";
import Dropdown from "./Dropdown";

export const RowDataContext = React.createContext();

const data = enrichData(rawData, localData);

const App = () => {
  const [rowData, setRowData] = useState(data);
  const [fetching, setFetching] = useState(false);
  const citiesEntries = useMemo(() => getCities(data), []);

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
  }, [rowData, fetching]);

  window.fetchAll = fetchAll;

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

  const [columnDefs] = useState(getColumnDefs());
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
              className={`refreshAll ${fetching ? "fetching-button" : ""}`}
              onClick={fetchAll}
            >
              רענן את כל הנתונים (כ10 שניות)
            </button>
          </div>
        </div>
        <div className="table-container">
          <div
            className="ag-theme-alpine"
            style={{ width: "100%", height: "100%" }}
          >
            <RowDataContext.Provider
              value={{ rowData, updateForLotteryNumber }}
            >
              <AgGridReact
                suppressCellSelection={true}
                rowHeight={50}
                headerHeight={50}
                // domLayout="autoHeight"
                defaultColDef={defaultColDef}
                enableRtl={true}
                rowData={rowData}
                columnDefs={columnDefs}
                ref={gridRef}
                onFirstDataRendered={autoSizeAll}
              ></AgGridReact>
            </RowDataContext.Provider>
          </div>
        </div>
      </div>
      <label className="subtitle" onClick={fetchAll}>
        אתר זה אינו אתר רשמי של משרד הבינוי והשיכון או מנהל מקרקעי ישראל
      </label>
    </div>
  );
};

export default App;
