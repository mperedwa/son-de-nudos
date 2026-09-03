#!/usr/bin/env bash

set -euo pipefail

secret_pattern='(sk_(live|test)_[[:alnum:]_-]{12,}|rk_(live|test)_[[:alnum:]_-]{12,}|whsec_[[:alnum:]_-]{12,}|AIza[[:alnum:]_-]{20,}|eyJhbGciOi[[:alnum:]_.-]{20,}|postgres(ql)?://[^[:space:]]+:[^[:space:]@]+@)'
weak_default='admin''123'

secret_files="$(git grep -Il -E "$secret_pattern" -- . ':(exclude)scripts/check-no-secrets.sh' || true)"
weak_files="$(git grep -Il -F "$weak_default" -- . ':(exclude)scripts/check-no-secrets.sh' || true)"

if [[ -n "$secret_files" || -n "$weak_files" ]]; then
  echo 'Potential credentials found in tracked files:' >&2
  {
    printf '%s\n' "$secret_files"
    printf '%s\n' "$weak_files"
  } | sed '/^$/d' | sort -u >&2
  exit 1
fi

echo 'No known credential patterns found in tracked files.'
