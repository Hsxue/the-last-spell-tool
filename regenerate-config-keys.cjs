const fs = require('fs');
const enPath = 'src/i18n/locales/en/common.json';
const zhPath = 'src/i18n/locales/zh/common.json';

let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let zh = JSON.parse(fs.readFileSync(zhPath, 'utf8'));

if (!en.configTab) en.configTab = { tabs: {}, basic: {} };
if (!zh.configTab) zh.configTab = { tabs: {}, basic: {} };

const add = (section, key, enV, zhV) => {
  if (!en.configTab[section]) en.configTab[section] = {};
  if (!zh.configTab[section]) zh.configTab[section] = {};
  en.configTab[section][key] = enV;
  zh.configTab[section][key] = zhV;
};

// tabs
add('tabs','basic','Basic','基础配置');
add('tabs','corruption','Corruption','腐蚀配置');
add('tabs','directions','Directions','方向配置');
add('tabs','elites','Elites','精英配置');
add('tabs','fog','Fog','迷雾配置');
add('tabs','resources','Resources','资源配置');
add('tabs','spawn','Spawn','生成配置');
add('tabs','waves','Waves','波次配置');
add('tabs','waveDefinitions','波次定义','波次定义');

// BasicConfigTab
add('basic','title','Basic Configuration','基本配置');
add('basic','template','Template','模板');
add('basic','templatePlaceholder','Select a template...','选择模板...');
add('basic','templateDesc','Apply a preconfigured template (will override Map ID, Victory Days, Difficulty and Max Glyph Points)','应用预配置模板（将覆盖地图ID、胜利天数、难度和最大符文点数）');
add('basic','templateItem','{name} ({days} days, difficulty {difficulty})','{name}（{days}天，难度{difficulty}）');
add('basic','mapId','Map ID','地图ID');
add('basic','mapIdPlaceholder','Enter map ID','输入地图ID');
add('basic','mapIdDesc','Unique identifier for this configuration','此配置的唯一标识符');
add('basic','fogId','Fog ID','迷雾ID');
add('basic','fogIdPlaceholder','Auto-generated from Map ID','由地图ID自动生成');
add('basic','fogIdDesc','Fog of war configuration ID (auto-synced with Map ID)','战争迷雾配置ID（与地图ID同步）');
add('basic','victoryDays','Victory Days','胜利天数');
add('basic','victoryDaysPlaceholder','Enter victory days','输入胜利天数');
add('basic','victoryDaysDesc','Number of nights to survive to win','赢得胜利需要存活的夜晚数');
add('basic','difficulty','Difficulty','难度');
add('basic','difficultyPlaceholder','Select difficulty','选择难度');
add('basic','difficultyDesc','Overall game difficulty for this map','此地图的整体游戏难度');
add('basic','difficulty1','Difficulty 1 - Easiest','难度1 - 最简单');
add('basic','difficulty2','Difficulty 2','难度2');
add('basic','difficulty3','Difficulty 3','难度3');
add('basic','difficulty4','Difficulty 4','难度4');
add('basic','difficulty5','Difficulty 5 - Hardest','难度5 - 最难');
add('basic','enemiesOffset','Enemies Offset','敌人偏移');
add('basic','enemiesOffsetPlaceholder','Enter enemies offset','输入敌人偏移');
add('basic','enemiesOffsetDesc','Additional enemies per night','每晚额外增加的敌人数量');
add('basic','maxGlyphPoints','Max Glyph Points','最大符文点数');
add('basic','maxGlyphPointsPlaceholder','Enter max glyph points','输入最大符文点数');
add('basic','maxGlyphPointsDesc','Maximum glyph points available on the map','地图上可用的最大符文点数');

// SpawnConfigTab
add('spawn','title','Spawn Configuration','生成配置');
add('spawn','nightDesc','Configure spawn rules for each night','配置每个夜晚的生成规则');
add('spawn','actions','Actions','操作');
add('spawn','add','Add Spawn Rules','添加生成规则');
add('spawn','addDesc','Configure spawn multipliers, point counts and spawn areas for a new night','为新的夜晚配置生成倍率、点数总数和生成区域');
add('spawn','remove','Remove','移除');
add('spawn','delete','Delete','删除');
add('spawn','night','Night {n}','第 {n} 夜');
add('spawn','nightPlaceholder','Enter night number','输入夜晚编号');
add('spawn','selectNight','Select night','选择夜晚');
add('spawn','selectNightPlaceholder','Choose a night to configure','选择要配置的夜晚');
add('spawn','spawnMultipliers','Spawn Multipliers','生成倍率');
add('spawn','spawnMultipliersDesc','Multiplier applied to enemy spawn count','应用于敌人生成数量的倍率');
add('spawn','multiplier','Multiplier','倍率');
add('spawn','multiplierPlaceholder','Enter multiplier value','输入倍率值');
add('spawn','spawnPointsPerGroup','Spawn Points Per Group','每组生成点数');
add('spawn','spawnPointsPerGroupDesc','Number of spawn points in each group','每组中的生成点数');
add('spawn','spawnPointsPerGroupPlaceholder','Enter points per group','输入每组点数');
add('spawn','spawnRectWidth','Spawn Rect Width','生成矩形宽度');
add('spawn','spawnRectWidthDesc','Width of the spawn rectangle','生成矩形的宽度');
add('spawn','spawnRectWidthPlaceholder','Enter width','输入宽度');
add('spawn','spawnRectHeight','Spawn Rect Height','生成矩形高度');
add('spawn','spawnRectHeightDesc','Height of the spawn rectangle','生成矩形的高度');
add('spawn','spawnRectHeightPlaceholder','Enter height','输入高度');
add('spawn','spawnsFormula','Spawns Formula','生成公式');
add('spawn','spawnsFormulaDesc','Formula for calculating number of spawns','计算生成数量的公式');
add('spawn','spawnsFormulaPlaceholder','e.g. night * 2 + 1','例如：night * 2 + 1');
add('spawn','maxDistance','Max Distance','最大距离');
add('spawn','maxDistanceDesc','Maximum distance from spawn points','离生成点的最大距离');
add('spawn','distance','Distance','距离');
add('spawn','distancePlaceholder','Enter distance','输入距离');
add('spawn','disallowedEnemies','Disallowed Enemies','禁止的敌人');
add('spawn','disallowedEnemiesDesc','Enemy IDs that should not spawn','不应生成的敌人ID');
add('spawn','disallowedEnemyId','Enemy ID','敌人ID');
add('spawn','disallowedEnemyPlaceholder','Enter enemy ID (e.g. Skeleton)','输入敌人ID（如Skeleton）');
add('spawn','noDisallowedEnemies','No disallowed enemies','没有禁止的敌人');
add('spawn','noData','No spawn data','暂无生成数据');

// WavesConfigTab
add('waves','title','Waves Configuration','波次配置');
add('waves','nightDesc','Configure enemy waves for each night','配置每个夜晚的敌波次');
add('waves','actions','Actions','操作');
add('waves','add','Add Wave','添加波次');
add('waves','addDesc','Add enemy waves for a new night','为新的夜晚添加敌波次');
add('waves','remove','Remove','移除');
add('waves','delete','Delete','删除');
add('waves','night','Night {n}','第 {n} 夜');
add('waves','nightPlaceholder','Enter night number','输入夜晚编号');
add('waves','selectNight','Select night','选择夜晚');
add('waves','selectNightPlaceholder','Choose a night to configure','选择要配置的夜晚');
add('waves','waveId','Wave ID','波次ID');
add('waves','waveIdPlaceholder','e.g. Wave_3_Normal','例如：Wave_3_Normal');
add('waves','weight','Weight','权重');
add('waves','weightDesc','Spawn probability weight (higher = more likely)','生成概率权重（越高越可能）');
add('waves','weightPlaceholder','Enter weight','输入权重');
add('waves','tableWaveId','Wave','波次');
add('waves','tableWeight','Weight','权重');
add('waves','noData','No wave data','暂无波次数据');

// ElitesConfigTab
add('elites','title','Elite Configuration','精英配置');
add('elites','nightDesc','Configure elite enemies for each night','配置每个夜晚的精英敌人');
add('elites','actions','Actions','操作');
add('elites','add','Add Night','添加夜晚');
add('elites','addDesc','Configure elite enemies for a new night','为新的夜晚配置精英敌人');
add('elites','remove','Remove','移除');
add('elites','delete','Delete','删除');
add('elites','night','Night {n}','第 {n} 夜');
add('elites','nightPlaceholder','Enter night number','输入夜晚编号');
add('elites','selectNight','Select night','选择夜晚');
add('elites','selectNightPlaceholder','Choose a night to configure','选择要配置的夜晚');
add('elites','elitesPerDay','Elites per Day','每天精英数');
add('elites','elitesPerDayDesc','Number of elite enemies per day','每天的精英敌人数量');
add('elites','tier1','Tier 1','1级（最低）');
add('elites','tier2','Tier 2','2级');
add('elites','tier3','Tier 3','3级');
add('elites','tierSelectPlaceholder','Select tier','选择等级');
add('elites','count','Count','数量');
add('elites','countPlaceholder','Enter count','输入数量');
add('elites','tableCount','Count','数量');
add('elites','tableTier','Tier','等级');
add('elites','summaryTitle','{night} Night Summary','第{night}夜总结');
add('elites','summaryNoData','No elites configured for this night','此夜晚未配置精英');
add('elites','noData','No elite data','暂无精英数据');

// CorruptionConfigTab
add('corruption','title','Corruption Configuration','腐蚀配置');
add('corruption','progressTitle','Corruption Progress by Night','每夜腐蚀进度');
add('corruption','actions','Actions','操作');
add('corruption','add','Add Night','添加夜晚');
add('corruption','addDesc','Add a new corruption value for a specific night','为指定夜晚添加腐蚀值');
add('corruption','addNight','Add Night Entry','添加夜晚条目');
add('corruption','addNightDesc','Add a new corruption value for a specific night','为指定夜晚添加腐蚀值');
add('corruption','remove','Remove','移除');
add('corruption','delete','Delete','删除');
add('corruption','night','Night','夜晚');
add('corruption','nightPlaceholder','Enter night number','输入夜晚编号');
add('corruption','corruptionValue','Corruption Value','腐蚀值');
add('corruption','corruptionValuePlaceholder','Enter corruption value (0-1)','输入腐蚀值（0-1）');
add('corruption','tableNight','Night','夜晚');
add('corruption','tableCorruptionValue','Corruption','腐蚀值');
add('corruption','noData','No corruption data','暂无腐蚀数据');

// FogConfigTab
add('fog','title','Fog Configuration','迷雾配置');
add('fog','initialDensity','Initial Density','初始密度');
add('fog','initialDensityDesc','Starting fog density on night 1','第1夜的初始迷雾密度');
add('fog','initialDensityPlaceholder','0.0 - 1.0','0.0 - 1.0');
add('fog','increaseEvery','Increase Every','每N夜增加');
add('fog','increaseEveryDesc','Increase fog density every N nights','每N夜增加迷雾密度');
add('fog','increaseEveryPlaceholder','Enter night interval','输入夜晚间隔');
add('fog','densityDesc','Density increase amount per interval (0.0 - 1.0)','每次间隔的密度增加量（0.0 - 1.0）');
add('fog','densityValue','Density Value','密度值');
add('fog','densityValuePlaceholder','0.0 - 1.0','0.0 - 1.0');
add('fog','densityList','Density by Night','每夜密度列表');
add('fog','exceptionsDesc','Override fog density for specific nights','为特定夜晚覆盖迷雾密度');
add('fog','dayExceptions','Day Exceptions','例外');
add('fog','exceptionDay','Night','夜晚');
add('fog','exceptionDayPlaceholder','Enter night number','输入夜晚编号');
add('fog','exceptionDensity','Density Override','密度覆盖');
add('fog','exceptionDensityPlaceholder','0.0 - 1.0','0.0 - 1.0');
add('fog','noExceptions','No exceptions configured','未配置例外');
add('fog','addException','Add Exception','添加例外');
add('fog','delete','Delete','删除');

// ResourcesConfigTab
add('resources','title','Resources Configuration','资源配置');
add('resources','gold','Gold','金币');
add('resources','goldDesc','Starting gold amount','初始金币数量');
add('resources','goldPlaceholder','Enter gold amount','输入金币数量');
add('resources','materials','Materials','材料');
add('resources','materialsDesc','Starting materials amount','初始材料数量');
add('resources','materialsPlaceholder','Enter materials amount','输入材料数量');
add('resources','damnedSouls','Damned Souls','被诅咒的灵魂');
add('resources','damnedSoulsDesc','Starting damned souls amount','初始被诅咒的灵魂数量');
add('resources','damnedSoulsPlaceholder','Enter damned souls amount','输入被诅咒的灵魂数量');

// DirectionsConfigTab
add('directions','title','Directions Configuration','方向配置');
add('directions','nightDesc','Configure spawn directions for each night','配置每个夜晚的生成方向');
add('directions','actions','Actions','操作');
add('directions','add','Add','添加');
add('directions','remove','移除','移除');
add('directions','delete','删除','删除');
add('directions','noData','No direction data','暂无方向数据');
add('directions','selectNight','Select night','选择夜晚');
add('directions','selectNightPlaceholder','Choose a night to configure','选择要配置的夜晚');
add('directions','addDirection','Add Direction to Night {night}','为第{night}夜添加方向');
add('directions','directionId','Direction ID','方向ID');
add('directions','directionIdPlaceholder','e.g. North, South, East, West','例如：North, South, East, West');
add('directions','weight','Weight','权重');
add('directions','weightPlaceholder','Enter weight','输入权重');
add('directions','tableDirectionId','Direction','方向');
add('directions','tableWeight','Weight','权重');

// WaveDefinitionsTab
add('waveDef','waveListTitle','Wave Definitions','波次定义');
add('waveDef','editTitle','Edit Wave Definition','编辑波次定义');
add('waveDef','new','New Wave','新波次');
add('waveDef','add','Add Enemy','添加敌人');
add('waveDef','remove','Remove','移除');
add('waveDef','delete','Delete Wave','删除波次');
add('waveDef','moveUp','Move Up','上移');
add('waveDef','moveDown','Move Down','下移');
add('waveDef','actions','Actions','操作');
add('waveDef','waveId','Wave ID','波次ID');
add('waveDef','bossId','Boss ID','Boss ID');
add('waveDef','bossLabel','Boss Wave','Boss波次');
add('waveDef','bossWave','Boss Wave','Boss波次');
add('waveDef','bossWaveDesc','This wave contains a boss enemy','此波次包含Boss敌人');
add('waveDef','infiniteWave','Infinite Wave','无限波次');
add('waveDef','infiniteLabel','Infinite (repeating)','无限（循环）');
add('waveDef','infiniteWaveDesc','This wave repeats indefinitely','此波次无限重复');
add('waveDef','spawnMultiplier','Spawn Multiplier','生成倍率');
add('waveDef','spawnMultiplierDesc','Multiplier applied to spawn count','应用于生成数量的倍率');
add('waveDef','multiplier','Multiplier','倍率');
add('waveDef','multiplierLabel','Multiplier','倍率');
add('waveDef','multiplierPlaceholder','Enter multiplier','输入倍率');
add('waveDef','noData','No wave definitions','暂无波次定义');
add('waveDef','noSelection','Select a wave to configure','选择波次进行配置');
add('waveDef','noEnemyTypes','No enemies in this wave','此波次暂无敌人');
add('waveDef','enemyId','Enemy ID','敌人ID');
add('waveDef','enemyIdPlaceholder','Enter enemy ID','输入敌人ID');
add('waveDef','enemyTypes','Enemy Types','敌人类型');
add('waveDef','tier','Tier','等级');
add('waveDef','tierDesc','Select enemy tier','选择敌人等级');
add('waveDef','tierDistribution','Tier Distribution','等级分布');
add('waveDef','tierPlaceholder','Enter...','输入...');
add('waveDef','tableTier','Tier','等级');
add('waveDef','tableEnemyId','Enemy','敌人');
add('waveDef','turn','Turn','回合');
add('waveDef','turnPlaceholder','Enter turn number','输入回合编号');
add('waveDef','turnWeightPlaceholder','Weight','权重');
add('waveDef','tableTurn','Turn','回合');
add('waveDef','tableTurnWeight','Turn Weight','回合权重');
add('waveDef','weight','Weight','权重');
add('waveDef','weightPlaceholder','Weight','权重');
add('waveDef','tableWeight','Weight','权重');
add('waveDef','noTierDistribution','No tier distribution configured','未配置等级分布');
add('waveDef','noTimeDistribution','No time distribution configured','未配置时间分布');
add('waveDef','timeDistribution','Time Distribution','时间分布');
add('waveDef','timeDesc','Turn timing settings','回合时机设置');
add('waveDef','selectPrompt','Select wave to edit','选择要编辑的波次');
add('waveDef','createDialogTitle','Create New Wave','创建新波次');
add('waveDef','createDialogCreate','创建','创建');
add('waveDef','createDialogCancel','取消','取消');
add('waveDef','createDialogWaveIdPlaceholder','e.g. Night_3_Boss','例如：Night_3_Boss');

// Export
add('export','button','Export Config','导出配置');
add('export','successTitle','Export Successful','导出成功');
add('export','failedTitle','Export Failed','导出失败');
add('export','unknownError','Unknown error','未知错误');

// Import
add('import','button','Import Config','导入配置');
add('import','successTitle','Import Successful','导入成功');
add('import','failedTitle','Import Failed','导入失败');
add('import','invalidXml','Invalid XML format','无效的XML格式');
add('import','unknownError','Unknown error','未知错误');
add('import','readFileFailed','Failed to read file','读取文件失败');

// XML Button
add('xmlButton','button','XML 编辑器','XML 编辑器');
add('xmlButton','title','游戏配置 - XML 编辑器','游戏配置 - XML 编辑器');

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');
fs.writeFileSync(zhPath, JSON.stringify(zh, null, 2) + '\n', 'utf8');
console.log('EN sections:', Object.keys(en.configTab).join(', '));
console.log('ZH sections:', Object.keys(zh.configTab).join(', '));
const totalEN = Object.values(en.configTab).reduce((s, v) => s + Object.keys(v || {}).length, 0);
const totalZH = Object.values(zh.configTab).reduce((s, v) => s + Object.keys(v || {}).length, 0);
console.log(`Total EN keys: ${totalEN}, Total ZH keys: ${totalZH}`);
