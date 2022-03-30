import { useCallback, useContext, useState } from "react";
import { RowDataContext } from "./Main";
import ReplayIcon from "@mui/icons-material/Replay";
import { calculateChancesPerRow, fetchNewData } from "./utils/logic";
import { RingLoader } from "react-spinners";
import {
  EnrichedLotteryDataType,
  RealTimeEnrichedLotteryDataType,
} from "./types/types";
import { formatNumber, formatPercentage } from "./utils/commonUtils";

export function Registration({ data }: { data: EnrichedLotteryDataType }) {
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
}: {
  data: RealTimeEnrichedLotteryDataType;
  fieldName: keyof RealTimeEnrichedLotteryDataType;
  formatter?: (value: number) => string;
  title?: string;
}) {
  const [fetching, setFetching] = useState(false);
  const { updateForLotteryNumber, grouped, fetchAll } =
    useContext(RowDataContext);
  const update = useCallback(async () => {
    if (!fetchAll || !updateForLotteryNumber) {
      return;
    }
    if (grouped) {
      setFetching(true);
      await fetchAll();
      setFetching(false);
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
        <span>{formatter(data[fieldName] as number)}</span>
        <ReplayIcon className="fetchIconInner" />
      </div>
    );
  } else {
    return (
      <div onClick={update} className="dataCell" title="לחץ לעדכון">
        {fetching ? (
          <RingLoader size={18} />
        ) : (
          <ReplayIcon className="fetchIcon" />
        )}
      </div>
    );
  }
}

export function Registrants({ data }: { data: EnrichedLotteryDataType }) {
  return <RegistrantsImpl data={data} fieldName="_registrants" />;
}

export function LocalRegistrants({ data }: { data: EnrichedLotteryDataType }) {
  return <RegistrantsImpl data={data} fieldName="_localRegistrants" />;
}

export function Chances({ data }: { data: EnrichedLotteryDataType }) {
  return (
    <RegistrantsImpl
      data={data}
      fieldName="chances"
      formatter={formatPercentage}
      title="סיכוי משוער"
    />
  );
}

export function LocalChances({ data }: { data: EnrichedLotteryDataType }) {
  return (
    <RegistrantsImpl
      data={data}
      fieldName="localChances"
      formatter={formatPercentage}
      title="סיכוי משוער"
    />
  );
}
