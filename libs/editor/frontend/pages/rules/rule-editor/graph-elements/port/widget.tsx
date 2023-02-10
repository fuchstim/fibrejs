import * as React from 'react';
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams';
import {
  RightCircleTwoTone,
  RightCircleFilled,
  CaretDownOutlined
} from '@ant-design/icons';

import EditorPortModel from './model';
import { Col, Row, Tag, Tooltip } from 'antd';

interface EditorPortWidgetProps {
  port: EditorPortModel;
  engine: DiagramEngine;
  hideIfUnlinked: boolean;
  onClick?: () => void;
}

export default function EditorPortWidget({ port, engine, hideIfUnlinked, onClick, }: EditorPortWidgetProps) {
  const Icon = port.hasLink ? RightCircleFilled : RightCircleTwoTone;
  const iconStyle = port.isInput ? { marginRight: 5, marginLeft: -5, } : { marginRight: -5, marginLeft: 5, };

  const {
    name,
    config: { type, },
  } = port.getOptions();

  const portWidget = (
    <PortWidget engine={engine} port={port}>
      <Icon style={iconStyle} />
    </PortWidget>
  );

  const labelWidget = (
    <Tooltip
      placement={port.isInput ? 'right' : 'left'}
      title={type.name}
    >
      <Tag
        closable={false}
        style={{ margin: 0, }}
        icon={type.isComplex ? <CaretDownOutlined /> : null}
        onClick={() => onClick?.()}
      >
        {name}
      </Tag>
    </Tooltip>
  );

  const hidden = hideIfUnlinked && !port.hasLink;

  return (
    <Row
      justify={port.isInput ? 'start' : 'end'}
      wrap={false}
      style={{ margin: '10px 0', display: hidden ? 'none' : undefined, }}
    >
      <Col>
        {port.isInput ? portWidget : labelWidget}
      </Col>

      <Col>
        {port.isInput ? labelWidget : portWidget}
      </Col>
    </Row>
  );
}
