import React from "react";
import { navigate } from "@reach/router";

import { makeStyles, useTheme } from "@material-ui/styles";
import Link from "../components/Link";
import Typography from "@material-ui/core/Typography";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";

import "rc-slider/assets/index.css";
import Slider, { createSliderWithTooltip } from "rc-slider";

import ImageSprinkler from "../components/imgSprinkler";
import Loading from "../components/loading";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// utils --------------------------------------
import { fetchForecastData, currentModelMainFunction } from "../utils/api.js";
import reverse from "lodash.reverse";
import format from "date-fns/format";

// images
import SpraySprinkler from "../images/spraySprinkler.png";
import SingleStreamRotor from "../images/singleStreamRotorSprinkler.png";
import MultipleStreamRotor from "../images/multipleStreamRotorSprinkler.png";
import MoveableSprinkler from "../images/moveableSprinkler.png";

const SliderWithTooltip = createSliderWithTooltip(Slider);

const sprinklers = [
  {
    name: "Spray Sprinkler",
    img: SpraySprinkler,
    waterFlow: 0.024, // inches of water
    minutes: 1
  },
  {
    name: "Single Stream Rotor",
    img: SingleStreamRotor,
    waterFlow: 0.012,
    minutes: 1
  },
  {
    name: "Multiple Stream Rotor",
    img: MultipleStreamRotor,
    waterFlow: 0.055,
    minutes: 1
  },
  {
    name: "Moveable Sprinkler",
    img: MoveableSprinkler,
    waterFlow: 0.044,
    minutes: 1
  }
];

const useStyles = makeStyles(theme => ({
  root: {
    display: "grid",
    height: "100vh",
    gridTemplateRows: "auto 1fr auto"
  },
  header: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    padding: theme.spacing(2)
  },
  main: {
    display: "flex",
    flexDirection: "column"
    // justifyContent: "center"
  },
  containerList: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    padding: theme.spacing(0),
    marginLeft: -2
  },
  gridList: {
    flexWrap: "nowrap",
    transform: "translateZ(0)",
    width: "100%",
    height: "100%"
  },
  title: {
    color: "#fff",
    fontSize: "0.9rem"
  },
  titleBar: {
    background:
      "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)"
  },
  footer: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(7)
  },
  btnBig: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    background: theme.palette.primary.light,
    color: "#fff"
  },
  padding: {
    padding: theme.spacing(2, 4)
  },
  slider: {
    padding: theme.spacing(2, 4)
  },
  tipSlider: {
    background: "pink"
  }
}));

// Initial state ------------------------------------------------------
const initialState = () => {
  return {
    name: "",
    img: null,
    waterFlow: 0.05,
    minutes: 1
  };
};

// REDUCER ---------------------------------
function reducer(state, action) {
  switch (action.type) {
    case "setSprinkler":
      return {
        ...state,
        name: action.name,
        img: action.img,
        waterFlow: action.waterFlow,
        minutes: action.minutes
      };
    case "setMinutes":
      return { ...state, minutes: action.minutes };
    case "reset":
      return { name: "", img: null, waterFlow: 0, minutes: 1 };
    default:
      throw new Error();
  }
}

function SprinklerTypePage() {
  console.log("SprinklerTypePage");
  const classes = useStyles();
  const theme = useTheme();

  // State --------------------------------------------
  const [loading, setLoading] = React.useState(false);
  const [state, dispatch] = React.useReducer(reducer, initialState());

  const addField = async () => {
    setLoading(true);
    const location = JSON.parse(window.localStorage.getItem("LIT_location"));
    let irrigationDate = window.localStorage.getItem("LIT_irrigationDate");
    const dateArr = irrigationDate.split("-");
    const year = dateArr[0];
    irrigationDate = `${dateArr[1]}/${dateArr[2]}/${dateArr[0]}`;

    let field = { ...location, irrigationDate, sprinkler: { ...state } };
    field.id = Date.now();

    // get forecast data -----------------------------------------
    field.forecast = await fetchForecastData(field.lat, field.lng);

    // get data from Brian's call --------------------------------
    field.year = year;
    field.data = await currentModelMainFunction(
      field.lat,
      field.lng,
      field.year
    );

    // THRESHOLD ------------------------------------------------
    field.threshold = 2 * state.waterFlow * state.minutes; // inches

    // get the last 7 days to display in the field screen -------
    let sevenDays = [];

    // to eliminate 3rd forecast day.
    const data = field.data.slice(0, -1);

    const irrigationDateIdx = data.findIndex(d => d.date === irrigationDate);

    const idxMinusFourDays =
      irrigationDateIdx - 4 < 0 ? 0 : irrigationDateIdx - 4;
    const idxPlus2Days = irrigationDateIdx + 3;
    sevenDays = data.slice(idxMinusFourDays, idxPlus2Days);

    field.sevenDays = sevenDays.map(day => {
      const today = format(new Date(), "MM/dd/yyyy");
      day.threshold = field.threshold;
      day.yAxis =
        day.date === today ? "TODAY" : format(new Date(day.date), "MM/dd");
      day.color = day.deficit > day.threshold ? "red" : "green";
      day.index = data.findIndex(d => d.date === day.date);
      day.suggestion = day.deficit > field.threshold ? "WATER!" : "";
      day.watered = false;
      return day;
    });

    field.todaySuggestion = field.sevenDays.find(
      day => day.index === irrigationDateIdx
    ).suggestion;

    field.reversedSevenDays = reverse(field.sevenDays);

    let results = [];
    const fields = JSON.parse(
      window.localStorage.getItem("lawn-irrigation-tool")
    );

    fields ? (results = [field, ...fields]) : (results = [field]);

    window.localStorage.setItem(
      "lawn-irrigation-tool",
      JSON.stringify(results)
    );

    // cleaning up ----------------------------------------------
    window.localStorage.removeItem("LIT_location");
    window.localStorage.removeItem("LIT_irrigationDate");
    navigate("/main");
    setLoading(false);
  };

  // selecting the sprinkler --------------------------------------------
  function toggleImage(event) {
    if (event.target.value === state.name) {
      dispatch({ type: "reset" });
    } else {
      const spk = sprinklers.find(s => s.name === event.target.value);
      dispatch({
        type: "setSprinkler",
        name: spk.name,
        img: spk.img,
        waterFlow: spk.waterFlow,
        minutes: spk.minutes
      });
    }
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={classes.root}>
      <header className={classes.header}>
        <Link to="/irrigationDate" variant="button" style={{ padding: 8 }}>
          <FontAwesomeIcon icon="chevron-left" size="lg" />
        </Link>

        <Typography
          variant="subtitle1"
          align="center"
          style={{ marginLeft: -31 }}
        >
          Sprinkler Type - <small>step(3/3)</small>
        </Typography>
      </header>

      <main className={classes.main}>
        <div className={classes.padding}>
          <Typography variant="h6" align="center">
            What type of water system do you have?
          </Typography>

          <br />
          <Typography variant="caption" align="justify">
            As different types of sprinkler heads can deliver different volumes
            of water please choose the type of sprinkler heads that you have.
            <br />
            If none is selected, it defaults to the most commonly sold type in
            the region.
          </Typography>
        </div>

        <div className={classes.containerList}>
          <GridList className={classes.gridList} cols={1.5}>
            {sprinklers.map(sprinkler => {
              return (
                <GridListTile key={sprinkler.img}>
                  <ImageSprinkler src={sprinkler.img} />
                  {/* <img src={tile.img} alt={tile.title} /> */}
                  <GridListTileBar
                    title={sprinkler.name}
                    classes={{
                      root: classes.titleBar,
                      title: classes.title
                    }}
                    actionIcon={
                      <IconButton>
                        <Checkbox
                          checked={state.name === sprinkler.name}
                          onChange={toggleImage}
                          value={sprinkler.name}
                          style={{ color: "#fff" }}
                        />
                      </IconButton>
                    }
                  />
                </GridListTile>
              );
            })}
          </GridList>
        </div>

        <div style={{ padding: theme.spacing(2, 4) }}>
          <Typography variant="body2" align="center" gutterBottom>
            How long is the sprinkler running?
          </Typography>

          <br />
          <div style={{ width: 300, marginTop: theme.spacing(3) }}>
            <SliderWithTooltip
              // dots
              // activeDotStyle={{ borderColor: theme.palette.primary.light }}
              min={1}
              step={5}
              max={121}
              tipFormatter={e => `${e} min`}
              // tipProps={{ overlayClassName: "tipSlider" }}
              defaultValue={state.minutes}
              trackStyle={{ backgroundColor: theme.palette.primary.light }}
              handleStyle={{
                borderColor: theme.palette.primary.light,
                height: 28,
                width: 28,
                marginLeft: -14,
                marginTop: -12,
                backgroundColor: theme.palette.primary.light
              }}
              // railStyle={{ backgroundColor: "red", height: 10 }}
              onAfterChange={minutes =>
                dispatch({ type: "setMinutes", minutes })
              }
            />
          </div>
        </div>
      </main>

      <footer className={classes.footer}>
        <Button
          variant="contained"
          fullWidth
          classes={{ root: classes.btnBig }}
          onClick={addField}
        >
          Create Field
        </Button>
      </footer>
    </div>
  );
}

export default SprinklerTypePage;