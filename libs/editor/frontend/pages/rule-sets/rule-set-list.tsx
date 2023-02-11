import React, { useEffect, useState } from 'react';
import type { Types } from '@tripwire/engine';
import { useNavigate } from 'react-router-dom';
import client from '../../common/client';
import { Button, Col, Row, Table, notification } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import Page from '../../components/page';

export default function RuleSetList() {
  const [ loading, setLoading, ] = useState(false);
  const [ ruleSets, setRuleSets, ] = useState<Types.Config.TRuleSetConfig[]>([]);

  const navigate = useNavigate();

  const getRules = async () => {
    const ruleSets = await client.findRuleSets();

    setRuleSets(ruleSets);
  };

  useEffect(
    () => {
      setLoading(true);
      getRules()
        .catch(e => notification.error({ message: e.message, }))
        .finally(() => setLoading(false));
    },
    []
  );

  const columns: ColumnsType<Types.Config.TRuleSetConfig> = [
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
      width: '300px',
      render: (_, record) => (
        <Row gutter={16} justify="end">
          <Col>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(record.id)}
            >
              Edit
            </Button>
          </Col>

          <Col>
            <Button
              danger
              icon={<DeleteOutlined />}
              // onClick={() => navigate(record.id)}
            >
              Remove
            </Button>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <Page
      title="Rule Sets"
      subtitle="Create, remove, or edit rule sets"
      headerExtra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
        >
          Create
        </Button>
      }
      content={
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={ruleSets}
        />
      }
    />
  );
}
