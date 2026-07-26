"use client";
import React from 'react';
import BingeSeriesLayout from '@/features/series/components/BingeSeriesLayout';

interface BingeSeriesInfoProps {
  id: number;
}

const BingeSeriesInfo = ({ id }: BingeSeriesInfoProps) => {
  return <BingeSeriesLayout id={id} />;
};

export default BingeSeriesInfo;
