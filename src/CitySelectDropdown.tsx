import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { SelectChangeEvent } from "@mui/material";

type CityEntry = [number, string];
interface Props {
  cityEntries: CityEntry[];
  onCityChange: (city: number) => void;
}

export default function CitySelectDropdown({
  cityEntries = [],
  onCityChange,
}: Props) {
  const [cityCode, setCityCode] = React.useState(0);

  const handleChange = (event: SelectChangeEvent<number>) => {
    const newCityCode: number = event.target.value as number;
    setCityCode(newCityCode);
    onCityChange(newCityCode);
  };

  return (
    <Box sx={{ width: 150 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">עיר</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={cityCode}
          label="עיר"
          onChange={handleChange}
        >
          {[[0, "- כל הערים -"]]
            .concat(cityEntries)
            .map(([CityCode, CityDescription]) => (
              <MenuItem key={CityCode} value={CityCode}>
                {CityDescription}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
}
