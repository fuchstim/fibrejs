import {
  PortModel,
  PortModelAlignment,
  PortModelGenerics,
  PortModelOptions,
  DefaultLinkModel,
  DeserializeEvent,
  LinkModel
} from '@projectstorm/react-diagrams';
import { Types, WrappedTypes } from '@fibrejs/engine';
import { notification } from 'antd';
import EditorNodeModel from '../node/model';

export enum EPortType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

interface EditorPortModelOptions {
  id: string,
  portType: EPortType,
  config: Types.Serializer.TSerializedNodeInputOutput,
  level: number,
  labelOnly?: boolean,
}

interface EditorPortModelGenerics extends PortModelGenerics {
  OPTIONS: EditorPortModelOptions & PortModelOptions;
}

export default class EditorPortModel extends PortModel<EditorPortModelGenerics> {
  constructor({ id, portType, config, level, labelOnly, }: EditorPortModelOptions) {
    super({
      id,
      name: id,
      alignment: portType === EPortType.INPUT ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT,
      type: 'editor-port',
      portType,
      config,
      level,
      maximumLinks: portType === EPortType.INPUT ? 1 : undefined,
      labelOnly,
    });
  }

  get isInput() {
    return this.options.portType === EPortType.INPUT;
  }

  get hasLink(): boolean {
    return !!Object.values(this.links).length;
  }

  override canLinkToPort(targetPort: EditorPortModel, ignoreExistingLink = false): boolean {
    const { config: sourceConfig, } = this.getOptions();
    const { config: targetConfig, portType: targetPortType, } = targetPort.getOptions();

    if (!ignoreExistingLink && targetPort.hasLink) {
      return false;
    }

    if (targetPort.getOptions().labelOnly) {
      return false;
    }

    if (sourceConfig.type.id !== targetConfig.type.id && !WrappedTypes.isNullableOf(sourceConfig.type.id, targetConfig.type.id)) {
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

  override deserialize(event: DeserializeEvent<this>) {
    super.deserialize(event);
    this.options.portType = event.data.type as EPortType;
    this.options.config = event.data.config;
  }

  override serialize() {
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

  override createLinkModel(): LinkModel {
    return super.createLinkModel() || new DefaultLinkModel();
  }

  override getParent() {
    return super.getParent() as EditorNodeModel;
  }
}
