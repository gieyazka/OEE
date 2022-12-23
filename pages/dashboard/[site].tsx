import {
  HourChart,
  MachineStatus,
  OeeChart,
  RenderTable,
  SumProduct,
} from "../../model/dashboard";
import { getShift, useSite } from "../../control/controller";
import { useEffect, useMemo } from "react";

import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import { Machine } from "../../interface/machine";
import axios from "axios";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";

export default function Dashboard(props: {
  machineName : Machine[]
}) {
  const site = useSite();
  const shift = getShift();
  // console.log(props);
  // console.table(props.machineName);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }, []);
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
              <OeeChart className=" mt-6 mx-auto" />
            </div>
            <div
              className=" w-full px-8 overflow-hidden "
              style={{ maxHeight: "15vh" }}
            >
              <SumProduct />
            </div>
            <div
              className=" mt-4 w-full px-8 overflow-hidden"
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
            <RenderTable machineName={props.machineName}/>
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
    newMachine.push({
      id: machineName.data.data[i].id,
      ...machineName.data.data[i].attributes,
    });
  }
  
  
  const res = await axios.get(`http://${host}/api/getFile/${site}`); // check Json file and Add
  return {
    props: {
      host: host || null,
      data: res.data,
      machineName: newMachine,
    }, // will be passed to the page component as props
  };
}
