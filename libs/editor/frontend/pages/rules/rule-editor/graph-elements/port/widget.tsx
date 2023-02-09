import * as React from 'react';
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams';
import {
  RightCircleTwoTone,
  RightCircleFilled
} from '@ant-design/icons';

import EditorPortModel from './model';
import { Col, Row, Tag } from 'antd';

interface EditorPortLabelProps {
  port: EditorPortModel;
  engine: DiagramEngine;
}

export default function EditorPortLabel({ port, engine, }: EditorPortLabelProps) {
  const Icon = port.hasLink ? RightCircleFilled : RightCircleTwoTone;
  const iconStyle = port.isInput ? { marginRight: 5, marginLeft: -5, } : { marginRight: -5, marginLeft: 5, };

  const portWidget = (
    <PortWidget engine={engine} port={port}>
      <Icon style={iconStyle} />
    </PortWidget>
  );

  const labelWidget = (
    <Tag closable={false} style={{ margin: 0, }}>
      {port.getOptions().name}
    </Tag>
  );

  return (
    <Row justify={port.isInput ? 'start' : 'end'} wrap={false}>
      <Col>
        {port.isInput ? portWidget : labelWidget}
      </Col>

      <Col>
        {port.isInput ? labelWidget : portWidget}
      </Col>
    </Row>
  );
}
