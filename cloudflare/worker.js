// Serves the static assets and consolidates hosts on the apex,
// which is what every canonical tag and the sitemap already use.
// Asset requests (including 404 handling) still flow through
// env.ASSETS.fetch, so `_headers` keeps applying to every response.

const APEX = "diwakaryadav.com.np";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname !== APEX) {
      url.hostname = APEX;
      return Response.redirect(url, 301);
    }
    return env.ASSETS.fetch(request);
  },
};
