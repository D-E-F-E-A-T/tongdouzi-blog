---
title: 还在用 Rest？试试 GraphQL 吧！
date: 2020-07-06
categories:
  - 技术
tags:
  - linux
featureImage: ./vs.png
---

## REST in peace, long live GraphQL.

WEB 1.0 时代，浏览器和服务器之间使用 HTTP 传输的主要内容是页面。WEB 2.0 时代，ajax 技术的出现使得浏览器可以异步发起 HTTP 请求获取一些数据。
浏览器和服务器之间怎么交换信息，也就是怎么设计 API 接口，先后有以下几种规范：

- RPC - Remote Procedure Call
- REST - Representational State Transfer
- GraphQL - Graph APIs Query Language

### 1、RPC

RPC 最早的，也是最简单的 API 规范。在 RPC 中认为一次 HTTP 交互过程就是一次远程函数调用的过程。
接口就是服务器上的一堆函数，浏览器通过 HTTP 调用服务器上的函数，函数的名字会放在 HTTP 请求的 URL 中，函数的调用参数放在 HTTP 请求的 query 或 body 中，函数调用的返回值放在 HTTP 响应中。

```http
GET /getBookById?id=B001 HTTP/1.1
Accept: application/json

```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id":"B001","title":"人类简史","authorId":"A001"}
```

### 2、REST

REST 是目前使用最广泛的 API 规范。在 REST 中，将服务器能够提供的数据看作是一种“资源”，HTTP 交互过程就是对这个资源进行**增、删、改、查**操作的过程。
浏览器通过 HTTP 对服务器的“资源”进行操作，操作的资源名字会放在 HTTP 请求的 URL 中，操作的类型会放在 HTTP 请求的 method 中，操作的结果会放在 HTTP 响应中。

```http
GET /book/B001 HTTP/1.1
Accept: application/json

```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id":"B001","title":"人类简史","authorId":"A001"}
```

### 3、GraphQL

GraphQL 是新兴的 API 规范。在 GraphQL 中，将服务器看作是一个“数据库”，HTTP 交互的过程就是执行 “SQL”的过程。这个 “SQL” 就是 “GraphQL” —— GraphQL 技术定义的一种 APIs 查询语言。
浏览器通过 HTTP 把 “SQL” 发送到服务器去执行，“SQL” 会放到 HTTP 请求的 body 中，“SQL” 的执行结果会放到 HTTP 响应中。

```http
POST / HTTP/1.1
Accept: application/json
Content-Type: application/json

{"operationName":null,"variables":{},"query":"{\n  book(id: \"B001\") {\n    title\n    author\n  }\n}\n"}
```

```http
HTTP/1.1 200 OK
Content-Range: application/json

{"data":{"book":{"title":"title","author":"author"}}}
```

## schema & resolver

## types

在 graphQL scheme 中的类型分为以下几类：

- Scalar types：类似于编程语言中的原始数据类型，有 Int、Float、String、Boolean 和 ID 这些种
- Object types：一组字段的集合，每个字段既可以是 Scalar type 也可以是另一个 Object type

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



