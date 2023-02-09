import { Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import Table, { ColumnsType } from 'antd/es/table';
import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import { Types } from '@tripwire/engine';

import client from '../../common/client';
import RuleEditor from './_RuleEditor';

export default function Rules() {
  const [ loading, setLoading, ] = useState(false);
  const [ rules, setRules, ] = useState<Types.Config.TRuleConfig[]>([]);

  const navigate = useNavigate();

  const getRules = async () => {
    const rules = await client.findRules();

    setRules(rules);
  };

  useEffect(
    () => {
      setLoading(true);
      getRules().finally(() => setLoading(false));
    },
    []
  );

  const columns: ColumnsType<Types.Config.TRuleConfig> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '150px',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      key: 'edit',
      width: '200px',
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => navigate(record.id)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Routes>
      <Route
        path='/'
        element={
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={rules}
          />
        }
      />

      <Route path="/:ruleId" element={<RuleEditor />} />
    </Routes>
  );
}
