import React from 'react'
import styled from 'styled-components'
import Blog from '@/layouts/blog'
import StackGrid from 'react-stack-grid'
import { graphql } from 'gatsby'
import Thumb from '@/components/thumb'

const Posts = styled(StackGrid).attrs({
  gutterWidth: 30,
  gutterHeight: 30,
  columnWidth: 300,
  // enableSSR: true,
  vendorPrefix: true,
  component: 'div',
  itemComponent: 'div',
})`
  margin: 10px 0;
`

export default function ({ data: { allMdx: { edges } } }) {
  return (
    <Blog>
      <Posts>
        {
          edges.map(edge => (
            <Thumb key={edge.node.id} {...edge.node} />
          ))
        }
      </Posts>
    </Blog>
  )
}

export const pageQuery = graphql`
  query {
    allMdx {
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "YYYY-MM-DD")
            categories
            featureImage  {
              childImageSharp {
                fluid(maxWidth: 400) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
          }
          fields {
            path
          }
          excerpt(pruneLength: 100)
          body
        }
      }
    }
  }
`