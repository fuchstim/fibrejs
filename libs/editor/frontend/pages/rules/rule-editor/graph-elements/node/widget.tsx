import * as React from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { Card, Col, Collapse, Input, Row, Select } from 'antd';

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

  const generatePort = (port: EditorPortModel) => {
    return <EditorPortLabel engine={props.engine} port={port} key={port.getID()} />;
  };

  const generateInputOption = ({ id, name, }: Types.Serializer.TSerializedNodeOption) => {
    const value = ruleStage.nodeOptions?.[id];

    return (
      <Input
        key={id}
        placeholder={name}
        size="small"
        value={String(value)}
      />
    );
  };

  const generateDropDownOption = ({ id, name, dropDownOptions = [], }: Types.Serializer.TSerializedNodeOption) => {
    const options = dropDownOptions.map(
      ({ id, name, }) => (<Select.Option key={id} value={id}>{name}</Select.Option>)
    );

    const value = ruleStage.nodeOptions?.[id];

    return (
      <Select
        key={id}
        size='small'
        placeholder={name}
        style={{ width: '100%', }}
        value={value}
      >
        {options}
      </Select>
    );
  };

  const generateOption = (nodeOption: Types.Serializer.TSerializedNodeOption) => {
    const { type, } = nodeOption;

    const createElement = {
      [Types.Node.ENodeMetadataOptionType.INPUT]: generateInputOption,
      [Types.Node.ENodeMetadataOptionType.DROP_DOWN]: generateDropDownOption,
    }[type];

    return createElement?.(nodeOption);
  };

  const options = (
    <Collapse size="small">
      <Collapse.Panel header="Options" key="options" style={{ minWidth: '150px', }}>
        {ruleStage.node.options.map(option => generateOption(option))}
      </Collapse.Panel>
    </Collapse>
  );

  return (
    <Card
      title={ruleStage.node.name}
      bordered={false}
      bodyStyle={{ paddingRight: 0, paddingLeft: 0, }}
    >
      <Row justify="space-between" gutter={16}>
        <Col span="12">{props.node.getInputPorts().map(port => generatePort(port))}</Col>
        <Col span="12">{props.node.getOutputPorts().map(port => generatePort(port))}</Col>
      </Row>

      { ruleStage.node.options.length ? options : (<></>) }
    </Card>
  );
}
