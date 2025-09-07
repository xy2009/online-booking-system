
import { logger } from "../../common/utils/logger";
import { isSystemStaff } from "../middleware/permissionMiddleware";
import { Resolvers, Booking, BookingInput, BookingStatus, BookingType } from "../generated/graphql";
import { listBookings, deleteBooking, updateBooking, createBooking, getBookingById } from "../services/booking";
import AppError from "../../common/errors";

export const bookingResolves: Resolvers = {
    Query: {
        bookings: async (_, { filter, pagination }, { user }) => {
            if (!user) throw AppError.unauthorized("Unauthorized");
            console.log("User in bookings query:", filter, pagination, user);
            // 系统员工可以查看所有预订，普通用户只能查看自己的预订
            const isSystem = isSystemStaff(user.role);
            // let safeFilter: { [key: string]: any } = {};
            const safeFilter:{ [key: string]: any } = 
                isSystem ? { ...filter } : { ...filter, userId: user.userId };
            console.log("Safe filter applied:", safeFilter);
            const page = pagination?.page || 1;
            const pageSize = pagination?.pageSize || 20;
            const result = await listBookings(safeFilter, page, pageSize);

            // Ensure all bookings have bookingType defined and cast to generated Booking type
            const items = result.items.map((booking) => {
                return booking as Booking;
            });

            return {
                ...result,
                items,
            };
        },
        booking: async (_, { id }, { user }) => {
            if (!user) throw AppError.unauthorized("Unauthorized");
            
            const booking = await getBookingById(id);
            if (!isSystemStaff(user.role) && booking?.userId !== user.userId) {
                throw AppError.forbidden("Forbidden: insufficient permissions");
            }
            if (!booking) {
                throw AppError.notFound("Booking not found");
            }
            // Ensure bookingType is never undefined
            if (booking.bookingType === undefined || booking.bookingType === null) {
                throw AppError.paramsError("Invalid booking: bookingType is missing");
            }
            // Cast booking to generated Booking type to satisfy resolver type
            return booking as Booking;
        },
    },
    Mutation: {
        createBooking: async (_, { input }: { input: BookingInput }, { user }) => {
            console.log("createBooking called with input:", input, "and user:", user);
            logger.debug(`createBooking called with input: ${JSON.stringify(input)}, user: ${JSON.stringify(user)}`);
            if (!user) throw AppError.unauthorized("Unauthorized");
            if (!isSystemStaff(user.role) && 
                (input?.userId !== user.userId || (input?.status && !['pending'].includes(input.status)))) {
                throw AppError.forbidden("Forbidden: insufficient permissions");
            }
            const safeInput = {
                ...input,
                status: input.status === null ? undefined : input.status,
                specialRequests: input.specialRequests === null ? undefined : input.specialRequests,
                tableId: input.tableId === null ? undefined : input.tableId,
                connectName: input.connectName === null ? undefined : input.connectName,
                connectPhone: input.connectPhone === null ? undefined : input.connectPhone,
                branchId: typeof input.branchId === "string" ? input.branchId : "", // Ensure branchId is always a string
                bookingType: input.bookingType === null ? undefined : input.bookingType, // Ensure bookingType is never null
            };
            const newBooking = await createBooking(safeInput, user.userId);
            return newBooking as Booking;
            
        },
        updateBooking: async (_, { id, input }, { user }) => {
            if (!user) throw AppError.unauthorized("Unauthorized");
            if (!isSystemStaff(user.role) && ((input?.status && ['confirmed', 'no_show'].includes(input.status)))) {
                throw AppError.forbidden("Forbidden: insufficient permissions");
            }
            const safeInput = {
                ...input,
                bookingTime: input.bookingTime === null ? undefined : input.bookingTime,
                numberOfPeople: input.numberOfPeople === null ? undefined : input.numberOfPeople,
                status: input.status === null ? undefined : input.status,
                specialRequests: input.specialRequests === null ? undefined : input.specialRequests,
                tableId: input.tableId === null ? undefined : input.tableId,
                isDeleted: input.isDeleted === null ? undefined : input.isDeleted,
                connectName: input.connectName === null ? undefined : input.connectName,
                connectPhone: input.connectPhone === null ? undefined : input.connectPhone,
            };
            const updatedBooking = await updateBooking(id, safeInput, user);
            if (!updatedBooking) {
                throw AppError.notFound("Booking not found");
            }
            // Ensure bookingType is never undefined
            if (updatedBooking.bookingType === undefined || updatedBooking.bookingType === null) {
                throw AppError.paramsError("Invalid booking: bookingType is missing");
            }
            return updatedBooking as Booking;
        },
        deleteBooking: async (_, { id }, { user }) => {
            if (!user) throw AppError.unauthorized("Unauthorized");
            const booking = await getBookingById(id);
            if (!booking) throw AppError.notFound("Booking not found");
            // Only system staff or the user who created the booking can delete it
            if (!isSystemStaff(user.role) && booking?.userId !== user.userId) {
                throw AppError.forbidden("Forbidden: insufficient permissions");
            }
            const success = await deleteBooking(id);
            return success;
        },  
    }
};

