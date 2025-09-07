export const CREATE_BOOKING = 
`
mutation CreateBooking($input: BookingInput!) {
    createBooking(input: $input) {
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
        maintenanceLogs {
            id
            action
            performedBy
            performedAt
            notes
        }
        branchId
        connectName
        connectPhone
    }
}`;

// `
//   mutation CreateBooking($input: CreateBookingInput!) {
//     createBooking(input: $input) {
//       id
//       status
//       bookingTime
//       branch {
//         name
//       }
//       table {
//         number
//       }
//     }
//   }
// `;

export const UPDATE_BOOKING = 
`
mutation UpdateBooking($id: ID!, $input: BookingUpdateInput!) {
    updateBooking(id: $id, input: $input) {
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
        maintenanceLogs {
            id
            action
            performedBy
            performedAt
            notes
        }
        branchId
        connectName
        connectPhone
    }
}
`;

// `
//   mutation UpdateBooking($id: ID!, $input: UpdateBookingInput!) {
//     updateBooking(id: $id, input: $input) {
//       id
//       status
//       bookingTime
//       partySize
//       specialRequests
//     }
//   }
// `;

export const UPDATE_BOOKING_STATUS = 
`
  mutation UpdateBooking($id: ID!, $input: BookingUpdateInput!) {
    updateBooking(id: $id, input: $input) {
        id
        status
    }
  }
`;
// `
//   mutation CancelBooking($id: ID!, $reason: String) {
//     cancelBooking(id: $id, reason: $reason) {
//       id
//       status
//     }
//   }
// `;

export const CONFIRM_BOOKING = `
  mutation ConfirmBooking($id: ID!) {
    confirmBooking(id: $id) {
      id
      status
    }
  }
`;

export const REJECT_BOOKING = `
  mutation RejectBooking($id: ID!, $reason: String!) {
    rejectBooking(id: $id, reason: $reason) {
      id
      status
    }
  }
`;

export const COMPLETE_BOOKING = `
  mutation CompleteBooking($id: ID!) {
    completeBooking(id: $id) {
      id
      status
    }
  }
`;

export const MARK_NO_SHOW = `
  mutation MarkNoShow($id: ID!) {
    markNoShow(id: $id) {
      id
      status
    }
  }
`;
