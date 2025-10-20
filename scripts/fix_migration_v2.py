#!/usr/bin/env python3
"""
Remove all duplicate *Id1 columns, FK constraints, indexes, and properties from CRM migration file.
Version 2: Handles multi-line property definitions properly.
"""

import re
import sys

def fix_migration_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Remove duplicate Id1 property definitions (multi-line, including all method chains)
    # Pattern matches: b.Property<Guid?>("...Id1") through all chained methods until semicolon
    pattern_designer_prop = r'b\.Property<Guid\?>\("\w+Id1"\)(?:(?!\bHas(?:Index|Key|One|Many|Foreign|Annotation|Data)\b)[^;])*;'
    content, count1 = re.subn(pattern_designer_prop, '', content, flags=re.DOTALL)

    # Remove HasIndex for Id1 columns in Designer.cs files
    pattern_designer_index = r'b\.HasIndex\("\w+Id1"\);'
    content, count2 = re.subn(pattern_designer_index, '', content)

    # Remove Id1 column definitions in migration Up() method
    pattern_column = r'\w+Id1 = table\.Column<Guid>\([^)]*\),?\n'
    content, count3 = re.subn(pattern_column, '', content)

    # Remove FK constraint blocks for Id1 foreign keys
    pattern_fk = r'table\.ForeignKey\s*\(\s*name:\s*"FK_\w+_\w+_\w+Id1"[^;]*\);'
    content, count4 = re.subn(pattern_fk, '', content, flags=re.DOTALL)

    # Remove index creation blocks for Id1 columns in Up() method
    pattern_index = r'migrationBuilder\.CreateIndex\s*\(\s*name:\s*"IX_\w+_\w+Id1"[^;]*\);'
    content, count5 = re.subn(pattern_index, '', content, flags=re.DOTALL)

    # Change all remaining CASCADE to NO ACTION
    content = content.replace('onDelete: ReferentialAction.Cascade', 'onDelete: ReferentialAction.NoAction')

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("[OK] Fixed migration file")
        print(f"   - Removed {count1} duplicate Id1 property definitions (Designer)")
        print(f"   - Removed {count2} duplicate Id1 HasIndex entries (Designer)")
        print(f"   - Removed {count3} duplicate Id1 column definitions")
        print(f"   - Removed {count4} duplicate Id1 FK constraints")
        print(f"   - Removed {count5} duplicate Id1 index creations")
        print("   - Changed all CASCADE to NO ACTION")
        return True
    else:
        print("[SKIP] No changes needed")
        return False

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python fix_migration_v2.py <migration_file_path>")
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
