import React, { useRef, useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'

const Content = styled.div`
  position: relative;
  padding: 6vw 4vw 16vw;
  text-align: center;
  transition: all 2s cubic-bezier(0.21, 1, 0.84, 1.01);
  transform-origin: center;
  :hover {
    transform: scale(1.05);
  }
`

const Title = styled.span`
  position: relative;
  margin: 0;
  font-size: 46px;
  line-height: 50px;
  font-weight: 300;
  color: #eee;
  cursor: pointer;
  @media (max-width: 1040px) {
    visibility: hidden;
  }
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
  } */
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
  }
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
  height: 25vw;
  background: #111;
  color: red;
  overflow: hidden;
  margin-bottom: -11vw;
  ${Glass} {
    filter: blur(8px);
  }
  :hover ${Glass} {
    filter: blur(0px);
  }
  ${Drops} {
    filter: blur(0px) brightness(1.3);
  }
  :hover ${Drops} {
    filter: blur(2px) brightness(1.3);
  }
`

const RainDropFail = keyframes`
  0% {
    opacity:0;
    transform:rotate(180deg) scale(2.5,2.3) rotateY(0);
  }
  100% {
    opacity:1;
    transform:rotate(180deg) scale(1,1) rotateY(0);
  }
`

const DropInner = styled.span.attrs(
  ({ x, y, size, stretch, delay, width, height }) => ({
    style: {
      left: `${x * 100}%`,
      top: `${y * 100}%`,
      width: `${size}px`,
      height: `${size * (1 + stretch)}px`,
      backgroundPosition: `${x * 100}% ${y * 100}%`,
      animationDelay: `${delay}s`,
      backgroundSize: `${width / 100 * 5}px ${height / 100 * 5}px`,
    }
  })
)`
  background-color: black;
  background-image: url(${require('./blog_bg.jpg')});
  :hover {
    background-size: 600% !important;
  }
  position: absolute;
  border-radius: 100%;
  transform: rotate(180deg) rotateY(0);
  transition: background-size 1s;
  opacity: 0;
  animation: ${RainDropFail} 10ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation-fill-mode: forwards;
`

const DropBorder = styled.span.attrs(
  ({ x, y, size, stretch, delay }) => ({
    style: {
      left: `${x * 100}%`,
      top: `${y * 100}%`,
      width: `${size - (size * 0.3 - 1) * 2}px`,
      height: `${size * (1 + stretch)}px`,
      boxShadow: `0 0 0 ${size * 0.3 - 1}px rgba(0, 0, 0, 0.6)`,
      animationDelay: `${delay}s`,
    }
  })
)`
  position: absolute;
  border-radius: 100%;
  margin-left: 2px;
  margin-top: 1px;
  opacity: 0;
  animation: ${RainDropFail} 10ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation-fill-mode: forwards;
`

const Drop = function (props) {
  const { current } = useRef({
    x: Math.random(),
    y: Math.random(),
    size: 2 + Math.random() * 11,
    stretch: Math.random() * 20 / 100,
    delay: Math.random() * 30,
    transition: 300,
  })
  return (
    <>
      <DropBorder {...{...current, ...props}} />
      <DropInner {...{...current, ...props}} />
    </>
  )
}

export default function () {
  const containRef = useRef(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  useEffect(() => {
    setWidth(containRef.current.offsetWidth)
    setHeight(containRef.current.offsetHeight)
  }, [containRef])
  return (
    <Containner ref={containRef}>
      <Glass />
      <Drops>
        {
          Array.apply(null, {length: 100}).map((_, index) => <Drop key={index} width={width} height={height} />)
        }
      </Drops>
      {/* <Content> */}
        {/* <SubTitle1>欢迎光临</SubTitle1> */}
        {/* <Title>彭小蒙的博客</Title> */}
        {/* <SubTitle2>生活、技术、摄影</SubTitle2> */}
      {/* </Content> */}
    </Containner>
  )
}