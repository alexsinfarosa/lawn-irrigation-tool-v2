import React from "react";
import { Context } from "../store/createContext";
import { makeStyles, useTheme } from "@material-ui/styles";

import SwipeableViews from "react-swipeable-views";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// components
import DayCard from "../components/dayCard";
import BarChart from "../components/barChart";

const useStyles = makeStyles(theme => ({
  root: {
    display: "grid",
    gridTemplateRows: "80px auto",
    height: "100vh"
  },
  header: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    justifyItems: "center",
    padding: theme.spacing(0, 4),
    background: theme.palette.background.default
  },
  main: {
    overflow: "auto",
    height: "calc(100vh - 80px)"
  },
  btnBig: {
    paddingTop: theme.spacing(2, 5)
  }
}));

const days = [
  {
    address: "114 Cayuga St.",
    date: "Monday February 25th",
    temp: 20,
    pcpn: 5,
    shouldWater: true
  },
  {
    address: "114 Cayuga St.",
    date: "Sunday February 24th",
    temp: 14,
    pcpn: 80,
    shouldWater: false
  },
  {
    address: "114 Cayuga St.",
    date: "Saturday February 23th",
    temp: 15,
    pcpn: 10,
    shouldWater: true
  }
];

const Field = ({ handleMainPageIdx }) => {
  console.log("Field");
  const classes = useStyles();
  const theme = useTheme();
  const { field } = React.useContext(Context);
  const [dayCardIdx, setDayCardIdx] = React.useState(1);
  const handleDayCardIdx = i => setDayCardIdx(i);
  console.log(field);

  return (
    <div className={classes.root}>
      <header className={classes.header}>
        <FontAwesomeIcon
          icon="cloud-sun"
          size="lg"
          onClick={() => handleMainPageIdx(0)}
        />
        <FontAwesomeIcon
          icon="home"
          size="lg"
          color={theme.palette.secondary.main}
        />
        <FontAwesomeIcon
          icon="grip-horizontal"
          size="lg"
          onClick={() => handleMainPageIdx(2)}
        />
      </header>

      <main className={classes.main}>
        {/* grid top */}

        <SwipeableViews
          index={dayCardIdx}
          onChangeIndex={() => handleDayCardIdx(dayCardIdx)}
          enableMouseEvents
        >
          {days.map(day => (
            <DayCard key={day.date} day={day} />
          ))}
        </SwipeableViews>

        {/* grid bottom */}
        <BarChart />
      </main>
    </div>
  );
};

export default React.memo(Field);
