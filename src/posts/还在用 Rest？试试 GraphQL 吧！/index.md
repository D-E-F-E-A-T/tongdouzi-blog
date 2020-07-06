---
title: 还在用 Rest？试试 GraphQL 吧！
date: 2020-07-06
categories:
  - 技术
tags:
  - linux
featureImage: ./vs.png
---

## GraphQL vs Rest

blabla

## schema & resolver



## types

在 graphQL scheme 中的类型分为以下几类：

- Scalar types：类似于编程语言中的原始数据类型，有 Int、Float、String、Boolean 和 ID 这些种
- Object types：一组字段的集合，每个字段既可以是 Scalar type 也可以是另一个 Object type

```scheme
type Book {
  title: String
  author: Author
}

type Author {
  name: String
  books: [Book]
}
```

- The Query typ：定义了客户端读数据的所有最顶层的入口 ，形式上看起来像 bject type，但是它是一种特殊的类型。

```graphql
type Query {
  books: [Book]
  authors: [Author]
}
```

> 在 RESTful 风格的接口设计中，不同的数据拥有不同的入口，例如 /api/books 和 /api/authors。但是在 GraphQL 中，所有的客户端查询之后一个入口

- The Mutation type：定义了客户端写数据的所有顶层入口

```graphql
mutation CreateBook {
  addBook(title: "Fox in Socks", author: "Dr. Seuss") {
    title
    author {
      name
    }
  }
}
```

- Input types：一种特殊的类型，允许你传递一个对象去查询和修改一个数据。

```graphql
type Mutation {
  createPost(title: String, body: String, mediaUrls: [String]): Post
}
==>
type Mutation {
  createPost(post: PostAndMediaInput): Post
}

input PostAndMediaInput {
  title: String
  body: String
  mediaUrls: [String]
}
```



