import React, { useEffect, useState } from 'react';
import { Types } from '@fibre/engine';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../common/client';
import { Button, Col, Form, Popover, Popconfirm, Row, Table, notification, Select } from 'antd';
import { DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import Page from '../../components/page';
import { AxiosError } from 'axios';

type Row = {
  id: number,
  ruleId: string,
  ruleName: string,
  priority: Types.RuleSet.ERulePriority
};

export default function RuleSetEditor() {
  const [ loading, setLoading, ] = useState(false);
  const [ showCreatePopover, setShowCreatePopover, ] = useState(false);
  const [ showDiscardPopover, setShowDiscardPopover, ] = useState(false);
  const [ confirmDiscard, setConfirmDiscard, ] = useState(false);
  const [ ruleSet, setRuleSet, ] = useState<Types.Config.TRuleSetConfig>();
  const [ rules, setRules, ] = useState<Types.Config.TRuleConfig[]>([]);

  const [ createEntryForm, ] = Form.useForm();

  const { ruleSetId, } = useParams();
  const navigate = useNavigate();

  useEffect(() => { getRuleSet(); }, []);

  const getRuleSet = async () => {
    if (!ruleSetId) {
      return navigate('/rule-sets');
    }

    setLoading(true);

    try {
      const [ ruleSet, rules, ] = await Promise.all([
        client.getRuleSet(ruleSetId),
        client.findRules(),
      ]);

      setRuleSet(ruleSet);
      setRules(rules);
    } catch (error) {
      const { message, response, } = error as AxiosError;
      notification.error({ message, });

      if (response?.status === 404) {
        navigate('/rule-sets');
      }
    } finally {
      setLoading(false);
    }
  };

  const createEntry = ({ ruleId, priority, }: { ruleId: string, priority: Types.RuleSet.ERulePriority }) => {
    if (!ruleSet) { return; }

    setRuleSet({
      ...ruleSet,
      entries: [
        ...ruleSet.entries,
        { ruleId, priority, },
      ],
    });

    setShowCreatePopover(false);
    setConfirmDiscard(true);
    createEntryForm.resetFields();
  };

  const updateEntry = (index: number, priority: Types.RuleSet.ERulePriority) => {
    if (!ruleSet) { return; }

    setRuleSet({
      ...ruleSet,
      entries: ruleSet.entries.map(
        (entry, id) => id === index ? { ...entry, priority, } : entry
      ),
    });

    setConfirmDiscard(true);
  };

  const deleteEntry = (index: number) => {
    if (!ruleSet) { return; }

    ruleSet.entries.splice(index, 1);

    setRuleSet({
      ...ruleSet,
      entries: [ ...ruleSet.entries, ],
    });

    setConfirmDiscard(true);
  };

  const getRuleForId = (ruleId: string) => {
    const rule = rules.find(rule => rule.id === ruleId);
    if (!rule) { throw new Error(`Invalid rule id: ${ruleId}`);}

    return rule;
  };

  const saveAndReturn = async () => {
    if (!ruleSet) { return; }

    setLoading(true);

    await client.validateRuleSet(ruleSet)
      .then(() => client.updateRuleSet(ruleSet))
      .then(() => navigate('/rule-sets'))
      .catch(error => notification.error(error))
      .finally(() => setLoading(false));
  };

  const generatePriorityOptions = () => (
    Object.values(Types.RuleSet.ERulePriority)
      .map(priority => (<Select.Option key={priority} value={priority}>{priority}</Select.Option>))
  );

  const columns: ColumnsType<Row> = [
    {
      title: 'Rule ID',
      dataIndex: 'ruleId',
      key: 'ruleId',
      width: '150px',
      render: (_, row) => <a target="_blank" href={`/rules/${row.ruleId}`} rel="noreferrer">{row.ruleId}</a>,
    },
    {
      title: 'Rule Name',
      dataIndex: 'ruleName',
      key: 'ruleName',
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (_, row) => (
        <Select
          placeholder="Priority"
          style={{ width: '150px', }}
          value={row.priority}
          onChange={updatedPriority => updateEntry(row.id, updatedPriority)}
        >
          { generatePriorityOptions() }
        </Select>
      ),
    },
    {
      key: 'edit',
      width: '200px',
      render: (_, row) => (
        <Row gutter={16} justify="end">
          <Col>
            <Popconfirm
              title="Delete Entry"
              description={'Delete this entry?'}
              okText="Yes"
              cancelText="No"
              onConfirm={() => deleteEntry(row.id)}
              placement="bottomRight"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
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
    title={ruleSet?.name || 'Edit Rule Set'}
    subtitle="Add, remove, or change parts of this rule set"
      headerExtra={
        <Row gutter={16} wrap={false} justify="end" align="middle">
          <Col>
            <Popover
              content={(
                <Form
                  form={createEntryForm}
                  onFinish={createEntry}
                >
                  <Form.Item
                    name="ruleId"
                    style={{ margin: '0', marginBottom: '16px', }}
                    rules={[ { required: true, message: 'Please select a rule', }, ]}
                  >
                    <Select placeholder="Select a Rule">
                      {
                        rules.map(rule => (<Select.Option key={rule.id} value={rule.id}>{rule.name}</Select.Option>))
                      }
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="priority"
                    style={{ margin: '0', marginBottom: '16px', }}
                    rules={[ { required: true, message: 'Please select a priority', }, ]}
                  >
                    <Select placeholder="Select a Priority">
                      { generatePriorityOptions() }
                    </Select>
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
              title="Create new Entry"
              trigger="click"
              placement="bottomRight"
              open={showCreatePopover}
              onOpenChange={setShowCreatePopover}
            >
              <Button
                icon={<PlusOutlined/>}
                disabled={loading}
              />
            </Popover>
          </Col>

          <Col>
            <Popconfirm
              title="Discard changes"
              description="Unsaved progress will be lost. Continue?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => navigate('/rule-sets')}
              onCancel={() => setShowDiscardPopover(false)}
              open={showDiscardPopover}
            >
              <Button disabled={loading} onClick={() => confirmDiscard ? setShowDiscardPopover(true) : navigate('/rule-sets')}>
                Cancel
              </Button>
            </Popconfirm>
          </Col>

          <Col>
            <Button
              type='primary'
              icon={<SaveOutlined />}
              loading={loading}
              onClick={() => saveAndReturn()}
            >
              Save & Return
            </Button>
          </Col>
        </Row>
      }
      content={
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={
            ruleSet?.entries.map((entry, index) => {
              const rule = getRuleForId(entry.ruleId);

              return {
                id: index,
                ruleId: entry.ruleId,
                ruleName: rule.name,
                priority: entry.priority,
              };
            })
          }
        />
      }
    />
  );
}
