import dayjs from "dayjs";

export const dotDate = (date: Date): string => dayjs(date).format("DD・MM・YY");
