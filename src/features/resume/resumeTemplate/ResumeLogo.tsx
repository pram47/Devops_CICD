import React, { useEffect, useState } from "react";

type Props = {
  logo: File | string;
  className?: string;
  alt?: string;
  size?: number;
};

const ResumeLogo: React.FC<Props> = ({
  logo,
  className = "",
  alt = "Resume logo",
  size = 64,
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const isFile = logo instanceof File;
  const src = isFile ? objectUrl : typeof logo === "string" ? logo : null;

  useEffect(() => {
    if (logo instanceof File) {
      const url = URL.createObjectURL(logo);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [logo]);

  if (!logo || (isFile && !objectUrl) || (typeof logo === "string" && !logo)) {
    return null;
  }

  return (
    <img
      src={src ?? undefined}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
};

export default ResumeLogo;
