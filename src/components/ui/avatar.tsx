'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function Avatar({
  src,
  alt,
  size = 40,
}: {
  src: string;
  alt: string;
  size?: number;
}) {
  const [curSrc, setCurSrc] = useState(src);

  return (
    <Image
      src={curSrc}
      alt={alt}
      width={size}
      height={size}
      className='rounded-circle me-2'
      style={{ objectFit: 'cover' }}
      onError={() => setCurSrc('/file.svg')}
    />
  );
}
