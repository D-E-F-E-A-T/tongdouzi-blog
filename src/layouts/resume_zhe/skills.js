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
      <Pie title={'Axure'} value={90} />
      <Pie title={'Sketch'} value={90} />
      <Pie title={'流程图'} value={90} />
    </Wrapper>
    <Wrapper>
      <Pie title={'Flinto'} value={90} />
      <Pie title={'PPT'} value={95} />
      <Pie title={'mysql & oracle'} value={80} />
    </Wrapper>
  </Section>
)
