import React from 'react'
import styled from 'styled-components'

import './titillium.css'

const Circle = styled.div`
  position: relative;
  font-size: 88px;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  margin-bottom: 0.1em;
  background-color: #dfe8ed;
  :after {
    position: absolute;
    top: 0.09em;
    left: 0.09em;
    display: block;
    content: " ";
    border-radius: 50%;
    background-color: #ffffff;
    width: 0.82em;
    height: 0.82em;
  }
`

const Number = styled.span`
  position: absolute;
  width: 100%;
  z-index: 1;
  left: 0;
  top: 0;
  width: 5em;
  line-height: 5em;
  font-size: 0.2em;
  color: #3c4761;
  display: block;
  text-align: center;
  white-space: nowrap;
  transition-property: all;
  transition-duration: 0.2s;
  transition-timing-function: ease-out;
  font-family: "Titillium Web", monospace;
  font-weight: 500;
`

const Slice = styled.div`
  position: absolute;
  width: 1em;
  height: 1em;
  clip: ${({ shouldClip }) => shouldClip ? 'rect(0em, 1em, 1em, 0.5em)' : 'rect(auto, auto, auto, auto)'};
`

const Bar = styled.div`
  position: absolute;
  border: 0.09em solid #000000;
  width: 0.82em;
  height: 0.82em;
  clip: rect(0em, 0.5em, 1em, 0em);
  border-radius: 50%;
  transform: rotate(0deg);

  border-color: #32aefe !important;
  clip: rect(0em, 0.5em, 1em, 0em);

  transform: rotate(${({ degress }) => degress}deg);
`

const Wrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
`

const Title = styled.span`
  font-family: "Titillium Web", monospace;
  font-weight: 500;
  font-size: 14px;
  color: #888;
`

export default (props) => {
  return (
    <Wrapper>
      <Circle>
        <Number>{props.value}%</Number>
        <Slice shouldClip={props.value <= 50}>
          <Bar degress={props.value / 100 * 360} />
          {props.value > 50 && <Bar degress={180} />}
        </Slice>
      </Circle>
      <Title>{` ${props.title} `}</Title>
    </Wrapper>
  )
}

