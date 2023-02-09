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
      <Divider orientation='left' plain>
        Options
      </Divider>

      <Form
        size='small'
        layout='vertical'
        initialValues={ruleStage.nodeOptions ?? {}}
        style={{ paddingLeft: 24, paddingRight: 24, }}
      >
        {ruleStage.node.options.map(option => createFormItem(option))}
      </Form>

    </div>
  );

  return (
    <Card
      title={ruleStage.node.name}
      bordered={false}
      bodyStyle={{ paddingRight: 0, paddingLeft: 0, }}
    >
      <Row justify="space-between" gutter={16}>
        <Col span="12">{props.node.getInputPorts().map(port => createPort(port))}</Col>
        <Col span="12">{props.node.getOutputPorts().map(port => createPort(port))}</Col>
      </Row>

      { ruleStage.node.options.length ? options : (<></>) }
    </Card>
  );
}
