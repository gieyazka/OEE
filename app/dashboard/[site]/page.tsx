"use client";

import {
  HourChart,
  MachineStatus,
  OeeChart,
  RenderTable,
  SumProduct,
} from "../../../model/dashboard";
import {
  getAvgPercent,
  getHours,
  getHoursTime,
  getServer,
  useHost,
  useSite,
} from "../../../control/controller";
import {
  getShift,
  useAllmc,
  useData,
  useMachineName,
} from "../../../control/api";
import { use, useEffect, useMemo } from "react";

import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import { Machine } from "../../../interface/machine";
import { SWRConfig } from "swr";
import axios from "axios";
import dayjs from "dayjs";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/navigation";

async function getMachine(url: string) {
  const res = await fetch(url);
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  return res.json();
}
export default function Page(props: {
  params: { site: string };
  machineName: Machine[];
  fallback: any;
  intervalData: [];
}) {
  // SWR hooks inside the `SWRConfig` boundary will use those values.
  const site = props.params.site.toUpperCase();

  const machineName = useMachineName(site);

  let newMachine: Machine[] = [];
  if (machineName.data !== undefined) {
    for (const element of machineName.data.data) {
      delete element.attributes.createdAt;
      delete element.attributes.updatedAt;
      newMachine.push({
        id: element.id,
        ...element.attributes,
      });

      //TODO: fetch all data in here and useSWR to refreashData
    }
  }

  const data = {
    shift: getShift(),
    site,
    machineName: newMachine,
  };

  return (
    <SWRConfig
      value={{
        // fallback: props.fallback,
        // fallbackData: props.intervalData,
        refreshInterval: 10000,
        refreshWhenHidden: true,
      }}
    >
      <Dashboard {...data} />
    </SWRConfig>
  );
}
export function Dashboard(props: {
  machineName: Machine[];
  intervalData?: [];
  shift: string;
  site: string;
}) {
  let machineName = props.machineName;
  let statusUrl: string[] = [];
  let produceUrl: string[] = [];
  let OeeUrl: string[] = [];
  const host = useHost();

  for (const element of machineName) {
    statusUrl.push(
      host +
        `/api/getStatus?site=${element.site}&area=${element.aera}&line=${element.line}`
    );
    produceUrl.push(
      host +
        `/api/getProduce?site=${element.site}&area=${element.aera}&line=${element.line}`
    );
    OeeUrl.push(
      host +
        `/api/getOee?site=${element.site}&area=${element.aera}&line=${element.line}`
    );
  }

  const statusMc = useAllmc(statusUrl);
  const produceMc = useAllmc(produceUrl);
  const oeeMc = useAllmc(OeeUrl);
  let sumPercentage = 0;
  let noData = 0;

  let sumData = {
    target: 0,
    plan: 0,
    actual: 0,
  };
  let sumMachine = {
    total: statusMc.data ? statusMc.data.length : 0,
    running: 0,
    idle: 0,
    stop: 0,
    planDowntime: 0,
  };
  for (let i = 0; i < machineName.length; i++) {
    machineName[i].status = statusMc.data && statusMc.data[i].status;
    machineName[i].part = statusMc.data && statusMc.data[i].part;
    machineName[i].actual = statusMc.data && statusMc.data[i].actual;
    machineName[i].target = statusMc.data && statusMc.data[i].target;
    machineName[i].plan = statusMc.data && statusMc.data[i].plan;
    machineName[i].produceTime =
      produceMc.data && produceMc.data[i].produceTime;

    if (statusMc.data) {
      if (typeof statusMc.data[i].target === "number") {
        sumData.target += statusMc.data[i].target;
      }
      if (typeof statusMc.data[i].plan === "number") {
        sumData.plan += statusMc.data[i].plan;
      }
      if (typeof statusMc.data[i].plan === "number") {
        sumData.actual += statusMc.data[i].actual;
      }
      if (statusMc.data[i].status === "execute") {
        sumMachine.running += 1;
      } else if (statusMc.data[i].status === "idle") {
        sumMachine.idle += 1;
      } else if (statusMc.data[i].status === "plan_downtime") {
        sumMachine.planDowntime += 1;
      } else {
        sumMachine.stop += 1;
      }
    }

    if (oeeMc.data) {
      machineName[i].oee = oeeMc.data && oeeMc.data[i].oee;
      if (typeof oeeMc.data[i].oee === "number") {
        sumPercentage += oeeMc.data[i].oee;
      } else {
        noData += 1;
        sumPercentage += 0;
      }
    }
  }
  let avgPercentage: number | null = getAvgPercent(
    sumPercentage,
    machineName.length,
    noData
  );

  return (
    <>
      <Head>
        <title>OEE Dashboard</title>
        <meta name="description" content="Dashboard for factory work detail" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className="w-screen h-screen relative overflow-hidden"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div
          className=" bg-blue-900  text-white  flex justify-center items-center "
          style={{ height: "5vh" }}
        >
          <h1 style={{ fontSize: "3vh" }} className=" font-bold ">
            Production Monitoring ({props.site} {props.shift})
          </h1>
        </div>
        <div className=" flex mx-2">
          <div
            className=" flex flex-col items-center "
            style={{
              flexBasis: "24%",
              height: "calc(100vh - 5vh)",
              overflow: "hidden",
              // backgroundColor: "red",
            }}
          >
            <div
              className="border border-gray-200 rounded-lg shadow-md mt-4   "
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "25vh" }}>
                <OeeChart
                  avgPercentage={avgPercentage}
                  className=" mt-6 mx-auto"
                />
              </div>
            </div>
            <div
              className=" w-full px-8 overflow-hidden  whitespace-nowrap border border-gray-200 rounded-lg shadow-md mt-4 py-4"
              style={{ maxHeight: "20vh" }}
            >
              <SumProduct sumData={sumData} />
            </div>
            <div
              className=" mt-2 w-full px-8 overflow-hidden  whitespace-nowrap border border-gray-200 rounded-lg shadow-md py-2 "
              style={{ maxHeight: "20vh" }}
            >
              <MachineStatus sumMachine={sumMachine} />
            </div>
            {/* <div
              className=" mt-4 mb-2 w-full  flex justify-center overflow-hidden flex-1"
              style={{}}
            >
              <HourChart />
            </div> */}
          </div>

          <div className=" flex-1 ">
            {machineName.length !== 0 && (
              <RenderTable
                machineName={props.machineName}
                masterData={[]} // use for ssr render
                mcData={machineName}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
