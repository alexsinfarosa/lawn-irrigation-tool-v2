/* eslint-disable react/prop-types */

import React from "react";
import { install } from "@material-ui/styles";
import { ThemeProvider } from "@material-ui/styles";
import theme from "./.cache/theme";

import AppProvider from "./src/store/provider";

import { library } from "@fortawesome/fontawesome-svg-core";

import {
  faChevronLeft,
  faHome,
  faGripHorizontal,
  faPlus,
  faCloudSun,
  faBolt,
  faSun,
  faSnowflake,
  faCloudRain,
  faWater,
  faTrash,
  faTimes,
  faCheck
} from "@fortawesome/free-solid-svg-icons";
// all fontawesome icons of the project
library.add(
  faChevronLeft,
  faHome,
  faGripHorizontal,
  faPlus,
  faCloudSun,
  faBolt,
  faSun,
  faSnowflake,
  faCloudRain,
  faWater,
  faTrash,
  faTimes,
  faCheck
);

install();

export const onInitialClientRender = () => {
  if (process.env.BUILD_STAGE === `develop`) {
    return;
  }

  // Remove the server-side injected CSS.
  const jssStyles = document.querySelector("#jss-server-side");
  jssStyles.parentNode.removeChild(jssStyles);
};

export const wrapRootElement = ({ element }) => {
  return (
    <AppProvider>
      <ThemeProvider theme={theme}>{element}</ThemeProvider>;
    </AppProvider>
  );
};
