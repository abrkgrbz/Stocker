#!/usr/bin/env python3
"""
Migrate Ant Design icons to Heroicons
"""
import os
import re
import sys

# Icon mapping: AntD -> Heroicon
ICON_MAP = {
    "ArrowLeftOutlined": "ArrowLeftIcon",
    "SaveOutlined": "CheckIcon",
    "UserOutlined": "UserIcon",
    "EditOutlined": "PencilIcon",
    "ClockCircleOutlined": "ClockIcon",
    "CheckCircleOutlined": "CheckCircleIcon",
    "DeleteOutlined": "TrashIcon",
    "PlusOutlined": "PlusIcon",
    "CalendarOutlined": "CalendarIcon",
    "SearchOutlined": "MagnifyingGlassIcon",
    "FileTextOutlined": "DocumentTextIcon",
    "EyeOutlined": "EyeIcon",
    "TeamOutlined": "UserGroupIcon",
    "LaptopOutlined": "ComputerDesktopIcon",
    "ToolOutlined": "WrenchIcon",
    "RocketOutlined": "RocketLaunchIcon",
    "GiftOutlined": "GiftIcon",
    "ExclamationCircleOutlined": "ExclamationCircleIcon",
    "DollarOutlined": "CurrencyDollarIcon",
    "CrownOutlined": "StarIcon",
    "CloseOutlined": "XMarkIcon",
    "CloseCircleOutlined": "XCircleIcon",
    "SafetyCertificateOutlined": "ShieldCheckIcon",
    "MailOutlined": "EnvelopeIcon",
    "WarningOutlined": "ExclamationTriangleIcon",
    "WalletOutlined": "WalletIcon",
    "TrophyOutlined": "TrophyIcon",
    "StarFilled": "StarIcon",
    "PrinterOutlined": "PrinterIcon",
    "PhoneOutlined": "PhoneIcon",
    "NotificationOutlined": "BellIcon",
    "HomeOutlined": "HomeIcon",
    "FileOutlined": "DocumentIcon",
    "FieldTimeOutlined": "ClockIcon",
    "EnvironmentOutlined": "MapPinIcon",
    "BookOutlined": "BookOpenIcon",
    "AimOutlined": "CursorArrowRaysIcon",
    "SendOutlined": "PaperAirplaneIcon",
    "SafetyOutlined": "ShieldCheckIcon",
    "PlusCircleOutlined": "PlusCircleIcon",
    "LoadingOutlined": "ArrowPathIcon",
    "ReloadOutlined": "ArrowPathIcon",
    "SettingOutlined": "Cog6ToothIcon",
    "InfoCircleOutlined": "InformationCircleIcon",
    "FilterOutlined": "FunnelIcon",
    "SortAscendingOutlined": "BarsArrowUpIcon",
    "SortDescendingOutlined": "BarsArrowDownIcon",
    "DownloadOutlined": "ArrowDownTrayIcon",
    "UploadOutlined": "ArrowUpTrayIcon",
    "LinkOutlined": "LinkIcon",
    "GlobalOutlined": "GlobeAltIcon",
    "LockOutlined": "LockClosedIcon",
    "UnlockOutlined": "LockOpenIcon",
    "HeartOutlined": "HeartIcon",
    "BankOutlined": "BuildingLibraryIcon",
    "ShopOutlined": "BuildingStorefrontIcon",
    "BellOutlined": "BellIcon",
    "MessageOutlined": "ChatBubbleLeftIcon",
    "CommentOutlined": "ChatBubbleOvalLeftIcon",
    "QuestionCircleOutlined": "QuestionMarkCircleIcon",
    "FolderOutlined": "FolderIcon",
    "TagOutlined": "TagIcon",
    "TagsOutlined": "TagIcon",
    "FlagOutlined": "FlagIcon",
    "PieChartOutlined": "ChartPieIcon",
    "BarChartOutlined": "ChartBarIcon",
    "LineChartOutlined": "ChartBarIcon",
    "DashboardOutlined": "Squares2X2Icon",
    "AppstoreOutlined": "Squares2X2Icon",
    "MenuOutlined": "Bars3Icon",
    "MoreOutlined": "EllipsisHorizontalIcon",
    "EllipsisOutlined": "EllipsisHorizontalIcon",
    "UserAddOutlined": "UserPlusIcon",
    "RightOutlined": "ChevronRightIcon",
    "LeftOutlined": "ChevronLeftIcon",
    "UpOutlined": "ChevronUpIcon",
    "DownOutlined": "ChevronDownIcon",
    "MinusOutlined": "MinusIcon",
    "CheckOutlined": "CheckIcon",
    "CopyOutlined": "ClipboardDocumentIcon",
    "IdcardOutlined": "IdentificationIcon",
    "ProfileOutlined": "DocumentTextIcon",
    "SolutionOutlined": "ClipboardDocumentCheckIcon",
    "ContainerOutlined": "ArchiveBoxIcon",
    "InboxOutlined": "InboxIcon",
    "ScheduleOutlined": "CalendarDaysIcon",
    "CarryOutOutlined": "CheckBadgeIcon",
    "AuditOutlined": "ClipboardDocumentListIcon",
    "FileSearchOutlined": "DocumentMagnifyingGlassIcon",
    "FileDoneOutlined": "DocumentCheckIcon",
    "FileExcelOutlined": "DocumentIcon",
    "FilePdfOutlined": "DocumentIcon",
    "FileWordOutlined": "DocumentIcon",
    "FileImageOutlined": "PhotoIcon",
    "PictureOutlined": "PhotoIcon",
    "CloudOutlined": "CloudIcon",
    "CloudUploadOutlined": "CloudArrowUpIcon",
    "CloudDownloadOutlined": "CloudArrowDownIcon",
    "SyncOutlined": "ArrowPathIcon",
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Check if file uses ant-design icons
    if "@ant-design/icons" not in content:
        return False
    
    # Find all ant-design icon imports
    import_pattern = r"import\s*\{([^}]+)\}\s*from\s*['\"]@ant-design/icons['\"]"
    match = re.search(import_pattern, content)
    
    if not match:
        return False
    
    icons_str = match.group(1)
    icons = [i.strip() for i in icons_str.split(',') if i.strip()]
    
    # Map icons
    heroicons = []
    unmapped = []
    for icon in icons:
        if icon in ICON_MAP:
            heroicons.append(ICON_MAP[icon])
        else:
            unmapped.append(icon)
    
    if unmapped:
        print(f"  WARNING: Unmapped icons in {filepath}: {unmapped}")
    
    # Remove duplicates while preserving order
    heroicons = list(dict.fromkeys(heroicons))
    
    if not heroicons:
        return False
    
    # Create new import statement
    heroicons_import = f"import {{\n  {',\n  '.join(sorted(heroicons))},\n}} from '@heroicons/react/24/outline';"
    
    # Check if heroicons import already exists
    if "@heroicons/react/24/outline" in content:
        # Merge with existing import
        existing_pattern = r"import\s*\{([^}]+)\}\s*from\s*['\"]@heroicons/react/24/outline['\"]"
        existing_match = re.search(existing_pattern, content)
        if existing_match:
            existing_icons = [i.strip() for i in existing_match.group(1).split(',') if i.strip()]
            all_icons = list(dict.fromkeys(existing_icons + heroicons))
            new_import = f"import {{\n  {',\n  '.join(sorted(all_icons))},\n}} from '@heroicons/react/24/outline';"
            content = re.sub(existing_pattern + r";?", new_import, content)
    else:
        # Add new heroicons import after the ant-design import line
        content = re.sub(import_pattern + r";?", heroicons_import, content)
    
    # Replace icon usages in JSX
    for antd, hero in ICON_MAP.items():
        # Replace <IconName /> and <IconName prop="value" />
        content = re.sub(
            rf'<{antd}\s*/>', 
            f'<{hero} className="w-4 h-4" />', 
            content
        )
        content = re.sub(
            rf'<{antd}\s+([^/]*)/>', 
            rf'<{hero} className="w-4 h-4" \1/>', 
            content
        )
        # Replace icon={<IconName />}
        content = re.sub(
            rf'icon=\{{<{antd}\s*/>\}}',
            f'icon={{<{hero} className="w-4 h-4" />}}',
            content
        )
        content = re.sub(
            rf'icon=\{{<{antd}\s+([^/]*)/>\}}',
            rf'icon={{<{hero} className="w-4 h-4" \1/>}}',
            content
        )
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    src_dir = "src/app"
    processed = 0
    modified = 0
    
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                processed += 1
                if process_file(filepath):
                    modified += 1
                    print(f"Modified: {filepath}")
    
    print(f"\nProcessed {processed} files, modified {modified}")

if __name__ == "__main__":
    main()
