/**
 * ConfigXMLButton - Button to edit game configuration in XML mode
 */

import { Button } from '@/components/ui/button';
import { XMLEditorModal } from '@/components/XMLEditor/XMLEditorModal';
import { useConfigStore } from '@/store/configStore';
import { serializeConfigToXml, deserializeXmlToConfig } from '@/lib/configSerializer';
import { useState, useCallback } from 'react';

export function ConfigXMLButton() {
  const { gameConfig, setGameConfig } = useConfigStore();
  const [isXMLMode, setIsXMLMode] = useState(false);
  const [xmlContent, setXmlContent] = useState('');

  const openXMLMode = useCallback(() => {
    // Use the specialized config serializer instead of generic gameObjectToXML
    const xml = serializeConfigToXml(gameConfig);
    setXmlContent(xml);
    setIsXMLMode(true);
  }, [gameConfig]);

  const closeXMLMode = useCallback(() => {
    setIsXMLMode(false);
    setXmlContent('');
  }, []);

  const handleApply = useCallback((xml: string) => {
    // Use the specialized config deserializer
    const updatedConfig = deserializeXmlToConfig(xml);
    setGameConfig(updatedConfig);
    closeXMLMode();
  }, [setGameConfig, closeXMLMode]);

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
