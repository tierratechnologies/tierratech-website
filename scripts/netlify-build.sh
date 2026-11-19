#!/usr/bin/env bash
# Builds the site on Netlify, whose build image is not relied on to include Dart.
# Also works locally on macOS or Linux. Versions are pinned so builds stay repeatable.
set -euo pipefail

DART_VERSION="3.13.7"
JASPR_VERSION="0.23.5"
SITE_URL="https://tierratech.nz"

case "$(uname -s)-$(uname -m)" in
  Linux-x86_64) platform="linux-x64" ;;
  Linux-aarch64) platform="linux-arm64" ;;
  Darwin-arm64) platform="macos-arm64" ;;
  Darwin-x86_64) platform="macos-x64" ;;
  *) echo "Unsupported platform: $(uname -s)-$(uname -m)" >&2; exit 1 ;;
esac

tool_dir="${TIERRA_TOOL_DIR:-$HOME/.tierra-build}"
sdk_dir="$tool_dir/dart-$DART_VERSION"

if [ ! -x "$sdk_dir/dart-sdk/bin/dart" ]; then
  mkdir -p "$sdk_dir"
  curl -fsSL --retry 3 -o "$sdk_dir/dart.zip" \
    "https://storage.googleapis.com/dart-archive/channels/stable/release/$DART_VERSION/sdk/dartsdk-$platform-release.zip"
  unzip -q -o "$sdk_dir/dart.zip" -d "$sdk_dir"
  rm "$sdk_dir/dart.zip"
fi

export PUB_CACHE="$tool_dir/pub-cache"
export PATH="$sdk_dir/dart-sdk/bin:$PUB_CACHE/bin:$PATH"

dart --disable-analytics >/dev/null
dart pub get --enforce-lockfile
dart pub global activate jaspr_cli "$JASPR_VERSION"
jaspr build --sitemap-domain "$SITE_URL"

# The build leaves tooling files in its output. None of them belong on the live site.
rm -rf build/jaspr/packages build/jaspr/.dart_tool build/jaspr/.build.manifest
