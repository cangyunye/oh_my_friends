# Linux — Copyparty 文件共享服务

> [Copyparty](https://github.com/9001/copyparty) 便携式文件服务器，支持 HTTP/WebDAV/SFTP/FTP/TFTP/SMB，
> 带断点续传、去重、缩略图、媒体索引，单文件部署。

---

## 安装

```bash
wget -qO copyparty-sfx.py https://github.com/9001/copyparty/releases/latest/download/copyparty-sfx.py
chmod +x copyparty-sfx.py
# 或 pip install copyparty
python3 copyparty-sfx.py --version
```

## 目录结构

```bash
sudo mkdir -p /data/dev-code /data/test-cases /share
```

```
/data/               # 主数据目录
├── dev-code/        # 开发代码
├── test-cases/      # 测试用例
/share/              # 共享目录（所有人上传，仅 admin 可删除）
```

## 用户与权限矩阵

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
  # 监听端口
  p: 3923

[accounts]
  # 通过环境变量设置密码，例如: export CPP_ADMIN_PW="your_password"
  admin: {env:CPP_ADMIN_PW}
  dev: {env:CPP_DEV_PW}
  tester: {env:CPP_TESTER_PW}
  visitor: {env:CPP_VISITOR_PW}

# /data 根目录 — visitor 只读，admin 完全控制
[/data]
  /data
  accs:
    r: visitor
    rwmd: admin

# /data/dev-code — dev 读写删，tester 只读，admin 完全控制
[/data/dev-code]
  /data/dev-code
  accs:
    r: tester
    rwmd: dev, admin

# /data/test-cases — tester 读写删，dev 只读，admin 完全控制
[/data/test-cases]
  /data/test-cases
  accs:
    r: dev
    rwmd: tester, admin

# /share 共享目录 — 所有人可读写上传，仅 admin 可删除
[/share]
  /share
  accs:
    rw: visitor, dev, tester
    rwmd: admin
```

启动：`python3 copyparty-sfx.py -c copyparty.conf`

## 访问方式

- **Web 界面**：`http://<IP>:3923/`（输入用户名和密码登录）
- **WebDAV**：挂载网络驱动器
- **FTP**：加 `--ftp 3921`
- **SFTP**：加 `--sftp 3922`（需 paramiko）

## systemd 服务

`/etc/systemd/system/copyparty.service`：
```ini
[Unit]
Description=Copyparty File Server
After=network.target
[Service]
ExecStart=/usr/bin/python3 /opt/copyparty-sfx.py -c /etc/copyparty.conf
Restart=always
User=root
[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now copyparty
```
