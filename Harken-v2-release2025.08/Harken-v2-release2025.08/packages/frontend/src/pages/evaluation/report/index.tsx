import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import HtmlViewer from './HtmlViewer';

const EvaluationReport = () => {
  const { id } = useParams();
  const [reportHtml, setReportHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_ROUTE || 'http://localhost:3001/api/v2/';

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
          const response = await axios.get(
          `${BASE_URL}/evaluations/report-preview/${id}`
        );

        const htmlContent =
          response?.data?.data?.data || '<p>No preview available</p>';

        setReportHtml(htmlContent);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch report data:', err);
        setError('Failed to load report. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchReportData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    // <div className="evaluation-report-container">
    // <div dangerouslySetInnerHTML={{ __html: reportHtml }} />
    <HtmlViewer htmlContent={reportHtml} />
  );
};

export default EvaluationReport;
