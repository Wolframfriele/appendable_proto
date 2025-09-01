export type AuthPayload = {
  clientId: string;
  clientSecret: string;
};

export interface AuthPayloadJson {
  client_id: string;
  client_secret: string;
}

export function mapToAuthPayloadJson(payload: AuthPayload): AuthPayloadJson {
  return {
    client_id: payload.clientId,
    client_secret: payload.clientSecret,
  };
}
