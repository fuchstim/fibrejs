import type { Types } from '@tripwire/engine';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const client = axios.create({
  baseURL: '/api',
});

const handleError = (error: AxiosError<{ message: string }>) => {
  error.message = error.response?.data?.message ?? error.message;

  throw error;
};

const wrappedGet = async <TResult>(url: string, data: Record<string, unknown> = {}, config?: AxiosRequestConfig) => {
  const params = Object
    .entries(data)
    .filter(([ , value, ]) => value != undefined)
    .reduce(
      (acc, [ key, value, ]) => ({ ...acc, [key]: encodeURIComponent(JSON.stringify(value)), }),
      {}
    );

  const result = await client.get(url, { params, ...config, })
    .catch(handleError);

  return result.data as TResult;
};

// eslint-disable-next-line max-len
const wrappedPost = async <TPayload extends Record<string, unknown>, TResult>(url: string, data: TPayload, config?: AxiosRequestConfig) => {
  const result = await client.post(url, data, config)
    .catch(handleError);

  return result.data as TResult;
};

// eslint-disable-next-line max-len
const wrappedPatch = async <TPayload extends Record<string, unknown>, TResult>(url: string, data: TPayload, config?: AxiosRequestConfig) => {
  const result = await client.patch(url, data, config)
    .catch(handleError);

  return result.data as TResult;
};

export default {
  client,

  getNode: (nodeId: string, context?: Types.Serializer.TSerializationContext) => (
    wrappedGet<Types.Serializer.TSerializedNode>(`nodes/${nodeId}`, { context, })
  ),
  findNodes: (context?: Types.Serializer.TMultiSerializationContext) => (
    wrappedGet<Types.Serializer.TSerializedNode[]>('nodes', { context, })
  ),

  getRule: (ruleId: string) => wrappedGet<Types.Config.TRuleConfig>(`rules/${ruleId}`),
  findRules: () => wrappedGet<Types.Config.TRuleConfig[]>('rules'),
  createRule: (rule: Types.Config.TRuleConfig) => wrappedPost('rules', rule),
  updateRule: (rule: Types.Config.TRuleConfig) => wrappedPatch(`rules/${rule.id}`, rule),

  getRuleSet: (ruleId: string) => wrappedGet<Types.Config.TRuleSetConfig>(`rule-sets/${ruleId}`),
  findRuleSets: () => wrappedGet<Types.Config.TRuleSetConfig[]>('rule-sets'),
  createRuleSet: (ruleSet: Types.Config.TRuleSetConfig) => wrappedPost('rule-sets', ruleSet),
  updateRuleSet: (ruleSet: Types.Config.TRuleSetConfig) => wrappedPatch(`rule-sets/${ruleSet.id}`, ruleSet),
};
