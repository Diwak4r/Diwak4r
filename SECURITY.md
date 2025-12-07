# Security Configuration Guide

## Portfolio Security Overview

This document outlines the security measures implemented in the portfolio and additional Cloudflare configurations recommended for optimal protection.

---

## ✅ Implemented Security Measures

### 1. HTTP Security Headers (`_headers` file)
All security headers are configured in the `_headers` file for Cloudflare Pages:
- **Content-Security-Policy (CSP)**: Prevents XSS and code injection
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME-type sniffing
- **Strict-Transport-Security (HSTS)**: Forces HTTPS
- **Referrer-Policy**: Controls information leakage
- **Permissions-Policy**: Restricts browser API access

### 2. Form Security (`contact.html`)
- ✅ Honeypot field for bot detection
- ✅ CAPTCHA enabled
- ✅ Input validation (minlength, maxlength, pattern)
- ✅ Autocomplete attributes for proper browser handling
- ✅ Auto-response configured

### 3. External Link Security
- ✅ All `target="_blank"` links have `rel="noopener noreferrer"`
- ✅ Prevents tabnabbing attacks

### 4. Subresource Integrity (SRI)
- ✅ External scripts (anime.js) have SRI hashes
- ✅ Protects against CDN compromise

### 5. Crawler Control
- ✅ `robots.txt` configured
- ✅ Blocks access to sensitive directories

---

## 🔧 Cloudflare Dashboard Configuration

Log into your Cloudflare dashboard and apply these settings:

### 1. SSL/TLS Settings
**Path:** SSL/TLS → Overview
```
SSL Mode: Full (Strict)
```

**Path:** SSL/TLS → Edge Certificates
```
✅ Always Use HTTPS: ON
✅ Minimum TLS Version: TLS 1.2
✅ Automatic HTTPS Rewrites: ON
✅ HSTS: ON (max-age: 1 year, include subdomains, preload)
```

### 2. Security Settings
**Path:** Security → Settings
```
✅ Browser Integrity Check: ON
✅ Email Address Obfuscation: ON
✅ Server-side Excludes: ON
✅ Hotlink Protection: ON (optional)
```

**Path:** Security → WAF (Web Application Firewall)
```
✅ Enable Cloudflare Managed Ruleset
✅ Enable OWASP Core Ruleset
Security Level: Medium or High
```

### 3. DDoS Protection
**Path:** Security → DDoS
```
✅ DDoS Attack Protection: Automatic
✅ Under Attack Mode: OFF (enable only during attacks)
```

### 4. Bot Management
**Path:** Security → Bots
```
✅ Bot Fight Mode: ON
✅ Block AI Scrapers: Consider enabling if desired
```

### 5. Page Rules (Optional Performance/Security)
**Path:** Rules → Page Rules

Rule 1 - Cache static assets:
```
URL: diwakaryadav.com.np/images/*
Settings: 
  - Cache Level: Cache Everything
  - Browser Cache TTL: 1 year
```

Rule 2 - Security for all pages:
```
URL: diwakaryadav.com.np/*
Settings:
  - Security Level: Medium
  - Browser Integrity Check: ON
```

### 6. Caching
**Path:** Caching → Configuration
```
Caching Level: Standard
Browser Cache TTL: 4 hours
Always Online: ON
```

### 7. Firewall Rules (Optional Advanced Protection)
**Path:** Security → WAF → Custom Rules

Block known bad actors:
```javascript
// Block requests with suspicious user agents
(http.user_agent contains "sqlmap") or 
(http.user_agent contains "nikto") or 
(http.user_agent contains "nessus") or
(http.user_agent contains "acunetix")
→ Action: Block
```

Block access to sensitive paths:
```javascript
// Block access to git and config files
(http.request.uri.path contains "/.git") or
(http.request.uri.path contains "/.env") or
(http.request.uri.path contains "/wp-admin") or
(http.request.uri.path contains "/wp-login")
→ Action: Block
```

---

## 📊 Security Monitoring

### Cloudflare Analytics
Regularly check:
- **Security → Overview**: Monitor blocked threats
- **Security → Events**: Review security events
- **Analytics → Security**: Track attack patterns

### Recommended Alerts
Set up email notifications for:
- DDoS attacks detected
- High volume of blocked requests
- SSL certificate expiration

---

## 🔐 Additional Recommendations

### 1. Enable Two-Factor Authentication
- Enable 2FA on your Cloudflare account
- Enable 2FA on your domain registrar
- Enable 2FA on your GitHub account

### 2. API Token Security
If using Cloudflare API:
- Use API tokens (not Global API Key)
- Limit token permissions to minimum required
- Rotate tokens periodically

### 3. Backup Strategy
- Keep local copies of all website files
- Use Git for version control
- Consider automated backups

### 4. Regular Security Checks
Monthly:
- Review Cloudflare security reports
- Check for outdated external resources
- Verify all links are working

Quarterly:
- Test contact form functionality
- Review and update dependencies
- Run security headers test (securityheaders.com)

---

## 🧪 Security Testing Tools

Use these tools to verify security:

1. **Security Headers**: https://securityheaders.com
2. **SSL Labs**: https://www.ssllabs.com/ssltest/
3. **CSP Evaluator**: https://csp-evaluator.withgoogle.com/
4. **Observatory by Mozilla**: https://observatory.mozilla.org/

---

## 📝 Changelog

### Version 1.0 (December 2024)
- Initial security implementation
- Added _headers file with CSP and security headers
- Enhanced contact form with validation
- Added SRI to external scripts
- Created robots.txt
- Added noopener/noreferrer to external links

---

## ⚠️ Important Notes

1. **CSP Modifications**: If you add new external resources (scripts, fonts, images), update the CSP in `_headers`

2. **FormSubmit Email**: The contact form uses FormSubmit.co. Ensure your email is verified there.

3. **CAPTCHA Trade-off**: CAPTCHA is now enabled. If it causes friction for legitimate users, you can disable it, but monitor spam levels.

4. **HSTS Preload**: After confirming HTTPS works correctly, consider submitting to the HSTS preload list: https://hstspreload.org/
