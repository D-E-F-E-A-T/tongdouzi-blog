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

const Metas = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  padding: 20px 20px 20px;
`

const Avatar = styled.img.attrs({
  src: require('./zhe-avatar.jpg'),
})`
  width: 160px;
  height: 160px;
  border-radius: 100%;
  border: 10px solid #65c2fe;
  margin: 20px 20px 20px 0;
`

const Desc = styled.div`
  flex: 1;
  padding-top: 70px;
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
  padding: 2px 10px 2px;
  font-size: 15px;
  line-height: 25px;
  margin: 0;
  text-indent: 2em;
  color: #333;
`

const Sign = styled.img.attrs({
  src: require('./zhe-sign.png'),
})`
  float: right;
  margin: 15px 10px 0 0;
  height: 50px;
`

const Quote = styled.svg`
  width: 20px;
  height: 20px;
  margin: 0 6px;
`

const Info = styled.div`
  display: block;
`

export default () => (
  <Header>
    <Metas>
      <Avatar />
      <Name>章华恩</Name>
      <Job>产品经理</Job>
    </Metas>
    <Desc>
      <Intro>
        <Quote as={QuoteLeft} />
        您好，很高兴您能读到我的简历并且让我简单的介绍自己： 我叫章华恩，计算机本科毕业，5年互联网工作经验（4年产品经理+1年项目经理）， 曾先后就职于"浙江图讯科技股份有限公司"和"杭州云徙科技有限公司"， 工作方向长期聚焦于服务大B客户提供企业数字化转型赛道。 擅长使用类比法了解事物客观规律和使用归纳法搭建层级框架； 有带团队相关经验， 云徙任职期间曾两次作为主产品带领PO团队完成千万级合同项目《京博石油化工有限公司数字化营销平台》和《天友乳业数字化改造营销体系（自有渠道）》相关架构设计和交互稿输出。 对零售行业有一定理解，拥有B2B，B2C，O2O，直销等垂直行业相关架构设计经验。
        {/* <Quote as={QuoteRight} /> */}
      </Intro>
      <Intro>
      产品侧能力： 主要在围绕五个象限有体系化沉淀： 思维模型，工具能力，项目方法论，行业能力（偏会员营销），互联网本质； 本人长期深耕ToB产品领域， 长期的次级市场研究复盘让我理解大B客户因为原有价值链在面对新消费转型过程所遇到的痛点以及如何使用体系化的方法论指导项目；
      </Intro>
      <Intro>
      技能侧：产品设计上主要搭配axure，sketch，墨刀，flinto等工具制作高保真原型， 使用Visio,Xmind做PRD产品文档相关说明，熟悉linux操作系统，运维，后端开发，数据库（mysql，oracle）等方面均有涉猎； 日常工作中通过项目实战也在不停的输出和打磨自己的基础组建库和19个领域中心。
      </Intro>
      <Intro>
      性格层：本人属于九型人格实践者人格，偏向于自我型人格，对事物充满批判和探索的欲望。 兴趣爱好喜欢心理学和哲学，日常喜欢打狼人杀，喜欢把复杂问题分解纯粹化，不喜欢人云亦云，希望做一个有思考，有温度的产品人， 感谢您的耐心阅读。如果您对我感兴趣并且想详细了解的话，可以点击链接查看个人作品：<a target="_blank" href="https://lanhuapp.com/url/Qu2Ir">axure作品</a>（建议使用Chrome打开，SaFari测试有乱码）和产品手记：<a target="_blank" href="https://www.jianshu.com/u/2a6279001c0d">简书链接</a>
        <Quote as={QuoteRight} />
        <Sign />
      </Intro>
    </Desc>
  </Header>
)