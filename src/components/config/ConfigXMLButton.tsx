import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { XMLEditorModal } from '@/components/XMLEditor/XMLEditorModal';
import { useConfigStore } from '@/store/configStore';
import { serializeConfigToXml, deserializeXmlToConfig } from '@/lib/configSerializer';
import { useState, useCallback } from 'react';

export function ConfigXMLButton() {
  const { t } = useTranslation('common');
  const { gameConfig, setGameConfig } = useConfigStore();
  const [isXMLMode, setIsXMLMode] = useState(false);
  const [xmlContent, setXmlContent] = useState('');

  const openXMLMode = useCallback(() => {
    const xml = serializeConfigToXml(gameConfig);
    setXmlContent(xml);
    setIsXMLMode(true);
  }, [gameConfig]);

  const closeXMLMode = useCallback(() => { setIsXMLMode(false); setXmlContent(''); }, []);

  const handleApply = useCallback((xml: string) => {
    const updatedConfig = deserializeXmlToConfig(xml);
    setGameConfig(updatedConfig);
    closeXMLMode();
  }, [setGameConfig, closeXMLMode]);

  return (
    <>
      <Button variant="outline" size="sm" onClick={openXMLMode}>
        {t('configTab.xmlButton.button')}
      </Button>
      <XMLEditorModal
        isOpen={isXMLMode}
        onClose={closeXMLMode}
        value={xmlContent}
        onApply={handleApply}
        language="xml"
        title={t('configTab.xmlButton.title')}
      />
    </>
  );
}
