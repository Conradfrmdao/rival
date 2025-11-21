'use client';

import React from 'react';

interface ClientWrapperProps {
  children: React.ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  return <>{children}</>;
};

export default ClientWrapper;