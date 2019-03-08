import React from "react";

import { makeStyles, useTheme } from "@material-ui/styles";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, Cell } from "recharts";

// utils
import reverse from "lodash.reverse";
import format from "date-fns/format";
import isAfter from "date-fns/isAfter";
import subDays from "date-fns/subDays";
import addDays from "date-fns/addDays";
import { runWaterDeficitModel } from "../utils/api";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2, 0)
    // background: "pink"
  }
}));

const reversedLastDays = field => {
  // only latest value to display on the barChart
  const irrigationDateIdx = field.data.findIndex(
    d => d.date === field.irrigationDate
  );
  const idxMinus7Days = irrigationDateIdx - 7 < 0 ? 0 : irrigationDateIdx - 7;
  const idxPlus2Days = irrigationDateIdx + 3;

  // console.log(results);
  return reverse(field.data.slice(idxMinus7Days, idxPlus2Days));
};

const determineDomain = lastDays => {
  const min = Math.min(...lastDays.map(d => d.barDeficit));
  const max = Math.max(...lastDays.map(d => d.barDeficit));

  const absMin = Math.abs(min);
  const absMax = Math.abs(max);

  let start = -1;
  let end = 1;
  const domain = Math.max(absMin, absMax).toFixed(2);
  start = Number(domain) * -1;
  end = Number(domain);

  // console.log(start, end);
  return [start, end];
};

function BarChartDeficit({ field, setField, setFields }) {
  console.log("BarChart");
  const classes = useStyles();
  const theme = useTheme();

  const [lastUpdate, setLastUpdate] = React.useState(field.updated);
  const [lastDays, setLastDays] = React.useState(reversedLastDays(field));

  const watered = date => {
    const copy = { ...field };
    const index = copy.data.findIndex(d => d.date === date);
    const water = copy.sprinkler.waterFlow * copy.sprinkler.minutes;
    const day = copy.data[index];
    day.waterAppliedByUser = day.waterAppliedByUser === 0 ? water : 0;
    day.waterAppliedByUser === 0
      ? (day.pcpn = day.pcpn - water)
      : (day.pcpn = day.pcpn + water);

    const pcpns = copy.data.map(d => d.pcpn);
    const pets = copy.data.map(d => d.pet);
    const updatedDeficit = runWaterDeficitModel(pcpns, pets);

    const updatedData = copy.data.map((day, i) => {
      let p = { ...day };
      p.deficit = +updatedDeficit.deficitDaily[i].toFixed(2);
      p.barDeficit =
        p.deficit >= 0 ? p.deficit - p.threshold : p.deficit - p.threshold;
      return p;
    });
    copy.data = updatedData;
    copy.updated = Date.now();
    setLastUpdate(copy.updated);
    setField(copy);
    setLastDays(reversedLastDays(copy));

    const localStorageRef = JSON.parse(
      window.localStorage.getItem("lawn-irrigation-tool")
    );
    const fieldIdx = localStorageRef.findIndex(f => (f.id = copy.id));
    localStorageRef[fieldIdx] = copy;
    setFields(localStorageRef);
    // setFields(localStorageRef);
    window.localStorage.setItem(
      "lawn-irrigation-tool",
      JSON.stringify(localStorageRef)
    );
  };

  // const XaxisLabel = props => {
  //   const { x, y, index } = props;
  //   return (
  //     <g transform={`translate(${x},${y})`}>
  //       <text
  //         x={0}
  //         y={0}
  //         dy={16}
  //         textAnchor={index === 0 ? "start" : "end"}
  //         fill={index === 0 ? "#F79824" : "#0197F6"}
  //         fontSize="0.8rem"
  //         fontWeight="bold"
  //       >
  //         {index === 0 ? "DRY" : "WET"}
  //       </text>
  //     </g>
  //   );
  // };

  const XaxisLabel = props => {
    const { x, y, index } = props;
    return (
      <svg width={20} height={20} x={x - 10} y={y + 3}>
        {index === 0 ? (
          <FontAwesomeIcon icon="tint" color={theme.palette.grey["300"]} />
        ) : (
          <FontAwesomeIcon icon="tint" color={"#0197F6"} />
        )}
      </svg>
    );
  };

  const YaxisLabel = props => {
    const { x, y, payload } = props;
    const date = payload.value;
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const yesterday = subDays(today, 1);
    const formatted = date => format(date, "MM/dd/yyyy");

    let day = "";
    if (date === formatted(tomorrow)) day = "tomorrow";
    if (date === formatted(today)) day = "today";
    if (date === formatted(yesterday)) day = "yesterday";

    const text = day => {
      switch (day) {
        case "tomorrow":
          return <tspan fontSize="1rem">Tomorrow</tspan>;
        case "today":
          return (
            <tspan fontWeight="bold" fill="red" fontSize="1.2rem">
              TODAY
            </tspan>
          );
        case "yesterday":
          return <tspan fontSize="1rem">Yesterday</tspan>;
        default:
          return (
            <tspan fontSize="1rem">{format(new Date(date), "E do")}</tspan>
          );
      }
    };

    return (
      <g>
        <text x={x - 80} y={y} dy={5} fill="#666">
          {text(day)}
        </text>
      </g>
    );
  };

  const RightIconButtons = props => {
    const { y, index, payload } = props;
    return (
      <svg width={30} height={30} x={window.innerWidth - 50} y={y - 16}>
        {isAfter(new Date(lastDays[index].date), new Date()) ? (
          <FontAwesomeIcon
            icon="cloud-sun"
            size="1x"
            color={theme.palette.text.secondary}
          />
        ) : lastDays[index].waterAppliedByUser === 0 ? (
          <FontAwesomeIcon
            icon="tint"
            color={theme.palette.grey["300"]}
            onClick={() => watered(payload.value)}
          />
        ) : (
          <FontAwesomeIcon
            icon="tint"
            color={"#0197F6"}
            onClick={() => watered(payload.value)}
          />
        )}
      </svg>
    );
  };

  return (
    <div className={classes.root}>
      <BarChart
        layout="vertical"
        width={window.innerWidth}
        height={window.innerHeight - 150}
        data={lastDays}
        maxBarSize={20}
        margin={{ top: 0, right: 40, left: 50, bottom: 8 }}
      >
        <XAxis
          type="number"
          tick={<XaxisLabel />}
          tickCount={2}
          ticks={determineDomain(lastDays)}
          stroke={theme.palette.grey["300"]}
          domain={determineDomain(lastDays)}
        />

        {/* Left dates */}
        <YAxis
          dataKey="date"
          type="category"
          orientation="left"
          tickLine={false}
          axisLine={false}
          tick={<YaxisLabel />}
        />

        {/* RIght Icons */}
        <YAxis
          dataKey="date"
          yAxisId="right"
          type="category"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tick={<RightIconButtons lastDays={lastDays} />}
        />

        <ReferenceLine x={0} stroke={theme.palette.grey["300"]} />

        <Bar dataKey="barDeficit" minPointSize={0} radius={[0, 20, 20, 0]}>
          {lastDays.map(day => {
            return (
              <Cell
                key={day.date}
                fill={day.barDeficit >= 0 ? "#0197F6" : "#F79824"}
              />
            );
          })}
        </Bar>
      </BarChart>
    </div>
  );
}

export default BarChartDeficit;
