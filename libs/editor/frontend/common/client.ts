import type { Types } from '@tripwire/engine';
import axios, { AxiosRequestConfig } from 'axios';

const client = axios.create({
  baseURL: '/api',
});

const wrappedGet = async <T>(url: string, data: object = {}, config?: AxiosRequestConfig) => {
  const params = Object
    .entries(data)
    .filter(([ , value, ]) => value != undefined)
    .reduce(
      (acc, [ key, value, ]) => ({ ...acc, [key]: encodeURIComponent(JSON.stringify(value)), }),
      {}
    );

  const result = await client.get(url, { params, ...config, });

  return result.data as T;
};

export default {
  client,

  getNode: (nodeId: string, nodeOptions?: Types.Node.TNodeOptions) => (
    wrappedGet<Types.Serializer.TSerializedNode>(`nodes/${nodeId}`, { nodeOptions, })
  ),
  findNodes: (nodeOptions?: Record<string, Types.Node.TNodeOptions>) => (
    wrappedGet<Types.Serializer.TSerializedNode[]>('nodes', { nodeOptions, })
  ),

  getRule: (ruleId: string) => (
    wrappedGet<Types.Config.TRuleConfig>(`rules/${ruleId}`)
  ),
  findRules: () => (
    wrappedGet<Types.Config.TRuleConfig[]>('rules')
  ),

  getRuleSet: (ruleId: string) => (
    wrappedGet<Types.Config.TRuleSetConfig>(`rulesets/${ruleId}`)
  ),
  findRuleSets: () => (
    wrappedGet<Types.Config.TRuleSetConfig[]>('rulesets')
  ),
};
