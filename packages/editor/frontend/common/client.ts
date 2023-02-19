import type { Types } from '@fibrejs/engine';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { TAuthenticatedUser, TConfig, TPreviewRuleServicePayload } from '../../src/types';

let CACHED_CONFIG: TConfig | null = null;
const CLIENT = axios.create();

const getConfig = async () => {
  if (CACHED_CONFIG !== null) {
    return CACHED_CONFIG;
  }

  const config = await wrappedGet<TConfig>('config')
    .catch(e => {
      throw new Error(`Failed to fetch config: ${e.message}`);
    });

  CACHED_CONFIG = config;

  CLIENT.defaults.baseURL = config.apiBasePath;

  window.document.title = `${config.name} Admin Dashboard`;

  return config;
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

  const result = await CLIENT.get(url, { params, ...config, })
    .catch(handleError);

  return result.data as TResult;
};

// eslint-disable-next-line max-len
const wrappedPost = async <TPayload, TResult>(url: string, data: TPayload, config?: AxiosRequestConfig) => {
  const result = await CLIENT.post(url, data, config)
    .catch(handleError);

  return result.data as TResult;
};

// eslint-disable-next-line max-len
const wrappedPatch = async <TPayload, TResult>(url: string, data: TPayload, config?: AxiosRequestConfig) => {
  const result = await CLIENT.patch(url, data, config)
    .catch(handleError);

  return result.data as TResult;
};

const wrappedDelete = async <TResult>(url: string, config?: AxiosRequestConfig) => {
  const result = await CLIENT.delete(url, config)
    .catch(handleError);

  return result.data as TResult;
};

export default {
  client: CLIENT,
  getConfig,

  getUser: () => wrappedGet<TAuthenticatedUser>('user'),

  getNode: (nodeId: string, context?: Types.Serializer.TSerializationContext) => wrappedGet<Types.Serializer.TSerializedNode>(`nodes/${nodeId}`, { context, }),
  batchGetNode: (context: Record<string, { nodeId: string, context: Types.Serializer.TSerializationContext}>) => wrappedGet<Record<string, Types.Serializer.TSerializedNode>>('nodes', { context, batchGet: true, }),
  findNodes: (context?: Types.Serializer.TSerializationContext) => wrappedGet<Types.Serializer.TSerializedNode[]>('nodes', { context, batchGet: false, }),

  getRule: (ruleId: string) => wrappedGet<Types.Config.TRuleConfig>(`rules/${ruleId}`),
  findRules: () => wrappedGet<Types.Config.TRuleConfig[]>('rules'),
  createRule: (rule: Omit<Types.Config.TRuleConfig, 'id'>) => wrappedPost<Omit<Types.Config.TRuleConfig, 'id'>, Types.Config.TRuleConfig>('rules', rule),
  updateRule: (rule: Types.Config.TRuleConfig) => wrappedPatch<Types.Config.TRuleConfig, Types.Config.TRuleConfig>(`rules/${rule.id}`, rule),
  deleteRule: (ruleId: string) => wrappedDelete<Types.Config.TRuleConfig>(`rules/${ruleId}`),
  validateRule: (config: Types.Config.TRuleConfig) => wrappedPost<Types.Config.TRuleConfig, { valid: boolean }>('rules/validate', config),
  previewRule: (payload: TPreviewRuleServicePayload) => wrappedPost<TPreviewRuleServicePayload, Types.Common.TExecutorResult<Types.Rule.TRuleInputs, Types.Rule.TRuleOutputs>>('rules/preview', payload),

  getRuleSet: (ruleId: string) => wrappedGet<Types.Config.TRuleSetConfig>(`rule-sets/${ruleId}`),
  findRuleSets: () => wrappedGet<Types.Config.TRuleSetConfig[]>('rule-sets'),
  createRuleSet: (ruleSet: Omit<Types.Config.TRuleSetConfig, 'id'>) => wrappedPost<Omit<Types.Config.TRuleSetConfig, 'id'>, Types.Config.TRuleSetConfig>('rule-sets', ruleSet),
  updateRuleSet: (ruleSet: Types.Config.TRuleSetConfig) => wrappedPatch<Types.Config.TRuleSetConfig, Types.Config.TRuleSetConfig>(`rule-sets/${ruleSet.id}`, ruleSet),
  deleteRuleSet: (ruleSetId: string) => wrappedDelete<Types.Config.TRuleSetConfig>(`rule-sets/${ruleSetId}`),
  validateRuleSet: (config: Types.Config.TRuleSetConfig) => wrappedPost<Types.Config.TRuleSetConfig, { valid: boolean }>('rule-sets/validate', config),
};
