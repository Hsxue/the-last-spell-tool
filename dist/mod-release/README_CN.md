# The Last Spell 地图 Mod

## 简介

这是一个为《The Last Spell》游戏开发的 BepInEx 地图 Mod，允许玩家加载和游玩自定义地图，无需修改游戏源代码。

## 功能特性

- 🔧 **自定义地图加载** - 从 `BepInEx/plugins/LastSpellMapMod/maps/` 目录加载自定义地图
- 🏙️ **城市选择集成** - 自定义地图会出现在城市选择界面
- 🏗️ **预置建筑支持** - 地图可以包含开始时就存在的建筑
- 🛠️ **Python 编辑器兼容** - 可使用现有的 `TileMapEditor/tilemap_tool.py` 创建地图
- 📝 **完全非侵入式** - 不修改任何游戏文件

## 安装方法

### 前置要求

- 《The Last Spell》游戏（Steam 版本）
- BepInEx 5.x 或 6.x 已安装

### 安装步骤

1. 下载最新版本的 Mod 压缩包
2. 解压到游戏目录
3. 启动游戏
4. 在城市选择界面应该能看到 "Example Map" 选项

### 手动安装

如果你需要手动安装：

1. 将 `LastSpellMapMod.dll` 复制到 `BepInEx/plugins/LastSpellMapMod/`
2. 确保 `maps/` 目录存在并包含你的地图文件
3. 启动游戏

## 创建自定义地图

### 方法 1: 使用 Python 编辑器

```bash
# 运行地图编辑器
python TileMapEditor/tilemap_tool.py
```

1. 创建新地图（绘制地形、放置建筑、添加旗帜）
2. 导出到 `BepInEx/plugins/LastSpellMapMod/maps/`
3. 文件名格式: `地图名_TileMap.txt`

### 方法 2: 手动创建

地图文件是 XML 格式，放在 `maps/` 目录下：

```xml
<?xml version="1.0" encoding="utf-8"?>
<TileMap>
    <Id>MyCustomMap</Id>
    <Name>我的自定义地图</Name>
    <Description>这是一个测试地图</Description>
    <Width>30</Width>
    <Height>30</Height>
    <Difficulty>5</Difficulty>
    
    <Grounds>
        <!-- 地形类型: X,Y|DistanceToCity|DistanceToMagicCircle -->
        <CityTile>15,15|0|0</CityTile>
        <Dirt>10,10|2|2</Dirt>
        <Stone>5,5|3|3</Stone>
    </Grounds>
    
    <Flags>
        <!-- 敌人生成点 -->
        <EnemyMagnet>5,15</EnemyMagnet>
        <EnemyMagnet>15,5</EnemyMagnet>
    </Flags>
    
    <Buildings>
        <!-- 预置建筑 -->
        <Building Id="Barricade" X="12" Y="15" Health="100"/>
        <Building Id="House" X="13" Y="13" Health="200"/>
    </Buildings>
</TileMap>
```

### 地图属性说明

| 属性 | 必需 | 说明 |
|------|------|------|
| `Id` | 是 | 地图唯一标识符（文件名去掉 _TileMap 后缀） |
| `Name` | 否 | 显示名称 |
| `Description` | 否 | 地图描述 |
| `Width` | 是 | 地图宽度（格子数） |
| `Height` | 是 | 地图高度（格子数） |
| `Difficulty` | 否 | 难度等级 (1-10)，默认 5 |

### 地形类型

| 类型 | 说明 |
|------|------|
| `CityTile` | 城市中心（安全区） |
| `MagicCircle` | 魔法圈（胜利点） |
| `Dirt` |  dirt 地形 |
| `Stone` | 石头地形（障碍） |
| `Crater` | 陨石坑 |

### 旗帜类型

| 类型 | 说明 |
|------|------|
| `EnemyMagnet` | 敌人生成点 |
| `SpawnerCocoon` | Boss 生成点 |

### 建筑格式

```xml
<Building Id="建筑ID" X="格子X" Y="格子Y" Health="生命值"/>
```

| 属性 | 必需 | 说明 |
|------|------|------|
| `Id` | 是 | 建筑 ID（必须在 BuildingDefinitions.txt 中存在） |
| `X` | 是 | 格子 X 坐标 |
| `Y` | 是 | 格子 Y 坐标 |
| `Health` | 否 | 自定义生命值 |

支持的建筑 ID：
- `Barricade` - 路障
- `House` - 房子
- `Ballista` - 弩炮
- `Tower` - 塔
- 等等...

## 目录结构

```
LastSpellMapMod/
├── BepInEx/
│   └── plugins/
│       └── LastSpellMapMod/
│           ├── LastSpellMapMod.dll    # 主 Mod 文件
│           └── maps/                    # 自定义地图目录
│               ├── ExampleMap_TileMap.txt
│               └── 你的地图_TileMap.txt
└── docs/
    └── README_CN.md                   # 本文档
```

## 故障排除

### 地图没有出现在选择界面

1. 检查日志：`BepInEx/logs/Unity.log`
2. 搜索 `[LastSpellMapMod]` 查看加载信息
3. 确保地图文件以 `_TileMap.txt` 结尾
4. 确保 XML 格式正确

### 游戏崩溃

1. 确保地图尺寸不太大（建议 50x50 以下）
2. 检查建筑 ID 是否正确
3. 确保建筑位置在地图范围内

### Mod 未加载

1. 检查 BepInEx 是否正确安装
2. 检查日志中的错误信息
3. 确保 DLL 文件在正确位置

## 版本历史

### v1.0.0
- 初始版本
- 支持自定义地图加载
- 支持预置建筑
- 兼容 Python 地图编辑器

## 致谢

- [BepInEx](https://github.com/BepInEx/BepInEx) - Mod 框架
- [Harmony](https://github.com/pardeike/Harmony) - 代码补丁库

## 许可证

MIT License
