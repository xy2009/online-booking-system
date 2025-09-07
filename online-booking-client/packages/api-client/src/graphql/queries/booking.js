// export const GET_USER_BOOKINGS = `
//   query GetUserBookings($customerId: ID!, $status: BookingStatus) {
//     bookings(customerId: $customerId, status: $status) {
//       id
//       branchId
//       tableId
//       bookingTime
//       partySize
//       status
//       specialRequests
//       createdAt
//       branch {
//         name
//         address
//       }
//       table {
//         number
//       }
//     }
//   }
// `;

// export const GET_BOOKING_DETAIL = `
//   query GetBookingDetail($id: ID!) {
//     booking(id: $id) {
//       id
//       customerId
//       branchId
//       tableId
//       bookingTime
//       partySize
//       status
//       specialRequests
//       customerName
//       customerPhone
//       createdAt
//       updatedAt
//       branch {
//         name
//         address
//         phone
//       }
//       table {
//         number
//         capacity
//       }
//     }
//   }
// `;

export const GET_ALL_BOOKINGS = 
  `query Bookings($filter: BookingFilter, $pagination: PaginationInput) {
        bookings(filter: $filter, pagination: $pagination) {
            items {
                id
                userId
                branchId
                tableId
                bookingTime
                numberOfPeople
                status
                connectName
                connectPhone
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
      }`;

export const GET_BOOKING_BY_ID = `
  query Booking($id: ID!) {
    booking(id: $id) {
      id
      userId
      branchId
      tableId
      bookingTime
      numberOfPeople
      status
      connectName
      connectPhone
      specialRequests
      createdAt
      updatedAt
      isDeleted
      bookingType
      maintenanceLogs {
          id
          action
          performedBy
          performedAt
          notes
      }
    }
  }
`;     



// `
//   query GetAllBookings($filter: BookingFilter, $pagination: Pagination) {
//     bookings(filter: $filter, pagination: $pagination) {
//       id
//       customerName
//       customerPhone
//       branchId
//       tableId
//       bookingTime
//       partySize
//       status
//       specialRequests
//       createdAt
//       branch {
//         name
//       }
//       table {
//         number
//       }
//     }
//   }
// `;


// export const GET_BOOKING_STATISTICS = `
//   query GetBookingStatistics($dateRange: DateRange!, $branchId: ID) {
//     bookingStatistics(dateRange: $dateRange, branchId: $branchId) {
//       totalBookings
//       confirmedBookings
//       cancelledBookings
//       completedBookings
//       noShowBookings
//       dailyStats {
//         date
//         count
//         status
//       }
//     }
//   }
// `;
