const path = require('path')

exports.onCreateWebpackConfig = ({ actions, getConfig }) => {
  const config = getConfig()
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, 'src'),
  }
  actions.replaceWebpackConfig(config)
}

exports.onCreateNode = ({ node, actions }) => {
  let { createNodeField } = actions
  if (node.internal.type === `Mdx`) {
    createNodeField({
      node,
      name: `path`,
      value: node.frontmatter.path || `/posts/${node.frontmatter.title}`
    })
  }
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  const result = await graphql(`
    query {
      allMdx {
        nodes {
          id
          fields {
            path
          }
        }
      }
    }
  `)
  if (result.errors) {
    reporter.panicOnBuild('🚨  ERROR: Loading "createPages" query')
  }
  const posts = result.data.allMdx.nodes
  posts.forEach(({ id, fields }) => {
    createPage({
      path: fields.path,
      component: path.resolve(`./src/templates/post.js`),
      context: {
        // Data passed to context is available in page queries as GraphQL variablses.
        slug: id,
      },
    })
  })
}