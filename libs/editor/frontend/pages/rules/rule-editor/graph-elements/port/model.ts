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
import { notification } from 'antd';

export enum EPortType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

interface EditorPortModelOptions {
  id: string,
  portType: EPortType,
  config: Types.Serializer.TSerializedNodeInputOutput,
  level: number,
}

interface EditorPortModelGenerics extends PortModelGenerics {
  OPTIONS: EditorPortModelOptions & PortModelOptions;
}

export default class EditorPortModel extends PortModel<EditorPortModelGenerics> {
  constructor({ id, portType, config, level, }: EditorPortModelOptions) {
    super({
      id,
      name: config.name,
      alignment: portType === EPortType.INPUT ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT,
      type: 'editor-port',
      portType,
      config,
      level,
    });
  }

  get isInput() {
    return this.options.portType === EPortType.INPUT;
  }

  get hasLink(): boolean {
    return !!Object.values(this.links).length;
  }

  canLinkToPort(targetPort: EditorPortModel): boolean {
    const { config: sourceConfig, } = this.getOptions();
    const { config: targetConfig, portType: targetPortType, } = targetPort.getOptions();

    if (targetPort.hasLink) {
      return false;
    }

    if (sourceConfig.type.id !== targetConfig.type.id) {
      notification.error({
        message: `Cannot connect ${sourceConfig.type.name} type to ${targetConfig.type.name} type`,
      });

      return false;
    }

    switch (this.options.portType) {
      case EPortType.INPUT: return targetPortType === EPortType.OUTPUT;
      case EPortType.OUTPUT: return targetPortType === EPortType.INPUT;
      default:
        notification.error({
          message: `Cannot connect ${targetPortType === EPortType.OUTPUT ? 'output to output' : 'input to input'}`,
        });

        return false;
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
