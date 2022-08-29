const path = require("path");
const express = require("express");
const { default: ClickCaptcha } = require("../dist/cjs/index");
const app = express();

const session = require("express-session");
const port = 3000;

app.use(express.json());
app.use(
  session({
    secret: "i love you",
    resave: true,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

const clickCaptcha = new ClickCaptcha();

app.get("/", async (req, res) => {
  const { img, front, answer, count } = await clickCaptcha.generate();
  req.session.answer = answer;
  res.render("index", { img, front, count });
});

app.post("/check", async (req, res) => {
  const answer = req.session.answer;
  console.log("answer", answer);
  console.log("input", req.body);
  let pass = false;
  if (answer) {
    pass = clickCaptcha.check(req.body, answer);
  }
  res.send({
    pass,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
