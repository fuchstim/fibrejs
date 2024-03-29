/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Button, Checkbox, Drawer, Form, Input, InputNumber, Spin, Typography, notification } from 'antd';
import * as lodash from 'lodash';

import client from '../../../common/client';
import { Types, WrappedTypes } from '@fibrejs/engine';
import { TPreviewValues } from './_types';
import { camelCaseToSentenceCase, fetchStages } from './_common';

type Props = {
  ruleConfig?: Types.Config.TRuleConfig,
  open: boolean
  onPreviewValues: (previewValues: { stageId: string, previewValues: TPreviewValues }[]) => void;
  onClose: () => void;
};

type FormInput = {
  id: string,
  name: string,
  type: WrappedTypes.EPrimitive,
};

export default function PreviewRuleDrawer({ ruleConfig, open, onPreviewValues, onClose, }: Props) {
  const [ loading, setLoading, ] = useState(true);
  const [ formInputs, setFormInputs, ] = useState<FormInput[]>([]);
  const [ previewRuleForm, ] = Form.useForm();

  if (!ruleConfig) {
    notification.error({ message: 'No rule config found.', });

    onClose();

    return (<></>);
  }

  const fetchInputs = async () => {
    if (!open) { return; }

    setLoading(true);

    try {
      await client.validateRule(ruleConfig);

      const stages = await fetchStages(ruleConfig);

      const entryStage = stages.find(s => s.node.type === Types.Node.ENodeType.ENTRY);
      if (!entryStage) {
        return setFormInputs([]);
      }

      setFormInputs(
        entryStage.node.inputs.flatMap(input => toFormInputs(input))
      );
    } catch (error) {
      const { message, } = error as Error;

      notification.error({ message, });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const toFormInputs = ({ id, name, type, }: Types.Serializer.TSerializedNodeInputOutput): FormInput[] => {
    if (type.category === WrappedTypes.ETypeCategory.PRIMITIVE) {
      return [
        {
          id,
          name,
          type: type.id as WrappedTypes.EPrimitive,
        },
      ];
    }

    if (type.category === WrappedTypes.ETypeCategory.COLLECTION) { // TODO: Implement collection input form
      throw new Error('Previewing rules with collection type inputs is not yet supported');
    }

    if (type.category === WrappedTypes.ETypeCategory.COMPLEX) {
      if (type.id === 'DATE') {
        return [
          {
            id,
            name,
            type: WrappedTypes.EPrimitive.STRING,
          },
        ];
      }

      return Object
        .entries(type.fields)
        .flatMap(
          ([ key, type, ]) => toFormInputs({
            id: [ id, key, ].join('.'),
            name: [ name, camelCaseToSentenceCase(key), ].join(' → '),
            type,
          })
        );
    }

    return [];
  };

  const createInput = (name: string, type: WrappedTypes.EPrimitive) => {
    const input = {
      [WrappedTypes.EPrimitive.NUMBER]: {
        valuePropName: 'value',
        element: (<InputNumber placeholder={name} style={{ width: '100%', }} />),
      },
      [WrappedTypes.EPrimitive.BOOLEAN]: {
        valuePropName: 'checked',
        element: (<Checkbox style={{ width: '100%', }}>{name}</Checkbox>),
      },
      [WrappedTypes.EPrimitive.STRING]: {
        valuePropName: 'value',
        element: (<Input placeholder={name} style={{ width: '100%', }} />),
      },
    };

    return input[type];
  };

  const createFormItem = ({ id, name, type, }: FormInput) => {
    const { element, valuePropName, } = createInput(name, type);

    return (
      <Form.Item
        key={id}
        name={id}
        label={name}
        style={{ marginBottom: 6, width: '100%', }}
        valuePropName={valuePropName}
        rules={[ { required: true, message: `Please enter a value for ${name}`, }, ]}
      >
        { element }
      </Form.Item>
    );
  };

  const fetchRulePreview = async (inputs: Record<string, string | number | boolean>) => {
    setLoading(true);

    await client.previewRule({
      config: ruleConfig,
      inputs: Object
        .entries(inputs)
        .reduce(
          (acc, [ key, value, ]) => lodash.set(acc, key, value),
          {} as Record<string, any>
        ),
    })
      .then(ruleResult => toPreviewValues(ruleResult))
      .then(previewValues => {
        onClose();
        previewRuleForm.resetFields();
        onPreviewValues(previewValues);
      })
      .catch(e => notification.error({ message: e.message, }))
      .finally(() => setLoading(false));
  };

  const flattenInputOutput = (prefix: string, type: Types.Serializer.TSerializedType, values: Record<string, any>) => {
    const value = lodash.get(values, prefix);

    if (type.category === WrappedTypes.ETypeCategory.PRIMITIVE) {
      return { [prefix]: value, };
    }

    const flattened: Record<string, any> = Object
      .entries(type.fields)
      .reduce(
        (acc, [ key, type, ]) => ({
          ...acc,
          ...flattenInputOutput(`${prefix}.${key}`, type, values),
        }),
        { [prefix]: value, }
      );

    return flattened;
  };

  const toPreviewValues = async (ruleResult: Types.Common.TExecutorResult<Types.Rule.TRuleInputs, Types.Rule.TRuleOutputs>) => {
    const stages = await fetchStages(ruleConfig);

    return stages.map(stage => {
      const inputs = stage.node.inputs.reduce(
        (acc, { id, type, }) => ({ ...acc, ...flattenInputOutput(id, type, acc), }),
        ruleResult.outputs.stageResults[stage.id].inputs
      );

      const outputs = stage.node.outputs.reduce(
        (acc, { id, type, }) => ({ ...acc, ...flattenInputOutput(id, type, acc), }),
        ruleResult.outputs.stageResults[stage.id].outputs
      );

      const executionTimeMs = ruleResult.outputs.stageResults[stage.id].executionTimeMs;

      return { stageId: stage.id, previewValues: { inputs, outputs, executionTimeMs, }, };
    });
  };

  return (
    <Drawer
      title="Preview Rule"
      placement="right"
      closable={true}
      onClose={onClose}
      afterOpenChange={() => fetchInputs()}
      open={open}
    >
      <Spin spinning={loading}>
        <Typography.Title level={3} style={{ marginTop: 0, }}>
          Rule Inputs
        </Typography.Title>

        <Form
          form={previewRuleForm}
          onFinish={fetchRulePreview}
          layout="vertical"
        >
          { formInputs.map(createFormItem) }

          <Form.Item style={{ marginTop: '16px', }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Drawer>
  );
}
