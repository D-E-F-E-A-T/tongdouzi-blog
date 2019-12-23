import React from 'react'
import Banner from './banner'
import Heaeder from './header'
import styled, { createGlobalStyle } from 'styled-components'
import styledNormalize from 'styled-normalize'

const GlobalStyle = createGlobalStyle`
  ${styledNormalize}
  body {
    font-family: Yuanti SC, BlinkMacSystemFont, Segsoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`

const SiteContainer = styled.div`
  color: #696973;
  background-color: #f4f8fb;
  table-layout: fixed;
  word-wrap: break-word;
  word-break: normal;
  text-align: justify;
  text-justify: inter-ideograph;
`

const SiteMain = styled.div`
  background-color: transparent;
`

const SiteMainContent = styled.div`
  margin: 0 auto;
  max-width: 1040px;
  width: 100%;
  min-height: 100vh;
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