import {
  createAccount,
  updateAccount,
  getAccountById,
  listAccounts,
  deleteAccount,
} from "../graphql/services/account";
import { CouchbaseDB } from "../database/couchbaseUtils";
import { COLLECTIONS, SCOPES } from "../common/constants/consts";
import { generateUUID } from "../common/utils/util";
import { IAccountResponse } from "../entities/accountEntity";
// Mock dependencies
jest.mock("../database/couchbaseUtils");
jest.mock("../common/config", () => ({
  getConfigByKey: jest.fn((key: string) => {
    if (key === "PWD_SALT") return 10;
    return "test-value";
  }),
}));
const mockCouchbaseDB = CouchbaseDB as jest.Mocked<typeof CouchbaseDB>;
const moduleName = "Account Service"; // Add this line at the top

describe("Account Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("createAccount", () => {
    // it("should create a new account successfully", async () => {
    //   const mockInput = {
    //     mobile: "13800138000",
    //     password: "password123",
    //     role: "customer" as const,
    //     status: "active" as const,
    //     username: "testuser",
    //   };
    //   // Mock getAccountByMobile to return null (no existing account)
    //   mockCouchbaseDB.query.mockResolvedValueOnce({ rows: [] } as any);
    //   // Mock upsert
    //   mockCouchbaseDB.upsert.mockResolvedValueOnce({} as any);
    //   const result = await createAccount(mockInput);
    //   expect(result).toMatchObject({
    //     mobile: mockInput.mobile,
    //     role: mockInput.role,
    //     status: mockInput.status,
    //     username: mockInput.username,
    //   });
    //   expect(result.status).toBe("active");
    // //   expect(result.id).toBeDefined();
    // //   expect(result.userId).toBeDefined();
    // //   expect(result.createdAt).toBeDefined();
    // //   expect(result.updatedAt).toBeDefined();
    // //   expect(result).not.toHaveProperty("password");
    // //   expect(result).not.toHaveProperty("type");
    // });
    it("should throw error if mobile already exists", async () => {
      const mockInput = {
        mobile: "13800138000",
        password: "password123",
      };
      // Mock getAccountByMobile to return existing account
      mockCouchbaseDB.query.mockResolvedValueOnce({
        rows: [{ id: "existing-id", mobile: mockInput.mobile }],
        meta: {} as any,
      });
      await expect(createAccount(mockInput)).rejects.toThrow(
        "Mobile number already registered"
      );
    });
    it("should throw error if required fields are missing", async () => {
      await expect(
        createAccount({ mobile: "", password: "test" })
      ).rejects.toThrow("Mobile and password are required");
      await expect(
        createAccount({ mobile: "test", password: "" })
      ).rejects.toThrow("Mobile and password are required");
    });
  });
  describe("updateAccount", () => {
    // it("should update account successfully", async () => {
    //   const accountId = "test-account-id";
    //   const mockAccount = {
    //     id: accountId,
    //     mobile: "13800138000",
    //     role: "customer",
    //     status: "active",
    //     createdAt: Date.now(),
    //     updatedAt: Date.now(),
    //   };
    //   const mockCurrentUser: IAccountResponse = {
    //     id: accountId,
    //     role: "admin",
    //     mobile: "13800138001",
    //     status: "active",
    //     createdAt: Date.now(),
    //     updatedAt: Date.now(),
    //     userId: "user-id",
    //   };
    //   const updateInput = {
    //     username: "newusername",
    //     status: "inactive" as const,
    //   };
    //   // Mock get
    //   mockCouchbaseDB.get.mockResolvedValueOnce({
    //     content: mockAccount,
    //   } as any);
    //   // Mock upsert
    //   mockCouchbaseDB.upsert.mockResolvedValueOnce({} as any);
    //   const result = await updateAccount(
    //     accountId,
    //     updateInput,
    //     mockCurrentUser
    //   );
    //   expect(result).toMatchObject({
    //     ...mockAccount,
    //     username: updateInput.username,
    //     status: updateInput.status,
    //   });
    //   expect(result?.updatedAt).toBeGreaterThan(mockAccount.updatedAt);
    // });
    it("should throw error if account not found", async () => {
      const mockCurrentUser: IAccountResponse = {
        id: "user-id",
        role: "admin",
        mobile: "13800138001",
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: "user-id",
      };
      mockCouchbaseDB.get.mockResolvedValueOnce({ content: null } as any);
      await expect(
        updateAccount("non-existent-id", {}, mockCurrentUser)
      ).rejects.toThrow("Account not found");
    });
  });
  describe("getAccountById", () => {
    it("should return account if found", async () => {
      const mockAccount = {
        id: "test-id",
        mobile: "13800138000",
        password: "hashed-password",
        role: "customer",
        status: "active",
        type: "account",
      };
      mockCouchbaseDB.get.mockResolvedValueOnce({
        content: mockAccount,
      } as any);
      const result = await getAccountById("test-id");
      expect(result).toMatchObject({
        id: mockAccount.id,
        mobile: mockAccount.mobile,
        role: mockAccount.role,
        status: mockAccount.status,
      });
      expect(result).not.toHaveProperty("password");
      expect(result).not.toHaveProperty("type");
    });
    it("should return null if account not found", async () => {
      mockCouchbaseDB.get.mockResolvedValueOnce({ content: null } as any);
      const result = await getAccountById("non-existent-id");
      expect(result).toBeNull();
    });
  });
//   describe("listAccounts", () => {
//     it("should return paginated account list", async () => {
//       const mockAccounts = [
//         {
//           id: "account1",
//           mobile: "13800138000",
//           role: "customer",
//           status: "active",
//           type: "account",
//         },
//         {
//           id: "account2",
//           mobile: "13800138001",
//           role: "staff",
//           status: "active",
//           type: "account",
//         },
//       ];
//       // Mock count query
//       mockCouchbaseDB.query.mockResolvedValueOnce({
//         rows: [{ total: 2 }],
//       });
//       // Mock data query
//       mockCouchbaseDB.query.mockResolvedValueOnce({
//         rows: mockAccounts.map((account: any) => ({ account })),
//       });
//       const result = await listAccounts({}, 1, 10);
//       expect(result).toEqual({
//         total: 2,
//         items: mockAccounts.map((account) => ({
//           id: account.id,
//           mobile: account.mobile,
//           role: account.role,
//           status: account.status,
//         })),
//         page: 1,
//         pageSize: 10,
//       });
//     });
//     it("should apply filters correctly", async () => {
//       const filter = {
//         mobile: "138",
//         role: "customer" as const,
//         status: "active" as const,
//       };
//       // Mock count query
//       mockCouchbaseDB.query.mockResolvedValueOnce({
//         rows: [{ total: 1 }],
//       });
//       // Mock data query
//       mockCouchbaseDB.query.mockResolvedValueOnce({
//         rows: [],
//       });
//       await listAccounts(filter, 1, 10);
//       // Verify that the query was called with correct parameters
//       expect(mockCouchbaseDB.query).toHaveBeenCalledWith(
//         expect.stringContaining("mobile LIKE $mobile"),
//         expect.objectContaining({
//           parameters: expect.objectContaining({
//             mobile: "%138%",
//             role: "customer",
//             status: "active",
//           }),
//         })
//       );
//     });
//   });
  describe("deleteAccount", () => {
    it("should delete account successfully", async () => {
      mockCouchbaseDB.remove.mockResolvedValueOnce({} as any);
      const result = await deleteAccount("test-id");
      expect(result).toBe(true);
      expect(mockCouchbaseDB.remove).toHaveBeenCalledWith(
        SCOPES.USER,
        COLLECTIONS.ACCOUNT,
        "account::test-id"
      );
    });
    it("should return false if deletion fails", async () => {
      mockCouchbaseDB.remove.mockRejectedValueOnce(new Error("Delete failed"));
      const result = await deleteAccount("test-id");
      expect(result).toBe(false);
    });
  });
});
