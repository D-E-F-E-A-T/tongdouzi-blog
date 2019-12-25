module.exports = {
  siteMetadata: {
    title: `铜豆子`,
    description: `因上努力，果上随缘`,
    author: `@Shawmon`,
  },
  plugins: [
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `file`,
        path: `${__dirname}/src/`,
        ignore: [`**/*\.css`, `**/*\.js`, `**/*\.jsx`, `**/*\.graffle`],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1200,
            },
          },
          {
            resolve: `gatsby-remark-katex`,
            options: {
              // Add any KaTeX options from https://github.com/KaTeX/KaTeX/blob/master/docs/options.md here
              strict: `ignore`
            }
          },
        ],
        remarkPlugins: [require(`remark-emoji`), require(`remark-pangu`)],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `铜豆子`,
        short_name: `铜豆子`,
        start_url: `/`,
        background_color: `#252526`,
        theme_color: `#252526`,
        display: `minimal-ui`,
        icon: `favicon.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-plugin-postcss`,
      options: {
        postCssPlugins: [require(`postcss-preset-env`)({ stage: 0 })],
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
