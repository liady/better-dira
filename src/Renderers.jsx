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

async function fetchNewData({ project, lottery }) {
  const resp = await fetch(
    `https://www.dira.moch.gov.il/api/Invoker?method=Projects&param=%3FfirstApplicantIdentityNumber%3D%26secondApplicantIdentityNumber%3D%26PageNumber%3D1%26PageSize%3D12%26ProjectNumber%3D${project}%26LotteryNumber%3D${lottery}%26`,
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
  const json = await resp.json();
  const { TotalLocalSubscribers, TotalSubscribers } =
    json.ProjectItems[0].LotteryStageSummery;
  return {
    TotalLocalSubscribers,
    TotalSubscribers,
  };
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
