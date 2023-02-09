import * as React from 'react';
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';

import EditorPortModel from './model';

interface EditorPortLabelProps {
  port: EditorPortModel;
  engine: DiagramEngine;
}

const SPortLabel = styled.div`
  display: flex;
  margin-top: 1px;
  align-items: center;
`;

const SLabel = styled.div`
  padding: 0 5px;
  flex-grow: 1;
`;

const SPort = styled.div`
  width: 15px;
  height: 15px;
  background: rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgb(192, 255, 0);
  }
`;

export default function EditorPortLabel({ port, engine, }: EditorPortLabelProps) {
  const portWidget = (
    <PortWidget engine={engine} port={port}>
      <SPort />
    </PortWidget>
  );

  const labelWidget = <SLabel>{port.getOptions().name}</SLabel>;

  return (
    <SPortLabel>
      {port.isInput ? portWidget : labelWidget}
      {port.isInput ? labelWidget : portWidget}
    </SPortLabel>
  );
}
