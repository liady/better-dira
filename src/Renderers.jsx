import { RingLoader } from "react-spinners";

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

export function LoadableCell({ value, formatValue }) {
  if (value) {
    return <div>{formatValue(value)}</div>;
  } else {
    return <RingLoader size={18} />

  }
}