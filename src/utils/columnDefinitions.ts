import { ICellRendererParams } from "ag-grid-community";
import {
  Chances,
  LocalChances,
  LocalRegistrants,
  PermitCategoryRenderer,
  ResponsibilityRenderer,
  Registrants,
  Registration,
  CurrencyRenderer,
} from "../Renderers";
import { formatCurrency } from "./commonUtils";

export const nonGroupedColumnDefs = [
  // { field: "populationIndex", headerName: "סדר", minWidth: 95, maxWidth: 95 },
  {
    field: "LotteryNumber",
    headerName: "הגרלה",
    minWidth: 85,
    maxWidth: 85,
    pinned: "right",
  },
  { field: "ProjectNumber", headerName: "מתחם", minWidth: 85, maxWidth: 85 },
  {
    field: "PermitCategory",
    headerName: "היתר",
    minWidth: 74,
    maxWidth: 74,
    cellRenderer: PermitCategoryRenderer,
  },
  {
    field: "CityDescription",
    headerName: "עיר",
    minWidth: 120,
    maxWidth: 120,
    filter: "agTextColumnFilter",
    pinned: "right",
  },
  {
    field: "ResponsibilityDescription",
    headerName: "תכנית",
    minWidth: 85,
    maxWidth: 85,
    cellRenderer: ResponsibilityRenderer,
  },
  {
    field: "ProjectName",
    headerName: "פרויקט",
    maxWidth: 200,
    resizable: true,
    minWidth: 90,
  },
  {
    field: "ContractorDescription",
    headerName: "קבלן",
    maxWidth: 300,
    resizable: true,
    minWidth: 90,
  },
  {
    field: "PricePerUnit",
    headerName: 'מחיר למ"ר',
    minWidth: 120,
    maxWidth: 120,
    cellRenderer: CurrencyRenderer,
  },
  {
    field: "GrantSize",
    headerName: "מענק",
    minWidth: 100,
    maxWidth: 100,
    cellRenderer: (params: ICellRendererParams) =>
      formatCurrency(params.data.GrantSize),
  },

  {
    field: "LotteryApparmentsNum",
    headerName: "דירות",
    minWidth: 80,
    maxWidth: 80,
  },
  {
    field: "LocalHousing",
    headerName: "לבני מקום",
    minWidth: 110,
    maxWidth: 110,
  },
  {
    cellRenderer: Registrants,
    headerName: "נרשמו",
    minWidth: 90,
    maxWidth: 90,
    field: "_registrants",
  },
  {
    cellRenderer: LocalRegistrants,
    headerName: "בני מקום",
    minWidth: 110,
    maxWidth: 110,
    field: "_localRegistrants",
  },
  {
    headerName: "סיכוי לחיצוני",
    minWidth: 105,
    maxWidth: 105,
    field: "chances",
    cellRenderer: Chances,
  },
  {
    headerName: "סיכוי לבן-מקום",
    minWidth: 120,
    maxWidth: 120,
    field: "localChances",
    cellRenderer: LocalChances,
  },
  {
    cellRenderer: Registration,
    minWidth: 150,
    maxWidth: 150,
    sortable: false,
    resizable: false,
  },
];

export const groupedColumnDefs = [
  {
    field: "populationIndex",
    headerName: "סדר הגרלה",
    minWidth: 135,
    maxWidth: 135,
    pinned: "right",
  },
  {
    field: "CityDescription",
    headerName: "עיר",
    minWidth: 120,
    // maxWidth: 120,
    filter: "agTextColumnFilter",
    pinned: "right",
  },
  {
    cellRenderer: Registrants,
    headerName: "ממוצע נרשמים",
    minWidth: 160,
    // maxWidth: 160,
    field: "_registrants",
  },
  {
    cellRenderer: LocalRegistrants,
    headerName: "ממוצע בני מקום",
    minWidth: 170,
    // maxWidth: 170,
    field: "_localRegistrants",
  },
  {
    headerName: "סיכוי משוער לחיצוני",
    minWidth: 145,
    // maxWidth: 145,
    field: "chances",
    cellRenderer: Chances,
  },
  {
    headerName: "סיכוי משוער לבן-מקום",
    minWidth: 150,
    // maxWidth: 150,
    field: "localChances",
    cellRenderer: LocalChances,
  },
  {
    field: "LotteryApparmentsNum",
    headerName: 'סה"כ דירות',
    minWidth: 120,
    // maxWidth: 120,
  },
  {
    field: "LocalHousing",
    headerName: 'סה"כ לבני מקום',
    minWidth: 160,
    // maxWidth: 160,
  },
  {
    field: "PricePerUnit",
    headerName: 'מחיר ממוצע למ"ר',
    minWidth: 170,
    maxWidth: 170,
    cellRenderer: CurrencyRenderer,
  },
  {
    field: "GrantSize",
    headerName: "מענק ממוצע",
    minWidth: 140,
    // maxWidth: 140,
    cellRenderer: (params: ICellRendererParams) =>
      formatCurrency(params.data.GrantSize),
  },
];

export const nonGroupedColumnDefsSmall = nonGroupedColumnDefs.map((def) =>
  def.field === "LotteryNumber" ? { ...def, pinned: null } : def
);

export const groupedColumnDefsSmall = groupedColumnDefs.map((def) =>
  def.field === "populationIndex" ? { ...def, pinned: null } : def
);

const AdjustedPricePerUnitColDef = {
  field: "updatedPrice",
  cellRenderer: CurrencyRenderer,
};

export function getColumnDefinitions(
  grouped: boolean,
  smallScreen: boolean,
  adjustToIndex: boolean
) {
  let result;
  if (grouped) {
    result = smallScreen ? groupedColumnDefsSmall : groupedColumnDefs;
  } else {
    result = smallScreen ? nonGroupedColumnDefsSmall : nonGroupedColumnDefs;
  }
  if (adjustToIndex) {
    result = result.map((def) => {
      if (def.field === "PricePerUnit") {
        return { ...def, ...AdjustedPricePerUnitColDef };
      }
      return def;
    });
  }
  return result;
}
