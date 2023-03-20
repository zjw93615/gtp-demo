const { Configuration, OpenAIApi } = require('openai');


const configuration = new Configuration({
  organization: process.env.OPENAI_API_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const createCompletion = async (params) => {
  const response = await openai.createCompletion({
    model: params.model || "text-davinci-003",
    prompt: params.prompt,
    temperature: params.temperature || 0.9,
    max_tokens: params.max_tokens || 200,
    top_p: params.top_p || 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return response.data.choices[0].text
}

const createChatCompletion = async (params) => {
  const response = await openai.createChatCompletion({
    model: params.model || 'gpt-3.5-turbo',
    messages: params.messages || [],
    temperature: params.temperature || 0.9,
    max_tokens: params.max_tokens || 200,
    top_p: params.top_p || 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true
  }, { responseType: 'stream' })
  return response.data
}

const createImage = async (params) => {
  const response = await openai.createImage({
    prompt: params.prompt,
    n: 1,
    size: '512x512'
  });
  return response.data.data
}

const getListModels = async (params) => {
  const response = await openai.listModels();
  return response.data
}

module.exports = {
  createCompletion,
  createChatCompletion,
  createImage,
  getListModels
};
