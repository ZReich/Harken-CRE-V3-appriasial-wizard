import React from 'react';
import type { ContentBlock } from '../../../../types';
import { renderReportContent } from '../../../../utils/htmlRenderer';
import { ReportPageBase } from './ReportPageBase';

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
    const clickableClass = isClickable ? 'cursor-pointer hover:bg-slate-50 rounded p-1 -m-1' : '';

    switch (block.type) {
      case 'heading':
        return (
          <h3 
            key={block.id}
            className={`text-base font-semibold text-slate-800 mt-4 mb-2 ${clickableClass}`}
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
              className={`text-xs text-slate-700 leading-relaxed mb-3 ${clickableClass}`}
              onClick={() => isClickable && onContentClick?.(block.id)}
              dangerouslySetInnerHTML={{ __html: renderReportContent(paragraphContent) }}
            />
          );
        }
        
        if (paragraphContent?.text) {
          return (
            <div 
              key={block.id}
              className={`text-xs text-slate-700 leading-relaxed mb-3 ${clickableClass}`}
              onClick={() => isClickable && onContentClick?.(block.id)}
              dangerouslySetInnerHTML={{ __html: renderReportContent(String(paragraphContent.text)) }}
            />
          );
        }
        
        // Render key-value pairs for structured content
        return (
          <div 
            key={block.id}
            className={`text-xs text-slate-700 leading-relaxed mb-3 ${clickableClass}`}
            onClick={() => isClickable && onContentClick?.(block.id)}
          >
            {Object.entries(paragraphContent).map(([key, value]) => {
              if (!value || key.startsWith('_')) return null;
              return (
                <p key={key} className="mb-1.5">
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
            className={`list-disc list-inside text-xs text-slate-700 space-y-1 mb-3 ${clickableClass}`}
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
            className={`mb-4 ${clickableClass}`}
            onClick={() => isClickable && onContentClick?.(block.id)}
          >
            <table className="w-full text-xs border-collapse">
              <tbody>
                {Object.entries(tableContent).map(([key, value]) => {
                  if (!value || key.startsWith('_') || typeof value === 'object') return null;
                  return (
                    <tr key={key} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="py-1.5 pr-4 text-slate-600 font-medium w-1/3 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="py-1.5 text-slate-800">
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
            className={`mb-4 ${isEditing ? 'cursor-pointer ring-2 ring-transparent hover:ring-sky-300 rounded' : ''}`}
            onClick={() => isEditing && onContentClick?.(block.id)}
          >
            {imageContent?.url && (
              <img 
                src={imageContent.url} 
                alt={imageContent?.caption || 'Image'} 
                className="w-full rounded-lg max-h-48 object-cover"
              />
            )}
            {imageContent?.caption && (
              <figcaption className="text-[10px] text-slate-500 text-center mt-1">
                {imageContent.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'chart':
        return (
          <div 
            key={block.id}
            className={`mb-4 bg-slate-50 rounded-lg p-3 ${clickableClass}`}
            onClick={() => isClickable && onContentClick?.(block.id)}
          >
            <div className="h-32 flex items-center justify-center text-slate-400 text-xs">
              [Chart Placeholder]
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Get sidebar label from sectionId
  const getSidebarLabel = () => {
    if (!sectionId) return title?.toUpperCase();
    const labelMap: Record<string, string> = {
      'property-description': 'PROPERTY',
      'market-analysis': 'MARKET',
      'highest-best-use': 'HBU',
      'sales-comparison': 'SALES',
      'income-approach': 'INCOME',
      'cost-approach': 'COST',
      'reconciliation': 'VALUE',
    };
    return labelMap[sectionId] || sectionId.toUpperCase().replace(/-/g, ' ');
  };

  return (
    <ReportPageBase
      title={title || 'Report Section'}
      sidebarLabel={getSidebarLabel()}
      pageNumber={pageNumber}
      contentPadding="p-10"
    >
      {content.length === 0 ? (
        <div className="h-full flex items-center justify-center text-slate-400">
          <p className="text-xs">No content for this section</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          {content.map((block, index) => renderBlock(block, index))}
        </div>
      )}
    </ReportPageBase>
  );
};

export default NarrativePage;
