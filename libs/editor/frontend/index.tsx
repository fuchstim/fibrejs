import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './public/base.css';
import App from './App';
import { ConfigProvider, Row, Spin, ThemeConfig, notification, theme } from 'antd';
import client from './common/client';

function BasePathWrapper() {
  const [ loading, setLoading, ] = useState(true);
  const [ basePath, setBasePath, ] = useState('/');
  const [ darkMode, setDarkMode, ] = useState(false);

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

  const themeConfig: ThemeConfig = {
    token: {
      colorPrimary: '#007fcc',
      colorError: '#f1356e',
      colorSuccess: '#20c090',
      colorWarning: '#ffaa5a',
      colorInfo: '#c0cbd4',
    },
    algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
  };

  return (
    <ConfigProvider theme={themeConfig}>
      { getContent() }
    </ConfigProvider>
  );
}

const container = document.getElementById('app-root')!;
const root = createRoot(container);
root.render(<BasePathWrapper />);
