# Windows — Copyparty 文件共享服务

> [Copyparty](https://github.com/9001/copyparty) 便携式文件服务器。
> 详细文档参考 [copyparty 官方 Windows 指南](https://github.com/9001/copyparty/blob/hovudstraum/docs/examples/windows.md)。

---

## 安装

**方法 A：下载 copyparty.exe（推荐）**
```powershell
# 单个 exe 文件，即下即用，功能最全
Invoke-WebRequest -Uri "https://github.com/9001/copyparty/releases/latest/download/copyparty.exe" -OutFile "$env:USERPROFILE\Downloads\copyparty.exe"
```

**方法 B：下载 copyparty-sfx.py（更轻量）**
```powershell
# 需要安装 Python（从 python.org 下载）
Invoke-WebRequest -Uri "https://github.com/9001/copyparty/releases/latest/download/copyparty-sfx.py" -OutFile "$env:USERPROFILE\Downloads\copyparty-sfx.py"
```

**方法 C：包管理器安装**
```powershell
pip install copyparty
# 或 scoop install copyparty
```

验证安装：
```powershell
& "$env:USERPROFILE\Downloads\copyparty.exe" --version
# 或 python "$env:USERPROFILE\Downloads\copyparty-sfx.py" --version
```

## 目录结构
```powershell
mkdir D:\data\dev-code, D:\data\test-cases, D:\share -Force
```

## 权限矩阵

| 用户 | /data (浏览) | /data/dev-code | /data/test-cases | /share (上传/读取) | /share (删除) |
|------|-------------|----------------|------------------|-------------------|-------------|
| **admin** | ✅ 读写删 | ✅ 读写删 | ✅ 读写删 | ✅ 读写删 | ✅ |
| **dev** | ✅ 读取 | ✅ 读写删 | ✅ 只读 | ✅ 读写上传 | ❌ |
| **tester** | ✅ 读取 | ✅ 只读 | ✅ 读写删 | ✅ 读写上传 | ❌ |
| **visitor** | ✅ 只读 | ❌ | ❌ | ✅ 读写上传 | ❌ |

## 方式一：参数启动

**使用 copyparty.exe：**
```batch
set CPP_ADMIN_PW=your_admin_password
set CPP_DEV_PW=your_dev_password
set CPP_TESTER_PW=your_tester_password
set CPP_VISITOR_PW=your_visitor_password

copyparty.exe -p 3923 ^
  -a admin:%CPP_ADMIN_PW% -a dev:%CPP_DEV_PW% -a tester:%CPP_TESTER_PW% -a visitor:%CPP_VISITOR_PW% ^
  -v D:\data:/data:r:visitor,rwmd:admin ^
  -v D:\data\dev-code:/data/dev-code:r:tester,rwmd:dev,admin ^
  -v D:\data\test-cases:/data/test-cases:r:dev,rwmd:tester,admin ^
  -v D:\share:/share:rw:visitor,dev,tester,rwmd:admin
```

**使用 copyparty-sfx.py：**
```batch
set CPP_ADMIN_PW=your_admin_password
set CPP_DEV_PW=your_dev_password
set CPP_TESTER_PW=your_tester_password
set CPP_VISITOR_PW=your_visitor_password

python copyparty-sfx.py -p 3923 ^
  -a admin:%CPP_ADMIN_PW% -a dev:%CPP_DEV_PW% -a tester:%CPP_TESTER_PW% -a visitor:%CPP_VISITOR_PW% ^
  -v D:\data:/data:r:visitor,rwmd:admin ^
  -v D:\data\dev-code:/data/dev-code:r:tester,rwmd:dev,admin ^
  -v D:\data\test-cases:/data/test-cases:r:dev,rwmd:tester,admin ^
  -v D:\share:/share:rw:visitor,dev,tester,rwmd:admin
```

> Windows 实际路径使用 `D:\` 前缀，Web 路径统一用 `/` 开头。

## 方式二：配置文件启动

参照 [example.conf](https://github.com/9001/copyparty/blob/hovudstraum/docs/example.conf) 格式。

`party.conf`：
```yaml
[global]
  p: 3923

[accounts]
  # 通过环境变量设置密码，例如 PowerShell: $env:CPP_ADMIN_PW = "your_password"
  admin: {env:CPP_ADMIN_PW}
  dev: {env:CPP_DEV_PW}
  tester: {env:CPP_TESTER_PW}
  visitor: {env:CPP_VISITOR_PW}

# /data 根 — visitor 只读，admin 完全控制
[/data]
  D:\data
  accs:
    r: visitor
    rwmd: admin

# /data/dev-code — dev 读写删，tester 只读
[/data/dev-code]
  D:\data\dev-code
  accs:
    r: tester
    rwmd: dev, admin

# /data/test-cases — tester 读写删，dev 只读
[/data/test-cases]
  D:\data\test-cases
  accs:
    r: dev
    rwmd: tester, admin

# /share — 所有人上传读取，仅 admin 可删除
[/share]
  D:\share
  accs:
    rw: visitor, dev, tester
    rwmd: admin
```

启动：
```batch
copyparty.exe -c party.conf
:: 或
python copyparty-sfx.py -c party.conf
```

## 访问方式

- **Web 界面**：`http://<IP>:3923/`（输入用户名密码登录）
- **WebDAV**：映射网络驱动器 → `http://<IP>:3923/`
- **FTP**：加 `--ftp 3921`

## NSSM Windows 服务（开机自启）

### 1. 安装 NSSM
```powershell
winget install nssm
```

### 2. 注册服务

**使用 copyparty.exe：**
```batch
nssm install cpp "%homedrive%%homepath%\Downloads\copyparty.exe" -c "%homedrive%%homepath%\Documents\party.conf"
nssm set cpp AppDirectory "%homedrive%%homepath%"
```

**使用 copyparty-sfx.py：**
```batch
nssm install cpp "%localappdata%\Programs\Python\Python312\python.exe" "%homedrive%%homepath%\Downloads\copyparty-sfx.py -c %homedrive%%homepath%\Documents\party.conf"
nssm set cpp AppDirectory "%homedrive%%homepath%"
```

> `%homedrive%%homepath%` 是 cmd 语法，在 PowerShell 中对应 `$env:HOMEDRIVE$env:HOMEPATH`。将 `Python312` 改为你实际安装的 Python 版本号。

### 3. 配置服务账户
```batch
nssm set cpp ObjectName .\你的用户名 你的Windows密码
nssm set cpp Start SERVICE_AUTO_START
```

### 4. 启用错误日志（排查问题用）
```batch
nssm set cpp AppStderr "%homedrive%%homepath%\logs\cppsvc.err"
nssm set cpp AppStderrCreationDisposition 2
```

### 5. 启动服务
```batch
nssm start cpp
```
