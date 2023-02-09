import {
  PortModel,
  PortModelAlignment,
  PortModelGenerics,
  PortModelOptions,
  DefaultLinkModel,
  DeserializeEvent,
  LinkModel
} from '@projectstorm/react-diagrams';
import { Types } from '@tripwire/engine';

export enum EPortType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

interface EditorPortModelOptions {
  id: string,
  portType: EPortType,
  config: Types.Serializer.TSerializedNodeInputOutput
}

interface EditorPortModelGenerics extends PortModelGenerics {
  OPTIONS: EditorPortModelOptions & PortModelOptions;
}

export default class EditorPortModel extends PortModel<EditorPortModelGenerics> {
  constructor({ id, portType, config, }: EditorPortModelOptions) {
    super({
      id,
      name: config.name,
      alignment: portType === EPortType.INPUT ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT,
      type: 'editor-port',
      portType,
      config,
    });
  }

  get isInput() {
    return this.options.portType === EPortType.INPUT;
  }

  get hasLink() {
    return Object.values(this.links).length > 0;
  }

  canLinkToPort(port: EditorPortModel): boolean {
    const { portType: type, config, } = port.getOptions();

    if (this.options.config.type.id !== config.type.id) {
      return false;
    }

    switch (this.options.portType) {
      case EPortType.INPUT: return type === EPortType.OUTPUT;
      case EPortType.OUTPUT: return type === EPortType.INPUT;
      default: return false;
    }
  }

  deserialize(event: DeserializeEvent<this>) {
    super.deserialize(event);
    this.options.portType = event.data.type as EPortType;
    this.options.config = event.data.config;
  }

  serialize() {
    return {
      ...super.serialize(),
      type: this.options.portType,
      config: this.options.config,
    };
  }

  link(port: PortModel): LinkModel {
    const link = this.createLinkModel();

    link.setSourcePort(this);
    link.setTargetPort(port);

    return link;
  }

  createLinkModel(): LinkModel {
    return super.createLinkModel() || new DefaultLinkModel();
  }
}
