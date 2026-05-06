class ApiResponse {
  constructor(statusCode, message, data = null, errors = null) {
    Object.defineProperty(this, "statusCode", {
      value: statusCode,
      enumerable: false,
      writable: false
    });
    this.success = true;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }
}

export default ApiResponse;
