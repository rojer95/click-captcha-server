# click-captcha-server

[![NPM version](https://img.shields.io/npm/v/click-captcha-server.svg?style=flat)](https://npmjs.org/package/click-captcha-server)
[![NPM downloads](http://img.shields.io/npm/dm/click-captcha-server.svg?style=flat)](https://npmjs.org/package/click-captcha-server)

## 安装 / Install

```bash
$ yarn add click-captcha-server
```

## 快速开始 / Quickstart

```ts
import ClickCaptcha from "click-captcha-server";

const clickCaptcha = new ClickCaptcha();

// 生成验证码图片与答案区域
const { img, front, answer, count } = await clickCaptcha.generate();

// 验证点选位置
const input = ctx.body; // input 来自用户点选的坐标集合
const pass = clickCaptcha.check(input, answer);

console.log(pass ? '验证成功': '验证失败');
```

## 参数 / Options


关于 `ClickCaptcha` 的参数说明如下：

```ts
// 需要在全局初始化保持单例
const clickCaptcha = new ClickCaptcha({
    bg: (width, height)=> 'http://xxx.xxx.xx/bg.png', // 返回一个背景图片的 url 【可选】
    character: ['你','我','他','等'], // 显示的字符集合，是一个字符数组预设 【可选】
    width: 300, // 宽 【可选】
    height: 200, // 高 【可选】
    fontMinSize: 26, // 字体大小-最小值 【可选】
    fontMaxSize: 34, // 字体大小-最大值 【可选】
    count: 3, // 正确答案数量 【可选】
    confuseCount: 2, // 迷惑项数量 【可选】
});

// 导入字体（路径），一样在全局执行一次即可。会扫描路径下的所有ttf格式的字体，且以字体文件名作为font family导入到node-canvas
clickCaptcha.registerFontByPath(path.join(__dirname, "./fonts"));
```

## 案例 / Example

```bash
git clone https://github.com/rojer95/click-captcha-server.git

cd click-captcha-server
# 安装依赖
yarn install
# 构建
yarn build
# 运行example
yarn example

# 打开 http://localhost:3000/ 体验
```

## node-canvas 依赖说明 / About Canvas Dependence

By default, binaries for macOS, Linux and Windows will be downloaded. If you want to build from source, use `npm install --build-from-source` and see the **Compiling** section below.

The minimum version of Node.js required is **6.0.0**.

### Compiling

If you don't have a supported OS or processor architecture, or you use `--build-from-source`, the module will be compiled on your system. This requires several dependencies, including Cairo and Pango.

For detailed installation information, see the [wiki](https://github.com/Automattic/node-canvas/wiki/_pages). One-line installation instructions for common OSes are below. Note that libgif/giflib, librsvg and libjpeg are optional and only required if you need GIF, SVG and JPEG support, respectively. Cairo v1.10.0 or later is required.

OS | Command
----- | -----
OS X | Using [Homebrew](https://brew.sh/):<br/>`brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman`
Ubuntu | `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`
Fedora | `sudo yum install gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel`
Solaris | `pkgin install cairo pango pkg-config xproto renderproto kbproto xextproto`
OpenBSD | `doas pkg_add cairo pango png jpeg giflib`
Windows | See the [wiki](https://github.com/Automattic/node-canvas/wiki/Installation:-Windows)
Others | See the [wiki](https://github.com/Automattic/node-canvas/wiki)

**Mac OS X v10.11+:** If you have recently updated to Mac OS X v10.11+ and are experiencing trouble when compiling, run the following command: `xcode-select --install`. Read more about the problem [on Stack Overflow](http://stackoverflow.com/a/32929012/148072).
If you have xcode 10.0 or higher installed, in order to build from source you need NPM 6.4.1 or higher.


## LICENSE

MIT
