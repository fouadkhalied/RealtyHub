export interface ServiceResult<T = void> {
    success: boolean;
    data?: T;
    message?: string;
}
