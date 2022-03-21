import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import data from "./data.json";
import { getCities } from "./utils";
import "./App.css";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

import { getColumnDefs } from "./utils";
import Dropdown from "./Dropdown";

export const RowDataContext = React.createContext();

const App = () => {
  const [rowData, setRowData] = useState(data);
  const citiesEntries = useMemo(() => getCities(data), []);

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
      <label className="subtitle">
        אתר זה אינו אתר רשמי של משרד הבינוי והשיכון או מנהל מקרקעי ישראל
      </label>
    </div>
  );
};

export default App;
