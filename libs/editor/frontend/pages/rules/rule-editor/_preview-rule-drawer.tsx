/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Button, Checkbox, Drawer, Form, Input, InputNumber, Spin, Typography, notification } from 'antd';

import client from '../../../common/client';
import { Types, WrappedTypes } from '@tripwire/engine';
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
      await client.validateRuleConfig(ruleConfig);

      const stages = await fetchStages(ruleConfig);

      const entryStage = stages.find(s => s.node.type === Types.Node.ENodeType.ENTRY);
      if (!entryStage) { return; }

      const { inputs, } = entryStage.node;
      if (inputs.some(i => i.type.isComplex)) {
        throw new Error('Previewing rules with complex inputs is not yet supported'); // TODO: support
      }

      setFormInputs(
        inputs.flatMap(input => toFormInputs(input))
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
    if (!type.isComplex) {
      return [
        {
          id,
          name,
          type: type.id as WrappedTypes.EPrimitive,
        },
      ];
    }

    return Object
      .entries(type.fields)
      .flatMap(([ key, type, ]) => toFormInputs({
        id: [ id, key, ].join('.'),
        name: [ name, camelCaseToSentenceCase(key), ].join(' → '),
        type,
      }));
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

    await client.previewRule({ config: ruleConfig, inputs, })
      .then(ruleResult => toPreviewValues(ruleResult))
      .then(previewValues => {
        onClose();
        previewRuleForm.resetFields();
        onPreviewValues(previewValues);
      })
      .catch(e => notification.error({ message: e.message, }))
      .finally(() => setLoading(false));
  };

  const getValueByKey = (outputs: Record<string, any>, key: string) => (
    key.split('.').reduce(
      (acc, keyPart) => acc[keyPart],
      outputs
    )
  );

  const toPreviewValues = async (ruleResult: Types.Common.TExecutorResult<Types.Rule.TRuleOutputs>) => {
    const stages = await fetchStages(ruleConfig);

    return stages.map(stage => {
      const inputs = stage.inputs.reduce(
        (acc, input) => ({
          ...acc,
          [input.inputId]: getValueByKey(ruleResult.outputs[input.ruleStageId].outputs, input.outputId).value,
        }),
        {}
      );

      const flattenOutputs = (prefix: string, type: Types.Serializer.TSerializedType, value: Record<string, any>) => {
        const output = getValueByKey(value, prefix);

        if (!type.isComplex) {
          return { [prefix]: output.value, };
        }

        const flattened: Record<string, any> = Object
          .entries(type.fields)
          .reduce(
            (acc, [ key, type, ]) => ({
              ...acc,
              ...flattenOutputs(`${prefix}.${key}`, type, value),
            }),
            { [prefix]: output, }
          );

        return flattened;
      };

      const outputs = stage.node.outputs.reduce(
        (acc, { id, type, }) => ({ ...acc, ...flattenOutputs(id, type, acc), }),
        ruleResult.outputs[stage.id].outputs
      );

      const executionTimeMs = ruleResult.outputs[stage.id].executionTimeMs;

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
