import React from 'react'
import styled from 'styled-components'

import Section from './section'

const SVG = styled.svg`
  display: block;
  overflow: visible !important;
  margin: 0 auto;
`

export default (props) => (
  <Section title={'信息'} style={{width: 'calc(50% - 15px)'}}>
    <SVG x="0px" y="0px" width={'560px'} height={'350px'} viewBox="0 0 560 370" style={{margin: '0 auto'}} {...props}>
      <path
        fill="rgb(221,221,221)"
        d="M77.679 299.825v10.84c1.463 7.725 1.18 11.587-.847 11.587h-7.175c-1.627 0-7.102-2.677-7.102-4.166v-3.624c0-1.14 3.591-6.668 4.198-8.287.607-1.62.209-4.023-.561-6.349-.771-2.327 0-10.426 0-11.967 0-1.542-4.322-19.517-4.322-23.182V249.53c0-2.134 2.004-5.78 2.004-7.67 0-1.889 1.006-16.162 1.006-18.2 0-2.038-4.228-14.308-4.228-26.01 0-11.703.782-32.272 4.878-44.938.793-15.259 1.183-23.508 1.17-24.748-.018-1.859-2.826-11.255-2.826-14.862-1.496 7.248-3.662 12.35-6.5 15.301.068 5.757-3.873 14.182-11.82 25.274-5.704 7.168-8.96 12.712-9.767 16.631.383 3.771-1.45 7.921-5.5 12.448-2.426 5.814-4.033 8.987-4.818 9.52-.786.534-1.789.745-3.008.635-1.38 2.273-3.125 3.034-5.232 2.282-2.498.527-3.642-.354-3.432-2.644-1.675-.303-2.02-1.547-1.037-3.731s2.203-4.388 3.661-6.607c-1.358.013-2.037-.424-2.037-1.31 0-1.329 2.998-2.677 4.33-4.711 1.331-2.035 4.923-6.776 6.755-9.855 1.832-3.078 8.113-13.394 9.216-16.421 1.102-3.028 1.896-11.66 10.722-24.957-.47-8.298.761-15.008 3.693-20.128.66-11.867 2.555-19.418 5.68-22.655 3.126-3.237 7.602-4.855 13.428-4.855 4.623-1.658 8.585-4.108 11.885-7.348l.059-7.58c-1.18-.754-1.77-2.783-1.77-6.089-2.408-1.341-3.348-4.381-2.819-9.117.245-1.077 1.03-1.047 2.354.09-.163-5.115-.241-8.114-.236-8.996.008-1.322 1.843-8.375 11.03-8.375 9.189 0 11.646 7.196 11.646 8.375v8.997c.918-.638 1.642-.638 2.17 0 .794.956.944 5.154-2.17 9.025-.469 2.69-1.256 4.507-2.365 5.452v7.795c3.168 3.693 7.087 6.283 11.757 7.77 6.03.24 10.467 1.925 13.313 5.054 4.269 4.696 6.184 9.435 6.184 21.11 3.093 7.845 4.281 14.819 3.566 20.92 5.728 8.878 9.26 17.253 10.593 25.126 4.781 9.08 7.544 14.26 8.289 15.542 1.118 1.923 6.395 6.15 8.637 11.63 2.478 2.446 3.725 3.916 3.743 4.41.027.741-1.093 1.46-2.418 1.1l3.99 7.066c.379 1.577.116 2.577-.789 3-.066 2.91-1.162 3.894-3.285 2.95-1.423.951-2.663 1.013-3.719.185a6.59 6.59 0 01-2.226-3.135c-1.302.95-2.283.834-2.943-.347-.99-1.77-5.31-8.836-8.75-15.228-.71-1.8-1.188-3.797-1.43-5.99-.244-2.195-1.746-5.267-4.508-9.22-4.471-6.258-7.625-10.798-9.46-13.619-2.754-4.232-7.74-11.498-7.74-19.47-4.072-8.924-6.251-14.131-6.538-15.62-.563 7.527-1.463 12.306-2.701 14.338.193 14.97.408 23.195.646 24.676.356 2.223 10.22 26.163 2.055 69.522-.89 2.223-.758 9.069.396 20.538 3.22 10.818 2.884 22.413-1.009 34.784-1.675 6.594-2.474 11.85-2.395 15.768.118 5.876.313 10.255-.594 11.612 2.885 5.527 4.472 9.106 4.761 10.734.436 2.441.438 4.567-6.226 7.498-3.97.224-6.45.279-7.438.163-1.483-.174-2.004-1.45-1.396-6.887.607-5.436 0-13.49 0-15.05 0-1.56 1.395-2.875 1.395-9.84v-9.964c0-1.6-3.76-10.033-3.76-16.848s1.717-17.286 1.717-21.434c-2.072-2.703-3.367-7.559-3.884-14.57-1.414-3.16-1.993-8.163-1.735-15.009-2.121-13.575-3.74-20.357-4.856-20.345-1.674.018-2.846 15.138-4.932 20.345.032 7.277-.513 12.04-1.634 14.292-.46 6.831-1.628 11.536-3.505 14.112-.525 1.95-.521 5.07.012 9.361 2.027 9.322 1.256 19.1-2.313 29.334-.467 3.445-.408 8.931.177 16.462.084 1.066.297 2.217.64 3.452h0z"
      />
      <g fill="#32AEFF" transform="translate(190 40) rotate(0)">
        <path d="M35 0L10 0 -20 39 9 -1 35 -1z" />
        <text fill="#bbb" transform="translate(40 0)"
          textAnchor="start" dominantBaseline="middle" alignmentBaseline="middle" fontFamily="Titillium Web, monospace" fontSize="14" fontWeight="600">院校</text>
        <text fill="#32AEFF" transform="translate(80 0)"
          textAnchor="start" dominantBaseline="middle" alignmentBaseline="middle" fontFamily="Titillium Web, monospace" fontSize="20" fontWeight="700">安徽工程大学（本科）</text>
      </g>
      <g fill="#32AEFF" transform="translate(190 130) rotate(0)">
        <path d="M35 0L10 0 -20 20 9 -1 35 -1z" />
        <text fill="#bbb" transform="translate(40 0)"
          textAnchor="start" dominantBaseline="middle" alignmentBaseline="middle" fontFamily="Titillium Web, monospace" fontSize="14" fontWeight="600">生日</text>
        <text fill="#32AEFF" transform="translate(80 0)"
          textAnchor="start" dominantBaseline="middle" alignmentBaseline="middle" fontFamily="Titillium Web, monospace" fontSize="20" fontWeight="700">1991年7月14日</text>
      </g>
      <g fill="#32AEFF" transform="translate(190 210) rotate(0)">
        <path d="M35 0L10 0 -20 -20 9 1 35 1z" />
        <text fill="#bbb" transform="translate(40 0)"
          textAnchor="start" dominantBaseline="middle" alignmentBaseline="middle" fontFamily="Titillium Web, monospace" fontSize="14" fontWeight="600">手机</text>
        <text fill="#32AEFF" transform="translate(80 0)"
          textAnchor="start" dominantBaseline="middle" alignmentBaseline="middle" fontFamily="Titillium Web, monospace" fontSize="20" fontWeight="700">15906642500</text>
      </g>
      <g fill="#32AEFF" transform="translate(190 290) rotate(0)">
        <path d="M35 0L10 0 -20 -39 9 1 35 1z" />
        <text fill="#bbb" transform="translate(40 0)"
          textAnchor="start" dominantBaseline="middle" alignmentBaseline="middle" fontFamily="Titillium Web, monospace" fontSize="14" fontWeight="600">邮箱</text>
        <text fill="#32AEFF" transform="translate(80 0)"
          textAnchor="start" dominantBaseline="middle" alignmentBaseline="middle" fontFamily="Titillium Web, monospace" fontSize="24" fontWeight="700">pengxiaomeng@outlook.com</text>
      </g>
    </SVG>
  </Section>
)
