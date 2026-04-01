"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export const useVisibility = (
  elementRef: React.RefObject<HTMLElement>,
  threshold: number = 0.5
) => {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin: '0px'
      }
    );

    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [elementRef, threshold]);

  return isVisible;
};

export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    networkSlow: false,
    isLowPowerMode: false
  });

  useEffect(() => {
    const checkDeviceAndNetwork = () => {
      // Check if mobile
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      // Check network connection if available
      let networkSlow = false;
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        networkSlow = connection.effectiveType === 'slow-2g' || 
                     connection.effectiveType === '2g' || 
                     connection.saveData;
      }

      // Check for low power mode (approximate)
      let isLowPowerMode = false;
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          isLowPowerMode = battery.level < 0.2 && !battery.charging;
          setDeviceInfo(prev => ({ ...prev, isLowPowerMode }));
        });
      }

      setDeviceInfo({
        isMobile: isMobileDevice,
        networkSlow,
        isLowPowerMode
      });
    };

    checkDeviceAndNetwork();
  }, []);

  return deviceInfo;
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};
