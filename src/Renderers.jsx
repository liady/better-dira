import { useCallback, useContext } from "react";
import { RowDataContext } from "./App";
import ReplayIcon from "@mui/icons-material/Replay";
import { formatNumber } from "./utils";

export function Registration({ data }) {
  const url = `https://www.dira.moch.gov.il/${data.ProjectNumber}/${data.LotteryNumber}/ProjectInfo`;
  return (
    <div>
      <a href={url} target="_blank" rel="noreferrer" className="details-button">
        פרטים והרשמה
      </a>
    </div>
  );
}
