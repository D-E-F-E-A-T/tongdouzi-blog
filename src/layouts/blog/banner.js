import React, { useRef, useEffect, useState } from 'react'
import styled from 'styled-components'
import Drop from './drop'

const Content = styled.div`
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  transition: all 2s cubic-bezier(0.21, 1, 0.84, 1.01);
  transform-origin: center;
  /* :hover {
    transform: scale(1.05);
  } */
`

const Title = styled.span`
  position: relative;
  margin: 0;
  font-size: 46px;
  line-height: 50px;
  font-weight: 500;
  color: #eee;
  cursor: pointer;
  /* @media (max-width: 1040px) {
    visibility: hidden;
  } */
  /* :before {
    content: "欢迎来到";
    position: absolute;
    top: -24px;
    left: -16px;
    font-size: 18px;
    line-height: 30px;
    font-weight: 400;
    color: #483d43;
    white-space: nowrap;
    transition: all 2s cubic-bezier(0.21, 1, 0.84, 1.01);
  }
  :hover:before {
    transform: scale(1.2) translate(-10px, -10px);
  }
  :after {
    content: "生活、技术、摄影";
    position: absolute;
    bottom: -24px;
    right: -50px;
    font-size: 20px;
    line-height: 30px;
    font-weight: 400;
    color: #000;
    white-space: nowrap;
    transition: all 2s cubic-bezier(0.21, 1, 0.84, 1.01);
  }
  :hover:after {
    transform: scale(1.2) translate(50px, 10px);
  } */
`

const Glass = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${require('./blog_bg.jpg')});
  background-size: cover;
  background-position: 50%;
  transition: filter 600ms;
`

const Drops = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: filter 600ms;
`

const Containner = styled.div`
  position: relative;
  width: 100%;
  padding: 5vw 10px 6vw;
  box-sizing: border-box;
  color: red;
  background: #111;
  overflow: hidden;
  margin-bottom: -40px;
  ${Glass} {
    filter: blur(8px);
  }
  ${Drops} {
    filter: blur(0px) brightness(1.3);
  }
  /* :hover ${Glass} {
    filter: blur(0px);
  }
  :hover ${Drops} {
    filter: blur(2px) brightness(1.3);
  } */
`

export default function () {
  const ref = useRef(null)
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  })
  useEffect(() => {
    setSize({
      width: ref.current.offsetWidth,
      height: ref.current.offsetHeight,
    })
  }, [ref])
  return (
    <Containner ref={ref}>
      <Glass />
      <Drops>
        {
          Array.apply(null, {length: Math.round(size.width / 10)}).map((_, index) => <Drop key={index} width={size.width} height={size.height} />)
        }
      </Drops>
      <Content>
        {/* <SubTitle1>欢迎光临</SubTitle1> */}
        <Title>彭小蒙的博客</Title>
        {/* <SubTitle2>生活、技术、摄影</SubTitle2> */}
      </Content>
    </Containner>
  )
}