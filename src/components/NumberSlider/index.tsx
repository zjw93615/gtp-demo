import React, { useState } from 'react';
import { Col, InputNumber, Row, Slider } from 'antd';

interface IntegerStepParams {
  value?: number,
  onChange?: (value: number) => void,
  max?: number,
  min?: number,
  step?: number,
}

const NumberSlider: React.FC<IntegerStepParams> = (params) => {
  const onChange = (newValue: number | null) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    params?.onChange && params?.onChange(newValue || 0);
  };

  return (
    <Row>
      <Col span={20}>
        <Slider
          min={params.min}
          max={params.max}
          step={params.step}
          onChange={onChange}
          value={typeof params.value === 'number' ? params.value : 0}
        />
      </Col>
      <Col span={4}>
        <InputNumber
          min={params.min}
          max={params.max}
          step={params.step}
          style={{ margin: '0 16px' }}
          value={params.value}
          onChange={onChange}
        />
      </Col>
    </Row>
  );
};

NumberSlider.defaultProps = {
  max: 100,
  min: 0,
  step: 1
}

export default NumberSlider
