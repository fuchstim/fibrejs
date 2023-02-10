import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, notification } from 'antd';

import {
  DiagramEngine,
  CanvasWidget
} from '@projectstorm/react-diagrams';

import './_style.css';

import { fetchStages, createDiagramEngine } from './_common';
import { HeaderSetter } from '../../../common/types';

type Props = {
  setHeaderConfig: HeaderSetter
};

export default function RuleEditor(props: Props) {
  const [ loading, setLoading, ] = useState(false);
  const [ engine, setEngine, ] = useState<DiagramEngine>();

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
    return (<Spin spinning={loading} style={{ display: 'block', }} />);
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
