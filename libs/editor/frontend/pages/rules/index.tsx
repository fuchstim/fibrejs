import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { HeaderSetter } from '../../common/types';

import RuleList from './rule-list';
import RuleEditor from './rule-editor';

type Props = {
  setHeaderConfig: HeaderSetter
};

export default function Rules(props: Props) {
  return (
    <Routes>
      <Route
        path='/'
        element={<RuleList setHeaderConfig={props.setHeaderConfig}/>}
      />

      <Route
        path="/:ruleId"
        element={<RuleEditor setHeaderConfig={props.setHeaderConfig} />}
      />
    </Routes>
  );
}
