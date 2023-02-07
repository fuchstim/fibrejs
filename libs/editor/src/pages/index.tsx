import React from 'react';
import dynamic from 'next/dynamic';

const RuleEditor = dynamic(
  () => import('../components/RuleEditor').then(module => module.default),
  { ssr: false, }
);

export default function Index() {
  return (
    <div>
      <RuleEditor />
    </div>
  );
}
