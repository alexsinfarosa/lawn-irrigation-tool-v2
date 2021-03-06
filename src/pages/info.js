import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Navigation from "../components/navigation"
import About from "../components/about"
import HowToUseApp from "../components/howToUseApp"

import { makeStyles } from "@material-ui/styles"
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { StyledLink } from "../components/styled/sharedComponents"
import { InfoContainer } from "../components/styled/sharedComponents"

import AppContext from "../appContext"

const useStyles = makeStyles(theme => ({
  tabs: {
    height: 80,
    background: theme.palette.background.default,
  },
}))

const InfoPage = () => {
  const classes = useStyles()

  const { countRef, setCountRef } = React.useContext(AppContext)
  const [value, setValue] = React.useState(1)

  function handleChange(event, newValue) {
    setValue(newValue)
  }

  return (
    <Layout>
      <SEO title="Info Page" />

      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
        centered
        className={classes.tabs}
      >
        <Tab
          disabled={countRef === 0 ? true : false}
          style={{ paddingRight: 48, paddingLeft: 48 }}
          label="About"
          icon={<FontAwesomeIcon icon={["fal", "info"]} size="lg" />}
        />
        <Tab
          style={{ paddingRight: 48, paddingLeft: 48 }}
          label="How it works?"
          icon={<FontAwesomeIcon icon={["fal", "question-circle"]} size="lg" />}
        />
      </Tabs>
      {value === 0 && (
        <InfoContainer>
          <About />
        </InfoContainer>
      )}
      {value === 1 && (
        <InfoContainer>
          <HowToUseApp />
        </InfoContainer>
      )}

      {countRef === 0 ? (
        <StyledLink
          to={"/lawn/"}
          onClick={() => {
            setCountRef(countRef + 1)
          }}
          style={{
            width: 250,
            padding: 24,
            textAlign: "center",
            margin: "auto",
          }}
        >
          OK
        </StyledLink>
      ) : (
        <Navigation />
      )}
    </Layout>
  )
}

export default InfoPage
