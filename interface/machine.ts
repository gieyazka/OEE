export interface Machine {
    status: string;
    id : number,
    site : string,
    aera : string,
    line : string,
    base : string,
    part : string,
    actual : number,
    target : number,
    plan : number,
    produceTime : number,
    oee : number
    
}
export interface Production_Line { 
    id: number;
    Plant: string;
    Production_Line: string;
    Alias_Name: string;
    Plan_Target: string;
    Actual: string;
    NG?: string | null;
    Running_Utilization: string;
    Idle_Utilization: string;
    Stop_Utilization: string;
    Start: string;
    Shift? : string | null;
    Stop: string;
    CycleTime: string;
    Performance: string;
    Quality: string;
    Availability: string;
    Production_Time: string;
    Plan_downtime: string;
    Standard_time: string;
    A_Plan: string;
    A_Actual: string;
    P_Plan: string;
    Plan?: string;
    P_Actual: string;
    PartNo_Oracle?: null;
    PartName_Oracle: string;

  }