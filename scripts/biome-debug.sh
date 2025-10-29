#!/bin/bash

# Biome Debug Script - 带时间戳追踪

echo "Starting Biome check with timestamp tracking..."
echo "Press Ctrl+C to stop if it hangs"
echo "=========================================="
echo ""

# 使用 time 和详细日志
time pnpm exec biome check --write --unsafe \
  --verbose \
  --log-level=info \
  --reporter=summary 2>&1 | \
  while IFS= read -r line; do
    echo "[$(date '+%H:%M:%S.%3N')] $line"
  done

