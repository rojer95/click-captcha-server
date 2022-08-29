# click-captcha-server

[![NPM version](https://img.shields.io/npm/v/click-captcha-server.svg?style=flat)](https://npmjs.org/package/click-captcha-server)
[![NPM downloads](http://img.shields.io/npm/dm/click-captcha-server.svg?style=flat)](https://npmjs.org/package/click-captcha-server)

## Install

```bash
$ yarn add click-captcha-server
```

## Quickstart

```ts
import ClickCaptcha from "click-captcha-server";

const clickCaptcha = new ClickCaptcha();
const { img, front, answer, count } = await this.clickCaptcha.generate();
const input = ctx.body; // input 来自用户点选坐标
const pass = this.clickCaptcha.check(input, answer);
console.log(pass ? '验证成功': '验证失败')
```

## LICENSE

MIT
