import React, { useEffect, useState } from 'react';
import type { Types } from '@fibrejs/engine';
import { useNavigate } from 'react-router-dom';
import client from '../../common/client';
import { Button, Col, Form, Input, Popover, Popconfirm, Row, Table, notification } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import Page from '../../components/page';

export default function RuleSetList() {
  const [ loading, setLoading, ] = useState(false);
  const [ showPopover, setShowPopover, ] = useState(false);
  const [ ruleSets, setRuleSets, ] = useState<Types.Config.TRuleSetConfig[]>([]);

  const [ createRuleSetForm, ] = Form.useForm();

  const navigate = useNavigate();

  const getRuleSets = async () => {
    setLoading(true);

    await client.findRuleSets()
      .then(ruleSets => setRuleSets(ruleSets))
      .catch(e => notification.error({ message: e.message, }))
      .finally(() => setLoading(false));
  };

  const createRuleSet = async ({ name, }: { name: string }) => {
    setLoading(true);

    await client.createRuleSet({ name, entries: [], })
      .then(() => getRuleSets())
      .catch(e => notification.error({ message: e.message, }))
      .finally(() => {
        setLoading(false),
        setShowPopover(false);
        createRuleSetForm.resetFields();
      });
  };

  const deleteRuleSet = async (ruleSetId: string) => {
    setLoading(true);

    await client.deleteRuleSet(ruleSetId)
      .then(() => getRuleSets())
      .catch(e => notification.error({ message: e.message, }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { getRuleSets(); }, []);

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
              disabled={loading}
            >
              Edit
            </Button>
          </Col>

          <Col>
            <Popconfirm
              title="Delete Rule Set"
              description={`Delete rule set ${record.name}. Continue?`}
              okText="Yes"
              cancelText="No"
              onConfirm={() => deleteRuleSet(record.id)}
              placement="bottomRight"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={loading}
              >
                Remove
              </Button>
            </Popconfirm>
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
        <Popover
          content={(
            <Form
              form={createRuleSetForm}
              onFinish={createRuleSet}
            >
              <Form.Item
                name="name"
                style={{ margin: '0', marginBottom: '16px', }}
                rules={[ { required: true, message: 'Please enter a rule set name', }, ]}
              >
                <Input disabled={loading} placeholder='Rule Set Name'/>
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
          title="Create new Rule Set"
          trigger="click"
          placement="bottomRight"
          open={showPopover}
          onOpenChange={setShowPopover}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={loading}
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
          dataSource={ruleSets}
        />
      }
    />
  );
}
