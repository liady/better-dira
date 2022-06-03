import * as React from "react";
import Box from "@mui/material/Box";
import "./RaffleSelectDropdown.css";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { SelectChangeEvent } from "@mui/material";
import {
  getRaffleDatesAsString,
  reloadWithRaffleParam,
} from "./utils/commonUtils";
import { getCurrentRaffleCode, getDefaultRaffleCode, raffles } from "./data/raffles";

export default function RaffleSelectDropdown() {
  const [raffleCode, setRaffleCode] = React.useState(getCurrentRaffleCode());
  const raffleEntries = Object.entries(raffles).map(([code, raffle]) => [
    code,
    getRaffleDatesAsString(raffle.metadata),
  ]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newRaffleCode: string = event.target.value as string;
    setRaffleCode(newRaffleCode);
    const queryParamCode =
      newRaffleCode === getDefaultRaffleCode() ? "" : newRaffleCode;
    reloadWithRaffleParam(queryParamCode);
  };

  return (
    <Box className="raffleSelect">
      <FormControl fullWidth>
        {/* <InputLabel id="demo-simple-select-label">הגרלה</InputLabel> */}
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={raffleCode}
          // label="הגרלה"
          onChange={handleChange}
          style={{ color: "white" }}
        >
          {raffleEntries.map(([raffleCode, raffleDescription]) => (
            <MenuItem key={raffleCode} value={raffleCode}>
              {raffleDescription}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
