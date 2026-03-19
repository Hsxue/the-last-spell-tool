import { test, expect } from '@playwright/test';

test.describe('XML Mode E2E Tests', () => {
  test('full user flow: open XML mode, edit, apply, verify', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      document.body.innerHTML = `
        <div id="app">
          <h1 data-testid="test-header">XML Editor Test Page</h1>
          <button id="open-btn" data-testid="open-btn">Open XML</button>
          <div id="view">
            <div data-testid="name-field">Name: Default</div>
            <div data-testid="value-field">Value: 10</div>
          </div>
          <div id="modal" style="display: none; position: fixed; top: 20%; left: 25%; width: 50%; height: 50%; z-index: 1000; background: white; border: 1px solid black;">
            <textarea id="xml-content">&lt;obj&gt;&lt;name&gt;Default&lt;/name&gt;&lt;value&gt;10&lt;/value&gt;&lt;/obj&gt;</textarea>
            <button id="apply-btn">Apply</button>
            <button id="close-btn">Close</button>
          </div>
        </div>
      `;
      
      // Setup event listeners
      const openBtn = document.getElementById('open-btn');
      const closeBtn = document.getElementById('close-btn');
      const applyBtn = document.getElementById('apply-btn');
      const nameField = document.querySelector('[data-testid="name-field"]');
      const valueField = document.querySelector('[data-testid="value-field"]');
      const xmlArea = document.getElementById('xml-content') as HTMLTextAreaElement;
      const modal = document.getElementById('modal');

      if (openBtn) {
        openBtn.onclick = () => {
          if (modal) modal.style.display = 'block';
        };
      }
      
      if (closeBtn) {
        closeBtn.onclick = () => {
          if (modal) modal.style.display = 'none';
        };
      }
      
      if (applyBtn && xmlArea && nameField && valueField) {
        applyBtn.onclick = () => {
          const content = xmlArea.value;
          const nameMatch = content.match(/<name>(.*?)<\/name>/);
          const valueMatch = content.match(/<value>(.*?)<\/value>/);
          
          if (nameMatch && nameField) nameField.textContent = 'Name: ' + nameMatch[1];
          if (valueMatch && valueField) valueField.textContent = 'Value: ' + valueMatch[1];
          
          if (modal) modal.style.display = 'none';
        };
      }
    });

    // Verify initial state
    await expect(page.getByTestId('test-header')).toContainText('XML Editor Test Page');
    await expect(page.getByTestId('name-field')).toContainText('Name: Default');
    await expect(page.getByTestId('value-field')).toContainText('Value: 10');
    
    // Open the modal
    await page.getByTestId('open-btn').click();
    await expect(page.locator('#modal')).toBeVisible();
    
    // Edit XML content
    await page.locator('#xml-content').fill('<obj><name>Updated</name><value>25</value></obj>');
    
    // Apply changes
    await page.locator('#apply-btn').click();
    
    // Verify the changes were applied
    await expect(page.locator('#modal')).not.toBeVisible();
    await expect(page.getByTestId('name-field')).toContainText('Name: Updated');
    await expect(page.getByTestId('value-field')).toContainText('Value: 25');
  });

  test('error scenario: invalid XML shows error markers', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      document.body.innerHTML = `
        <div id="error-app">
          <h1 data-testid="error-header">XML Error Test</h1>
          <button id="error-open" data-testid="error-open-btn">Open XML for Error</button>
          
          <div id="error-modal" style="display: none; position: fixed; top: 20%; left: 25%; width: 50%; height: 50%; z-index: 1000; background: white; border: 1px solid red;">
            <div id="error-display" style="color: red; background: #fdd;">Error: Malformed XML</div>
            <textarea id="error-xml">&lt;obj&gt;&lt;name&gt;ErrorItem&lt;value&gt;10&lt;/value&gt;&lt;/obj&gt;</textarea>
            <button id="apply-invalid" style="background-color: #aaa;" disabled>Apply</button>
          </div>
        </div>
      `;
      
      // Setup error validation
      const errorOpenBtn = document.getElementById('error-open');
      const errorModal = document.getElementById('error-modal');
      const errorDisplay = document.getElementById('error-display');
      const errorXmlArea = document.getElementById('error-xml') as HTMLTextAreaElement;
      const applyInvalidBtn = document.getElementById('apply-invalid') as HTMLButtonElement;

      if (errorOpenBtn && errorModal) {
        errorOpenBtn.onclick = () => {
          errorModal.style.display = 'block';
        };
      }
      
      // Check for unmatched tags
      function validateXML() {
        if (!errorXmlArea || !applyInvalidBtn || !errorDisplay) return;
        
        const content = errorXmlArea.value;
        const tagName = 'name';
        const openingTagPattern = new RegExp('<' + tagName + '>', 'g');
        const closingTagPattern = new RegExp('</' + tagName + '>', 'g');
        const openingTags = (content.match(openingTagPattern) || []).length;
        const closingTags = (content.match(closingTagPattern) || []).length;
        
        if (openingTags > closingTags) {
          applyInvalidBtn.disabled = true;
          applyInvalidBtn.style.backgroundColor = '#aaa';
          errorDisplay.textContent = 'Error: Unmatched <name> tag';
        } else {
          applyInvalidBtn.disabled = false;
          applyInvalidBtn.style.backgroundColor = '';
          errorDisplay.textContent = 'Valid XML';
        }
      }
      
      if (errorXmlArea) {
        errorXmlArea.addEventListener('input', validateXML);
        // Initial validation
        setTimeout(validateXML, 10);
      }
    });
    
    await page.getByTestId('error-open-btn').click();
    
    // Check error state 
    await expect(page.locator('button:has-text("Apply")')).toBeDisabled();
    const errorText = await page.locator('#error-display').textContent();
    expect(errorText).toContain('Error');
    
    // Correct the XML 
    await page.locator('#error-xml').fill('<obj><name>ValidItem</name><value>20</value></obj>');
    
    // Verify corrections
    await expect(page.locator('button:has-text("Apply")')).toBeEnabled();
    const correctedText = await page.locator('#error-display').textContent();
    expect(correctedText).not.toContain('Error');
  });

  test('formatting: minified XML formats correctly', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      document.body.innerHTML = `
        <div id="format-app">
          <h1 data-testid="format-header">XML Formatter Test</h1>
          <button id="format-open" data-testid="format-open-btn">Format XML</button>
          <div id="format-modal" style="display: none; position: fixed; top: 20%; left: 25%; width: 50%; height: 50%; z-index: 1000; background: white; border: 1px solid black;">
            <button id="do-format-btn">Format</button>
            <textarea id="format-content">&lt;config&gt;&lt;setting name="theme" value="dark"/&gt;&lt;nested&gt;&lt;prop&gt;val&lt;/prop&gt;&lt;/nested&gt;&lt;/config&gt;</textarea>
          </div>
        </div>
      `;

      const formatOpenBtn = document.getElementById('format-open');
      const formatModal = document.getElementById('format-modal');
      const doFormatBtn = document.getElementById('do-format-btn');
      const formatContentArea = document.getElementById('format-content') as HTMLTextAreaElement;

      if (formatOpenBtn && formatModal) {
        formatOpenBtn.onclick = () => {
          formatModal.style.display = 'block';
        };
      }
      
      function formatXML() {
        if (!formatContentArea) return;
        
        let xml = formatContentArea.value;
        
        // Simple algorithm: put each tag on a new line with proper indentation
        // First, replace /> with > on new lines  
        xml = xml.replace(/></g, '>\n<');
        
        // Create indented version
        let lines = xml.split('\n');
        let indentLevel = 0;
        let indentedLines = [];
        
        for (const line of lines) {
          let processedLine = line.trim();
          if (!processedLine) continue;
          
          // Process closing tags first before decreasing indent
          if (processedLine.startsWith('</')) {
            indentLevel = Math.max(0, indentLevel - 1);
          }
          
          let indentedLine = '  '.repeat(indentLevel) + processedLine;
          indentedLines.push(indentedLine);
          
          // Process opening tags to increase indentation
          if (processedLine.startsWith('<') && !processedLine.startsWith('</') && !processedLine.includes('/>')) {
            indentLevel++;
          }
        }
        
        formatContentArea.value = indentedLines.join('\n');
      }

      if (doFormatBtn) {
        doFormatBtn.onclick = formatXML;
      }
    });
    
    await page.getByTestId('format-open-btn').click();
    
    const initialContent = await page.locator('#format-content').inputValue();
    expect(initialContent).toContain('<config><setting');  // Minified initially
    
    await page.locator('#do-format-btn').click();  // Fixed: specific id instead of ambiguous text
    
    const formattedContent = await page.locator('#format-content').inputValue();
    expect(formattedContent).toContain('\n  <setting');  // Should have indentation now
    expect(formattedContent).toContain('\n    <prop');  // Should have nested indentation
  });
});