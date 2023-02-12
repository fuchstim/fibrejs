import React from 'react';
import { Route, Routes } from 'react-router-dom';

import RuleSetList from './rule-set-list';
import RuleSetEditor from './rule-set-editor';

export default function RuleSets() {
  return (
    <Routes>
      <Route
        path='/'
        element={<RuleSetList/>}
      />

      <Route
        path="/:ruleSetId"
        element={<RuleSetEditor />}
      />
    </Routes>
  );
}
