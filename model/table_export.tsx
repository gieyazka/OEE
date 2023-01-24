import { Production_Line } from "../interface/machine";

const RenderExportTable = ({
  productionData,
}: {
  productionData: Production_Line[];
}) => {
  return (
    <table
      className="mt-4 w-3/4 relative "
      style={{
        borderRadius: "1em 1em 0 0",
        // overflow: "hidden",
      }}
    >
      <thead className=" h-10 relative overflow-auto border-separate">
        <tr
          style={{ backgroundColor: "#0087DC", color: "white" }}
          className="sticky top-0 "
        >
          {Object.keys(productionData[0]).map((key, index) => (
            <th
              className="px-2 "
              key={key}
              style={{
                borderTopLeftRadius: `${index === 0 ? "6px" : "0px"}`,
                borderTopRightRadius: `${
                  Object.keys(productionData[0]).length === index - 1
                    ? "6px"
                    : "0px"
                }`,
              }}
            >
              {key}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="text-center ">
        {productionData.map((production, index) => (
          <tr
            className={`border-2 ${
              index % 2 != 0 ? "bg-white" : "bg-gray-300"
            }`}
            key={production.id}
          >
            {Object.keys(production).map((key) => {
              return (
                <td key={production.id + key}>
                  <div
                    className={`text-center px-2`}
                    //   style={{ minWidth: "75%", margin: "1px 0px 1px 0px" }}
                  >
                    {/* @ts-ignored */}
                    {production[key]}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export { RenderExportTable };
