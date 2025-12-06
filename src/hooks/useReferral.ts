import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useReferral = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Store in LocalStorage so we remember who referred them even if they reload
      localStorage.setItem('referral_code', refCode);
      console.log("Referral captured:", refCode);
    }
  }, [searchParams]);
};