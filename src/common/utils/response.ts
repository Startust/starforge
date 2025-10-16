export interface StandardResponse<T> {
  success: boolean; // Indicates if the request was successful
  data: T | null; // The data returned from the request, null if not applicable
  message: string; // A message providing additional information about the request
  errorCode: string | null; // An error code, null if no error occurred
}
