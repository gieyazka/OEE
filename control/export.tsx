import { Production_Line } from "../interface/machine";
import XLSX from "xlsx-js-style";

const exportCSVFile = (items: Production_Line[]) => {
  let wscolsArr: any = [];
  const wb = XLSX.utils.book_new();
  const allcomWb = XLSX.utils.book_new();
  const headerStyle = {
    alignment: { vertical: "center", horizontal: "center" },
    font: {
      name: "Bai Jamjuree",
      color: { rgb: "FFFFFF" },
    },
    fill: {
      // bgColor: { rgb: "1D336D" },
    },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  };
  const rowStyle = {
    alignment: { vertical: "center", horizontal: "center" },
    font: {
      name: "Bai Jamjuree",
      // color: { rgb: "FFFFFF" },
    },
    // fill: {
    //   bgColor: { rgb: "ffffff" },
    // },
    // border: {
    //   top: { style: "thin", color: { rgb: "000000" } },
    //   left: { style: "thin", color: { rgb: "000000" } },
    //   bottom: { style: "thin", color: { rgb: "000000" } },
    //   right: { style: "thin", color: { rgb: "000000" } },
    // },
  };

  const header = Object.keys(items[0]).map((key) => {
    return {
      v: key,
      t: "s",
      s: headerStyle,
    };
  });

  let allcomRow: any = [header];

  let row: any = [header];
  let objectMaxLength: any = [];
  items.map((production, i: number) => {
    const arrData = Object.keys(production).map((key) => {
      // @ts-ignore
      return { v: production[key], t: "s", s: rowStyle };
    });

    // padding data in column Excel

    allcomRow.push(arrData);
    row.push(arrData);
  });
  const wscols = objectMaxLength.map((w: any) => {
    return { width: w };
  });
  wscolsArr.push(wscols);
  let ws = XLSX.utils.aoa_to_sheet(row);
  ws["!cols"] = wscols;

  XLSX.utils.book_append_sheet(wb, ws);

  //padding all company Data
  let newWidthWs: any = [];
  wscolsArr.map((data: any, i: number) => {
    data.map((d: any, index: number) => {
      if (newWidthWs[index] === undefined) {
        newWidthWs[index] = [d];
      } else {
        newWidthWs[index].push(d);
      }
    });
  });
  XLSX.writeFile(wb, `Machine Data` + ".xlsx" || "export.xlsx");

  return null;
};

export { exportCSVFile };
