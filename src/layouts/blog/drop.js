import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'

const Blur = keyframes`
  0% {
    opacity: 0;
    transform: rotate(180deg) scale(2.5,2.3) rotateY(0);
  }
  100% {
    opacity: 1;
    transform: rotate(180deg) scale(1,1) rotateY(0);
  }
`

const Inner = styled.span.attrs(
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
  animation: ${Blur} 10ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation-fill-mode: forwards;
`

const Border = styled.span.attrs(
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
  animation: ${Blur} 10ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation-fill-mode: forwards;
`

export default function (props) {
  const [params] = useState({
    x: Math.random(),
    y: Math.random(),
    size: 2 + Math.random() * 11,
    stretch: Math.random() * 20 / 100,
    delay: Math.random() * 30,
    transition: 300,
  })
  return (
    <>
      <Border {...params} {...props} />
      <Inner {...params} {...props} />
    </>
  )
}
