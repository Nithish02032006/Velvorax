import paramiko
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

host = "66.116.225.55"
username = "developer"
password = "@Raraju1116"
project_path = "/var/www/app"

# ======================================================
# ENV CONTENT - the production .env for the backend
# This is pushed on every deploy to ensure it's always
# present even if git pull deleted/ignored it.
# ======================================================
env_content = """MONGO_URI=mongodb+srv://nithish020306_db_user:Nithish%40236@cluster0.duzlpo7.mongodb.net/velvorax?appName=Cluster0
JWT_SECRET=velvorax_secret_key_2024
PORT=5000

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=velvorax.madhavi@gmail.com
SMTP_PASS=tfde mhpb khmi snzv
SUPER_ADMIN_EMAILS=velvorax.madhavi@gmail.com
"""

print(f"Connecting to {host} as {username}...")

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, username=username, password=password, timeout=10)
    print("Connected successfully!")

    # Step 1: Push the .env file via SFTP (before git pull so it's always present)
    print("\n[1/4] Uploading .env to server...")
    sftp = ssh.open_sftp()
    with sftp.open(f'{project_path}/backend/.env', 'w') as f:
        f.write(env_content)
    sftp.close()
    print("     .env uploaded successfully.")

    commands = [
        (f"cd {project_path} && git stash && git pull origin main -f", "[2/4] Git pull"),
        (f"cd {project_path}/backend && npm install",                   "[3/4] npm install"),
        (f"pm2 restart all --update-env",                               "[4/4] PM2 restart"),
    ]

    for cmd, label in commands:
        print(f"\n{label}...")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        exit_status = stdout.channel.recv_exit_status()
        out = stdout.read().decode('utf-8', errors='replace').strip()
        err = stderr.read().decode('utf-8', errors='replace').strip()

        if out:
            print(f"Output:\n{out[:1000]}")
        if err:
            print(f"Stderr:\n{err[:500]}")

        print(f"Exit status: {exit_status}\n{'-'*40}")

    # Re-upload .env after git pull in case git stash pop changed anything
    print("\nRe-uploading .env (post git pull)...")
    sftp = ssh.open_sftp()
    with sftp.open(f'{project_path}/backend/.env', 'w') as f:
        f.write(env_content)
    sftp.close()

    # Save PM2 process list
    stdin, stdout, stderr = ssh.exec_command('pm2 save')
    stdout.channel.recv_exit_status()
    print("PM2 process list saved.")

    ssh.close()
    print("\nDeployment finished successfully!")

except Exception as e:
    print(f"Failed: {e}")
    sys.exit(1)

