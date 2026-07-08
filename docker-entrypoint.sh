#!/bin/sh
# Bound V8's heap to the container's memory limit before starting the server.
#
# Why: without --max-old-space-size, V8 sizes its old space against a very large
# default (it does not reliably read the cgroup limit), so under sustained load
# heapTotal grows and is never returned to the OS. Container RSS then ratchets
# upward for days until it hits the memory limit and the container is OOM-killed.
# Capping old space makes GC run against a real ceiling so RSS plateaus safely.
#
# The cap adapts to whatever memory the platform gives the container. Override
# explicitly with NODE_MAX_OLD_SPACE_MB if you want a fixed value.
set -e

read_limit() {
	if [ -f /sys/fs/cgroup/memory.max ]; then
		cat /sys/fs/cgroup/memory.max                      # cgroup v2
	elif [ -f /sys/fs/cgroup/memory/memory.limit_in_bytes ]; then
		cat /sys/fs/cgroup/memory/memory.limit_in_bytes    # cgroup v1
	fi
}

# Fallback when no usable cgroup limit is visible (the common PaaS case, where
# the container's own cgroup reports "max"). Tunable via env, no rebuild needed.
DEFAULT_CAP_MB="${DEFAULT_OLD_SPACE_MB:-384}"
cap_mb="$DEFAULT_CAP_MB"

limit_bytes="$(read_limit 2>/dev/null || true)"
if [ -n "$limit_bytes" ] && [ "$limit_bytes" != "max" ] && [ "$limit_bytes" -gt 0 ] 2>/dev/null; then
	limit_mb=$((limit_bytes / 1048576))
	# Only auto-derive for a sane per-container range. A very large reported limit
	# usually means "effectively unlimited" (cgroup exposes host RAM); deriving a
	# multi-GB cap from that would not bound anything, so fall back to the default.
	if [ "$limit_mb" -ge 128 ] && [ "$limit_mb" -le 4096 ]; then
		# ~75% of the limit, but always leave >=160MB for young gen + native
		# allocations + non-heap RSS overhead. Floor at 96MB.
		cap_mb=$((limit_mb * 75 / 100))
		if [ $((limit_mb - cap_mb)) -lt 160 ]; then
			cap_mb=$((limit_mb - 160))
		fi
		[ "$cap_mb" -lt 96 ] && cap_mb=96
	fi
fi

# Explicit override wins.
if [ -n "$NODE_MAX_OLD_SPACE_MB" ]; then
	cap_mb="$NODE_MAX_OLD_SPACE_MB"
fi

export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--max-old-space-size=${cap_mb}"
echo "[entrypoint] container mem limit=${limit_mb:-unknown}MB -> --max-old-space-size=${cap_mb}MB"

exec node server.js
