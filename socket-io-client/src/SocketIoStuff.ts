export type SocketIOResponse<SuccessData extends Record<string, unknown> = {}> =

    | {
        ok: false;
        reason: string;
      }
    | (SuccessData & { ok: true });
