import { logger } from "./logger";

export const sendSuccess = (res: any, data: any, message = 'Success') => {
    res.json({
        code: 200,
        message,
        data,
    });
}

export const sendError = (res: any, message = 'Error', code = 500, errors?: any) => {
    const d = {
        code,
        message,
        errors
    };
    logger.error("Response errors:", d);
    res.status(code).json(d);
}



