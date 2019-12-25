import React from 'react'
import Banner from './banner'
import Heaeder from './header'
import styled, { createGlobalStyle } from 'styled-components'
import styledNormalize from 'styled-normalize'

const GlobalStyle = createGlobalStyle`
  ${styledNormalize}
  html {
    font-size: 62.5%;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
  body {
    min-height: 100vh;
    font-family: Yuanti SC, BlinkMacSystemFont, Segsoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    font-size: 1.6rem;
    line-height: 1.6em;
    color: #696973;
    background-color: #f4f8fb;

    table-layout: fixed;
    word-wrap: break-word;
    word-break: normal;
    text-align: justify;
    text-justify: inter-ideograph;

    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -moz-font-feature-settings: "liga" on;
  }
`

const SiteContainer = styled.div``

const SiteMain = styled.div`
  background-color: transparent;
`

const SiteMainContent = styled.div`
  margin: 0 auto;
  max-width: 1040px;
  width: 100%;
  overflow: auto;
`

export default function ({ children }) {
  return (
    <>
      <GlobalStyle />
      <Banner />
      <Heaeder />
      <SiteContainer>
        <SiteMain>
          <SiteMainContent>
          { children }
          </SiteMainContent>
        </SiteMain>
      </SiteContainer>
    </>
  )
}