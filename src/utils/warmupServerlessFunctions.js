const WARMUP_KEY = 'ssh-reports:server-warmup:v1';
const WARMUP_TARGETS = ['proxy', 'share'];

/**
 * Wake the Netlify functions once per browser session before a likely request.
 * Warm-up failures are intentionally ignored because the real request is authoritative.
 */
export function warmupServerlessFunctions({ once = true } = {}) {
  if (!navigator.onLine || (once && sessionStorage.getItem(WARMUP_KEY))) return false;

  if (once) sessionStorage.setItem(WARMUP_KEY, '1');
  const origin = window.location.origin;
  WARMUP_TARGETS.forEach((target) => {
    fetch(`${origin}/.netlify/functions/${target}?warmup=true`, {
      method: 'HEAD',
      mode: 'no-cors',
    }).catch(() => {});
  });
  return true;
}
