import createEngine, { DagreEngine, DefaultDiagramState, DiagramEngine, DiagramModel, LinkModel, PathFindingLinkFactory } from '@projectstorm/react-diagrams';
import { TRuleStageWithNode } from './_types';
import client from '../../../common/client';

import EditorNodeModel from './graph-elements/node/model';
import { Types } from '@tripwire/engine';
import EditorNodeFactory from './graph-elements/node/factory';
import EditorPortFactory from './graph-elements/port/factory';

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

export async function fetchStages(ruleId: string): Promise<TRuleStageWithNode[]> {
  const rule = await client.getRule(ruleId);

  const nodeOptions = rule.stages.reduce(
    (acc, { nodeId, nodeOptions, }) => ({ ...acc, [nodeId]: nodeOptions, }),
    {} as Types.Common.TKeyValue<string, Types.Node.TNodeOptions>
  );

  const nodes = await client.findNodes(nodeOptions);

  return rule.stages.map<TRuleStageWithNode>(
    stage => ({ ...stage, node: nodes.find(node => node.id === stage.nodeId)!, })
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

  const model = createDiagramModel(stages);
  engine.setModel(model);

  const listener = engine.registerListener({
    canvasReady: () => {
      dagreEngine.redistribute(model);
      dagreEngine.refreshLinks(model);

      engine
        .getLinkFactories()
        .getFactory<PathFindingLinkFactory>(PathFindingLinkFactory.NAME)
        .calculateRoutingMatrix();

      engine.zoomToFitNodes({ margin: 100, });

      listener.deregister();
    },
  });

  return engine;
}

function createDiagramModel(stages: TRuleStageWithNode[]): DiagramModel {
  const nodes = stages.map(
    ruleStage => new EditorNodeModel({ ruleStage, })
  );

  const links = createNodeLinks(nodes);

  const diagramModel = new DiagramModel();

  diagramModel.addAll(...nodes, ...links);

  return diagramModel;
}

function createNodeLinks(nodes: EditorNodeModel[]): LinkModel[] {
  const links: LinkModel[] = [];

  for (const node of nodes) {
    for (const input of node.getOptions().ruleStage.inputs) {
      const source = nodes.find(n => n.getID() === input.ruleStageId);
      if (!source) { continue; }

      const sourcePort = source.getOutputPort(input.outputId.split('.')[0]);
      const targetPort = node.getInputPort(input.inputId.split('.')[0]);
      if (!sourcePort || !targetPort) { continue; }

      if (!sourcePort.canLinkToPort(targetPort)) { continue; }

      links.push(sourcePort.link(targetPort));
    }
  }

  return links;
}
