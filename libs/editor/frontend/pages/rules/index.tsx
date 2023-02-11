import React from 'react';
import { Route, Routes } from 'react-router-dom';

import RuleList from './rule-list';
import RuleEditor from './rule-editor';

export default function Rules() {
  return (
    <Routes>
      <Route
        path='/'
        element={<RuleList/>}
      />

      <Route
        path="/:ruleId"
        element={<RuleEditor />}
      />
    </Routes>
  );
}
