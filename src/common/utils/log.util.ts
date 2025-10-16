export function logException(tag: string, err: unknown) {
  if (err instanceof Error) {
    console.error(`[${tag}]`, {
      name: err.name,
      message: err.message,
    });
    console.error(err.stack);
  } else {
    console.error(`[${tag}]`, err);
  }
}
