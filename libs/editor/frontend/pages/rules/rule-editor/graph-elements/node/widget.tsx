import * as React from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';

import EditorNodeModel from './model';
import EditorPortModel from '../port/model';
import EditorPortLabel from '../port/widget';
import { Types } from '@tripwire/engine';

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

const SOptions = styled.div`
  display: flex;
  background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
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
  node: EditorNodeModel;
  engine: DiagramEngine;
}

export default function EditorNodeWidget(props: EditorNodeProps) {
  const generatePort = (port: EditorPortModel) => {
    return <EditorPortLabel engine={props.engine} port={port} key={port.getID()} />;
  };

  const generateOption = (nodeOption: Types.Serializer.TSerializedNodeOption) => {

    return <></>;
  };

  const ruleStage = props.node.getOptions().ruleStage;

  return (
    <SNode
      selected={props.node.isSelected()}
      background={'rgb(0,192,255)'}
    >
      <STitle>
        <STitleName>{ruleStage.node.name}</STitleName>
      </STitle>

      <SOptions>
        {ruleStage.node.options.map(option => generateOption(option))}
      </SOptions>

      <SPorts>
        <SPortsContainer>{props.node.getInputPorts().map(port => generatePort(port))}</SPortsContainer>
        <SPortsContainer>{props.node.getOutputPorts().map(port => generatePort(port))}</SPortsContainer>
      </SPorts>
    </SNode>
  );
}
