"use client";

import { Button, Snackbar } from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import {
  MuiDatePicker,
  SelectHour,
  SelectMinute,
} from "../../../model/TimeSelect";
import dayjs, { Dayjs } from "dayjs";

import { Production_Line } from "../../../interface/machine";
import React from "react";
import { RenderExportTable } from "../../../model/table_export";
import { exportCSVFile } from "../../../control/export";
import { fetchProduction_Time } from "../../../control/api";
import { removeAttrlvl_one } from "../../../control/controller";
import { searchData } from "../../../interface/searchData";
import { snackBarType } from "../../../interface/snackbar";

export default function Menu(props: { params: { site: string } }) {
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
    let startDate = search.startDate.minute(startMin).hour(startHr);

    let endHr = search.endHr ? parseInt(search.endHr) : 0;
    let endMin = search.startMin ? parseInt(search.startMin) : 0;
    let endDate = search.endDate.minute(endHr).hour(endMin);
    if (startDate.valueOf() > endDate.valueOf()) {
      openSnackbar({
        open: true,
        message: "End time is more than start time",
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
      </div>
      {searchData.length !== 0 && (
        <div className=" overflow-auto  h-5/6 relative mt-2 ">
          <RenderExportTable productionData={searchData} />
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
