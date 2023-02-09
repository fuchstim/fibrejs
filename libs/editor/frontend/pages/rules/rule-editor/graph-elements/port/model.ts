import {
  LinkModel,
  PortModel,
  PortModelAlignment,
  PortModelGenerics,
  PortModelOptions,
  DefaultLinkModel,
  AbstractModelFactory,
  DeserializeEvent
} from '@projectstorm/react-diagrams';

interface EditorPortModelOptions extends PortModelOptions {
  label?: string;
  in?: boolean;
  type?: string;
}

interface EditorPortModelGenerics extends PortModelGenerics {
  OPTIONS: EditorPortModelOptions;
}

export default class EditorPortModel extends PortModel<EditorPortModelGenerics> {
  constructor(options: EditorPortModelOptions) {
    super({
      label: options.label || options.name,
      alignment: options.in ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT,
      type: 'default',
      ...options,
    });
  }

  deserialize(event: DeserializeEvent<this>) {
    super.deserialize(event);
    this.options.in = event.data.in;
    this.options.label = event.data.label;
  }

  serialize() {
    return {
      ...super.serialize(),
      in: this.options.in,
      label: this.options.label,
    };
  }

  link<T extends LinkModel>(port: PortModel, factory?: AbstractModelFactory<T>): T {
    const link = this.createLinkModel(factory);
    link.setSourcePort(this);
    link.setTargetPort(port);
    return link as T;
  }

  canLinkToPort(port: PortModel): boolean {
    if (port instanceof EditorPortModel) {
      return this.options.in !== port.getOptions().in;
    }
    return true;
  }

  createLinkModel(factory?: AbstractModelFactory<LinkModel>): LinkModel {
    const link = super.createLinkModel();
    if (!link && factory) {
      return factory.generateModel({});
    }
    return link || new DefaultLinkModel();
  }
}
