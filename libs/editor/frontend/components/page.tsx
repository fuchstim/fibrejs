import React from 'react';

import { Row, Col, Typography, Layout } from 'antd';

type Props = {
  title: string,
  subtitle: string,
  headerExtra?: JSX.Element,

  content: JSX.Element
};
export default function Page(props: Props) {

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Row
        align="middle"
        gutter={12}
        style={{ margin: '12px 24px', height: '64px', borderRadius: '6px', }}
        wrap={false}
      >
        <Col>
          <Typography.Title level={3} style={{ margin: 0, padding: 0, }}>
            { props.title }
          </Typography.Title>
        </Col>
        <Col style={{ paddingTop: 4, }}>
          <Typography.Text type='secondary'>
            { props.subtitle }
          </Typography.Text>
        </Col>

        <Col flex="auto" />

        <Col>
          { props.headerExtra }
        </Col>
      </Row>

      <Layout.Content
        style={{
          margin: '0 24px 24px 24px',
          borderRadius: '6px',
        }}
      >
        { props.content }
      </Layout.Content>
    </div>
  );
}
