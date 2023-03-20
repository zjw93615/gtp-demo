import React, { useState } from 'react';
import { Button, Empty, Input, Spin, Tabs, TabsProps } from 'antd';
import _ from 'lodash';
import './index.less'
import { useRequest } from 'ahooks';
import { createImage, createCompletion } from '../services/chatGPT';
import { LoadingOutlined } from '@ant-design/icons';
import ConfigDrawer, { ChatGPTConfig } from './components/ConfigDrawer';
import { marked } from 'marked';

interface ChatGPTText {
  content: string,
  role: 'user' | 'assistant',
  loading?: boolean,
}

const defaultConfig: ChatGPTConfig = {
  model: "gpt-3.5-turbo",
  temperature: 0.9,
  max_tokens: 512,
  top_p: 1,
}

const ChatGPT: React.FC = () => {
  const [textList, setTextList] = useState<ChatGPTText[]>([])
  const [inputText, setInputText] = useState<string>('')
  const [config, setConfig] = useState<ChatGPTConfig>(defaultConfig)
  const [openDrawer, setOpenDrawer] = useState<boolean>(false)
  const [type, setType] = useState<'completion' | 'chat' | 'image'>('chat')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageLoading, setImageLoading] = useState<boolean>(false)
  const [chatLoading, setChatLoading] = useState<boolean>(false)

  const { loading: completionLoading, runAsync: sendCompletion } = useRequest(
    () => createCompletion({
      data: {
        prompt: textList.map(i => i.content).join('\n\n') + `\n\n${inputText}`,
        ...config
      }}),
    {
      manual: true
    });

  const { runAsync: getImage } = useRequest(
    () => createImage({
      data: {
        prompt: inputText
      }}),
    {
      manual: true
    });

  const onTextAreaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputText(e.target.value)
  }

  const onSubmitClick = async () => {
    if(type === 'completion') {
      if(!completionLoading) {
        setInputText('')
        const newList = _.cloneDeep(textList)
        if(inputText) {
          newList.push({
            content: inputText,
            role: 'user'
          })
        }
        newList.push({
          content: '',
          role: 'assistant',
          loading: true,
        })
        setTextList(newList)

        setTimeout(() => {
          let scroll_to_bottom = document.getElementById('chat_gpt_text_list');
          scroll_to_bottom?.scroll({top: scroll_to_bottom.scrollHeight, behavior: "smooth"})
        }, 50)

        sendCompletion().then(res => {
          console.log('res', res)
          const resList = _.cloneDeep(newList)
          resList[resList.length - 1] = {
            // @ts-ignore
            content: res || '',
            role: 'assistant'
          }
          setTextList(resList)
          setTimeout(() => {
            let scroll_to_bottom = document.getElementById('chat_gpt_text_list');
            scroll_to_bottom?.scroll({top: scroll_to_bottom.scrollHeight, behavior: "smooth"})
          }, 50)
        })
      }
    }
    else if(type === 'chat') {
      if(!chatLoading) {
        setInputText('')
        const newList = _.cloneDeep(textList)
        if(inputText) {
          newList.push({
            content: inputText,
            role: 'user'
          })
        }


        setTimeout(() => {
          let scroll_to_bottom = document.getElementById('chat_gpt_text_list');
          scroll_to_bottom?.scroll({top: scroll_to_bottom.scrollHeight, behavior: "smooth"})
        }, 50)

        const messages = _.cloneDeep(newList);
        newList.push({
          content: '',
          role: 'assistant',
          loading: true,
        })
        setTextList(newList)
        setChatLoading(true)
        const response = await fetch('http://localhost:8080/api/chatGPT/chat', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages,
            ...config,
          }),
        })

        // Create a reader for the response body
        const reader = response?.body?.getReader();
        // Create a decoder for UTF-8 encoded text
        const decoder = new TextDecoder("utf-8");
        let result = ''
        const readChunk = async () => {
          return reader?.read().then(({ value, done }) => {
            if (!done) {
              const dataString = decoder.decode(value);
              console.log(dataString)
              dataString.toString().trim().split("data: ").forEach(async (line) => {
                if (line !== '') {
                  const text = line.replace("data: ", "")
                  try {
                    // Parse the chunk as a JSON object
                    const data = JSON.parse(text)
                    console.log(data.choices[0])
                    if (data.choices[0].delta.content) {
                      result += data.choices[0].delta.content
                      const resList = _.cloneDeep(newList)
                      resList[resList.length - 1] = {
                        content: marked.parse(result),
                        role: 'assistant'
                      }
                      setTextList(resList)
                    }
                    if (data.choices[0].finish_reason === 'length') {
                      console.log('token 不足，请再次提交')
                      setChatLoading(false)
                    } else if (data.choices[0].finish_reason === 'stop') {
                      const resList = _.cloneDeep(newList)
                      resList[resList.length - 1] = {
                        content: marked.parse(result),
                        role: 'assistant'
                      }
                      setTextList(resList)
                      setChatLoading(false)
                      return
                    }
                    return readChunk();
                  } catch (error) {
                    // End the stream but do not send the error, as this is likely the DONE message from createCompletion
                    console.error(error)
                    console.log(text)
                    if (text.trim() === '[DONE]') {
                      const resList = _.cloneDeep(newList)
                      resList[resList.length - 1] = {
                        content: marked.parse(result),
                        role: 'assistant'
                      }
                      setTextList(resList)
                      return
                    }
                    setChatLoading(false)
                  }
                }
                setTimeout(() => {
                  let scroll_to_bottom = document.getElementById('chat_gpt_text_list');
                  scroll_to_bottom?.scroll({top: scroll_to_bottom.scrollHeight, behavior: "smooth"})
                }, 50)
              })
            } else {
              console.log("done");
            }
          });
        };

        await readChunk();
      }
      // sendChat
    }
    else {
      if(!imageLoading) {
        setImageLoading(true)
        getImage().then(res => {
          setImageUrl(_.get(res, '0.url', ''))
        })
      }
    }
  }

  const items: TabsProps['items'] = [
    {
      key: 'chat',
      label: `GPT3.5聊天`,
    },
    {
      key: 'completion',
      label: `文字生成`,
    },
    {
      key: 'image',
      label: '图片生成'
    }
  ]

  const onTabsChange = (key: string) => {
    if(key === 'completion') {
      const chatDefaultConfig = _.cloneDeep(defaultConfig)
      chatDefaultConfig.model = 'text-davinci-003'
      setConfig(chatDefaultConfig)
    }else if(key === 'chat') {
      const chatDefaultConfig = _.cloneDeep(defaultConfig)
      chatDefaultConfig.model = 'gpt-3.5-turbo'
      setConfig(chatDefaultConfig)
    }

    setType(key as 'image' | 'completion' | 'chat')
    setOpenDrawer(false)
    setTextList([])
  };

  const onImageLoad = () => {
    setImageLoading(false)
  }

  return (
    <div className={'chat_gpt_container'}>
      <Tabs
        activeKey={type}
        items={items}
        onChange={onTabsChange}
      />
      <div className={'chat_gpt'}>
        {
          ['completion', 'chat'].includes(type) ? (
            <div className={'chat_gpt_text_list'} id={'chat_gpt_text_list'}>
              {
                textList.map((data, index) => {
                  return (
                    <div key={index} className={'text_list_row'}>
                      {
                        data.loading ? (
                          <div className={'bot_text'} style={{width: 120, display: 'flex', justifyContent: 'center'}}>
                            <LoadingOutlined />
                          </div>
                        ) : type === 'completion' ? (
                          <div className={data.role === 'user' ? 'user_text' : 'bot_text'}>
                            {data.content || '-'}
                          </div>
                        ) : (
                          <div className={data.role === 'user' ? 'user_text' : 'bot_text'} dangerouslySetInnerHTML={{__html: data.content || '-'}}>
                          </div>
                        )
                      }
                    </div>
                  )
                })
              }
            </div>
          ) : (
            <div className={'chat_gpt_image_box'}>
              <Spin spinning={imageLoading}>
                <div className={'chat_gpt_image_box_inner'}>
                  {
                    imageUrl ? (
                      <img src={imageUrl} onLoad={onImageLoad}/>
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={'请输入描述'}
                      />
                    )
                  }
                </div>
              </Spin>
            </div>
          )
        }
        <div className={'chat_gpt_input_text'}>
          <Input.TextArea
            value={inputText}
            onChange={onTextAreaChange}
            disabled={type === 'completion' ? completionLoading : type === 'chat' ? chatLoading : imageLoading}
            placeholder={'请输入描述'}
          />
          <Button type={'primary'} disabled={type === 'completion' ? completionLoading : type === 'chat' ? chatLoading : imageLoading} onClick={onSubmitClick} style={{marginLeft: 12}}>
            提交
          </Button>
          {
            ['completion', 'chat'].includes(type) ? (
              <Button disabled={type === 'completion' ? completionLoading : chatLoading} onClick={() => setOpenDrawer(true)} style={{marginLeft: 12}}>
                调整参数
              </Button>
            ) : null
          }
        </div>
        <ConfigDrawer
          open={openDrawer}
          type={type}
          setOpen={setOpenDrawer}
          value={config}
          onChange={value => {
            setConfig({
              ...defaultConfig,
              ...value,
            })
          }}
        />
      </div>
    </div>
  )
}

export default ChatGPT
