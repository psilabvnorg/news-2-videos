# N8N Installation Ubuntu

> ✅ n8n installed
> ✅ runs as a **systemd service**
> ✅ listens on **:5678**
> ✅ uses **Node.js 22**
> ✅ env config in `/opt/n8n.env`

---

## ✅ Target Result (same as LXC script)

* App: `n8n`
* Port: `5678`
* Node.js: `22`
* Service: `systemd`
* Config file: `/opt/n8n.env`

---

# 🔹 Step-by-step: Install n8n on Ubuntu (bare metal / VM)

## 1️⃣ Update system

```bash
sudo apt update && sudo apt upgrade -y
```

---

## 2️⃣ Install Node.js 22 (same as script)

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify:

```bash
node -v
npm -v
```

---

## 3️⃣ Install n8n globally

```bash
sudo npm install -g n8n
```

---

## 4️⃣ Create environment file (same logic as script)

```bash
sudo mkdir -p /opt
sudo nano /opt/n8n.env
```

Paste:

```env
N8N_SECURE_COOKIE=false
N8N_PORT=5678
N8N_PROTOCOL=http
N8N_HOST=localhost
NODES_EXCLUDE=[]
```

Save & exit.

---

## 5️⃣ Create systemd service (core replacement for LXC)

```bash
sudo nano /etc/systemd/system/n8n.service
```

Paste:

```ini
[Unit]
Description=n8n automation
After=network.target

[Service]
Type=simple
User=root
EnvironmentFile=/opt/n8n.env
ExecStart=/usr/local/bin/n8n
Restart=always
RestartSec=10
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

---

## 6️⃣ Enable & start n8n

```bash
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable n8n
sudo systemctl start n8n
```

Check status:

```bash
sudo systemctl status n8n
```

---

## 7️⃣ Access n8n

```text
http://localhost:5678
```

Example:

```bash
ip a
```

---

# 🔄 Update n8n later (equivalent to `update_script()`)

```bash
sudo npm install -g n8n --force
sudo systemctl restart n8n
```

---

# 🧠 Mapping: Proxmox Script → Ubuntu

| Proxmox LXC Script      | Ubuntu Equivalent  |
| ----------------------- | ------------------ |
| `build_container`       | Install on host    |
| `NODE_VERSION=22`       | NodeSource setup   |
| `/opt/n8n.env`          | Same               |
| `systemctl restart n8n` | Same               |
| `npm install -g n8n`    | Same               |
| LXC resource limits     | OS / cgroup limits |

---

# 🧩 Optional (recommended in production)

* Run n8n as **dedicated user**
* Put behind **Nginx + HTTPS**
* Use **SQLite/Postgres config**
* Set `N8N_BASIC_AUTH_*`

If you want, I can:

* 🔐 Harden this setup
* 🐳 Convert it to Docker
* 🌐 Add Nginx + SSL
* ⚙️ Match **exact Proxmox helper behavior**

Just say the word.
