import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Navigation from "../components/navigation"
import { MainContainer } from "../components/styled/sharedComponents"
import Loading from "../components/loading"
import LawnGraph from "../components/lawnGraph"

import AppContext from "../appContext"

import Typography from "@material-ui/core/Typography"
import Box from "@material-ui/core/Box"

const LawnPage = () => {
  const { lawn, loading } = React.useContext(AppContext)

  if (loading) return <Loading />
  return (
    <Layout>
      <SEO title="Lawn Page" />

      {lawn.id !== null ? (
        <MainContainer>
          <LawnGraph lawn={lawn} />
        </MainContainer>
      ) : (
        <MainContainer>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
          >
            <Typography variant="subtitle1">Create a new Lawn</Typography>
          </Box>
        </MainContainer>
      )}

      <Navigation />
    </Layout>
  )
}

export default LawnPage
