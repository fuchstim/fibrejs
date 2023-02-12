import React, { useEffect, useState } from 'react';
import * as Types from '@tripwire/engine/dist/types';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../common/client';
import { Button, Col, Form, Popover, Popconfirm, Row, Table, notification, Select } from 'antd';
import { CaretRightOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import Page from '../../components/page';
import { AxiosError } from 'axios';

type Row = {
  id: number,
  ruleId: string,
  ruleName: string,
  severity: Types.RuleSet.ERuleSeverity
};

export default function RuleSetEditor() {
  const [ loading, setLoading, ] = useState(false);
  const [ showPopover, setShowPopover, ] = useState(false);
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

  const createEntry = ({ ruleId, severity, }: { ruleId: string, severity: Types.RuleSet.ERuleSeverity }) => {
    if (!ruleSet) { return; }

    setRuleSet({
      ...ruleSet,
      entries: [
        ...ruleSet.entries,
        { ruleId, severity, },
      ],
    });

    setShowPopover(false);
    createEntryForm.resetFields();
  };

  const deleteEntry = (index: number) => {
    if (!ruleSet) { return; }

    ruleSet.entries.splice(index, 1);

    setRuleSet({
      ...ruleSet,
      entries: [ ...ruleSet.entries, ],
    });
  };

  const getRuleForId = (ruleId: string) => {
    const rule = rules.find(rule => rule.id === ruleId);
    if (!rule) { throw new Error(`Invalid rule id: ${ruleId}`);}

    return rule;
  };

  const saveAndReturn = async () => {
    if (!ruleSet) { return; }

    setLoading(true);

    await client.updateRuleSet(ruleSet)
      .then(() => navigate('/rule-sets'))
      .catch(error => notification.error(error))
      .finally(() => setLoading(false));
  };

  const columns: ColumnsType<Row> = [
    {
      title: 'Rule ID',
      dataIndex: 'ruleId',
      key: 'ruleId',
      width: '150px',
    },
    {
      title: 'Rule Name',
      dataIndex: 'ruleName',
      key: 'ruleName',
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
    },
    {
      key: 'edit',
      width: '200px',
      render: (_, record) => (
        <Row gutter={16} justify="end">
          <Col>
            <Popconfirm
              title="Delete Entry"
              description={'Delete this entry?'}
              okText="Yes"
              cancelText="No"
              onConfirm={() => deleteEntry(record.id)}
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
                    name="severity"
                    style={{ margin: '0', marginBottom: '16px', }}
                    rules={[ { required: true, message: 'Please select a severity', }, ]}
                  >
                    <Select placeholder="Select a Severity">
                      {
                        Object.values(Types.RuleSet.ERuleSeverity)
                          .map(severity => (<Select.Option key={severity} value={severity}>{severity}</Select.Option>))
                      }
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
              open={showPopover}
              onOpenChange={setShowPopover}
            >
              <Button
                icon={<PlusOutlined/>}
                disabled={loading}
              />
            </Popover>
          </Col>

          <Col>
            <Button
              icon={<CaretRightOutlined/>}
              disabled={loading}
              // onClick={() => setShowExecutionDrawer(true)}
            />
          </Col>

          <Col>
            <Popconfirm
              title="Discard changes"
              description="Unsaved progress will be lost. Continue?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => navigate('/rule-sets')}
            >
              <Button disabled={loading}>
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
                severity: entry.severity,
              };
            })
          }
        />
      }
    />
  );
}
