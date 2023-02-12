import React, { useEffect, useState } from 'react';
import type { Types } from '@tripwire/engine';
import { useNavigate } from 'react-router-dom';
import client from '../../common/client';
import { Button, Col, Form, Input, Popover, Row, Table, notification } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';

import Page from '../../components/page';

export default function RuleList() {
  const [ loading, setLoading, ] = useState(false);
  const [ createRuleForm, ] = Form.useForm();
  const [ showPopover, setShowPopover, ] = useState(false);
  const [ rules, setRules, ] = useState<Types.Config.TRuleConfig[]>([]);

  const navigate = useNavigate();

  const getRules = async () => {
    setLoading(true);

    await client.findRules()
      .then(rules => setRules(rules))
      .catch(e => notification.error({ message: e.message, }))
      .finally(() => setLoading(false));
  };

  const createRule = async ({ name, }: { name: string }) => {
    // TODO: Improve ID generation
    const highestIdNumber = Math.max(
      ...rules
        .map(
          rule => Number(rule.id.split('rule-')?.[1] ?? '0')
        )
    );

    setLoading(true);

    await client.createRule({ id: `rule-${highestIdNumber + 1}`, name, stages: [], })
      .then(() => getRules())
      .catch(e => notification.error({ message: e.message, }))
      .finally(() => {
        setLoading(false),
        setShowPopover(false);
        createRuleForm.resetFields();
      });
  };

  useEffect(() => { getRules(); }, []);

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
      title="Rules"
      subtitle="Create, remove, or edit rules"
      headerExtra={
        <Popover
          content={(
            <Form
              form={createRuleForm}
              onFinish={createRule}
            >
              <Form.Item
                name="name"
                style={{ margin: '0', marginBottom: '16px', }}
                rules={[ { required: true, message: 'Please enter a rule name', }, ]}
              >
                <Input placeholder='Rule Name'/>
              </Form.Item>

              <Form.Item style={{ margin: 0, }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                >
                  Submit
                </Button>
              </Form.Item>
            </Form>
          )}
          title="Create new Rule"
          trigger="click"
          placement="bottomRight"
          open={showPopover}
          onOpenChange={setShowPopover}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
          >
            Create
          </Button>
        </Popover>
      }
      content={
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={rules}
        />
      }
    />
  );
}
