import React from 'react';

import { Empty } from 'antd';

export default function NotFound() {
  return (
    <Empty
      style={{ height: '100%', }}
      description="Page Not Found"
    />
  );
}
