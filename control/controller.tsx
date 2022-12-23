import useSWR, { Fetcher, Key } from "swr";

import { Machine } from "../interface/machine";
import axios from "axios";
import dayjs from "dayjs";
import { useRouter } from "next/router";

const fetcher: Fetcher<any, string> = (url) =>{
 return  axios.get(url).then((res) => res.data);
}
const useSite = () => {
  const router = useRouter();

  const { site } = router.query;
  return (site as string)?.toUpperCase();
};
const useHost = () => {
  const router = useRouter();

  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";

  const URL = `${origin}`;
  return URL;
};
const getShift = () => {
  let currentTime = dayjs().format("HH:mm");
  if (currentTime >= "08:00" && currentTime <= "19:59") {
    return "Day Shift";
  }
  return "Night Shift";
};
const getBoolShift = () => {
  let currentTime = dayjs().format("HH:mm");
  if (currentTime >= "08:00" && currentTime <= "19:59") {
    return true;
  }
  return false;
};
const getHours = () => {
  if (getBoolShift()) {
    return [
      "8 AM",
      "9 AM",
      "10 AM",
      "11 AM",
      "12 AM",
      "1 PM",
      "2 PM",
      "3 PM",
      "4 PM",
      "5 PM",
      "6 PM",
      "7 PM",
    ];
  }
  return [
    "8 PM",
    "9 PM",
    "10 PM",
    "11 PM",
    "12 PM",
    "1 AM",
    "2 AM",
    "3 AM",
    "4 AM",
    "5 AM",
    "6 AM",
    "7 AM",
  ];
};

const fetchApi = (options: { pageIndex: number; pageSize: number },data : Machine[]) => {
  // Simulate some network latency
  // let i = 0;
  // let data = [];
  // while (i < 60) {
  //   i++;
  //   data.push({
  //     firstName: `TTest${i}`,
  //     lastName: "LAST",
  //   });
  // }
  let cloneData = [...data];
  return {
    old: cloneData,
    rows: data.slice(
      options.pageIndex * options.pageSize,
      (options.pageIndex + 1) * options.pageSize
    ),
    pageCount: Math.ceil(data.length / options.pageSize),
  };
};

const useStatusMc = () => {
  
  const { data, error, isLoading } = useSWR( useHost()+"/api/getStatus?site=aa&area=mca&line=a1", fetcher, { refreshInterval: 5000 });
  return {data,error,isLoading}
};

export { getShift, useSite, getHours, fetchApi,useHost ,useStatusMc};
