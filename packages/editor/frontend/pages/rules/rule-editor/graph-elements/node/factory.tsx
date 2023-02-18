import * as React from 'react';
import { DiagramEngine, AbstractReactFactory, GenerateWidgetEvent, GenerateModelEvent } from '@projectstorm/react-diagrams';

import EditorNodeModel from './model';
import EditorNodeWidget from './widget';

export default class EditorNodeFactory extends AbstractReactFactory<EditorNodeModel, DiagramEngine> {
  constructor() {
    super('editor-node');
  }

  generateReactWidget(event: GenerateWidgetEvent<EditorNodeModel>): JSX.Element {
    return <EditorNodeWidget engine={this.engine} editorNode={event.model} />;
  }

  generateModel(event: GenerateModelEvent): EditorNodeModel {
    return new EditorNodeModel(event.initialConfig);
  }
}
