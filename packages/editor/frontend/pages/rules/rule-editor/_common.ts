import createEngine, { DagreEngine, DefaultDiagramState, DiagramEngine, DiagramModel, LinkModel, PathFindingLinkFactory } from '@projectstorm/react-diagrams';
import { TRuleStageWithNode } from './_types';
import client from '../../../common/client';

import EditorNodeModel from './graph-elements/node/model';
import type { Types } from '@fibre/engine';
import EditorNodeFactory from './graph-elements/node/factory';
import EditorPortFactory from './graph-elements/port/factory';
import EditorPortModel from './graph-elements/port/model';

const dagreEngine = new DagreEngine({
  graph: {
    rankdir: 'LR',
    ranker: 'longest-path',
    align: 'DR',
    marginx: 100,
    marginy: 100,
  },
  includeLinks: true,
  nodeMargin: 100,
});

export async function fetchStages(rule: Types.Config.TRuleConfig): Promise<TRuleStageWithNode[]> {
  const serializationContexts = rule.stages.reduce(
    (acc, stage) => ({
      ...acc,
      [stage.id]: { nodeId: stage.nodeId, context: { ruleId: rule.id, nodeOptions: stage.nodeOptions, }, },
    }),
    {}
  );

  const nodes = await client.batchGetNode(serializationContexts);

  return rule.stages.map<TRuleStageWithNode>(
    stage => ({ ...stage, ruleId: rule.id, node: nodes[stage.id], })
  );
}

export function createDiagramEngine(stages: TRuleStageWithNode[]): DiagramEngine {
  const engine = createEngine();
  const state = engine.getStateMachine().getCurrentState();
  if (state instanceof DefaultDiagramState) {
    state.dragNewLink.config.allowLooseLinks = false;
  }

  engine
    .getNodeFactories()
    .registerFactory(new EditorNodeFactory());
  engine
    .getPortFactories()
    .registerFactory(new EditorPortFactory());

  const nodes = createNodes(stages);
  const links = createNodeLinks(nodes);

  const model = new DiagramModel();
  model.addAll(...nodes, ...links);

  engine.setModel(model);

  const listener = engine.registerListener({
    canvasReady: () => {
      if (model.getNodes().length) {
        distributeNodes(engine);
      }

      listener.deregister();
    },
  });

  return engine;
}

export function distributeNodes(engine: DiagramEngine) {
  const model = engine.getModel();

  dagreEngine.redistribute(model);
  dagreEngine.refreshLinks(model);

  model.getLinks().forEach(l => l.removeMiddlePoints());

  engine
    .getLinkFactories()
    .getFactory<PathFindingLinkFactory>(PathFindingLinkFactory.NAME)
    .calculateRoutingMatrix();

  engine.zoomToFitNodes({ margin: 100, });
}

function createNodes(stages: TRuleStageWithNode[]): EditorNodeModel[] {
  return stages.map(
    ruleStage => new EditorNodeModel({ ruleStage, })
  );
}

function createNodeLinks(nodes: EditorNodeModel[]): LinkModel[] {
  const links: LinkModel[] = [];

  for (const node of nodes) {
    for (const input of node.getOptions().ruleStage.inputs) {
      const source = nodes.find(n => n.getID() === input.ruleStageId);
      if (!source) { continue; }

      const sourcePort = source.getOutputPort(input.outputId);
      const targetPort = node.getInputPort(input.inputId);
      if (!sourcePort || !targetPort) { continue; }

      if (!sourcePort.canLinkToPort(targetPort)) { continue; }

      links.push(sourcePort.link(targetPort));
    }
  }

  return links;
}

export function exportRuleStages(engine: DiagramEngine): Types.Config.TRuleStageConfig[] {
  const nodes: EditorNodeModel[] = engine
    .getModel()
    .getNodes()
    .map(n => n as EditorNodeModel)
    .filter(n => n.getType() === 'editor-node');

  const stages: Types.Config.TRuleStageConfig[] = nodes.map(node => {
    const nodeOptions = node.getOptions();

    const inputs: Types.RuleStage.TRuleStageInput[] = node
      .getInputPorts()
      .filter(port => Object.values(port.getLinks()).length === 1)
      .map(targetPort => {
        const sourcePort = Object.values(targetPort.getLinks())[0].getSourcePort() as EditorPortModel;

        return {
          ruleStageId: sourcePort.getParent().getID(),
          outputId: sourcePort.getOptions().config.id,
          inputId: targetPort.getOptions().config.id,
        };
      });

    return {
      id: node.getID(),
      nodeId: nodeOptions.ruleStage.nodeId,
      inputs,
      nodeOptions: nodeOptions.ruleStage.nodeOptions,
    };
  });

  return stages;
}

export function camelCaseToSentenceCase(input: string) {
  return [ input.slice(0, 1).toUpperCase(), input.slice(1), ]
    .join('')
    .replace(/([A-Z])/g, ' $1')
    .trim();
}
