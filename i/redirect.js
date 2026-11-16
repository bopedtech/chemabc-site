/* Shared by the invite page (loaded as a plain script) and by jest (CommonJS). No dependencies. */
(function (root) {
  var CODE_RE = /^[0-9A-HJKMNP-TV-Z]{6}$/;
  var PLAY = 'https://play.google.com/store/apps/details?id=';
  var DEFAULT_ANDROID = 'com.boped.chemabc';
  var PKG_RE = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/;

  function normCode(code) {
    return typeof code === 'string' ? code.trim().toUpperCase() : '';
  }

  function isValidCode(code) {
    return CODE_RE.test(normCode(code));
  }

  function platformOf(userAgent) {
    var ua = userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    return 'other';
  }

  function playUrl(androidId, code) {
    var pkg = PKG_RE.test(androidId || '') ? androidId : DEFAULT_ANDROID;
    var base = PLAY + encodeURIComponent(pkg);
    var c = normCode(code);
    if (!CODE_RE.test(c)) return base;
    return base + '&referrer=utm_source%3Dinvite%26utm_content%3D' + c;
  }

  function hasIos(ids) {
    return /^https:\/\//.test(ids.iosUrl || '');
  }

  /** ids = { android: package name, iosUrl: App Store url }. Returns null for iPhone/iPad without a known App Store url (show links, do not redirect). */
  function targetFor(userAgent, code, ids) {
    if (platformOf(userAgent) === 'ios') return hasIos(ids) ? ids.iosUrl : null;
    return playUrl(ids.android, code);
  }

  /** Links to show instead of redirecting (config slow or failed). App Store only when a real url is known. */
  function fallbackTargets(userAgent, code, ids) {
    var out = [{ label: 'Google Play', href: playUrl(ids.android, code) }];
    if (hasIos(ids)) out.push({ label: 'App Store', href: ids.iosUrl });
    if (platformOf(userAgent) === 'ios' && out.length > 1) out.reverse();
    return out;
  }

  var api = { fallbackTargets: fallbackTargets, DEFAULT_ANDROID: DEFAULT_ANDROID, CODE_RE: CODE_RE, targetFor: targetFor, isValidCode: isValidCode, platformOf: platformOf, playUrl: playUrl };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ChemRedirect = api;
})(typeof window !== 'undefined' ? window : this);
