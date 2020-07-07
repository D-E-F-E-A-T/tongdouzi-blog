---
title: 初识 GraphQL
date: 2020-07-06
categories:
  - 技术
tags:
  - graphql
featureImage: ../vs.png
---

## REST in peace, long live GraphQL.

WEB 1.0 时代，浏览器和服务器之间使用 HTTP 传输的主要内容是页面。WEB 2.0 时代，ajax 技术的出现使得浏览器可以异步发起 HTTP 请求获取一些数据。
浏览器和服务器之间怎么交换信息，也就是怎么设计 API 接口，先后有以下几种规范：

- RPC - Remote Procedure Call
- REST - Representational State Transfer
- GraphQL - Graph APIs Query Language

**1、RPC**

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

**2、REST**

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

**3、GraphQL**

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

## GraphQL 工作流程

GraphQL 是一套规范，可以使用任何后端语言或者框架实现。这套规范包含两部分：GraphQL schema language 和 GraphQL query language，前者用来描述服务端能够被查询到的数据，后者用来描述客户端希望查询到的数据。

**1、GraphQL schema language**

GraphQL schema 可以看作是一堆 Object Type 的集合，每个 Object Type 可以有多个 field，每个 field 有自己的类型和解析函数。其中最重要的 Object type 有两个：Query 和 Mutation。Query 上每个 filed 就是一个 GraphQL 服务的一个查询入口，Mutation 上的每个 field 就是一个 GraphQL 服务的修改入口。

使用 Node 作为后端语言举例来说，可以用以下方式定义一个 GraphQL Schema：

```js
import {
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLSchema,
} from 'graphql';
import * as bookService from './bookService';

const TypeBook = new GraphQLObjectType({
  name: 'Book',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: '书的ID',
      resolve: (book) => book.id,
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: '书的名字',
      resolve: (book) => book.title,
    },
  },
});

const TypeQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    books: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TypeBook))),
      description: '获取所有的书',
      resolve: () => bookService.getAllBook(),
    },
    book: {
      type: TypeBook,
      args: {
        id: {
          type: GraphQLID,
        },
      },
      description: '获取指定ID的书',
      resolve: (root, args) => bookService.getBookById(args.id),
    },
  },
});

const TypeMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addBook: {
      type: TypeBook,
      args: {
        id: {
          type: GraphQLID,
        },
        title: {
          type: GraphQLString,
        }
      },
      description: '添加一本书',
      resolve: (root, args) => bookService.addBook(args),
    }
  }
});

const schema = new GraphQLSchema({
  query: TypeQuery,
  mutation: TypeMutation,
});

export default schema;
```

这个 Schema 中有两个查询入口 `books()` 和 `book(id)`，有一个修改入口 `addBook(id, title)`，使用 GraphQL schema language 表示如下：

```graphql
type Query {
  """获取所有的书"""
  books: [Book!]!

  """获取指定ID的书"""
  book(id: ID): Book
}

type Book {
  """书的ID"""
  id: ID!

  """书的名字"""
  title: String!
}

type Mutation {
  """添加一本书"""
  addBook(id: ID, title: String): Book
}
```

**2、GraphQL query language**

GraphQL query 就是对期望的查询结果结构的描述。

```js
import { graphql } from 'graphql';
import schema from './schema';

const addBookQuery = `
  mutation {
    addBook(id: "B003", title: "今日简史") {
      id
    }
  }
`;

const bookQuery = `
  query {
    book(id: "B003") {
      title
    }
  }
`;

const booksQuery = `
  query {
    books {
      title
    }
  }
`;

graphql(schema, addBookQuery).then(result => {
  console.log(JSON.stringify(result));  // {"data":{"addBook":{"id":"B003"}}}
});

graphql(schema, bookQuery).then(result => {
  console.log(JSON.stringify(result));  // {"data":{"book":{"title":"今日简史"}}}
});

graphql(schema, booksQuery).then(result => {
  console.log(JSON.stringify(result));  // {"data":{"books":[{"title":"人类简史"},{"title":"未来简史"},{"title":"今日简史"}]}}
});
```
