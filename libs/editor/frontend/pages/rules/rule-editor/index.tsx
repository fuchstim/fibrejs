import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Popconfirm, Row, Spin, notification } from 'antd';

import {
  CanvasWidget,
  DiagramEngine
} from '@projectstorm/react-diagrams';

import './_style.css';

import { createDiagramEngine, distributeNodes, exportRuleStages, fetchStages } from './_common';
import { PicCenterOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import AddNodeDrawer from '../../../components/add-node-drawer';
import Page from '../../../components/page';
import EditorNodeModel from './graph-elements/node/model';
import type { Types } from '@tripwire/engine';
import { TRuleStageWithNode } from './_types';
import client from '../../../common/client';

type Props = {
  ruleScaffold?: Types.Config.TRuleConfig
};

export default function RuleEditor(props: Props) {
  const [ loading, setLoading, ] = useState(false);
  const [ rule, setRule, ] = useState<Types.Config.TRuleConfig>();
  const [ showAddNodeDrawer, setShowAddNodeDrawer, ] = useState(false);
  const [ engine, setEngine, ] = useState<DiagramEngine>();

  const { ruleId, } = useParams();
  const navigate = useNavigate();

  useEffect(
    () => { init(); },
    []
  );

  const init = async () => {
    if (!ruleId) {
      return navigate('/rules');
    }

    setLoading(true);

    try {
      const rule = props.ruleScaffold || await client.getRule(ruleId);
      setRule(rule);

      await fetchStages(rule)
        .then(stages => createDiagramEngine(stages))
        .then(engine => setEngine(engine));
    } catch (error) {
      const { message, } = error as Error;
      notification.error({ message, });
    } finally {
      setLoading(false);
    }
  };

  const saveAndReturn = async () => {
    if (!rule || !engine) { return; }

    const updatedConfig: Types.Config.TRuleConfig = {
      id: rule.id,
      name: rule.name,
      stages: exportRuleStages(engine),
    };

    setLoading(true);

    await client.updateRule(updatedConfig)
      .then(() => navigate('/rules'))
      .catch(error => notification.error(error))
      .finally(() => setLoading(false));
  };

  const addNodeToGraph = (node: Types.Serializer.TSerializedNode) => {
    if (!engine) { return; }

    // TODO: Improve ID generation
    const highestIdNumber = Math.max(
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
      nodeOptions: {},
    };

    const nodeModel = new EditorNodeModel({ ruleStage, });

    engine.getModel().addNode(nodeModel);
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
              icon={<PicCenterOutlined />}
              disabled={loading}
              onClick={() => engine && distributeNodes(engine)}
            />
          </Col>

          <Col>
            <Button
              icon={<PlusOutlined/>}
              disabled={loading}
              onClick={() => setShowAddNodeDrawer(true)}
            />
          </Col>

          <Col>
            <Popconfirm
              title="Discard changes"
              description="Unsaved progress will be lost. Continue?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => navigate('/rules')}
            >
              <Button disabled={loading}>
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
      content={getContent()}
    />
  );
}
