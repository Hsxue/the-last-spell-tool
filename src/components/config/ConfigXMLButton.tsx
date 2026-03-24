/**
 * ConfigXMLButton - Button to edit game configuration in XML mode
 */

import { Button } from '@/components/ui/button';
import { useXMLMode } from '@/hooks/useXMLMode';
import { XMLEditorModal } from '@/components/XMLEditor/XMLEditorModal';
import { gameConfigSchema } from '@/types/XMLSchemas';
import { useConfigStore } from '@/store/configStore';

export function ConfigXMLButton() {
  const { gameConfig, setGameConfig } = useConfigStore();
  
  const { isXMLMode, openXMLMode, closeXMLMode, handleApply, xmlContent } = useXMLMode({
    gameObject: gameConfig,
    schema: gameConfigSchema,
    onApply: (updatedConfig) => setGameConfig(updatedConfig),
  });

  return (
    <>
      <Button variant="outline" size="sm" onClick={openXMLMode}>
        📝 XML 编辑
      </Button>
      <XMLEditorModal
        isOpen={isXMLMode}
        onClose={closeXMLMode}
        value={xmlContent}
        onApply={handleApply}
        language="xml"
        title="游戏配置 - XML 编辑器"
      />
    </>
  );
}
