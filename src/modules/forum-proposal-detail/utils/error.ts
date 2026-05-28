export function getForumCommentMutationErrorMessage(error: unknown, fallback: string) {
  let message = '';

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      message = error.message;
    } else if ('error' in error && typeof error.error === 'object' && error.error !== null) {
      const innerError = error.error;

      if ('message' in innerError && typeof innerError.message === 'string') {
        message = innerError.message;
      }
    }
  }

  if (message === 'Signature has already been used') {
    return 'This submission used a stale signature. Please retry so your wallet can sign a fresh timestamp.';
  }

  return message || fallback;
}
