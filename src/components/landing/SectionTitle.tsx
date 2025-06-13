import React from "react";

interface SectionTitleProps {
  children: React.ReactElement<{ className?: string }>;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => {
  return React.cloneElement(children, {
    className:
      children.props.className +
      " text-2xl lg:text-4xl lg:leading-tight font-bold",
  });
};

export default SectionTitle;
