import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

export const useEvaluationReview = (id: string | null) => {
  const [reviewData, setReviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [salesNote, setSalesNote] = useState('new');
  const [dropdown1Value, setDropdown1Value] = useState('');
  const [dropdown2Value, setDropdown2Value] = useState<Date | null>(null);

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        const response = await axios.get(`/evaluations/get-review/${id}`);
        setReviewData(response.data);
        setSalesNote(response?.data?.data?.data?.review_summary);

        const reviewData = response?.data?.data?.data;
        if (reviewData?.reviewed_by) {
          setDropdown1Value(reviewData.reviewed_by.toString());
        }
        if (reviewData?.review_date) {
          setDropdown2Value(new Date(reviewData.review_date));
        }
      } catch (error) {
        console.error('Error fetching review data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchReviewData();
  }, [id]);

  const saveReviewData = async (payload: any) => {
    try {
      const response = await axios.patch(
        `/evaluations/save-review/${id}`,
        payload
      );
      console.log('Review data saved successfully', response);
      return response;
    } catch (error) {
      console.error('Error saving review data', error);
      throw error;
    }
  };

  const handleReviewedByChange = (value: string) => {
    setDropdown1Value(value);
    if (value) {
      const payload = {
        reviewed_by: Number(value),
        review_date: dropdown2Value
          ? moment(dropdown2Value).format('MM/DD/YYYY')
          : null,
      };
      saveReviewData(payload);
    }
  };

  const handleReviewDateChange = (newValue: Date | null) => {
    setDropdown2Value(newValue);
    if (newValue) {
      const payload = {
        reviewed_by: dropdown1Value ? Number(dropdown1Value) : null,
        review_date: moment(newValue).format('MM/DD/YYYY'),
      };
      saveReviewData(payload);
    }
  };

  return {
    reviewData,
    setReviewData,
    loading,
    salesNote,
    setSalesNote,
    dropdown1Value,
    dropdown2Value,
    handleReviewedByChange,
    handleReviewDateChange,
    saveReviewData,
  };
};
