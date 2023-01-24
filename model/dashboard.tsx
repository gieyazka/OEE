import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { use, useEffect, useMemo, useState } from "react";
import {
  fetchApi,
  getHours,
  getStartTime,
  useHost,
  useSite,
} from "../control/controller";
import useSWR, { mutate } from "swr";

import { Bar } from "react-chartjs-2";
import { Machine } from "../interface/machine";
import axios from "axios";

const OeeChart = (props: { className: string; avgPercentage: number }) => {
  return (
    <div className={props.className}>
      <CircularProgressbarWithChildren
        value={props.avgPercentage}
        circleRatio={0.65}
        styles={buildStyles({
          rotation: 0.675,
          strokeLinecap: "butt",
          trailColor: "#eee",
          pathColor:
            props.avgPercentage >= 60
              ? "#2e8f69"
              : props.avgPercentage >= 40
              ? "#ffe599"
              : "#cc0000",
        })}
      >
        <strong className="text-3xl">{props.avgPercentage}%</strong>
        <strong className="absolute bottom-8 text-lg">OEE</strong>
      </CircularProgressbarWithChildren>
    </div>
  );
};

const SumProduct = (props: {
  sumData: { target: number; plan: number; actual: number };
}) => {
  return (
    <div className=" text-center">
      <strong className=" text-2xl">Production Summary</strong>
      <div className="flex flex-col ">
        <div className="flex justify-between">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Target
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            {props.sumData.target}
          </p>
        </div>
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Plan
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            {props.sumData.plan}
          </p>
        </div>{" "}
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Actual
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            {props.sumData.actual}
          </p>
        </div>{" "}
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Diff.
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            {props.sumData.actual - props.sumData.plan}
          </p>
        </div>
      </div>
    </div>
  );
};

const MachineStatus = (props: {
  sumMachine: {
    total: number;
    running: number;
    idle: number;
    stop: number;
    planDowntime: number;
  };
}) => {
  return (
    <div className="text-center">
      <strong className=" text-2xl  mx-auto">Machine Status</strong>
      <div className="flex flex-col ">
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Machine Total
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            {props.sumMachine.total}
          </p>
        </div>
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Running
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            {props.sumMachine.running}
          </p>
        </div>{" "}
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Plan DownTime
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            {props.sumMachine.planDowntime}
          </p>
        </div>{" "}
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Idle
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            {props.sumMachine.idle}
          </p>
        </div>{" "}
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Stop
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            {props.sumMachine.stop}
          </p>
        </div>
      </div>
    </div>
  );
};

const HourChart = () => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
    aspectRatio: 1,
    indexAxis: "y" as const,
    elements: {
      bar: {
        borderWidth: 1,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        // maxWidth : "200px",
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "A/P Chart",
      },
    },
  };

  const labels = getHours();
  // console.log(labels);

  const data = {
    labels,
    datasets: [
      {
        label: "A",
        data: [
          [0, 5],
          [0, 5],
          [0, 5],
          [0, 5],
          [0, 5],
          [0, 5],
          [0, 55],
          [0, 45],
          [0, 35],
          [0, 25],
          [0, 15],
          [0, 5],
        ],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "P",
        data: labels.map(() => [0, 100]), // array of array
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };
  return <Bar options={options} data={data} />;
};

const RenderTable = ({
  machineName,
  masterData,
  mcData,
}: {
  machineName: Machine[];
  masterData: any;
  mcData: any;
}) => {
  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: () => <span>Status</span>,
        accessorFn: (row: Machine) => {
          // console.log(row);
          return row.status;
        },
        id: "Status",
        cell: (info) => {
          return info.getValue();
        },
        footer: (props) => props.column.id,
      },
      {
        header: () => <span>Line</span>,
        accessorFn: (row) => <div>{row.line}</div>,
        id: "Area",
        cell: (info) => {
          return info.getValue();
        },
        footer: (props) => props.column.id,
      },
      {
        header: () => <span>Machine Code</span>,
        accessorFn: (row) => <div>{row.line}</div>,
        id: "Machine",
        cell: (info) => {
          return info.getValue();
        },
        footer: (props) => props.column.id,
      },
      {
        header: () => <span>Part name</span>,
        accessorFn: (row) => row.firstName,
        id: "Part name",
        cell: (info) => {
          return info.getValue();
        },
        footer: (props) => props.column.id,
      },
      {
        header: () => <span>Target</span>,
        accessorFn: (row) => row.firstName,
        id: "Target",
        cell: (info) => {
          return info.getValue();
        },
        footer: (props) => props.column.id,
      },
      {
        header: () => <span>Plan</span>,
        accessorFn: (row) => row.firstName,
        id: "Plan",
        cell: (info) => {
          return info.getValue();
        },
        footer: (props) => props.column.id,
      },
      {
        header: () => <span>Actual</span>,
        accessorFn: (row) => row.firstName,
        id: "Actual",
        cell: (info) => {
          return info.getValue();
        },
        footer: (props) => props.column.id,
      },
      {
        header: () => <span>Start Time</span>,
        accessorFn: (row) => row.firstName,
        id: "Start",
        cell: (info) => {
          return info.getValue();
        },
        footer: (props) => props.column.id,
      },
      {
        header: () => <span>Produce Time</span>,
        accessorFn: (row) => row.firstName,
        id: "Produce",
        cell: (info) => {
          return info.getValue();
        },
        footer: (props) => props.column.id,
      },
      {
        header: () => <span>OEE</span>,
        accessorFn: (row) => row.firstName,
        id: "OEE",
        cell: (info) => {
          return info.getValue();
        },
        footer: (props) => props.column.id,
      },
    ],
    []
  );
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 1,
      pageSize: 30,
    });

  const fetchDataOptions = {
    pageIndex,
    pageSize,
  };
  const [page, setPage] = React.useState(0);
  const defaultData = React.useMemo(() => [], []);

  const dataQuery = useSWR(
    ["data", fetchDataOptions],
    () => {
      const data = fetchApi(fetchDataOptions, mcData, false, page);

      setPage((e) => data.currentPage);
      return data;
    },
    // { keepPreviousData: true }
    { keepPreviousData: true, refreshInterval: 20000 }
  );

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    // data: masterData ?? defaultData,
    data: dataQuery.data?.rows ?? defaultData,
    columns,
    pageCount: dataQuery.data?.pageCount ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    // getPaginationRowModel: getPaginationRowModel(), // If only doing manual pagination, you don't need this
    debugTable: true,
  });
  return (
    <div className="mx-2">
      <table
        className="mt-4 w-full border-4 "
        style={{
          borderRadius: "1em",
          overflow: "hidden",
        }}
      >
        <thead className=" h-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              style={{ backgroundColor: "#0087DC", color: "white" }}
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header) => {
                // console.log(header);

                return (
                  <th
                    className="border-2"
                    style={{ fontSize: "1.7vh" }}
                    key={header.id}
                    colSpan={header.colSpan}
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="text-center">
          {dataQuery.data?.rows.map((machine, index) => {
            let statusBg = "";
            if (machine.status === "execute") {
              statusBg = "bg-green-500 text-white";
            } else if (machine.status === "idle") {
              statusBg = "bg-yellow-500  text-white";
            } else if (machine.status === "stopped") {
              statusBg = "bg-red-500 text-white";
            } else if (machine.status === "breakdown") {
              statusBg = "bg-orange-500 text-white";
            } else if (machine.status === "plan_downtime") {
              statusBg = "bg-blue-500 text-white";
            } else {
              statusBg = "";
            }

            return (
              <tr
                className={`border-2 ${
                  index % 2 != 0 ? "bg-white" : "bg-gray-300"
                }`}
                key={machine.id}
              >
                <td className="flex justify-center">
                  <div
                    className={`${statusBg} text-center  `}
                    style={{ minWidth: "75%", margin: "1px 0px 1px 0px" }}
                  >
                    {machine.status}
                  </div>
                </td>
                <td className="">{machine.aera}</td>
                <td>{machine.line}</td>
                <td>{machine.part}</td>
                <td>{machine.target}</td>
                <td>{machine.plan}</td>
                <td>{machine.actual}</td>
                <td>{getStartTime(machine.produceTime)}</td>
                <td>{machine.produceTime}</td>
                <td>
                  {machine.oee}
                  {typeof machine.oee === "number" && "%"}
                </td>
                {/* <td>{machine.actual - machine.plan}</td> */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export { OeeChart, SumProduct, MachineStatus, HourChart, RenderTable };
