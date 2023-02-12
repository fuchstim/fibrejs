import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './public/base.css';
import App from './App';
import { Row, Spin, notification } from 'antd';
import client from './common/client';

function BasePathWrapper() {
  const [ loading, setLoading, ] = useState(true);
  const [ basePath, setBasePath, ] = useState('/');

  useEffect(
    () => {
      setLoading(true);

      client.updateBasePath()
        .then(basePath => setBasePath(basePath))
        .then(() => setLoading(false))
        .catch(error => notification.error({ message: error.message, }));
    },
    []
  );

  if (loading) {
    return (
      <Row
        align="middle"
        justify="center"
        style={{ height: '100vh', width: '100vw', }}
      >
        <Spin />
      </Row>
    );
  }

  return (
    <BrowserRouter basename={basePath}>
      <App />
    </BrowserRouter>
  );
}

const container = document.getElementById('app-root')!;
const root = createRoot(container);
root.render(<BasePathWrapper />);
