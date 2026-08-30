#!/usr/bin/env bash
# Enterprise Multi-Tenant Microservice Suite - Automated Project Analyzer & Health Check (Bash/Linux/macOS)
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "================================================================================"
echo "      ENTERPRISE MULTI-TENANT SUITE - REPOSITORY & ARCHITECTURE ANALYZER        "
echo "================================================================================"
echo "[*] Project Root: $PROJECT_ROOT"
echo "[*] Timestamp:    $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

echo "--------------------------------------------------------------------------------"
echo "  1. ENVIRONMENT & PREREQUISITES AUDIT"
echo "--------------------------------------------------------------------------------"
check_cmd() {
    local name="$1"
    local cmd="$2"
    local arg="$3"
    if command -v "$cmd" &> /dev/null; then
        local ver=$($cmd $arg 2>&1 | head -n 1)
        echo "  [OK] $name : $ver"
    else
        echo "  [WARN] $name : $cmd not found in PATH"
    fi
}

check_cmd "Java JDK" "java" "-version"
check_cmd "Docker Engine" "docker" "--version"
check_cmd "Node.js" "node" "--version"

if [ -f "$PROJECT_ROOT/mvnw" ]; then
    echo "  [OK] Maven Wrapper : Present ($PROJECT_ROOT/mvnw)"
else
    echo "  [FAIL] Maven Wrapper : Missing mvnw"
fi

echo ""
echo "--------------------------------------------------------------------------------"
echo "  2. MODULE CODE & ARCHITECTURE AUDIT"
echo "--------------------------------------------------------------------------------"
printf "%-25s %-10s %-12s %-12s %-12s %-10s\n" "Module" "Port" "Source Files" "Test Files" "Controllers" "Entities"
printf "%-25s %-10s %-12s %-12s %-12s %-10s\n" "------" "----" "------------" "----------" "-----------" "--------"

declare -A MODULE_PORTS=(
    ["common-starter"]="Library"
    ["api-gateway"]="8080"
    ["auth-tenant-service"]="8081"
    ["product-service"]="8082"
    ["async-worker-service"]="8083"
    ["config-feature-service"]="8084"
    ["order-service"]="8085"
)

MODULE_LIST=("common-starter" "api-gateway" "auth-tenant-service" "product-service" "async-worker-service" "config-feature-service" "order-service")

for mod in "${MODULE_LIST[@]}"; do
    mod_dir="$PROJECT_ROOT/$mod"
    if [ -d "$mod_dir" ]; then
        src_count=$(find "$mod_dir/src/main/java" -type f -name "*.java" 2>/dev/null | wc -l || echo 0)
        test_count=$(find "$mod_dir/src/test/java" -type f -name "*.java" 2>/dev/null | wc -l || echo 0)
        ctrl_count=$(grep -rnE "@RestController|@Controller" "$mod_dir/src/main/java" 2>/dev/null | wc -l || echo 0)
        ent_count=$(grep -rnE "@Entity" "$mod_dir/src/main/java" 2>/dev/null | wc -l || echo 0)
        printf "%-25s %-10s %-12s %-12s %-12s %-10s\n" "$mod" "${MODULE_PORTS[$mod]}" "$src_count" "$test_count" "$ctrl_count" "$ent_count"
    fi
done

echo ""
echo "--------------------------------------------------------------------------------"
echo "  3. INFRASTRUCTURE & DOCKER SERVICES"
echo "--------------------------------------------------------------------------------"
if command -v docker &> /dev/null; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "  [WARN] Docker daemon unreachable."
else
    echo "  [WARN] Docker not installed."
fi

echo ""
echo "================================================================================"
echo "  AUDIT COMPLETE"
echo "================================================================================"

