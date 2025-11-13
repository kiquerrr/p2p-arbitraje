#!/bin/bash

echo "🔄 RESET DE BASE DE DATOS PARA TESTING"
echo "======================================"
echo ""
echo "⚠️  ADVERTENCIA: Esto eliminará TODOS los datos"
echo ""
read -p "¿Continuar? (SI/no): " confirm

if [ "$confirm" != "SI" ]; then
    echo "❌ Cancelado"
    exit 1
fi

echo ""
echo "📊 Ejecutando reset..."
PGPASSWORD=postgres2025 psql -U postgres -d p2p_arbitrage -f /home/p2p-arbitrage/database/reset_for_testing.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Reset exitoso"
    echo "🔐 Usuario: admin / Password: admin123"
    echo "💰 Vault: $0.00"
    echo "🚀 Listo para testing!"
else
    echo "❌ Error"
    exit 1
fi
