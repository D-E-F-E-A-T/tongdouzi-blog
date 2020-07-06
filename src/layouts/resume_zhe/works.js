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
  font-size: 14px;
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
        <WorkFeature>
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
        no={1}
        title={'浙江省公共法律服务网'}
        time={'2015.08-2015.11'}
        desc={'项目描述：为贯彻党的十八大和党的十八届二中全会、三中全会，不断健全公共法律服务网络，有效整合公共法律服务资源，浙江司法厅社会公开招投标进行法律服务网信息信息化建设，本人从二期中途接手本次项目承建，主要目标打通数据层，系统纵向连接全省司法行政系统11个地市司法局、90个县（市、区）司法局、近1400家司法所；横向对接省司法厅基层调解案件管理，浙江省司法考试信息查询，浙江省公证线上业务办理，浙江省法律援助业务办理，浙江政务网做统一登入体系；一级架构分为五大板块我想咨询，我想查找，我想办理，我想学法，我想参与，二级子模块涉及38板块，同时进行一期遗留功能完善；该项目二期验收时间为15年11月30号，12月4日国家法制宣传日围绕本次项目顺利上线召开新闻发布会，期间积极配合省司法厅收到相关表扬信'}
        thumb={require('./A股.jpg')}
        features={[
          '第一个采用前后端分离架构的项目',
          '前端方案采用 jQuery 类库 + backbone 框架',
          '前端方案采用 jQuery 类库 + backbone 框架',
        ]} />
      <Work
        no={2}
        title={'赛文水业'}
        time={'2017.5-2017.10'}
        desc={'项目描述：总管公司所有产品业务线(app，移动端，pc 端)在职期 间组织规划并独立负责赛文水业网上商城(由0到1)招商加盟公 众号,对赛文水业web官网改版升级，打造 B2B 领域的商城 web 站。 赛文水业是一个网上订水公众号商城，订水用户稳定在，日订 单量稳定在5000单，日访问量实现50000+并持续增加。 从 想法到推出，完成了全面的产品生命周期管理，编写概念文 档，产品信息架构，产品功能架构，业务流程，页面流程，核 心功能流程，创建初始原型，及还想用户故事，在产品推出前 后收集指标。'}
        thumb={require('./股邻.jpg')}
        features={[
          '第一个采用 Vue 前端框架开发的应用',
          '使用 webpack 作为前端构建工具',
          '前端方案采用 jQuery 类库 + backbone 框架',
        ]} />
      <Work
        no={3}
        title={'京博石油化工数字化营销平台'}
        time={'2018.06-2019.08'}
        desc={'项目描述：京博石化是一家以石油化工为主业，集石油炼制与后续化工为一体的大型民营企业，聚焦于波特细分市场战略方向，企业存在较显性的特征行业痛点多，低效环节多，旧系统不稳定，用户界面体验比较差，随时面临新兴企业采取互联网+平台进行跨界打劫；藉此京博集团期望以数字化营销为抓手开启《京博石化数字化营销平台》建设，合同金额950万，京博内部期望新系统以生产、经营、市场三大数据中心为依托，重构电商平台探索数字化营销创新模式，团队内部以框架升级，旧业务链路优化，数据链路打通，加油站模式创新为切入点进行集团层面系统重构；截至19年8月份数据总客户数13526家，活跃客户数3028家（半年内有交易额），总提货单数14225笔，售出油品数335,685.88600吨,线上平台总交易额¥2,573,292,081.85元。'}
        thumb={require('./e签宝.jpg')}
        features={[
          '使用 eslint 和 prettier 规范各参与人员的代码',
          '每周进行 code review 确保代码质量和安全风险；每2周迭代发布前预演，确保工作进度和质量',
          '前端方案采用 jQuery 类库 + backbone 框架',
        ]} />
      <Work
        no={4}
        title={'天友乳业数字化改造营销体系（自有渠道）'}
        time={'2019.10-2020.03'}
        desc={'项目描述：重庆市天友乳业股份有限公司成立于1931年，主要辐射于西南地区具有强大综合实力，是一家集牧草种植、奶牛养殖、生产加工、冷链物流配送、营销服务于一体的老牌国有乳品提供商。天友项目项目建设总体围绕问题和期待两个点去打造新平台。问题点切分：天友自有渠道主分为三条线业务线周期订奶，及时订购（O2O），和B2C订单，三条线存在各自不同程度的瓶颈，周期订奶产品特供奶保质期期短，衍生出供应链体系无法扩散且工厂按需生产，T+N的订奶规则导致经销商和消费者始终无法达到利益平衡，线下6300个站点主城区覆盖率仅达百分之1；及时购门店业务始终未跑出最佳实践，B2C业务投放渠道投放单一，无法打开市场；面对日渐年轻的消费群体，消费场景多元化，消费者品牌忠诚度不断下降；天友期待必须要一套多渠道互相融合的新模式重新获得市场份额。团队经过半个月调研认为在供应链、品牌、产品、渠道、客户等方面的原有资源为基础，利用互联网的工具和方法，重构人、货、场的关系与形态，实现线上+线下+物流融合贯通。由于年前疫情原因，进度未完成整体验收'}
        thumb={require('./合同管家.png')}
        features={[
          '第一次接触到小程序生态',
          '挂载在支付宝名下，对页面性能、美观都有较高的审核标准',
        ]} />
    </Wrapper>
  </Section>
)
