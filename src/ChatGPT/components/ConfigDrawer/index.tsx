import React, { useEffect } from 'react';
import { Button, Drawer, Form, Select, Space } from 'antd';
import NumberSlider from '../../../components/NumberSlider';


export interface ChatGPTConfig {
  model: string,
  temperature: number,
  max_tokens: number,
  top_p: number,
}

interface ConfigDrawerProps {
  open: boolean,
  setOpen: (value: boolean) => void,
  value: ChatGPTConfig,
  onChange: (value: ChatGPTConfig) => void,
  type: 'completion' | 'chat' | 'image',
}

const defaultCompletionModalList = [{
  value: 'text-davinci-003',
  label: 'text-davinci-003'
}, {
  value: 'text-curie-001',
  label: 'text-curie-001'
}, {
  value: 'text-babbage-001',
  label: 'text-babbage-001'
}, {
  value: 'text-ada-001',
  label: 'text-ada-001'
}]

const defaultChatModalList = [{
  value: 'gpt-3.5-turbo',
  label: 'gpt-3.5-turbo'
}, {
  value: 'gpt-3.5-turbo-0301',
  label: 'gpt-3.5-turbo-0301'
}]


const ConfigDrawer: React.FC<ConfigDrawerProps> = (props) => {

  const [form] = Form.useForm()

  useEffect(() => {
    if(props.open) {
      form.setFieldsValue(props.value)
    }
  }, [props.open])


  const onSubmitClick = () => {
    props.setOpen(true);
  };

  const onCloseClick = () => {
    const value = form.getFieldsValue()
    props.onChange(value);
    props.setOpen(false);

  };

  return (
    <Drawer
      title="调整参数"
      width={720}
      onClose={onCloseClick}
      open={props.open}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <Space>
          <Button onClick={onCloseClick}>取消</Button>
          <Button onClick={onSubmitClick} type="primary">
            更新
          </Button>
        </Space>
      }
      // destroyOnClose={true}
    >
      <Form
        layout="vertical"
        initialValues={props.value}
        form={form}
      >
        <Form.Item
          name="model"
          label="模型"
        >
          <Select
            defaultValue="lucy"
            options={props.type === 'completion' ? defaultCompletionModalList : defaultChatModalList}
          />
        </Form.Item>
        <Form.Item
          name="temperature"
          label="随机度(temperature)"
        >
          <NumberSlider
            min={0}
            max={1}
            step={0.01}
          />
        </Form.Item>
        <Form.Item
          name="max_tokens"
          label="字数(max_tokens)"
        >
          <NumberSlider
            min={0}
            max={2000}
            step={1}
          />
        </Form.Item>
        <Form.Item
          name="top_p"
          label="确切度(top_p)"
        >
          <NumberSlider
            min={0}
            max={1}
            step={0.01}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default ConfigDrawer;
