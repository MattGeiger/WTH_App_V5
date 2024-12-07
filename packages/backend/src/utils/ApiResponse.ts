export class ApiResponse {
  public readonly success: boolean;
  public readonly data: any;
  public readonly message?: string;
  public readonly pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
  };

  constructor(success: boolean, data: any, message?: string, pagination?: any) {
      this.success = success;
      this.data = data;
      this.message = message;
      this.pagination = pagination;
  }

  static success(data: any, message?: string, pagination?: any): ApiResponse {
      return new ApiResponse(true, data, message, pagination);
  }

  static error(message: string): ApiResponse {
      return new ApiResponse(false, null, message);
  }

  static paginated(items: any[], page: number, limit: number, total: number): ApiResponse {
      const totalPages = Math.ceil(total / limit);
      return new ApiResponse(true, items, undefined, { page, limit, total, totalPages });
  }
}