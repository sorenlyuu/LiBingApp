export interface UserItem {
    HoyoLabAuthToken?: string,
    HoyoLabAccountId?: string
}

export interface UserData {
    [userId: string]: UserItem
}