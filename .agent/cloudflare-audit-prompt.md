# Cloudflare Domain Audit & Configuration Prompt

Use this prompt with an AI agent that has access to your Cloudflare dashboard (via browser or API).

---

## 🎯 THE PROMPT

```
You are a Cloudflare configuration expert. I need you to audit and optimize my domain hosted on Cloudflare. Please perform a comprehensive check and configuration of all settings.

**My Domain:** diwakaryadav.com.np
**Website Type:** Static portfolio website (HTML, CSS, JavaScript)
**Hosting:** GitHub Pages
**Priority:** Maximum performance and security for a personal portfolio

---

### PHASE 1: AUDIT CURRENT CONFIGURATION

Please check and report on the following:

1. **DNS Settings**
   - List all DNS records (A, AAAA, CNAME, TXT, MX)
   - Verify proxy status (orange cloud) for each record
   - Check for any orphaned or unnecessary records
   - Verify the root domain and www subdomain are configured correctly

2. **SSL/TLS Settings**
   - Current SSL mode (Off, Flexible, Full, Full Strict)
   - Certificate status and expiration
   - Always Use HTTPS setting
   - Minimum TLS version
   - Automatic HTTPS Rewrites status

3. **Speed & Performance Settings**
   - Auto Minify settings (JavaScript, CSS, HTML)
   - Brotli compression status
   - Rocket Loader status
   - Early Hints status
   - HTTP/2 and HTTP/3 status
   - Browser Cache TTL setting

4. **Caching Configuration**
   - Caching Level setting
   - Browser Cache TTL
   - Any Page Rules affecting cache
   - Edge Cache TTL settings
   - Cache Everything rule status for static assets

5. **Security Settings**
   - Security Level (Essentially Off, Low, Medium, High, I'm Under Attack)
   - WAF (Web Application Firewall) status
   - Bot Fight Mode status
   - Browser Integrity Check
   - Hotlink Protection
   - Email Address Obfuscation

6. **Page Rules**
   - List all active page rules
   - Check for conflicts or redundancies

7. **Network Settings**
   - IPv6 Compatibility
   - WebSockets support
   - Onion Routing status

---

### PHASE 2: RECOMMENDED CONFIGURATION

After auditing, please configure these optimal settings for a static portfolio website:

**SSL/TLS (Maximum Security)**
- Set SSL mode to "Full (Strict)" if GitHub Pages supports it, otherwise "Full"
- Enable "Always Use HTTPS"
- Set Minimum TLS Version to 1.2
- Enable "Automatic HTTPS Rewrites"
- Enable "TLS 1.3"

**Speed Optimization (Maximum Performance)**
- Enable Auto Minify for JavaScript, CSS, and HTML
- Enable Brotli compression
- Set Rocket Loader to OFF (can cause issues with some JS)
- Enable Early Hints
- Enable HTTP/2 and HTTP/3 (QUIC)
- Set Browser Cache TTL to "1 month" for static assets

**Caching (Aggressive for Static Site)**
- Set Caching Level to "Standard"
- Create Page Rule for static assets:
  - URL: `*diwakaryadav.com.np/*.css`
  - URL: `*diwakaryadav.com.np/*.js`
  - URL: `*diwakaryadav.com.np/*.webp`
  - URL: `*diwakaryadav.com.np/*.png`
  - URL: `*diwakaryadav.com.np/*.jpg`
  - Settings: Cache Level = Cache Everything, Edge Cache TTL = 1 month

**Security (Balanced)**
- Set Security Level to "Medium"
- Enable Bot Fight Mode
- Enable Browser Integrity Check
- Enable Email Address Obfuscation
- Disable Hotlink Protection (unless bandwidth is a concern)
- Enable Under Attack Mode ONLY if experiencing DDoS

**Page Rules Priority**
1. Force HTTPS: `http://*diwakaryadav.com.np/*` → Always Use HTTPS
2. Cache static assets: `*diwakaryadav.com.np/*.(css|js|webp|png|jpg|woff2)` → Cache Everything

**Headers**
- Add security headers via Transform Rules or _headers file:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: geolocation=(), microphone=(), camera=()

---

### PHASE 3: VERIFICATION

After making changes, please verify:

1. Run SSL Labs test (ssllabs.com/ssltest) - should be A or A+
2. Check PageSpeed Insights score improvement
3. Verify all pages load correctly with HTTPS
4. Confirm cache headers are being set correctly
5. Test from multiple geographic locations if possible

---

### OUTPUT FORMAT

Please provide:
1. **Current State Summary** - What's configured now
2. **Issues Found** - Any problems or suboptimal settings
3. **Changes Made** - What you configured/changed
4. **Recommendations** - Any manual steps I need to take
5. **Verification Results** - Proof that changes are working

---

**Important Notes:**
- My site is a static portfolio, so aggressive caching is safe
- I don't have server-side code, so Full Strict SSL should work
- Performance is critical for user experience and SEO
- Don't enable Rocket Loader (can break animations)
- Keep Under Attack Mode OFF unless there's an actual attack
```

---

## 📋 QUICK REFERENCE: IDEAL SETTINGS

| Setting | Recommended Value | Why |
|---------|-------------------|-----|
| SSL Mode | Full (Strict) | Maximum security with GitHub Pages |
| Always HTTPS | ON | Forces encrypted connections |
| Minimum TLS | 1.2 | Drops insecure browsers, keeps compatibility |
| Auto Minify | All ON | Reduces file sizes automatically |
| Brotli | ON | Better compression than gzip |
| Rocket Loader | OFF | Can break JS animations |
| Early Hints | ON | Faster resource loading |
| HTTP/3 | ON | Faster connections |
| Browser Cache TTL | 1 month | Static site can cache aggressively |
| Caching Level | Standard | Good balance |
| Security Level | Medium | Stops most bots without blocking users |
| Bot Fight Mode | ON | Reduces spam bots |
| Email Obfuscation | ON | Prevents email scraping |

---

## 🔗 USEFUL CLOUDFLARE DASHBOARD LINKS

- **DNS:** https://dash.cloudflare.com/?to=/:account/:zone/dns
- **SSL/TLS:** https://dash.cloudflare.com/?to=/:account/:zone/ssl-tls
- **Speed:** https://dash.cloudflare.com/?to=/:account/:zone/speed/optimization
- **Caching:** https://dash.cloudflare.com/?to=/:account/:zone/caching/configuration
- **Security:** https://dash.cloudflare.com/?to=/:account/:zone/security/waf
- **Rules:** https://dash.cloudflare.com/?to=/:account/:zone/rules

---

## 📝 NOTES

- Replace `diwakaryadav.com.np` with your actual domain if different
- The free Cloudflare plan includes most of these features
- Some features like WAF custom rules require paid plans
- Always test after making changes to ensure site works correctly
