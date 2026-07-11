# macOS — Copyparty 文件共享服务

> [Copyparty](https://github.com/9001/copyparty) 便携式文件服务器，HTTP/WebDAV/SFTP/FTP/TFTP/SMB。

---

## 安装
```bash
curl -LO https://github.com/9001/copyparty/releases/latest/download/copyparty-sfx.py
chmod +x copyparty-sfx.py
# 或 brew install copyparty  /  pip3 install copyparty
python3 copyparty-sfx.py --version
```

## 目录结构
```bash
sudo mkdir -p /data/dev-code /data/test-cases /share
sudo chown -R $(whoami) /data /share
```

## 权限矩阵

| 用户 | /data (浏览) | /data/dev-code | /data/test-cases | /share (上传/读取) | /share (删除) |
|------|-------------|----------------|------------------|-------------------|-------------|
| **admin** | ✅ 读写删 | ✅ 读写删 | ✅ 读写删 | ✅ 读写删 | ✅ |
| **dev** | ✅ 读取 | ✅ 读写删 | ✅ 只读 | ✅ 读写上传 | ❌ |
| **tester** | ✅ 读取 | ✅ 只读 | ✅ 读写删 | ✅ 读写上传 | ❌ |
| **visitor** | ✅ 只读 | ❌ | ❌ | ✅ 读写上传 | ❌ |

## 方式一：参数启动
```bash
export CPP_ADMIN_PW=your_admin_password
export CPP_DEV_PW=your_dev_password
export CPP_TESTER_PW=your_tester_password
export CPP_VISITOR_PW=your_visitor_password

python3 copyparty-sfx.py \
  -p 3923 \
  -a admin:$CPP_ADMIN_PW -a dev:$CPP_DEV_PW -a tester:$CPP_TESTER_PW -a visitor:$CPP_VISITOR_PW \
  -v /data:/data:r:visitor,rwmd:admin \
  -v /data/dev-code:/data/dev-code:r:tester,rwmd:dev,admin \
  -v /data/test-cases:/data/test-cases:r:dev,rwmd:tester,admin \
  -v /share:/share:rw:visitor,dev,tester,rwmd:admin
```

## 方式二：配置文件启动

参照 [example.conf](https://github.com/9001/copyparty/blob/hovudstraum/docs/example.conf) 格式。

`copyparty.conf`：
```ini
[global]
  p: 3923

[accounts]
  # 通过环境变量设置密码，例如: export CPP_ADMIN_PW="your_password"
  admin: {env:CPP_ADMIN_PW}
  dev: {env:CPP_DEV_PW}
  tester: {env:CPP_TESTER_PW}
  visitor: {env:CPP_VISITOR_PW}

[/data]
  /data
  accs:
    r: visitor
    rwmd: admin

[/data/dev-code]
  /data/dev-code
  accs:
    r: tester
    rwmd: dev, admin

[/data/test-cases]
  /data/test-cases
  accs:
    r: dev
    rwmd: tester, admin

[/share]
  /share
  accs:
    rw: visitor, dev, tester
    rwmd: admin
```

启动：`python3 copyparty-sfx.py -c copyparty.conf`

## 访问方式

- **Web 界面**：`http://<IP>:3923/`
- **WebDAV**：访达 → 前往 → 连接服务器
- **FTP**：加 `--ftp 3921`
- **SFTP**：加 `--sftp 3922`（需 paramiko）

## launchd 守护进程

`~/Library/LaunchAgents/local.copyparty.plist`：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key><string>local.copyparty</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/python3</string>
        <string>/opt/copyparty-sfx.py</string>
        <string>-c</string>
        <string>/etc/copyparty.conf</string>
    </array>
    <key>RunAtLoad</key><true/>
    <key>KeepAlive</key><true/>
</dict>
</plist>
```
```bash
launchctl load ~/Library/LaunchAgents/local.copyparty.plist
launchctl start local.copyparty
```
