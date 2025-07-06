import React from "react";

interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const ContentWrapper: React.FC<ContentWrapperProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`h-[calc(100vh-109px)] overflow-auto ${className}`}>
      {children}
    </div>
  );
};

export default ContentWrapper;
