const Koa = require("koa");
const parser = require("koa-bodyparser");
const cors = require("@koa/cors");
const router = require("./router");
const koaStatic = require("koa-static")
const path = require("path")
const fs = require("fs")

const port = 8080;

const app = new Koa()

// Resolve static file
app.use(async (ctx, next) => {
  if (ctx.path !== '/') {
    await koaStatic(path.resolve(__dirname, '../dist/'), {
      maxage: 31536000000
    })(ctx, next)
  } else {
    await next()
  }
})

// Fall back to react app
let indexBuffer
app.use(async (ctx, next) => {
  if (
    ctx.path.indexOf('/api') === 0 ||
    ctx.path.indexOf('.') > 0
  ) {
    await next()
  } else {
    if (!indexBuffer) {
      const indexPath = path.resolve(__dirname, '../dist/index.html')
      indexBuffer = fs.readFileSync(indexPath)
      console.log('indexBuffer', indexPath)
    }

    ctx.type = 'html'
    ctx.body = indexBuffer
  }
})

app.use(parser())
  .use(cors())
  .use(router.routes())
  .listen(port, () => {
    console.log(`🚀 Server listening http://127.0.0.1:${port}/ 🚀`);
  });
