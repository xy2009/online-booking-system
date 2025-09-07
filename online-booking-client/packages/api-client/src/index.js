import { DEFAULT_CONFIG } from '../../../apps/admin/src/constants/index.js';

// REST API exports
export { apiClient } from './rest/base.js';
export { authAPI } from './rest/auth.js';

// GraphQL exports
export { graphqlClient, query, mutation, getClientId, setClientId } from './graphql/client.js';

// GraphQL queries
export * from './graphql/queries/branch.js';
export * from './graphql/queries/booking.js';
export * from './graphql/queries/table.js';

// GraphQL mutations
export * from './graphql/mutations/booking.js';
export * from './graphql/mutations/branch.js';
export * from './graphql/mutations/table.js';

// Types and constants
export const BookingStatus = {
  // PENDING: 'PENDING',
  // CONFIRMED: 'CONFIRMED',
  // CANCELLED: 'CANCELLED',
  // COMPLETED: 'COMPLETED',
  // NO_SHOW: 'NO_SHOW'
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show'
};

export const BranchStatus = {
  // ACTIVE: 'ACTIVE',
  // INACTIVE: 'INACTIVE',
  // MAINTENANCE: 'MAINTENANCE'
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted'
};


export const TableStatus = {
  // AVAILABLE: 'AVAILABLE',
  // OCCUPIED: 'OCCUPIED',
  // RESERVED: 'RESERVED',
  // MAINTENANCE: 'MAINTENANCE'
  FREE: 'free',
  RESERVED: 'reserved',
  BOOKED: 'booked',
  CONFIRMED: 'confirmed',
  OCCUPIED: 'occupied',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  UNAVAILABLE: 'unavailable'
};
