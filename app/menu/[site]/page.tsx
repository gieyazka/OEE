"use client";

import { Button, Menu, MenuItem, Snackbar } from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import {
  MuiDatePicker,
  SelectHour,
  SelectMinute,
  SelectMulti,
  SelectShift,
} from "../../../model/exportSelect";
import dayjs, { Dayjs } from "dayjs";
import { filterData, searchData } from "../../../interface/searchData";

import { Production_Line } from "../../../interface/machine";
import React from "react";
import { RenderExportTable } from "../../../model/table_export";
import { exportCSVFile } from "../../../control/export";
import { fetchProduction_Time } from "../../../control/api";
import { matchSorter } from "match-sorter";
import { removeAttrlvl_one } from "../../../control/controller";
import { snackBarType } from "../../../interface/snackbar";

export default function MenuPage(props: { params: { site: string } }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  // const handleClose = () => {
  //   setAnchorEl(null);
  // };

  const [searchData, setSearchData] = React.useState<Production_Line[] | []>(
    []
  );

  const [snackBar, setSnackBar] = React.useState<snackBarType>({
    open: false,
    message: "",
    type: "success",
  });

  const openSnackbar = (props: snackBarType) => {
    setSnackBar(props);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackBar({
      ...snackBar,
      open: false,
    });
  };

  const site = props.params.site.toUpperCase();
  const [search, setSearch] = React.useState<searchData>({
    startDate: null,
    startHr: null,
    startMin: null,
    endDate: null,
    endHr: null,
    endMin: null,
  });
  const [filter, setFilter] = React.useState<filterData>({
    machine: [],
    shift: null,
  });

  const onDownloadClick = async () => {
    if (searchData.length === 0) {
      openSnackbar({
        open: true,
        message: "No Data",
        type: "error",
      });
      return;
    }
    await exportCSVFile(searchData);
  };

  const handleSearch = async () => {
    if (search.startDate === null || search.endDate === null) {
      openSnackbar({
        open: true,
        message: "Please select date",
        type: "error",
      });
      return;
    }

    let startHr = search.startHr ? parseInt(search.startHr) : 0;
    let startMin = search.startMin ? parseInt(search.startMin) : 0;
    let startDate = search.startDate.hour(startHr).minute(startMin);

    let endHr = search.endHr ? parseInt(search.endHr) : 0;
    let endMin = search.startMin ? parseInt(search.startMin) : 0;
    let endDate = search.endDate.hour(endHr).minute(endMin);
    if (startDate.valueOf() > endDate.valueOf()) {
      openSnackbar({
        open: true,
        message: "Start time is more than end time",
        type: "error",
      });
      return;
    }
    const data = await fetchProduction_Time(site, startDate, endDate);
    const productionData: Production_Line[] = removeAttrlvl_one(data);
    if (productionData.length === 0) {
      openSnackbar({
        open: true,
        message: "No Data",
        type: "error",
      });
      return;
    }
    setSearchData(productionData);
  };
  const filterData = () => {
    const data = searchData.filter((d) => {
      if (filter.machine.length === 0 && filter.shift === null) {
        return true;
      } // no Filter
      if (filter.machine.includes(d.Alias_Name)  &&  filter.shift === null) {
        return true;
      }
      
      let startTime = dayjs(d.Start).hour();
      if (filter.shift === "Morning") {
        

        if (startTime > 7 && startTime < 20 && filter.machine.includes(d.Alias_Name)) {
          return true;
        }
        return false;
      }
      if (filter.shift === "Evening") {
        console.log(132);
        if (startTime > 19 && startTime < 8 && filter.machine.includes(d.Alias_Name)) {
          return true;
        }
        return false;
      }
      return false;
    });

    return data.sort((a, b) => {
      return a.id - b.id;
    });
  };

  return (
    <div
      className=" w-screen h-screen p-4 "
      style={{ backgroundColor: "#f5f5f5" }}
    >
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackBar.open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={snackBar.type}
          sx={{ width: "100%" }}
        >
          {snackBar.message}
        </Alert>
      </Snackbar>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <div className=" p-4" style={{ width: "45vw" }}>
          <div className="flex " style={{ alignItems: "center" }}>
            <span className=" basis-1/4">Machine name : </span>{" "}
            <SelectMulti
              mcData={searchData}
              label="Select machine name"
              state={[filter, setFilter]}
            />
          </div>
          <div className="flex mt-3" style={{ alignItems: "center" }}>
            <span className=" basis-1/4">Shift : </span>{" "}
            <SelectShift label="Select Shift" state={[filter, setFilter]} />
          </div>
        </div>
      </Menu>
      <div className="flex flex-1 justify-end items-center">
        <div className="flex justify-end items-center border-black border-2 rounded-md px-4 py-2  ">
          <span className="mx-2">Start : </span>
          <div className="w-[150px]">
            <MuiDatePicker
              state={[search, setSearch]}
              label="Date"
              type="start"
            />
          </div>
          <div className=" w-[100px] ml-4">
            <SelectHour state={[search, setSearch]} label="Hour" type="start" />
          </div>
          <div className=" w-[100px] ml-4">
            <SelectMinute
              state={[search, setSearch]}
              label="Minute"
              type="start"
            />
          </div>
        </div>
        <div className="flex justify-end items-center border-black border-2 rounded-md px-4 py-2  ml-4">
          <span className="mx-2">End : </span>
          <div className="w-[150px]">
            <MuiDatePicker
              state={[search, setSearch]}
              label="Date"
              type="end"
            />
          </div>
          <div className=" w-[100px] ml-4">
            <SelectHour state={[search, setSearch]} label="Hour" type="end" />
          </div>
          <div className=" w-[100px] ml-4">
            <SelectMinute
              state={[search, setSearch]}
              label="Minute"
              type="end"
            />
          </div>
        </div>
        <div className="  ml-4">
          <Button
            variant="contained"
            className="bg-blue-500  "
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
        <div className=" ml-4">
          <Button
            variant="contained"
            onClick={onDownloadClick}
            className="bg-blue-500"
          >
            Download
          </Button>
        </div>
        <div className=" ml-4">
          <Button
            className="mr-4 bg-blue-500"
            id="basic-button"
            variant="contained"
            // aria-controls={open ? "basic-menu" : undefined}
            // aria-haspopup="true"
            // aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
          >
            Filter
          </Button>
        </div>
      </div>

      {filterData().length !== 0 && (
        <div className=" overflow-auto  h-5/6 relative mt-2 ">
          <RenderExportTable productionData={filterData()} />
        </div>
      )}
    </div>
  );
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
