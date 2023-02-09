import {
  AbstractModelFactory,
  DiagramEngine
} from '@projectstorm/react-diagrams';

import EditorPortModel from './model';

export default class EditorPortFactory extends AbstractModelFactory<EditorPortModel, DiagramEngine> {
  constructor() {
    super('default');
  }

  generateModel(): EditorPortModel {
    return new EditorPortModel({
      name: 'unknown',
    });
  }
}
