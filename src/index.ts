import * as fs from "fs";
import * as path from "path";
import { createCanvas, loadImage, registerFont } from "canvas";

import shuffle = require("lodash.shuffle");

interface ClickCaptchaConfig {
  bg?: (width?: number, height?: number) => string;
  character?: string[];
  familys?: string[];
  width?: number;
  height?: number;
  fontMaxSize?: number;
  fontMinSize?: number;
  count?: number;
  confuseCount?: number;
}

interface ClickCaptchaPoint {
  x: number;
  y: number;
}

interface ClickCaptchaArea {
  txt: string;
  xLeftTop: number;
  yLeftTop: number;
  xRightBottom: number;
  yRightBottom: number;
}

interface ClickCaptchaResult {
  img: string;
  front: string[];
  count: number;
  answer: ClickCaptchaArea[];
}

class ClickCaptchaError extends Error {}

export const DEFAULT_CHARACTER = fs
  .readFileSync(path.resolve(__dirname, "./character.txt"), "utf-8")
  .split(",")
  .map((i) => i.trim())
  .filter((i) => !!i);

class ClickCaptcha {
  config: ClickCaptchaConfig = {
    character: DEFAULT_CHARACTER,
    bg: undefined,
    familys: ["sans-serif"],
    width: 300,
    height: 200,
    fontMinSize: 26,
    fontMaxSize: 34,
    count: 3,
    confuseCount: 2,
  };

  constructor(customConfig?: ClickCaptchaConfig) {
    this.config = Object.assign(this.config, customConfig || {});
  }

  /**
   * register font by font path
   * @param fontPath
   */
  registerFontByPath = (fontPath: string) => {
    const familys = [];
    const files = fs.readdirSync(fontPath);
    for (const file of files) {
      if (file.endsWith(".ttf")) {
        const family = file.slice(0, file.lastIndexOf(".")).toLowerCase();
        registerFont(path.join(fontPath, file), {
          family: family,
        });
        familys.push(family);
      }
    }
    this.config.familys?.push(...familys);
  };

  /**
   * random number from x to y
   * @param from
   * @param to
   * @returns
   */
  random(from: number, to: number) {
    return Math.floor(Math.random() * (to - from)) + from;
  }

  /**
   * random rgba color
   * @returns
   */
  getRandomColor() {
    const rgba = {
      r: this.random(0, 255),
      g: this.random(0, 255),
      b: this.random(0, 255),
      a: this.random(70, 100),
    };
    return `rgba(${rgba.r},${rgba.g},${rgba.b},${(rgba.a / 100).toFixed(2)})`;
  }

  /**
   * randon font family
   * @returns
   */
  getRandomFamily() {
    return (
      this.config.familys?.[this.random(0, this.config.familys?.length)] ??
      "sans-serif"
    ).toLowerCase();
  }

  /**
   * get bg
   * @param width
   * @param height
   * @returns
   */
  async getBg(width: number, height: number) {
    if (!this.config.bg) throw new Error("place set bg option");
    return await this.config.bg(width, height);
  }

  /**
   * get font max size
   * @returns
   */
  getFontMaxSize() {
    return this.config.fontMaxSize ?? 34;
  }

  /**
   * get font min size
   * @returns
   */
  getFontMinSize() {
    return this.config.fontMinSize ?? 26;
  }

  /**
   * get font random size
   * @returns
   */
  getRandomFontSize() {
    return this.random(this.getFontMinSize(), this.getFontMaxSize());
  }

  /**
   * generate a captcha
   * @returns
   */
  async generate(): Promise<ClickCaptchaResult> {
    if (this.config.character?.length === 0)
      throw new ClickCaptchaError("character empty");

    const width = this.config.width ?? 300;
    const height = this.config.height ?? 200;
    const count = this.config.count ?? 3;
    const confuseCount = this.config.confuseCount ?? 1;

    if (
      width < this.getFontMaxSize() * (count + confuseCount) ||
      height < this.getFontMaxSize() * (count + confuseCount)
    )
      throw new ClickCaptchaError("size too small");

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const img = await loadImage(await this.getBg(width, height));

    ctx.drawImage(img, 0, 0, width, height);

    let elements = [];
    const character = this.config.character ?? ["缺", "少", "字", "符", "集"];
    for (let index = 0; index < count + confuseCount; index++) {
      elements.push(character[this.random(1, character.length)]);
    }

    const front = [...elements];

    for (let index = 0; index < confuseCount; index++) {
      front.splice(this.random(0, front.length), 1);
    }

    elements = shuffle(elements);

    const per = (width - this.getFontMaxSize()) / (count + confuseCount);
    const areas: ClickCaptchaArea[] = [];

    for (let index = 0; index < elements.length; index++) {
      const isFirst = index === 0;
      const isLast = index === elements.length - 1;
      const txt = elements[index];
      const color = this.getRandomColor();
      const family = this.getRandomFamily();

      const size = this.getRandomFontSize();
      const r = this.random(isLast ? 0 : -45, isFirst ? 0 : 45);

      const radian = ((2 * Math.PI) / 360) * Math.abs(r);
      const offsetX = Math.sin(radian) * size;
      const offsetY = Math.cos(radian) * size;

      const rotate = (r * Math.PI) / 180;
      const x = this.random(per * index, per * (index + 1));
      const y = this.random(size, height - size);

      if (front.includes(txt)) {
        areas.push({
          txt,
          xLeftTop: r < 0 ? x : x - offsetX,
          yLeftTop: r < 0 ? y - offsetX : y,
          xRightBottom: r < 0 ? x + offsetX + offsetY : x + offsetY,
          yRightBottom: r < 0 ? y + offsetY : y + offsetX + offsetY,
        });
      }

      ctx.translate(x, y);
      ctx.rotate(rotate);
      ctx.font = `bold ${size}px ${family}`;
      ctx.fillStyle = color;
      ctx.fillText(txt, 0, size);
      ctx.rotate(-rotate);
      ctx.translate(-x, -y);
    }

    const answer: ClickCaptchaArea[] = [];

    for (const frontItem of front) {
      const area = areas.find((i) => i.txt === frontItem);
      if (area) {
        answer.push(area);
      } else {
        throw new ClickCaptchaError("miss area");
      }
    }

    return {
      img: canvas.toDataURL(),
      front,
      answer,
      count,
    };
  }

  /**
   * check input is in answer area
   * @param input
   * @param answer
   * @returns
   */
  check(input: ClickCaptchaPoint[], answer: ClickCaptchaArea[]): boolean {
    if (
      !Array.isArray(answer) ||
      !Array.isArray(input) ||
      input.length !== answer.length
    ) {
      return false;
    }

    for (let index = 0; index < answer.length; index++) {
      const answerItem = answer[index];
      const inputItem = input[index];
      if (
        inputItem.x < answerItem.xLeftTop ||
        inputItem.x > answerItem.xRightBottom ||
        inputItem.y < answerItem.yLeftTop ||
        inputItem.y > answerItem.yRightBottom
      ) {
        return false;
      }
    }
    return true;
  }
}

export default ClickCaptcha;
