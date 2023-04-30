export type SessionData = {
    id: string;
    logged_in: boolean;
    expires: number;
};

export type UserData = {
    id: string;
    username: string;
    profile_picture: string | null;
};
