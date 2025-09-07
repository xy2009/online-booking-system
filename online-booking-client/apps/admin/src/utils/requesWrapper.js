import { APP_CONFIG, HTTP_RES_CODES, API_ENDPOINTS } from '../constants';
import { randomString } from './stringUtil';
import { authStore } from '../stores/authStore';
import { ERROR_MESSAGE_KEYS } from '../constants';

/**
 * fetch 封装, 无需认证头
 * @param {*} url 
 * @param {*} options 
 * @returns 
 */
export const publicFetchWrapper = async(url, body, method = 'post', options = {}) => {
    // console.log('Fetch request:', url, body, method, options);
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'client-id': APP_CONFIG.APP_CLIENT_ID,
    'requested-id': randomString(20),
    'requested-at': new Date().toISOString(),
  };
  options.headers = { 
    ...defaultHeaders,
    ...(options.headers || {})
  };
  options.body = body ? JSON.stringify(body) : null;
  options.method = method;

  
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    const isGql = url === API_ENDPOINTS.GRAPHQL;
    const formatData = {
      ok: response.ok,
      success: data.code === HTTP_RES_CODES.SUCCESS || (response.status === HTTP_RES_CODES.SUCCESS && !!data.data),
      code: data?.errorCode || data.code || response.status,
      message: data?.message || data?.errorMessage || '',
      data: data?.data || data || {},
    };
    data.errorCode && (formatData.errorCode = data.errorCode);
    if (isGql) {
      // console.log('GraphQL Fetch response:', data);
      const { errors } = data;
      if (errors && errors.length > 0) {
        // console.error('GraphQL Errors:', errors);
        formatData.data = null;
        formatData.errors = errors;
        formatData.success = false;
        formatData.message = errors.map(err => err.message).join('; ');
        formatData.code = formatData.code || errors[0]?.extensions?.code || 'GQL ERROR';
        // console.error('GraphQL Fetch formatted response with errors:', formatData);
      }
    } else {
      // console.log('REST Fetch response:', data);
    }
    if (formatData.message) {
      const knownErrorKey = Object.keys(ERROR_MESSAGE_KEYS).find(key => formatData.message.includes(key));
      if (knownErrorKey) {
        formatData.message = ERROR_MESSAGE_KEYS[knownErrorKey];
      }
    }

    return formatData;
  } catch (error) {
    return {
      ok: false,
      code: error.errorCode || error.code || 0,
      data: {},
      error,
    };
  }
}

/**
 * fetch 封装，自动添加认证头
 * @param {*} url 
 * @param {*} body 
 * @param {*} method 
 * @param {*} options 
 * @returns 
 */
export const fetchWrapper = async(url, body, method = 'post', options = {}) => {
  const defaultHeaders = authStore.getAuthHeaders();
  options.headers = { 
    ...defaultHeaders,
    ...(options.headers || {})
  };

  return publicFetchWrapper(url, body, method, options);
}

/**
 * graphQL fetch 封装
 * @param {*} query 
 * @param {*} variables 
 * @param {*} options 
 * @returns 
 */
export const graphQLFetchWrapper = async (query, variables = {}, options = {}) => {
  return fetchWrapper(API_ENDPOINTS.GRAPHQL, {
    query,
    variables
  }, 'post', options);
}