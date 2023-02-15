import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Popconfirm, Row, Spin, notification, theme } from 'antd';

import {
  CanvasWidget,
  DiagramEngine,
  ListenerHandle
} from '@projectstorm/react-diagrams';

import './_style.css';

import { createDiagramEngine, distributeNodes, exportRuleStages, fetchStages } from './_common';
import { CaretRightOutlined, PicCenterOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import AddNodeDrawer from './_add-node-drawer';
import Page from '../../../components/page';
import EditorNodeModel from './graph-elements/node/model';
import type { Types } from '@tripwire/engine';
import { TPreviewValues, TRuleStageWithNode } from './_types';
import client from '../../../common/client';
import { AxiosError } from 'axios';
import PreviewRuleDrawer from './_preview-rule-drawer';

export default function RuleEditor() {
  const [ loading, setLoading, ] = useState(false);
  const [ rule, setRule, ] = useState<Types.Config.TRuleConfig>();
  const [ listeners, setListeners, ] = useState<ListenerHandle[]>([]);
  const [ confirmDiscard, setConfirmDiscard, ] = useState(false);
  const [ showDiscardPopover, setShowDiscardPopover, ] = useState(false);
  const [ showAddNodeDrawer, setShowAddNodeDrawer, ] = useState(false);
  const [ showPreviewRuleDrawer, setShowPreviewRuleDrawer, ] = useState(false);
  const [ engine, setEngine, ] = useState<DiagramEngine>();

  const { token: { colorBgLayout, }, } = theme.useToken();

  const { ruleId, } = useParams();
  const navigate = useNavigate();

  useEffect(
    () => {
      getRule();

      return () => { listeners.map(l => l.deregister()); };
    },
    []
  );

  const getRule = async () => {
    if (!ruleId) {
      return navigate('/rules');
    }

    setLoading(true);

    try {
      const rule = await client.getRule(ruleId);
      setRule(rule);

      const stages = await fetchStages(rule);
      const engine = createDiagramEngine(stages);
      setEngine(engine);

      const modelListener = engine.getModel().registerListener({
        nodesUpdated: () => handleGraphUpdated(engine),
        linksUpdated: () => handleGraphUpdated(engine),
      });

      const nodeListeners = engine
        .getModel()
        .getNodes()
        .map(
          node => node.registerListener({
            optionsUpdated: () => handleGraphUpdated(engine),
          })
        );

      setListeners([ ...listeners, modelListener, ...nodeListeners, ]);
    } catch (error) {
      const { message, response, } = error as AxiosError;
      notification.error({ message, });

      if (response?.status === 404) {
        navigate('/rules');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentConfig = () => {
    if (!rule || !engine) { return; }

    const currentConfig: Types.Config.TRuleConfig = {
      id: rule.id,
      name: rule.name,
      stages: exportRuleStages(engine),
    };

    setRule(currentConfig);

    return currentConfig;
  };

  const saveAndReturn = async () => {
    const updatedConfig = getCurrentConfig();
    if (!updatedConfig) { return; }

    setLoading(true);

    await client.validateRule(updatedConfig)
      .then(() => client.updateRule(updatedConfig))
      .then(() => navigate('/rules'))
      .catch(error => notification.error(error))
      .finally(() => setLoading(false));
  };

  const addNodeToGraph = (node: Types.Serializer.TSerializedNode) => {
    if (!engine) { return; }

    // TODO: Improve ID generation
    const highestIdNumber = Math.max(
      0,
      ...engine
        .getModel()
        .getNodes()
        .map(
          node => Number(node.getOptions().id?.split('stage-')?.[1] ?? '0')
        )
    );

    const ruleStage: TRuleStageWithNode = {
      id: `stage-${highestIdNumber + 1}`,
      nodeId: node.id,
      ruleId,
      node,
      inputs: [],
      nodeOptions: node.defaultOptions,
    };

    const nodeModel = new EditorNodeModel({ ruleStage, });
    nodeModel.setPosition(
      50 + Math.random() * 300,
      50 + Math.random() * 150
    );

    setListeners([
      ...listeners,
      nodeModel.registerListener({
        optionsUpdated: () => handleGraphUpdated(engine),
      }),
    ]);

    engine.getModel().addNode(nodeModel);

    setTimeout(() => {
      engine.repaintCanvas();
    }, 100);
  };

  const updatePreviewValues = (stagePreviewValues: { stageId: string, previewValues: TPreviewValues }[]) => {
    if (!engine) { return; }

    const model = engine.getModel();

    for (const { stageId, previewValues, } of stagePreviewValues) {
      const node = model.getNode(stageId) as EditorNodeModel;
      node.setPreviewValues(previewValues);
    }

    setTimeout(() => distributeNodes(engine), 50);
  };

  const handleGraphUpdated = (engine: DiagramEngine) => {
    engine
      .getModel()
      .getNodes()
      .forEach(node => (node as EditorNodeModel).setPreviewValues());

    setConfirmDiscard(true);
  };

  const getContent = () => {
    if (loading || !engine) {
      return (
        <Row style={{ height: '100%', }} justify="center" align="middle">
          <Col>
            <Spin spinning={loading} />
          </Col>
        </Row>
      );
    }

    return (
      <>
        <CanvasWidget className="editor-canvas" engine={engine} />
        <AddNodeDrawer
          ruleId={ruleId}
          open={showAddNodeDrawer}
          onSelected={node => addNodeToGraph(node)}
          onClose={() => setShowAddNodeDrawer(false)}
        />
        <PreviewRuleDrawer
          ruleConfig={rule}
          open={showPreviewRuleDrawer}
          onPreviewValues={previewValues => updatePreviewValues(previewValues)}
          onClose={() => setShowPreviewRuleDrawer(false)}
        />
      </>
    );
  };

  return (
    <Page
      title={rule?.name || 'Edit Rule'}
      subtitle="Add, remove, or change parts of this rule"
      headerExtra={(
        <Row gutter={16} wrap={false} justify="end" align="middle">
          <Col>
            <Button
              icon={<PlusOutlined/>}
              disabled={loading}
              onClick={() => setShowAddNodeDrawer(true)}
            />
          </Col>

          <Col>
            <Button
              icon={<CaretRightOutlined/>}
              disabled={loading}
              onClick={() => { getCurrentConfig(); setShowPreviewRuleDrawer(true); }}
            />
          </Col>

          <Col>
            <Button
              icon={<PicCenterOutlined />}
              disabled={loading}
              onClick={() => engine && distributeNodes(engine)}
            />
          </Col>

          <Col>
            <Popconfirm
              title="Discard changes"
              description="Unsaved progress will be lost. Continue?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => navigate('/rules')}
              onCancel={() => setShowDiscardPopover(false)}
              open={showDiscardPopover}
            >
              <Button disabled={loading} onClick={() => confirmDiscard ? setShowDiscardPopover(true) : navigate('/rules')}>
                Cancel
              </Button>
            </Popconfirm>
          </Col>

          <Col>
            <Button
              type='primary'
              icon={<SaveOutlined />}
              loading={loading}
              onClick={() => saveAndReturn()}
            >
              Save & Return
            </Button>
          </Col>
        </Row>
      )}
      contentStyle={{ background: colorBgLayout, }}
      content={getContent()}
    />
  );
}
