#!/usr/bin/env python3
"""
Remove all duplicate *Id1 columns and FK constraints from CRM migration file.
This script fixes EF Core migration bugs that created duplicate foreign key columns.
"""

import re
import sys

def fix_migration_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    lines_removed = 0

    # Remove lines with Id1 column definitions
    # Pattern: any line containing "Id1 = table.Column<Guid>"
    content, count1 = re.subn(r'^\s+\w+Id1 = table\.Column<Guid>.*\n', '', content, flags=re.MULTILINE)
    lines_removed += count1

    # Remove FK constraint blocks for Id1 foreign keys
    # Pattern: table.ForeignKey block with name containing "Id1"
    pattern = r'table\.ForeignKey\(\s*name: "FK_\w+_\w+_\w+Id1",.*?\);'
    content, count2 = re.subn(pattern, '', content, flags=re.DOTALL)
    lines_removed += count2

    # Change all remaining CASCADE to NO ACTION
    content = content.replace('onDelete: ReferentialAction.Cascade', 'onDelete: ReferentialAction.NoAction')

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("[OK] Fixed migration file")
        print(f"   - Removed {count1} duplicate Id1 column definitions")
        print(f"   - Removed {count2} duplicate Id1 FK constraints")
        print("   - Changed all CASCADE to NO ACTION")
        return True
    else:
        print("[SKIP] No changes needed")
        return False

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python fix_migration.py <migration_file_path>")
        sys.exit(1)

    filepath = sys.argv[1]
    try:
        if fix_migration_file(filepath):
            print(f"[SUCCESS] Fixed: {filepath}")
        else:
            print(f"[INFO] No fixes applied to: {filepath}")
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)
