#!/usr/bin/env python3
import os, re, subprocess, imaplib, email, socket
from email.header import decode_header

def load_env(path):
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line=line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            k,v=line.split('=',1)
            os.environ.setdefault(k, v)

def dec(h):
    if not h:
        return ''
    parts = decode_header(h)
    out = ''
    for s, enc in parts:
        if isinstance(s, bytes):
            out += s.decode(enc or 'utf-8', errors='replace')
        else:
            out += s
    return out

def text_snippet(msg, limit=400):
    txt = ''
    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            disp = (part.get('Content-Disposition') or '').lower()
            if ctype == 'text/plain' and 'attachment' not in disp:
                payload = part.get_payload(decode=True)
                charset = part.get_content_charset() or 'utf-8'
                if payload is not None:
                    try:
                        txt = payload.decode(charset, errors='replace')
                    except Exception:
                        txt = payload.decode('utf-8', errors='replace')
                break
    else:
        payload = msg.get_payload(decode=True)
        charset = msg.get_content_charset() or 'utf-8'
        if payload is not None:
            try:
                txt = payload.decode(charset, errors='replace')
            except Exception:
                txt = payload.decode('utf-8', errors='replace')

    if not txt:
        return ''
    txt = re.sub(r'\s+', ' ', txt).strip()
    return (txt[:limit] + ('…' if len(txt) > limit else ''))

def send_telegram(text):
    target = os.environ['TELEGRAM_TARGET']
    subprocess.run([
        'clawdbot','message','send',
        '--channel','telegram',
        '--target', target,
        '--message', text
    ], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def main():
    env_path = os.environ.get('ALFRED_EMAIL_ENV', '/root/clawd/email/alfred-email.env')
    load_env(env_path)

    gmail = os.environ['GMAIL_ADDRESS']
    app_pw = os.environ['GMAIL_APP_PASSWORD']

    # Safety: avoid hanging forever in cron
    socket.setdefaulttimeout(20)

    M = None
    try:
        M = imaplib.IMAP4_SSL('imap.gmail.com', timeout=20)
        M.login(gmail, app_pw)
        M.select('INBOX')

        typ, data = M.search(None, 'UNSEEN')
        if typ != 'OK':
            return
        ids = (data[0] or b'').split()
        if not ids:
            return

        ids = ids[:5]
        for uid in ids:
            typ, msgdata = M.fetch(uid, '(RFC822)')
            if typ != 'OK' or not msgdata or not msgdata[0]:
                continue
            raw = msgdata[0][1]
            msg = email.message_from_bytes(raw)

            frm = dec(msg.get('From'))
            subj = dec(msg.get('Subject'))
            snippet = text_snippet(msg)
            summary = f"New email\nFrom: {frm}\nSubject: {subj}"
            if snippet:
                summary += f"\n\n{snippet}"
            send_telegram(summary)

            M.store(uid, '+FLAGS', '\\Seen')
    except Exception as e:
        # Keep silent; cron should be quiet. Uncomment to debug locally.
        # send_telegram(f"Email poll error: {type(e).__name__}: {e}")
        return
    finally:
        try:
            if M is not None:
                M.logout()
        except Exception:
            pass

if __name__ == '__main__':
    main()
