import * as React from 'react';
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams';
import {
  RightCircleTwoTone,
  RightCircleFilled,
  CaretDownOutlined
} from '@ant-design/icons';

import EditorPortModel from './model';
import { Row, Tag, Tooltip, Typography } from 'antd';

interface EditorPortWidgetProps {
  port: EditorPortModel;
  engine: DiagramEngine;
  hideIfUnlinked: boolean;
  previewValue?: unknown;
  onClick?: () => void;
}

export default function EditorPortWidget({ port, engine, hideIfUnlinked, onClick, previewValue, }: EditorPortWidgetProps) {
  const Icon = port.hasLink ? RightCircleFilled : RightCircleTwoTone;
  const iconStyle = port.isInput ? { marginRight: 5, marginLeft: -5, } : { marginRight: -5, marginLeft: 5, };

  const {
    config: { name, type, },
  } = port.getOptions();

  const formattedPreviewValue = type.isComplex ? `{${type.name}}` : String(previewValue);

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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: port.isInput ? 'flex-start' : 'flex-end', }}>
        <Tag
          closable={false}
          style={{ margin: 0, }}
          icon={type.isComplex ? <CaretDownOutlined /> : null}
          onClick={() => onClick?.()}
        >
          {name}
        </Tag>
        {previewValue != null ? (<Typography.Text type="secondary" code>{ formattedPreviewValue }</Typography.Text>) : <></> }
      </div>
    </Tooltip>
  );

  const hidden = hideIfUnlinked && !port.hasLink;

  return (
    <Row
      justify={port.isInput ? 'start' : 'end'}
      wrap={false}
      style={{ margin: '10px 0', display: hidden ? 'none' : undefined, }}
    >
      <div>
        {port.isInput ? portWidget : labelWidget}
      </div>

      <div>
        {port.isInput ? labelWidget : portWidget}
      </div>
    </Row>
  );
}
