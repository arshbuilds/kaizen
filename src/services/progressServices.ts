import { getConsistencyDataRepo } from "../repositories/progressRepos";

export const getConsistencyData = async (params: {
  userId: string;
  year: number;
  month: number;
}) => {
  try {
    const key = `/users/${params.userId}/calendarStats/${params.year}-${String(
      params.month + 1
    ).padStart(2, "0")}`;
    const data = await getConsistencyDataRepo(key);
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
