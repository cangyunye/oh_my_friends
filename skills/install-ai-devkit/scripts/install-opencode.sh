#!/usr/bin/env sh
# ============================================================================
# install-opencode.sh — 从 GitHub 官方 release 下载最新版 opencode
# （anomalyco/opencode，原 sst/opencode）并安装到 ~/.local/bin
# （可用环境变量 INSTALL_DIR 覆盖）。
# 支持 Linux / macOS（x86_64 / arm64）。Windows 请使用 install-opencode.bat。
# 用法: sh install-opencode.sh
# ============================================================================
set -eu

REPO="anomalyco/opencode"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

# ---------- 检测系统与架构，并映射到 release asset 名 ----------
detect_os_arch() {
  case "$(uname -s)" in
    Linux)  OS="linux" ;;
    Darwin) OS="darwin" ;;
    *)
      echo "[ERROR] 不支持的系统: $(uname -s)（本脚本仅支持 Linux/macOS，Windows 请用 install-opencode.bat）" >&2
      exit 1 ;;
  esac
  case "$(uname -m)" in
    x86_64|amd64)   ARCH="x64" ;;
    aarch64|arm64)  ARCH="arm64" ;;
    *)
      echo "[ERROR] 不支持的架构: $(uname -m)" >&2
      exit 1 ;;
  esac
}

# ---------- 获取最新版本 tag（GitHub API 优先，重定向头兜底） ----------
get_latest_tag() {
  tag="$(curl -fsSL --max-time 20 "https://api.github.com/repos/$REPO/releases/latest" \
    | sed -n 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)"
  if [ -z "$tag" ]; then
    tag="$(curl -fsSIL --max-time 20 "https://github.com/$REPO/releases/latest" \
      | sed -n 's/^location:[[:space:]]*.*\/tag\/\(.*\)\r\?$/\1/p' | head -n1)"
  fi
  if [ -z "$tag" ]; then
    echo "[ERROR] 无法获取 $REPO 最新版本（请检查网络；GitHub API 未认证限流 60 次/小时）" >&2
    exit 1
  fi
  printf '%s' "$tag"
}

# ---------- 确保 INSTALL_DIR 在 PATH 中（自动追加到 shell 配置） ----------
ensure_path() {
  case ":$PATH:" in
    *":$INSTALL_DIR:"*) : ;;
    *)
      echo ""
      echo "[WARN] $INSTALL_DIR 不在 PATH 中，尝试写入 shell 配置："
      for rc in "$HOME/.profile" "$HOME/.zshrc" "$HOME/.bashrc"; do
        [ -f "$rc" ] || touch "$rc" 2>/dev/null || continue
        if ! grep -qF "export PATH=\"$INSTALL_DIR" "$rc" 2>/dev/null; then
          printf '\n# added by install-opencode.sh\nexport PATH="%s:$PATH"\n' "$INSTALL_DIR" >> "$rc"
        fi
        echo "   已写入 $rc"
      done
      echo "   重新打开终端后生效；或临时执行: export PATH=\"$INSTALL_DIR:\$PATH\""
      ;;
  esac
}

# ---------- 主流程 ----------
detect_os_arch
TAG="$(get_latest_tag)"

# macOS 用 zip，Linux 用 tar.gz；解压后二进制名为 opencode
case "$OS/$ARCH" in
  linux/x64)   FILE="opencode-linux-x64.tar.gz";    EXTRACT="tar" ;;
  linux/arm64) FILE="opencode-linux-arm64.tar.gz";  EXTRACT="tar" ;;
  darwin/x64)  FILE="opencode-darwin-x64.zip";      EXTRACT="unzip" ;;
  darwin/arm64) FILE="opencode-darwin-arm64.zip";   EXTRACT="unzip" ;;
esac
URL="https://github.com/$REPO/releases/download/$TAG/$FILE"

echo "[INFO] $REPO 最新版本: $TAG"
echo "[INFO] 下载: $URL"
curl -fsSL -C - --retry 3 --max-time 3600 -o "$TMP_DIR/$FILE" "$URL"

echo "[INFO] 解压并安装到 $INSTALL_DIR ..."
if [ "$EXTRACT" = "tar" ]; then
  tar -xzf "$TMP_DIR/$FILE" -C "$TMP_DIR"
else
  unzip -q -o "$TMP_DIR/$FILE" -d "$TMP_DIR"
fi
mkdir -p "$INSTALL_DIR"
install -m 0755 "$TMP_DIR/opencode" "$INSTALL_DIR/opencode"

echo "[OK] opencode 已安装: $INSTALL_DIR/opencode"
"$INSTALL_DIR/opencode" --version || true
ensure_path
