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
import React, { use, useEffect, useState } from "react";
import {
  fetchApi,
  getHours,
  getShift,
  useSite,
  useStatusMc,
} from "../control/controller";

import { Bar } from "react-chartjs-2";
import { Machine } from "../interface/machine";
import useSWR from "swr";

const OeeChart = (props: { className: string }) => {
  return (
    <div className={props.className}>
      <CircularProgressbarWithChildren
        value={40}
        circleRatio={0.65}
        styles={buildStyles({
          rotation: 0.675,
          strokeLinecap: "butt",
          trailColor: "#eee",
          pathColor: "green",
        })}
      >
        <strong className="text-3xl">20%</strong>
        <strong className="absolute bottom-8 text-lg">OEE</strong>
      </CircularProgressbarWithChildren>
    </div>
  );
};

const SumProduct = () => {
  return (
    <div className=" text-center">
      <strong className=" text-2xl">Production Summary</strong>
      <div className="flex flex-col ">
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Target
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Value
          </p>
        </div>
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Plan
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Value
          </p>
        </div>{" "}
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Actual
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Value
          </p>
        </div>{" "}
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Diff.
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Value
          </p>
        </div>
      </div>
    </div>
  );
};

const MachineStatus = () => {
  return (
    <div className="text-center">
      <strong className=" text-2xl  mx-auto">Machine Status</strong>
      <div className="flex flex-col ">
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Machine Total
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Value
          </p>
        </div>
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Running
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Value
          </p>
        </div>{" "}
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Idle
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Value
          </p>
        </div>{" "}
        <div className="flex justify-between ">
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Stop
          </p>
          <p style={{ fontSize: "1.5vh" }} className="font-semibold">
            Value
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
        text: "Chart.js Horizontal Bar Chart",
      },
    },
  };

  const labels = getHours();

  const data = {
    labels,
    datasets: [
      {
        label: "Dataset 1",
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
        label: "Dataset 2",
        data: labels.map(() => [0, 100]), // array of array
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };
  return <Bar options={options} data={data} />;
};

const RenderTable = ({ machineName }: { machineName: Machine[] }) => {
  
  // console.table(machineName);
  let test = useStatusMc(1);
  
  let newData = machineName.map((data) => {
    return { ...data, status: JSON.stringify(test.data !== undefined ? test.data.results[0].series[0].values[0][0] : null) };
  });
  // console.log(newData);

  // console.log(test);
  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: () => <span>Status</span>,
        accessorFn: (row: Machine) => {
        // console.log(row);
        return row.status
        },
        id: "Status",
        cell: (info) => {
          return info.getValue();
        },
        footer: (props) => props.column.id,
      },
      {
        header: () => <span>Machine</span>,
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
      pageIndex: 0,
      pageSize: 33,
    });

  const fetchDataOptions = {
    pageIndex,
    pageSize,
  };
  const defaultData = React.useMemo(() => [], []);
  const dataQuery = useSWR(
    ["data", fetchDataOptions],
    () => fetchApi(fetchDataOptions, newData),
    { keepPreviousData: true,refreshInterval : 5000 }
  );

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: dataQuery.data?.rows ?? defaultData,
    // data: dataQuery.data?.rows ?? defaultData,
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
      {JSON.stringify(test.data)}
      <table className="mt-4 w-full border-4">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="bg-green-100 " key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                // console.log(header);

                return (
                  <th
                    className="border-blue-500 border-2 "
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
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr
                key={row.id}
                className={
                  parseInt(row.id) % 2 === 0 ? " bg-white" : "bg-green-100"
                }
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td
                      className="text-center"
                      style={{ fontSize: "1.58vh" }}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        {/* <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span> */}

        {/* <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border p-1 rounded w-16"
          />
        </span> */}
      </div>
    </div>
  );
};

export { OeeChart, SumProduct, MachineStatus, HourChart, RenderTable };
