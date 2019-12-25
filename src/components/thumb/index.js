import React from 'react'
import styled from 'styled-components'
import { Link } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import { MDXProvider } from '@mdx-js/react'
import GatsbyImage from 'gatsby-image'

const Post = styled(Link)`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color:  #fff;
  border-radius: 5px;
  box-shadow: rgba(39,44,49,0.06) 8px 14px 38px, rgba(39, 44, 49, 0.03) 1px 3px 8px;
  transition: all 0.5s ease;
  overflow: hidden;
  text-decoration: none;
  :hover {
    box-shadow: rgba(39,44,49,0.07) 8px 28px 50px, rgba(39, 44, 49, 0.04) 1px 6px 12px;
    transition: all 0.4s ease;
    transform: translate3D(0, -1px, 0) scale(1.02);
  }
`

const FeatureImage = styled(GatsbyImage)`
  width: 100%;
  height: auto;
`

const Text = styled.div`
  padding: 20px 25px;
`

const Category = styled.h4`
  font-size: 12px;
  line-height: 14px;
  color: #738a94;
  margin: 0 0 4px;
  font-weight: 500;
`

const Title = styled.h3`
  font-size: 16px;
  line-height: 20px;
  margin: 0 0 10px;
  font-weight: 700;
  color: #15171a;
`

const Excerpt = styled.p`
  font-size: 14px;
  line-height: 18px;
  font-weight: 400;
  color: #696973;
  margin: 0;
  word-break: break-all;
`

const Wrapper = function ({ excerpt, frontmatter, fields }) {
  return (
    <Post to={fields.path}>
      {
        frontmatter.featureImage && <FeatureImage {...frontmatter.featureImage.childImageSharp} alt={frontmatter.title} />
      }
      <Text>
        {
          frontmatter.categories && frontmatter.categories.length && <Category>{frontmatter.categories.join(` & `)}</Category>
        }
        <Title>{frontmatter.title}</Title>
        <Excerpt>{excerpt}</Excerpt>
      </Text>
    </Post>
  )
}

export default ({ body, ...postProps }) => {
  return (
    <MDXProvider components={{
      'wrapper': (mdxProps) => <Wrapper {...mdxProps} {...postProps} />,
    }}>
      <MDXRenderer>{ body }</MDXRenderer>
    </MDXProvider>
  )
}
