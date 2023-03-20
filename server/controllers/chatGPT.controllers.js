const { createCompletion: createCompletionHelper, createChatCompletion: createChatCompletionHelper, getListModels: getListModelsHelper, createImage: createImageHelper } = require('../helpers/chatGPT.helpers');
const ErrorShowType = {
  SILENT: 0,
  WARN_MESSAGE: 1,
  ERROR_MESSAGE: 2,
  NOTIFICATION: 3,
  REDIRECT: 9,
}

const createCompletion = async (ctx) => {
  try {
    ctx.body = {
      success: true,
      data: await createCompletionHelper(ctx.request.body)
    }
    ctx.status = 200;
  } catch (err) {
    console.log(err);
    ctx.body = {
      success: false,
      data: null,
      errorCode: 500,
      errorMessage: err,
      showType: ErrorShowType.ERROR_MESSAGE,
    };
    ctx.status = 500;
  }
};

const createChatCompletion = async (ctx) => {
  try {
    ctx.body = await createChatCompletionHelper(ctx.request.body)
    ctx.status = 200;
  } catch (err) {
    console.log(err);
    ctx.body = {
      success: false,
      data: null,
      errorCode: 500,
      errorMessage: err,
      showType: ErrorShowType.ERROR_MESSAGE,
    };
    ctx.status = 500;
  }
};


const createImage = async (ctx) => {
  try {
    ctx.body = {
      success: true,
      data: await createImageHelper(ctx.request.body)
    }
    ctx.status = 200;
  } catch (err) {
    console.log(err);
    ctx.body = {
      success: false,
      data: null,
      errorCode: 500,
      errorMessage: err,
      showType: ErrorShowType.ERROR_MESSAGE,
    };
    ctx.status = 500;
  }
};

const getListModels = async (ctx) => {
  try {
    ctx.body = {
      success: true,
      data: await getListModelsHelper()
    }
    ctx.status = 200;
  } catch (err) {
    console.log(err);
    ctx.body = {
      success: false,
      data: null,
      errorCode: 500,
      errorMessage: err,
      showType: ErrorShowType.ERROR_MESSAGE,
    };
    ctx.status = 500;
  }
};

module.exports = {
  createCompletion,
  createChatCompletion,
  createImage,
  getListModels
};
