import * as React from 'react';
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams';
import {
  RightCircleTwoTone,
  RightCircleFilled,
  CaretDownOutlined,
  CaretUpOutlined
} from '@ant-design/icons';

import EditorPortModel from './model';
import { Row, Tag, Tooltip, Typography, theme } from 'antd';
import { WrappedTypes } from '@fibrejs/engine';

interface EditorPortWidgetProps {
  port: EditorPortModel;
  engine: DiagramEngine;
  expanded: boolean;
  hideIfUnlinked: boolean;
  previewValue?: unknown;
  onClick?: () => void;
}

export default function EditorPortWidget(props: EditorPortWidgetProps) {
  const { port, engine, hideIfUnlinked, onClick, previewValue, expanded, } = props;

  const {
    token: { colorPrimary, },
  } = theme.useToken();

  const Icon = port.hasLink ? RightCircleFilled : RightCircleTwoTone;
  const portMargin = port.isInput ? { marginRight: 5, marginLeft: -5, } : { marginRight: -5, marginLeft: 5, };
  const iconStyle = { ...portMargin, opacity: port.getOptions().labelOnly ? 0 : 1, };

  const {
    config: { name, type, },
  } = port.getOptions();

  const formattedPreviewValue = type.category === WrappedTypes.ETypeCategory.PRIMITIVE ? String(previewValue) : `{${type.name}}`; // TODO: Render Collection preview value

  const portWidget = (
    <PortWidget engine={engine} port={port}>
      <Icon style={iconStyle} twoToneColor={colorPrimary} />
    </PortWidget>
  );

  const labelIcon = expanded ? <CaretDownOutlined /> : <CaretUpOutlined />;
  const labelWidget = (
    <Tooltip
      placement={port.isInput ? 'right' : 'left'}
      title={type.name}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: port.isInput ? 'flex-start' : 'flex-end', }}>
        <Tag
          closable={false}
          style={{ margin: 0, }}
          icon={type.category !== WrappedTypes.ETypeCategory.PRIMITIVE ? labelIcon : null}
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
