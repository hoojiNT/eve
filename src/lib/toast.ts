type ToastOpts = {
  action?: {
    label: string;
    onClick: () => void;
  };
};

type ToastFn = (message: string, opts?: ToastOpts) => void;

let toastFn: ToastFn | undefined;
const queued: Array<[string, ToastOpts | undefined]> = [];

export function toast(message: string, opts?: ToastOpts) {
  if (toastFn) {
    toastFn(message, opts);
    return;
  }
  queued.push([message, opts]);
  void import("sonner").then((mod) => {
    toastFn = mod.toast;
    for (const [msg, options] of queued.splice(0)) mod.toast(msg, options);
  });
}
