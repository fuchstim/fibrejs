import * as React from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { Card, Col, Divider, Form, Input, Row, Select } from 'antd';

import EditorNodeModel from './model';
import EditorPortModel from '../port/model';
import EditorPortLabel from '../port/widget';
import { Types } from '@tripwire/engine';

interface EditorNodeProps {
  node: EditorNodeModel;
  engine: DiagramEngine;
}

export default function EditorNodeWidget(props: EditorNodeProps) {
  const ruleStage = props.node.getOptions().ruleStage;

  const createPort = (port: EditorPortModel) => {
    return <EditorPortLabel engine={props.engine} port={port} key={port.getID()} />;
  };

  const createFormItem = (nodeOption: Types.Serializer.TSerializedNodeOption) => {
    const { id, type, name, dropDownOptions = [], } = nodeOption;

    const options = dropDownOptions.map(
      ({ id, name, }) => (<Select.Option key={id} value={id}>{name}</Select.Option>)
    );

    const input = {
      [Types.Node.ENodeMetadataOptionType.INPUT]: (<Input />),
      [Types.Node.ENodeMetadataOptionType.DROP_DOWN]: (<Select>{options}</Select>),
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
      >
        {ruleStage.node.options.map(option => createFormItem(option))}
      </Form>

    </div>
  );

  return (
    <Card
      title={ruleStage.node.name}
      bordered={false}
      bodyStyle={{ padding: 0, }}
    >
      <Row justify="space-between" gutter={16} style={{ padding: '6px 0', }}>
        <Col span="12">{props.node.getInputPorts().map(port => createPort(port))}</Col>
        <Col span="12">{props.node.getOutputPorts().map(port => createPort(port))}</Col>
      </Row>

      { ruleStage.node.options.length ? options : (<></>) }
    </Card>
  );
}
