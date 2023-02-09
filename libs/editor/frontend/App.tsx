import React, { useState, useEffect } from 'react';

import {
  Route,
  useNavigate,
  useLocation,
  Routes
} from 'react-router-dom';

import {
  PieChartOutlined,
  TeamOutlined,
  AlertOutlined,
  OrderedListOutlined
} from '@ant-design/icons';

import { MenuProps, Typography } from 'antd';
import { Layout, Menu, theme } from 'antd';

const { Header, Content, Sider, } = Layout;

import RuleEditor from './pages/rules/';
import NotFound from './pages/NotFound';

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  { label: 'Dashboard', key: 'dashboard', icon: <PieChartOutlined />, },
  { label: 'Rulesets', key: 'rulesets', icon: <OrderedListOutlined />, },
  { label: 'Rules', key: 'rules', icon: <AlertOutlined />, },
  { label: 'Users', key: 'users', icon: <TeamOutlined />, },
];

export default function App() {
  const [ collapsed, setCollapsed, ] = useState(false);
  const [ selectedKey, setSelectedKey, ] = useState('dashboard');

  const navigate = useNavigate();
  const location = useLocation();

  const onMenuSelect = (key: string) => {
    setSelectedKey(key);
    navigate(key);
  };

  useEffect(
    () => {
      const pageKey = location.pathname.split('/')[1] || 'dashboard';
      if (pageKey !== selectedKey) { setSelectedKey(pageKey); }
    },
    []
  );

  const {
    token: { colorBgContainer, boxShadow, },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh', }} hasSider={true}>

      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', }} />
        <Menu
          theme="dark"
          items={menuItems}
          selectedKeys={[ selectedKey, ]}
          onSelect={({ key, }) => onMenuSelect(key)}
          mode="inline"
        />
      </Sider>

      <Layout className="site-layout" >
        <Header style={{ padding: 0, background: colorBgContainer, }}>
          <Layout style={{ height: '100%', padding: '16px', alignItems: 'start', justifyContent: 'center', background: 'transparent', }}>
            <Typography.Title level={4} style={{ margin: 0, }}>Title</Typography.Title>
            <Typography.Text type='secondary'>Subtitle</Typography.Text>
          </Layout>
        </Header>

        <Content
          style={{
            margin: '24px',
            background: colorBgContainer,
            maxHeight: 'calc(100vh - 100px)',
            borderRadius: '6px',
            boxShadow,
          }}
          >
          <Routes>
            <Route path='/rules/*' element={<RuleEditor />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Content>
      </Layout>

    </Layout>
  );
}
