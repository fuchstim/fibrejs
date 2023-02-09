import { Types } from '@tripwire/engine';
import axios, { AxiosRequestConfig } from 'axios';

const client = axios.create({
  baseURL: '/api',
});

const wrappedGet = <T>(url: string, config?: AxiosRequestConfig) => client.get(url, config).then(r => r.data as T);

export default {
  client,

  getNode: (nodeId: string) => wrappedGet<Types.Serializer.TSerializedNode>(`nodes/${nodeId}`),
  findNodes: () => wrappedGet<Types.Serializer.TSerializedNode[]>('nodes'),

  getRule: (ruleId: string) => wrappedGet<Types.Config.TRuleConfig>(`rules/${ruleId}`),
  findRules: () => wrappedGet<Types.Config.TRuleConfig[]>('rules'),

  getRuleSet: (ruleId: string) => wrappedGet<Types.Config.TRuleSetConfig>(`rulesets/${ruleId}`),
  findRuleSets: () => wrappedGet<Types.Config.TRuleSetConfig>('rulesets'),
};
