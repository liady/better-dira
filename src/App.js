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
  enrichData,
  getCities,
  getColumnDefs,
  fetchRegistrantsData
} from "./utils";
import "./App.css";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

import Dropdown from "./Dropdown";

window.fetchAll = async function () {
  const fetchOne = async (lottery) => {
    const result = await fetch(
      `https://www.dira.moch.gov.il/api/Invoker?method=LotteryResult&param=%3FlotteryNumber%3D${lottery}%26firstApplicantIdentityNumber%3D%26secondApplicantIdentityNumber%3D%26LoginId%3D%26`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9,he;q=0.8",
          "sec-ch-ua":
            '" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
        },
        body: null,
        method: "GET",
      }
    );
    const json = await result.json();
    return [lottery, json.MyLotteryResult.LocalHousing];
  };
  const lotteries = data.map((row) => row.LotteryNumber);
  const chunksOfSix = lotteries.reduce((acc, cur, i) => {
    if (i % 10 === 0) {
      acc.push([]);
    }
    acc[acc.length - 1].push(cur);
    return acc;
  }, []);
  let res = [];
  for (let i = 0; i < chunksOfSix.length; i++) {
    const lotteries = chunksOfSix[i];
    const result = await Promise.all(lotteries.map(fetchOne));
    res = res.concat(result);
  }
  console.log(Object.fromEntries(res));
};

export const RowDataContext = React.createContext();

const data = enrichData(rawData, localData);

const App = () => {
  const [rowData, setRowData] = useState(data);
  const citiesEntries = useMemo(() => getCities(data), []);
  const fetchQueue = useRef(new Set());

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


  const onVisibleRowsChange = async (params) => {
    const gridApi = params.api;
    if (!gridApi) {
      return;
    }

    const rowsToUpdate = [];
    const visibleRows = gridApi.getRenderedNodes();
    visibleRows.forEach((row) => {
      if (row.data._registrants === undefined && !fetchQueue.current.has(row.data.LotteryNumber)) {
        fetchQueue.current.add(row.data.LotteryNumber);
        rowsToUpdate.push(row);
      }
    });

    if (rowsToUpdate.length > 0) {
      const updatedRows = await Promise.all(rowsToUpdate.map(async (row) => {

        const newData = await fetchRegistrantsData({ project: row.data.ProjectNumber, lottery: row.data.LotteryNumber });
        return {
          ...row.data, ...newData,
        }

      }));

      await gridApi.applyTransactionAsync({ update: updatedRows });
      rowsToUpdate.forEach((row) => {
        fetchQueue.current.delete(row.LotteryNumber);
      });

    }
  }

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
                getRowId={(params) => params.data.LotteryNumber}
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
                onBodyScroll={onVisibleRowsChange}
                onModelUpdated={onVisibleRowsChange}
              ></AgGridReact>
            </RowDataContext.Provider>
          </div>
        </div>
      </div>

    </div>
  );
};

export default App;
