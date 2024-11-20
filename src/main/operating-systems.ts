export const OS = {
  Windows: 'win32',
  Mac: 'darwin',
}

export function byOS(handlers) {
  const handler = handlers[process.platform];

  if (typeof handler === 'function') return handler();

  return handler;
}

export function getOS() {
  return process.platform
}