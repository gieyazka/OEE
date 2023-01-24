import { Dayjs } from "dayjs";

export interface searchData {
  startDate: Dayjs | null;
  startHr: string | null;
  startMin: string | null;
  endDate: Dayjs | null;
  endHr: string | null;
  endMin: string | null;
}



export interface filterData {
  machine: string[],
  shift: string | null,
}