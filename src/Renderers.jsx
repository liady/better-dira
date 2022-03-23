import { useCallback, useContext } from "react";
import { RowDataContext } from "./App";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  calculateChancesPerRow,
  fetchNewData,
  formatNumber,
  formatPercentage,
} from "./utils";

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

function RegistrantsImpl({
  data,
  fieldName,
  formatter = formatNumber,
  title = "לחץ לעדכון",
}) {
  const { updateForLotteryNumber, grouped, fetchAll } =
    useContext(RowDataContext);
  const update = useCallback(async () => {
    if (grouped) {
      fetchAll();
    } else {
      const response = await fetchNewData({
        project: data.ProjectNumber,
        lottery: data.LotteryNumber,
      });
      data._registrants = response.TotalSubscribers;
      data._localRegistrants = response.TotalLocalSubscribers;
      const { chances, localChances } = calculateChancesPerRow(data);
      data.chances = chances;
      data.localChances = localChances;
      updateForLotteryNumber(data.LotteryNumber, data);
    }
  }, [data, fetchAll, grouped, updateForLotteryNumber]);
  if (data[fieldName]) {
    return (
      <div onClick={update} className="dataCell" title={title}>
        <span>{formatter(data[fieldName])}</span>
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

export function Chances({ data }) {
  return (
    <RegistrantsImpl
      data={data}
      fieldName="chances"
      formatter={formatPercentage}
      title="סיכוי משוער"
    />
  );
}

export function LocalChances({ data }) {
  return (
    <RegistrantsImpl
      data={data}
      fieldName="localChances"
      formatter={formatPercentage}
      title="סיכוי משוער"
    />
  );
}
