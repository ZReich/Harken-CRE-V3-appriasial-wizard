import React from 'react';
import type { ContentBlock } from '../../../../types';
import { renderReportContent } from '../../../../utils/htmlRenderer';

interface NarrativePageProps {
  content: ContentBlock[];
  title?: string;
  pageNumber?: number;
  sectionId?: string;
  isEditing?: boolean;
  onContentClick?: (blockId: string) => void;
}

export const NarrativePage: React.FC<NarrativePageProps> = ({
  content,
  title,
  pageNumber,
  sectionId,
  isEditing = false,
  onContentClick,
}) => {
  const renderBlock = (block: ContentBlock, _index: number) => {
    const isClickable = isEditing && block.type !== 'image';
    const clickableClass = isClickable ? 'cursor-pointer hover:bg-surface-2 rounded p-1 -m-1' : '';

    switch (block.type) {
      case 'heading':
        return (
          <h3 
            key={block.id}
            className={`text-lg font-semibold text-slate-800 mt-6 mb-3 ${clickableClass}`}
            onClick={() => isClickable && onContentClick?.(block.id)}
            dangerouslySetInnerHTML={{ 
              __html: renderReportContent(String((block.content as { text?: string })?.text || '')) 
            }}
          />
        );

      case 'paragraph':
        const paragraphContent = block.content as Record<string, unknown>;
        
        // Check if it's a simple string or has text property
        if (typeof paragraphContent === 'string') {
          return (
            <div 
              key={block.id}
              className={`text-sm text-slate-700 leading-relaxed mb-4 ${clickableClass}`}
              style={{ lineHeight: '1.7' }}
              onClick={() => isClickable && onContentClick?.(block.id)}
              dangerouslySetInnerHTML={{ __html: renderReportContent(paragraphContent) }}
            />
          );
        }
        
        if (paragraphContent?.text) {
          return (
            <div 
              key={block.id}
              className={`text-sm text-slate-700 leading-relaxed mb-4 ${clickableClass}`}
              style={{ lineHeight: '1.7' }}
              onClick={() => isClickable && onContentClick?.(block.id)}
              dangerouslySetInnerHTML={{ __html: renderReportContent(String(paragraphContent.text)) }}
            />
          );
        }
        
        // Render key-value pairs for structured content
        return (
          <div 
            key={block.id}
            className={`text-sm text-slate-700 leading-relaxed mb-4 ${clickableClass}`}
            style={{ lineHeight: '1.7' }}
            onClick={() => isClickable && onContentClick?.(block.id)}
          >
            {Object.entries(paragraphContent).map(([key, value]) => {
              if (!value || key.startsWith('_')) return null;
              return (
                <p key={key} className="mb-2">
                  <span className="font-medium text-slate-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>{' '}
                  <span dangerouslySetInnerHTML={{ __html: renderReportContent(String(value)) }} />
                </p>
              );
            })}
          </div>
        );

      case 'list':
        const listContent = block.content as { items?: string[]; conditions?: string[] };
        const items = listContent?.items || listContent?.conditions || [];
        return (
          <ul 
            key={block.id}
            className={`list-disc list-inside text-sm text-slate-700 space-y-2 mb-4 ${clickableClass}`}
            style={{ lineHeight: '1.7' }}
            onClick={() => isClickable && onContentClick?.(block.id)}
          >
            {items.map((item: string, i: number) => (
              <li 
                key={i}
                dangerouslySetInnerHTML={{ __html: renderReportContent(item) }}
              />
            ))}
          </ul>
        );

      case 'table':
        const tableContent = block.content as Record<string, unknown>;
        return (
          <div 
            key={block.id}
            className={`mb-6 ${clickableClass}`}
            onClick={() => isClickable && onContentClick?.(block.id)}
          >
            <table className="w-full text-sm border-collapse">
              <tbody>
                {Object.entries(tableContent).map(([key, value]) => {
                  if (!value || key.startsWith('_') || typeof value === 'object') return null;
                  return (
                    <tr key={key} className="border-b border-light-border hover:bg-surface-2">
                      <td className="py-2 pr-4 text-slate-600 font-medium w-1/3 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="py-2 text-slate-800">
                        {String(value)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case 'image':
        const imageContent = block.content as { url?: string; caption?: string };
        return (
          <figure 
            key={block.id}
            className={`mb-6 ${isEditing ? 'cursor-pointer ring-2 ring-transparent hover:ring-sky-300 rounded' : ''}`}
            onClick={() => isEditing && onContentClick?.(block.id)}
          >
            {imageContent?.url && (
              <img 
                src={imageContent.url} 
                alt={imageContent?.caption || 'Image'} 
                className="w-full rounded-lg"
              />
            )}
            {imageContent?.caption && (
              <figcaption className="text-xs text-slate-500 text-center mt-2">
                {imageContent.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'chart':
        return (
          <div 
            key={block.id}
            className={`mb-6 bg-surface-2 rounded-lg p-4 ${clickableClass}`}
            onClick={() => isClickable && onContentClick?.(block.id)}
          >
            <div className="h-48 flex items-center justify-center text-slate-400">
              [Chart Placeholder]
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Page header */}
      {title && (
        <div className="px-16 pt-12 pb-4 border-b border-light-border">
          <div className="flex items-center justify-between">
            <h2 
              className={`text-xl font-bold text-slate-800 ${
                isEditing ? 'cursor-pointer hover:bg-surface-2 rounded px-2 -mx-2' : ''
              }`}
              onClick={() => isEditing && onContentClick?.(`${sectionId}-title`)}
            >
              {title}
            </h2>
            {pageNumber && (
              <span className="text-sm text-slate-400">Page {pageNumber}</span>
            )}
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 px-16 py-8 overflow-auto">
        {content.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            <p className="text-sm">No content for this section</p>
          </div>
        ) : (
          content.map((block, index) => renderBlock(block, index))
        )}
      </div>

      {/* Page footer */}
      {!title && pageNumber && (
        <div className="px-16 py-4 text-right">
          <span className="text-sm text-slate-400">Page {pageNumber}</span>
        </div>
      )}
    </div>
  );
};

export default NarrativePage;

