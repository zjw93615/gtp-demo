const Router = require("koa-router");
const router = new Router();
const { createCompletion, createChatCompletion, getListModels, createImage } = require('./controllers/chatGPT.controllers')


router.post("/api/chatGPT/completion", createCompletion)
router.post("/api/chatGPT/chat", createChatCompletion)
router.get("/api/chatGPT/listModels", getListModels)
router.post("/api/chatGPT/createImage", createImage)



module.exports = router;
