// MUI to Ant Design Component Migration Map
export const componentMap = {
  // Layout Components
  'Box': 'div', // or Space from antd
  'Container': 'div', // or Layout from antd
  'Grid': 'Row/Col',
  'Stack': 'Space',
  'Paper': 'Card',
  
  // Form Components
  'TextField': 'Input',
  'Select': 'Select',
  'MenuItem': 'Select.Option',
  'FormControl': 'Form.Item',
  'FormLabel': 'label',
  'FormHelperText': 'Form.Item help prop',
  'Checkbox': 'Checkbox',
  'Radio': 'Radio',
  'RadioGroup': 'Radio.Group',
  'Switch': 'Switch',
  'Slider': 'Slider',
  
  // Buttons
  'Button': 'Button',
  'IconButton': 'Button icon',
  'ButtonGroup': 'Button.Group',
  'ToggleButton': 'Button',
  'ToggleButtonGroup': 'Radio.Group or Segmented',
  'Fab': 'Button shape="circle"',
  
  // Navigation
  'AppBar': 'Header',
  'Toolbar': 'Header content',
  'Drawer': 'Drawer',
  'Menu': 'Menu or Dropdown',
  'MenuItem': 'Menu.Item',
  'BottomNavigation': 'TabBar',
  'Breadcrumbs': 'Breadcrumb',
  'Link': 'Link or a',
  'Stepper': 'Steps',
  'Tabs': 'Tabs',
  'Tab': 'Tabs.TabPane',
  
  // Data Display
  'Table': 'Table',
  'TableBody': 'Table dataSource',
  'TableCell': 'Table.Column',
  'TableContainer': 'Table wrapper',
  'TableHead': 'Table columns',
  'TableRow': 'Table record',
  'TablePagination': 'Pagination',
  'List': 'List',
  'ListItem': 'List.Item',
  'ListItemText': 'List.Item.Meta',
  'ListItemIcon': 'Icon in List.Item',
  'ListItemAvatar': 'Avatar in List.Item',
  'Divider': 'Divider',
  'Chip': 'Tag',
  'Tooltip': 'Tooltip',
  'Typography': 'Typography.Text/Title/Paragraph',
  'Avatar': 'Avatar',
  'Badge': 'Badge',
  'Icon': 'Icon',
  
  // Feedback
  'Alert': 'Alert',
  'Dialog': 'Modal',
  'DialogTitle': 'Modal.title',
  'DialogContent': 'Modal content',
  'DialogActions': 'Modal footer',
  'Modal': 'Modal',
  'Snackbar': 'message or notification',
  'CircularProgress': 'Spin',
  'LinearProgress': 'Progress',
  'Skeleton': 'Skeleton',
  
  // Surfaces
  'Accordion': 'Collapse',
  'Card': 'Card',
  'CardContent': 'Card content',
  'CardActions': 'Card.actions',
  'CardMedia': 'Card.cover',
  'CardHeader': 'Card.Meta',
  'Collapse': 'Collapse',
  'ImageList': 'Image.PreviewGroup',
  'ImageListItem': 'Image',
  
  // Utils
  'ClickAwayListener': 'useClickAway hook',
  'Portal': 'ReactDOM.createPortal',
  'Popper': 'Tooltip/Popover',
  'Grow': 'motion',
  'Fade': 'motion',
  'Zoom': 'motion',
  'Slide': 'motion',
};

// Icon Migration Map
export const iconMap = {
  // Action Icons
  'Delete': 'DeleteOutlined',
  'Edit': 'EditOutlined',
  'Save': 'SaveOutlined',
  'Add': 'PlusOutlined',
  'Remove': 'MinusOutlined',
  'Search': 'SearchOutlined',
  'Settings': 'SettingOutlined',
  'Home': 'HomeOutlined',
  'Help': 'QuestionCircleOutlined',
  'Info': 'InfoCircleOutlined',
  'Warning': 'WarningOutlined',
  'Error': 'CloseCircleOutlined',
  'Success': 'CheckCircleOutlined',
  'Close': 'CloseOutlined',
  'Menu': 'MenuOutlined',
  'MoreVert': 'MoreOutlined',
  'MoreHoriz': 'EllipsisOutlined',
  'Refresh': 'ReloadOutlined',
  'Download': 'DownloadOutlined',
  'Upload': 'UploadOutlined',
  'Copy': 'CopyOutlined',
  'Print': 'PrinterOutlined',
  'Share': 'ShareAltOutlined',
  'Favorite': 'HeartOutlined',
  'FavoriteBorder': 'HeartOutlined',
  'Star': 'StarOutlined',
  'StarBorder': 'StarOutlined',
  
  // Navigation Icons
  'ArrowBack': 'ArrowLeftOutlined',
  'ArrowForward': 'ArrowRightOutlined',
  'ArrowUpward': 'ArrowUpOutlined',
  'ArrowDownward': 'ArrowDownOutlined',
  'ChevronLeft': 'LeftOutlined',
  'ChevronRight': 'RightOutlined',
  'ExpandMore': 'DownOutlined',
  'ExpandLess': 'UpOutlined',
  'FirstPage': 'VerticalRightOutlined',
  'LastPage': 'VerticalLeftOutlined',
  
  // File Icons
  'Folder': 'FolderOutlined',
  'FolderOpen': 'FolderOpenOutlined',
  'InsertDriveFile': 'FileOutlined',
  'AttachFile': 'PaperClipOutlined',
  'CloudUpload': 'CloudUploadOutlined',
  'CloudDownload': 'CloudDownloadOutlined',
  
  // Communication Icons
  'Email': 'MailOutlined',
  'Phone': 'PhoneOutlined',
  'Message': 'MessageOutlined',
  'Send': 'SendOutlined',
  'Notifications': 'BellOutlined',
  'NotificationsActive': 'BellFilled',
  
  // Editor Icons
  'FormatBold': 'BoldOutlined',
  'FormatItalic': 'ItalicOutlined',
  'FormatUnderlined': 'UnderlineOutlined',
  'FormatQuote': 'FontColorsOutlined',
  'Code': 'CodeOutlined',
  'Link': 'LinkOutlined',
  
  // Media Icons
  'PlayArrow': 'PlayCircleOutlined',
  'Pause': 'PauseCircleOutlined',
  'Stop': 'StopOutlined',
  'SkipNext': 'StepForwardOutlined',
  'SkipPrevious': 'StepBackwardOutlined',
  'VolumeUp': 'SoundOutlined',
  'VolumeOff': 'AudioMutedOutlined',
  'Fullscreen': 'FullscreenOutlined',
  'FullscreenExit': 'FullscreenExitOutlined',
  
  // Device Icons
  'Computer': 'DesktopOutlined',
  'Smartphone': 'MobileOutlined',
  'Tablet': 'TabletOutlined',
  'Keyboard': 'KeyOutlined',
  'Mouse': 'SelectOutlined',
  
  // Social Icons
  'Facebook': 'FacebookOutlined',
  'Twitter': 'TwitterOutlined',
  'LinkedIn': 'LinkedinOutlined',
  'GitHub': 'GithubOutlined',
  'Instagram': 'InstagramOutlined',
  'YouTube': 'YoutubeOutlined',
  
  // Business Icons
  'Business': 'ShopOutlined',
  'Store': 'ShoppingOutlined',
  'ShoppingCart': 'ShoppingCartOutlined',
  'AccountBalance': 'BankOutlined',
  'Receipt': 'FileTextOutlined',
  'Assessment': 'BarChartOutlined',
  'TrendingUp': 'RiseOutlined',
  'TrendingDown': 'FallOutlined',
  
  // User Icons
  'Person': 'UserOutlined',
  'PersonAdd': 'UserAddOutlined',
  'Group': 'TeamOutlined',
  'SupervisorAccount': 'UsergroupAddOutlined',
  'AccountCircle': 'UserOutlined',
  
  // Status Icons
  'CheckCircle': 'CheckCircleOutlined',
  'Cancel': 'CloseCircleOutlined',
  'Block': 'StopOutlined',
  'ReportProblem': 'ExclamationCircleOutlined',
  'HelpOutline': 'QuestionCircleOutlined',
  
  // Toggle Icons
  'Visibility': 'EyeOutlined',
  'VisibilityOff': 'EyeInvisibleOutlined',
  'Lock': 'LockOutlined',
  'LockOpen': 'UnlockOutlined',
  
  // Other Common Icons
  'Dashboard': 'DashboardOutlined',
  'Backup': 'CloudSyncOutlined',
  'CloudBackup': 'CloudUploadOutlined',
  'CloudDone': 'CloudServerOutlined',
  'Schedule': 'ScheduleOutlined',
  'History': 'HistoryOutlined',
  'Restore': 'RollbackOutlined',
  'Security': 'SafetyOutlined',
  'AdminPanelSettings': 'ControlOutlined',
  'Description': 'FileTextOutlined',
  'FileCopy': 'CopyOutlined',
  'Archive': 'InboxOutlined',
  'Unarchive': 'ExportOutlined',
  'Storage': 'DatabaseOutlined',
  'Memory': 'HddOutlined',
  'Speed': 'ThunderboltOutlined',
  'Timeline': 'LineChartOutlined',
  'DataUsage': 'PieChartOutlined',
  'BarChart': 'BarChartOutlined',
  'ShowChart': 'LineChartOutlined',
  'BubbleChart': 'DotChartOutlined',
};