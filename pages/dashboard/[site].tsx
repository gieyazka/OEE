import {
  HourChart,
  MachineStatus,
  OeeChart,
  RenderTable,
  SumProduct,
} from "../../model/dashboard";
import {
  getShift,
  useAllmc,
  useData,
  useHost,
  useSite,
} from "../../control/controller";
import { useEffect, useMemo } from "react";

import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import { Machine } from "../../interface/machine";
import { SWRConfig } from "swr";
import axios from "axios";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";

export default function Page(props: {
  machineName: Machine[];
  fallback: any;
  intervalData: [];
  machineArr: [];
}) {
  // SWR hooks inside the `SWRConfig` boundary will use those values.

  return (
    <SWRConfig
      value={
        {
          // fallback: props.fallback,
          // fallbackData: props.intervalData,
          // refreshInterval: 5000,
        }
      }
    >
      <Dashboard {...props} />
    </SWRConfig>
  );
}
export function Dashboard(props: {
  machineArr: any;
  machineName: Machine[];
  intervalData?: [];
}) {
  const site = useSite();
  const shift = getShift();
  // const { data } = useData(props.machineName);

  let machineName = props.machineArr;
  let statusUrl: string[] = [];
  let produceUrl: string[] = [];
  let OeeUrl: string[] = [];
  const host = useHost();
  for (let i = 0; i < machineName.length; i++) {
    statusUrl.push(
      host +
        `/api/getStatus?site=${machineName[i].site}&area=${machineName[i].aera}&line=${machineName[i].line}`
    );
    produceUrl.push(
      host +
        `/api/getProduce?site=${machineName[i].site}&area=${machineName[i].aera}&line=${machineName[i].line}`
    );
    OeeUrl.push(
      host +
        `/api/getOee?site=${machineName[i].site}&area=${machineName[i].aera}&line=${machineName[i].line}`
    );
  }

  const statusMc = useAllmc(statusUrl);
  const produceMc = useAllmc(produceUrl);
  const oeeMc = useAllmc(OeeUrl);
  let sumPercentage = 0;
  let noData = 0;
  let avgPercentage: number | null = null;
  // if (statusMc.data) {
  for (let i = 0; i < machineName.length; i++) {
    machineName[i].status = statusMc.data && statusMc.data[i].status;
    machineName[i].part = statusMc.data && statusMc.data[i].part;
    machineName[i].actual = statusMc.data && statusMc.data[i].actual;
    machineName[i].target = statusMc.data && statusMc.data[i].target;
    machineName[i].plan = statusMc.data && statusMc.data[i].plan;
    machineName[i].produceTime =
      produceMc.data && produceMc.data[i].produceTime;
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

  avgPercentage = Math.round(sumPercentage / (machineName.length - noData));

  // }

  return (
    <>
      <Head>
        <title>OEE Dashboard</title>
        <meta name="description" content="Dashboard for factory work detail" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="w-screen h-screen bg-red-50 relative overflow-hidden">
        <div
          className=" bg-blue-900  text-white  flex justify-center items-center "
          style={{ height: "5vh" }}
        >
          <h1 style={{ fontSize: "3vh" }} className=" font-bold ">
            Production Monitoring ({site} {shift})
          </h1>
        </div>
        <div className=" flex ">
          <div
            className=" flex flex-col items-center "
            style={{
              flexBasis: "24%",
              height: "calc(100vh - 5vh)",
              overflow: "hidden",
              // backgroundColor: "red",
            }}
          >
            <div style={{ width: "25vh" }}>
              <OeeChart
                avgPercentage={avgPercentage}
                className=" mt-6 mx-auto"
              />
            </div>
            <div
              className=" w-full px-8 overflow-hidden  whitespace-nowrap"
              style={{ maxHeight: "15vh" }}
            >
              <SumProduct />
            </div>
            <div
              className=" mt-4 w-full px-8 overflow-hidden  whitespace-nowrap"
              style={{ maxHeight: "15vh" }}
            >
              <MachineStatus />
            </div>
            <div
              className=" mt-4 mb-2 w-full  flex justify-center overflow-hidden flex-1"
              style={{}}
            >
              <HourChart />
            </div>
          </div>

          <div className=" flex-1 ">
            <RenderTable
              machineName={props.machineName}
              masterData={[]} // use for ssr render
              mcData={machineName}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: any) {
  let host = context.req.headers.host;
  const site = (context.query.site as string).toUpperCase();

  const machineName = await axios.get(
    `http://10.20.10.209:1337/api/equipments?site=${site}`
  );
  let newMachine: Machine[] = [];
  for (let i = 0; i < machineName.data.data.length; i++) {
    delete machineName.data.data[i].attributes.createdAt;
    delete machineName.data.data[i].attributes.updatedAt;
    newMachine.push({
      id: machineName.data.data[i].id,
      ...machineName.data.data[i].attributes,
    });

    //TODO: fetch all data in here and useSWR to refreashData
  }

  const res = await axios.get(`http://${host}/api/getFile/${site}`); // check Json file and Add

  return {
    props: {
      host: host || null,
      data: res.data,
      // intervalData: getData.data,
      machineName: newMachine,
      machineArr: newMachine,
      // fallback: {
      //   "/api/intervalData": getData.data,
      // },
    }, // will be passed to the page component as props
  };
}
