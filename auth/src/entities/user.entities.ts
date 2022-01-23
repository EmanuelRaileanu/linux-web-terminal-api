export interface User extends ValidateUserResponse {
    password: string;
}

export interface ValidateUserRequest {
    username: string;
    password: string;
}

export interface ValidateUserResponse {
    id: number;
    username: string;
}

export interface SessionUserEntity extends ValidateUserResponse {
    iat: number;
    exp: number;
}

export type GetProfileResponse = SessionUserEntity;

export interface UserEntityHolder {
    user: SessionUserEntity;
}

export type CreateUserRequest = ValidateUserRequest;

export interface RegisterRequest extends CreateUserRequest {
    confirmedPassword: string;
}
