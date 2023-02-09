import * as React from 'react';
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams-core';
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

export class EditorPortLabel extends React.Component<EditorPortLabelProps> {
  render() {
    const port = (
      <PortWidget engine={this.props.engine} port={this.props.port}>
        <SPort />
      </PortWidget>
    );
    const label = <SLabel>{this.props.port.getOptions().label}</SLabel>;

    return (
      <SPortLabel>
        {this.props.port.getOptions().in ? port : label}
        {this.props.port.getOptions().in ? label : port}
      </SPortLabel>
    );
  }
}
