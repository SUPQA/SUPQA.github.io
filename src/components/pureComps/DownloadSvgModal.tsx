import React, { useState } from 'react';
import { Modal, Checkbox } from '@arco-design/web-react';
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';

const CheckboxGroup = Checkbox.Group;

const DownloadSvgModal = (props) => {
  const { visible, setVisible } = props;
  const [value, setValue] = useState([]);

  const downloadSvg2pdf = (containerId) => {
    const element = document.getElementById(containerId) as any;
    // Inject css
    // const style = document.createElement('style');
    // style.textContent = mainstyle;
    // element.appendChild(style);

    // eslint-disable-next-line new-cap
    const doc = new jsPDF({
      putOnlyUsedFonts: true,
      unit: 'px',
      orientation:
        parseFloat(element.attributes.width.value) >
        parseFloat(element.attributes.height.value)
          ? 'l'
          : 'p',
      format: [
        parseFloat(element.attributes.width.value),
        parseFloat(element.attributes.height.value),
      ],
    });
    doc
      .svg(element, {
        x: 0,
        y: 0,
        width: parseFloat(element.attributes.width.value),
        height: parseFloat(element.attributes.height.value),
        loadExternalStyleSheets: true,
      })
      .then(() => {
        doc.save(`${containerId}.pdf`);
      });
  };

  const onOk = () => {
    setVisible(false);
    value.forEach((item) => {
      downloadSvg2pdf(item);
    });
  };

  return (
    <Modal
      title="Download SVG"
      visible={visible}
      onOk={onOk}
      onCancel={() => setVisible(false)}
      autoFocus={false}
      focusLock={true}
    >
      <CheckboxGroup
        onChange={(value) => setValue(value)}
        value={value}
        direction="vertical"
        options={['polygon-slider', 'nestedTree']}
      />
    </Modal>
  );
};
export default DownloadSvgModal;
