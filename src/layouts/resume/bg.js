import React from 'react'
import styled from 'styled-components'

const Shape1 = styled(props => (
  <svg height={536} width={633} fill={'#32aefe'} strokeWidth={0} {...props}>
    <path d="M0 0L633 0 633 536z" />
  </svg>
))`
  top: 0;
  right: 0;
`

const Shape2 = styled(props => (
  <svg height={519} width={758} fill={'#d2d2d2'} strokeWidth={0} {...props}>
    <path d="M0 455L693 352 173 0 92 0 0 71z" />
  </svg>
))`
  top: 0;
  left: 0;
  opacity: 0.5;
`;

const Shape = styled.svg`
  position: fixed;
  z-index: -1;
`

export default function () {
  return (
    <>
      <Shape as={Shape1} />
      <Shape as={Shape2} />
    </>
  )
}
