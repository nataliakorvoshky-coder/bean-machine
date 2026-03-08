"use client"

import React from 'react';

interface PageHeaderProps {
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  return (
    <div className="bg-white shadow px-10 py-5 flex justify-between items-center">
      <h1 className="text-3xl font-bold text-emerald-700 mb-10">{title}</h1>
    </div>
  );
}

export default PageHeader;