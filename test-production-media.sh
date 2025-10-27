#!/bin/bash
# Скрипт для тестування динамічної генерації зображень в продакшені

echo "🔍 Тестування динамічної генерації зображень"
echo "=============================================="

SERVER="http://89.116.31.189"

# Тестові файли (замініть на реальні файли з вашого сервера)
declare -a files=(
    "4041.png"
    "volgnpz.jpg" 
    "1761574574725_59m3t1s5ikd.jpg"
)

echo ""
echo "📋 Тестуємо доступність оригінальних файлів:"

for file in "${files[@]}"
do
    # Визначаємо перші два символи для структури папок
    char1=${file:0:1}
    char2=${file:1:1}
    
    full_url="$SERVER/media/gallery/full/$char1/$char2/$file"
    
    echo -n "  $file (full): "
    
    # Перевіряємо HTTP статус
    status=$(curl -s -o /dev/null -w "%{http_code}" "$full_url")
    
    if [ "$status" -eq 200 ]; then
        echo "✅ OK ($status)"
    else
        echo "❌ FAILED ($status)"
    fi
done

echo ""
echo "🔧 Тестуємо генерацію зменшених розмірів:"

for file in "${files[@]}"
do
    char1=${file:0:1}
    char2=${file:1:1}
    
    intxt_url="$SERVER/media/gallery/intxt/$char1/$char2/$file"
    tmb_url="$SERVER/media/gallery/tmb/$char1/$char2/$file"
    
    echo -n "  $file (intxt): "
    status=$(curl -s -o /dev/null -w "%{http_code}" "$intxt_url")
    if [ "$status" -eq 200 ]; then
        echo "✅ OK ($status)"
    else
        echo "❌ FAILED ($status)"
    fi
    
    echo -n "  $file (tmb): "
    status=$(curl -s -o /dev/null -w "%{http_code}" "$tmb_url")
    if [ "$status" -eq 200 ]; then
        echo "✅ OK ($status)"
    else
        echo "❌ FAILED ($status)"
    fi
    
    echo ""
done

echo "🌐 Тестування прямого API:"
echo ""

# Тестуємо API напряму (якщо nginx не налаштований)
api_url="http://localhost:3000/api/media/gallery"

for file in "${files[@]}"
do
    char1=${file:0:1}
    char2=${file:1:1}
    
    echo -n "  API tmb/$char1/$char2/$file: "
    status=$(curl -s -o /dev/null -w "%{http_code}" "$api_url/tmb/$char1/$char2/$file")
    if [ "$status" -eq 200 ]; then
        echo "✅ OK ($status)"
    else
        echo "❌ FAILED ($status)"
    fi
done

echo ""
echo "📊 Перевірка створених файлів на диску:"
echo ""

MEDIA_PATH="/var/media/galinfo/gallery"

for file in "${files[@]}"
do
    char1=${file:0:1}
    char2=${file:1:1}
    
    # Конвертуємо розширення для зжатих версій
    base_name="${file%.*}"
    
    full_path="$MEDIA_PATH/full/$char1/$char2/$file"
    intxt_path="$MEDIA_PATH/intxt/$char1/$char2/${base_name}.jpg"
    tmb_path="$MEDIA_PATH/tmb/$char1/$char2/${base_name}.jpg"
    
    echo "  $file:"
    
    if [ -f "$full_path" ]; then
        size=$(du -h "$full_path" | cut -f1)
        echo "    Full:  ✅ $size ($full_path)"
    else
        echo "    Full:  ❌ NOT FOUND ($full_path)"
    fi
    
    if [ -f "$intxt_path" ]; then
        size=$(du -h "$intxt_path" | cut -f1)
        echo "    Intxt: ✅ $size ($intxt_path)"
    else
        echo "    Intxt: ⏳ NOT YET GENERATED ($intxt_path)"
    fi
    
    if [ -f "$tmb_path" ]; then
        size=$(du -h "$tmb_path" | cut -f1)
        echo "    Tmb:   ✅ $size ($tmb_path)"
    else
        echo "    Tmb:   ⏳ NOT YET GENERATED ($tmb_path)"
    fi
    
    echo ""
done

echo "🚀 Готово! Перевірте результати вище."
echo ""
echo "💡 Якщо бачите ❌ FAILED, перевірте:"
echo "   • Чи запущений Next.js сервер (pm2 list)"
echo "   • Чи правильно налаштований nginx" 
echo "   • Чи існують оригінальні файли в папці full"
echo ""
echo "💡 Якщо бачите ⏳ NOT YET GENERATED:"
echo "   • Це нормально! Файли створюються при першому запиті"
echo "   • Спробуйте відкрити URL в браузері, щоб згенерувати файл"
