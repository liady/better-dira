import { useCallback, useContext } from "react";
import { RowDataContext } from "./App";
import ReplayIcon from "@mui/icons-material/Replay";
import { fetchNewData, formatNumber } from "./utils";

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



function RegistrantsImpl({ data, fieldName }) {
  const { updateForLotteryNumber } = useContext(RowDataContext);
  const update = useCallback(async () => {
    const response = await fetchNewData({
      project: data.ProjectNumber,
      lottery: data.LotteryNumber,
    });
    data._registrants = response.TotalSubscribers;
    data._localRegistrants = response.TotalLocalSubscribers;
    updateForLotteryNumber(data.LotteryNumber, data);
  }, [data, updateForLotteryNumber]);
  if (data[fieldName]) {
    return (
      <div onClick={update} className="dataCell" title="לחץ לעדכון">
        <span>{formatNumber(data[fieldName])}</span>
        <ReplayIcon className="fetchIconInner" title="עדכן" />
      </div>
    );
  } else {
    return (
      <div onClick={update} className="dataCell" title="לחץ לעדכון">
        <ReplayIcon className="fetchIcon" title="עדכן" />
      </div>
    );
  }
}

export function Registrants({ data }) {
  return <RegistrantsImpl data={data} fieldName="_registrants" />;
}

export function LocalRegistrants({ data }) {
  return <RegistrantsImpl data={data} fieldName="_localRegistrants" />;
}
