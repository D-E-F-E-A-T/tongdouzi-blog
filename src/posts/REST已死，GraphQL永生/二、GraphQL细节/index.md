---
title: GraphQL 规范细节
date: 2020-07-06
categories:
  - 技术
tags:
  - graphql
featureImage: ../vs.png
---

## GraphQL schema language

在 graphQL schema 中的类型分为以下几类：

- Scalar types
- Object types
- The Query type
- The Mutation type
- Input types
- Enumeration types
- Union types
- Interfaces

**1、Scalar types**

类似于编程语言中的原始数据类型，有 Int、Float、String、Boolean 和 ID 这些种

scalar Date

```graphql
type Book {
  id: ID
  title: String
}
```

**2、Object types**

一组字段的集合，每个字段既可以是 Scalar type 也可以是另一个 Object type

```graphql
type Book {
  title: String
  author: Author
}

type Author {
  name: String
  books: [Book]
}
```

**3、The Query type**

定义了客户端读数据的所有最顶层的入口 ，形式上看起来像 object type，但是它是一种特殊的类型。

```graphql
type Query {
  books: [Book]
  authors: [Author]
}
```

**4、The Mutation type**

定义了客户端写数据的所有顶层入口

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

**5、Input types**

一种特殊的类型，允许你传递一个对象去查询和修改一个数据。

```graphql
# 不使用 Input types 时：
type Mutation {
  createPost(title: String, body: String, mediaUrls: [String]): Post
}
```

```graphql
# 使用 Input types 时：
type Mutation {
  createPost(post: PostAndMediaInput): Post
}

input PostAndMediaInput {
  title: String
  body: String
  mediaUrls: [String]
}
```

**6、Enumeration types**

```graphql
enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}
```

**7、!**

在一个类型后面加上一个 `!`，表示这个字段是不能为 null 的

```graphql
type Book {
  # title 字段是不能为 null 的
  title: String!
  # desc 字段是可以为 null 的
  desc: String
  # authors 字段是不能为 null 的，所以 authors 总是一个数组，数组中可能有零个或多个元素
  # 数组中的元素 User 是不能为 null 的，所以每一个元素总是一个 User 对象
  authors: [User!]!
}
```

## GraphQL query language

哈哈哈
