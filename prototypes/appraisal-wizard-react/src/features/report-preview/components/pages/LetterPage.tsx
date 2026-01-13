import React from 'react';
import type { ContentBlock } from '../../../../types';
import { sampleAppraisalData } from '../../../review/data/sampleAppraisalData';

interface LetterPageProps {
  content: ContentBlock[];
  title?: string;
  isEditing?: boolean;
  onContentClick?: (blockId: string) => void;
}

export const LetterPage: React.FC<LetterPageProps> = ({
  content,
  isEditing = false,
  onContentClick,
}) => {
  const rawData = content[0]?.content as {
    clientName?: string;
    propertyAddress?: string;
    effectiveDate?: string;
    finalValue?: number;
    exposurePeriod?: number;
    marketingTime?: number;
  } | undefined;
  
  // Use sample data as fallback
  const sample = sampleAppraisalData;
  const hasWizardData = rawData?.propertyAddress && rawData.propertyAddress.length > 0;
  
  const letterData = hasWizardData ? rawData : {
    clientName: sample.assignment.client,
    propertyAddress: sample.property.fullAddress,
    effectiveDate: sample.assignment.effectiveDate,
    finalValue: sample.valuation.asIsValue,
    exposurePeriod: 6,  // months
    marketingTime: 6,   // months
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full h-full bg-white p-16 flex flex-col">
      {/* Letterhead */}
      <div className="border-b-2 border-light-border pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">ROVE EVALUATIONS</h2>
            <p className="text-sm text-slate-500 mt-1">Commercial Real Estate Appraisers</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p>123 Main Street, Suite 100</p>
            <p>Missoula, MT 59801</p>
            <p>Tel: (406) 555-0100</p>
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="text-right mb-8">
        <p className="text-slate-600">
          {letterData?.effectiveDate ? formatDate(letterData.effectiveDate) : 'Date Not Specified'}
        </p>
      </div>

      {/* Recipient */}
      <div className="mb-8">
        <p className="font-medium text-slate-800">{letterData?.clientName || 'Valued Client'}</p>
        <p className="text-slate-600">Client Address Line 1</p>
        <p className="text-slate-600">Client Address Line 2</p>
      </div>

      {/* Subject */}
      <div className="mb-6">
        <p className="text-slate-600">
          <span className="font-medium">Re:</span> Appraisal of {letterData?.propertyAddress || 'Subject Property'}
        </p>
      </div>

      {/* Body */}
      <div 
        className={`flex-1 space-y-4 text-slate-700 leading-relaxed ${
          isEditing ? 'cursor-pointer hover:bg-surface-2 rounded p-2 -m-2' : ''
        }`}
        onClick={() => isEditing && onContentClick?.('letter-body')}
      >
        <p>Dear {letterData?.clientName || 'Client'},</p>
        
        <p>
          In accordance with your request and authorization, we have completed an appraisal 
          of the above-referenced property. The purpose of this appraisal is to estimate the 
          market value of the fee simple interest in the subject property as of{' '}
          <strong>{letterData?.effectiveDate ? formatDate(letterData.effectiveDate) : 'the effective date'}</strong>.
        </p>
        
        <p>
          Based on our analysis of the property and the relevant market data, it is our 
          opinion that the market value of the subject property, as of the effective date 
          of appraisal, is:
        </p>

        <div className="text-center py-6">
          <p className="text-3xl font-bold text-slate-900">
            {letterData?.finalValue ? formatCurrency(letterData.finalValue) : '$0'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            ({letterData?.finalValue ? numberToWords(letterData.finalValue) : 'Zero'} Dollars)
          </p>
        </div>

        <p>
          This estimate is subject to the Assumptions and Limiting Conditions stated in this 
          report. The estimated exposure time for this value is{' '}
          <strong>{letterData?.exposurePeriod || 12} months</strong>, with a marketing time of{' '}
          <strong>{letterData?.marketingTime || 12} months</strong>.
        </p>

        <p>
          The attached report contains the data, analyses, and conclusions upon which this 
          value estimate is based. Your attention is directed to the Assumptions and Limiting 
          Conditions, and Certification contained in this report.
        </p>

        <p>
          We appreciate the opportunity to be of service. If you have any questions regarding 
          this appraisal, please do not hesitate to contact us.
        </p>
      </div>

      {/* Signature */}
      <div className="mt-8 pt-8 border-t border-light-border">
        <p className="text-slate-600">Respectfully submitted,</p>
        <div className="mt-12">
          <div className="w-48 border-b border-slate-400" />
          <p className="font-medium text-slate-800 mt-2">Appraiser Name, MAI</p>
          <p className="text-sm text-slate-500">Certified General Appraiser</p>
          <p className="text-sm text-slate-500">License #12345</p>
        </div>
      </div>
    </div>
  );
};

// Helper function to convert number to words
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';
  if (num < 0) return 'Negative ' + numberToWords(-num);

  let words = '';

  if (Math.floor(num / 1000000) > 0) {
    words += numberToWords(Math.floor(num / 1000000)) + ' Million ';
    num %= 1000000;
  }

  if (Math.floor(num / 1000) > 0) {
    words += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }

  if (Math.floor(num / 100) > 0) {
    words += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }

  if (num > 0) {
    if (num < 10) {
      words += ones[num];
    } else if (num < 20) {
      words += teens[num - 10];
    } else {
      words += tens[Math.floor(num / 10)];
      if (num % 10 > 0) {
        words += '-' + ones[num % 10];
      }
    }
  }

  return words.trim();
}

export default LetterPage;

