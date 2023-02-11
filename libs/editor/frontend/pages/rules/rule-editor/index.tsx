import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Col, Row, Spin, notification } from 'antd';

import {
  DiagramEngine,
  CanvasWidget
} from '@projectstorm/react-diagrams';

import './_style.css';

import { fetchStages, createDiagramEngine, distributeNodes } from './_common';
import { PicCenterOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import Page from '../../../components/page';

export default function RuleEditor() {
  const [ loading, setLoading, ] = useState(false);
  const [ engine, setEngine, ] = useState<DiagramEngine>();

  const { ruleId, } = useParams();
  const navigate = useNavigate();

  useEffect(
    () => {
      if (!ruleId) {
        return navigate('/rules');
      }

      setLoading(true);

      fetchStages(ruleId)
        .then(stages => createDiagramEngine(stages))
        .then(engine => setEngine(engine))
        .catch(e => notification.error({ message: e.message, }))
        .finally(() => setLoading(false));
    },
    []
  );

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
      <div style={{ height: '100%', }}>
        <CanvasWidget
          className="editor-canvas"
          engine={engine}
        />
      </div>
    );
  };

  return (
    <Page
      title="Edit Rule"
      subtitle="Add, remove, or change parts of this rule"
      headerExtra={(
        <Row gutter={16} wrap={false} justify="end" align="middle">
          <Col>
            <Button
              icon={<PicCenterOutlined />}
              onClick={() => engine && distributeNodes(engine)}
            />
          </Col>

          <Col>
            <Button icon={<PlusOutlined/>} />
          </Col>

          <Col>
            <Button>
              Cancel
            </Button>
          </Col>

          <Col>
            <Button
              type='primary'
              icon={<SaveOutlined />}
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
