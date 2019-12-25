import React from 'react'
import { graphql } from 'gatsby'
import Post from '@/layouts/post'

export default ({ data: { post } }) => {
  return (
    <Post {...post} />
  )
}

export const query = graphql`
  query($slug: String!) {
    post: mdx(id: {eq: $slug}) {
      frontmatter {
        title
        date(formatString: "YYYY-MM-DD")
        categories
        tags
      }
      body
    }
  }
`



// export default ({ body, ...postProps }) => {
//   return (
//     <MDXProvider components={{
//       'wrapper': (mdxProps) => <Wrapper {...mdxProps} {...postProps} />,
//     }}>
//       <MDXRenderer>{ body }</MDXRenderer>
//     </MDXProvider>
//   )
// }
