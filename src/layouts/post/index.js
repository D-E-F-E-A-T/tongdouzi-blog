import React, { useEffect } from 'react'
import styled from 'styled-components'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import { MDXProvider } from '@mdx-js/react'
import Blog from '@/layouts/blog'
import 'katex/dist/katex.min.css'
import Carbon from '@/components/carbon'
import AV from 'leancloud-storage'
import Valine from 'valine'
window.AV = AV

const DateIcon = props => (
  <svg
    viewBox="0 0 1024 1024"
    width={200}
    height={200}
    {...props}
  >
    <path
      d="M844 885.5H180c-45.841 0-83-37.159-83-83V346h830v456.5c0 45.841-37.159 83-83 83zm-207.5-415c0-22.916-18.58-41.5-41.5-41.5H429c-22.916 0-41.5 18.584-41.5 41.5 0 22.92 18.584 41.5 41.5 41.5h114.125L429 740.25c0 11.462 9.292 20.75 20.75 20.75h41.5c11.462 0 20.75-9.288 20.75-20.75l124.5-249V470.5zM97 263c0-45.841 37.159-83 83-83h87.187c8.611-24.058 31.042-41.5 58.063-41.5s49.451 17.442 58.063 41.5h257.375c8.611-24.058 31.042-41.5 58.063-41.5s49.451 17.442 58.063 41.5H844c45.841 0 83 37.159 83 83v41.5H97V263zm581 0h41.5v-83H678v83zm-373.5 0H346v-83h-41.5v83z"
      fill="currentColor"
    />
  </svg>
);

const TagIcon= props => (
  <svg
    viewBox="0 0 1024 1024"
    width={200}
    height={200}
    {...props}
  >
    <path
      d="M788.48 629.419c0-17.067-5.803-31.744-17.75-44.715L421.206 235.861c-12.288-12.288-29.354-22.869-49.834-31.744-21.163-8.874-39.936-12.97-57.003-12.97H110.933c-17.066 0-31.744 6.485-44.032 18.773-12.288 12.288-18.773 26.965-18.773 44.032v202.752c0 17.067 4.096 36.523 12.97 57.003 8.875 21.162 18.774 37.546 31.745 49.834l349.525 349.526c12.288 12.288 26.965 17.749 44.032 17.749 17.067 0 31.744-5.803 44.715-17.75L770.73 673.452c11.264-12.288 17.749-26.966 17.749-44.032zM248.49 392.192c-12.287 12.288-26.965 18.09-44.031 18.09-17.067 0-31.744-5.802-44.032-18.09-12.288-12.288-18.091-26.965-18.091-44.032 0-17.067 5.803-31.744 18.09-44.032 12.289-12.288 26.966-18.09 44.033-18.09 17.066 0 31.744 5.802 44.032 18.09 12.288 12.288 17.749 26.965 17.749 44.032 1.024 17.408-5.461 31.744-17.75 44.032zm709.633 192.17l-349.526-348.5c-12.288-12.289-29.354-22.87-49.834-31.745-21.163-8.874-39.936-12.97-57.003-12.97H391.85c17.067 0 36.523 4.096 57.003 12.97 21.163 8.875 37.547 18.774 49.835 31.744l349.525 348.502c12.288 12.97 18.091 27.648 18.091 44.714s-5.803 31.744-18.09 44.032L619.178 902.827c9.898 9.898 18.773 17.066 25.941 21.845 7.168 4.779 17.067 6.485 28.672 6.485 17.067 0 31.744-5.802 44.715-18.09l239.616-240.299c12.288-12.288 17.749-26.965 17.749-44.032s-5.803-31.061-17.75-44.373zm0 0"
      fill="currentColor"
    />
  </svg>
);

const Post = styled.article`
  position: relative;
  /* margin: 10px 30px; */
  padding: 5% 8%;
  border-radius: 5px;
  box-shadow: rgba(39,44,49,0.06) 8px 14px 38px, rgba(39,44,49,0.03) 1px 3px 8px;
  font-size: 16px;
  line-height: 1.5;
  color: #696973;
  font-weight: normal;
  background-color: #fff;
  font-family: Yuanti SC, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
`

const PostCatogory = styled.h4`
  margin: .5em 0 0;
  font-size: 1.342em;
  line-height: 1;
  color: #0f171d;
  font-weight: 300;
`

const PostTitle = styled.h3`
  margin: .2em 0 .4em;
  font-size: 2.415em;
  line-height: 1.2;
  font-weight: 300;
  color: #1f2b86;
`

const PostMeta = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  font-weight: 400;
  color: #26328a;
`

const PostTags = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`

const TagText = styled.span`
  padding: 0 3px;
  font-size: .9em;
  line-height: 1.8;
`

const PostPubDate = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`

const DateText = styled.span`
  padding: 0 3px;
  font-size: .9em;
  line-height: 1.8;
`

const PostDivider = styled.hr`
  margin-bottom: .5em;
  background: hsla(0, 0%, 0%, 0.2);
  border: none;
  height: 1px;
`

const PostContent = styled.div`
  h1, h2, h3, h4, h5, h6 {
    margin: 0.75 0 1.45em;
    font-weight: bold;
    color: #333;
  }
  h1 {
    font-size: 2.25em;
  }
  h2 {
    font-size: 1.62671em;
  }
  h3 {
    font-size: 1.38316em;
  }
  h4 {
    font-size: 1em;
  }
  h5 {
    font-size: 85028em;
  }
  h6 {
    font-size: 78405em;
  }
  hr {
    margin: 5px 0;
    background: hsla(0, 0%, 0%, 0.2);
    border: none;
    height: 1px;
  }
  p {
    margin: 1em 0;
  }
  blockquote {
    margin: 0;
    border-left: 5px solid #1f2b86;
    padding: .5em 1.2em;
    background: hsla(0, 0%, 0%, 0.04);
    p {
      margin: .2em 0;
    }
  }
  ul {
    padding: 0 1.5em;
  }
  .gatsby-resp-image-wrapper {
    margin: 2em auto !important;
    display: block;
    border-radius: 5px;
    overflow: hidden;
  }
  .gatsby-resp-image-link {
    border: none;
  }
  img {
    max-width: 100%;
    border-radius: 5px;
  }
  a {
    color: #1f2b86;
    text-decoration: none;
    border-bottom: 1px solid #1f2b86;
  }
  table {
    margin: 2em auto;
    border: 1px solid #ddd;
    border-top-width: 0;
    border-left-width: 0;
    box-sizing: border-box;
    border-collapse: separate;
    border-spacing: 0;
  }
  thead {
    color: #585858;
    background-color: rgba(31, 43, 134, 0.3);
  }
  th, td {
    padding: 8px 18px;
    border-left: 1px solid #ddd;
    border-top: 1px solid #ddd;
  }
  code {
    padding: 0 4px;
    border-radius: 3px;
    /* color: #1f2b86; */
    background-color: #eee;
    font-family: Menlo, Monaco, 'Courier New', monospace !important;
  }
`

const Wrapper = function ({ frontmatter, children }) {
  return (
    <Blog>
      <Post>
        <PostCatogory>{frontmatter.categories.join(' & ')}</PostCatogory>
        <PostTitle>{frontmatter.title}</PostTitle>
        <PostMeta>
          <PostTags>
            <TagIcon style={{width: 20, height: 20, color: '#1f2b86'}} />
            <TagText>{frontmatter.tags.join('、')}</TagText>
          </PostTags>
          <PostPubDate>
            <DateIcon style={{width: 20, height: 20, color: '#1f2b86'}} />
            <DateText>{frontmatter.date}</DateText>
          </PostPubDate>
        </PostMeta>
        <PostDivider />
        <PostContent>
          {children}
        </PostContent>
        <div id="comment"></div>
      </Post>
    </Blog>
  )
}

export default ({ body, ...postProps }) => {
  useEffect(() => {
    new Valine({
      el: '#comment' ,
      appId: 'oGAoMTiX74JnL2KRBE8SkMfX-gzGzoHsz',
      appKey: 'a91VD3ESsKrbsz4PUwWldgGz',
      notify:false,
      verify:false,
      avatar:'mp',
      placeholder: '天空不曾留下翅膀的痕迹，但我已经飞过。。。',
    })
  }, [])
  return (
    <MDXProvider components={{
      'wrapper': (mdxProps) => <Wrapper {...postProps} {...mdxProps} />,
      'code': Carbon,
    }}>
      <MDXRenderer>{ body }</MDXRenderer>
    </MDXProvider>
  )
}