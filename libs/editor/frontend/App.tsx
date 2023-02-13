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

import { Avatar, Col, Layout, Menu, Row, Skeleton, Typography, notification, theme } from 'antd';

const { Header, Content, Sider, } = Layout;

import Rules from './pages/rules/';
import NotFound from './pages/NotFound';
import RuleSets from './pages/rule-sets';
import client from './common/client';
import { TAuthenticatedUser } from '../src/types';

const menuItems = [
  { label: 'Dashboard', key: 'dashboard', icon: <PieChartOutlined />, },
  { label: 'Rule Sets', key: 'rule-sets', icon: <OrderedListOutlined />, },
  { label: 'Rules', key: 'rules', icon: <AlertOutlined />, },
  { label: 'Users', key: 'users', icon: <TeamOutlined />, },
];

export default function App() {
  const [ collapsed, setCollapsed, ] = useState(true);
  const [ loading, setLoading, ] = useState(false);
  const [ user, setUser, ] = useState<TAuthenticatedUser>();
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

      setLoading(true);

      client.getUser()
        .then(user => setUser(user))
        .then(() => setLoading(false))
        .catch(e => notification.error({ message: e.message, }));
    },
    []
  );

  const {
    token: { colorBgContainer, boxShadow, },
  } = theme.useToken();

  const toggleCollapse = () => setCollapsed(!collapsed);

  const createUserHeaderComponent = () => {
    if (!user || loading) {
      return (
        <>
          <Col>
            <Skeleton title={{ width: '100px', }} paragraph={false} active={loading} />
          </Col>

          <Col>
            <Skeleton.Avatar style={{ verticalAlign: 'middle', }} active={loading} size="large" shape="circle" />
          </Col>
        </>
      );
    }

    return (
      <>
        <Col>
          <Typography.Text style={{ margin: 0, }}>Welcome back, {user?.name}</Typography.Text>
        </Col>

        <Col>
          <Avatar size="large" src={user?.avatarUrl ?? undefined}>
            {user.name.slice(0, 1).toUpperCase()}
          </Avatar>
        </Col>
      </>
    );
  };

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
          style={{ padding: '0 24px', background: colorBgContainer, fontSize: '18px', }}
        >
          <Row align="middle" gutter={16} wrap={false}>
            <Col>
              { collapsed ? (<MenuUnfoldOutlined onClick={toggleCollapse}/>) : (<MenuFoldOutlined onClick={toggleCollapse}/>)}
            </Col>

            <Col flex="auto" />

            { createUserHeaderComponent() }
          </Row>
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
