import path from 'path';
import type { Types } from '@tripwire/engine';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { TAuthenticatedUser, TPreviewRuleServicePayload } from '../../src/types';

const client = axios.create({
  baseURL: '/api',
});

const updateBasePath = async () => {
  const result = await axios.get<{ basePath: string }>('base-path');

  const basePath = result?.data?.basePath;
  if (!basePath) { throw new Error('Failed to fetch base path');}

  client.defaults.baseURL = path.join(basePath, 'api');

  return basePath;
};

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
const wrappedPost = async <TPayload, TResult>(url: string, data: TPayload, config?: AxiosRequestConfig) => {
  const result = await client.post(url, data, config)
    .catch(handleError);

  return result.data as TResult;
};

// eslint-disable-next-line max-len
const wrappedPatch = async <TPayload, TResult>(url: string, data: TPayload, config?: AxiosRequestConfig) => {
  const result = await client.patch(url, data, config)
    .catch(handleError);

  return result.data as TResult;
};

const wrappedDelete = async <TResult>(url: string, config?: AxiosRequestConfig) => {
  const result = await client.delete(url, config)
    .catch(handleError);

  return result.data as TResult;
};

export default {
  client,
  updateBasePath,

  getUser: () => wrappedGet<TAuthenticatedUser>('user'),

  getNode: (nodeId: string, context?: Types.Serializer.TSerializationContext) => wrappedGet<Types.Serializer.TSerializedNode>(`nodes/${nodeId}`, { context, }),
  findNodes: (context?: Types.Serializer.TMultiSerializationContext) => wrappedGet<Types.Serializer.TSerializedNode[]>('nodes', { context, }),

  getRule: (ruleId: string) => wrappedGet<Types.Config.TRuleConfig>(`rules/${ruleId}`),
  findRules: () => wrappedGet<Types.Config.TRuleConfig[]>('rules'),
  createRule: (rule: Omit<Types.Config.TRuleConfig, 'id'>) => wrappedPost<Omit<Types.Config.TRuleConfig, 'id'>, Types.Config.TRuleConfig>('rules', rule),
  updateRule: (rule: Types.Config.TRuleConfig) => wrappedPatch<Types.Config.TRuleConfig, Types.Config.TRuleConfig>(`rules/${rule.id}`, rule),
  deleteRule: (ruleId: string) => wrappedDelete<Types.Config.TRuleConfig>(`rules/${ruleId}`),
  validateRuleConfig: (config: Types.Config.TRuleConfig) => wrappedPost<Types.Config.TRuleConfig, { valid: boolean }>('rules/validate', config),
  previewRule: (payload: TPreviewRuleServicePayload) => wrappedPost<TPreviewRuleServicePayload, Types.Common.TExecutorResult<Types.Rule.TRuleOutputs>>('rules/preview', payload),

  getRuleSet: (ruleId: string) => wrappedGet<Types.Config.TRuleSetConfig>(`rule-sets/${ruleId}`),
  findRuleSets: () => wrappedGet<Types.Config.TRuleSetConfig[]>('rule-sets'),
  createRuleSet: (ruleSet: Omit<Types.Config.TRuleSetConfig, 'id'>) => wrappedPost<Omit<Types.Config.TRuleSetConfig, 'id'>, Types.Config.TRuleSetConfig>('rule-sets', ruleSet),
  updateRuleSet: (ruleSet: Types.Config.TRuleSetConfig) => wrappedPatch<Types.Config.TRuleSetConfig, Types.Config.TRuleSetConfig>(`rule-sets/${ruleSet.id}`, ruleSet),
  deleteRuleSet: (ruleSetId: string) => wrappedDelete<Types.Config.TRuleSetConfig>(`rule-sets/${ruleSetId}`),
};
