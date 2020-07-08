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
  console.log('process.env.GATSBY_ACTIVE_ENV', )
  return (
    <Blog>
      <Posts>
        {
          edges.filter((edge) => process.env.GATSBY_ACTIVE_ENV === 'development' ? true : edge.node.frontmatter.publish).map(edge => (
            <Thumb key={edge.node.id} {...edge.node} />
          ))
        }
      </Posts>
    </Blog>
  )
}

export const pageQuery = graphql`
  query {
    allMdx(sort: { fields: [frontmatter___date], order: [DESC] }) {
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "YYYY-MM-DD")
            categories
            publish
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