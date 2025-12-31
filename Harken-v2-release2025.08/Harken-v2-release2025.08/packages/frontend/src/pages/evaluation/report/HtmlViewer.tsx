import { useEffect, useRef } from 'react';

const HtmlViewer = ({ htmlContent }: any) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Disable scrolling in main document (React app body)
    document.body.style.overflow = 'hidden';

    // Inject content into iframe
    if (iframeRef.current) {
      const doc =
        iframeRef.current.contentDocument ||
        iframeRef.current.contentWindow?.document;

      if (doc) {
        // Add padding/margin reset inside iframe for better layout control
        const wrappedHtml = htmlContent.includes('<html')
          ? htmlContent
          : `
            <html>
              <head>
                <style>
                  html, body {
                    margin: 0;
                    padding: 0;
                    overflow: auto;
                  }
                </style>
              </head>
              <body>${htmlContent}</body>
            </html>`;

        doc.open();
        doc.write(wrappedHtml);
        doc.close();
      }
    }

    // Restore scroll on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [htmlContent]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
      }}
    />
  );
};

export default HtmlViewer;
