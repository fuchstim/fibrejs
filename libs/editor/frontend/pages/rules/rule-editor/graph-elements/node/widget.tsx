import * as React from 'react';
import { DefaultPortLabel, DefaultPortModel, DiagramEngine } from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';
import DefaultNodeModel from './model';

const SNode = styled.div<{ background: string; selected: boolean }>`
  background-color: ${(p) => p.background};
  border-radius: 5px;
  font-family: sans-serif;
  color: white;
  border: solid 2px black;
  overflow: visible;
  font-size: 11px;
  border: solid 2px ${(p) => (p.selected ? 'rgb(0,192,255)' : 'black')};
`;

const STitle = styled.div`
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  white-space: nowrap;
  justify-items: center;
`;

const STitleName = styled.div`
  flex-grow: 1;
  padding: 5px 5px;
`;

const SPorts = styled.div`
  display: flex;
  background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
`;

const SPortsContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  &:first-of-type {
    margin-right: 10px;
  }

  &:only-child {
    margin-right: 0px;
  }
`;

interface EditorNodeProps {
  node: DefaultNodeModel;
  engine: DiagramEngine;
}

export default class EditorNodeWidget extends React.Component<EditorNodeProps> {
  generatePort = (port: DefaultPortModel) => {
    return <DefaultPortLabel engine={this.props.engine} port={port} key={port.getID()} />;
  };

  render() {
    return (
      <SNode
        data-default-node-name={this.props.node.getOptions().name}
        selected={this.props.node.isSelected()}
        background={this.props.node.getOptions().color ?? 'white'}
      >
        <STitle>
          <STitleName>{this.props.node.getOptions().name}</STitleName>
        </STitle>
        <SPorts>
          <SPortsContainer>{this.props.node.getInPorts().map(port => this.generatePort(port))}</SPortsContainer>
          <SPortsContainer>{this.props.node.getOutPorts().map(port => this.generatePort(port))}</SPortsContainer>
        </SPorts>
      </SNode>
    );
  }
}
