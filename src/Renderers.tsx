import { useContext } from "react";
import { RowDataContext } from "./Main";
import CircleIcon from "@mui/icons-material/Circle";
import {
  EnrichedLotteryDataType,
  PermitCategoryEnum,
  RealTimeEnrichedLotteryDataType,
} from "./types/types";
import {
  formatNumber,
  formatCurrency,
  formatPercentage,
  getResponsibility,
  formatRelativePercentage,
} from "./utils/commonUtils";
import { Tooltip } from "@mui/material";

export function Registration({ data }: { data: EnrichedLotteryDataType }) {
  const { open } = useContext(RowDataContext);
  const url = `https://www.dira.moch.gov.il/${data.ProjectNumber}/${data.LotteryNumber}/ProjectInfo`;
  return (
    <div>
      <a href={url} target="_blank" rel="noreferrer" className="details-button">
        {!open ? "פרטים" : "פרטים והרשמה"}
      </a>
    </div>
  );
}

function RegistrantsImpl({
  data,
  fieldName,
  formatter = formatNumber,
  title = "לחץ לעדכון",
  onClick,
}: {
  data: RealTimeEnrichedLotteryDataType;
  fieldName: keyof RealTimeEnrichedLotteryDataType;
  formatter?: (value: number) => string;
  title?: string;
  onClick?: () => void;
}) {
  // const [fetching, setFetching] = useState(false);
  // const { updateForLotteryNumber, grouped, fetchAll } =
  //   useContext(RowDataContext);
  // const update = useCallback(async () => {
  //   if (!fetchAll || !updateForLotteryNumber) {
  //     return;
  //   }
  //   if (grouped) {
  //     setFetching(true);
  //     await fetchAll();
  //     setFetching(false);
  //   } else {
  //     const response = await fetchNewData({
  //       project: data.ProjectNumber,
  //       lottery: data.LotteryNumber,
  //     });
  //     data._registrants = response.TotalSubscribers;
  //     data._localRegistrants = response.TotalLocalSubscribers;
  //     const { chances, localChances } = calculateChancesPerRow(data);
  //     data.chances = chances;
  //     data.localChances = localChances;
  //     updateForLotteryNumber(data.LotteryNumber, data);
  //   }
  // }, [data, fetchAll, grouped, updateForLotteryNumber]);
  // if (data[fieldName] || data[fieldName] === 0) {
  return (
    <div className="dataCell" title={title} onClick={onClick}>
      <span>{formatter((data[fieldName] as number) || 0)}</span>
      {/* <ReplayIcon className="fetchIconInner" /> */}
    </div>
  );
  // } else {
  //   return (
  //     <div onClick={onClick || update} className="dataCell" title="לחץ לעדכון">
  //       {fetching ? (
  //         <RingLoader size={18} />
  //       ) : (
  //         <ReplayIcon className="fetchIcon" />
  //       )}
  //     </div>
  //   );
  // }
}

export function Registrants({ data }: { data: EnrichedLotteryDataType }) {
  return <RegistrantsImpl data={data} fieldName="_registrants" />;
}

export function LocalRegistrants({ data }: { data: EnrichedLotteryDataType }) {
  return <RegistrantsImpl data={data} fieldName="_localRegistrants" />;
}

function usePercentFormatter() {
  const { togglePercentAsRelative, percentAsRelative } =
    useContext(RowDataContext);
  const formatter = percentAsRelative
    ? formatRelativePercentage
    : formatPercentage;
  return { formatter, togglePercentAsRelative };
}

export function Chances({ data }: { data: EnrichedLotteryDataType }) {
  const { formatter, togglePercentAsRelative } = usePercentFormatter();
  return (
    <RegistrantsImpl
      data={data}
      fieldName="chances"
      formatter={formatter}
      title="סיכוי משוער"
      onClick={togglePercentAsRelative}
    />
  );
}

export function LocalChances({
  data,
}: {
  data: RealTimeEnrichedLotteryDataType;
}) {
  const { formatter, togglePercentAsRelative } = usePercentFormatter();
  return (
    <RegistrantsImpl
      data={data}
      fieldName="localChances"
      formatter={formatter}
      title="סיכוי משוער"
      onClick={togglePercentAsRelative}
    />
  );
}

export function ResponsibilityRenderer({
  data,
}: {
  data: EnrichedLotteryDataType;
}) {
  const { href, text } = getResponsibility(
    data.ResponsibilityDescription,
    data.ProcessName
  );
  return href ? (
    <a href={href} className="dataCell" target="_blank" rel="noreferrer">
      <span>{text}</span>
    </a>
  ) : (
    <div>
      <span>{text}</span>
    </div>
  );
}

export function PermitCategoryRenderer({
  data,
}: {
  data: EnrichedLotteryDataType;
}) {
  const { PermitCategory, PermitStatus } = data;
  let color = "gray";
  if (
    [
      PermitCategoryEnum.NotSubmitted,
      PermitCategoryEnum.NotSubmittedFor,
    ].includes(PermitCategory)
  ) {
    color = "#ED6572";
  } else if (
    [
      PermitCategoryEnum.PartiallySubmittedFor,
      PermitCategoryEnum.Committee,
    ].includes(PermitCategory)
  ) {
    color = "#F6BF85";
  } else if (PermitCategory === PermitCategoryEnum.Full) {
    color = "#A8E3B3";
  } else {
    color = "grey";
  }
  return (
    <Tooltip title={PermitStatus}>
      <CircleIcon style={{ color, fontSize: "16px" }} />
    </Tooltip>
  );
}

const discountedPriceTitle =
  'המחיר לפני הנחה. שיעור ההנחה יעמוד על 20% ממחיר הדירה הסופי (כולל מע"מ) ועד כ-300,000 ₪';
export function CurrencyRenderer({
  data,
  value,
}: {
  data: EnrichedLotteryDataType;
  value: number;
}) {
  const responsibility = getResponsibility(
    data.ResponsibilityDescription,
    data.ProcessName
  );
  if (responsibility?.text) {
    const isMatara = responsibility.text.includes("מטרה");
    const discountedPrice = isMatara;
    if (discountedPrice) {
      return (
        <Tooltip title={discountedPriceTitle} className="priceToolTip">
          <span className="priceHasTitle">{formatCurrency(value)}</span>
        </Tooltip>
      );
    }
  }
  return formatCurrency(value);
}
