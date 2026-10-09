import { useState } from 'react';
import { StudyTipData, getCuratedTipForTopic } from '../data/curatedStudyTips';
import { DomainId } from '../types';

export function useStudyTip() {
  const [tipData, setTipData] = useState<StudyTipData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStudyTip = async (domainId: DomainId, domainTitle: string, topic: string) => {
    setIsLoading(true);
    setIsModalOpen(true);
    setTipData(null);

    try {
      const res = await fetch('/api/ai/study-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId, domainTitle, topic }),
      });

      if (res.ok) {
        const data = await res.json();
        setTipData(data);
      } else {
        const fallback = getCuratedTipForTopic(topic, domainId, domainTitle);
        setTipData(fallback);
      }
    } catch (err) {
      console.warn('Network issue fetching tip, using curated blueprint tip:', err);
      const fallback = getCuratedTipForTopic(topic, domainId, domainTitle);
      setTipData(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const closeTipModal = () => {
    setIsModalOpen(false);
  };

  return {
    tipData,
    isLoading,
    isModalOpen,
    getStudyTip,
    closeTipModal,
  };
}
