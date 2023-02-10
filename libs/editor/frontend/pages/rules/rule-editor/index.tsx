import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Col, Row, Spin, notification } from 'antd';

import {
  DiagramEngine,
  CanvasWidget
} from '@projectstorm/react-diagrams';

import './_style.css';

import { fetchStages, createDiagramEngine } from './_common';
import { HeaderSetter } from '../../../common/types';
import { PicCenterOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';

type Props = {
  setHeaderConfig: HeaderSetter
};

export default function RuleEditor(props: Props) {
  const [ loading, setLoading, ] = useState(false);
  const [ engine, setEngine, ] = useState<DiagramEngine>();
  const realign = useCallback(
    () => console.log({ engine, }),
    [ engine, ]
  );

  const { ruleId, } = useParams();
  const navigate = useNavigate();

  useEffect(
    () => {
      if (!ruleId) {
        return navigate('/rules');
      }

      props.setHeaderConfig({
        title: 'Edit Rule',
        subtitle: 'Add, remove, or change parts of this rule',
        extra: (
          <Row gutter={16} wrap={false} justify="end" align="middle">
            <Col>
              <Button
                icon={<PicCenterOutlined />}
                onClick={() => realign()}
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
        ),
      });

      setLoading(true);

      fetchStages(ruleId)
        .then(stages => createDiagramEngine(stages))
        .then(engine => setEngine(engine))
        .catch(e => notification.error({ message: e.message, }))
        .finally(() => setLoading(false));
    },
    []
  );

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
}
