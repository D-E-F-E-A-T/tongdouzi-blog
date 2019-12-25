import React from 'react'
import styled from 'styled-components'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import { MDXProvider } from '@mdx-js/react'
import Blog from '@/layouts/blog'
import TagIcon from './tag.svg'
import DateIcon from './date.svg'
import 'katex/dist/katex.min.css'
import Carbon from '@/components/carbon'

const Post = styled.article`
  position: relative;
  margin: 10px 30px;
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
  }
  a {
    color: #1f2b86;
    text-decoration: none;
    border-bottom: 1px solid #1f2b86;
  }
  table {
    width: 100%;
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
    padding: 8px;
    border-left: 1px solid #ddd;
    border-top: 1px solid #ddd;
  }
  code {
    padding: 0 4px;
    border-radius: 3px;
    /* color: #1f2b86; */
    background-color: #eee;
    font-family: Hack, monospace !important;
  }
`

const Wrapper = function ({ frontmatter, children }) {
  return (
    <Blog>
      <Post>
        <PostCatogory>{frontmatter.categories.join(' & ')}</PostCatogory>
        <PostTitle>{frontmatter.title}</PostTitle>
        <PostMeta>
          {/* svg ICON */}
          {/* <PostTags>
            <TagIcon style={{width: 20, height: 20, color: '#1f2b86'}} />
            <TagText>{frontmatter.tags.join('、')}</TagText>
          </PostTags>
          <PostPubDate>
            <DateIcon style={{width: 20, height: 20, color: '#1f2b86'}} />
            <DateText>{frontmatter.date}</DateText>
          </PostPubDate> */}
        </PostMeta>
        <PostDivider />
        <PostContent>
          {children}
        </PostContent>
      </Post>
    </Blog>
  )
}

export default ({ body, ...postProps }) => {
  return (
    <MDXProvider components={{
      'wrapper': (mdxProps) => <Wrapper {...postProps} {...mdxProps} />,
      'code': Carbon,
      // 'img': (xxx) => {
      //   console.log('xxx', xxx)
      //   return <h3>asda</h3>
      // }
    }}>
      <MDXRenderer>{ body }</MDXRenderer>
    </MDXProvider>
  )
}