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
  OrderedListOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';

import { Layout, Menu, Row, Typography, theme } from 'antd';

const { Header, Content, Sider, } = Layout;

import Rules from './pages/rules/';
import NotFound from './pages/NotFound';
import RuleSets from './pages/rule-sets';

const menuItems = [
  { label: 'Dashboard', key: 'dashboard', icon: <PieChartOutlined />, },
  { label: 'Rule Sets', key: 'rule-sets', icon: <OrderedListOutlined />, },
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

  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <Layout style={{ minHeight: '100vh', }} hasSider={true}>

      <Sider trigger={null} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <Row
          justify='center'
          align='middle'
          style={{
            height: 32,
            margin: 16,
          }}
        >
          <Typography.Title
            level={2}
            style={{
              margin: 0,
              color: 'white',
              whiteSpace: 'nowrap',
            }}
          >
            { collapsed ? 't_' : 'tripwire_'}
          </Typography.Title>
        </Row>

        <Menu
          theme="dark"
          items={menuItems}
          selectedKeys={[ selectedKey, ]}
          onSelect={({ key, }) => onMenuSelect(key)}
          mode="inline"
        />
      </Sider>

      <Layout>
        <Header
          style={{ paddingLeft: '24px', background: colorBgContainer, fontSize: '18px', }}
        >
          { collapsed ? (<MenuUnfoldOutlined onClick={toggleCollapse}/>) : (<MenuFoldOutlined onClick={toggleCollapse}/>)}
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
            <Route path='/rules/*' element={<Rules />} />

            <Route path='/rule-sets/*' element={<RuleSets />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Content>
      </Layout>

    </Layout>
  );
}
