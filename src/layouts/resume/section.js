import React from 'react'
import styled from 'styled-components'

const Section = styled.section`
  display: flex;
  flex-flow: column nowrap;
`

const Header = styled.div`
  position: relative;
  font-size: 20px;
  color: #5EAEFE;
  :after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #ddd;
  }
`

const Title = styled.span`
  position: relative;
  display: inline-block;
  padding: 10px 10px 10px 10px;
  :after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #5EAEFE;
    z-index: 2;
  }
`

const Content = styled.div`
  padding: 24px;
  box-sizing: border-box;
`

export default ({ title, children, ...props }) => (
  <Section {...props}>
    <Header>
      {title && <Title>{ title }</Title>}
    </Header>
    <Content>
      {children}
    </Content>
  </Section>
)
