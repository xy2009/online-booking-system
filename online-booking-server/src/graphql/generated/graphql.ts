import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Account = {
  __typename?: 'Account';
  createdAt: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  issuer?: Maybe<Scalars['String']['output']>;
  lastLogin?: Maybe<Scalars['Float']['output']>;
  mobile: Scalars['String']['output'];
  role: Role;
  status: AccountStatus;
  updatedAt: Scalars['Float']['output'];
  userId?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

export type AccountFilter = {
  createdFrom?: InputMaybe<Scalars['Float']['input']>;
  createdTo?: InputMaybe<Scalars['Float']['input']>;
  mobile?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Role>;
  status?: InputMaybe<AccountStatus>;
};

export type AccountInput = {
  mobile: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role?: InputMaybe<Role>;
  status?: InputMaybe<AccountStatus>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type AccountPage = {
  __typename?: 'AccountPage';
  items: Array<Account>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum AccountStatus {
  Active = 'active',
  Banned = 'banned',
  Deleted = 'deleted',
  Inactive = 'inactive'
}

export type AccountUpdateInput = {
  password?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<AccountStatus>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type Booking = {
  __typename?: 'Booking';
  bookingTime: Scalars['Float']['output'];
  bookingType?: Maybe<BookingType>;
  branchId: Scalars['ID']['output'];
  connectName?: Maybe<Scalars['String']['output']>;
  connectPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  isDeleted?: Maybe<Scalars['Boolean']['output']>;
  maintenanceLogs?: Maybe<Array<BookingMaintenance>>;
  numberOfPeople: Scalars['Int']['output'];
  specialRequests?: Maybe<Scalars['String']['output']>;
  status: BookingStatus;
  tableId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['Float']['output'];
  userId: Scalars['ID']['output'];
};

export enum BookingAction {
  Cancel = 'cancel',
  Complete = 'complete',
  Confirm = 'confirm',
  Create = 'create',
  NoShow = 'no_show',
  Update = 'update'
}

export type BookingFilter = {
  bookingTimeFrom?: InputMaybe<Scalars['String']['input']>;
  bookingTimeTo?: InputMaybe<Scalars['String']['input']>;
  isDeleted?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<BookingStatus>;
  tableId?: InputMaybe<Scalars['ID']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type BookingInput = {
  bookingTime: Scalars['Float']['input'];
  bookingType?: InputMaybe<BookingType>;
  branchId: Scalars['ID']['input'];
  connectName?: InputMaybe<Scalars['String']['input']>;
  connectPhone?: InputMaybe<Scalars['String']['input']>;
  numberOfPeople: Scalars['Int']['input'];
  specialRequests?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<BookingStatus>;
  tableId?: InputMaybe<Scalars['ID']['input']>;
  userId: Scalars['ID']['input'];
};

export type BookingMaintenance = {
  __typename?: 'BookingMaintenance';
  action: BookingAction;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  performedAt: Scalars['String']['output'];
  performedBy: Scalars['String']['output'];
};

export type BookingPage = {
  __typename?: 'BookingPage';
  items: Array<Booking>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum BookingStatus {
  Cancelled = 'cancelled',
  Completed = 'completed',
  Confirmed = 'confirmed',
  NoShow = 'no_show',
  Pending = 'pending'
}

export enum BookingType {
  InPerson = 'in_person',
  Online = 'online',
  Phone = 'phone'
}

export type BookingUpdateInput = {
  bookingTime?: InputMaybe<Scalars['Float']['input']>;
  connectName?: InputMaybe<Scalars['String']['input']>;
  connectPhone?: InputMaybe<Scalars['String']['input']>;
  isDeleted?: InputMaybe<Scalars['Boolean']['input']>;
  numberOfPeople?: InputMaybe<Scalars['Int']['input']>;
  specialRequests?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<BookingStatus>;
  tableId?: InputMaybe<Scalars['ID']['input']>;
};

export type Branch = {
  __typename?: 'Branch';
  address: Scalars['String']['output'];
  closeTime: Scalars['String']['output'];
  contactName: Scalars['String']['output'];
  contactNumber: Scalars['String']['output'];
  createdAt: Scalars['Float']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  maintenanceLogs?: Maybe<Array<BranchMaintenance>>;
  name: Scalars['String']['output'];
  openTime: Scalars['String']['output'];
  status: BranchStatus;
  updatedAt: Scalars['Float']['output'];
};

export type BranchFilterInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<BranchStatus>;
};

export type BranchMaintenance = {
  __typename?: 'BranchMaintenance';
  accountId: Scalars['String']['output'];
  backUp: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  performedAt: Scalars['Float']['output'];
};

export type BranchPage = {
  __typename?: 'BranchPage';
  items: Array<Branch>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum BranchStatus {
  Active = 'active',
  Deleted = 'deleted',
  Inactive = 'inactive'
}

export type CreateBranchInput = {
  address: Scalars['String']['input'];
  closeTime: Scalars['String']['input'];
  contactName: Scalars['String']['input'];
  contactNumber: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  openTime: Scalars['String']['input'];
  status?: InputMaybe<BranchStatus>;
};

export type CreateTableInput = {
  branchId: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<TableLocation>;
  maxSize?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  size: Scalars['Int']['input'];
  status?: InputMaybe<TableStatus>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  turntableCycle: Scalars['Int']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createAccount: Account;
  createBooking: Booking;
  createBranch: Branch;
  createProfile: Profile;
  createSysConfig: SysConfig;
  createSysStaff: SysStaff;
  createTable: Table;
  deleteAccount: Scalars['Boolean']['output'];
  deleteBooking: Scalars['Boolean']['output'];
  deleteBranch: Scalars['Boolean']['output'];
  deleteProfile: Scalars['Boolean']['output'];
  deleteSysConfig: Scalars['Boolean']['output'];
  deleteSysStaff: Scalars['Boolean']['output'];
  deleteTable: Scalars['Boolean']['output'];
  updateAccount: Account;
  updateBooking: Booking;
  updateBranch: Branch;
  updateProfile: Profile;
  updateSysConfig: SysConfig;
  updateSysStaff: SysStaff;
  updateTable: Table;
};


export type MutationCreateAccountArgs = {
  input: AccountInput;
};


export type MutationCreateBookingArgs = {
  input: BookingInput;
};


export type MutationCreateBranchArgs = {
  input: CreateBranchInput;
};


export type MutationCreateProfileArgs = {
  input: ProfileInput;
};


export type MutationCreateSysConfigArgs = {
  input: SysConfigInput;
};


export type MutationCreateSysStaffArgs = {
  input: SysStaffInput;
};


export type MutationCreateTableArgs = {
  input: CreateTableInput;
};


export type MutationDeleteAccountArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteBookingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteBranchArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProfileArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSysConfigArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSysStaffArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTableArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateAccountArgs = {
  id: Scalars['ID']['input'];
  input: AccountUpdateInput;
};


export type MutationUpdateBookingArgs = {
  id: Scalars['ID']['input'];
  input: BookingUpdateInput;
};


export type MutationUpdateBranchArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBranchInput;
};


export type MutationUpdateProfileArgs = {
  id: Scalars['ID']['input'];
  input: ProfileUpdateInput;
};


export type MutationUpdateSysConfigArgs = {
  id: Scalars['ID']['input'];
  input: SysConfigUpdateInput;
};


export type MutationUpdateSysStaffArgs = {
  id: Scalars['ID']['input'];
  input: SysStaffUpdateInput;
};


export type MutationUpdateTableArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTableInput;
};

export type PaginationInput = {
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
};

export type Profile = {
  __typename?: 'Profile';
  accountId: Scalars['ID']['output'];
  avatarUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  nickName: Scalars['String']['output'];
  updatedAt: Scalars['Float']['output'];
};

export type ProfileFilter = {
  accountId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type ProfileInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  nickName: Scalars['String']['input'];
};

export type ProfilePage = {
  __typename?: 'ProfilePage';
  items: Array<Profile>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type ProfileUpdateInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  nickName?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  accounts: AccountPage;
  availableTables?: Maybe<TablePage>;
  booking?: Maybe<Booking>;
  bookings: BookingPage;
  branch?: Maybe<Branch>;
  branches: BranchPage;
  profile?: Maybe<Profile>;
  profiles: ProfilePage;
  sysConfig?: Maybe<SysConfig>;
  sysConfigs: SysConfigPage;
  sysStaff?: Maybe<SysStaff>;
  sysStaffs: SysStaffPage;
  table?: Maybe<Table>;
  tables?: Maybe<TablePage>;
};


export type QueryAccountArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAccountsArgs = {
  filter?: InputMaybe<AccountFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAvailableTablesArgs = {
  filter?: InputMaybe<TableBookingFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryBookingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBookingsArgs = {
  filter?: InputMaybe<BookingFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryBranchArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBranchesArgs = {
  filter?: InputMaybe<BranchFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryProfileArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProfilesArgs = {
  filter?: InputMaybe<ProfileFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QuerySysConfigArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySysConfigsArgs = {
  filter?: InputMaybe<SysConfigFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QuerySysStaffArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySysStaffsArgs = {
  filter?: InputMaybe<SysStaffFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryTableArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTablesArgs = {
  filter?: InputMaybe<TableFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
};

export enum Role {
  Admin = 'admin',
  Customer = 'customer',
  Staff = 'staff'
}

export enum Sex {
  Female = 'female',
  Male = 'male'
}

export type SysConfig = {
  __typename?: 'SysConfig';
  configType: SysConfigType;
  createdAt: Scalars['Float']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  updatedAt: Scalars['Float']['output'];
  value: Scalars['String']['output'];
};

export type SysConfigFilter = {
  configType?: InputMaybe<SysConfigType>;
  key?: InputMaybe<Scalars['String']['input']>;
};

export type SysConfigInput = {
  configType: SysConfigType;
  description?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type SysConfigPage = {
  __typename?: 'SysConfigPage';
  items: Array<SysConfig>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum SysConfigType {
  Notification = 'notification',
  Other = 'other',
  Payment = 'payment',
  System = 'system'
}

export type SysConfigUpdateInput = {
  configType?: InputMaybe<SysConfigType>;
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type SysStaff = {
  __typename?: 'SysStaff';
  accountId: Scalars['ID']['output'];
  branchId: Scalars['ID']['output'];
  contactNumber?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Float']['output'];
  email?: Maybe<Scalars['String']['output']>;
  hireDate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  position: Scalars['String']['output'];
  sex: Sex;
  status: SysStaffStatus;
  terminationDate?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Float']['output'];
};

export type SysStaffFilter = {
  hireDateFrom?: InputMaybe<Scalars['String']['input']>;
  hireDateTo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<SysStaffStatus>;
};

export type SysStaffInput = {
  contactNumber?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  hireDate: Scalars['String']['input'];
  name: Scalars['String']['input'];
  position: Scalars['String']['input'];
  status?: InputMaybe<SysStaffStatus>;
};

export type SysStaffPage = {
  __typename?: 'SysStaffPage';
  items: Array<SysStaff>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum SysStaffStatus {
  Active = 'active',
  Inactive = 'inactive',
  OnLeave = 'on_leave',
  Terminated = 'terminated'
}

export type SysStaffUpdateInput = {
  contactNumber?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<SysStaffStatus>;
};

export type Table = {
  __typename?: 'Table';
  branchId: Scalars['String']['output'];
  createdAt: Scalars['Float']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastCleanedAt?: Maybe<Scalars['Float']['output']>;
  lastOccupiedAt?: Maybe<Scalars['Float']['output']>;
  location?: Maybe<TableLocation>;
  maxSize?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  size: Scalars['Int']['output'];
  status: TableStatus;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  turntableCycle?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['Float']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type TableBookingFilterInput = {
  branchId: Scalars['String']['input'];
  location?: InputMaybe<TableLocation>;
  maxSize?: InputMaybe<Scalars['Int']['input']>;
  minSize?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  startTime: Scalars['Float']['input'];
};

export type TableFilterInput = {
  branchId?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<TableLocation>;
  maxSize?: InputMaybe<Scalars['Int']['input']>;
  minSize?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<TableStatus>;
};

export enum TableLocation {
  Indoor = 'indoor',
  Outdoor = 'outdoor',
  Private = 'private'
}

export type TablePage = {
  __typename?: 'TablePage';
  items: Array<Table>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum TableStatus {
  Booked = 'booked',
  Cleaning = 'cleaning',
  Confirmed = 'confirmed',
  Free = 'free',
  Maintenance = 'maintenance',
  Occupied = 'occupied',
  Reserved = 'reserved',
  Unavailable = 'unavailable'
}

export type UpdateBranchInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  closeTime?: InputMaybe<Scalars['String']['input']>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactNumber?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  openTime?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<BranchStatus>;
};

export type UpdateTableInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<TableLocation>;
  maxSize?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<TableStatus>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  turntableCycle: Scalars['Int']['input'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Account: ResolverTypeWrapper<Account>;
  AccountFilter: AccountFilter;
  AccountInput: AccountInput;
  AccountPage: ResolverTypeWrapper<AccountPage>;
  AccountStatus: AccountStatus;
  AccountUpdateInput: AccountUpdateInput;
  Booking: ResolverTypeWrapper<Booking>;
  BookingAction: BookingAction;
  BookingFilter: BookingFilter;
  BookingInput: BookingInput;
  BookingMaintenance: ResolverTypeWrapper<BookingMaintenance>;
  BookingPage: ResolverTypeWrapper<BookingPage>;
  BookingStatus: BookingStatus;
  BookingType: BookingType;
  BookingUpdateInput: BookingUpdateInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Branch: ResolverTypeWrapper<Branch>;
  BranchFilterInput: BranchFilterInput;
  BranchMaintenance: ResolverTypeWrapper<BranchMaintenance>;
  BranchPage: ResolverTypeWrapper<BranchPage>;
  BranchStatus: BranchStatus;
  CreateBranchInput: CreateBranchInput;
  CreateTableInput: CreateTableInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  PaginationInput: PaginationInput;
  Profile: ResolverTypeWrapper<Profile>;
  ProfileFilter: ProfileFilter;
  ProfileInput: ProfileInput;
  ProfilePage: ResolverTypeWrapper<ProfilePage>;
  ProfileUpdateInput: ProfileUpdateInput;
  Query: ResolverTypeWrapper<{}>;
  Role: Role;
  Sex: Sex;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SysConfig: ResolverTypeWrapper<SysConfig>;
  SysConfigFilter: SysConfigFilter;
  SysConfigInput: SysConfigInput;
  SysConfigPage: ResolverTypeWrapper<SysConfigPage>;
  SysConfigType: SysConfigType;
  SysConfigUpdateInput: SysConfigUpdateInput;
  SysStaff: ResolverTypeWrapper<SysStaff>;
  SysStaffFilter: SysStaffFilter;
  SysStaffInput: SysStaffInput;
  SysStaffPage: ResolverTypeWrapper<SysStaffPage>;
  SysStaffStatus: SysStaffStatus;
  SysStaffUpdateInput: SysStaffUpdateInput;
  Table: ResolverTypeWrapper<Table>;
  TableBookingFilterInput: TableBookingFilterInput;
  TableFilterInput: TableFilterInput;
  TableLocation: TableLocation;
  TablePage: ResolverTypeWrapper<TablePage>;
  TableStatus: TableStatus;
  UpdateBranchInput: UpdateBranchInput;
  UpdateTableInput: UpdateTableInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Account: Account;
  AccountFilter: AccountFilter;
  AccountInput: AccountInput;
  AccountPage: AccountPage;
  AccountUpdateInput: AccountUpdateInput;
  Booking: Booking;
  BookingFilter: BookingFilter;
  BookingInput: BookingInput;
  BookingMaintenance: BookingMaintenance;
  BookingPage: BookingPage;
  BookingUpdateInput: BookingUpdateInput;
  Boolean: Scalars['Boolean']['output'];
  Branch: Branch;
  BranchFilterInput: BranchFilterInput;
  BranchMaintenance: BranchMaintenance;
  BranchPage: BranchPage;
  CreateBranchInput: CreateBranchInput;
  CreateTableInput: CreateTableInput;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  PaginationInput: PaginationInput;
  Profile: Profile;
  ProfileFilter: ProfileFilter;
  ProfileInput: ProfileInput;
  ProfilePage: ProfilePage;
  ProfileUpdateInput: ProfileUpdateInput;
  Query: {};
  String: Scalars['String']['output'];
  SysConfig: SysConfig;
  SysConfigFilter: SysConfigFilter;
  SysConfigInput: SysConfigInput;
  SysConfigPage: SysConfigPage;
  SysConfigUpdateInput: SysConfigUpdateInput;
  SysStaff: SysStaff;
  SysStaffFilter: SysStaffFilter;
  SysStaffInput: SysStaffInput;
  SysStaffPage: SysStaffPage;
  SysStaffUpdateInput: SysStaffUpdateInput;
  Table: Table;
  TableBookingFilterInput: TableBookingFilterInput;
  TableFilterInput: TableFilterInput;
  TablePage: TablePage;
  UpdateBranchInput: UpdateBranchInput;
  UpdateTableInput: UpdateTableInput;
};

export type AccountResolvers<ContextType = any, ParentType extends ResolversParentTypes['Account'] = ResolversParentTypes['Account']> = {
  createdAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  issuer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastLogin?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  mobile?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AccountStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AccountPageResolvers<ContextType = any, ParentType extends ResolversParentTypes['AccountPage'] = ResolversParentTypes['AccountPage']> = {
  items?: Resolver<Array<ResolversTypes['Account']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BookingResolvers<ContextType = any, ParentType extends ResolversParentTypes['Booking'] = ResolversParentTypes['Booking']> = {
  bookingTime?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  bookingType?: Resolver<Maybe<ResolversTypes['BookingType']>, ParentType, ContextType>;
  branchId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  connectName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  connectPhone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isDeleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  maintenanceLogs?: Resolver<Maybe<Array<ResolversTypes['BookingMaintenance']>>, ParentType, ContextType>;
  numberOfPeople?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  specialRequests?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['BookingStatus'], ParentType, ContextType>;
  tableId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BookingMaintenanceResolvers<ContextType = any, ParentType extends ResolversParentTypes['BookingMaintenance'] = ResolversParentTypes['BookingMaintenance']> = {
  action?: Resolver<ResolversTypes['BookingAction'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  performedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  performedBy?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BookingPageResolvers<ContextType = any, ParentType extends ResolversParentTypes['BookingPage'] = ResolversParentTypes['BookingPage']> = {
  items?: Resolver<Array<ResolversTypes['Booking']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BranchResolvers<ContextType = any, ParentType extends ResolversParentTypes['Branch'] = ResolversParentTypes['Branch']> = {
  address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  closeTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contactName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contactNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  maintenanceLogs?: Resolver<Maybe<Array<ResolversTypes['BranchMaintenance']>>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  openTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['BranchStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BranchMaintenanceResolvers<ContextType = any, ParentType extends ResolversParentTypes['BranchMaintenance'] = ResolversParentTypes['BranchMaintenance']> = {
  accountId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  backUp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  performedAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BranchPageResolvers<ContextType = any, ParentType extends ResolversParentTypes['BranchPage'] = ResolversParentTypes['BranchPage']> = {
  items?: Resolver<Array<ResolversTypes['Branch']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createAccount?: Resolver<ResolversTypes['Account'], ParentType, ContextType, RequireFields<MutationCreateAccountArgs, 'input'>>;
  createBooking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationCreateBookingArgs, 'input'>>;
  createBranch?: Resolver<ResolversTypes['Branch'], ParentType, ContextType, RequireFields<MutationCreateBranchArgs, 'input'>>;
  createProfile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType, RequireFields<MutationCreateProfileArgs, 'input'>>;
  createSysConfig?: Resolver<ResolversTypes['SysConfig'], ParentType, ContextType, RequireFields<MutationCreateSysConfigArgs, 'input'>>;
  createSysStaff?: Resolver<ResolversTypes['SysStaff'], ParentType, ContextType, RequireFields<MutationCreateSysStaffArgs, 'input'>>;
  createTable?: Resolver<ResolversTypes['Table'], ParentType, ContextType, RequireFields<MutationCreateTableArgs, 'input'>>;
  deleteAccount?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteAccountArgs, 'id'>>;
  deleteBooking?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteBookingArgs, 'id'>>;
  deleteBranch?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteBranchArgs, 'id'>>;
  deleteProfile?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteProfileArgs, 'id'>>;
  deleteSysConfig?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteSysConfigArgs, 'id'>>;
  deleteSysStaff?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteSysStaffArgs, 'id'>>;
  deleteTable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTableArgs, 'id'>>;
  updateAccount?: Resolver<ResolversTypes['Account'], ParentType, ContextType, RequireFields<MutationUpdateAccountArgs, 'id' | 'input'>>;
  updateBooking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationUpdateBookingArgs, 'id' | 'input'>>;
  updateBranch?: Resolver<ResolversTypes['Branch'], ParentType, ContextType, RequireFields<MutationUpdateBranchArgs, 'id' | 'input'>>;
  updateProfile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType, RequireFields<MutationUpdateProfileArgs, 'id' | 'input'>>;
  updateSysConfig?: Resolver<ResolversTypes['SysConfig'], ParentType, ContextType, RequireFields<MutationUpdateSysConfigArgs, 'id' | 'input'>>;
  updateSysStaff?: Resolver<ResolversTypes['SysStaff'], ParentType, ContextType, RequireFields<MutationUpdateSysStaffArgs, 'id' | 'input'>>;
  updateTable?: Resolver<ResolversTypes['Table'], ParentType, ContextType, RequireFields<MutationUpdateTableArgs, 'id' | 'input'>>;
};

export type ProfileResolvers<ContextType = any, ParentType extends ResolversParentTypes['Profile'] = ResolversParentTypes['Profile']> = {
  accountId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  avatarUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  nickName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProfilePageResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProfilePage'] = ResolversParentTypes['ProfilePage']> = {
  items?: Resolver<Array<ResolversTypes['Profile']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  account?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<QueryAccountArgs, 'id'>>;
  accounts?: Resolver<ResolversTypes['AccountPage'], ParentType, ContextType, Partial<QueryAccountsArgs>>;
  availableTables?: Resolver<Maybe<ResolversTypes['TablePage']>, ParentType, ContextType, Partial<QueryAvailableTablesArgs>>;
  booking?: Resolver<Maybe<ResolversTypes['Booking']>, ParentType, ContextType, RequireFields<QueryBookingArgs, 'id'>>;
  bookings?: Resolver<ResolversTypes['BookingPage'], ParentType, ContextType, Partial<QueryBookingsArgs>>;
  branch?: Resolver<Maybe<ResolversTypes['Branch']>, ParentType, ContextType, RequireFields<QueryBranchArgs, 'id'>>;
  branches?: Resolver<ResolversTypes['BranchPage'], ParentType, ContextType, Partial<QueryBranchesArgs>>;
  profile?: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType, RequireFields<QueryProfileArgs, 'id'>>;
  profiles?: Resolver<ResolversTypes['ProfilePage'], ParentType, ContextType, Partial<QueryProfilesArgs>>;
  sysConfig?: Resolver<Maybe<ResolversTypes['SysConfig']>, ParentType, ContextType, RequireFields<QuerySysConfigArgs, 'id'>>;
  sysConfigs?: Resolver<ResolversTypes['SysConfigPage'], ParentType, ContextType, Partial<QuerySysConfigsArgs>>;
  sysStaff?: Resolver<Maybe<ResolversTypes['SysStaff']>, ParentType, ContextType, RequireFields<QuerySysStaffArgs, 'id'>>;
  sysStaffs?: Resolver<ResolversTypes['SysStaffPage'], ParentType, ContextType, Partial<QuerySysStaffsArgs>>;
  table?: Resolver<Maybe<ResolversTypes['Table']>, ParentType, ContextType, RequireFields<QueryTableArgs, 'id'>>;
  tables?: Resolver<Maybe<ResolversTypes['TablePage']>, ParentType, ContextType, Partial<QueryTablesArgs>>;
};

export type SysConfigResolvers<ContextType = any, ParentType extends ResolversParentTypes['SysConfig'] = ResolversParentTypes['SysConfig']> = {
  configType?: Resolver<ResolversTypes['SysConfigType'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SysConfigPageResolvers<ContextType = any, ParentType extends ResolversParentTypes['SysConfigPage'] = ResolversParentTypes['SysConfigPage']> = {
  items?: Resolver<Array<ResolversTypes['SysConfig']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SysStaffResolvers<ContextType = any, ParentType extends ResolversParentTypes['SysStaff'] = ResolversParentTypes['SysStaff']> = {
  accountId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  branchId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  contactNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hireDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  position?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sex?: Resolver<ResolversTypes['Sex'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SysStaffStatus'], ParentType, ContextType>;
  terminationDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SysStaffPageResolvers<ContextType = any, ParentType extends ResolversParentTypes['SysStaffPage'] = ResolversParentTypes['SysStaffPage']> = {
  items?: Resolver<Array<ResolversTypes['SysStaff']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TableResolvers<ContextType = any, ParentType extends ResolversParentTypes['Table'] = ResolversParentTypes['Table']> = {
  branchId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastCleanedAt?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lastOccupiedAt?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['TableLocation']>, ParentType, ContextType>;
  maxSize?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TableStatus'], ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  turntableCycle?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TablePageResolvers<ContextType = any, ParentType extends ResolversParentTypes['TablePage'] = ResolversParentTypes['TablePage']> = {
  items?: Resolver<Array<ResolversTypes['Table']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Account?: AccountResolvers<ContextType>;
  AccountPage?: AccountPageResolvers<ContextType>;
  Booking?: BookingResolvers<ContextType>;
  BookingMaintenance?: BookingMaintenanceResolvers<ContextType>;
  BookingPage?: BookingPageResolvers<ContextType>;
  Branch?: BranchResolvers<ContextType>;
  BranchMaintenance?: BranchMaintenanceResolvers<ContextType>;
  BranchPage?: BranchPageResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Profile?: ProfileResolvers<ContextType>;
  ProfilePage?: ProfilePageResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SysConfig?: SysConfigResolvers<ContextType>;
  SysConfigPage?: SysConfigPageResolvers<ContextType>;
  SysStaff?: SysStaffResolvers<ContextType>;
  SysStaffPage?: SysStaffPageResolvers<ContextType>;
  Table?: TableResolvers<ContextType>;
  TablePage?: TablePageResolvers<ContextType>;
};

