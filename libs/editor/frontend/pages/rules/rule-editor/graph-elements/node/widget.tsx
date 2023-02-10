import * as React from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { Card, Checkbox, Col, Divider, Form, Input, InputNumber, Row, Select, theme } from 'antd';

import EditorNodeModel from './model';
import EditorPortModel from '../port/model';
import EditorPortLabel from '../port/widget';
import { Types, WrappedTypes } from '@tripwire/engine';

interface EditorNodeProps {
  node: EditorNodeModel;
  engine: DiagramEngine;
}

export default function EditorNodeWidget(props: EditorNodeProps) {
  const ruleStage = props.node.getOptions().ruleStage;
  const onOptionsChange = props.node.getOptions().onOptionsChange;
  const isSelected = props.node.isSelected();

  const {
    token: { colorPrimary, },
  } = theme.useToken();

  const createPort = (port: EditorPortModel) => {
    return <EditorPortLabel engine={props.engine} port={port} key={port.getID()} />;
  };

  const createInput = (name: string, inputOptions?: Types.Node.TNodeMetadataInputOptions) => {
    const type = inputOptions?.type ?? WrappedTypes.EPrimitive.STRING;

    switch (type) {
      case WrappedTypes.EPrimitive.NUMBER:
        return (<InputNumber placeholder={name} />);
      case WrappedTypes.EPrimitive.BOOLEAN:
        return (<Checkbox>{name}</Checkbox>);
      case WrappedTypes.EPrimitive.STRING:
      default:
        return (<Input placeholder={name} />);
    }
  };

  const createDropDownInput = (name: string, dropDownOptions: Types.Node.TNodeMetadataDropDownOption[] = []) => {
    const options = dropDownOptions.map(
      ({ id, name, }) => (<Select.Option key={id} value={id}>{name}</Select.Option>)
    );

    return (<Select placeholder={name}>{options}</Select>);
  };

  const createFormItem = (nodeOption: Types.Serializer.TSerializedNodeOption) => {
    const { id, type, name, dropDownOptions, inputOptions, } = nodeOption;

    const input = {
      [Types.Node.ENodeMetadataOptionType.INPUT]: createInput(name, inputOptions),
      [Types.Node.ENodeMetadataOptionType.DROP_DOWN]: createDropDownInput(name, dropDownOptions),
    }[type];

    if (!input) { return; }

    return (
      <Form.Item
        key={id}
        name={id}
        style={{ marginBottom: 6, }}
      >
        { input }
      </Form.Item>
    );
  };

  const options = (
    <div>
      <Divider orientation='left' plain style={{ marginTop: 0, }}>
        Options
      </Divider>

      <Form
        size='small'
        layout='vertical'
        initialValues={ruleStage.nodeOptions ?? {}}
        style={{ padding: '0 24px 24px 24px', }}
        onValuesChange={(_, updatedValues) => onOptionsChange?.(updatedValues)}
      >
        {ruleStage.node.options.map(option => createFormItem(option))}
      </Form>

    </div>
  );

  const activeShadow = `${colorPrimary} 0px 0px 4px`;

  return (
    <Card
      title={ruleStage.node.name}
      bordered={false}
      bodyStyle={{ padding: 0, }}
      hoverable={true}
      style={isSelected ? { boxShadow: activeShadow, } : {}}
    >
      <Row justify="space-between" gutter={16} style={{ padding: '6px 0', }}>
        <Col span="12">{props.node.getInputPorts().map(port => createPort(port))}</Col>
        <Col span="12">{props.node.getOutputPorts().map(port => createPort(port))}</Col>
      </Row>

      { ruleStage.node.options.length ? options : (<></>) }
    </Card>
  );
}
