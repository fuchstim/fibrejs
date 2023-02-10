import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { HeaderSetter } from '../../common/types';

import RuleSetList from './rule-set-list';

type Props = {
  setHeaderConfig: HeaderSetter
};

export default function RuleSets(props: Props) {
  return (
    <Routes>
      <Route
        path='/'
        element={<RuleSetList setHeaderConfig={props.setHeaderConfig}/>}
      />

      {/* <Route
        path="/:rulesetId"
        element={<RuleEditor setHeaderConfig={props.setHeaderConfig} />}
      /> */}
    </Routes>
  );
}
