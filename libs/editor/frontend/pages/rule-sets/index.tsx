import React from 'react';
import { Route, Routes } from 'react-router-dom';

import RuleSetList from './rule-set-list';

export default function RuleSets() {
  return (
    <Routes>
      <Route
        path='/'
        element={<RuleSetList/>}
      />

      {/* <Route
        path="/:rulesetId"
        element={<RuleEditor  />}
      /> */}
    </Routes>
  );
}
