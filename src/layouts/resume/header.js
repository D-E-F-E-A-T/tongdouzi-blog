import React from 'react'
import styled from 'styled-components'

import './titillium.css'

const QuoteLeft = props => (
  <svg
    className="icon"
    viewBox="0 0 1025 1024"
    width={200.1953125}
    height={200}
    {...props}
  >
    <path
      d="M224.992 448c123.712 0 224 100.288 224 224s-100.288 224-224 224-224-100.288-224-224L0 640c0-247.424 200.576-448 448-448v128c-85.472 0-165.824 33.28-226.272 93.728-11.648 11.648-22.24 24.032-31.84 37.024A226.597 226.597 0 01224.992 448zm576 0c123.712 0 224 100.288 224 224s-100.288 224-224 224-224-100.288-224-224L576 640c0-247.424 200.576-448 448-448v128c-85.472 0-165.824 33.28-226.272 93.728-11.648 11.648-22.24 24.032-31.84 37.024A226.91 226.91 0 01800.992 448z"
      fill="#dbdbdb"
    />
  </svg>
);

const QuoteRight = props => (
  <svg
    className="icon"
    viewBox="0 0 1025 1024"
    width={200.1953125}
    height={200}
    {...props}
  >
    <path
      d="M800 640c-123.712 0-224-100.288-224-224s100.288-224 224-224 224 100.288 224 224l.992 32c0 247.424-200.576 448-448 448V768c85.472 0 165.824-33.28 226.272-93.728a324.887 324.887 0 0031.84-37.024A226.597 226.597 0 01800 640zm-576 0C100.288 640 0 539.712 0 416s100.288-224 224-224 224 100.288 224 224l.992 32c0 247.424-200.576 448-448 448V768c85.472 0 165.824-33.28 226.272-93.728a324.887 324.887 0 0031.84-37.024A226.597 226.597 0 01224 640z"
      fill="#e6e6e6"
    />
  </svg>
);

const Header = styled.header`
  position: relative;
  display: flex;
  align-items: center;
  margin-right: 4px;
  margin-bottom: 40px;
  border-bottom: 3px solid #32aefe;
  width: 100%;
  box-sizing: border-box;
  :after {
    content: "PERSONAL RESUME";
    position: absolute;
    top: 0px;
    right: 0px;
    font-size: 60px;
    line-height: 60px;
    font-weight: 600;
    font-style: italic;
    font-family: "Titillium Web", monospace;
    color: rgb(221, 221, 221);
  }
`

const Avatar = styled.img.attrs({
  src: require('./pxm-avatar.png'),
})`
  width: 140px;
  height: 140px;
  border-radius: 100%;
  border: 10px solid #65c2fe;
  margin: 20px 20px 20px 0;
`

const Desc = styled.div`
  flex: 1;
`

const Name = styled.h3`
  font-size: 30px;
  line-height: 50px;
  color: #32aefe;
  font-weight: normal;
  margin: 0;
`

const Job = styled.p`
  font-size: 14px;
  line-height: 20px;
  color: #888;
  margin: 0;
`

const Intro = styled.p`
  padding: 10px 10px 20px;
  font-size: 15px;
  line-height: 25px;
  margin: 0;
  text-indent: 2em;
  color: #333;
`

const Sign = styled.img.attrs({
  src: require('./pxm-sign.png'),
})`
  float: right;
  margin: 15px 10px 0 0;
  height: 30px;
`

const Quote = styled.svg`
  width: 20px;
  height: 20px;
  margin: 0 6px;
`

export default () => (
  <Header>
    <Avatar />
    <Desc>
      <Name>彭小蒙</Name>
      <Job>WEB 前端工程师</Job>
      <Intro>
        <Quote as={QuoteLeft} />
        Hello, 我是彭小蒙，一名 web 前端工程师，平平无奇切图小天才。
        我拥有 5 年的前端开发经验，
        在技术上，对技术难点肯下功夫钻研，对新技术保持高度的好奇和热情；
        在工作中，保持高效率的同时近乎强迫症的斟酌产品细节；
        在生活中乐观随和，容易相处。
        希望寻找到一个对产品和技术都有追求的团队。
        <Quote as={QuoteRight} />
        <Sign />
      </Intro>
    </Desc>
  </Header>
)