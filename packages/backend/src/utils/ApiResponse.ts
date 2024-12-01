export class ApiResponse {
    static success<T>(
      data: T,
      message: string = 'Success',
      statusCode: number = 200
    ) {
      return {
        success: true,
        status: statusCode,
        message,
        data
      };
    }
  
    static paginated<T>(
      data: T[],
      page: number,
      limit: number,
      total: number,
      message: string = 'Success'
    ) {
      return {
        success: true,
        status: 200,
        message,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    }
  }