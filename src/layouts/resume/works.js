import React from 'react'
import styled from 'styled-components'

import Section from './section'
import './titillium.css'

const Quote = styled.svg`
  width: 12px;
  height: 12px;
  margin: 0 6px;
`

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

const Hand = styled(props => (
  <svg
    viewBox="0 0 1024 1024"
    width={200}
    height={200}
    {...props}
  >
    <path
      d="M72.04 760.52V419.17c0-39.04 20.93-75.55 54.53-95.26l268.37-157.37c48.4-28.36 109.25-18.2 145.89 23.97l3.34 3.5c33.79 41.03 32.56 104.31-1.23 143.96h298.02c61.19 0 111 49.78 111 110.97 0 30.01-11.66 57.89-32.75 78.82-21.23 21.02-49.44 32.44-79.36 32.16l-180.72-1.75-15.87 229.73c-4.88 49.19-45.23 85.56-93.84 85.56l-367.03-2.3c-60.82-.4-110.35-50.02-110.35-110.64zm425-524.78l-2.64-2.86c-16.66-20.22-45.14-25.32-67.66-12.09L158.37 378.13c-14.7 8.62-23.45 23.94-23.45 41.03v341.36c0 26.18 21.45 47.63 47.84 47.78l366.82 2.31c16.05 0 29.49-12.03 31.09-28.02l15.8-228.9c2.27-33.02 30.04-58.69 63.28-58.39l180.72 1.75c13.04.12 25.29-4.82 34.46-13.96 9.11-9.02 14.15-21.05 14.15-33.82 0-26.88-21.57-48.46-48.12-48.46H348.88l138.1-95.96c21.08-15.31 26.32-47.59 10.06-69.11z"
      fill="#32aefe"
    />
  </svg>
))`
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-right: 4px;
  margin-top: 3px;
`

const WorkWrapper = styled.div`
  width: 360px;
  margin: 15px;
`
const WorkHeader = styled.div`
  overflow: auto;
  background-color: #32aefe;
  color: #fff;
  display: flex;
  align-items: center;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
`
const WorkContent = styled.div`
  border: 1px solid #ccc;
  border-top-width: 0;
  padding: 15px;
  color: #888;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`
const WorkNo = styled.div`
  margin: 15px;
  padding: 10px;
  width: 50px;
  height: 50px;
  box-sizing: border-box;
  background-color: rgb(0, 154, 252);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 36px;
  font-family: "Titillium Web", monospace;
  float: left;
`

const WorkMeta = styled.div``
const WorkTitle = styled.h3`
  margin: 0;
  font-size: 20px;
`
const WorkTime = styled.p`
  margin: 0 0 4px;
  font-size: 14px;
`

const WorkDesc = styled.p`
  margin: 0px;
  font-size: 12px;
  line-height: 1.3em;
`

const WorkThumb = styled.img`
  width: 100%;
  height: auto;
  margin: 15px 0;
`

const WorkFeature = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: #333;
  display: flex;
  align-items: start;
`

const Work = (props) => (
  <WorkWrapper>
    <WorkHeader>
      <WorkNo>{props.no}</WorkNo>
      <WorkMeta>
        <WorkTime>{props.time}</WorkTime>
        <WorkTitle>{props.title}</WorkTitle>
      </WorkMeta>
    </WorkHeader>
    <WorkContent>
      <WorkDesc>
        <Quote as={QuoteLeft} />
        {props.desc}
        <Quote as={QuoteRight} />
      </WorkDesc>
      <WorkThumb src={props.thumb} />
      {props.features.map(feature => (
        <WorkFeature key={feature}>
          <Hand /> {feature}
        </WorkFeature>
      ))}
    </WorkContent>
  </WorkWrapper>
)

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
`

export default () => (
  <Section title={'作品'} style={{width: '100%'}}>
    <Wrapper>
      <Work
        key={'0'}
        no={0}
        title={'沪深A股模拟交易'}
        time={'2016.11-2017.1'}
        desc={'在线查看股票实时行情和持仓盈亏、在线下单，在微信、浏览器等平台上吸引用户进行A股仿真交易，引流到 APP。'}
        thumb={require('./A股.jpg')}
        features={[
          '技术选型：前端方案采用 jQuery 类库 + backbone 框架，构建工具使用 grunt。',
          '参与感受：从立项到验收全程跟进的项目，理解了软件开发流程的每个细节。项目中也得到了锻炼，能够熟练使用各种框架，能够解决开发工程中遇到的各种问题。',
        ]} />
      <Work
        key={'1'}
        no={1}
        title={'股邻地图'}
        time={'2017.5-2017.8'}
        desc={'为东北证券融e通 APP 带入社交属性，股友可以通过地图查找、关注、聊天、发动态等功能进行交互。'}
        thumb={require('./股邻.jpg')}
        features={[
          '技术选型：率先将团队内的前端技术栈从 jquery + grunt 切换到 vue + webpack。采用 Hybrid App 方式开发，和 App 团队探讨沟通实现细节。',
          '参与感受：技术需要与业务结合才能高效产出，脱离业务场景探讨技术选型的优劣没有意义。'
        ]} />
      <Work
        key={'2'}
        no={2}
        title={'e签宝标准签'}
        time={'2017.10-2018.3'}
        desc={'包含发起签署、在线签署、实名认证、意愿认证、合同管理等功能模块，为用户提供标准的的电子合同签署服务。'}
        thumb={require('./e签宝.jpg')}
        features={[
          '技术选型：采用 vue 全家桶，使用 eslint 和 prettier 规范参与人员的代码风格。',
          '参与感受：多人团队合作，需要规范代码风格，定期 code review 确保代码质量和安全风险；迭代前前预演，确保工作进度和质量。',
        ]} />
      <Work
        key={'3'}
        no={3}
        title={'合同管家小程序'}
        time={'2020.1-2020.3'}
        desc={'支付宝名下的合同管家小程序，为支付宝生态中的用户和商家提供便捷的电子合同管理服务。'}
        thumb={require('./合同管家.png')}
        features={[
          '技术选型：支付宝小程序原生开发。',
          '参与感受：参与到支付宝小程序生态里面，和支付宝官方合作，对页面性能、美观都有较高的审核标准，同时很多 API 都是支付宝第一次对外暴露的，需要和支付宝保持沟通。',
        ]} />
    </Wrapper>
  </Section>
)
