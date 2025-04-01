import { getUserGoalsData } from "../repositories/goalRepos";

export const getGoalsByUser = async (userId: string ) => {
    const docData = await getUserGoalsData(userId);
    //TODO:- filter by priority
    return docData
}