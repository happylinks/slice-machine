export interface ToastPayload {
  loading: boolean;
  done: boolean;
  warning: boolean;
  message: string;
  status: number;
  error: Error | null;
}

enum Apperance {
  Success = "success",
  Error = "error",
  Warning = "warning",
  Info = "info",
}

export const handleRemoteResponse =
  // eslint-disable-next-line @typescript-eslint/ban-types
  (addToast: Function) => (payload: ToastPayload) => {
    if (payload.done) {
      addToast(payload.message, {
        appearance: (() => {
          if (payload.error) {
            return Apperance.Error;
          }
          if (payload.warning) {
            return Apperance.Warning;
          }
          return Apperance.Success;
        })(),
      });
    }
  };
