---
title: 前端自动化测试框架 - Jest
date: 2019-09-30
categories:
  - 技术
tags:
  - js
featureImage: ./jest.png
publish: true
---

# 前端自动化测试框架 - Jest

Jest 是 Facebook 在 Jasmine 的基础上开发并且开源的一款前端自动化测试框架，聚焦于简单，集成匹配器、Mock、JS-DOM、覆盖率测试、快照测试等特性于一身，开箱即用，配置简单。

## Jest 是个啥？

用户对前端页面的美观度、流畅度、交互友好度的要求随着互联网的发展水涨船高，需要更好的前端技术来支撑更优的用户体验。仅几年，前端领域风起云涌，各种框架、工具层出不穷，前端项目的复杂度也是成倍提升，人工测试的成本越来越高。因此，前端自动化测试的地位也越来越重要。

自动化测试是一种让代码更新快速安全过度到生成环境开发方式，根据测试目标可以分为三类：

- 单元测试 - Unit Testing：测试目标是代码块（code pieces），例如一个函数、一个类。测试的目的是帮助开发者写出拥有良好设计的代码、并且能够快速精确定位到有问题的代码。单元测试的测试用例是和外部隔离的，不能使用外部资源如网络、数据库。

- 集成测试 - Integration Testing：测试目标是系统的组成部分（system parts），例如网络模块、数据库模块。测试的目的是确保两个分开的系统（如应用和数据库）之间能够正确协同工作。集成测试的测试用例往往需要经过一些安装、配置的过程。

- 功能测试 - Functional Testing/E2E tests/browser tests：测试目标是整个系统，测试的目的是确保用户不会遭遇 bug。功能测试的测试用例是站在用户的视角，模拟用户与软件的交互

[What are Unit Testing, Integration Testing and Functional Testing?](https://codeutopia.net/blog/2015/04/11/what-are-unit-testing-integration-testing-and-functional-testing/)

[JavaScript Testing: Unit vs Functional vs Integration Tests](https://www.sitepoint.com/javascript-testing-unit-functional-integration/)

前端项目大多数场景只需要单元测试和功能测试，Jest 内置强大的 Mock 可以很方便的隔绝外部资源做单元测试、并且配合 Puppeteer 模拟用户和浏览器的交互做功能测试。

## Jest 怎么用？

### 初始化项目

```bash
mkdir jest-examples
cd jest-examples
yarn init
yarn add --dev jest
```

### 编写测试文件和被测试文件

```js
// math.js
function plus (a, b){
  return a + b;
};

module.exports = {
  plus
};
```

```js
// math.test.js
test('test 1 plus 2 equals 3', () => {
  const { plus } = require('../math');
  if (plus(1, 2) !== 3) throw new Error('比对错误');
});

test('test 0.1 plus 0.2 equals 0.3', () => {
  const { plus } = require('../math');
  if (plus(0.1, 0.2) !== 0.3) throw new Error('比对错误');
});
```

### 运行测试

```bash
npx jest math.test.js
```

```bash
FAIL math.test.js
  ✓ test 1 plus 2 equals 3 (2ms)
  ✕ test 0.1 plus 0.2 equals 0.3 (1ms)

  ● test 0.1 plus 0.2 equals 0.3

    比对错误

      6 | test('test 0.1 plus 0.2 equals 0.3', () => {
      7 |   const { plus } = require('./math');
    > 8 |   if (plus(0.1, 0.2) !== 0.3) throw new Error('比对错误');
        |                                     ^
      9 | });

      at Object.<anonymous> (math.test.js:8:37)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   0 total
Time:        0.801s, estimated 1s
Ran all test suites matching /math.test.js/i.
```

### 工程化

测试文件一般来说与被测文件一一对应，测试文件名字与被测文件名字一致，以 `.test.js` 或者 `.spec.js` 结尾，与被测文件位于同级目录，或者新建一个 `__tests__` 目录放置。

可以在项目添加一个 `jest.config.js` 文件，配置 Jest 使用正则表达式自动搜寻项目下的所有测试文件：

```js
// jest.config.js
module.exports = {
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
  ],
};
```

然后在 package.json 中配置 test 脚本：

```json
{
  "name": "jest-examples",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^24.9.0"
  }
}
```

完整目录结构如下：

```
➜  jest-examples tree --filelimit 5
.
├── jest.config.js
├── node_modules [405 entries exceeds filelimit, not opening dir]
├── package.json
├── src
│   ├── __tests__
│   │   └── math.test.js
│   └── math.js
└── yarn.lock

3 directories, 5 files
```

## Jest 的测试用例

### 测试套件 & 测试用例

测试用例（test case）是测试文件中的最小组成单元，使用 `test(name, fn, timeout)` 或者 `it(name, fn, timeout)` 定义：

```js
test('test 1 plus 2 equals 3', () => {
  const { plus } = require('../math');
  if (plus(1, 2) !== 3) throw new Error('比对错误');
});
```

将测试同一功能的所有测试用例组合在一起，称为测试套件（test suit），使用 `describe(name, fn)` 定义：

```js
describe('test plus function', () => {

  test('test 1 plus 2 equals 3', () => {
    const { plus } = require('../math');
    if (plus(1, 2) !== 3) throw new Error('比对错误');
  });

  test('test 0.1 plus 0.2 equals 0.3', () => {
    const { plus } = require('../math');
    if (plus(0.1, 0.2) !== 0.3) throw new Error('比对错误');
  });

});
```

> 两种测试风格：
> - 测试驱动开发 - TDD Test-driven development (TDD)：测试文件一般以 `.test.js` 结尾，测试案例一般使用 `it(name, fn, timeout)` 定义，认为测试文件是用来测试代码是否满足某些条件（if do this thing）
> - 行为驱动开发 - BDD Behavior-driven development (BDD)：测试文件一般以 `.spec.js` 结尾，测试案例一般使用 `test(name, fn, timeout)` 定义，认为测试文件是用来应该满足某些条件（should do this thing）

> TDD 风格和 BDD 风格只是指导开发的思想不一样，在使用上并无二致，实际上 Jest 对 `.test.js` 文件和 `.spec.js` 文件一视同仁，`it(name, fn, timeout)` 也只是 `test(name, fn, timeout)` 的一个别名。

### 同步 & 异步

`test(name, fn, timeout)` 函数，`name` 是描述测试用例作用的字符串，`fn` 是测试用例执行过程函数。测试用例的执行过程可能是同步的、也可能是异步的。

测试同步过程的测试案例，判定规则很简单，整个过程中没有发生任何异常，则测试用例通过，否则失败：

```js
test('测试同步过程 - 没有发生异常', () => {
  // do nothing...
});
test('测试同步过程 - 发生异常', () => {
  throw new Error('发生异常了')
});
```

```
FAIL  src/__tests__/math.test.js
  ✓ 测试同步过程 - 没有发生异常 (1ms)
  ✕ 测试同步过程 - 发生异常 (1ms)

  ● 测试同步过程 - 发生异常

    发生异常了

      3 | });
      4 | test('测试同步过程 - 发生异常', () => {
    > 5 |   throw new Error('发生异常了')
        |         ^
      6 | });
      7 |
      8 | // test('test 1', (done) => {

      at Object.<anonymous> (src/__tests__/math.test.js:5:9)
```

测试异步过程的测试案例在 Javascript 同样常见，Jest 需要知道异步过程什么时候执行结束。有两种处理方式：

**1、`callback`** 在 `fn` 函数里接收一个参数 `done`，在异步过程结束时调用 `done()` 告诉 Jest 异步过程结束。在 `done()` 调用前没有发生异常，则测试用例通过，否则失败。Jest 通过 fn.length 判定这是一个同步过程还是一个异步过程，通过 `process.on('uncaughtException')` 判定异步过程中有没有发生异常

```js
test('callback 方式测试异步过程 - 没有发生异常', (done) => {
  setTimeout(() => {
    // do nothing...
    done()
  }, 10)
});
test('callback 方式测试异步过程 - 发生异常', (done) => {
  setTimeout(() => {
    throw new Error('发生异常了')
    done()
  }, 10)
});
```

```
FAIL  src/__tests__/math.test.js
  ✓ callback 方式测试异步过程 - 没有发生异常 (13ms)
  ✕ callback 方式测试异步过程 - 发生异常 (18ms)

  ● callback 方式测试异步过程 - 发生异常

    发生异常了

       7 | test('callback 方式测试异步过程 - 发生异常', (done) => {
       8 |   setTimeout(() => {
    >  9 |     throw new Error('发生异常了')
         |           ^
      10 |     done()
      11 |   }, 10)
      12 | });

      at src/__tests__/math.test.js:9:11

  console.error node_modules/jsdom/lib/jsdom/virtual-console.js:29
    Error: Uncaught [Error: 发生异常了]
        at reportException (/Users/pxm/Demos/jest-examples/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
        at Timeout.callback [as _onTimeout] (/Users/pxm/Demos/jest-examples/node_modules/jsdom/lib/jsdom/browser/Window.js:680:7)
        at listOnTimeout (internal/timers.js:531:17)
        at processTimers (internal/timers.js:475:7) Error: 发生异常了
        at /Users/pxm/Demos/jest-examples/src/__tests__/math.test.js:9:11
        at Timeout.callback [as _onTimeout] (/Users/pxm/Demos/jest-examples/node_modules/jsdom/lib/jsdom/browser/Window.js:678:19)
        at listOnTimeout (internal/timers.js:531:17)
        at processTimers (internal/timers.js:475:7)
```

**2、`Promise`** `fn` 返回一个 Promise 对象，这个 Promise 对象 fullfiled，则测试用例通过，如果这个 Promise 对象 rejected，则测试用例失败：

```js
test('promise 方式测试异步过程 - 没有发生异常', () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // do nothing...
      resolve();
    }, 10);
  });
});
test('promise 方式测试异步过程 - 发生异常', () => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('发生异常了'));
    }, 10)
  });
});
```

```
 FAIL  src/__tests__/math.test.js
  ✓ promise 方式测试异步过程 - 没有发生异常 (14ms)
  ✕ promise 方式测试异步过程 - 发生异常 (12ms)

  ● promise 方式测试异步过程 - 发生异常

    发生异常了

      10 |   return new Promise((_, reject) => {
      11 |     setTimeout(() => {
    > 12 |       reject(new Error('发生异常了'));
         |              ^
      13 |     }, 10);
      14 |   });
      15 | });

      at src/__tests__/math.test.js:12:14
```

**3、`async/await`** 本质上只是 `Promise` 方式的一种语法糖

```js
test('async/await 方式测试异步过程 - 没有发生异常', async () => {
  await new Promise((resolve) => {
    setTimeout(() => {
      // do nothing...
      resolve();
    }, 10);
  });
});
test('async/await 方式测试异步过程 - 发生异常', async () => {
  await new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('发生异常了'));
    }, 10);
  });
});
```

下面两种方式后续再做介绍

**4、`expect.assertions(1)`**

**5、`expect(fetchData()).resolves`**

### 安装（setup） & 卸载（teardown）

在运行测试用例之前，可能有一些初始化或者安装的工作；在运行测试用例之后，可能有一些清理或者卸载的工作。Jest 提供 `beforeEach()/afterEach()` 来安装/卸载一些在每个测试用例执行前后都需要重复执行的工作，提供 `beforeAll()/afterAll()` 来安装/卸载一些在所有测试用例执行前后一次性执行的工作。

```js
let http = null;
// 初始化 http 实例
beforeAll(() => {
  const { create } = require('axios')
  http = create({
    baseURL: 'https://jsonplaceholder.typicode.com/',
    timeout: 1000,
  });
});

beforeEach(() => {
  console.log('准备执行测试用例...')
});

test('测试 /todos/ 接口是否畅通', async () => {
  const resp = await http.get('/todos');
  if (resp.status !== 200) throw new Error('请求出错');
});

test('测试 /todos/1 接口是否畅通', async () => {
  const resp = await http.get('/todos/1');
  if (resp.status !== 200) throw new Error('请求出错');
});

afterEach(() => {
  console.log('测试用例执行结束')
})

// 清理 http 实例
afterAll(() => {
  http = null;
});
```

```
yarn run v1.9.4
$ jest
  console.log src/__tests__/math.test.js:12
    准备执行测试用例...

  console.log src/__tests__/math.test.js:26
    测试用例执行结束

  console.log src/__tests__/math.test.js:12
    准备执行测试用例...

PASS src/__tests__/math.test.js
  ✓ 测试 /todos/ 接口是否畅通 (713ms)
  ✓ 测试 /todos/1 接口是否畅通 (553ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        2.234s
Ran all test suites.
  console.log src/__tests__/math.test.js:26
    测试用例执行结束

✨  Done in 3.01s
```

> - `beforeAll()/afterAll()/beforeEach()/afterEach()` 和 `test()` 一样可以包裹在 `describe()` 中，只对所在的 `describe` 块生效
> - `beforeAll()/afterAll()/beforeEach()/afterEach()` 和 `test()` 一样可以使用 callback 或者 promise 的方式处理异步过程

## Jest 的匹配器 - matchers

Jest 使用 matchers 测试一个值，当期望值与实际值不匹配，则抛出一个异常，测试用例失败

```js
test('测试 1 + 1 是不是等于 2',  () => {
  expect(1+1).toBe(2);
});
```

- `.toBe()` 是最通用的 matcher，可以用来比较数值、字符串、布尔值等等

```js
expect(1).toBe(1);
expect('hello').toBe('hello');
expect(true').toBe(true);
```

- `.toBeNull()/.toBeUndefined()/.toBeDefined()` 可以分别看作 `.toBe(null)/.toBe(undefined)/.not.toBe(undefined)` 的简写

```js
let a;
expect(a).toBeUndefined();  // <=> expect(a).toBe(undefined);
a = null;
expect(a).toBeDefined(); // <=> expect(a).not.toBe(undefined);
expect(a).toBeNull(); // <=> expect(a).toBe(null);
```

- `.toBeTruthy()/.toBeFalsy()` 用来判断一个值是不是真值/假值，可以看作 `expect(!!value).toBe(true)/expect(!!value).toBe(false)` 的简写

```js
expect(1).toBeTruthy();
expect(null).toBeFalsy();
```

- `.toEqual()/.toBeGreaterThan()/.toBeGreaterThanOrEqual()/.toBeLessThan()/.toBeLessThanOrEqual()` 可以用来比较两个值的大小

```js
expect(1).toEqual(1); // <=> expect(1).toBe(1);
expect(1).toBeGreaterThan(0);
expect(1).toBeGreaterThanOrEqual(1);
```

- `.toBeClose()` 专门用于浮点数的比较，避免 js 的 round-off error

```js
expect(0.1 + 0.2).toBe(0.3);  // 比较不通过，在 js 中 0.1 + 0.2 得到的结果是 0.30000000000000004
expect(0.1 + 0.2).toBeCloseTo(0.3); // 比较通过
```

- `.toMatch()` 用于判断一个字符串类型是否匹配一个正则表达式

```js
expect('hello, world!').toMatch(/^hello/);
```

- `.toContain()` 用于判断一个元素是否包含在一个数组中（或者任何 iterables）

```js
expect('China').toContain(['China', 'US', 'Russia', 'UK', 'France']);
```

- `.toThrow()` 用于判断一个函数执行过程中是否抛出异常

```js
expect(() => {
  throw new Error('未知异常');
}).toThrow();
expect(() => {
  throw new Error('未知异常');
}).toThrow(Error);
expect(() => {
  throw new Error('未知异常');
}).toThrow('未知异常');
expect(() => {
  throw new Error('未知异常');
}).toThrow(/异常$/);
```

- toEqual
- Promise resolves rejects

## Jest 的 Mock

### mock 函数

mock 是一种将被测对象依赖的函数替换成可观察、可控制的函数的技术手段。这个可观察、可控制的函数就是 mock 函数。Mock 函数是 Jest 一切 mock 技巧的基础，我们来先了解一些 ,mock 函数。

mock 函数的创建有两种方式：

- `jest.fn(implementation)`：参数 `implementation` 是 Mock 函数的实现，没有指定时，默认实现是一个返回 undefined 的函数。

```js
axios.get = jest.fn(x => x * x);
```

- `jest.spyOn(object, methodName)`：在用法上它是用来 mock 一个对象上的方法，但是与 `jest.fn()` 不同的是，它会保留函数的原始实现

```js
jest.spyOn(axios, 'get');
```

需要注意是：大部分场景直接使用 `jest.fn()` 不会保留原始实现，这也是 `jest.spyOn(object, methodName)` 存在的意义：

```js
const axios = require('axios');
jest.spyOn(axios, 'get');
axios.get.mockReturnValue('hello');
axios.get();  // 'hello'
axios.get.mockRestore();  // 还原原始实现、仅对 `jest.spyOn()` 创建的 Mock 函数有效
axios.get('https://jsonplaceholder.typicode.com/todos/1');
```

mock 函数 有两个重要的特征：

- 可观察：监视被其他代码调用的行为，包括函数返回值、调用传参、this 指向等等
- 可控制：篡改函数调用的返回值

mock 函数被调用的所有记录保存在 `.mock` 字段中，`.mockClear()` 方法用来清空所有调用记录：

```js
test('监视 mock 函数被调用历史', () => {
  const mockFn = jest.fn(x => x * x);
  [0, 1, 2].map(mockFn);
  expect(mockFn.mock.calls.length).toBe(3); // mock 函数被调用了 3 次
  expect(mockFn.mock.calls[2][0]).toBe(2);  // mock 函数第三次调用的第一个入参是 2
  expect(mockFn.mock.results[2].value).toBe(4); // mock 函数第三次调用的返回值是 4
  mockFn.mockClear(); // 清空调用历史
  const bindMockFn = mockFn.bind({ name: 'wangcai' }, 3);
  bindMockFn();
  expect(mockFn.mock.instances.length).toBe(1); // mock 函数被调用了 1 次
  expect(mockFn.mock.instances[0].name).toBe('wangcai'); // mock 函数第一次调用的 this 对象的 name 属性是 'wangcai'
});
```

mock 函数通过 `.mockReturnValue[Once](value)/.mockResolvedValue[Once](value)/.mockRejectedValue[Once](value)` 来篡改函数的返回值，通过 `.mockImplementation[Once](fn)` 来篡改函数的实现，`.mockReset()` 来清空所有的 mock value

```js
test('篡改 mock 函数的实现', () => {
  const mockFn = jest.fn();
  mockFn.mockReturnValueOnce(2);  // mock 一个返回值
  expect(mockFn()).toBe(2);
  mockFn.mockResolvedValueOnce(2);  // mock 一个 fullfilled promise 值
  expect(mockFn()).resolves.toBe(2);
  mockFn.mockImplementation(x => x * x);  // mock 一个函数实现
  expect(mockFn(3)).toBe(9);
  expect(mockFn(4)).toBe(16);
  mockFn.mockReset(); // 重设所有实现
  expect(mockFn()).toBeUndefined();
});
```

### mock 一个模块

当被测目标支持外部注入依赖时，测试过程会很愉快：

```js
// api.sjs
module.exports = {
  getTodos: async function (get) {
    const resp = await get('https://jsonplaceholder.typicode.com/todos');
    return resp.data;
  },
};
```

```js
// api.test.js
test('mock 函数通过传参的方式注入到被测目标', () => {
  const { getTodos } = require('../api');
  const mockGet = jest.fn().mockResolvedValue(Promise.resolve({
    status: 200,
    data: { title: 'read book' },
  }));
  getTodos(mockGet);
  expect(mockGet).toHaveBeenCalled();
});
```

但是很多场景下，被测目标的依赖是从外部模块中引入的。这时候就需要 mock 进被测目标依赖的模块：

**自动 mock** 使用`jest.mock(modulePath)` 来自动 mock 整个模块：

```js
// api.js
module.exports = {
  getTodos: async function () {
    const axios = require('axios');
    const resp = await axios.get('https://jsonplaceholder.typicode.com/todos');
    return resp.data;
  },
};
```

```js
// api.test.js
test('mock 函数通过 mock 整个模块的方式注入被测目标', () => {
  jest.mock('axios');
  const axios = require('axios');
  axios.get.mockResolvedValue(Promise.resolve({
    status: 200,
    data: { title: 'read book' },
  }));
  const { getTodos } = require('../api');
  getTodos();
  expect(axios.get).toHaveBeenCalled();
});
```

`jest.mock()` 还可以接收第二个参数 factory，返回值将会替换到模块的真实导出：

```js
test('mock 一个模块', async () => {
  jest.mock('axios', () => {
    return {
      get: jest.fn().mockResolvedValue(Promise.resolve({
        status: 200,
        data: { title: 'read book' },
      }))
    };
  });
  const axios = require('axios');
  const resp = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
});
```

自动 mock 的模块，所有原有实现都会丢失，如果想获取模块的原有实现，使用 `jest.requireActual()` 取代 `require()`：

```js
test('mock 一个模块', async () => {
  jest.mock('axios');
  const mockedAxios = require('axios');
  const actualAxios = jest.requireActual('axios');
  expect(jest.isMockFunction(mockedAxios.get)).toBeTruthy();
  expect(jest.isMockFunction(actualAxios.get)).toBeFalsy();
});
```

还有一点需要注意，由于 ES6 的模块化语法 import 语句必须在文件的最顶层，`jest.mock()` 方法只能在 import 之后调用，因此 import 得到的只能是没有 mock 过的原始实现。为了自动 mock 功能兼容 es6 模块，Jest 使用 babel-jest 转换测试文件，将 `jest.mock()` 调用提升到所在块的最顶层：

```js
test('mock 一个模块', async () => {
  const axios = require('axios');
  jest.mock('axios');
  // 得到的是 mock 之后的实现
  expect(jest.isMockFunction(axios.get)).toBeTruthy();
});
```

当不希望 Jest 提升 `jest.mock()` 作用时机时，可以使用 `jest.doMock()` 取代 `jest.mock()`：

```js
test('mock 一个模块', async () => {
  const unMockedAxios = require('axios');
  expect(jest.isMockFunction(unMockedAxios.get)).toBeFalsy();
  jest.doMock('axios');
  const mockedAxios = require('axios');
  expect(jest.isMockFunction(mockedAxios.get)).toBeTruthy();
});
```

**手动 mock** 使用外部 mock 文件替换掉整个模块

手动 mock 一个自定义模块，只需要在模块同级路径下添加一个 `__mocks__/moduleName.js` 文件，并且在测试文件中手动调用一下 `jest.mock(modulePath)`

```
.
├── jest.config.js
├── node_modules [407 entries exceeds filelimit, not opening dir]
├── package.json
├── src
│   ├── __mocks__
│   │   └── api.js
│   ├── __tests__
│   │   └── api.test.js
│   ├── api.js
└── yarn.lock
```

```js
// src/__mocks__/api.js
module.exports = {
  getTodos: jest.fn().mockReturnValue(2)
};
```

```js
// src/api.test.js
test("手动 mock 一个自定义模块", () => {
  jest.mock('../api');  //
  const { getTodos } = require('../api');
  expect(jest.isMockFunction(getTodos)).toBe(true);
});
```

手动 mock 一个 Node 模块，只需要在 node_modules 同级目录下添加一个 `__mocks__/moduleName.js` 文件，并且自动 mock（Jest 的 autoMock 默认为 true），不需要在测试文件中调用 `jest.mock(modulePath)`，如果 mock 的是内建模块如 `fs`、`path` 则仍需调用 `jest.mock(modulePath)`

```
.
├── __mocks__
│   └── axios.js
├── jest.config.js
├── node_modules [407 entries exceeds filelimit, not opening dir]
├── package.json
├── src
│   ├── __tests__
│   │   └── axios.test.js
└── yarn.lock
```

```js
// __mocks__/axios.js
module.exports = {
  get: jest.fn().mockResolvedValue(Promise.resolve({
    status: 200,
    data: { title: 'read book' },
  })),
};
```

```js
// src/__tests__/axios.test.js
test("手动 mock 一个 Node 模块", () => {
  const axios = require('axios');
  expect(jest.isMockFunction(axios.get)).toBe(true);
});
```

## timer mocks

当被测代码中使用了定时器相关的函数 `setTimeout`、`setInterval`、`clearTimeout`、`clearInterval` 时，由于这些函数工作依赖真实的时间流逝，测试起来会比较棘手。测试用例要求越快跑完越好，超时会算作失败。

Jest 使用 `jest.useFakeTimers()` 方法将 `setTimeout`、`setInterval`、`clearTimeout`、`clearInterval` 替换成 mock 函数，可以在测试用例中操控时间流逝，在更短的时间内跑完测试用例。

```js
test('test timer mock', () => {
  jest.useFakeTimers();
  expect(jest.isMockFunction(setTimeout)).toBe(true);
});
```

Jest 提供三个 API 来控制 timer mocks 的时间流逝：

- `jest.advanceTimersByTime(10000)`：指定 timer 快进多少毫秒
- `jest.runOnlyPendingTimers()`：所有 timer 快进到结束
- `jest.runAllTimers()`：所有 pending 的 timer 快进的结束

```js
// hearbeat.js
let count = 10
module.exports = function heartbeat (callback) {
  setTimeout(() => {
    console.log('heart beating...');
    callback && callback();
    count--
    if (count) heartbeat(callback);
  }, 1000);
};

```

```js
// hearbeat.test.js
test('test timer mock', async () => {
  jest.useFakeTimers();
  expect(jest.isMockFunction(setTimeout)).toBe(true);

  const hearbeat = require('./hearbeat');
  const callback = jest.fn();
  hearbeat(callback);
  jest.runOnlyPendingTimers();  // 当前 pengding 状态的 timer 快进到下一步
  expect(callback).toBeCalledTimes(1);
  jest.advanceTimersByTime(2000); // 跨进 2s
  expect(callback).toBeCalledTimes(3);
  jest.runAllTimers();  // 所有 timer 快进到下一步
  expect(callback).toBeCalledTimes(10);
})
```

## 与其他工具搭配使用

### 配合 babel

让我们开始尝试测试一个最简单的 React 组件：

```js
// app/index.js
import React from 'react';

export default function () {
  return <h3>hello, react!</h3>;
};
```

```js
// app.test.js
import App from '../App';
import { isElement } from 'react-dom/test-utils';

test('使用 babel 转换 js 文件', () => {
  expect(isElement(App())).toBe(true);
});
```

执行 jest 测试会报错：

```js
➜  jest-examples yarn test
yarn run v1.9.4
$ jest
FAIL src/__tests__/app.test.js
  ● Test suite failed to run

    /Users/pxm/Demos/jest-examples/src/__tests__/app.test.js:1
    ({"Object.<anonymous>":function(module,exports,require,__dirname,__filename,global,jest){import App from '../app';
                                                                                                    ^^^

    SyntaxError: Unexpected identifier

      at ScriptTransformer._transformAndBuildScript (node_modules/@jest/transform/build/ScriptTransformer.js:537:17)
```

这是因为虽然 jest 自动安装 jest-babel 来支持 babel 转换文件，但是 babel 没有配置任何插件，测试运行时 node 环境并不支持的 ES6 的 `import/export` 语法，React 的 jsx 语法并不会得到转换。需要新增一个 babel 配置文件并安装相关依赖：

```bash
yarn add @babel/preset-env @babel/preset-react -D
```

```js
// babel.config.js
module.exports = function (api) {
  return {
    presets: [
      ['@babel/preset-env', {
        targets: api.env() === 'test'
        ? {
          node: 'current',
        }
        : {
          browsers: '> 1%, last 2 versions, not ie <= 8',
        }
      }],
      ['@babel/preset-react'],
    ],
    plugins: [],
  };
}
```

babel-jest 是一个 Jest 插件，他的作用是使 Jest 能够使用 babel，并且对文件做一些额外处理（例如提升 `jest.mock()` 调用时机）。babel-jest 会随着 jest 自动安装，并且自动使用 babel 去转译文件。也可以显式在配置文件中指定 babel-jest 转换 js 文件：

```js
// jest.config.js
module.exports = {
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
  ],
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
  ],
};
```

### 配合 webpack

webpack 是前端领域使用最广泛的打包工具，不断可以管理 js 文件，还可以管理样式表、图片、字体等各种资源文件。比如上面的 app 组件，升级一下：

```js
// app/index.js
import React from 'react';
import './index.css';

export default function () {
  return (
    <div className={'app'}>
      <h3>hello, react!</h3>
      <img src={require('./logo.png')} />
    </div>
  );
};
```

组件中引用了一个 css 文件和一个 png 文件，需要配置 webpack 使 webpack 能够正确处理这些资源：

```bash
yarn add webpack webpack-cli babel-loader style-loader css-loader file-loader html-webpack-plugin -D
```

```js
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle-[hash:8].js'
  },
  module: {
    rules: [
      {test: /\.jsx?$/, loader: 'babel-loader', exclude: [path.resolve(__dirname, './node_modules')]},
      {test: /\.css$/, loader: 'style-loader!css-loader'},
      {test: /\.(png|jpg|svg|ttf|eot|svg)$/, loader: 'file-loader'},
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx'],
  },
  plugins: [new HtmlWebpackPlugin()],
};
```

在运行 jest 测试时，由于没有 webpack 帮助管理 css 和 png 文件，需要配置 jest 自己去转换这些资源文件和路径映射：

```js
// jest.config.js
module.exports = {
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
  ],
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',  // 用 babel-jest 转换 js 文件
    '^.+\\.css$': '<rootDir>/__mocks__/cssTransform.js',  // 自定义转换器 cssTransform 转换 css 文件
    '^.+\\.(png|jpg|svg|ttf|eot|svg)$': '<rootDir>/__mocks__/fileTransform.js', // 自定义转换器 fileTransform 转换图片、字体文件
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',  // @ 映射到 src 目录下
  },
  moduleFileExtensions: [
    'js',
    'tsx',
  ],
};
```

其中用到的两个自定义转换器借用了 create react app 的写法：

```js
// __mocks__/cssTransform.js
'use strict';

// This is a custom Jest transformer turning style imports into empty objects.
// http://facebook.github.io/jest/docs/en/webpack.html

module.exports = {
  process() {
    return 'module.exports = {};';
  },
  getCacheKey() {
    // The output is always the same.
    return 'cssTransform';
  },
};
```

```js
// __mocks__/fileTransform.js
'use strict';

const path = require('path');
const camelcase = require('camelcase');

// This is a custom Jest transformer turning file imports into filenames.
// http://facebook.github.io/jest/docs/en/webpack.html

module.exports = {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename));

    if (filename.match(/\.svg$/)) {
      // Based on how SVGR generates a component name:
      // https://github.com/smooth-code/svgr/blob/01b194cf967347d43d4cbe6b434404731b87cf27/packages/core/src/state.js#L6
      const pascalCaseFileName = camelcase(path.parse(filename).name, {
        pascalCase: true,
      });
      const componentName = `Svg${pascalCaseFileName}`;
      return `const React = require('react');
      module.exports = {
        __esModule: true,
        default: ${assetFilename},
        ReactComponent: React.forwardRef(function ${componentName}(props, ref) {
          return {
            $$typeof: Symbol.for('react.element'),
            type: 'svg',
            ref: ref,
            key: null,
            props: Object.assign({}, props, {
              children: ${assetFilename}
            })
          };
        }),
      };`;
    }

    return `module.exports = ${assetFilename};`;
  },
};
```

## Jest 的 UI 测试

前端测试绝大多数场景需要跟 UI 打交道。推荐配合 Enzyme 库，Enzyme 是 airbnb 开源的 React 测试工具，提供类似 jQuery 简洁易用的 API。与 Jest 搭配的时候推荐使用 jest-enzyme 库，jest-enzyme 库封了很多方便的 matcher。

**安装配置**

```bash
yarn add enzyme jest-enzyme enzyme-adapter-react-16 enzyme-to-json --dev
```

```js
// jest.config.js
module.exports = {
  //...
  setupFilesAfterEnv: ['<rootDir>/__mocks__/jestSetup.js'],
  snapshotSerializers: ['<rootDir>/node_modules/enzyme-to-json/serializer'],
};
```

```js
// __mocks__jestSetup.js
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-enzyme';

configure({ adapter: new Adapter() });
```

测试 UI 主要有两种手段：

- 快照测试 - Snapshot Testing：对 UI 渲染树做快照，测试时拿 UI 渲染树与快照比对，判断 UI 渲染是否符合预期
- DOM 测试 - DOM Testing：模拟一些事件，对渲染的 DOM 做一些操作，在查看 DOM 的变化符不符合预期

准备一个待测试的 Todos 组件：

```js
// todos/index.js
import React, { useState, useCallback, useRef } from 'react';
import './index.css';

export default function () {
  const [todos, setTodos] = useState([]);
  const inputRef = useRef(null);
  const handleKeyDown = useCallback((ev) => {
    if (ev.keyCode !== 13 || !ev.currentTarget.value) return;
    setTodos([
      ...todos,
      { id: `${Math.random()}`.slice(2), text: ev.currentTarget.value, checked: false },
    ]);
    inputRef.current.value = ''
  }, [todos, setTodos, inputRef]);
  const handleRemoveClick = useCallback((id, ev) => {
    ev.stopPropagation();
    setTodos(todos.filter((todo) => todo.id !== id));
  }, [todos, setTodos]);

  const handleToggleChecked = useCallback((id) => {
    setTodos(todos.map((todo) => todo.id === id ? { ...todo, checked: !todo.checked } : todo));
  }, [todos, setTodos]);

  return (
    <div className={'todos'}>
      <input className={'todo-input'} ref={inputRef} onKeyDown={handleKeyDown} />
      {
        todos.map(todo => (
          <div className={'todo-item'} key={todo.id} onClick={handleToggleChecked.bind(null, todo.id)}>
            <input type={'checkbox'} className={'todo-checkbox'} checked={todo.checked} />
            <span className={`todo-text ${todo.checked ? 'done' : ''}`}>{ todo.text }</span>
            <button className={'todo-remove'} onClick={handleRemoveClick.bind(null, todo.id)}>✕</button>
          </div>
        ))
      }
    </div>
  );
};
```

```css
/* todos/index.css */
.todos {
  width: 400px;
  margin: 100px auto;
  border-top: 5px solid #7f8c8d;
  font-size: 18px;
  line-height: 20px;
  box-shadow: 0px 0px 10px -2px rgba(0, 0, 0, .5);
}
.todo-input, .todo-item {
  font-size: 18px;
  line-height: 20px;
  padding: 20px;
  box-sizing: border-box;
  color: #7f8c8d;
  background: #ecf0f1;
}
.todo-input {
  width: 100%;
}
.todo-item {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  border-top: 2px dashed rgb(200,200,200);
}
.todo-checkbox {
  width: 12px;
  height: 12px;
  margin-right: 5px;
}
.todo-text {
  flex: 1;
}
.todo-text.done {
  text-decoration: line-through;
}
.todo-remove {
  display: flex;
  flex-flow: row nowrap;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
}
```

**快照测试**

使用 enzyme-to-json 库可以使 enzyme 兼容 Jest 的快照测试：

```js
import React from 'react';
import Todos from '@/todos';
import { render } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('snapshot 测试', () => {
  test('Todos 组件空数据渲染正确', () => {
    // 快照测试一般使用 render 渲染
    const wrapper = render(<Todos />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
```

**DOM 测试**

```js
import React from 'react';
import Todos from '@/todos';
import { mount } from 'enzyme';

describe('dom 测试', () => {
  test('输入内容为空、回车，不添加 todo', () => {
    const wrapper = mount(<Todos />);
    const input = wrapper.find('.todo-input');
    const todoCnt = wrapper.find('.todo-item').length;
    input.instance().value = '';
    input.simulate('keyDown', {
      keyCode: 13,
    });
    expect(wrapper.find('.todo-item')).toHaveLength(todoCnt);
  });

  test('输入内容 `hello`、回车，添加 todo', () => {
    const wrapper = mount(<Todos />);
    const input = wrapper.find('.todo-input');
    const todoCnt = wrapper.find('.todo-item').length;
    input.instance().value = 'hello';
    input.simulate('keyDown', {
      keyCode: 13,
    });
    expect(wrapper.find('.todo-item')).toHaveLength(todoCnt + 1);
    expect(wrapper.find('.todo-item').last().find('.todo-text').text()).toBe('hello');
  });

  test('点击 todo 的 checkbox，todo 文本出现删除线', () => {
    const wrapper = mount(<Todos />);
    const input = wrapper.find('.todo-input');
    input.instance().value = 'hello';
    input.simulate('keyDown', {
      keyCode: 13,
    });
    wrapper.find('.todo-item').last().simulate('click');
    expect(wrapper.find('.todo-item').last().find('.todo-checkbox')).toBeChecked();
    expect(wrapper.find('.todo-item').last().find('.todo-text')).toHaveClassName('done');
  });

  test('点击 todo 的 删除按钮，todo 删除', () => {
    const wrapper = mount(<Todos />);
    const input = wrapper.find('.todo-input');
    input.instance().value = 'hello';
    input.simulate('keyDown', {
      keyCode: 13,
    });
    const todoCnt = wrapper.find('.todo-item').length;
    wrapper.find('.todo-item').last().find('.todo-remove').simulate('click');
    expect(wrapper.find('.todo-item')).toHaveLength(todoCnt - 1);
  });
});
```

<!-- ## Jest 的覆盖率测试
```
   💻
📖 🤔 🐛
``` -->
