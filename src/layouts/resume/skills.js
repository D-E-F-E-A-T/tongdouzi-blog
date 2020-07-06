import React from 'react'
import styled from 'styled-components'

import Pie from './pie'
import Section from './section'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
`

export default () => (
  <Section title={'技能'} style={{width: 'calc(50% - 15px)'}}>
    <Wrapper>
      <Pie title={'HTML & CSS & JS'} value={90} />
      <Pie title={'ES6+'} value={90} />
      <Pie title={'HTTP'} value={90} />
    </Wrapper>
    <Wrapper>
      <Pie title={'Vue'} value={90} />
      <Pie title={'React'} value={95} />
      <Pie title={'Babel & Webpack'} value={80} />
    </Wrapper>
  </Section>
)
