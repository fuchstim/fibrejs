import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './public/base.css';
import App from './App';
import { ConfigProvider, Row, Spin, notification, theme } from 'antd';
import client from './common/client';

function BasePathWrapper() {
  const [ loading, setLoading, ] = useState(true);
  const [ basePath, setBasePath, ] = useState('/');
  const [ darkMode, setDarkMode, ] = useState<boolean>(true);

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

  const getContent = () => {
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
        <App toggleDarkMode={() => setDarkMode(!darkMode)} />
      </BrowserRouter>
    );
  };

  return (
    <ConfigProvider theme={{ algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm, }}>
      { getContent() }
    </ConfigProvider>
  );
}

const container = document.getElementById('app-root')!;
const root = createRoot(container);
root.render(<BasePathWrapper />);
