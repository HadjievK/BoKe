#!/bin/bash

# Script to update all pages to Nova design system
# Replaces old color scheme with new purple/white theme

# Colors to replace:
# Old gold: #C9993A, #B8860B, #8A6830 -> New purple: #7C3AED (purple-600)
# Old dark: #111111, #1C1812 -> New gray: #0A0A0F or gray-900
# Old light bg: #F8F5F0, #F5F0E8 -> New white/gray-50
# Old text: #888888, #6B6455, #444444 -> New gray-600
# Old border: #E8E2D9 -> New gray-200

# Target files
FILES=(
  "app/[slug]/page.tsx"
  "app/dashboard/[slug]/page.tsx"
  "components/booking/TimeSlotGrid.tsx"
  "components/booking/CustomerForm.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."

    # Background colors
    sed -i 's/#F8F5F0/white/g' "$file"
    sed -i 's/#F5F0E8/white/g' "$file"
    sed -i 's/bg-\[#F8F5F0\]/bg-white/g' "$file"
    sed -i 's/bg-\[#F5F0E8\]/bg-gray-50/g' "$file"

    # Primary colors (gold to purple)
    sed -i 's/#C9993A/#7C3AED/g' "$file"
    sed -i 's/#B8860B/#7C3AED/g' "$file"
    sed -i 's/#8A6830/#7C3AED/g' "$file"
    sed -i 's/\[#C9993A\]/purple-600/g' "$file"
    sed -i 's/\[#B8860B\]/purple-600/g' "$file"

    # Dark colors
    sed -i 's/#111111/#0A0A0F/g' "$file"
    sed -i 's/#1C1812/#0A0A0F/g' "$file"
    sed -i 's/\[#111111\]/gray-900/g' "$file"
    sed -i 's/\[#1C1812\]/gray-900/g' "$file"

    # Text colors
    sed -i 's/#888888/#6B6B80/g' "$file"
    sed -i 's/#6B6455/#6B6B80/g' "$file"
    sed -i 's/#444444/#3D3D4E/g' "$file"
    sed -i 's/\[#888888\]/gray-600/g' "$file"
    sed -i 's/\[#6B6455\]/gray-600/g' "$file"
    sed -i 's/\[#444444\]/gray-700/g' "$file"

    # Border colors
    sed -i 's/#E8E2D9/#E8E8EC/g' "$file"
    sed -i 's/\[#E8E2D9\]/gray-200/g' "$file"

    # Font families
    sed -i "s/fontFamily: 'Playfair Display, serif'/fontFamily: \"'DM Sans', -apple-system, sans-serif\"/g" "$file"
    sed -i "s/fontFamily: 'Fraunces, serif'/fontFamily: \"'DM Sans', -apple-system, sans-serif\"/g" "$file"

  fi
done

echo "Nova design system applied!"
