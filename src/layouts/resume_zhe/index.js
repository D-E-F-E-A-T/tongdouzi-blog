import React from 'react'

import styled from 'styled-components'
import './normalize.css'

import Bg from './bg'
import Header from './header'
import Skills from './skills'
import Metas from './metas'
import Timeline from './timeline'
import Works from './works'

const Main = styled.div`
  max-width: 960px;
  width: 100%;
  margin: 80px auto;
  padding: 80px;
  background-color: #fff;
  box-shadow: 4px 7px 15px 1px rgba(118, 95, 91, 0.34);
  font-family: Yuanti SC,BlinkMacSystemFont,Segsoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
  @media (min-width: 1280px) {
    max-width: 1180px;
  }
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
`

const InPageWrapper = styled((props) => (
  <div>
    <Bg />
    <Main>
      {props.children}
    </Main>
  </div>
))`
  position: relative;
  overflow: auto;
`

// export default function Resume () {
//   return (
//     <InPageWrapper>
//       <Header />
//       <Metas />
//       <Timeline />
//       <Skills />
//       <Works />
//     </InPageWrapper>
//   )
// }

const FullScreenWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
`

export default function Resume () {
  return (
    <FullScreenWrapper>
      <Header />
      <Metas />
      <Skills />
      <Timeline />
      <div style={{pageBreakAfter: 'always', width: '100%', padding: '40px 0'}}></div>
      <Works />
    </FullScreenWrapper>
  )
}
