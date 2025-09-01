export type AuthResponse = {
  clientId: string;
  expires: Date;
};

export interface AuthResponseJson {
  client_id: string;
  exp: string;
}

export function mapToAuthResponse(
  responseBody: AuthResponseJson,
): AuthResponse {
  return {
    clientId: responseBody.client_id,
    expires: new Date(responseBody.exp),
  };
}

export function toOptionalAuthResponse(
  response: AuthResponseJson | null,
): AuthResponse | null {
  if (response) {
    return mapToAuthResponse(response);
  }
  return null;
}
