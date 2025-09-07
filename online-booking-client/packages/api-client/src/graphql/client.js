import { createClient, cacheExchange, fetchExchange } from '@urql/core';


// 引入获取认证配置的函数, 此依赖于共享模块，如果报错，需要做 npm install, 以实现连接
import { getAuthConfig } from '@booking/shared-utils';

const GRAPHQL_URL = 'http://192.168.31.85:3030/graphql';

export const graphqlClient = createClient({
  url: GRAPHQL_URL,
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
  const { tokenKey } = getAuthConfig();
  const token = localStorage.getItem(tokenKey);
  const clientId = getClientId();
  // console.log('tokenKey:', tokenKey);
  // console.log('Using Client ID:', clientId);
    return {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
        'client-id': clientId || '',
      },
    };
  },
});

// GraphQL查询和变更的辅助函数
export const query = async (queryString, variables = {}) => {
  const result = await graphqlClient.query(queryString, variables).toPromise();
  
  if (result.error) {
    console.error('GraphQL查询错误:', result.error);
    throw new Error(result.error.message);
  }
  
  return result.data;
};

export const mutation = async (mutationString, variables = {}) => {
  const result = await graphqlClient.mutation(mutationString, variables).toPromise();
  
  if (result.error) {
    console.error('GraphQL变更错误:', result.error);
    throw new Error(result.error.message);
  }
  
  return result.data;
};

// 确保客户端ID只设置一次
let _clientId = '';
let _initialized = false;

export const setClientId = (id) => {
  if (_initialized) return;
  _clientId = id;
  _initialized = true;
};

// 获取客户端ID
export const getClientId = () => _clientId;