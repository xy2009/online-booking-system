import request from 'supertest';
import app from '../app';
import { testUser } from './testUser';
import { sleep } from '../common/utils/util';

const moduleName = 'Booking API';

let token: string;
let b_token: string;
let sys_client_id: string;
let bookingId: string;
let userId: string;
let branchId = "fe46faa4-98ae-4603-a050-44ae2a4a4345";
let tableId = "5c8eef19-47ad-4365-90b6-3be1d01dd2bf";
// 默认预订时间为第2天 上午11点，避免和工作时间冲突，默认工作时间为10点到22点
let bookingTime = new Date(new Date().setHours(14, 0, 0, 0) + 48 * 60 * 60 * 1000).getTime();

describe(`${moduleName}:`, () => {
  beforeAll(async () => {
    sys_client_id = process.env.CUSTOMER_CLIENT_ID ?? '56LY8OKo2S5u6OLmohAGaDg';
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('client-id', sys_client_id)
      .send({ mobile: testUser.mobile, password: testUser.password, type: 'phone' });
      userId = res.body.data.user.userId;
    token = res.body.data.token.access_token;
    b_token = `Bearer ${token}`;
  });

  it('1. Should succeed, Create Booking via GraphQL mutation', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', b_token)
      .set('client-id', sys_client_id)
      .send({
        query: `
          mutation CreateBooking($input: BookingInput!) {
            createBooking(input: $input) {
              id
              userId
              branchId
              tableId
              bookingTime
              numberOfPeople
              status
              specialRequests
              createdAt
              updatedAt
              isDeleted
              bookingType,
              connectName,
              connectPhone
            }
          }`,
        variables: {
          input: {
            userId,
            tableId,
            branchId,
            bookingTime: bookingTime,
            numberOfPeople: 6,
            status: "pending",
            specialRequests: "无",
            connectName: "张三",
            connectPhone: "13100001111"
          //  bookingType: "online" // 可选，默认为 'online'
          }
        }
      });
      console.log("CreateBooking response:",response.statusCode, response.body);
    expect(response.statusCode).toBe(200);
    if (response.body.data) {
      expect(response.body.data.createBooking).toHaveProperty('id');
      bookingId = response.body.data.createBooking.id;
    } else if (response.body.errors) {
      expect(response.body.errors?.[0]?.message).toMatch(/selected time/);
    }
    
  });

  it('2. Should faild, bearing bookingTime is conflict with other bookings, Create Booking via GraphQL mutation', async () => {
    sleep();
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', b_token)
      .set('client-id', sys_client_id)
      .send({
        query: `
          mutation CreateBooking($input: BookingInput!) {
            createBooking(input: $input) {
              id
              userId
              branchId
              tableId
              bookingTime
              numberOfPeople
              status
              specialRequests
              createdAt
              updatedAt
              isDeleted
              bookingType
              connectName,
              connectPhone
            }
          }`,
        variables: {
          input: {
            userId,
            tableId,
            branchId,
            bookingTime: bookingTime,
            numberOfPeople: 3,
            status: "pending",
            specialRequests: "1345",
            connectName: "张三",
            connectPhone: "13100001111"
          }
        }
      });
     
    console.log("Unexpected success response:", response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body.errors?.[0]?.message).toMatch(/selected time/);
    
  });

  it('3. Should succeed, tableId is not provided, Create Booking via GraphQL mutation', async () => {
    sleep();
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', b_token)
      .set('client-id', sys_client_id)
      .send({
        query: `
          mutation CreateBooking($input: BookingInput!) {
            createBooking(input: $input) {
              id
              userId
              branchId
              tableId
              bookingTime
              numberOfPeople
              status
              specialRequests
              createdAt
              updatedAt
              isDeleted
              bookingType
              connectName,
              connectPhone
            }
          }`,
        variables: {
          input: {
            userId,
            branchId,
            bookingTime: bookingTime + 20 * 60 * 1000, // 推迟240分钟，避免冲突
            numberOfPeople: 8,
            status: "pending",
            connectName: "张三",
            connectPhone: "13100001111"
          }
        }
      });
      console.log("CreateBooking conflict response:",response.statusCode, response.body);
      expect(response.statusCode).toBe(200);
      if (!bookingId) {
        bookingId = response.body.data.createBooking.id;
      }
      expect(response.body.data.createBooking).toHaveProperty('id');
  });

  it('4. Should succeed, Query Bookings via GraphQL query', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', b_token)
      .set('client-id', sys_client_id)
      .send({
        query: `
          query Bookings($filter: BookingFilter, $pagination: PaginationInput) {
            bookings(filter: $filter, pagination: $pagination) {
              items {
                id
                userId
                tableId
                bookingTime
                numberOfPeople
                status
                specialRequests
                createdAt
                updatedAt
                isDeleted
                bookingType
              }
              total
              page
              pageSize
            }
          }`,
        variables: {
          filter: {
            userId: userId,
            status: "pending"
          },
          pagination: {
            page: 1,
            pageSize: 10
          }
        }
      });
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data.bookings.items)).toBe(true);
  });

  it('5. Should succeed, Query Booking by ID via GraphQL query', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', b_token)
      .set('client-id', sys_client_id)
      .send({
        query: `
          query Booking($id: ID!) {
            booking(id: $id) {
              id
              userId
              tableId
              bookingTime
              numberOfPeople
              status
              specialRequests
              createdAt
              updatedAt
              isDeleted
              bookingType
            }
          }`,
        variables: {
          id: bookingId
        }
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.data.booking).toHaveProperty('id', bookingId);
  });

  it('6. Should succeed, Update Booking via GraphQL mutation', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', b_token)
      .set('client-id', sys_client_id)
      .send({
        query: `
          mutation UpdateBooking($id: ID!, $input: BookingUpdateInput!) {
            updateBooking(id: $id, input: $input) {
              id
              status
              specialRequests
              updatedAt
            }
          }`,
        variables: {
          id: bookingId,
          input: {
            tableId,
            status: "confirmed",
            specialRequests: "靠窗"
          }
        }
      });
    expect(response.statusCode).toBe(200);
    console.log("UpdateBooking response:", response.body);
    expect(response.body.data.updateBooking).toHaveProperty('id', bookingId);
    expect(response.body.data.updateBooking).toHaveProperty('status', "confirmed");
  });

  // it('7. Should succeed, Delete Booking via GraphQL mutation', async () => {
  //   const response = await request(app)
  //     .post('/graphql')
  //     .set('Content-Type', 'application/json')
  //     .set('Authorization', b_token)
  //     .set('client-id', sys_client_id)
  //     .send({
  //       query: `
  //         mutation DeleteBooking($id: ID!) {
  //           deleteBooking(id: $id)
  //         }`,
  //       variables: {
  //         id: bookingId
  //       }
  //     });
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body.data.deleteBooking).toBe(true);
  // });
});