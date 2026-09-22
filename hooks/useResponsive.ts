"use client";

import { useState, useEffect } from "react";
import { useMediaQuery } from "./useMediaQuery";

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isMounted: boolean;
}

export function useResponsive(): ResponsiveState {
  const isMobileQuery = useMediaQuery("(max-width: 767px)");
  const isTabletQuery = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const isDesktopQuery = useMediaQuery("(min-width: 1024px)");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return {
    isMobile: isMounted ? isMobileQuery : false,
    isTablet: isMounted ? isTabletQuery : false,
    isDesktop: isMounted ? isDesktopQuery : true,
    isMounted,
  };
}
