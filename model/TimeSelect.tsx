import Autocomplete, {
  AutocompleteRenderInputParams,
} from "@mui/material/Autocomplete";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import { HTMLAttributes } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import { searchData } from "../interface/searchData";

interface input {
  label: string;
  state: [searchData, React.Dispatch<React.SetStateAction<searchData>>];
  type: string;
}

const MuiDatePicker = ({ state, label, type }: input) => {
  const [value, setValue] = [...state];
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={type === "start" ? value.startDate : value.endDate}
        onChange={(e) => {
          if (type === "start") {
            setValue({ ...value, startDate: e });
            return;
          }
          setValue({ ...value, endDate: e });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            InputProps={{
              ...params.InputProps,
              type: "search",
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
};

const SelectHour = ({ label, state, type }: input) => {
  const [value, setValue] = [...state];

  return (
    <Autocomplete
      disableClearable
      options={hour.map((option) => option.toString())}
      renderOption={renderOption}
      onChange={(e: React.SyntheticEvent, data: string) => {
        if (type === "start") {
          setValue({ ...value, startHr: data });
          return;
        }
        setValue({ ...value, endHr: data });
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            inputProps: {
              ...params.inputProps,
              max: 23,
              min: 0,
            },
          }}
        />
      )}
    />
  );
};

const SelectMinute = ({ label, state, type }: input) => {
  const [value, setValue] = [...state];

  return (
    <Autocomplete
      disableClearable
      onChange={(e: React.SyntheticEvent, data: string) => {
        if (type === "start") {
          setValue({ ...value, startMin: data });
          return;
        }
        setValue({ ...value, endMin: data });
      }}
      options={minute.map((option) => option.toString())}
      renderOption={renderOption}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            inputProps: {
              ...params.inputProps,
              max: 59,
              min: 0,
            },
          }}
        />
      )}
    />
  );
};

const hour = Array.from(Array(24).keys());
const minute = Array.from(Array(60).keys());
const renderOption = (props: HTMLAttributes<HTMLLIElement>, option: string) => {
  return (
    <li {...props} key={option}>
      {option}
    </li>
  );
};

export { SelectHour, SelectMinute, MuiDatePicker };
