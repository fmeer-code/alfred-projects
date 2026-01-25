#!/usr/bin/env python3
import os, sys, smtplib
from email.message import EmailMessage

def load_env(path):
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line=line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            k,v=line.split('=',1)
            os.environ.setdefault(k, v)

def main():
    if len(sys.argv) < 4:
        print('Usage: send_email.py <to> <subject> <body>', file=sys.stderr)
        sys.exit(2)

    env_path = os.environ.get('ALFRED_EMAIL_ENV', '/root/clawd/email/alfred-email.env')
    load_env(env_path)

    gmail = os.environ['GMAIL_ADDRESS']
    app_pw = os.environ['GMAIL_APP_PASSWORD']
    to = sys.argv[1]
    subject = sys.argv[2]
    body = ' '.join(sys.argv[3:])

    msg = EmailMessage()
    msg['From'] = gmail
    msg['To'] = to
    msg['Subject'] = subject
    msg.set_content(body)

    with smtplib.SMTP('smtp.gmail.com', 587) as s:
        s.ehlo()
        s.starttls()
        s.login(gmail, app_pw)
        s.send_message(msg)

    print('OK')

if __name__ == '__main__':
    main()
