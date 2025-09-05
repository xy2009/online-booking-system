import day from 'dayjs';
import { DateFormatKeys } from '../constants/consts';

export const getNowDate = () => {
    return day().format(DateFormatKeys.formatDateStr);
};

export const getNowHour = () => {
    return day().format(DateFormatKeys.formatHourStr);
}

export const getNowTime = () => {
    return day().format(DateFormatKeys.formatTimeStr);
};

export const getNowTime2 = () => {
    return day().format(DateFormatKeys.formatTimeStr2);
}

export const getNow = () => {
    return day().format(DateFormatKeys.formatNowStr);
};

export const formatDate = (date: string | number) => {
    return day(date).format(DateFormatKeys.formatNowStr);
};
