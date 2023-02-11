import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Col, Popconfirm, Row, Spin, notification } from 'antd';

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

  const saveAndReturn = async () => {
    setLoading(true);

    notification.info({ message: 'TODO: Implement save', });

    await new Promise(
      resolve => setTimeout(resolve, 1000)
    );

    navigate('/rules');
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

    return (<CanvasWidget className="editor-canvas" engine={engine} />);
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
            <Popconfirm
              title="Discard changes"
              description="Unsaved progress will be lost. Continue?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => navigate('/rules')}
            >
              <Button>
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
