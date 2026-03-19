# XML Editor Mode - Integration Guide

## Quick Start

The XML editor mode integrates with your existing game configuration interfaces using the `useXMLMode` Hook.

## Integration Methods

### Method 1: Adding XML Mode Button to Existing Configuration UI

In your game configuration component (such as the weapon or skill editor):

```typescript
import { useXMLMode } from '@/hooks/useXMLMode';
import { XMLEditorModal } from '@/components/XMLEditor/XMLEditorModal';
import { weaponSchema } from '@/types/XMLSchema';

function WeaponEditor() {
  const [weapon, setWeapon] = useState({
    id: 1,
    name: 'Sword',
    damage: 10,
    rare: true,
  });

  // Use the useXMLMode Hook
  const {
    isXMLMode,
    openXMLMode,
    closeXMLMode,
    handleApply,
    xmlContent,  // Important: Add xmlContent to properly initialize editor content
  } = useXMLMode({
    gameObject: weapon,
    schema: weaponSchema,
    onApply: (updatedWeapon) => setWeapon(updatedWeapon),
  });

  return (
    <>
      {/* Add XML Mode button in the configuration toolbar */}
      <div className="config-toolbar">
        <h2>Weapon Editor</h2>
        <Button onClick={openXMLMode} variant="outline">
          📝 XML Mode
        </Button>
      </div>

      {/* Existing form fields */}
      <div className="weapon-form">
        <label>Name</label>
        <input
          value={weapon.name}
          onChange={(e) => setWeapon({ ...weapon, name: e.target.value })}
        />
        
        <label>Damage</label>
        <input
          type="number"
          value={weapon.damage}
          onChange={(e) => setWeapon({ ...weapon, damage: parseInt(e.target.value) })}
        />
        
        {/* Other fields... */}
      </div>

      {/* XML Editor Modal */}
      <XMLEditorModal
        isOpen={isXMLMode}
        onClose={closeXMLMode}
        value={xmlContent} /* Updated: Pass xmlContent instead of "" */
        onApply={handleApply}
        language="xml"
        title="Weapon Configuration - XML Mode"
      />
    </>
  );
}
```

**Important Fix**: Previously, the `value` prop was hardcoded as an empty string (`""`) in EditorTestPage.tsx, causing the XML editor to open with blank content instead of the serialized game object. This has been fixed to properly pass the `xmlContent` from the hook.

### Method 2: Creating a Dedicated Test Page

For quick testing of the functionality, you can create a dedicated test page:

```typescript
// src/pages/XMLModeTest.tsx
import { useState } from 'react';
import { useXMLMode } from '@/hooks/useXMLMode';
import { XMLEditorModal } from '@/components/XMLEditor/XMLEditorModal';
import { weaponSchema, characterSchema } from '@/types/XMLSchemas';

export function XMLModeTest() {
  const [weapon, setWeapon] = useState({
    id: 1,
    name: 'Fire Sword',
    damage: 50,
    rare: true,
    description: 'A powerful sword that burns enemies',
    tags: ['melee', 'fire', 'weapon'],
  });

  const {
    isXMLMode,
    openXMLMode,
    closeXMLMode,
    handleApply,
    xmlContent,
    isLoading,
    error,
  } = useXMLMode({
    gameObject: weapon,
    schema: weaponSchema,
    onApply: (updatedWeapon) => {
      setWeapon(updatedWeapon);
      console.log('Weapon updated:', updatedWeapon);
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">XML Mode Test</h1>
      
      {/* Toolbar */}
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={openXMLMode} 
          variant="default"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : '📝 Switch to XML Mode'}
        </Button>
      </div>

      {/* Display current data */}
      <div className="border rounded p-4 bg-muted mb-4">
        <h2 className="text-lg font-semibold mb-2">Current Weapon Configuration:</h2>
        <pre className="text-sm bg-white p-2 rounded overflow-auto">
          {JSON.stringify(weapon, null, 2)}
        </pre>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error.message}
        </div>
      )}

      {/* XML Editor Modal */}
      <XMLEditorModal
        isOpen={isXMLMode}
        onClose={closeXMLMode}
        value={xmlContent} /* Always pass xmlContent here */
        onApply={handleApply}
        language="xml"
        title="Weapon Configuration - XML Editor"
        readOnly={isLoading}
      />
    </div>
  );
}
```

Then add the page to your routing configuration:

```typescript
// src/App.tsx or routing configuration
import { XMLModeTest } from '@/pages/XMLModeTest';

function App() {
  return (
    <Routes>
      {/* ... other routes */}
      <Route path="/xml-test" element={<XMLModeTest />} />
    </Routes>
  );
}
```

The improved `XMLModeTest` page already exists in the project at `src/pages/XMLModeTest.tsx` with multiple use cases.

## Schema Definition Examples

### Import Predefined Schemas

Use schemas directly from the shared collection:

```typescript
import { weaponSchema, characterSchema, itemSchema, monsterSchema, mapSchema } from '@/types/XMLSchemas';
```

### Custom Schema Definition

For other game objects, create corresponding schemas:

```typescript
const skillSchema: XMLSchema = {
  rootTag: 'skill',
  fields: [
    { name: 'id', type: 'number', xmlAttr: 'id' },
    { name: 'name', type: 'string' },
    { name: 'cooldown', type: 'number' },
    { name: 'manaCost', type: 'number' },
    { name: 'damage', type: 'number' },
    { name: 'description', type: 'string' },
  ],
};

const configSchema: XMLSchema = {
  rootTag: 'config',
  fields: [
    { name: 'gameSpeed', type: 'number' },
    { name: 'difficulty', type: 'string' },
    { name: 'maxPlayers', type: 'number' },
    { name: 'enableFriendlyFire', type: 'boolean' },
  ],
};
```

## XML Conversion Examples

### Input Object
```javascript
{
  id: 1,
  name: 'Sword',
  damage: 10,
  rare: true
}
```

### Output XML
```xml
<?xml version="1.0" encoding="UTF-8"?>
<weapon id="1">
  <name>Sword</name>
  <damage>10</damage>
  <rare>true</rare>
</weapon>
```

## Implemented Features

✅ **Available features**:
- Syntax highlighting for XML and JSON (with CodeMirror 6)
- Real-time validation (500ms debounce)
- Error marking in the editor gutter
- One-click formatting (Ctrl+Shift+F)
- Keyboard shortcuts:
  - `Ctrl+S`: Apply changes
  - `Ctrl+Shift+F`: Format document
  - `Escape`: Close modal
- Validation before apply (apply button disabled for invalid XML)
- Bidirectional conversion between game objects and XML
- Automatic type conversion (number, boolean, string, array, object)
- Loading state indicators
- Comprehensive error handling
- Support for nested object schemas

## Common Issues & Solutions

### Q: How do I add this to my existing weapon configuration interface?
A: Import the `useXMLMode` Hook into your weapon configuration component, add an "XML Mode" button in your toolbar, and render the `<XMLEditorModal />` component near the end of your JSX return. Make sure to pass the correct `xmlContent` value from the hook, not an empty string.

### Q: What if my game object structure doesn't match the example schema?
A: Define your own custom schema for your game object by referencing the `weaponSchema` example above. Make sure to define the correct field types and optional `xmlAttr` properties.

### Q: Can I switch between JSON and XML formats?
A: Yes! Change the `language` prop to `'json'` in the XMLEditorModal, the conversion and hook logic will remain the same.

### Q: Where can I see the corrected EditorTestPage implementation?
A: The `src/pages/EditorTestPage.tsx` file now demonstrates the proper usage with the fix to pass `xmlContent` instead of an empty string to the XML editor modal.

### Q: How can I debug serialization problems?
A: Add `console.log` statements in the `onApply` callback to observe the converted object and verify it matches your expectations.

## Testing

Visit the XML mode test page after starting the development server:
```bash
npm run dev
# Visit http://localhost:5173/
# Look for Editor Test Page link in sidebar, or navigate to XMLModeTest page
```

Or run tests to ensure all functionality works properly:
```bash
# Run all tests to verify integrations still work
npm test

# Specifically test XML-related functionality
npx vitest src/hooks/useXMLMode.test.ts
npx vitest src/components/XMLEditor/XMLEditorModal.test.ts
```

## Schema Field Types

- `'string'`: Text values
- `'number'`: Numeric values
- `'boolean'`: True/false values
- `'object'`: Nested objects (with their own schema)
- `'array'`: Arrays of values

Remember to set optional fields as `required: false` in your schema when appropriate.

### 方式 2：创建独立的测试页面

如果想快速测试功能，可以创建一个测试页面：

```typescript
// src/pages/XMLModeTest.tsx
import { useState } from 'react';
import { useXMLMode } from '@/hooks/useXMLMode';
import { XMLEditorModal } from '@/components/XMLEditor/XMLEditorModal';
import { weaponSchema } from '@/types/XMLSchema';

export function XMLModeTest() {
  const [weapon, setWeapon] = useState({
    id: 1,
    name: 'Sword',
    damage: 10,
    rare: true,
    description: 'A basic sword',
  });

  const {
    isXMLMode,
    openXMLMode,
    closeXMLMode,
    handleApply,
  } = useXMLMode({
    gameObject: weapon,
    schema: weaponSchema,
    onApply: (updatedWeapon) => {
      setWeapon(updatedWeapon);
      console.log('武器已更新:', updatedWeapon);
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">XML 模式测试</h1>
      
      {/* 工具栏 */}
      <div className="flex gap-2 mb-4">
        <Button onClick={openXMLMode} variant="default">
          📝 切换到 XML 模式
        </Button>
      </div>

      {/* 当前数据展示 */}
      <div className="border rounded p-4 bg-muted">
        <h2 className="text-lg font-semibold mb-2">当前武器配置：</h2>
        <pre className="text-sm">
          {JSON.stringify(weapon, null, 2)}
        </pre>
      </div>

      {/* XML 编辑器模态框 */}
      <XMLEditorModal
        isOpen={isXMLMode}
        onClose={closeXMLMode}
        value=""
        onApply={handleApply}
        language="xml"
        title="武器配置 - XML 编辑器"
      />
    </div>
  );
}
```

然后在路由中添加这个页面：

```typescript
// src/App.tsx 或路由配置
import { XMLModeTest } from '@/pages/XMLModeTest';

function App() {
  return (
    <Routes>
      {/* ... 其他路由 */}
      <Route path="/xml-test" element={<XMLModeTest />} />
    </Routes>
  );
}
```

## Schema 定义示例

### 武器 Schema

```typescript
// 使用已有的 weaponSchema
import { weaponSchema } from '@/types/XMLSchema';

// 或直接定义
const weaponSchema: XMLSchema = {
  rootTag: 'weapon',
  fields: [
    { name: 'id', type: 'number', xmlAttr: 'id' }, // id 作为 XML 属性
    { name: 'name', type: 'string' },
    { name: 'damage', type: 'number' },
    { name: 'rare', type: 'boolean' },
    { name: 'description', type: 'string' },
  ],
};
```

### 自定义 Schema

对于其他游戏对象，创建对应的 Schema：

```typescript
const skillSchema: XMLSchema = {
  rootTag: 'skill',
  fields: [
    { name: 'id', type: 'number', xmlAttr: 'id' },
    { name: 'name', type: 'string' },
    { name: 'cooldown', type: 'number' },
    { name: 'manaCost', type: 'number' },
    { name: 'damage', type: 'number' },
    { name: 'description', type: 'string' },
  ],
};

const configSchema: XMLSchema = {
  rootTag: 'config',
  fields: [
    { name: 'gameSpeed', type: 'number' },
    { name: 'difficulty', type: 'string' },
    { name: 'maxPlayers', type: 'number' },
    { name: 'enableFriendlyFire', type: 'boolean' },
  ],
};
```

## XML 输出示例

### 输入对象
```javascript
{
  id: 1,
  name: 'Sword',
  damage: 10,
  rare: true
}
```

### 输出 XML
```xml
<?xml version="1.0" encoding="UTF-8"?>
<weapon id="1">
  <name>Sword</name>
  <damage>10</damage>
  <rare>true</rare>
</weapon>
```

## 功能列表

✅ **已实现功能**：
- XML/JSON 语法高亮（CodeMirror 6）
- 实时语法验证（500ms 防抖）
- 错误标记（行号旁显示错误）
- 一键格式化（Ctrl+Shift+F）
- 快捷键支持：
  - `Ctrl+S`: 应用更改
  - `Ctrl+Shift+F`: 格式化
  - `Escape`: 关闭模态框
- 应用前验证（无效 XML 时禁用应用按钮）
- 游戏对象 ↔ XML 双向转换
- 类型自动转换（number, boolean, string）

## 常见问题

### Q: 如何添加到现有的武器配置界面？
A: 在武器配置组件中导入 `useXMLMode` Hook，添加"XML 模式"按钮，并在组件底部渲染 `<XMLEditorModal />`。

### Q: 我的配置对象结构和 Schema 不匹配怎么办？
A: 为你的配置对象创建自定义 Schema，参考上面的 `skillSchema` 示例。

### Q: 可以支持 JSON 格式吗？
A: 可以！将 `language` prop 设置为 `'json'`，其他逻辑相同。

### Q: 如何调试序列化问题？
A: 在 `onApply` 回调中添加 `console.log`，查看转换后的对象是否符合预期。

## 测试

访问测试页面（如果创建了 `/xml-test` 路由）：
```bash
npm run dev
# 访问 http://localhost:5173/xml-test
```

或运行测试：
```bash
# 单元测试
npm test -- useXMLMode

# E2E 测试
npm run test:e2e
```
