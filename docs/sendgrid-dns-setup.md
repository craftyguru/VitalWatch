# SendGrid DNS Verification Setup Guide

## What SendGrid Needs for Domain Verification

Based on your SendGrid dashboard, you need to add these DNS records to your Cloudflare account:

### Required DNS Records

1. **CNAME Record 1:**
   - Name: `s1._domainkey.yourdomain.com`
   - Value: `s1.domainkey.u2342094.wl094.sendgrid.net`
   - TTL: Auto (or 1 minute)

2. **CNAME Record 2:**  
   - Name: `s2._domainkey.yourdomain.com`
   - Value: `s2.domainkey.u2342094.wl094.sendgrid.net`
   - TTL: Auto (or 1 minute)

3. **TXT Record:**
   - Name: `@` (root domain)
   - Value: The TXT verification string from SendGrid (starts with "v=...")
   - TTL: Auto (or 1 minute)

## How to Add These Records in Cloudflare

1. **Log into your Cloudflare dashboard**
2. **Select your domain** from the domain list
3. **Go to DNS tab** on the left sidebar
4. **Click "Add record"** for each DNS record above
5. **Select record type** (CNAME or TXT)
6. **Enter the Name and Value** exactly as shown in SendGrid
7. **Save each record**

## Important Notes

- **Exact Match Required**: The DNS records must match SendGrid's requirements exactly
- **Propagation Time**: DNS changes can take 5-60 minutes to propagate
- **Case Sensitive**: Some values are case-sensitive, copy them exactly
- **No Proxy**: For CNAME records, make sure the "Proxy status" is set to "DNS only" (gray cloud), not "Proxied" (orange cloud)

## After Adding DNS Records

1. Wait 5-10 minutes for DNS propagation
2. Go back to SendGrid dashboard
3. Click "Verify" on each DNS record
4. All records should show as verified (green checkmarks)

## Troubleshooting

If verification still fails:
- Double-check the record values are exactly correct
- Wait longer for DNS propagation (up to 24 hours max)
- Use online DNS checker tools to verify the records are visible
- Contact Cloudflare support if records aren't propagating

## Why This Matters for VitalWatch

Once domain authentication is complete:
- VitalWatch can send professional emails from your domain
- Email deliverability will be much better
- Emergency alerts and verification emails will work reliably
- No more "via sendgrid.net" in email headers